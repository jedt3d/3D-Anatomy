# 02. Setup and daily workflow

_Last updated: 2026-11-27. Versions are what was current on that date; re-check before setup._

## 1. Tools to install

| Tool | Version | Used for |
|---|---|---|
| Flutter | 3.47 stable or newer (flutter_scene needs 3.47+) | App, all platforms |
| flutter_scene | 0.24.x (pre-1.0, pin the exact version) | 3D renderer |
| Blender | current LTS (4.5 LTS) or 5.x | Hub, only GLB exporter |
| LightWave 3D | 2026 | Modelling (optional) |
| 3D-Coat | current | Sculpt, retopo, bake |
| Node.js | 20+ | Runs gltf-transform |
| @gltf-transform/cli | 4.5.x | Optimize/compress GLB |
| KTX-Software (`ktx` / `toktx`) | latest | KTX2 texture encoding (check whether gltf-transform needs it on your machine: run `gltf-transform etc1s` once) |
| Khronos glTF Validator | latest | Fails the build on invalid files |
| Git LFS | latest | Large source files |

```bash
npm install --global @gltf-transform/cli
brew install git-lfs && git lfs install
# KTX-Software: download the macOS installer from the KhronosGroup/KTX-Software releases page
```

## 2. Repo layout (proposal)

```
3D-Anatomy/
  app/                         Flutter app (iPad, Android, Web)
  companion/                   Flutter phone app (content DB only)  [later]
  assets-src/                  Git LFS
    lightwave/  *.lwo *.lws
    3dcoat/     *.3b + baked maps
    blender/    <system>.blend   ← source of truth
  assets-build/                generated, not committed (or published to CDN)
    raw/        <system>.glb   (Blender export)
    packs/      <system>.lod0.glb ...  + manifest.json
  content/
    parts.json                 aid → names, IDs, layer, notes
    schema/                    JSON schema for parts.json
  tools/
    export_gltf.py             Blender headless export
    optimize.sh                gltf-transform steps
    check_ids.py               every pickable node has an aid in parts.json
    make_manifest.py
  docs/3d-pipeline/            these documents
```

`.gitattributes`:
```
*.blend filter=lfs diff=lfs merge=lfs -text
*.3b    filter=lfs diff=lfs merge=lfs -text
*.lwo   filter=lfs diff=lfs merge=lfs -text
*.fbx   filter=lfs diff=lfs merge=lfs -text
*.png   filter=lfs diff=lfs merge=lfs -text
*.glb   filter=lfs diff=lfs merge=lfs -text
```

## 3. Artist workflow per part

1. **Model / sculpt**
   - LightWave: model, set units to metres, export FBX (or OBJ) to `assets-src/lightwave/export/`.
   - 3D-Coat: sculpt → Retopo room → UV → bake normal/AO/curvature from sculpt → export low-poly FBX + PNG maps.
2. **Bring into Blender** (`assets-src/blender/<system>.blend`)
   - Import, apply scale/rotation, check normals, triangulate n-gons if needed.
   - Name object `<system>.<part>.<side>`.
   - Add custom properties: `aid`, `system`, `layer`, `pick`.
   - Material: Principled BSDF, hook up baked maps (normal map node set to Tangent Space).
   - LODs: put LOD1/LOD2 in collections `LOD1`, `LOD2` (Decimate modifier is fine).
3. **Run the build** (`tools/build.sh <system>`) and look at the result in the app's debug viewer or https://gltf-viewer.donmccurdy.com.
4. **Add/update** the part in `content/parts.json`. `check_ids.py` fails the build if an `aid` is missing.

Checklist before commit: units in metres, +Y up after export, no n-gons, UVs 0–1, power-of-two textures, normal map PNG not JPG, unique `aid`, layer set.

## 4. Blender headless export (`tools/export_gltf.py`)

