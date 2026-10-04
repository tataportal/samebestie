"""Close the tunnels between decorative bevelled cells without changing their silhouette.

Each body part gets a continuous, inset voxel shell of the same colours. Its
shared corners stay connected; simply shrinking individual cubes leaves tunnels
through every grid plane, especially obvious with a perfectly frontal camera.
"""
import bpy
import math
from collections import defaultdict

CELL = .035
INSET = CELL * .07


def add_solid_backing(rig):
    for ob in list(rig.children):
        if ob.type != 'MESH' or 'rounded voxel cells' not in ob.data.name:
            continue
        mesh = ob.data
        cells = {}
        for polygon in mesh.polygons:
            p = mesh.vertices[polygon.vertices[0]].co
            key = tuple(math.floor(x / CELL) for x in p)
            cells[key] = polygon.material_index

        faces = []
        normals = defaultdict(lambda: [0, 0, 0])
        for key, material in cells.items():
            for axis in range(3):
                u, v = (axis + 1) % 3, (axis + 2) % 3
                for sign in (-1, 1):
                    neighbor = list(key)
                    neighbor[axis] += sign
                    if tuple(neighbor) in cells:
                        continue
                    corners = []
                    for a, b in ((0, 0), (1, 0), (1, 1), (0, 1)):
                        corner = list(key)
                        corner[axis] += int(sign > 0)
                        corner[u] += a
                        corner[v] += b
                        corner = tuple(corner)
                        corners.append(corner)
                        normals[corner][axis] += sign
                    if sign < 0:
                        corners.reverse()
                    faces.append((corners, material))

        keys = list(normals)
        indices = {key: i for i, key in enumerate(keys)}
        vertices = [tuple(key[i] * CELL - (INSET if n[i] > 0 else -INSET if n[i] < 0 else 0)
                          for i in range(3)) for key in keys for n in [normals[key]]]
        backing = bpy.data.meshes.new(ob.name + ' continuous backing')
        backing.from_pydata(vertices, [], [[indices[k] for k in corners] for corners, _ in faces])
        for material in mesh.materials:
            backing.materials.append(material)
        for polygon, (_, material) in zip(backing.polygons, faces):
            polygon.material_index = material
        backing.update()
        sealed = ob.copy()
        sealed.data = backing
        sealed.name = ob.name + ' solid backing'
        bpy.context.scene.collection.objects.link(sealed)
        for group in list(sealed.vertex_groups):
            sealed.vertex_groups.remove(group)
        group = sealed.vertex_groups.new(name=ob.vertex_groups[0].name)
        group.add(list(range(len(vertices))), 1, 'REPLACE')
        print('SEALED', ob.name, len(cells), 'cells', len(faces), 'backing faces', flush=True)
    bpy.context.view_layer.update()
