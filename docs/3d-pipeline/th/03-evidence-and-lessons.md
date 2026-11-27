# 03. หลักฐาน: คนอื่นทำอย่างไรและได้บทเรียนอะไร

_อัปเดตล่าสุด: 2026-11-27 ทุกข้อมูลมีแหล่งอ้างอิงและวันที่ "ยังไม่ยืนยัน" หมายถึงรอบนี้อ่านแหล่งข้อมูลต้นทางไม่ได้_

## 1. flutter_scene (ตัวเลือกหลักของเรา)

**ตอนนี้คืออะไร** "A realtime 3D engine for Flutter, built on Flutter GPU and Impeller" โดย Brandon DeRosier ซึ่งเป็นคนสร้าง Flutter GPU ด้วย (fscene.dev) License MIT บน GitHub มี ~760 stars, 82 forks, 22 open issues, 10 open PRs (อ่านเมื่อ 2026-11-27) เวอร์ชันล่าสุดบน pub.dev: 0.24.x (0.24.3 ลงวันที่ 2026-10-09; หน้าเอกสารแสดง 0.24.6) ต้องใช้ Flutter 3.47+ แพลตฟอร์ม: iOS, Android, Web, macOS, Windows, Linux

**ฟีเจอร์ที่สำคัญกับเรา (README):** import glTF (.glb, .gltf), PBR, image-based lighting, LOD, instancing, material GLSL แบบ custom `.fmat` (จำเป็นสำหรับ clipping/x-ray), **raycast picking**, orbit camera, **Flutter widget บนพื้นผิว 3D**, semantics สำหรับ screen reader, hot reload ของโมเดลและ shader, editor บน desktop

ที่ไม่ได้กล่าวถึง: clipping plane, รายละเอียดการเรียงลำดับความโปร่งใส, การรองรับ meshopt/KTX2 → ต้องทดสอบใน spike

**ประวัติ (ทำไมบทความเก่าถึงพูดไม่ตรงกัน):**
| วันที่ | สถานะ | แหล่ง |
|---|---|---|
| ส.ค. 2024 | Flutter GPU + flutter_scene ยังเป็น preview ใช้ได้เฉพาะ main channel ต้องใช้ Impeller และเว็บยังไม่ใช่เป้าหมาย | บล็อก flutter.dev "Getting started with Flutter GPU" (2024-08-06); Flutter Force Weekly 03a (2024-08-11) |
| 2026 | ใช้ได้บน Flutter 3.47 stable; เว็บใช้ backend WebGL2 ของตัวเอง; ยังก่อน 1.0 และ minor release อาจ breaking | pub.dev flutter_scene, README บน GitHub |

**ใครเคยสร้างงานด้วยมันบ้าง:**
- **KBTG (กสิกร บิซิเนส-เทคโนโลยี กรุ๊ป)**: คุณ Amorn Apichattanakul, "Bring 3D to Life in Flutter with flutter_scene and Flutter GPU" (2026-10-14) ทำ 3D hotel tour และเกาะ โดยเน้นว่า "เอฟเฟกต์ 3D แต่ละอย่างมีต้นทุนเท่าไรบนมือถือ" อ่านบทความเต็มไม่ได้ (Medium บล็อก) ควรไปอ่านโดยตรง และควรติดต่อเพราะ KBTG อยู่ในไทย
- **Showcase demo** ของผู้สร้าง: Dashsurfers (endless runner) และ Dashmap (แผนที่โลก 3D แบบ streaming) เว็บไซต์ระบุว่ามีตัวอย่าง ~40 ตัว
- **การทดลองจากชุมชน**: "flutter_scene experiments" (เมือง Chongqing จิ๋วจากข้อมูล OpenStreetMap; ฝูงหนอนแบบ real-time) ระบุว่า "ดูบนเบราว์เซอร์ laptop ดีที่สุด"
- ผม **ไม่พบแอปการแพทย์/กายวิภาคที่ ship แล้ว** บน flutter_scene เราน่าจะเป็นกลุ่มแรกๆ

