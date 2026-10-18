"""GioCoffee - product renders in Blender (Cycles), one per menu item.

Every product is modelled here from the same spec the site uses (blender/items.json, exported with the site's
own artwork by blender/export_tex.py): paper hot cups with a corrugated kraft sleeve and a moulded lid, clear
iced cups with layered drinks, ice and condensation, frappés with whipped cream and drizzle, glazed ceramic
cups with latte art, pastries built from metaballs and browned by curvature, bean bags, tumblers and mugs.
Each one stands on a shadow catcher; blender/finish.py turns the PNGs into the site's WebP files.

  "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P blender/gio_scene.py -- [--only a,b] [--samples 160] [--res 1000]
"""
import bpy, bmesh, json, math, os, random, sys
from mathutils import Vector, Euler, Quaternion

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default):
    return argv[argv.index(name) + 1] if name in argv else default
ONLY = [x for x in arg('--only', '').split(',') if x]
SAMPLES = int(arg('--samples', 160)); RES = int(arg('--res', 1000))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERO = '--hero' in argv   # menu hero stand: the product alone (no floor), trimmed tight so it can stand on a plinth
TEX = os.path.join(ROOT, 'blender', 'tex'); OUT = os.path.join(ROOT, 'blender', 'out_hero' if HERO else 'out')
os.makedirs(OUT, exist_ok=True)
ITEMS = json.load(open(os.path.join(ROOT, 'blender', 'items.json'), encoding='utf8'))
TAU = math.pi * 2
GRID, LINE, FADE = .42, .022, (.9, 2.6)   # floor grid: cell size, line half-width, fade radius (scene units)
GREEN, HOUSE, GOLD = '#0e6b4e', '#14332b', '#c9a15b'


def srgb(h, a=1):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c) + (a,)


# ---------------------------------------------------------------- scene
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    try:
        pr = bpy.context.preferences.addons['cycles'].preferences
        pr.compute_device_type = 'OPTIX'; pr.get_devices()
        for d in pr.devices: d.use = True
        sc.cycles.device = 'GPU'
    except Exception:
        sc.cycles.device = 'CPU'
    sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 16; sc.cycles.transmission_bounces = 16; sc.cycles.glossy_bounces = 8; sc.cycles.transparent_max_bounces = 24
    sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False
    sc.render.film_transparent = True
    sc.render.resolution_x = sc.render.resolution_y = RES
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
    sc.view_settings.view_transform = 'AgX'
    try: sc.view_settings.look = 'AgX - Medium High Contrast'
    except TypeError: pass
    sc.view_settings.exposure = .1
    wd = bpy.data.worlds.new('w'); sc.world = wd; wd.use_nodes = True
    nt = wd.node_tree; bg = nt.nodes['Background']
    # a soft studio dome: warm above, darker below, so glass and glaze have something to reflect
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); ramp = nt.nodes.new('ShaderNodeValToRGB')
    nt.links.new(tc.outputs['Generated'], sep.inputs[0])
    ramp.color_ramp.elements[0].position = .35; ramp.color_ramp.elements[0].color = (.18, .17, .15, 1)
    ramp.color_ramp.elements[1].position = .75; ramp.color_ramp.elements[1].color = (1, .96, .9, 1)
    nt.links.new(sep.outputs['Z'], ramp.inputs[0]); nt.links.new(ramp.outputs[0], bg.inputs['Color'])
    bg.inputs['Strength'].default_value = .55
    return sc


def clear_studio():
    """Clear plastic reflects its surroundings: give it a light, mint-tinted room instead of a dark floor."""
    r = bpy.context.scene.world.node_tree.nodes['Color Ramp'].color_ramp
    r.elements[0].color = (.62, .7, .66, 1); r.elements[1].color = (1, .98, .94, 1)


def link(ob):
    bpy.context.scene.collection.objects.link(ob); return ob


def area(name, energy, size, loc, color=(1, .96, .9), shape='RECTANGLE', sy=None):
    L = bpy.data.lights.new(name, 'AREA'); L.energy = energy; L.color = color; L.shape = shape
    L.size = size; L.size_y = sy or size
    o = link(bpy.data.objects.new(name, L)); o.location = loc
    d = Vector((0, 0, 1.2)) - Vector(loc); o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return o


def rig():
    area('key', 900, 4.5, (-4.5, -5.5, 7.5), sy=6)                    # big soft box, front left, high
    area('fill', 260, 6, (6, -4, 2.5), color=(.95, .97, 1))           # low fill from the right
    area('rim', 520, 3, (3.5, 6, 6), color=(1, .92, .82), sy=7)      # warm rim from behind
    area('top', 220, 5, (0, 0, 9))
    # no shadow: the product stands on a faint green grid that fades out round it
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=12)
    me = bpy.data.meshes.new('floor'); bm.to_mesh(me); bm.free()
    fl = link(bpy.data.objects.new('floor', me)); fl.location.z = -.002
    m = bpy.data.materials.new('grid'); m.use_nodes = True; N = m.node_tree.nodes; L = m.node_tree.links
    N.remove(N['Principled BSDF']); out = N['Material Output']
    tc = N.new('ShaderNodeTexCoord'); sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sep.inputs[0])
    def line(axis):
        d = N.new('ShaderNodeMath'); d.operation = 'DIVIDE'; d.inputs[1].default_value = GRID
        L.new(sep.outputs[axis], d.inputs[0])
        f = N.new('ShaderNodeMath'); f.operation = 'PINGPONG'; f.inputs[1].default_value = .5; L.new(d.outputs[0], f.inputs[0])
        lt = N.new('ShaderNodeMath'); lt.operation = 'LESS_THAN'; lt.inputs[1].default_value = LINE; L.new(f.outputs[0], lt.inputs[0])
        return lt.outputs[0]
    mx = N.new('ShaderNodeMath'); mx.operation = 'MAXIMUM'; L.new(line('X'), mx.inputs[0]); L.new(line('Y'), mx.inputs[1])
    ln = N.new('ShaderNodeVectorMath'); ln.operation = 'LENGTH'; L.new(tc.outputs['Object'], ln.inputs[0])
    fade = N.new('ShaderNodeMapRange'); fade.inputs['From Min'].default_value = FADE[0]; fade.inputs['From Max'].default_value = FADE[1]
    fade.inputs['To Min'].default_value = 1; fade.inputs['To Max'].default_value = 0; L.new(ln.outputs['Value'], fade.inputs['Value'])
    sm = N.new('ShaderNodeMath'); sm.operation = 'POWER'; sm.inputs[1].default_value = 1.6; L.new(fade.outputs[0], sm.inputs[0])
    a1 = N.new('ShaderNodeMath'); a1.operation = 'MULTIPLY'; a1.inputs[1].default_value = .5; L.new(mx.outputs[0], a1.inputs[0])
    a2 = N.new('ShaderNodeMath'); a2.operation = 'MULTIPLY'; L.new(a1.outputs[0], a2.inputs[0]); L.new(sm.outputs[0], a2.inputs[1])
    em = N.new('ShaderNodeEmission'); em.inputs['Color'].default_value = srgb('#2a9a70'); em.inputs['Strength'].default_value = 1.1  # brand green, lifted so it reads green on the mint stage
    tr = N.new('ShaderNodeBsdfTransparent'); mix = N.new('ShaderNodeMixShader')
    L.new(a2.outputs[0], mix.inputs['Fac']); L.new(tr.outputs[0], mix.inputs[1]); L.new(em.outputs[0], mix.inputs[2]); L.new(mix.outputs[0], out.inputs['Surface'])
    me.materials.append(m); fl.visible_diffuse = False; fl.visible_shadow = False


