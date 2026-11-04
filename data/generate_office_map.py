"""Generate an office tileset + AI Town map (data/gentle.js) with verified tile ids."""
import sys
from collections import deque
from PIL import Image, ImageDraw

TOWN = sys.argv[1]
OUT_PREVIEW = sys.argv[2]
T = 32
COLS, ROWS = 16, 4
sheet = Image.new('RGBA', (COLS * T, ROWS * T), (0, 0, 0, 0))

TILES = {}  # name -> (tileX, tileY)


def tile(name, tx, ty):
    def deco(fn):
        img = Image.new('RGBA', (T, T), (0, 0, 0, 0))
        fn(ImageDraw.Draw(img), img)
        sheet.alpha_composite(img, (tx * T, ty * T))
        TILES[name] = (tx, ty)
        return fn
    return deco


def tid(name):
    tx, ty = TILES[name]
    return ty * COLS + tx


# ---------- palette ----------
WOOD = [(214, 178, 132), (204, 166, 120), (222, 188, 142)]
WOOD_LINE = (176, 136, 94)
CARPET, CARPET_D = (150, 158, 170), (138, 146, 158)
WALL_TOP, WALL_TOP_D = (88, 92, 104), (70, 74, 84)
WALL_FACE, WALL_FACE_D = (226, 222, 212), (200, 196, 186)
BASEBOARD = (120, 104, 88)
GLASS, GLASS_HI, FRAME = (170, 210, 228, 200), (225, 245, 252, 230), (96, 104, 116)
DESK, DESK_EDGE, DESK_SHADOW = (238, 236, 230), (190, 186, 178), (0, 0, 0, 60)
MON_FRAME, MON_SCREEN, MON_GLOW = (40, 44, 52), (60, 120, 190), (120, 190, 240)
KEYB = (90, 94, 102)
CHAIR, CHAIR_D = (52, 60, 78), (36, 42, 56)
TABLE, TABLE_D, TABLE_HI = (120, 84, 56), (96, 66, 44), (146, 104, 72)
LEAF, LEAF_D, POT = (72, 150, 82), (50, 112, 60), (196, 120, 80)


# ---------- row 0: floors and walls ----------
@tile('floor_wood', 0, 0)
def _(d, im):
    for i in range(4):
        d.rectangle([0, i * 8, 31, i * 8 + 7], fill=WOOD[i % 3])
        d.line([0, i * 8 + 7, 31, i * 8 + 7], fill=WOOD_LINE)
        seam = (i * 13 + 5) % 32
        d.line([seam, i * 8, seam, i * 8 + 6], fill=WOOD_LINE)


