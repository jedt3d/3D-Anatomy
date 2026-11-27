# 05. Prototype

Prototype อยู่ในไฟล์ Figma เดียวกับ UI กด **Present** (▶) ในหน้า 03, 04 หรือ 05 แล้วเลือก flow ทางซ้าย หรือเปิดลิงก์ด้านล่างโดยตรง ปุ่ม "กลับ" บนแถบนำทางทุกหน้าย้อนไปหน้าก่อนหน้า และแท็บด้านล่างสลับหน้าได้จริง

## 1. Flow ที่เปิดได้

| Flow | เริ่มที่ | เส้นทางที่คลิกได้ |
|---|---|---|
| iPad · 1 Onboarding → Home | [เปิด](https://www.figma.com/proto/6wrlr1quIhFyyvoT0bJGgk?node-id=8-2&starting-point-node-id=8%3A2) | ยินดีต้อนรับ → เลือกเลนส์ → ภาษาและความยินยอม → หน้าหลัก |
| iPad · 2 Learn | [เปิด](https://www.figma.com/proto/6wrlr1quIhFyyvoT0bJGgk?node-id=8-320&starting-point-node-id=8%3A320) | หน้าหลัก → viewer → landmarks / จุดเกาะ / จุดคลินิก → แจ้งแก้ · คลัง → ค้นหา → landmark · การ์ดกะโหลก → FDI |
| iPad · 3 Spot exam | [เปิด](https://www.figma.com/proto/6wrlr1quIhFyyvoT0bJGgk?node-id=14-828&starting-point-node-id=14%3A828) | ตั้งค่า → คำถาม → เฉลย → ผลสอบ → ทบทวนข้อผิด / สอบใหม่ · เฉลย → แจ้งแก้ · ตั้งค่า → โหมดอาจารย์ |
| iPad · 4 Me | [เปิด](https://www.figma.com/proto/6wrlr1quIhFyyvoT0bJGgk?node-id=16-1735&starting-point-node-id=16%3A1735) | ฉัน → รายการที่ฉันแจ้ง · ฉัน → ข้อมูล offline → ดาวน์โหลด → alert ยืนยัน |
| มือถือ · Daily review | [เปิด](https://www.figma.com/proto/6wrlr1quIhFyyvoT0bJGgk?node-id=17-2&starting-point-node-id=17%3A2) | ทบทวนวันนี้ → การ์ดหน้า → เฉลย → ให้คะแนน → การ์ดถัดไป |
| มือถือ · Quick lookup | [เปิด](https://www.figma.com/proto/6wrlr1quIhFyyvoT0bJGgk?node-id=17-358&starting-point-node-id=17%3A358) | ค้นหา → รายละเอียดศัพท์ |
| เว็บ | [เปิด](https://www.figma.com/proto/6wrlr1quIhFyyvoT0bJGgk?node-id=18-270&starting-point-node-id=18%3A270) | ดัชนี → หน้าอ่าน Femur → viewer 3D บนเว็บ → กลับหน้าอ่าน |

ทั้งหมด 104 จุดที่คลิกได้ ใช้ Smart animate 300 ms สำหรับการไปหน้าถัดไป และ dissolve 200 ms สำหรับ sheet, alert และการสลับแท็บ

## 2. หน้าจอ iPad (1180 × 820)

### Onboarding
| | | |
|---|---|---|
| ![](img/ipad-01-welcome.webp) | ![](img/ipad-02-lens.webp) | ![](img/ipad-03-language.webp) |
| [01 ยินดีต้อนรับ](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=8-2) | [02 เลือกเลนส์วิชาชีพ](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=8-49) | [03 ภาษาและความยินยอม beta](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=8-132) |

### หน้าหลัก คลัง และค้นหา
| | | |
|---|---|---|
| ![](img/ipad-10-home.webp) | ![](img/ipad-11-library.webp) | ![](img/ipad-12-search.webp) |
| [10 หน้าหลัก](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=8-320) | [11 คลังกระดูก](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=11-204) | [12 ผลค้นหา](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=11-554) |

### Viewer 3D
| | | |
|---|---|---|
| ![](img/ipad-20-viewer.webp) | ![](img/ipad-21-landmarks.webp) | ![](img/ipad-22-attachments.webp) |
| [20 โครงกระดูก](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=11-759) | [21 Landmarks (Femur)](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=13-519) | [22 แผนที่จุดเกาะ](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=13-706) |
| ![](img/ipad-23-skull-fdi.webp) | ![](img/ipad-24-clinical.webp) | |
| [23 กะโหลกแยกชิ้นและฟัน FDI](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=13-870) | [24 จุดคลินิก (เลนส์พยาบาล)](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=13-1086) | |

### ฝึกสอบ spot และโหมดอาจารย์
| | | |
|---|---|---|
| ![](img/ipad-30-spot-setup.webp) | ![](img/ipad-31-spot-question.webp) | ![](img/ipad-32-spot-answer.webp) |
| [30 ตั้งค่า](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=14-828) | [31 คำถามจับเวลา](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=14-1151) | [32 เฉลย](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=14-1208) |
| ![](img/ipad-33-spot-results.webp) | ![](img/ipad-34-teacher.webp) | |
| [33 ผลสอบ](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=14-1275) | [34 โหมดอาจารย์](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=14-1446) | |

### แจ้งแก้ โน้ต offline และฉัน
| | | |
|---|---|---|
| ![](img/ipad-40-report-sheet.webp) | ![](img/ipad-41-my-reports.webp) | ![](img/ipad-50-notes.webp) |
| [40 Sheet แจ้งแก้](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=15-1164) | [41 รายการที่ฉันแจ้ง](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=15-1402) | [50 โน้ตและ bookmark](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=15-1507) |
| ![](img/ipad-60-offline.webp) | ![](img/ipad-61-offline-alert.webp) | ![](img/ipad-70-me.webp) |
| [60 ข้อมูล offline](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=16-1361) | [61 ยืนยันดาวน์โหลด](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=16-1543) | [70 ฉันและสิทธิ์ beta](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=16-1735) |

## 3. หน้าจอมือถือ (393 × 852)

| | | | | | |
|---|---|---|---|---|---|
| ![](img/phone-01-today.webp) | ![](img/phone-02-card-front.webp) | ![](img/phone-03-card-back.webp) | ![](img/phone-04-note.webp) | ![](img/phone-05-search.webp) | ![](img/phone-06-detail.webp) |
| [01 ทบทวนวันนี้](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=17-2) | [02 การ์ดหน้า](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=17-142) | [03 เฉลยและให้คะแนน](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=17-176) | [04 โน้ตสั้น](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=17-230) | [05 ค้นหา](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=17-358) | [06 รายละเอียด](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=17-516) |

## 4. หน้าเว็บ (1440)

![หน้าอ่านฟรี Femur](img/web-01-reading.webp)
[Web/01 หน้าอ่านฟรี (SEO)](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=18-2): ภาพนิ่งพร้อมหมุด ตาราง landmark สามภาษา ปุ่มดูแบบ 3D และลิงก์แจ้งแก้

![Viewer 3D บนเว็บ](img/web-02-viewer.webp)
[Web/02 Viewer 3D บน Flutter Web](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=18-121): layout เดียวกับ iPad พร้อมแถบบอกข้อจำกัดของเว็บ

![ดัชนีเว็บ](img/web-03-index.webp)
[Web/03 ดัชนี](https://www.figma.com/design/6wrlr1quIhFyyvoT0bJGgk?node-id=18-270): เลือกตามส่วนร่างกาย และ A–Z
