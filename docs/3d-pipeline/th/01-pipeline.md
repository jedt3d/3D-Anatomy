# 01. Pipeline ที่ควรสร้าง

_อัปเดตล่าสุด: 2026-11-27 สถานะ: ข้อเสนอ รอผล spike_

## 1. เป้าหมาย
ส่งมอบ asset 3D กายวิภาคชุดเดียวที่:
- เรนเดอร์ได้บน iPad (ก่อน), Web (Flutter Web), Android (ภายหลัง)
- ดาวน์โหลดแยกตามระบบร่างกายเพื่อใช้ offline ได้
- ทุกชิ้นส่วนเลือกได้ มี label ค้นหาได้ และแบ่ง layer ได้
- build ใหม่อัตโนมัติได้เมื่อ artist แก้ไฟล์ต้นฉบับ

## 2. รูปร่างของ pipeline

```
 SOURCE (artists)                HUB                    BUILD (script / CI)                  RUNTIME
 ──────────────────              ───────                ───────────────────                  ───────
 LightWave 2026 ──FBX/OBJ──┐
                           ├──► Blender (.blend) ──GLB──► gltf-transform ──► packs/*.glb ──► Flutter app
 3D-Coat ─sculpt→retopo→bake┘    names, IDs,             dedup, prune, weld   manifest.json    flutter_scene
                                 materials, LODs,        simplify (LOD)       + content DB     (iPad/Android:
 Blender (direct modelling) ────► custom properties      meshopt              (JSON/SQLite)     Impeller;
                                                         KTX2 (ETC1S/UASTC)                      Web: WebGL2)
                                                         glTF Validator gate
```

กฎ: **มีแค่ Blender ที่เขียนไฟล์ GLB** โปรแกรมต้นทางทุกตัวส่ง geometry และแมพที่ bake แล้วให้ Blender ทำให้มีที่เดียวที่จัดการชื่อ, ID, สเกล, แกน และ material ให้สอดคล้องกัน

## 3. บทบาทของแต่ละโปรแกรม

### LightWave 3D (2026 ออกเดือน มิ.ย. 2026, Windows/macOS)
- ใช้กับ: งาน modelling แบบ hard-surface/base ที่ทีมคุ้นเคย, layout, เรนเดอร์ภาพคุณภาพสูงสำหรับการตลาด
- ส่งต่อด้วย: **FBX** (เก็บ hierarchy และชื่อไว้) หรือ **OBJ** (geometry อย่างเดียว) ข่าวเปิดตัว LightWave 2026 ไม่ได้พูดถึงการ export glTF หรือ USD จึงไม่ควรพึ่งมันเป็นตัวส่งมอบ
- ระวัง: สเกลหน่วย (ตั้ง 1 unit = 1 m ตอน export หรือแก้ใน Blender), Y-up กับ Z-up และ n-gon (แปลงเป็นสามเหลี่ยมหรือใช้ quad ล้วนก่อนส่งต่อ)
- หมายเหตุ: บน Mac ของคุณมีโฟลเดอร์ `~/GitHub/lightwave3d-dev` ถ้าเป็นงานพัฒนาปลั๊กอิน LightWave ก็ทำตัว export จาก LightWave → glTF โดยตรงได้ในอนาคต แต่ไม่จำเป็นสำหรับ v1

### 3D-Coat
- ใช้กับ: sculpt แบบ organic (กล้ามเนื้อ, อวัยวะ, รายละเอียดผิว) แล้วทำ **retopology** ให้เป็น mesh low-poly ที่สะอาด และ **bake** แมพ normal, AO และ curvature จาก sculpt ความละเอียดสูง
- ส่งต่อด้วย: mesh low-poly (FBX/OBJ) + แมพที่ bake แล้ว (PNG 16-bit สำหรับ normal map, PNG 8-bit สำหรับแมพอื่น)
- ในโค้ดของ 3D-Coat มี glTF exporter แต่ให้ Blender เป็นตัว export ตัวเดียว