# ---------------------------------------------------------------- materials
def mat(name, color='#ffffff', rough=.5, **k):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = srgb(color) if isinstance(color, str) else color
    b.inputs['Roughness'].default_value = rough
    names = {'metal': 'Metallic', 'ior': 'IOR', 'trans': 'Transmission Weight', 'coat': 'Coat Weight', 'coat_r': 'Coat Roughness',
             'sss': 'Subsurface Weight', 'sss_s': 'Subsurface Scale', 'sheen': 'Sheen Weight', 'sheen_r': 'Sheen Roughness', 'spec': 'Specular IOR Level', 'alpha': 'Alpha'}
    for kk, v in k.items():
        if kk in names: b.inputs[names[kk]].default_value = v
    if 'sss_rad' in k: b.inputs['Subsurface Radius'].default_value = k['sss_rad']
    return m


def nodes(m):
    return m.node_tree.nodes, m.node_tree.links, m.node_tree.nodes['Principled BSDF']


def bump(m, kind='noise', scale=60, strength=.15, dist=.02, detail=6, ratio=None):
    """Micro surface: paper fibre, corrugation, crumb, glaze ripple."""
    N, L, b = nodes(m)
    if kind == 'noise':
        t = N.new('ShaderNodeTexNoise'); t.inputs['Scale'].default_value = scale; t.inputs['Detail'].default_value = detail; out = t.outputs['Fac']
    elif kind == 'wave':
        t = N.new('ShaderNodeTexWave'); t.wave_type = 'BANDS'; t.bands_direction = 'X'; t.inputs['Scale'].default_value = scale; t.inputs['Distortion'].default_value = .4; out = t.outputs['Fac']
    elif kind == 'voronoi':
        t = N.new('ShaderNodeTexVoronoi'); t.inputs['Scale'].default_value = scale; out = t.outputs['Distance']
    if ratio:
        tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = ratio
        L.new(tc.outputs['Object'], mp.inputs['Vector']); L.new(mp.outputs[0], t.inputs['Vector'])
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = strength; bp.inputs['Distance'].default_value = dist
    L.new(out, bp.inputs['Height']); L.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def image(m, file, alpha=False, coord='UV'):
    N, L, b = nodes(m)
    t = N.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(TEX, file)); t.interpolation = 'Cubic'
    if coord != 'UV':
        tc = N.new('ShaderNodeTexCoord'); L.new(tc.outputs[coord], t.inputs['Vector'])
    L.new(t.outputs['Color'], b.inputs['Base Color'])
    if alpha: L.new(t.outputs['Alpha'], b.inputs['Alpha'])
    return t


def gradient_z(m, colors, z0, z1, speck=None):
    """Layered drinks: colours top → bottom along the object's height, with soft seams."""
    N, L, b = nodes(m)
    tc = N.new('ShaderNodeTexCoord'); sep = N.new('ShaderNodeSeparateXYZ'); mr = N.new('ShaderNodeMapRange')
    mr.inputs['From Min'].default_value = z1; mr.inputs['From Max'].default_value = z0
    L.new(tc.outputs['Object'], sep.inputs[0]); L.new(sep.outputs['Z'], mr.inputs['Value'])
    r = N.new('ShaderNodeValToRGB'); cr = r.color_ramp; n = len(colors)
    cr.elements[0].position = 0; cr.elements[0].color = srgb(colors[0]); cr.elements[1].position = 1; cr.elements[1].color = srgb(colors[-1])
    for i, c in enumerate(colors):
        for p in (i / n + .02, (i + 1) / n - .02):
            if 0 < p < 1: e = cr.elements.new(p); e.color = srgb(c)
    L.new(mr.outputs[0], r.inputs['Fac'])
    out = r.outputs['Color']
    if speck:  # blended ice crystals / chocolate chips
        nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 260; nz.inputs['Detail'].default_value = 1
        rr = N.new('ShaderNodeValToRGB'); rr.color_ramp.elements[0].position = .7; rr.color_ramp.elements[1].position = .76; rr.color_ramp.elements[1].color = (.45, .45, .45, 1)
        mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'
        L.new(nz.outputs['Fac'], rr.inputs['Fac']); L.new(rr.outputs['Color'], mx.inputs['Factor'])
        L.new(out, mx.inputs[6]); mx.inputs[7].default_value = srgb(speck); out = mx.outputs[2]
    L.new(out, b.inputs['Base Color'])


