# 02. การตั้งค่าและ workflow ประจำวัน

_อัปเดตล่าสุด: 2026-11-27 เวอร์ชันที่ระบุคือเวอร์ชันล่าสุด ณ วันนั้น ตรวจซ้ำก่อนติดตั้ง_

## 1. เครื่องมือที่ต้องติดตั้ง

| เครื่องมือ | เวอร์ชัน | ใช้ทำอะไร |
|---|---|---|
| Flutter | 3.47 stable ขึ้นไป (flutter_scene ต้องใช้ 3.47+) | ตัวแอป ทุกแพลตฟอร์ม |
| flutter_scene | 0.24.x (ก่อน 1.0 ให้ pin เวอร์ชันให้ตรง) | ตัวเรนเดอร์ 3D |
| Blender | LTS ปัจจุบัน (4.5 LTS) หรือ 5.x | ศูนย์กลาง และตัว export GLB เพียงตัวเดียว |
| LightWave 3D | 2026 | Modelling (ไม่บังคับ) |
| 3D-Coat | ปัจจุบัน | Sculpt, retopo, bake |
| Node.js | 20+ | ใช้รัน gltf-transform |
| @gltf-transform/cli | 4.5.x | Optimize/บีบอัด GLB |
| KTX-Software (`ktx` / `toktx`) | ล่าสุด | เข้ารหัส texture KTX2 (ตรวจว่า gltf-transform ต้องใช้บนเครื่องคุณหรือไม่ โดยลองรัน `gltf-transform etc1s` หนึ่งครั้ง) |
| Khronos glTF Validator | ล่าสุด | ทำให้ build ล้มเมื่อไฟล์ไม่ถูกต้อง |
| Git LFS | ล่าสุด | เก็บไฟล์ต้นฉบับขนาดใหญ่ |

```bash
npm install --global @gltf-transform/cli
brew install git-lfs && git lfs install
# KTX-Software: download the macOS installer from the KhronosGroup/KTX-Software releases page
```

## 2. โครงสร้าง repo (ข้อเสนอ)


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

ไฟล์ `.gitattributes`:
```
*.blend filter=lfs diff=lfs merge=lfs -text
*.3b    filter=lfs diff=lfs merge=lfs -text
*.lwo   filter=lfs diff=lfs merge=lfs -text
*.fbx   filter=lfs diff=lfs merge=lfs -text
*.png   filter=lfs diff=lfs merge=lfs -text
*.glb   filter=lfs diff=lfs merge=lfs -text
```

## 3. Workflow ของ artist ต่อหนึ่งชิ้นส่วน

1. **Model / sculpt**
    - LightWave: model, ตั้งหน่วยเป็นเมตร, export FBX (หรือ OBJ) ไปที่ `assets-src/lightwave/export/`
    - 3D-Coat: sculpt → ห้อง Retopo → UV → bake normal/AO/curvature จาก sculpt → export FBX low-poly + แมพ PNG
2. **นำเข้า Blender** (`assets-src/blender/<system>.blend`)
    - import, apply scale/rotation, ตรวจ normal, แปลง n-gon เป็นสามเหลี่ยมถ้าจำเป็น
    - ตั้งชื่อ object เป็น `<system>.<part>.<side>`
    - เพิ่ม custom properties: `aid`, `system`, `layer`, `pick`
    - Material: Principled BSDF ต่อแมพที่ bake แล้ว (node normal map ตั้งเป็น Tangent Space)
    - LOD: ใส่ LOD1/LOD2 ไว้ใน collection `LOD1`, `LOD2` (ใช้ Decimate modifier ได้)
3. **รัน build** (`tools/build.sh <system>`) แล้วดูผลใน debug viewer ของแอป หรือที่ https://gltf-viewer.donmccurdy.com
4. **เพิ่ม/อัปเดต** ชิ้นส่วนใน `content/parts.json` สคริปต์ `check_ids.py` จะทำให้ build ล้มถ้าไม่มี `aid`