**บทเรียนจาก open issues (GitHub อ่านเมื่อ 2026-11-27):**
| Issue | บทเรียนสำหรับเรา |
|---|---|
| #351 (2026-08-21) เฟรมเรตตก ~3 เท่าในบาง branch เทียบกับ 0.20.0 ด้วย scene เดียวกัน | pin เวอร์ชัน; benchmark ทุกครั้งที่อัปเกรดด้วย scene ของเราเอง |
| #285 (2026-08-01) หน่วยความจำ GPU ยังไม่มีระบบ ownership/การนับ/การคืน | การโหลด/ปลดแพ็กบน iPad อาจรั่ว; ทดสอบใน spike (ข้อ 8) |
| #234 (2026-07-12) เงาจาก directional light เป็นลายบน Android/มือถือเท่านั้น | หลีกเลี่ยงเงาแบบ dynamic; ใช้ AO ที่ bake ไว้ (ซึ่งเราต้องการอยู่แล้ว) |
| #354, #355 (2026-08-23) shader bundle ถูกแพ็กซ้ำสองครั้ง; ไฟล์ backend เก่าถูก ship ไปด้วย | ขนาดแอปอาจใหญ่เกินจำเป็น; ตรวจขนาด IPA/APK |
| #382 (2026-09-03) texture ของ widget บนพื้นผิวทำให้สีมืดถูกกด | อย่าวางตัวหนังสือบนพื้นผิว 3D; วาด label เป็น overlay ของ Flutter ตามปกติ |
| #314 Android emulator แครช (SwANGLE) | ทดสอบบนเครื่อง Android จริง |

**สรุป:** ฟีเจอร์ตรงกับ viewer กายวิภาค และ engine ยังพัฒนาอย่างต่อเนื่อง ความเสี่ยงคือความ mature (ก่อน 1.0, มีผู้เขียนหลักคนเดียว, ประสิทธิภาพถดถอย, หน่วยความจำ GPU) และยังไม่มีแอปการแพทย์ที่รู้จัก นี่คือเหตุผลที่ spike เป็นด่านตัดสิน และที่ 3D ต้องอยู่หลัง interface เดียว

## 2. วิธีอื่นที่คนใช้ใส่ 3D ใน Flutter

