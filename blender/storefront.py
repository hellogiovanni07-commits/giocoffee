"""GioCoffee - the storefront diorama for the stores page hero.

A corner café at dusk: plaster walls on a House Green base, a striped awning, the sign board, glowing windows with the
counter and pendant lamps inside, bistro tables, planters, a street lamp and a hanging blade sign.
Reuses the product scene's helpers (materials, lights, glass) from gio_scene.py.

  "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P blender/storefront.py -- [--samples 160] [--res 1600]
"""
import bpy, math, os, sys
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
user = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
sys.argv = [sys.argv[0], '--', '--only', 'none'] + user
G = {'__file__': os.path.join(HERE, 'gio_scene.py'), '__name__': '__main__'}
exec(open(G['__file__'], encoding='utf8').read(), G)
reset, rig, mat, rbox, srgb, link, GLASS, image, bump, tube = (G[k] for k in ('reset', 'rig', 'mat', 'rbox', 'srgb', 'link', 'GLASS', 'image', 'bump', 'tube'))
SAMPLES, RES, ROOT = G['SAMPLES'], int(G['arg']('--res', 1600)), G['ROOT']
TURN = int(G['arg']('--turn', 0))   # >0: render a turntable of this many frames into blender/out_hero/turn/
ONLY_ODD = '--odd' in user        # with --turn: render only the odd frames (to fill in between an existing half-count set)

HOUSE, GREEN, GOLD, CREAM = '#14332b', '#0e6b4e', '#c9a15b', '#f1e8d8'


def emit(name, color, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True; N = m.node_tree.nodes
    b = N['Principled BSDF']; b.inputs['Base Color'].default_value = srgb(color)
    b.inputs['Emission Color'].default_value = srgb(color); b.inputs['Emission Strength'].default_value = strength
    return m


def box(name, x0, x1, y0, y1, z0, z1, m, bevel=.015):
    return rbox(name, (x1 - x0, y1 - y0, z1 - z0), m, bevel, ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))


def plane(name, x0, x1, z0, z1, y, m, face='-Y'):
    bpy.ops.mesh.primitive_plane_add(size=1)
    o = bpy.context.object; o.name = name
    if face == '-Y': o.rotation_euler = (math.pi / 2, 0, 0); o.scale = (x1 - x0, z1 - z0, 1); o.location = ((x0 + x1) / 2, y, (z0 + z1) / 2)
    else: o.rotation_euler = (math.pi / 2, 0, -math.pi / 2); o.scale = (x1 - x0, z1 - z0, 1); o.location = (y, (x0 + x1) / 2, (z0 + z1) / 2)
    o.data.materials.append(m); return o


def cyl(name, r, z0, z1, loc, m, v=48):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=z1 - z0, location=(loc[0], loc[1], (z0 + z1) / 2), vertices=v)
    o = bpy.context.object; o.name = name; o.data.materials.append(m); bpy.ops.object.shade_smooth(); return o


def sphere(name, r, loc, m, sub=3):
    bpy.ops.mesh.primitive_ico_sphere_add(radius=r, location=loc, subdivisions=sub)
    o = bpy.context.object; o.name = name; o.data.materials.append(m); bpy.ops.object.shade_smooth(); return o


def mesh(name, verts, faces, m, solid=0):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update()
    o = link(bpy.data.objects.new(name, me)); me.materials.append(m)
    for f in me.polygons: f.use_smooth = True
    if solid: o.modifiers.new('t', 'SOLIDIFY').thickness = solid
    return o


