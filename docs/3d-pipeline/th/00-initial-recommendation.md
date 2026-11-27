# ข้อเสนอ 3D Pipeline และ Runtime: แอป 3D Anatomy

_วันที่: 2026-11-27 เป้าหมาย: iPad ก่อน, Web (WASM) ถัดมา, Android ภายหลัง และแอป companion บนมือถือ stack ที่ต้องการ: Flutter_

> การตีความคำขอ: "LiveWeb 3D" หมายถึง **LightWave 3D** และ "Artisan ใช้ Godot" หมายถึง "หรือเราควรใช้ game engine อย่าง **Godot** แทน Flutter?"

## 1. ข้อเสนอในย่อหน้าเดียว

ให้ **Flutter เป็นตัวแอป** ต่อไป (navigation, label, โน้ต, quiz, ค้นหา, การซื้อ, ดาวน์โหลด offline, แอป companion บนมือถือ) **ไม่ต้อง** ย้ายทั้งผลิตภัณฑ์ไปไว้ใน game engine ให้วางส่วน 3D ไว้หลัง interface เดียว (`AnatomyViewport`) แล้วเลือกตัวเรนเดอร์หนึ่งในสองตัว โดยตัดสินจาก spike 2 สัปดาห์ด้วย asset จริง:

1. **flutter_scene** (ตัวเลือกหลักถ้าผ่าน): Flutter ล้วน, glTF, รันบน iOS/Android/Web
2. **three.js ภายในแอป** (แผนสำรองที่ปลอดภัย): WKWebView บน iPad, canvas ตรงๆ บน Flutter Web เป็น stack glTF ที่ mature ที่สุด (KTX2, meshopt, picking, clipping plane, outline)

ไม่ว่าทางไหนก็ใช้ **ตัวเรนเดอร์เดียวทุกแพลตฟอร์ม** ไม่มีแบบ "เว็บใช้ three.js มือถือใช้ Flutter" ถ้าใช้ flutter_scene โค้ด Dart ส่วน 3D ชุดเดียวกันจะรันบน iPad/Android (Impeller + Flutter GPU) และบน Flutter Web (build แบบ WASM/Skwasm ซึ่ง flutter_scene ใช้ backend WebGL2 ของตัวเอง เพราะ Impeller ไม่ได้รันบนเว็บ) ถ้าใช้แผนสำรอง three.js ตัว viewer JS ชุดเดียวกันจะรันใน WebView บน iPad/Android และในหน้าเว็บ แผนตั้งต้น: Flutter + flutter_scene ทุกที่ ใช้ three.js เฉพาะเมื่อ spike ไม่ผ่าน

ให้ **glTF 2.0 (GLB)** เป็นฟอร์แมตส่งมอบเพียงฟอร์แมตเดียว โดยมี **Blender เป็นศูนย์กลาง** ที่ทุกโปรแกรมต้นทาง (LightWave, 3D-Coat) ส่งงานเข้ามา วิธีนี้ทำให้เปลี่ยนตัวเรนเดอร์ได้ภายหลัง เพราะ asset pack ไม่ต้องเปลี่ยนตาม

ทำไมไม่ใช้ game engine: แอปนี้ส่วนใหญ่เป็น UI และเนื้อหาที่มีตัวหนังสือเยอะ ส่วน 3D ส่วนใหญ่เป็น mesh นิ่งๆ บวกกับ layer, การคลิกเลือก, ความโปร่งใส และภาพตัดขวาง Flutter แข็งเรื่องแรก ส่วนความต้องการด้าน 3D ไม่ได้หนัก game engine แข็งในเรื่องที่เราไม่ต้องใช้ (ฟิสิกส์, game loop) และอ่อนในเรื่องที่เราต้องใช้ (UI ซับซ้อน, accessibility, ภาษาไทย, ฟอร์ม, store/IAP, แอป companion บนมือถือ)

## 2. เปรียบเทียบตัวเลือก runtime