def baked(m, pale, dark, edge='#6e300a', top=None, coat=.3):
    """Pastry: pale in the folds, browned on the ridges (Cycles pointiness), a little egg-wash shine."""
    N, L, b = nodes(m)
    g = N.new('ShaderNodeNewGeometry'); r = N.new('ShaderNodeValToRGB'); cr = r.color_ramp
    cr.elements[0].position = .44; cr.elements[0].color = srgb(pale); cr.elements[1].position = .56; cr.elements[1].color = srgb(dark)
    e = cr.elements.new(.62); e.color = srgb(edge)
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 7
    ad = N.new('ShaderNodeMath'); ad.operation = 'ADD'
    mul = N.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = .12
    L.new(nz.outputs['Fac'], mul.inputs[0]); L.new(g.outputs['Pointiness'], ad.inputs[0]); L.new(mul.outputs[0], ad.inputs[1])
    L.new(ad.outputs[0], r.inputs['Fac'])
    out = r.outputs['Color']
    if top:  # the upper surface takes a coating (ube butter, sugar) by normal
        sep = N.new('ShaderNodeSeparateXYZ'); L.new(g.outputs['Normal'], sep.inputs[0])
        rr = N.new('ShaderNodeMapRange'); rr.inputs['From Min'].default_value = .35; rr.inputs['From Max'].default_value = .8
        L.new(sep.outputs['Z'], rr.inputs['Value'])
        mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'
        L.new(rr.outputs[0], mx.inputs['Factor']); L.new(out, mx.inputs[6]); mx.inputs[7].default_value = srgb(top); out = mx.outputs[2]
    L.new(out, b.inputs['Base Color'])
    b.inputs['Subsurface Weight'].default_value = .25; b.inputs['Subsurface Radius'].default_value = (1, .5, .25); b.inputs['Subsurface Scale'].default_value = .05
    b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = .3; b.inputs['Roughness'].default_value = .62
    bump(m, 'noise', 28, .35, .03)
    return m


