import { httpRouter } from 'convex/server';
import { handleReplicateWebhook } from './music';
import { postDevEvent } from './devEvents';

const http = httpRouter();
http.route({
  path: '/replicate_webhook',
  method: 'POST',
  handler: handleReplicateWebhook,
});
http.route({
  path: '/dev-event',
  method: 'POST',
  handler: postDevEvent,
});
export default http;