| ตัวเลือก | iPad | Web/WASM | Android | ความ mature / ความเสี่ยง | License | สรุป |
|---|---|---|---|---|---|---|
| **Flutter + flutter_scene** | Impeller + Flutter GPU | backend WebGL2 ของตัวเอง, รองรับ CanvasKit และ Skwasm | ได้ | ก่อน 1.0 (0.24.x, ต.ค. 2026) minor release อาจ breaking ต้องใช้ Flutter 3.47+ | MIT | **ตัวเลือกหลัก ต้องยืนยันใน spike** |
| **Flutter + thermion (Filament)** | arm64 | WASM (build แบบ multithread ต้องมี header COOP/COEP) | arm64 | โปรเจกต์เล็ก (~222 GitHub stars) ดูแลหลักโดยคนเดียว; thermion_dart 0.5.0 (ส.ค. 2026) | Apache-2.0 | engine ดี แต่เสี่ยงเรื่องคนดูแล |
| **Flutter + three.js (WebView / HtmlElementView)** | WKWebView; WebGPU ใน Safari 26 (fallback เป็น WebGL2) | เข้ากันโดยธรรมชาติ | WebView | ระบบนิเวศ glTF ที่ mature ที่สุด ต้นทุนคือ bridge JS↔Dart และหน่วยความจำของ WebView | MIT | **แผนสำรอง / ความเสี่ยงทางเทคนิคต่ำสุด** |
| **Flutter + ฝัง Unity** | flutter_embed_unity 2.0.0 (เม.ย. 2026) | ปลั๊กอินนี้ **ไม่รองรับเว็บ**; flutter_unity_widget เลิกพัฒนาแล้ว | ได้ | Unity ได้แค่ instance เดียว และค้างอยู่ในหน่วยความจำ | เงื่อนไขของ Unity | ไม่แนะนำ |
| **Godot 4 ทั้งแอป** | native ดี | WebGL2 เท่านั้น; ตัว engine ~6.2 MB สำหรับ release build 4.5.2; โหลดช้าและมีรายงานแครชบน iOS Safari ในฟอรัม | ดี | engine mature แต่อ่อนเรื่อง UI แบบแอป | MIT | ใช้เฉพาะถ้าผลิตภัณฑ์เน้น simulation หนัก |
| **Unity ทั้งแอป** | ดี | build เว็บใหญ่ | ดี | mature | เงื่อนไขของ Unity | เกินความจำเป็นสำหรับผลิตภัณฑ์นี้ |
| **Bevy** | ทำได้ | WASM/WebGPU | ทำได้ | ก่อน 1.0, Rust, API เปลี่ยนบ่อย | MIT/Apache | ไม่เหมาะกับทีมนี้ |

### สิ่งที่ spike ต้องพิสูจน์ (ผ่าน/ไม่ผ่าน)
ใช้ asset จริงหนึ่งชุด: โครงกระดูกทั้งตัว + กล้ามเนื้อหลัก, ชิ้นที่เลือกได้ ~200–400 ชิ้น, ~1M triangles, texture 2K
- หมุนกล้องได้ 60 fps บน iPad รุ่นพื้นฐาน (ชิป A-series ไม่ใช่แค่ชิป M) และไม่ต่ำกว่า 30 fps บน Android ระดับกลาง
- แตะเพื่อเลือกชิ้นส่วนตามชื่อ (ray picking), ไฮไลต์/outline, ซ่อน/แยกดู, ปรับความโปร่งใสตาม layer (x-ray)
- clipping plane หนึ่งระนาบ (ภาพตัดขวาง)
- หมุด label ที่ยึดกับจุด 3D โดย Flutter วาดซ้อนด้านบน
- โหลด GLB ที่ดาวน์โหลดแล้วจากดิสก์ (iPad) และจาก cache (เว็บ)
- เว็บ: ภาพแรกขึ้นภายใน ~5 วินาทีบนเน็ตทั่วไป และตรวจขนาด bundle

ถ้า flutter_scene ไม่ผ่านเรื่อง picking, การเรียงลำดับความโปร่งใส หรือ clipping ให้เปลี่ยน viewport เป็น three.js โดย asset pack และ UI ของ Flutter ยังเหมือนเดิม

## 3. Asset pipeline