```python
# blender -b assets-src/blender/skeleton.blend -P tools/export_gltf.py -- assets-build/raw/skeleton.glb
import bpy, sys
out = sys.argv[sys.argv.index("--") + 1]
bpy.ops.export_scene.gltf(
    filepath=out,
    export_format='GLB',
    export_extras=True,          # custom properties -> glTF extras (aid, layer, ...)
    export_apply=True,           # apply modifiers
    export_yup=True,
    export_texcoords=True,
    export_normals=True,
    export_tangents=True,
    export_materials='EXPORT',
    export_animations=False,
)
```
Check option names against your Blender version's manual (`scene_gltf2` page); a few have been renamed across releases.

## 5. Optimize (`tools/optimize.sh`)

```bash
#!/usr/bin/env bash
set -euo pipefail
IN=$1          # assets-build/raw/skeleton.glb
NAME=$(basename "$IN" .glb)
OUT=assets-build/packs
mkdir -p "$OUT"; T=$(mktemp -d)

gltf-transform inspect "$IN"                         # look before you squeeze
gltf-transform dedup  "$IN"        "$T/a.glb"
gltf-transform prune  "$T/a.glb"   "$T/b.glb"
gltf-transform weld   "$T/b.glb"   "$T/c.glb"
# textures: UASTC for normal maps, ETC1S for colour/AO (check slot flags with: gltf-transform help uastc)
gltf-transform uastc  "$T/c.glb"   "$T/d.glb" --slots "normalTexture"
gltf-transform etc1s  "$T/d.glb"   "$T/e.glb"
cp "$T/e.glb" "$T/lod0.glb"
gltf-transform simplify "$T/e.glb" "$T/lod1.glb" --ratio 0.5
gltf-transform simplify "$T/e.glb" "$T/lod2.glb" --ratio 0.2
for L in lod0 lod1 lod2; do
  gltf-transform meshopt "$T/$L.glb" "$OUT/$NAME.$L.glb"
  gltf_validator "$OUT/$NAME.$L.glb"                 # fail on errors
done
```
Notes:
- `prune` can drop nodes it thinks are unused; confirm `extras` and empty anchor nodes survive (keep label anchors as tiny meshes or check prune flags).
- `simplify` must not merge separate parts; run it per pack and visually check silhouettes.
- If the spike shows flutter_scene cannot read meshopt or KTX2, drop those two steps and use `webp` textures instead until it can.

## 6. Flutter app setup

```bash
flutter --version            # 3.47+
flutter pub add flutter_scene
```
- **Enable Flutter GPU** on iOS/Android with the per-platform key described in the flutter_scene README (Info.plist / AndroidManifest). Desktop uses `--enable-flutter-gpu`. Web needs no flag.
- Pin `flutter_scene` to an exact version in `pubspec.yaml`; minor releases can break.
- Wrap all 3D calls behind one Dart interface, so the renderer can be swapped:
  ```dart
  abstract class AnatomyViewport {
    Future<void> loadPack(Uri glb);
    Stream<String> get picked;               // emits aid
    void setVisible(String aid, bool v);
    void setLayerOpacity(int layer, double a);
    void setClipPlane(Vector4? plane);
    Offset? project(String aid);             // screen pos for Flutter label
  }
  ```

### Web build
```bash
flutter build web --wasm     # also emits a JS fallback
```
- Host with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` (needed for multithreaded rendering).
- iOS browsers use the JS fallback by default; Safari 26.2+ can opt in with `wasmAllowList: { webkit: true }` in `flutter_bootstrap.js`. Test both.

## 7. CI (GitHub Actions, outline)
1. On change in `assets-src/**` or `content/**`.
2. Install Blender (headless), Node, gltf-transform, KTX-Software, glTF Validator.
3. For each changed `.blend`: export → optimize → validate → `check_ids.py`.
4. `make_manifest.py` → upload packs + manifest to CDN under a version path.
5. Post pack sizes and triangle counts as a job summary, so size growth is visible in every PR.

## 8. Setup order (first 3 weeks)
| Week | Work |
|---|---|
| 1 | Repo + LFS; one `.blend` (skeleton, upper limb) with names/IDs; export + optimize scripts run locally |
| 1–2 | Flutter spike app: load pack, orbit, pick, layers, clip plane, labels, on iPad + Safari + Android |
| 2 | Measure (fps, memory, load time, sizes) and decide flutter_scene vs fallback |
| 3 | CI, manifest, offline download, content DB schema |
