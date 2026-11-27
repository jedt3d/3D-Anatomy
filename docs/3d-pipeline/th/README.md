# เอกสาร 3D Pipeline

_อัปเดตล่าสุด: 2026-11-27_

งานวิจัยและบันทึกการทำงานว่าโมเดล 3D กายวิภาคจะเดินทางจากโปรแกรมสร้างงาน (LightWave 3D, 3D-Coat, Blender) ไปเข้าแอป (Flutter บน iPad, Android และ Web) อย่างไร

| ไฟล์ | เนื้อหา |
|---|---|
| [00-initial-recommendation.md](00-initial-recommendation.md) | เปรียบเทียบ runtime รอบแรก (flutter_scene, thermion, three.js, Unity, Godot, Bevy) |
| [01-pipeline.md](01-pipeline.md) | pipeline ที่ควรสร้าง: เครื่องมือ, ฟอร์แมต, การบีบอัด, metadata, การแพ็ก, การใช้งาน offline |
| [02-setup-workflow.md](02-setup-workflow.md) | วิธีตั้งค่า: เวอร์ชันเครื่องมือ, โครงสร้าง repo, สคริปต์ export และ optimize, การตั้งค่า Flutter, CI, checklist สำหรับ artist |
| [03-evidence-and-lessons.md](03-evidence-and-lessons.md) | คนอื่นทำอย่างไร อะไรได้ผล อะไรพัง และมีความหมายอย่างไรกับเรา |

## สิ่งที่ตัดสินใจแล้ว

- **แอปเดียว ตัวเรนเดอร์เดียว:** ใช้ Flutter ทุกแพลตฟอร์ม (iPad, Android, Web) และใช้ **flutter_scene** สำหรับ 3D ไม่มี pipeline three.js แยกสำหรับเว็บ
- **ฟอร์แมต asset เดียว:** glTF 2.0 แบบ binary (**GLB**) ที่ export จาก **Blender** เท่านั้น LightWave และ 3D-Coat ส่งงานเข้า Blender
- **ด่านตัดสิน:** ต้องผ่าน spike 2 สัปดาห์ก่อนจะ commit จริง (ดู 01-pipeline.md หัวข้อ 7) three.js เป็นแค่แผนสำรองที่บันทึกไว้
- **ยังไม่ใช้ game engine เต็มตัว** (Godot/Unity) เหตุผลอยู่ใน 03-evidence-and-lessons.md

## คำศัพท์ที่ใช้
- **GLB**: glTF 2.0 แบบไฟล์เดียว มีทั้ง geometry, material, texture, โครงสร้าง node และข้อมูล custom
- **meshopt**: `EXT_meshopt_compression` การบีบอัด geometry ที่ถอดรหัสได้เร็ว
- **KTX2 / Basis**: `KHR_texture_basisu` texture แบบบีบอัดสำหรับ GPU ที่ยังเล็กอยู่แม้อยู่ในหน่วยความจำ GPU
- **LOD**: สำเนาของ mesh ที่ละเอียดน้อยลง ใช้ตอนซูมออก
- **Spike**: การทำ build ทดลองสั้นๆ แบบทิ้งได้ เพื่อตอบคำถามเสี่ยงข้อเดียว

_ต้นฉบับภาษาอังกฤษอยู่ที่ `docs/3d-pipeline/*.md`_