```
LightWave 2026 ──FBX/OBJ──┐
3D-Coat (sculpt) ─retopo + bake─┐
                          ▼   ▼
                     Blender (hub, source of truth: .blend)
                     - naming, hierarchy, custom properties
                     - materials → glTF PBR (metal/rough)
                     - LODs per part
                          │ glTF exporter (GLB, + custom props as extras)
                          ▼
                 gltf-transform CLI (CI script)
                 - dedup / prune / weld
                 - simplify (LOD1, LOD2)
                 - EXT_meshopt_compression
                 - KTX2 textures (KHR_texture_basisu)
                 - glTF Validator gate
                          ▼
         Asset packs per system (skeleton.glb, muscles.glb, …)
         + manifest.json (version, hash, size, part IDs)
                          ▼
      CDN ──► iPad: app support dir │ Web: Cache Storage / OPFS
```

### แยกตามโปรแกรม
- **LightWave 2026** (ออกเดือน มิ.ย. 2026, Windows/macOS, £795): ข่าวเปิดตัวไม่ได้พูดถึงการ export glTF หรือ USD ให้ export เป็น **FBX หรือ OBJ** เข้า Blender ใช้ LightWave กับงานที่มันถนัด (modelling, เรนเดอร์ภาพสำหรับการตลาด) ไม่ใช่เป็นตัว export ไฟล์ส่งมอบ _ต้องตรวจตัวเลือก FBX export กับเวอร์ชัน LightWave ที่ใช้อยู่_
- **3D-Coat**: sculpt รูปทรง organic ความละเอียดสูง แล้ว retopo (low poly, UV สะอาด) และ bake แมพ normal/AO/curvature จากนั้น export mesh low-poly + แมพที่ bake แล้ว (FBX/OBJ + PNG) เข้า Blender ใน API ของ 3D-Coat มีคลาส glTF exporter อยู่ แต่ให้ใช้ Blender เป็นตัว export เพียงตัวเดียว เพื่อให้ทุกชิ้นใช้ convention เดียวกัน
- **Blender**: ที่เดียวที่เขียนไฟล์ GLB ตัว glTF exporter จะเขียน custom properties ลงใน `extras` เมื่อเปิด "Include → Custom Properties"

### การบีบอัดและ texture
- **Geometry: ใช้ meshopt แทน Draco** meshopt ถอดรหัสเร็วกว่าบนมือถือและเว็บ และบีบอัด animation ได้ด้วย Draco ได้ไฟล์เล็กกว่านิดหน่อยแต่ถอดรหัสช้ากว่า เลือกอย่างใดอย่างหนึ่ง three.js, Filament และ Godot อ่าน meshopt ได้ทั้งหมด (flutter_scene ต้องตรวจใน spike)
- **Texture: KTX2 / Basis Universal** ใช้ UASTC กับ normal map และ ETC1S กับ albedo/AO ยังคงถูกบีบอัดอยู่ในหน่วยความจำ GPU ซึ่งสำคัญที่สุดบน iPad
- **งบประมาณ (จุดเริ่มต้น):** แสดงพร้อมกันไม่เกิน 1.5M triangles บน iPad, texture 2K ต่อระบบ (4K เฉพาะภาพ close-up สำคัญ), GLB หนึ่งไฟล์ต่อระบบไม่เกิน 30 MB หลังบีบอัด
- **LOD:** export LOD0/1/2 ต่อระบบ โหลด LOD1 ก่อน แล้วสลับเป็น LOD0 ตอนซูม
- **USDZ:** ไม่บังคับ ใช้เฉพาะ "View in AR" บน iOS (AR Quick Look) ไม่ใช่ฟอร์แมต runtime