| วิธี | หลักฐาน | บทเรียน |
|---|---|---|
| **model_viewer_plus** (WebView + `<model-viewer>` ของ Google) | pub.dev 1.10.0, ~49k ดาวน์โหลด ต้องเปิด cleartext localhost บน Android 9+, ตั้ง flag ใน Info.plist บน iOS, ต้องมี CORS header บนเว็บ; "AR View อาจใช้ไม่ได้บน iOS 16+"; คุณภาพการเรนเดอร์ต่ำบนมือถือบางรุ่น (issue #44) | ดีสำหรับ "โชว์โมเดลสินค้าหนึ่งชิ้น" แต่จำกัดเกินไปสำหรับการเลือกชิ้นส่วนหลายร้อยชิ้น, layer, clipping |
| **thermion** (engine Filament สำหรับ Flutter) | GitHub nmfisher/thermion: iOS, Android, macOS, Windows, Web/WASM; Apache-2.0; ~220 stars; thermion_dart 0.5.0 (2026-08-20); WASM แบบ multithread ต้องมี COOP/COEP | ตัวเรนเดอร์แข็ง (Filament) แต่โปรเจกต์เล็ก ดูแลหลักโดยคนเดียว |
| **ฝัง Unity ใน Flutter** | flutter_unity_widget: release ล่าสุด 2024-01-08 ถูกระบุว่า **discontinued** บน pub.dev; บนเว็บ widget ของ Flutter ที่อยู่เหนือ Unity รับการแตะไม่ได้ flutter_embed_unity 2.0.0 (2026-04-13): Android/iOS เท่านั้น **ไม่รองรับเว็บ**, Unity ได้ instance เดียว และค้างในหน่วยความจำหลัง dispose | การฝัง game engine ใน Flutter เปราะบาง และทำให้เป้าหมายเว็บของเราพัง |

## 3. ใช้ game engine เป็นทั้งแอป

| Engine | หลักฐาน | บทเรียน |
|---|---|---|
| **Godot 4** | export เว็บต้องใช้ WebAssembly + WebGL 2.0 (เอกสาร Godot) release build สำหรับเว็บ ~6.2 MB สำหรับ 4.5.2, ~6.3 MB สำหรับ 4.6.2; โตขึ้น ~15% จาก 4.3 ไป 4.4; ผู้ทดสอบระบุว่า "เวลาโหลดของ Godot นานมาก (เทียบกับ Unity)" (JohannesDeml/Godot-Web-LoadingTest) มีกระทู้ในฟอรัมรายงานว่า HTML export แครชแบบสุ่มบนอุปกรณ์ iOS (2025) | engine ดี แต่เว็บบน iPad คือจุดอ่อน และเราต้องสร้าง UI ทั้งหมด (ภาษาไทย, ฟอร์ม, IAP) ใหม่ใน Godot บวกแอปมือถือแยกอีกตัว |
| **Unity** | build เว็บใหญ่; เงื่อนไข license; ปัญหาการฝังตามข้างบน | เกินความจำเป็นสำหรับ mesh กายวิภาคที่ส่วนใหญ่อยู่นิ่ง |

## 4. แพลตฟอร์มกายวิภาคที่มีชื่อเสียงทำอย่างไร

| ผลิตภัณฑ์ | สิ่งที่มีบันทึกไว้ | บทเรียน |
|---|---|---|
| **Google Body → ZygoteBody** | Google Body เปิดตัว 2010-12-15 ใช้ JavaScript + WebGL ไม่ต้องใช้ปลั๊กอิน; Google ปิดเว็บ 2011-10-13; Zygote เปิดใหม่ 2012-01-09 และเปิดซอร์สแกนหลักเป็น open-3d-viewer ถอด layer หรือทำให้โปร่งใสได้; ชิ้นส่วนมี label และค้นหาได้ (Wikipedia) | layer + ความโปร่งใส + label + การค้นหา คือชุดฟีเจอร์หลัก และรันบน WebGL ธรรมดามาตั้งแต่ 2010 เราไม่ต้องใช้ game engine เพื่อทำสิ่งนี้ |
| **BioDigital Human** | เปิดตัว 2011 เป็นร่างกาย 3D บนเว็บ; "หนึ่งในระบบแรกๆ ที่ใช้ WebGL"; รันในเบราว์เซอร์ไม่ต้องใช้ปลั๊กอิน; ผู้ใช้กว่า 1 ล้านคน; มี API (Wikipedia) | 3D กายวิภาคแบบ web-first เป็นธุรกิจที่พิสูจน์แล้ว คุณค่าของเขาอยู่ที่ฐานข้อมูลเนื้อหาและ API ไม่ใช่ตัวเรนเดอร์ |
| Complete Anatomy, Visible Body ฯลฯ | ไม่มีเอกสารสาธารณะเรื่อง stack การเรนเดอร์ในแหล่งที่ผมอ่านได้ | ยังไม่ยืนยัน จึงไม่ใช้เป็นหลักฐาน |

## 5. เครื่องมือสร้าง asset

| เครื่องมือ | หลักฐาน | บทเรียน |
|---|---|---|
| **LightWave 2026** | ข่าวเปิดตัว 2026-06-15 (CG Channel): Windows 10+/macOS 14.1+, £795; ฟีเจอร์เน้น VFX/modelling/เรนเดอร์ (MotoRig, Fracture, RiPR 2, preview Gaussian splat) ไม่มีการพูดถึง export glTF/USD กระทู้ฟอรัม Reallusion (2025-12-26) มีผู้ใช้ขอให้กลับมามีช่องทาง export ไป LightWave | ใช้ LightWave เป็นต้นทางงาน modelling; ส่งต่อเป็น FBX/OBJ เข้า Blender |
| **3D-Coat** | เอกสาร API มีคลาส `gltf::gltfExporter` (เอกสารสร้างเมื่อ 2025-12-25) | มี glTF export ในโค้ด แต่ยังให้ผ่าน Blender เพื่อใช้ convention เดียว |
| **Blender** | มี glTF 2.0 importer/exporter อย่างเป็นทางการในคู่มือ รวมถึง custom properties → extras | ศูนย์กลางมาตรฐานโดยพฤตินัยของ pipeline glTF |
| **glTF Transform CLI** | v4.5.0: `inspect`, `optimize`, `dedup`, `prune`, `weld`, `simplify`, `meshopt`, `draco`, `etc1s`, `uastc`, `webp`… เอกสารบอกว่าค่าเริ่มต้นของ `optimize` "อาจไม่เหมาะกับทุก scene" ให้รัน `inspect` ก่อน | เขียนสคริปต์เป็นขั้นตอนแยก อย่าพึ่ง optimize ครั้งเดียวจบ |
| **Khronos 3D Commerce realtime guidelines** v1.0.0 (2020-10-20) | ไม่เกิน 100k triangles และควรเล็กกว่า 5 MB ต่อ asset สินค้าหนึ่งชิ้น; texture 1K/2K ขนาดยกกำลังสอง; PBR metal/rough; sRGB เฉพาะ base colour/emissive; normal แบบ OpenGL, MikkTSpace; UV อยู่ใน 0–1; ชื่อใช้ a–z0–9_-; 1 unit = 1 m, +Y ขึ้น | เป็นกฎพื้นฐานที่ดี แต่แพ็กของเราใหญ่กว่าสินค้าหนึ่งชิ้น จึงตั้งงบต่อแพ็กแทน |

## 6. ความจริงของ Flutter Web
เอกสาร Flutter (อัปเดต 2026-11-11): `flutter build web --wasm` ต้องใช้ WasmGC และฟีเจอร์ Wasm ใหม่ๆ; Chromium 137+ รัน Wasm เป็นค่าเริ่มต้น; **เบราว์เซอร์ทุกตัวบน iOS จะ fallback ไปใช้ build แบบ JS เป็นค่าเริ่มต้น**; Safari 26.2+ เลือก opt in ได้ การเรนเดอร์แบบ multithread ต้องมี header COOP/COEP ส่วน `dart:html`/`package:js` ใช้กับ Wasm ไม่ได้ ให้ใช้ `package:web` และ `dart:js_interop`

**บทเรียน:** บน Safari ของ iPad ให้คาดว่าจะได้ build แบบ JS + CanvasKit ถ้าไม่ opt in เผื่องบสำหรับการโหลดครั้งแรกที่ใหญ่ขึ้น และทดสอบทั้งสอง build

## 7. ความหมายสำหรับเรา
1. Flutter + flutter_scene เป็นตัวเลือกแรกที่ถูกต้อง เพราะตรงกับ stack ของผู้ใช้และครอบคลุม iPad, Android และ Web ด้วยโค้ดชุดเดียว ยังไม่มีใคร ship แอปกายวิภาคบนมันเท่าที่ผมหาเจอ จึงต้องพิสูจน์ด้วย spike 2 สัปดาห์
2. เก็บ 3D ไว้หลัง `AnatomyViewport` ถ้า spike ไม่ผ่าน three.js คือแผนสำรอง โดย asset pack ไม่เปลี่ยน
3. อย่าฝัง Unity หรือย้ายไป Godot: หลักฐานแสดงว่าเว็บบน iPad อ่อน และการฝังเปราะบาง
4. จุดแข็งที่แท้จริงของเรา เหมือนของ BioDigital คือ **ฐานข้อมูลเนื้อหา** (ID, ชื่อ, ความสัมพันธ์, โน้ต) และ asset ที่สะอาดและตั้งชื่อดี ลงทุนตรงนั้นก่อน
5. หลีกเลี่ยงเงาแบบ dynamic และตัวหนังสือบน 3D ใช้ AO ที่ bake ไว้และ overlay ของ Flutter แทน
6. pin เวอร์ชัน และ benchmark ทุกครั้งที่อัปเกรด engine ด้วย scene ของเราเอง

## แหล่งอ้างอิง (เข้าถึงเมื่อ 2026-11-27)
- flutter_scene: https://pub.dev/packages/flutter_scene · https://github.com/bdero/flutter_scene · https://github.com/bdero/flutter_scene/issues · https://fscene.dev/
- KBTG article: https://medium.com/kbtg-life/bring-3d-to-life-in-flutter-with-flutter-scene-and-flutter-gpu-068c9421470a (teaser via https://flutterx.com/bring-3d-to-life-in-flutter-with-flutter-scene-and-flutter-gpu-2026-10-14)
- flutter_scene experiments: https://sourav-sonkar.github.io/flutter_scence_practice/
- Flutter GPU blog (2024): https://flutter.dev/blog/getting-started-with-flutter-gpu · https://flutterforce.substack.com/p/flutter-force-weekly-03a
- Flutter Web Wasm: https://docs.flutter.dev/platform-integration/web/wasm
- thermion: https://github.com/nmfisher/thermion · https://pub.dev/packages/thermion_dart
- model_viewer_plus: https://pub.dev/packages/model_viewer_plus
- Unity in Flutter: https://pub.dev/packages/flutter_unity_widget · https://pub.dev/packages/flutter_embed_unity
- Godot: https://docs.godotengine.org/en/4.5/tutorials/export/exporting_for_web.html · https://github.com/JohannesDeml/Godot-Web-LoadingTest · https://forum.godotengine.org/t/game-crashes-randomly-on-ios-devices-html-export/114043
- Anatomy platforms: https://en.wikipedia.org/wiki/ZygoteBody · https://en.wikipedia.org/wiki/BioDigital
- LightWave 2026: https://www.cgchannel.com/2026/06/lightwave-digital-releases-lightwave-2026/ · https://discussions.reallusion.com/t/iclone-and-cc5-to-lightwave3d-2025-6/16230
- 3D-Coat glTF exporter class: https://3dcoat.com/files/docs/classgltf_1_1gltfExporter-members.html
- Blender glTF: https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html
- glTF Transform CLI: https://gltf-transform.dev/cli
- Khronos realtime asset guidelines: https://github.com/mlimper/3DC-Asset-Creation/blob/main/asset-creation-guidelines/RealtimeAssetCreationGuidelines.md