### Blender (ศูนย์กลาง)
- เป็น source of truth หนึ่งไฟล์ต่อระบบร่างกาย: `msk_upper_limb.blend`, `skeleton.blend` ฯลฯ
- เก็บ: ชื่อสุดท้าย, ID ของชิ้นส่วน (custom properties), เลข layer, material แบบ PBR (Principled BSDF, metal/rough), mesh LOD, สเกล และทิศทาง
- export เป็น GLB โดยเปิด **custom properties → glTF `extras`** และ **Apply Modifiers**

## 4. กฎของ asset (เริ่มจากนี้ แล้วปรับหลัง spike)

อ้างอิงจาก Khronos 3D Commerce realtime guidelines (v1.0.0, 2020) แล้วขยายให้เหมาะกับแอปที่แสดงทั้งร่างกาย:

| รายการ | กฎ |
|---|---|
| หน่วย / แกน | 1 unit = 1 m; +Y ขึ้น; ร่างกายหันไปทาง +Z (convention ของ glTF) |
| Triangles | แสดงพร้อมกันไม่เกิน 1.5M บน iPad; เป้าต่อแพ็กระบบ 150k–500k (LOD0) |
| LOD | LOD0 (เต็ม), LOD1 (~50%), LOD2 (~20%) ต่อระบบ |
| Texture | ขนาดยกกำลังสอง; ค่าเริ่มต้น 2K, 4K เฉพาะ close-up สำคัญ; base colour และ emissive เป็น sRGB ที่เหลือเป็น linear |
| Normal map | convention แบบ OpenGL, tangent แบบ MikkTSpace, ห้ามใช้ JPG |
| Material | PBR metal/rough; ใช้ material ให้น้อยที่สุด; ชิ้นที่โปร่งใสแยก material ของตัวเอง |
| UV | unwrap ครบ, อยู่ใน 0–1, ไม่ซ้อนกัน (ยกเว้น mirror โดยตั้งใจพร้อม AO แยก) |
| การตั้งชื่อ | `a–z 0–9 _ -` ขึ้นต้นด้วยตัวอักษร ไม่มีช่องว่าง (ดูหัวข้อ 5) |
| ขนาดแพ็ก | ไม่เกิน 30 MB ต่อแพ็กระบบหลังบีบอัด |

## 5. ตัวตนของชิ้นส่วน, label และ layer

ไฟล์ GLB เก็บแค่ **geometry + ID ที่คงที่** ส่วนทุกอย่างที่คนอ่านอยู่ในฐานข้อมูลเนื้อหา

- **ชื่อ node:** `<system>.<part>.<side>` เช่น `msk.biceps_brachii.l` เมื่อ ship แล้วห้ามเปลี่ยนชื่อ (จะทำให้โน้ตและ quiz ที่บันทึกไว้เสีย)
- **custom properties ของแต่ละ object ใน Blender → `extras` ใน GLB:**

```json
{ "aid": "biceps_brachii_l", "system": "muscular", "layer": 3, "pick": true }
```

- **ฐานข้อมูลเนื้อหา (JSON ใน repo → SQLite ในแอป):** ใช้ `aid` เป็น key:
  ชื่อ (EN, TH, Latin), รหัสมาตรฐาน (TA2, FMA, SNOMED CT body structure), origin/insertion/innervation/blood supply, โน้ตสำหรับ artist (รูปทรง, landmark), จุดยึด label, ชิ้นส่วนที่เกี่ยวข้อง, ข้อ quiz
- **Layer:** 0 ผิวหนัง, 1 fascia/ไขมัน, 2 กล้ามเนื้อชั้นตื้น, 3 กล้ามเนื้อชั้นลึก, 4 เอ็น/หลอดเลือด/เส้นประสาท, 5 กระดูก, 6 อวัยวะ ใช้ควบคุมการลอกชั้นและ x-ray
- แอป companion บนมือถือใช้แค่ฐานข้อมูลเนื้อหา ไม่ต้องมี 3D สำหรับโน้ตสั้นและการทบทวน

