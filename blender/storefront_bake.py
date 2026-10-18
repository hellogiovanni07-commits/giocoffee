"""GioCoffee - the storefront as a live 3D model for the stores hero.

Builds the same scene as blender/storefront.py, then:
  1. turns every curve into a mesh and applies the modifiers,
  2. joins the objects into three groups (plaza, building, props) and gives each its own texture atlas,
  3. bakes the Cycles lighting (sun, glowing windows, lamps, soft shadows) into the atlases (AgX, like the renders),
  4. keeps the glass see-through and the window lettering as a transparent decal,
  5. exports assets/3d/hero/storefront.glb (Draco-compressed, WebP textures).
In the browser every baked surface is drawn unlit (MeshBasicMaterial), so it looks like the render from any angle.

  "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P blender/storefront_bake.py -- [--samples 256] [--size 4096]
"""
import bpy, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
user = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
arg = lambda k, d: user[user.index(k) + 1] if k in user else d
SAMPLES, SIZE = int(arg('--samples', 256)), int(arg('--size', 4096))
sys.argv = [sys.argv[0], '--', '--bake'] + user
G = {'__file__': os.path.join(HERE, 'storefront.py'), '__name__': 'bake'}
exec(open(G['__file__'], encoding='utf8').read(), G)
G['build']()
ROOT = os.path.dirname(HERE); TEXD = os.path.join(HERE, 'out_hero', 'bake'); os.makedirs(TEXD, exist_ok=True)
sc = bpy.context.scene; vl = bpy.context.view_layer

def select(objs, active=None):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    vl.objects.active = active or objs[0]

# 1. curves -> meshes, modifiers applied, transforms kept in world space
meshes = [o for o in sc.objects if o.type in ('MESH', 'CURVE')]
for o in meshes:
    select([o]); bpy.ops.object.convert(target='MESH')
for o in [o for o in sc.objects if o.type == 'MESH' and o.parent]:
    select([o]); bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')

# 2. groups
first_mat = lambda o: (o.data.materials[0].name.split('.')[0] if o.data.materials and o.data.materials[0] else '')
PROPS = ('tbase', 'tstem', 'ttop', 'seat', 'Torus', 'leg', 'upr', 'backrest', 'tcup', 'tlid', 'tband', 'af', 'pot', 'trunk', 'crown',
         'shrub', 'planterR', 'lamp', 'lantern', 'wire', 'fairy', 'postR', 'bench', 'bike', 'ac', 'roofshrub', 'roofbox')
all_mesh = [o for o in sc.objects if o.type == 'MESH']
glass = [o for o in all_mesh if first_mat(o) == 'pet']
decal = [o for o in all_mesh if o.name.split('.')[0] in ('lettering', 'menutext')]
plaza = [o for o in all_mesh if o.name.split('.')[0] in ('plaza', 'curb')]
rest = [o for o in all_mesh if o not in glass + decal + plaza]
props = [o for o in rest if o.name.startswith(PROPS) and not o.name.startswith(('backwall', 'backdoor', 'backlamp', 'backstep', 'backband'))]
building = [o for o in rest if o not in props]
print('GROUPS plaza', len(plaza), 'building', len(building), 'props', len(props), 'glass', len(glass), 'decal', len(decal), flush=True)

def join(objs, name):
    select(objs); bpy.ops.object.join(); o = vl.objects.active; o.name = name; o.data.name = name; return o

# 3. bake each group into its own atlas
sc.cycles.samples = SAMPLES
sc.cycles.bake_type = 'COMBINED'
bk = sc.render.bake
bk.use_pass_direct = bk.use_pass_indirect = True
bk.use_pass_diffuse = bk.use_pass_emit = True
bk.use_pass_glossy = False; bk.use_pass_transmission = False
bk.margin = 8; bk.use_clear = True
for o in glass + decal: o.hide_render = False