def stripes(name, a, b, freq):
    """Awning canvas: crisp stripes across X."""
    m = mat(name, a, .75, sheen=.4); N = m.node_tree.nodes; L = m.node_tree.links; bs = N['Principled BSDF']
    tc = N.new('ShaderNodeTexCoord'); sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sep.inputs[0])
    mu = N.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; mu.inputs[1].default_value = freq; L.new(sep.outputs['X'], mu.inputs[0])
    fr = N.new('ShaderNodeMath'); fr.operation = 'FRACT'; L.new(mu.outputs[0], fr.inputs[0])
    ramp = N.new('ShaderNodeValToRGB'); ramp.color_ramp.interpolation = 'CONSTANT'
    ramp.color_ramp.elements[0].color = srgb(a); ramp.color_ramp.elements[1].position = .5; ramp.color_ramp.elements[1].color = srgb(b)
    L.new(fr.outputs[0], ramp.inputs[0]); L.new(ramp.outputs[0], bs.inputs['Base Color'])
    return bump(m, 'noise', 40, .08, .01)


def paving():
    m = mat('paving', '#e3d8c4', .75); N = m.node_tree.nodes; L = m.node_tree.links; bs = N['Principled BSDF']
    br = N.new('ShaderNodeTexBrick'); br.inputs['Scale'].default_value = 6.5; br.inputs['Mortar Size'].default_value = .012
    br.inputs['Color1'].default_value = srgb('#e8ddc9'); br.inputs['Color2'].default_value = srgb('#d9ccb4'); br.inputs['Mortar'].default_value = srgb('#b9a98c')
    tc = N.new('ShaderNodeTexCoord'); L.new(tc.outputs['Object'], br.inputs['Vector'])
    L.new(br.outputs['Color'], bs.inputs['Base Color'])
    bu = N.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = .4; L.new(br.outputs['Fac'], bu.inputs['Height']); L.new(bu.outputs['Normal'], bs.inputs['Normal'])
    return m