## 6. การแพ็กและการใช้งาน offline
- GLB หนึ่งไฟล์ต่อระบบร่างกายและ LOD: `skeleton.lod0.glb`, `skeleton.lod1.glb`, ...
- `manifest.json`: pack id, version, LOD, ขนาด byte, SHA-256, เวอร์ชันฐานข้อมูลเนื้อหาที่ต้องใช้
- iPad/Android: ดาวน์โหลดลง app support dir ตรวจ hash แล้วค่อยโหลด อัปเดตเฉพาะแพ็กที่ hash เปลี่ยน
- เว็บ: Cache Storage (service worker) หรือ OPFS ใช้ manifest เดียวกัน
- โฮสต์บน CDN (เช่น Cloudflare R2 หรือ S3 + CloudFront) เสิร์ฟ `.glb` ด้วย cache header ยาวและ path ที่มี version
- ไม่บังคับ: export USDZ ของโมเดลที่เลือกไว้สำหรับ "View in AR" บน iOS (AR Quick Look) ไม่ใช่ฟอร์แมต runtime

## 7. Spike: ผ่าน/ไม่ผ่าน ก่อนจะ commit กับ flutter_scene
ใช้แพ็กจริงหนึ่งชุด (โครงกระดูก + กล้ามเนื้อแขนส่วนบน, ~200–400 ชิ้น, ~1M tris, texture 2K) ต้องผ่านบน iPad รุ่นพื้นฐาน (A-series), มือถือ Android ระดับกลาง และ Safari บน iPad (Flutter Web):

1. โหลด GLB ที่ใช้ meshopt + KTX2 ได้ ถ้าไม่ได้ ให้ fallback เป็น geometry ไม่บีบอัด + PNG/WebP แล้ววัดต้นทุนที่เพิ่ม
2. หมุนกล้อง 60 fps บน iPad; ไม่ต่ำกว่า 30 fps บน Android ระดับกลางและบนเว็บ
3. แตะ → raycast เลือกชิ้นที่ถูกต้อง และคืนค่า `aid` จาก `extras`
4. ไฮไลต์/outline, ซ่อน, แยกดู และปรับความโปร่งใสตาม layer โดยเรียงลำดับความโปร่งใสถูกต้อง
5. clipping plane หนึ่งระนาบ (ภาพตัดขวาง) ผ่าน material `.fmat` แบบ custom
6. widget label ของ Flutter ยึดกับจุดยึด 3D ขณะหมุนกล้อง
7. โหลดแพ็กจากไฟล์ในเครื่อง (iPad) และจาก cache (เว็บ)
8. หน่วยความจำ GPU คงที่หลังโหลด/ปลดแพ็ก 10 รอบ (issue #285 ของ flutter_scene บอกว่ายังไม่มีระบบคืนหน่วยความจำ GPU)

ถ้าข้อ 3–5 ไม่ผ่านและแก้ไม่ได้ในไม่กี่วัน ให้เปลี่ยน viewport เป็น three.js (WebView บนเครื่อง, ในหน้าเว็บบนเว็บ) โดย asset pack และ UI ของ Flutter ไม่เปลี่ยน

## 8. หมายเหตุเรื่องการส่งมอบบนเว็บ
Flutter Web build เป็น Wasm ได้ (`flutter build web --wasm`) แต่ตามเอกสาร Flutter (อัปเดต 2026-11-11) **เบราว์เซอร์บน iOS จะ fallback ไปใช้ build แบบ JS (dart2js + CanvasKit) เป็นค่าเริ่มต้น** โดย Safari 26.2+ เลือก opt in ได้ผ่าน `wasmAllowList` ส่วน flutter_scene มี backend WebGL2 ของตัวเองและทำงานได้ทั้งบน CanvasKit และ Skwasm เรื่องนี้จึงกระทบขนาดและความเร็วในการโหลด ไม่ได้กระทบฟีเจอร์ ส่วน Impeller เองไม่ได้รันบนเว็บ