def keep_object_coords(objs):
    """Procedural textures (awning stripes, paving) read each object's own coordinates. Store them on the geometry
    as an attribute and point those materials at it, so joining the objects changes nothing."""
    for o in objs:
        me = o.data
        at = me.attributes.get('ocoord') or me.attributes.new('ocoord', 'FLOAT_VECTOR', 'POINT')
        at.data.foreach_set('vector', [c for v in me.vertices for c in v.co])
    for m in {m for o in objs for m in o.data.materials if m}:
        N, L = m.node_tree.nodes, m.node_tree.links
        for tc in [n for n in N if n.type == 'TEX_COORD']:
            for link in list(tc.outputs['Object'].links):
                at = N.new('ShaderNodeAttribute'); at.attribute_name = 'ocoord'; at.attribute_type = 'GEOMETRY'
                L.new(at.outputs['Vector'], link.to_socket)


def bake(objs, name, size):
    keep_object_coords(objs)
    ob = join(objs, name)
    me = ob.data
    if not me.uv_layers: me.uv_layers.new(name='UVMap')
    (me.uv_layers.get('UVMap') or me.uv_layers[0]).active_render = True
    me.uv_layers.active = me.uv_layers.new(name='bake')
    select([ob]); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.004, area_weight=0.0, correct_aspect=True)
    bpy.ops.object.mode_set(mode='OBJECT')
    img = bpy.data.images.new(name, size, size, alpha=False, float_buffer=True)
    for m in me.materials:
        if not m: continue
        n = m.node_tree.nodes.new('ShaderNodeTexImage'); n.image = img; n.name = 'BAKE_' + name
        for x in m.node_tree.nodes: x.select = False
        n.select = True; m.node_tree.nodes.active = n
    print('BAKING', name, size, flush=True)
    select([ob]); bpy.ops.object.bake(type='COMBINED')
    path = os.path.join(TEXD, name + '.png')
    img.filepath_raw = path; img.file_format = 'PNG'
    img.save_render(path, scene=sc)              # through the scene's AgX view, like the renders
    baked = bpy.data.images.load(path); baked.name = name + '_tex'
    mat = bpy.data.materials.new(name + '_mat'); mat.use_nodes = True
    N, L = mat.node_tree.nodes, mat.node_tree.links; bsdf = N['Principled BSDF']
    t = N.new('ShaderNodeTexImage'); t.image = baked; L.new(t.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 1
    me.materials.clear(); me.materials.append(mat)
    for l in [l for l in me.uv_layers if l.name != 'bake']: me.uv_layers.remove(l)
    me.uv_layers['bake'].name = 'UVMap'
    if me.attributes.get('ocoord'): me.attributes.remove(me.attributes['ocoord'])
    print('BAKED', name, flush=True)
    return ob

bake(plaza, 'sf_plaza', SIZE // 2)
bake(building, 'sf_building', SIZE)
bake(props, 'sf_props', SIZE)
# 4. glass: one see-through material; lettering keeps its own picture with alpha
gl = join(glass, 'sf_glass'); gm = bpy.data.materials.new('sf_glass_mat'); gm.use_nodes = True
gb = gm.node_tree.nodes['Principled BSDF']; gb.inputs['Base Color'].default_value = (.85, .93, .9, 1); gb.inputs['Alpha'].default_value = .16
gl.data.materials.clear(); gl.data.materials.append(gm)
dc = join(decal, 'sf_decal')

# 5. export
for o in list(sc.objects):
    if o.type not in ('MESH',): bpy.data.objects.remove(o)
out = os.path.join(ROOT, 'assets', '3d', 'hero', 'storefront.glb')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=False, export_yup=True, export_apply=True,
                          export_image_format='WEBP', export_image_quality=86,
                          export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
                          export_draco_position_quantization=14, export_draco_normal_quantization=10, export_draco_texcoord_quantization=14,
                          export_lights=False, export_cameras=False)
print('EXPORTED', out, os.path.getsize(out), flush=True)
