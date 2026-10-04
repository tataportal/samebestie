"""Export the corrected Blender scene as batched vertex-color meshes for WebGL.
Source remains untouched; character body parts remain separate for runtime motion.
"""
import bpy,numpy as np,json,sys
from pathlib import Path
from collections import defaultdict
R=Path(__file__).resolve().parents[1]
(R/'source-assets').mkdir(exist_ok=True)
(R/'public/models').mkdir(parents=True,exist_ok=True)
source=Path(sys.argv[sys.argv.index('--')+1]) if '--' in sys.argv else R.parents[1]/'drafts/chatito-front-repair/chatito-study-desk.blend'
bpy.ops.wm.open_mainfile(filepath=str(source))
sys.path.insert(0,str(Path(__file__).parent))
from seal_voxels import add_solid_backing
add_solid_backing(bpy.data.objects['Chatito_Rig'])
s=bpy.context.scene;dg=bpy.context.evaluated_depsgraph_get();groups=defaultdict(list);count=0
for ob in list(s.objects):
 if ob.type!='MESH' or ob.hide_render:continue
 ev=ob.evaluated_get(dg);me=ev.to_mesh();me.calc_loop_triangles()
 if not len(me.loop_triangles):ev.to_mesh_clear();continue
 p=np.empty(len(me.vertices)*3,np.float32);me.vertices.foreach_get('co',p);p=p.reshape(-1,3);mw=np.array(ob.matrix_world);p=p@mw[:3,:3].T+mw[:3,3]
 tri=np.empty(len(me.loop_triangles)*3,np.int32);me.loop_triangles.foreach_get('vertices',tri);tri=tri.reshape(-1,3)
 mi=np.empty(len(me.loop_triangles),np.int32);me.loop_triangles.foreach_get('material_index',mi)
 colors=[];emissions=[]
 for m in me.materials:
  bs=m.node_tree.nodes.get('Principled BSDF') if m and m.use_nodes else None
  colors.append(list(bs.inputs['Base Color'].default_value) if bs else [0.5,0.5,0.5,1])
  emissions.append(float(bs.inputs['Emission Strength'].default_value)*max(bs.inputs['Emission Color'].default_value[:3]) if bs else 0)
 if not colors:colors=[[.5,.5,.5,1]];emissions=[0]
 colors=np.array(colors,np.float32);emissions=np.array(emissions)
 # Match baked static surfaces and keep only Chatito's body pieces distinct.
 part='Room'
 if max(ob.dimensions)>30:part='FarGround'
 if (ob.parent and ob.parent.name=='Bao_Rig') or ob.name.startswith('Bao '):part='Bao'
 if ob.name.startswith(('Turning page strip','Turning page handwriting')):part='ReadingPage'
 if ob.parent and ob.parent.name=='Chatito_Rig':
  part='Chatito_'+(ob.vertex_groups[0].name if ob.vertex_groups else 'Head')
 for emit in (False,True):
  sel=(emissions[mi]>0.1)==emit
  if not sel.any():continue
  pos=p[tri[sel]].reshape(-1,3).astype(np.float32)
  rgba=np.repeat(colors[mi[sel]],3,axis=0)
  # Emission hues must come from emission color, not the dark housing.
  if emit:
   for idx in np.unique(mi[sel]):
    m=me.materials[int(idx)];bs=m.node_tree.nodes.get('Principled BSDF')
    rgba[np.repeat(mi[sel]==idx,3)]=bs.inputs['Emission Color'].default_value
  groups[(part,emit)].append((pos,rgba))
 count+=1;ev.to_mesh_clear()
print('COLLECTED',count,'objects',len(groups),'batches',flush=True)
# Only newly created scene objects are exported.
bpy.ops.object.select_all(action='DESELECT');out=[];report=[]
for (part,emit),chunks in groups.items():
 p=np.concatenate([x[0] for x in chunks]);c=np.concatenate([x[1] for x in chunks]);n=len(p)
 me=bpy.data.meshes.new(part);me.vertices.add(n);me.vertices.foreach_set('co',p.ravel());me.loops.add(n);me.loops.foreach_set('vertex_index',np.arange(n,dtype=np.int32));me.polygons.add(n//3);me.polygons.foreach_set('loop_start',np.arange(0,n,3,dtype=np.int32));me.polygons.foreach_set('loop_total',np.full(n//3,3,dtype=np.int32));me.update()
 attr=me.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='POINT');attr.data.foreach_set('color',c.ravel());me.color_attributes.active_color=attr
 m=bpy.data.materials.new('Web emission' if emit else 'Web matte');m.use_nodes=True;bs=m.node_tree.nodes['Principled BSDF'];bs.inputs['Roughness'].default_value=.87
 v=m.node_tree.nodes.new('ShaderNodeVertexColor');v.layer_name='Color';m.node_tree.links.new(v.outputs['Color'],bs.inputs['Base Color'])
 if emit:bs.inputs['Emission Strength'].default_value=4;m.node_tree.links.new(v.outputs['Color'],bs.inputs['Emission Color'])
 me.materials.append(m);o=bpy.data.objects.new('Web_'+part+('_Glow' if emit else ''),me);s.collection.objects.link(o);o.select_set(True);out.append(o);report.append({'name':o.name,'triangles':n//3})
bpy.context.view_layer.objects.active=out[0]
bpy.ops.export_scene.gltf(filepath=str(R/'source-assets/cozy-room-raw.glb'),export_format='GLB',use_selection=True,export_animations=False,export_skins=False,export_yup=True,export_normals=True,export_texcoords=False,export_materials='EXPORT',export_attributes=False)
(R/'public/models/scene-info.json').write_text(json.dumps({'source':'chatito-study-desk.blend','source_mesh_objects':count,'batches':report,'camera':{'position':[-1.85,1.95,5.60],'target':[-1.85,1.95,2.34],'lens_mm':50},'note':'Static pose plus separate body parts for procedural idle. Six emotional animations are not included.'},indent=2))
print('WEB_EXPORT_COMPLETE',flush=True)