Checklist ก่อน commit: หน่วยเป็นเมตร, +Y ขึ้นหลัง export, ไม่มี n-gon, UV อยู่ใน 0–1, texture ขนาดยกกำลังสอง, normal map เป็น PNG ไม่ใช่ JPG, `aid` ไม่ซ้ำ, ตั้ง layer แล้ว

## 4. Export จาก Blender แบบ headless (`tools/export_gltf.py`)


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
ตรวจชื่อ option กับคู่มือ Blender เวอร์ชันที่ใช้ (หน้า `scene_gltf2`) เพราะบางตัวเปลี่ยนชื่อไปในแต่ละ release

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
หมายเหตุ:
- `prune` อาจลบ node ที่มันคิดว่าไม่ได้ใช้ ให้ตรวจว่า `extras` และ node จุดยึดที่ว่างเปล่ายังอยู่ (ทำจุดยึด label เป็น mesh เล็กๆ หรือตรวจ flag ของ prune)
- `simplify` ต้องไม่รวมชิ้นส่วนที่แยกกันเข้าด้วยกัน ให้รันทีละแพ็กและตรวจ silhouette ด้วยตา
- ถ้า spike พบว่า flutter_scene อ่าน meshopt หรือ KTX2 ไม่ได้ ให้ตัดสองขั้นตอนนั้นออกและใช้ texture แบบ `webp` แทนไปก่อน

## 6. ตั้งค่าแอป Flutter

```bash
flutter --version            # 3.47+
flutter pub add flutter_scene
```
- **เปิด Flutter GPU** บน iOS/Android ด้วย key ต่อแพลตฟอร์มตามที่ README ของ flutter_scene อธิบาย (Info.plist / AndroidManifest) บน desktop ใช้ `--enable-flutter-gpu` บนเว็บไม่ต้องใช้ flag
- pin `flutter_scene` เป็นเวอร์ชันตรงตัวใน `pubspec.yaml` เพราะ minor release อาจ breaking
- ห่อการเรียก 3D ทั้งหมดไว้หลัง Dart interface เดียว เพื่อให้สลับตัวเรนเดอร์ได้:

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

### Build สำหรับเว็บ
```bash
flutter build web --wasm     # also emits a JS fallback
```
- โฮสต์ด้วย header `Cross-Origin-Opener-Policy: same-origin` และ `Cross-Origin-Embedder-Policy: credentialless` (จำเป็นสำหรับการเรนเดอร์แบบ multithread)
- เบราว์เซอร์บน iOS ใช้ JS fallback เป็นค่าเริ่มต้น Safari 26.2+ เลือก opt in ได้ด้วย `wasmAllowList: { webkit: true }` ใน `flutter_bootstrap.js` ทดสอบทั้งสองแบบ

## 7. CI (GitHub Actions, โครงร่าง)
1. ทำงานเมื่อมีการเปลี่ยนใน `assets-src/**` หรือ `content/**`
2. ติดตั้ง Blender (headless), Node, gltf-transform, KTX-Software, glTF Validator
3. สำหรับ `.blend` แต่ละไฟล์ที่เปลี่ยน: export → optimize → validate → `check_ids.py`
4. `make_manifest.py` → อัปโหลดแพ็ก + manifest ขึ้น CDN ภายใต้ path ที่มี version
5. แสดงขนาดแพ็กและจำนวน triangle ใน job summary เพื่อให้เห็นการโตของขนาดในทุก PR

## 8. ลำดับการตั้งค่า (3 สัปดาห์แรก)
| สัปดาห์ | งาน |
|---|---|
| 1 | Repo + LFS; `.blend` หนึ่งไฟล์ (โครงกระดูก, แขนส่วนบน) พร้อมชื่อ/ID; สคริปต์ export + optimize รันบนเครื่องได้ |
| 1–2 | แอป spike ของ Flutter: โหลดแพ็ก, หมุนกล้อง, เลือกชิ้น, layer, clip plane, label บน iPad + Safari + Android |
| 2 | วัดผล (fps, หน่วยความจำ, เวลาโหลด, ขนาด) แล้วตัดสินใจระหว่าง flutter_scene กับแผนสำรอง |
| 3 | CI, manifest, ดาวน์โหลด offline, schema ของฐานข้อมูลเนื้อหา |