### โครงสร้างกายวิภาคและ metadata
ไฟล์ 3D เก็บเฉพาะ geometry และ ID ที่คงที่ ที่เหลืออยู่ในข้อมูลแยก
- **ชื่อ node:** `sys.part.side` เช่น `msk.biceps_brachii.L` ห้ามเปลี่ยนชื่อหลัง ship แล้ว
- **glTF extras ต่อ node:** `{ "id": "biceps_brachii_L", "system": "muscular", "layer": 3 }`
- **ฐานข้อมูลเนื้อหา (JSON หรือ SQLite แยกจาก GLB):** id → ชื่อ (EN/TH/Latin), รหัสมาตรฐาน (TA2 / FMA / SNOMED CT body structure), origin/insertion/innervation, โน้ต, ข้อ quiz, โน้ตสำหรับ artist (รูปทรง, landmark) ซึ่งแอป companion บนมือถือนำไปใช้ได้โดยไม่ต้องมี 3D
- **Layer:** เลข layer ต่อชิ้น (ผิวหนัง → กล้ามเนื้อชั้นตื้น → กล้ามเนื้อชั้นลึก → กระดูก → อวัยวะ) ใช้ควบคุมการลอกชั้นและ x-ray

### Offline
- manifest ระบุแพ็กพร้อม SHA-256 และขนาด แอปดาวน์โหลดทีละระบบ ตรวจ hash แล้วเก็บใน app support dir (iPad) หรือ Cache Storage/OPFS (เว็บ) และอัปเดตเฉพาะส่วนที่เปลี่ยนตาม version ของ manifest

## 4. แรงงานของทีม (ประมาณการ)
- Flutter + flutter_scene/three.js: dev Flutter หนึ่งคน + dev 3D/JS แบบ part-time หนึ่งคน; spike 2 สัปดาห์; viewport MVP 6–8 สัปดาห์
- Godot ทั้งแอป: ต้องสร้าง UI ทั้งหมดใหม่ใน Godot บวกแอปมือถือแยกอีกตัว ใช้แรงมากกว่าเพื่อได้ผลิตภัณฑ์เดียวกัน
- ระบบอัตโนมัติของ pipeline (สคริปต์ export ของ Blender + gltf-transform ใน CI): ~1 สัปดาห์ แล้วจะประหยัดเวลาทุกครั้งที่ asset เปลี่ยน

## 5. เรื่องที่ยังต้องตรวจสอบ
- flutter_scene: รองรับ meshopt/KTX2, picking, clipping, การเรียงลำดับความโปร่งใสหรือไม่ (spike)
- Godot 4.x บนเว็บ: เรื่อง threads/COOP-COEP และพฤติกรรมบน iOS Safari ล่าสุด (รอบนี้อ่านหน้าเอกสารไม่ได้)
- Safari 26 เปิด WebGPU เป็นค่าเริ่มต้นบน iPadOS: มาจากแหล่งรอง (VR.org, พ.ค. 2026) ยังไม่ได้ยืนยันจาก Apple
- ฟอร์แมต export ของ LightWave 2026 ในเวอร์ชันที่ติดตั้งอยู่

## แหล่งอ้างอิง (เข้าถึงเมื่อ 2026-11-27)
- flutter_scene on pub.dev: https://pub.dev/packages/flutter_scene and docs https://pub.dev/documentation/flutter_scene/latest/
- Flutter GPU intro (Aug 2024, now partly outdated): https://flutter.dev/blog/getting-started-with-flutter-gpu
- thermion: https://github.com/nmfisher/thermion · https://pub.dev/packages/thermion_dart
- flutter_embed_unity: https://pub.dev/packages/flutter_embed_unity · flutter_unity_widget (discontinued): https://pub.dev/packages/flutter_unity_widget
- Godot web export docs: https://docs.godotengine.org/en/4.5/tutorials/export/exporting_for_web.html · build sizes: https://github.com/JohannesDeml/Godot-Web-LoadingTest
- Godot forum, iOS web crashes: https://forum.godotengine.org/t/game-crashes-randomly-on-ios-devices-html-export/114043
- LightWave 2026 release: https://www.cgchannel.com/2026/06/lightwave-digital-releases-lightwave-2026/
- 3DCoat glTF exporter class: https://3dcoat.com/files/docs/classgltf_1_1gltfExporter-members.html
- Blender glTF exporter: https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html
- WebGPU / three.js status (secondary): https://vr.org/articles/webgpu-baseline-2026-three-js-webxr-default · https://web.dev/blog/webgpu-supported-major-browsers
