import { v } from 'convex/values';
import { httpAction, internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import { insertInput } from './aiTown/insertInput';

const MAX_TYPE_LENGTH = 40;
const MAX_TEXT_LENGTH = 300;

const clean = (text: string, max: number) => text.replace(/\s+/g, ' ').trim().slice(0, max);

// Records a development event for the default world and makes the office react:
// reaction badges and a confrontation right away (the devEvent engine input), and
// the event is fed into the agents' conversation prompts for the next few minutes
// (convex/agent/conversation.ts). Callable from the CLI:
//   npx convex run devEvents:logTaskEvent '{"type":"build_failure","message":"tsc failed"}'
export const logTaskEvent = internalMutation({
  args: { type: v.string(), message: v.optional(v.string()), source: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const worldStatus = await ctx.db
      .query('worldStatus')
      .filter((q) => q.eq(q.field('isDefault'), true))
      .first();
    if (!worldStatus) {
      throw new Error('No default world; run `npx convex run init` first.');
    }
    const type = clean(args.type, MAX_TYPE_LENGTH).toLowerCase();
    const eventId = await ctx.db.insert('devEvents', {
      worldId: worldStatus.worldId,
      type,
      message: clean(args.message ?? '', MAX_TEXT_LENGTH),
      source: clean(args.source ?? 'unknown', MAX_TYPE_LENGTH),
    });
    await insertInput(ctx, worldStatus.worldId, 'devEvent', { type });
    return eventId;
  },
});

// POST /dev-event with `Authorization: Bearer $DEV_EVENT_TOKEN` and a JSON body
// like {"type": "build_failure", "message": "tsc failed", "source": "antigravity"}.
export const postDevEvent = httpAction(async (ctx, request) => {
  const token = process.env.DEV_EVENT_TOKEN;
  if (!token) {
    return new Response('DEV_EVENT_TOKEN is not configured', { status: 503 });
  }
  if (request.headers.get('Authorization') !== `Bearer ${token}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  let body: { type?: unknown; message?: unknown; source?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return new Response('Body must be JSON', { status: 400 });
  }
  if (typeof body.type !== 'string' || !body.type.trim()) {
    return new Response('"type" is required, e.g. "build_failure"', { status: 400 });
  }
  const eventId = await ctx.runMutation(internal.devEvents.logTaskEvent, {
    type: body.type,
    message: typeof body.message === 'string' ? body.message : undefined,
    source: typeof body.source === 'string' ? body.source : undefined,
  });
  return new Response(JSON.stringify({ ok: true, eventId }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