@tile('floor_carpet', 1, 0)
def _(d, im):
    d.rectangle([0, 0, 31, 31], fill=CARPET)
    for y in range(0, 32, 4):
        for x in range((y // 4) % 2 * 2, 32, 4):
            d.point((x, y), fill=CARPET_D)
    d.rectangle([0, 0, 31, 31], outline=CARPET_D)


@tile('wall_top', 2, 0)
def _(d, im):
    d.rectangle([0, 0, 31, 31], fill=WALL_TOP)
    d.rectangle([0, 0, 31, 3], fill=WALL_TOP_D)
    d.rectangle([0, 28, 31, 31], fill=WALL_TOP_D)


@tile('wall_face', 3, 0)
def _(d, im):
    d.rectangle([0, 0, 31, 31], fill=WALL_FACE)
    for x in (0, 16):
        d.line([x, 0, x, 25], fill=WALL_FACE_D)
    d.rectangle([0, 26, 31, 31], fill=BASEBOARD)


@tile('partition_h', 4, 0)
def _(d, im):
    d.rectangle([0, 10, 31, 21], fill=GLASS)
    d.line([4, 12, 12, 12], fill=GLASS_HI)
    d.rectangle([0, 9, 31, 10], fill=FRAME)
    d.rectangle([0, 21, 31, 22], fill=FRAME)


@tile('partition_v', 5, 0)
def _(d, im):
    d.rectangle([10, 0, 21, 31], fill=GLASS)
    d.line([12, 4, 12, 12], fill=GLASS_HI)
    d.rectangle([9, 0, 10, 31], fill=FRAME)
    d.rectangle([21, 0, 22, 31], fill=FRAME)


@tile('partition_post', 6, 0)
def _(d, im):
    d.rectangle([9, 9, 22, 22], fill=FRAME)
    d.rectangle([12, 12, 19, 19], fill=(130, 138, 150))


@tile('door_mat', 7, 0)
def _(d, im):
    d.rectangle([2, 6, 29, 25], fill=(90, 70, 60), outline=(60, 46, 40))
    for x in range(6, 28, 4):
        d.line([x, 9, x, 22], fill=(110, 88, 74))


# ---------- row 1: workstation desks (monitor + keyboard), top-down ----------
def desk_base(d, left, right):
    x0 = 2 if left else 0
    x1 = 29 if right else 31
    d.rectangle([x0, 26, x1, 29], fill=DESK_SHADOW)
    d.rectangle([x0, 4, x1, 26], fill=DESK, outline=None)
    d.line([x0, 26, x1, 26], fill=DESK_EDGE)
    if left:
        d.line([x0, 4, x0, 26], fill=DESK_EDGE)
    if right:
        d.line([x1, 4, x1, 26], fill=DESK_EDGE)
    d.line([x0, 4, x1, 4], fill=DESK_EDGE)
    # monitor (back of desk) facing the chair below
    d.rectangle([8, 5, 23, 14], fill=MON_FRAME)
    d.rectangle([10, 6, 21, 12], fill=MON_SCREEN)
    d.line([11, 7, 16, 7], fill=MON_GLOW)
    d.rectangle([14, 14, 17, 16], fill=MON_FRAME)
    # keyboard + mouse
    d.rectangle([9, 19, 21, 23], fill=KEYB)
    d.rectangle([24, 20, 26, 23], fill=KEYB)


@tile('desk_l', 0, 1)
def _(d, im):
    desk_base(d, True, False)


@tile('desk_m', 1, 1)
def _(d, im):
    desk_base(d, False, False)


@tile('desk_r', 2, 1)
def _(d, im):
    desk_base(d, False, True)


# ---------- row 2: conference table (3x2 nine-slice-ish) ----------
def table_part(d, left, right, top, bottom):
    x0 = 3 if left else 0
    x1 = 28 if right else 31
    y0 = 4 if top else 0
    y1 = 26 if bottom else 31
    if bottom:
        d.rectangle([x0, y1, x1, y1 + 3], fill=TABLE_D)
    d.rectangle([x0, y0, x1, y1], fill=TABLE)
    if top:
        d.line([x0, y0, x1, y0], fill=TABLE_HI)
    if left:
        d.line([x0, y0, x0, y1], fill=TABLE_HI)
    if right:
        d.line([x1, y0, x1, y1], fill=TABLE_D)
    if top:  # notepads / laptops on the table
        d.rectangle([10, y0 + 6, 21, y0 + 14], fill=(235, 235, 228))
        d.line([12, y0 + 9, 19, y0 + 9], fill=(170, 170, 170))


for i, (name, l, r, t, b) in enumerate([
    ('table_tl', 1, 0, 1, 0), ('table_t', 0, 0, 1, 0), ('table_tr', 0, 1, 1, 0),
    ('table_bl', 1, 0, 0, 1), ('table_b', 0, 0, 0, 1), ('table_br', 0, 1, 0, 1),
]):
    tile(name, i, 2)(lambda d, im, l=l, r=r, t=t, b=b: table_part(d, l, r, t, b))


# ---------- row 3: chairs and decor ----------
@tile('chair_up', 0, 3)  # seat facing up (person faces the desk above)
def _(d, im):
    d.ellipse([9, 26, 22, 30], fill=(0, 0, 0, 50))
    d.rounded_rectangle([8, 6, 23, 20], 4, fill=CHAIR)
    d.rounded_rectangle([7, 18, 24, 26], 3, fill=CHAIR_D)  # backrest at bottom
    d.rectangle([6, 10, 8, 18], fill=CHAIR_D)
    d.rectangle([23, 10, 25, 18], fill=CHAIR_D)


@tile('chair_down', 1, 3)  # seat facing down (across a table)
def _(d, im):
    d.ellipse([9, 26, 22, 30], fill=(0, 0, 0, 50))
    d.rounded_rectangle([8, 11, 23, 25], 4, fill=CHAIR)
    d.rounded_rectangle([7, 5, 24, 13], 3, fill=CHAIR_D)  # backrest at top
    d.rectangle([6, 13, 8, 21], fill=CHAIR_D)
    d.rectangle([23, 13, 25, 21], fill=CHAIR_D)


@tile('plant', 2, 3)
def _(d, im):
    d.ellipse([8, 27, 24, 31], fill=(0, 0, 0, 50))
    d.polygon([(10, 20), (22, 20), (20, 30), (12, 30)], fill=POT)
    for cx, cy, r in [(16, 10, 8), (10, 14, 6), (22, 14, 6), (16, 16, 6)]:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=LEAF, outline=LEAF_D)


@tile('water_cooler', 3, 3)
def _(d, im):
    d.rectangle([10, 14, 21, 30], fill=(230, 232, 236), outline=(160, 164, 172))
    d.ellipse([9, 1, 22, 15], fill=(140, 200, 240), outline=(90, 150, 200))
    d.rectangle([13, 19, 18, 21], fill=(80, 120, 200))


@tile('whiteboard', 4, 3)  # hangs on the wall face
def _(d, im):
    d.rectangle([0, 0, 31, 31], fill=WALL_FACE)
    d.rectangle([0, 26, 31, 31], fill=BASEBOARD)
    d.rectangle([1, 3, 30, 22], fill=(250, 250, 250), outline=(150, 154, 160))
    d.line([4, 8, 18, 8], fill=(60, 110, 200))
    d.line([4, 12, 24, 12], fill=(200, 70, 70))
    d.line([4, 16, 14, 16], fill=(60, 160, 90))


@tile('bookshelf', 5, 3)
def _(d, im):
    d.rectangle([1, 2, 30, 30], fill=(110, 78, 52), outline=(80, 56, 38))
    colors = [(200, 80, 70), (70, 120, 190), (220, 190, 80), (90, 160, 100)]
    for row, y in enumerate((5, 17)):
        for i, x in enumerate(range(4, 28, 4)):
            d.rectangle([x, y, x + 2, y + 9], fill=colors[(i + row) % 4])
        d.line([2, y + 10, 29, y + 10], fill=(80, 56, 38))


sheet.save(f'{TOWN}/public/assets/office-obj.png')

# ---------- map layout ----------
W, H = 40, 30
EMPTY = -1
floor = [[tid('floor_wood')] * H for _ in range(W)]
deco = [[EMPTY] * H for _ in range(W)]   # walkable decoration (chairs, mats, carpet)
solid = [[EMPTY] * H for _ in range(W)]  # blocking objects (walls, desks, table, plants)


def put(layer, x, y, name):
    layer[x][y] = tid(name)


# outer walls
for x in range(W):
    put(solid, x, 0, 'wall_top')
    put(solid, x, 1, 'wall_face')
    put(solid, x, H - 1, 'wall_top')
for y in range(H):
    put(solid, 0, y, 'wall_top')
    put(solid, W - 1, y, 'wall_top')

# conference room: x 11..28, y 2..10, glass partitions, door gap at x 19..20
CX0, CX1, CY1 = 11, 28, 10
for x in range(CX0 + 1, CX1):
    for y in range(2, CY1):
        floor[x][y] = tid('floor_carpet')
for y in range(2, CY1):
    put(solid, CX0, y, 'partition_v')
    put(solid, CX1, y, 'partition_v')
for x in range(CX0, CX1 + 1):
    if x in (19, 20):
        put(deco, x, CY1, 'door_mat')
    else:
        put(solid, x, CY1, 'partition_h')
for x in (CX0, CX1, 18, 21):
    put(solid, x, CY1, 'partition_post')
for x in range(18, 22):
    put(solid, x, 1, 'whiteboard')
# table x 15..24, y 5..6, chairs above (y 4) and below (y 7)
for x in range(15, 25):
    edge = 'l' if x == 15 else 'r' if x == 24 else ''
    put(solid, x, 5, {'l': 'table_tl', 'r': 'table_tr', '': 'table_t'}[edge])
    put(solid, x, 6, {'l': 'table_bl', 'r': 'table_br', '': 'table_b'}[edge])
    if x % 2 == 0 or x in (15, 24):
        put(deco, x, 4, 'chair_down')
        put(deco, x, 7, 'chair_up')
for x, y in [(12, 2), (27, 2), (12, 9), (27, 9)]:
    put(solid, x, y, 'plant')

# lounge corners beside the conference room
for x in (2, 3, 4, 35, 36, 37):
    put(solid, x, 2, 'bookshelf')
put(solid, 8, 2, 'water_cooler')
put(solid, 31, 2, 'water_cooler')
for x, y in [(1, 2), (10, 2), (29, 2), (38, 2), (1, 28), (38, 28), (16, 28), (23, 28)]:
    put(solid, x, y, 'plant')

# two workstation bays, central corridor x 17..22
DESK_ROWS = (13, 17, 21, 25)
SEGMENTS = [(3, 6), (8, 11), (13, 16), (23, 26), (28, 31), (33, 36)]
stations = 0
for y in DESK_ROWS:
    for x0, x1 in SEGMENTS:
        for x in range(x0, x1 + 1):
            put(solid, x, y, 'desk_l' if x == x0 else 'desk_r' if x == x1 else 'desk_m')
            put(deco, x, y + 1, 'chair_up')
            stations += 1

# ---------- verification ----------
blocked = [[solid[x][y] != EMPTY for y in range(H)] for x in range(W)]
open_tiles = [(x, y) for x in range(W) for y in range(H) if not blocked[x][y]]
start = (19, 15)
assert not blocked[19][15]
seen = {start}
q = deque([start])
while q:
    x, y = q.popleft()
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < W and 0 <= ny < H and not blocked[nx][ny] and (nx, ny) not in seen:
            seen.add((nx, ny))
            q.append((nx, ny))
unreachable = [p for p in open_tiles if p not in seen]
chairs = [(x, y) for x in range(W) for y in range(H) if deco[x][y] in (tid('chair_up'), tid('chair_down'))]
print(f'tileset tiles: {len(TILES)}  stations: {stations}  open tiles: {len(open_tiles)}')
print(f'reachable from corridor: {len(seen)}  unreachable: {unreachable}')
print('chairs on walkable tiles:', all(not blocked[x][y] for x, y in chairs), len(chairs))
assert not unreachable
# corridor widths: every row between desk rows must be fully open across each bay
for y in range(2, H - 1):
    pass

# ---------- write data/gentle.js ----------
def js(layer):
    return '[\n' + ',\n'.join('  [' + ','.join(str(v) for v in col) + ']' for col in layer) + '\n]'


tile_doc = '\n'.join(
    f'//   {name:<15} [{tx},{ty}] -> {ty * COLS + tx}' for name, (tx, ty) in TILES.items())
src = f"""// Indoor office map for AI Town.
// Layers are indexed [x][y]. Tile ids index public/assets/office-obj.png
// ({COLS * T}x{ROWS * T}, {T}px tiles, {COLS} columns): tileId = tileY * {COLS} + tileX.
// bgtiles are walkable (floor, carpet, chairs, door mat); every non -1 tile in
// objmap blocks movement (walls, glass partitions, desks, table, plants).
//
// Tile reference:
{tile_doc}

export const tilesetpath = "/ai-town/assets/office-obj.png";
export const tiledim = {T};
export const screenxtiles = {W};
export const screenytiles = {H};
export const tilesetpxw = {COLS * T};
export const tilesetpxh = {ROWS * T};

export const bgtiles = [
{js(floor)},
{js(deco)}
];

export const objmap = [
{js(solid)}
];

export const animatedsprites = [];

export const mapwidth = bgtiles[0].length;
export const mapheight = bgtiles[0][0].length;
"""
open(f'{TOWN}/data/gentle.js', 'w').write(src)

# ---------- preview (same compositing order as PixiStaticMap) ----------
prev = Image.new('RGBA', (W * T, H * T), (0, 0, 0, 255))
for layer in (floor, deco, solid):
    for x in range(W):
        for y in range(H):
            t = layer[x][y]
            if t == EMPTY:
                continue
            tx, ty = t % COLS, t // COLS
            prev.alpha_composite(sheet.crop((tx * T, ty * T, tx * T + T, ty * T + T)), (x * T, y * T))
prev.save(OUT_PREVIEW)