def build():
    reset(); rig()
    bpy.data.objects.remove(bpy.data.objects['floor'])
    # dusk: soften the studio, warm light comes from inside
    for o in bpy.context.scene.objects:
        if o.type == 'LIGHT': o.data.energy *= {'key': .38, 'fill': .3, 'rim': .7, 'top': .35}.get(o.name, 1)

    plaster = bump(mat('plaster', CREAM, .85), 'noise', 26, .12, .015)
    house = mat('house', HOUSE, .42, coat=.35, coat_r=.2)
    green = mat('green', GREEN, .4, coat=.3)
    gold = mat('brass', GOLD, .28, metal=1)
    metal = mat('iron', '#1a2a25', .35, metal=.6)
    wood = bump(mat('wood', '#9a6a43', .55), 'wave', 6, .3, .01)

    # plaza: a paved corner with a curb
    box('plaza', -4.2, 4.2, -3.0, 3.0, -.26, 0, paving(), .04)
    box('curb', -4.25, 4.25, -3.08, -2.9, -.3, .02, mat('curb', '#cbbd a2'.replace(' ', ''), .7), .02)

    # building core behind the shop room
    box('core', -2.3, 2.3, .4, 2.1, 0, 3.05, plaster)
    box('base', -2.34, 2.34, .38, 2.14, 0, .44, house)
    # shop room (open to the street through the glass)
    box('lintel', -2.3, 2.3, -.72, .42, 2.25, 3.05, plaster)
    box('wallL', -2.3, -2.0, -.72, .42, 0, 2.25, plaster)
    box('pierM', .72, 1.02, -.72, -.5, 0, 2.25, plaster)
    box('wallR', 1.88, 2.3, -.72, .42, 0, 2.25, plaster)
    box('sill', -2.0, .72, -.72, -.5, 0, .44, house)
    box('baseL', -2.34, -1.96, -.76, .42, 0, .44, house); box('baseR', 1.84, 2.34, -.76, .42, 0, .44, house)
    box('cornice', -2.48, 2.48, -.86, 2.24, 3.05, 3.26, house, .03)
    box('cornice2', -2.4, 2.4, -.8, 2.18, 2.98, 3.05, gold, .01)
    # sign board on the fascia
    box('fascia', -2.0, 1.85, -.82, -.72, 2.36, 2.92, house, .02)
    sg = mat('sign', '#ffffff', .4); image(sg, 'store_sign.png')
    N, L, b = G['nodes'](sg); L.new(N['Image Texture'].outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = .35
    plane('signface', -1.9, 1.75, 2.4, 2.88, -.83, sg)

    # inside: warm back wall, counter, shelves, pendants
    plane('backwall', -2.0, 1.88, 0, 2.25, .39, emit('glow', '#f2c487', 3.2))
    box('floorIn', -2.0, 1.88, -.5, .4, 0, .02, wood)
    box('counter', -1.85, .45, -.05, .25, 0, .92, house)
    box('countertop', -1.9, .5, -.08, .28, .92, .97, wood)
    box('machine', -1.2, -.7, .02, .24, .97, 1.32, mat('steel', '#c9ccc8', .2, metal=1))
    for i, x in enumerate((-1.55, -.35, .1)):
        cyl(f'cupIn{i}', .07, .97, 1.13, (x, .1), mat('cupw', '#fbfaf6', .3))
    box('menuboard', -1.7, .2, .3, .36, 1.45, 2.05, house)
    plane('menutext', -1.35, -.15, 1.55, 1.95, .29, (lambda m: (image(m, 'store_window.png', alpha=True), m)[1])(mat('menut', '#ffffff', .6)))
    for i, x in enumerate((-1.5, -.7, .1)):
        cyl(f'cord{i}', .008, 1.95, 2.25, (x, -.1), metal, 8)
        sphere(f'bulb{i}', .085, (x, -.1, 1.9), emit('bulb', '#ffd9a0', 40))
        cyl(f'shade{i}', .12, 1.93, 2.0, (x, -.1), green)
    L1 = bpy.data.lights.new('room', 'POINT'); L1.energy = 520; L1.color = (1, .78, .5); L1.shadow_soft_size = .6
    link(bpy.data.objects.new('room', L1)).location = (-.6, -.2, 1.6)

    # glass front: window, transom bar, door
    plane('glassW', -2.0, .72, .44, 2.25, -.6, GLASS())
    box('mullion', -.67, -.6, -.66, -.58, .44, 2.25, house, .005)
    box('transom', -2.0, .72, -.66, -.58, 1.86, 1.92, house, .005)
    win = mat('wintext', '#ffffff', .5); image(win, 'store_window.png', alpha=True)
    plane('lettering', -1.95, -.7, 1.0, 1.42, -.665, win)
    box('doorframe', 1.02, 1.88, -.64, -.58, 0, 2.25, house, .005)
    plane('doorglass', 1.1, 1.8, .08, 2.15, -.66, GLASS())
    box('handle', 1.18, 1.22, -.76, -.7, .8, 1.5, gold, .01)
    box('step', .98, 1.92, -.98, -.5, 0, .06, mat('stone', '#cfc3ad', .6), .01)

    # the awning: canvas slope from under the fascia, closed side cheeks, a scalloped valance, a metal frame
    X0, X1, YB, YF, ZT, ZF, n = -2.06, .82, -.73, -1.58, 2.34, 1.9, 9
    w = (X1 - X0) / (2 * n)
    aw = stripes('awning', GREEN, '#f4ecdc', n / (X1 - X0))
    mesh('awning', [(X0, YB, ZT), (X1, YB, ZT), (X1, YF, ZF), (X0, YF, ZF)], [(0, 1, 2, 3)], aw, .012)
    # valance: one scallop under every stripe
    vt, vb = [], []
    for i in range(2 * n * 8 + 1):
        x = X0 + (X1 - X0) * i / (2 * n * 8); t = (i % 8) / 8
        vt.append((x, YF, ZF)); vb.append((x, YF, ZF - .14 - math.sin(t * math.pi) * .06))
    N1 = len(vt); mesh('valance', vt + vb, [(i, i + 1, N1 + i + 1, N1 + i) for i in range(N1 - 1)], aw, .01)
    canvas = mat('canvas', GREEN, .75, sheen=.4)
    for x in (X0, X1):
        mesh(f'cheek{x}', [(x, YB, ZT), (x, YF, ZF), (x, YF, ZF - .14), (x, YB, ZF - .02)], [(0, 1, 2, 3)], canvas, .01)
        tube(f'awarm{x}', [(x, YB, ZT - .01), (x, YF, ZF - .01)], .014, metal, 3)
        tube(f'awstrut{x}', [(x, YB, ZF - .2), (x, YF + .05, ZF - .02)], .012, metal, 3)
    tube('awfront', [(X0, YF - .005, ZF - .005), (X1, YF - .005, ZF - .005)], .014, metal, 3)
    tube('awback', [(X0, YB - .01, ZT - .01), (X1, YB - .01, ZT - .01)], .016, metal, 3)
    box('doorcanopy', 1.0, 1.9, -1.15, -.72, 2.26, 2.3, house, .01)

    # blade sign on a brass arm (faces the street corner)
    tube('bladearm', [(2.3, -.5, 2.7), (2.95, -.5, 2.7)], .02, gold, 4)
    for x in (2.5, 2.85): tube(f'chain{x}', [(x, -.5, 2.7), (x, -.5, 2.6)], .008, gold, 3)
    bl = mat('blade', '#ffffff', .4); image(bl, 'store_blade.png')
    N, L, b = G['nodes'](bl); L.new(N['Image Texture'].outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = .25
    box('bladeboard', 2.36, 2.98, -.53, -.47, 1.96, 2.6, house, .02)
    plane('bladeface', 2.4, 2.94, 2.01, 2.55, -.535, bl)
    bpy.ops.mesh.primitive_plane_add(size=1); bb = bpy.context.object; bb.name = 'bladeback'
    bb.scale = (.54, .54, 1); bb.rotation_euler = (math.pi / 2, 0, math.pi); bb.location = (2.67, -.465, 2.28); bb.data.materials.append(bl)

    # planters either side of the door, a potted olive by the window
    leaf = bump(mat('leaf', '#3c7a4c', .55, sss=.15, sss_s=.05), 'noise', 18, .6, .03)
    leaf2 = bump(mat('leaf2', '#2f6a3f', .6, sss=.15, sss_s=.05), 'noise', 22, .6, .03)
    box('planterR', 1.96, 2.62, -1.25, -.8, 0, .5, house, .03)
    for i, (x, y, r) in enumerate([(2.1, -1.0, .26), (2.38, -1.1, .3), (2.3, -.9, .22), (2.55, -1.0, .2)]):
        sphere(f'shrub{i}', r, (x, y, .58 + r * .5), leaf if i % 2 else leaf2)
    cyl('pot', .26, 0, .55, (-2.55, -1.15), mat('terracotta', '#b8653a', .7))
    cyl('trunk', .03, .5, 1.45, (-2.55, -1.15), wood, 8)
    for i, (dx, dz, r) in enumerate([(0, 1.55, .32), (.18, 1.4, .24), (-.17, 1.42, .25), (.05, 1.78, .2)]):
        sphere(f'crown{i}', r, (-2.55 + dx, -1.15, dz), leaf2 if i % 2 else leaf)

    # bistro sets on the paving
    seatm = mat('seat', HOUSE, .5, coat=.4, coat_r=.3)
    def bistro(x, y, cups):
        cyl(f'tbase{x}', .2, 0, .03, (x, y), metal); cyl(f'tstem{x}', .028, .03, .74, (x, y), metal, 12)
        cyl(f'ttop{x}', .34, .74, .78, (x, y), mat('marble', '#f4efe6', .25, coat=.5))
        for k, a in enumerate((.4, 3.5)):
            cx, cy = x + math.cos(a) * .55, y + math.sin(a) * .55
            cyl(f'seat{x}{k}', .2, .45, .5, (cx, cy), seatm)
            bpy.ops.mesh.primitive_torus_add(major_radius=.2, minor_radius=.014, location=(cx, cy, .45), major_segments=48, minor_segments=8)
            bpy.context.object.data.materials.append(metal); bpy.ops.object.shade_smooth()
            bpy.ops.mesh.primitive_torus_add(major_radius=.17, minor_radius=.008, location=(cx, cy, .17), major_segments=48, minor_segments=6)
            bpy.context.object.data.materials.append(metal); bpy.ops.object.shade_smooth()
            for j in range(4):
                aa = a + j * math.pi / 2 + .785
                tube(f'leg{x}{k}{j}', [(cx + math.cos(aa) * .155, cy + math.sin(aa) * .155, .45), (cx + math.cos(aa) * .2, cy + math.sin(aa) * .2, 0)], .016, metal, 3)
            # backrest faces away from the table: two uprights rising from the seat ring, a curved panel between them
            up = lambda ang, z, r=.19: (cx + math.cos(ang) * (r + (z - .45) * .12), cy + math.sin(ang) * (r + (z - .45) * .12), z)
            for side in (-.62, .62):
                tube(f'upr{x}{k}{side}', [up(a + side, .45, .19), up(a + side, .9, .19)], .015, metal, 3)
            vs, fs, m = [], [], 12
            for i in range(m + 1):
                ang = a - .62 + 1.24 * i / m
                vs += [up(ang, .7, .2), up(ang, .9, .2)]
            fs = [(2 * i, 2 * i + 2, 2 * i + 3, 2 * i + 1) for i in range(m)]
            mesh(f'backrest{x}{k}', vs, fs, seatm, .02)
        for i, (dx, dy) in enumerate(cups):
            cyl(f'tcup{x}{i}', .06, .78, .95, (x + dx, y + dy), mat('cupw', '#fbfaf6', .35))
            cyl(f'tlid{x}{i}', .064, .95, .975, (x + dx, y + dy), mat('lidw', '#ece6da', .3))
            cyl(f'tband{x}{i}', .062, .83, .88, (x + dx, y + dy), mat('kraft', '#c49a62', .7))
    bistro(-1.3, -2.1, [(-.08, .05), (.12, -.06)])
    bistro(.9, -2.35, [(.05, 0)])
    # A-frame sandwich board: two framed chalk panels hinged at the top, the menu on both faces
    chalk = mat('chalkface', '#ffffff', .85); image(chalk, 'store_chalk.png')
    oak = bump(mat('oak', '#8a5a34', .55, coat=.2), 'wave', 9, .25, .008)
    BX, BY, H, W, SP = 2.95, -1.95, .98, .62, .27       # position, height, width, half-spread at the feet
    th = math.atan2(SP, H)
    for k, sgn in enumerate((-1, 1)):                     # -1: the street-facing panel, +1: the back panel
        hinge = link(bpy.data.objects.new(f'aframe{k}', None)); hinge.location = (BX, BY, H)
        hinge.rotation_euler = (sgn * th, 0, 0)
        parts = []
        for nm, x0, x1, z0, z1 in (('L', -W / 2, -W / 2 + .045, -H, 0), ('R', W / 2 - .045, W / 2, -H, 0), ('T', -W / 2, W / 2, -.06, 0), ('B', -W / 2, W / 2, -H + .02, -H + .1)):
            parts.append(box(f'af{k}{nm}', x0, x1, -.018, .018, z0, z1, oak, .006))
        parts.append(box(f'afp{k}', -W / 2 + .04, W / 2 - .04, -.008, .008, -H + .1, -.06, mat('slate', '#1b2420', .8), .002))
        bpy.ops.mesh.primitive_plane_add(size=1); f = bpy.context.object; f.name = f'afchalk{k}'
        f.scale = (W - .1, (H - .17), 1); f.rotation_euler = (math.pi / 2, 0, 0 if sgn < 0 else math.pi)
        f.location = (0, sgn * .0095, -H / 2 - .02); f.data.materials.append(chalk); parts.append(f)
        for o in parts: o.parent = hinge
    tube('afhinge', [(BX - W / 2 + .05, BY, H + .005), (BX + W / 2 - .05, BY, H + .005)], .012, gold, 4)
    cyl('lampPole', .05, 0, 3.0, (-3.4, -2.4), metal, 16)
    cyl('lampBase', .12, 0, .22, (-3.4, -2.4), metal, 16)
    box('lantern', -3.57, -3.23, -2.57, -2.23, 3.0, 3.4, emit('lantern', '#ffe2b0', 9), .02)
    box('lanternCap', -3.61, -3.19, -2.61, -2.19, 3.4, 3.47, metal, .02)
    Ll = bpy.data.lights.new('lamp', 'POINT'); Ll.energy = 70; Ll.color = (1, .82, .55); Ll.shadow_soft_size = .2
    link(bpy.data.objects.new('lamp', Ll)).location = (-3.4, -2.4, 3.2)

    # string lights from the lamp to the shop corner, bulbs along the sag
    A, B = Vector((-3.4, -2.4, 2.95)), Vector((-2.3, -.86, 2.95)); pts = []
    for i in range(25):
        t = i / 24; p = A.lerp(B, t); p.z -= math.sin(t * math.pi) * .45; pts.append(tuple(p))
    tube('wire', pts, .006, metal, 2)
    for i in range(2, 24, 3): sphere(f'fairy{i}', .04, (pts[i][0], pts[i][1], pts[i][2] - .05), emit('fairy', '#ffe0a8', 30), 2)
    A, B = Vector((2.3, -.86, 2.95)), Vector((3.1, -1.9, 2.4)); pts = []
    for i in range(17):
        t = i / 16; p = A.lerp(B, t); p.z -= math.sin(t * math.pi) * .3; pts.append(tuple(p))
    tube('wire2', pts, .006, metal, 2); cyl('postR', .035, 0, 2.45, (3.1, -1.9), metal, 10)
    for i in range(2, 16, 3): sphere(f'fairyR{i}', .04, (pts[i][0], pts[i][1], pts[i][2] - .05), emit('fairy', '#ffe0a8', 30), 2)
    # roof garden along the front, glowing side window
    box('roofbox', -2.25, 2.25, -.78, -.42, 3.26, 3.5, house, .02)
    for i in range(15):
        x = -2.1 + i * .3; sphere(f'roofshrub{i}', .13 + (i % 3) * .025, (x, -.6, 3.56), leaf if i % 2 else leaf2)
    plane('sideGlow', .7, 1.7, .95, 2.35, -2.311, emit('glow2', '#f2c487', 2.6), face='-X')
    for nm, a0, a1, b0, b1 in (('sfT', .66, 1.74, 2.35, 2.41), ('sfB', .66, 1.74, .89, .95), ('sfL', .64, .7, .89, 2.41), ('sfR', 1.7, 1.76, .89, 2.41)):
        box(nm, -2.38, -2.3, a0, a1, b0, b1, house, .005)
    box('sideMull', -2.4, -2.36, 1.17, 1.23, .95, 2.35, house, .005)
    for k, y in enumerate((-.2, 1.95)):
        box(f'sconce{k}', -2.42, -2.3, y - .06, y + .06, 2.05, 2.3, gold, .02)
        sphere(f'sconceB{k}', .06, (-2.44, y, 2.0), emit('bulb', '#ffd9a0', 25))
    # back of the shop: staff door with a lamp, AC units, the name painted in a band, a bench, a bike
    box('backdoor', .95, 1.75, 2.1, 2.15, 0, 2.15, house, .01)
    box('backdoorframe', .9, 1.8, 2.09, 2.13, 2.15, 2.22, gold, .005)
    box('backstep', .85, 1.85, 2.1, 2.45, 0, .07, mat('stone2', '#cfc3ad', .6), .01)
    sphere('backlamp', .07, (1.35, 2.22, 2.42), emit('bulb', '#ffd9a0', 25)); box('backlampcap', 1.25, 1.45, 2.1, 2.3, 2.47, 2.52, metal, .01)
    grille = bump(mat('acgrey', '#c9cdc9', .45, metal=.3), 'wave', 30, .5, .006)
    for i, x in enumerate((-1.8, -1.05)):
        box(f'ac{i}', x, x + .6, 2.1, 2.42, 2.3, 2.72, grille, .02)
        cyl(f'acfan{i}', .13, 2.42, 2.43, (x + .3, 2.42), metal, 32)
    bandm = mat('band', '#ffffff', .5); image(bandm, 'store_sign.png')
    bpy.ops.mesh.primitive_plane_add(size=1); bd = bpy.context.object; bd.name = 'backband'
    bd.scale = (2.43, .32, 1); bd.rotation_euler = (math.pi / 2, 0, math.pi); bd.location = (-.95, 2.111, 1.35); bd.data.materials.append(bandm)
    box('bench', -1.9, -.4, 2.35, 2.62, .4, .46, wood, .01)
    for x in (-1.8, -.5): box(f'benchleg{x}', x, x + .06, 2.38, 2.6, 0, .4, metal, .005)
    for r, x in ((.32, 2.75), (.32, 3.55)):
        bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=.025, location=(x, 2.35, r + .02), rotation=(math.pi / 2, 0, 0), major_segments=48, minor_segments=8)
        bpy.context.object.data.materials.append(metal); bpy.ops.object.shade_smooth()
    tube('bikeframe', [(2.75, 2.35, .34), (3.1, 2.35, .62), (3.55, 2.35, .34), (3.1, 2.35, .34), (2.75, 2.35, .34)], .02, mat('bikegreen', GREEN, .35, coat=.6), 3)
    tube('bikebar', [(3.1, 2.35, .62), (3.05, 2.35, .78)], .016, metal, 3); box('bikeseat', 2.98, 3.14, 2.3, 2.4, .78, .82, house, .01)
    # right side: a second glowing window with a frame
    plane('sideGlowR', .7, 1.7, .95, 2.35, 2.311, emit('glow3', '#f2c487', 2.6), face='-X')
    for nm, a0, a1, b0, b1 in (('rfT', .66, 1.74, 2.35, 2.41), ('rfB', .66, 1.74, .89, .95), ('rfL', .64, .7, .89, 2.41), ('rfR', 1.7, 1.76, .89, 2.41)):
        box(nm, 2.3, 2.38, a0, a1, b0, b1, house, .005)
    box('sideMullR', 2.36, 2.4, 1.17, 1.23, .95, 2.35, house, .005)
    # camera: three-quarter view from the street corner, a little above eye level
    cam = bpy.data.cameras.new('cam'); cam.lens = 50
    co = link(bpy.data.objects.new('cam', cam)); bpy.context.scene.camera = co
    sc = bpy.context.scene; sc.render.resolution_x = sc.render.resolution_y = RES
    for o in sc.objects:
        if o.type in ('MESH', 'CURVE') and o.data.materials and o.data.materials[0] and o.data.materials[0].name.split('.')[0] in ('pet', 'wintext', 'menut', 'chalkw'):
            o.visible_shadow = False
    def shoot(az, path, tgt=Vector((0, 0, 1.2)), el=.36, d=18.4):
        co.location = tgt + Vector((math.sin(az) * math.cos(el) * d, -math.cos(az) * math.cos(el) * d, math.sin(el) * d))
        co.rotation_euler = (tgt - co.location).to_track_quat('-Z', 'Y').to_euler()
        os.makedirs(os.path.dirname(path), exist_ok=True); sc.render.filepath = path; bpy.ops.render.render(write_still=True)
    if TURN:
        for i in range(TURN):
            if ONLY_ODD and i % 2 == 0: continue
            shoot(-.55 + i * math.tau / TURN, os.path.join(ROOT, 'blender', 'out_hero', 'turn', f'f{i:02d}.png')); print('RENDERED frame', i, flush=True)
    else:
        shoot(-.55, os.path.join(ROOT, 'blender', 'out_hero', 'storefront.png')); print('RENDERED storefront', flush=True)

build()