def GLASS():
    """Thin PET: mostly see-through, with Fresnel highlights. No refraction, so the drink keeps its light."""
    m = bpy.data.materials.new('pet'); m.use_nodes = True; N = m.node_tree.nodes; L = m.node_tree.links
    N.remove(N['Principled BSDF']); out = N['Material Output']
    tr = N.new('ShaderNodeBsdfTransparent'); tr.inputs['Color'].default_value = (.97, .985, 1, 1)
    gl = N.new('ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = .04
    lw = N.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = .18
    mx = N.new('ShaderNodeMixShader')
    ad = N.new('ShaderNodeMath'); ad.operation = 'ADD'; ad.inputs[1].default_value = .05; ad.use_clamp = True
    L.new(lw.outputs['Fresnel'], ad.inputs[0]); L.new(ad.outputs[0], mx.inputs['Fac'])
    L.new(tr.outputs[0], mx.inputs[1]); L.new(gl.outputs[0], mx.inputs[2]); L.new(mx.outputs[0], out.inputs['Surface'])
    return m
ICE = lambda: bump(mat('ice', '#f2fbff', .1, trans=1, ior=1.31), 'noise', 14, .25, .02)


# ---------------------------------------------------------------- geometry
def lathe(name, pts, m, segs=128, smooth=True, solid=0, rot=0):
    """Revolve [r, z] points round Z. u = 0.5 faces the camera (-Y) so prints sit on the front; v runs bottom→top."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    Ls = [0]
    for i in range(1, len(pts)): Ls.append(Ls[-1] + math.dist(pts[i - 1], pts[i]))
    tot = Ls[-1] or 1
    rings = []
    for (r, z) in pts:
        ring = []
        for j in range(segs + 1):
            t = (j / segs - .5) * TAU + rot
            ring.append(bm.verts.new((r * math.sin(t), -r * math.cos(t), z)))
        rings.append(ring)
    uv = bm.loops.layers.uv.new()
    for i in range(len(pts) - 1):
        for j in range(segs):
            q = (rings[i][j], rings[i][j + 1], rings[i + 1][j + 1], rings[i + 1][j])
            if len(set(q)) < 3: continue
            try: f = bm.faces.new(q)
            except ValueError: continue
            for lp, (a, b) in zip(f.loops, ((j, i), (j + 1, i), (j + 1, i + 1), (j, i + 1))):
                lp[uv].uv = (a / segs, Ls[b] / tot)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = smooth
    o = link(bpy.data.objects.new(name, me)); me.materials.append(m)
    if solid:
        s = o.modifiers.new('wall', 'SOLIDIFY'); s.thickness = solid; s.offset = -1; s.use_even_offset = True
    return o


def band(name, z0, z1, rfun, m, off=.006, n=24, segs=128):
    return lathe(name, [(rfun(z0 + (z1 - z0) * i / n) + off, z0 + (z1 - z0) * i / n) for i in range(n + 1)], m, segs)


def tube(name, pts, radius, m, res=6, taper=None):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = radius; cu.bevel_resolution = res; cu.use_fill_caps = True
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts): p.co = (c[0], c[1], c[2], 1); p.radius = taper(pts.index(c)) if taper else 1
    o = link(bpy.data.objects.new(name, cu))
    if m: cu.materials.append(m)
    return o


def rbox(name, size, m, bevel=.04, loc=(0, 0, 0), rot=(0, 0, 0)):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1); me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me)); o.scale = size; o.location = loc; o.rotation_euler = rot; me.materials.append(m)
    bv = o.modifiers.new('b', 'BEVEL'); bv.width = bevel; bv.segments = 3; bv.affect = 'EDGES'
    for p in me.polygons: p.use_smooth = True
    return o


def sphere(name, r, m, loc, scale=(1, 1, 1), seg=24):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=r)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    o = link(bpy.data.objects.new(name, me)); o.location = loc; o.scale = scale; me.materials.append(m); return o


def scatter(name, n, m, place, size, shape='ico'):
    """Many small things in one mesh: drops, sugar, crumbs, salt."""
    bm = bmesh.new()
    for i in range(n):
        loc, nrm, s = place(i)
        geo = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=1) if shape == 'ico' else bmesh.ops.create_cube(bm, size=1)
        q = Vector((0, 0, 1)).rotation_difference(nrm) if nrm else Euler((random.random() * 3, random.random() * 3, random.random() * 3)).to_quaternion()
        sx, sy, sz = s
        for v in geo['verts']:
            v.co = q @ Vector((v.co.x * sx, v.co.y * sy, v.co.z * sz)) + Vector(loc)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    o = link(bpy.data.objects.new(name, me)); me.materials.append(m); return o


def plate(r=1.7, color='#fbfaf6'):
    return lathe('plate', [(0, -.04), (r * .78, -.04), (r * .98, .05), (r, .08), (r * .965, .085), (r * .74, .02), (0, .02)], mat('plate', color, .12, coat=1, coat_r=.05), 128)


# ---------------------------------------------------------------- products
def hot_cup(v):
    H, r0, r1 = 2.6, .74, .98; rAt = lambda z: r0 + (r1 - r0) * z / H
    paper = bump(mat('paper', '#ffffff', .5, sheen=.2), 'noise', 380, .08, .004)
    image(paper, 'paper_holiday.png' if v.get('holiday') else 'paper.png')
    lathe('cup', [(r0, .03), (r1, H)], paper, solid=.012)
    lathe('base', [(0, 0), (r0 - .03, 0), (r0 + .006, .018), (r0, .06)], mat('base', '#f1ece2', .6))
    rim = bpy.ops.mesh.primitive_torus_add(major_radius=r1 - .004, minor_radius=.032, location=(0, 0, H), major_segments=128, minor_segments=16)
    bpy.context.object.data.materials.append(mat('rim', '#fbfaf6', .45)); bpy.ops.object.shade_smooth()
    if v.get('sleeve', True):
        kraft = bump(mat('kraft', '#c79a64', .82), 'wave', 160, .25, .01, ratio=(1, 1, 1))
        image(kraft, 'sleeve.png')
        z0, z1 = .72, 1.58
        o = band('sleeve', z0, z1, rAt, kraft, off=.024); s = o.modifiers.new('w', 'SOLIDIFY'); s.thickness = .014
    if v.get('open'):
        y = H - .16; r = rAt(y) - .012
        lat = bump(mat('latte', '#c69a6c', .38, coat=.4, coat_r=.15), 'noise', 90, .12, .005)
        image(lat, 'latte_' + v['_id'] + '.png', coord='Generated')
        lathe('liquid', [(rAt(y - .4) - .03, y - .4), (r - .01, y), (0, y)], lat, 96)
        lathe('inner', [(r0 - .012, .06), (r1 - .012, H)], mat('inner', '#efe9dd', .7), smooth=True)
        if v.get('top') == 'whip':
            whip(v, y - .05, r + .18, .75, .22, drizzle='#3a1a0c', cocoa=True)
        return
    plastic = mat('lid', '#f3f0ea', .32, sss=.08, coat=.25, coat_r=.2)
    lp = [(.975, -.036), (1.005, -.03), (1.045, 0), (1.048, .06), (1.02, .11), (.97, .14), (.9, .155), (.85, .2), (.8, .236), (.6, .232), (.56, .21), (0, .21)]
    lathe('lid', [(r * r1 / .98 * .985, H + z) for r, z in lp], plastic, solid=.01)
    rbox('slot', (.24, .07, .03), mat('slot', '#2a1a12', .4), .015, (0, -.7, H + .236))


def whip(v, base, R, h=.7, tr=.21, drizzle=None, cocoa=False, crumbs=None):
    cream = bump(mat('cream', '#fbf6ec', .45, sss=.45, sss_s=.06, sheen=.3, coat=.15), 'noise', 26, .3, .02)
    pts = []; n = 220
    for i in range(n + 1):
        t = i / n; a = t * 3.1 * TAU; r = (R - .26) * (1 - t) ** .9 + .04
        pts.append((math.cos(a) * r, math.sin(a) * r, base + .12 + t * h))
    tube('whip', pts, tr, cream, 8, taper=lambda i: 1 - i / n * .45)
    sphere('tip', tr * .8, cream, pts[-1], (1, 1, 1.4))
    if drizzle:
        dp = [(math.cos(t * 2.8 * TAU + .4) * ((R - .2) * (1 - t) + .1), math.sin(t * 2.8 * TAU + .4) * ((R - .2) * (1 - t) + .1), base + .32 + t * h + math.sin(t * 60) * .02) for t in [i / 180 for i in range(181)]]
        tube('drizzle', dp, .03, mat('drz', drizzle, .12, coat=1, coat_r=.05), 4)
    if cocoa or crumbs:
        col = '#3b1d0e' if cocoa else crumbs
        pl = lambda i: (pts[random.randrange(20, n)], None, (.02 + random.random() * .03,) * 3)
        def place(i):
            p = Vector(pts[random.randrange(10, n)]); d = Vector((random.random() - .5, random.random() - .5, random.random() * .8 + .2)).normalized()
            return (p + d * tr * 1.02, None, (.025 + random.random() * .03, .02, .025))
        scatter('crumbs', 90 if crumbs else 220, mat('crumb', col, .7), place, 0, 'cube')


def iced_cup(v, frappe=False):
    H, r0, r1 = 2.9, .7, 1.0; rAt = lambda z: r0 + (r1 - r0) * z / H
    clear_studio()
    # thin PET wall with a small foot ring; no thick solid shell (that is what read as dark glass)
    lathe('cup', [(0, .02), (r0 - .06, .02), (r0 - .03, 0), (r0, .04), (r1, H)], GLASS())
    bpy.ops.mesh.primitive_torus_add(major_radius=r1 + .012, minor_radius=.016, location=(0, 0, H), major_segments=128, minor_segments=12)
    bpy.context.object.data.materials.append(GLASS()); bpy.ops.object.shade_smooth()
    pr = mat('print', '#ffffff', .4); image(pr, 'iced_print.png', alpha=True)
    band('print', 1.0, 2.3, rAt, pr, off=.004)
    fill = H - .05 if frappe else H * .95
    liq = mat('drink', '#888888', .42, sss=.25, sss_s=.04) if frappe else mat('drink', '#888888', .12, coat=.5, coat_r=.1, sss=.15, sss_s=.05)
    gradient_z(liq, v.get('liquid', ['#2a140a']), .05, fill, speck='#f6efe4' if frappe else None)
    if frappe: bump(liq, 'noise', 160, .18, .006)
    lathe('drink', [(0, .05), (rAt(.05) - .012, .05)] + [(rAt(.05 + (fill - .05) * k) - .012, .05 + (fill - .05) * k) for k in (.25, .5, .75, 1)] + [(0, fill)], liq, 96)
    random.seed(11)
    if not frappe:
        for i in range(v.get('ice', 6)):
            s = .32 + random.random() * .12; a = random.random() * TAU; rr = .25 + random.random() * (rAt(fill) - .62)
            z = fill - .1 + random.random() * .12 if i < 4 else fill - .45 - random.random() * .7
            rbox(f'ice{i}', (s, s, s), ICE(), .06, (math.cos(a) * rr, math.sin(a) * rr, z), (random.random() * 3,) * 3)
        if v.get('drizzle'):
            m = mat('drz', v['drizzle'], .12, coat=1)
            for k in range(-3, 4):
                for d in (0, 1):
                    R = rAt(fill) - .12; pts = []
                    for i in range(21):
                        t = -1 + 2 * i / 20; px, pz = t * R, k * .22
                        if math.hypot(px, pz) < R: pts.append((px, pz, fill + .03) if d else (pz, px, fill + .03))
                    if len(pts) > 2: tube(f'xh{k}{d}', pts, .025, m, 3)
        if v.get('lime'):
            sl = mat('citrus', '#e9d24c', .2, trans=.3, sss=.3); image(sl, 'citrus.png', coord='Generated')
            bpy.ops.mesh.primitive_cylinder_add(radius=.42, depth=.06, location=(-.2, .25, fill - .1), rotation=(1.2, .3, .4), vertices=64)
            bpy.context.object.data.materials.append(sl)
        lathe('lid', [(r1 + .03, H - .02), (r1 + .035, H + .05), (r1 - .03, H + .07), (r1 - .08, H + .04), (0, H + .04)], GLASS())
    else:
        if v.get('drizzle'):
            m = mat('streak', v['drizzle'], .15, coat=1)
            for k in range(6):
                a0 = k / 6 * TAU + .3
                ln = .55 + (k % 3) * .25
                pts = [(math.cos(a0) * (rAt(z) - .035), math.sin(a0) * (rAt(z) - .035), z) for z in [H - .12 - ln * i / 10 for i in range(11)]]
                tube(f'streak{k}', pts, .018, m, 3, taper=lambda i: 1 - i / 14)
        whip(v, H, r1, .62, .21, drizzle=v.get('drizzle'), crumbs=v.get('crumbs') or ('#2a120a' if v.get('chips') else None))
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r1 + .03, location=(0, 0, H), segments=96, ring_count=48)
        dome = bpy.context.object; dome.scale.z = .9; dome.data.materials.append(GLASS()); bpy.ops.object.shade_smooth()
        bm = bmesh.new(); bm.from_mesh(dome.data)
        bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.calc_center_median().z < .001 or f.calc_center_median().z > (r1 + .03) * .985], context='FACES')
        bm.to_mesh(dome.data); bm.free(); s = dome.modifiers.new('w', 'SOLIDIFY'); s.thickness = .012
    # condensation: drops on the outside, flattened along the surface
    slope = (r1 - r0) / H
    def drop(i):
        z = .2 + random.random() * (fill - .35); a = random.random() * TAU; r = rAt(z) + .006
        n = Vector((math.sin(a), -math.cos(a), -slope)).normalized(); s = .01 + random.random() ** 3 * .028
        return ((r * math.sin(a), -r * math.cos(a), z), n, (s, s * (1 + random.random() * .6), s * .45))
    scatter('drops', 200, mat('drop', '#ffffff', .02, trans=1, ior=1.33), drop, 0)
    sr = .1 if frappe else .075
    bpy.ops.mesh.primitive_cylinder_add(radius=sr, depth=H + 1.6, location=(.22, .1, (H + 1.6) / 2 + .15), rotation=(-.05, -.12, 0), vertices=48)
    st = bpy.context.object; st.data.materials.append(mat('straw', GREEN, .25, coat=.6, coat_r=.1)); bpy.ops.object.shade_smooth()
    s = st.modifiers.new('w', 'SOLIDIFY'); s.thickness = .012


def ceramic_cup(v):
    color = v.get('cup', '#ffffff')
    glaze = bump(mat('glaze', color, .12, coat=1, coat_r=.04), 'noise', 6, .04, .02)
    prof = [(0, 0), (.42, 0), (.47, .03), (.5, .08), (.62, .22), (.76, .48), (.88, .82), (.95, 1.12), (.965, 1.24), (.955, 1.275), (.935, 1.275), (.92, 1.25), (.9, 1.1), (.82, .82), (.68, .5), (.52, .26), (.3, .16), (0, .14)]
    c = lathe('cup', [(r, z + .1) for r, z in prof], glaze)
    dec = mat('decal', '#ffffff', .15, coat=1); image(dec, 'decal_' + v['_id'] + '.png', alpha=True)
    pts = [(.76 + .12 * (z - .48) / .34 + .007 if z < .82 else .88 + .07 * (z - .82) / .3 + .007, z + .1) for z in [.5 + .48 * i / 16 for i in range(17)]]
    lathe('decal', pts, dec)
    hp = [(.86 + math.cos(a) * .3, 0, .82 + math.sin(a) * .34) for a in [-1.8 + 3.6 * i / 40 for i in range(41)]]
    tube('handle', hp, .07, glaze, 8)
    lathe('saucer', [(0, 0), (.7, 0), (.76, .03), (1.25, .06), (1.5, .15), (1.53, .18), (1.49, .19), (1.22, .12), (.62, .1), (.57, .115), (0, .115)], glaze)
    lat = bump(mat('latte', '#c69a6c', .35, coat=.3), 'noise', 120, .1, .004); image(lat, 'latte_' + v['_id'] + '.png', coord='Generated')
    lathe('liquid', [(.905, 1.1), (.905, 1.2), (0, 1.2)], lat, 96)
    if v.get('marsh'):
        random.seed(5)
        for i in range(9):
            a = random.random() * TAU; r = random.random() * .55
            rbox(f'm{i}', (.18, .14, .18), mat('marsh', '#fbf7f0', .6, sss=.6, sss_s=.05), .05, (math.cos(a) * r, math.sin(a) * r, 1.24), (random.random(), random.random(), random.random() * 3))


def metaball_mesh(name, elems, res=.04):
    mb = bpy.data.metaballs.new(name); mb.resolution = res; mb.render_resolution = res; mb.threshold = .6
    for (co, size, rot) in elems:
        e = mb.elements.new(type='ELLIPSOID'); e.co = co; e.size_x, e.size_y, e.size_z = size; e.radius = 2; e.rotation = rot
    o = link(bpy.data.objects.new(name, mb))
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    o = bpy.context.object
    for p in o.data.polygons: p.use_smooth = True
    return o


def croissant(v):
    """A crescent swept along an arc: fat in the middle, pointed tips, rolled layers as ridges."""
    n = 220; pts = []
    for i in range(n + 1):
        t = i / n - .5; a = t * 2.5; R = 1.25
        pts.append((math.sin(a) * R, -(math.cos(a) * R - R) - .3, 0))
    def rad(i):
        t = i / n - .5; body = 1 - abs(t * 2) ** 1.7 * .82
        ridge = 1 + .13 * abs(math.sin(t * math.pi * 7.5)) ** .6
        return max(.08, body * ridge)
    o = tube('croissant', pts, .46, None, 16, taper=rad)
    o.data.materials.clear()
    o.scale = (1, 1, .78); o.location.z = .36
    o.data.materials.append(baked(mat('pastry'), '#f0c47e', '#b8641f', '#6e2f08', coat=.55))
    plate(1.75)


def ensaymada(v):
    pts = []; n = 160
    for i in range(n + 1):
        t = i / n; a = t * 2.3 * TAU; r = .15 + .9 * t
        pts.append((math.cos(a) * r, math.sin(a) * r, .42 + (1 - t) * .3 - t * t * .15))
    o = tube('coil', pts, .3, baked(mat('brioche'), '#f0c483', '#c07a33', '#8a4b1a', top=v.get('top', '#f6e7b8'), coat=.1), 10)
    random.seed(3)
    def on_top(i, lift=0):
        t = random.random(); a = t * 2.3 * TAU; r = .15 + .9 * t + (random.random() - .5) * .3
        return ((math.cos(a) * r, math.sin(a) * r, .42 + (1 - t) * .3 - t * t * .15 + .27 + lift), None, (.018, .018, .018))
    scatter('sugar', 700, mat('sugar', '#ffffff', .05, trans=.6, ior=1.5), on_top, 0, 'cube')
    scatter('queso', 240, mat('queso', '#f2cf5b', .5, sss=.3), lambda i: (on_top(i, .02)[0], None, (.012, .11, .012)), 0, 'cube')
    lathe('liner', [(0, 0), (1.45, 0), (1.5, .03), (0, .03)], mat('liner', '#fbf8f2', .9), 128)


def muffin(v):
    pleat = mat('liner', GREEN, .7, sheen=.3)
    me = bpy.data.meshes.new('liner'); bm = bmesh.new(); segs = 192; rows = 8
    rings = [[bm.verts.new(((.74 + .24 * k / rows) * (1 + .03 * math.copysign(abs(math.sin(j / segs * TAU * 24)) ** .5, math.sin(j / segs * TAU * 24))) * math.cos(j / segs * TAU), (.74 + .24 * k / rows) * (1 + .03 * math.copysign(abs(math.sin(j / segs * TAU * 24)) ** .5, math.sin(j / segs * TAU * 24))) * math.sin(j / segs * TAU), .9 * k / rows)) for j in range(segs)] for k in range(rows + 1)]
    for k in range(rows):
        for j in range(segs): bm.faces.new((rings[k][j], rings[k][(j + 1) % segs], rings[k + 1][(j + 1) % segs], rings[k + 1][j]))
    bm.to_mesh(me); bm.free(); o = link(bpy.data.objects.new('liner', me)); me.materials.append(pleat)
    s = o.modifiers.new('w', 'SOLIDIFY'); s.thickness = .012
    for p in me.polygons: p.use_smooth = True
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=6, radius=1.14, location=(0, 0, .55)); top = bpy.context.object
    bm = bmesh.new(); bm.from_mesh(top.data); bmesh.ops.delete(bm, geom=[v_ for v_ in bm.verts if v_.co.z < -.35], context='VERTS'); bm.to_mesh(top.data); bm.free()
    top.scale.z = .72; bpy.ops.object.shade_smooth()
    tx = bpy.data.textures.new('crumb', 'CLOUDS'); tx.noise_scale = .35
    d = top.modifiers.new('d', 'DISPLACE'); d.texture = tx; d.strength = .14; d.texture_coords = 'OBJECT'
    top.data.materials.append(baked(mat('muffin'), '#e9b673', '#a65b22', '#7a3b12', coat=.05))
    random.seed(7)
    berry = mat('berry', '#2b2d5c', .35, sss=.4, sss_s=.03, sheen=.8, sheen_r=.5, coat=.3)
    for i in range(16):
        th = random.random() * math.pi * .52; ph = random.random() * TAU; r = 1.17
        sphere(f'b{i}', .09 + random.random() * .04, berry, (math.sin(th) * math.cos(ph) * r, math.sin(th) * math.sin(ph) * r, .55 + math.cos(th) * r * .72))
    scatter('sugar', 260, mat('sugar', '#ffffff', .05, trans=.6, ior=1.5), lambda i: ((lambda th, ph: (math.sin(th) * math.cos(ph) * 1.22, math.sin(th) * math.sin(ph) * 1.22, .55 + math.cos(th) * 1.22 * .72))(math.sqrt(random.random()) * math.pi * .5, random.random() * TAU), None, (.022, .022, .022)), 0, 'cube')


def cookie(v):
    random.seed(9)
    for k, (dx, dy, rz, tilt, R) in enumerate(((-.55, .8, .4, -.12, 1), (.25, -.25, 0, 0, 1.06))):
        bpy.ops.mesh.primitive_cylinder_add(radius=R, depth=.24, vertices=128, location=(dx, dy, .14 + (.08 if k == 0 else 0)), rotation=(tilt, .06 * k, rz))
        c = bpy.context.object
        sub = c.modifiers.new('s', 'SUBSURF'); sub.levels = 2; sub.render_levels = 3
        t1 = bpy.data.textures.new('crack', 'VORONOI'); t1.noise_scale = .3
        d = c.modifiers.new('d', 'DISPLACE'); d.texture = t1; d.strength = .07; d.texture_coords = 'OBJECT'
        t2 = bpy.data.textures.new('lump', 'CLOUDS'); t2.noise_scale = .5
        d2 = c.modifiers.new('d2', 'DISPLACE'); d2.texture = t2; d2.strength = .1; d2.texture_coords = 'OBJECT'
        bpy.ops.object.shade_smooth()
        c.data.materials.append(baked(mat('dough'), '#4a2615', '#2c150b', '#1b0c05', coat=.05))
        ch = mat('choc', '#22100a', .3, coat=.3, coat_r=.2, sss=.1)
        for i in range(14):
            a = random.random() * TAU; r = math.sqrt(random.random()) * R * .8; s = .11 + random.random() * .1
            rbox(f'ch{k}{i}', (s, s * 1.2, s * .6), ch, .03, (dx + math.cos(a) * r, dy + math.sin(a) * r, .3 + (.08 if k == 0 else 0)), (random.random() - .5, random.random() - .5, random.random() * 3))
        scatter(f'salt{k}', 30, mat('salt', '#ffffff', .1, trans=.5), lambda i: ((dx + math.cos(random.random() * TAU) * random.random() * R * .7, dy + math.sin(random.random() * TAU) * random.random() * R * .7, .32 + (.08 if k == 0 else 0)), None, (.035, .028, .012)), 0, 'cube')


def cake(v):
    R, ang = 1.75, .62
    def sector(z0, h, m, bevel=0):
        bm = bmesh.new(); vs = [bm.verts.new((0, 0, z0))]
        for i in range(25):
            a = -ang / 2 + ang * i / 24; vs.append(bm.verts.new((R * math.sin(a), R * math.cos(a), z0)))
        f = bm.faces.new(vs); ex = bmesh.ops.extrude_face_region(bm, geom=[f])
        bmesh.ops.translate(bm, vec=(0, 0, h), verts=[x for x in ex['geom'] if isinstance(x, bmesh.types.BMVert)])
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        me = bpy.data.meshes.new('layer'); bm.to_mesh(me); bm.free(); o = link(bpy.data.objects.new('layer', me)); me.materials.append(m)
        if bevel: b = o.modifiers.new('b', 'BEVEL'); b.width = bevel; b.segments = 4
        return o
    sponge = bump(mat('sponge', v['sponge'], .9, sss=.2, sss_s=.03), 'voronoi', 40, .5, .02)
    frost = bump(mat('frost', v['frost'], .45, sss=.4, sss_s=.05, sheen=.3), 'noise', 8, .1, .02)
    z = 0; parts = []
    for col, h in ((sponge, .36), (frost, .09), (sponge, .36), (frost, .09), (sponge, .36)):
        parts.append(sector(z, h, col)); z += h
    top = mat('cocoa', '#5e3418', .95) if v.get('cocoa') else frost
    if v.get('cocoa'): bump(top, 'noise', 120, .4, .01)
    parts.append(sector(z, .14, top, .04))
    rp = [(math.cos(t * 2.4 * TAU) * .2 * (1 - t), R * .72 + math.sin(t * 2.4 * TAU) * .2 * (1 - t), z + .2 + t * .25) for t in [i / 120 for i in range(121)]]
    parts.append(tube('rosette', rp, .09, frost, 8))
    if v.get('cocoa'): parts.append(sphere('bean', .09, mat('bean', '#2a140a', .3, coat=.6), (0, R * .72, z + .52), (1, 1.4, .6)))
    else:
        random.seed(2)
        parts.append(scatter('crumbs', 60, mat('cr', v['sponge'], .9), lambda i: (((random.random() - .5) * .7, R * (.3 + random.random() * .6), z + .17), None, (.03, .03, .025)), 0, 'cube'))
    for o in parts: o.location.y -= R * .5; o.rotation_euler.z = .55; o.location = Euler((0, 0, .55)).to_matrix() @ o.location
    plate(2.0)


def beans(v):
    bpy.ops.mesh.primitive_cube_add(size=1); bag = bpy.context.object
    W, H, D = 1.5, 2.5, .9; bag.scale = (W, D, H)
    bpy.ops.object.transform_apply(scale=True)
    sub = bag.modifiers.new('s', 'SUBSURF'); sub.levels = 3; sub.render_levels = 3; sub.subdivision_type = 'SIMPLE'
    bpy.ops.object.modifier_apply(modifier='s')
    for vt in bag.data.vertices:
        p = vt.co; t = (p.z + H / 2) / H
        pinch = 1 - max(0, min(1, (t - .62) / .38)) ** 2 * .9; bulge = 1 + math.sin(t * math.pi) * .06
        p.y *= pinch * bulge; p.x *= bulge; p.z += H / 2
    tx = bpy.data.textures.new('wrinkle', 'CLOUDS'); tx.noise_scale = .25
    d = bag.modifiers.new('d', 'DISPLACE'); d.texture = tx; d.strength = .025; d.texture_coords = 'OBJECT'
    sm = bag.modifiers.new('sm', 'SUBSURF'); sm.levels = 1; sm.render_levels = 2
    bpy.ops.object.shade_smooth()
    m = mat('bag', v['color'], .78, sheen=.4, sheen_r=.4); N, L, b = nodes(m)
    t = N.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(TEX, 'bag_' + v['_id'] + '.png')); t.extension = 'CLIP'
    # front projection: u = x / W + .5, v = z / H (object space), so the label sits flat on the front panel
    tc = N.new('ShaderNodeTexCoord'); sx = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sx.inputs[0])
    u = N.new('ShaderNodeMath'); u.operation = 'MULTIPLY_ADD'; u.inputs[1].default_value = 1 / W; u.inputs[2].default_value = .5; L.new(sx.outputs['X'], u.inputs[0])
    vv = N.new('ShaderNodeMath'); vv.operation = 'MULTIPLY'; vv.inputs[1].default_value = 1 / H; L.new(sx.outputs['Z'], vv.inputs[0])
    cb = N.new('ShaderNodeCombineXYZ'); L.new(u.outputs[0], cb.inputs['X']); L.new(vv.outputs[0], cb.inputs['Y']); L.new(cb.outputs[0], t.inputs['Vector'])
    g = N.new('ShaderNodeNewGeometry'); sep = N.new('ShaderNodeSeparateXYZ'); L.new(g.outputs['Normal'], sep.inputs[0])
    mr = N.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = -.3; mr.inputs['From Max'].default_value = -.6; L.new(sep.outputs['Y'], mr.inputs['Value'])
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; L.new(mr.outputs[0], mx.inputs['Factor']); mx.inputs[6].default_value = srgb(v['color']); L.new(t.outputs['Color'], mx.inputs[7])
    L.new(mx.outputs[2], b.inputs['Base Color']); bag.data.materials.append(m)
    rbox('fold', (W * 1.02, .12, .32), mat('fold', v['color'], .8), .05, (0, 0, H - .12))
    rbox('tie', (W * 1.14, .15, .07), mat('tie', GOLD, .3, metal=1), .02, (0, 0, H - .14))
    random.seed(4); bm_ = mat('beanc', '#8a5530' if v['color'] == '#c9a15b' else '#3a1f10', .3, coat=.5, coat_r=.2)
    for i in range(16):
        o = sphere(f'bean{i}', .09, bm_, (.5 + random.random() * 1.2, -.6 - random.random() * 1.0, .055), (1, 1.35, .62), 20)
        o.rotation_euler.z = random.random() * 3
        bump(bm_, 'wave', 4, .6, .02) if i == 0 else None


def tumbler(v):
    powder = bump(mat('powder', v['color'], .42, coat=.6, coat_r=.25), 'noise', 300, .12, .003)
    lathe('body', [(0, 0), (.7, 0), (.77, .04), (.8, .14), (.88, 2.55), (.885, 2.62)], powder)
    steel = bump(mat('steel', '#d8dadb', .14, metal=1), 'noise', 200, .05, .002)
    lathe('band', [(.885, 2.6), (.89, 2.62), (.892, 2.86), (.88, 2.9)], steel)
    lathe('lid', [(.86, 2.84), (.89, 2.88), (.87, 3.0), (.78, 3.08), (.6, 3.12), (0, 3.12)], mat('lid', '#1b1f1d', .35, coat=.6))
    rbox('slider', (.5, .26, .06), mat('sl', '#2a2f2c', .3), .03, (0, -.38, 3.13))
    dec = mat('decal', '#ffffff', .3, metal=.6); image(dec, 'decal_' + v['_id'] + '.png', alpha=True)
    lathe('decal', [(.8 + .08 * (z - .14) / 2.41 + .004, z) for z in [.9 + 1.3 * i / 12 for i in range(13)]], dec)


def stone_mug(v):
    glaze = mat('glaze', v['color'], .2, coat=1, coat_r=.06); N, L, b = nodes(glaze)
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 180; rr = N.new('ShaderNodeValToRGB')
    rr.color_ramp.elements[0].position = .7; rr.color_ramp.elements[0].color = srgb(v['color']); rr.color_ramp.elements[1].position = .72; rr.color_ramp.elements[1].color = srgb('#c9b48a')
    L.new(nz.outputs['Fac'], rr.inputs['Fac']); L.new(rr.outputs['Color'], b.inputs['Base Color'])
    lathe('mug', [(0, 0), (.7, 0), (.78, .04), (.82, .14), (.84, 1.8), (.83, 1.88), (.8, 1.9), (.77, 1.86), (.76, 1.7), (.74, .2), (0, .18)], glaze)
    lathe('clay', [(.7, 0), (.78, .04), (.805, .1)], mat('clay', '#c9a27a', .9), 128)
    hp = [(.8 + math.cos(a) * .42, 0, 1.0 + math.sin(a) * .48) for a in [-1.75 + 3.5 * i / 40 for i in range(41)]]
    tube('handle', hp, .1, glaze, 8)
    dec = mat('decal', '#ffffff', .25, coat=1); image(dec, 'decal_' + v['_id'] + '.png', alpha=True)
    lathe('decal', [(.846, .55 + .9 * i / 10) for i in range(11)], dec)


BUILD = {'hot': hot_cup, 'iced': iced_cup, 'frappe': lambda v: iced_cup(v, True), 'mug': ceramic_cup, 'croissant': croissant, 'ensaymada': ensaymada,
         'muffin': muffin, 'cookie': cookie, 'cake': cake, 'beans': beans, 'tumbler': tumbler, 'ceramic': stone_mug}
ELEV = {'hot': .14, 'iced': .12, 'frappe': .12, 'mug': .55, 'croissant': .55, 'ensaymada': .6, 'muffin': .32, 'cookie': .62, 'cake': .42, 'beans': .2, 'tumbler': .14, 'ceramic': .2}
TURN = {'hot': -.35, 'iced': -.3, 'frappe': -.3, 'mug': .5, 'beans': -.45, 'tumbler': -.3, 'ceramic': .6, 'cake': .9}


def frame(kind, v):
    objs = [o for o in bpy.context.scene.objects if o.type in ('MESH', 'CURVE') and o.name != 'floor']
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))); hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    ctr = (lo + hi) / 2; size = hi - lo
    if kind == 'hot' and v.get('open'): el = .42
    else: el = ELEV[kind]
    cam = bpy.data.cameras.new('cam'); cam.lens = 70; cam.sensor_width = 36
    co = link(bpy.data.objects.new('cam', cam)); bpy.context.scene.camera = co
    radius = max(size.z * .55, math.hypot(size.x, size.y) * .55)
    d = radius / math.tan(math.atan(18 / 70)) * 1.18
    co.location = (0, -math.cos(el) * d, ctr.z + math.sin(el) * d)
    co.rotation_euler = (Vector((0, 0, ctr.z - .02)) - co.location).to_track_quat('-Z', 'Y').to_euler()


def render(it):
    reset(); rig()
    if HERO: bpy.data.objects.remove(bpy.data.objects['floor'])
    v = dict(it['v']); v['_id'] = it['id']
    BUILD[v['kind']](v)
    t = TURN.get(v['kind'], 0)
    if t:
        for o in list(bpy.context.scene.objects):
            if o.type in ('MESH', 'CURVE') and o.name != 'floor' and not o.parent:
                o.location = Euler((0, 0, t)).to_matrix() @ o.location; o.rotation_euler.z += t
    # glass, ice and drops let light through (no caustics), so they cast no hard black shadow
    for o in bpy.context.scene.objects:
        if o.type in ('MESH', 'CURVE') and o.data.materials and o.data.materials[0] and o.data.materials[0].name.split('.')[0] in ('pet', 'ice', 'drop', 'print', 'sugar', 'salt'):
            o.visible_shadow = False
        # thin PET needs no wall thickness (a solidified shell traps light and turns the drink black)
        if o.type == 'MESH' and o.data.materials and o.data.materials[0] and o.data.materials[0].name.startswith('pet'):
            for md in list(o.modifiers):
                if md.type == 'SOLIDIFY': o.modifiers.remove(md)
    frame(v['kind'], v)
    bpy.context.scene.render.filepath = os.path.join(OUT, it['id'] + '.png')
    bpy.ops.render.render(write_still=True)
    print('RENDERED', it['id'], flush=True)


for it in ITEMS:
    if ONLY and it['id'] not in ONLY: continue
    try: render(it)
    except Exception as e:
        import traceback; traceback.print_exc(); print('FAILED', it['id'], e, flush=True)
