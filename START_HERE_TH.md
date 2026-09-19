# เริ่มใช้งาน ISO Audit Report Generator v1.0.0

ชุดนี้เป็น source code สำหรับ Iteration 3 Demo Day พร้อมผลทดสอบและผลประเมินชุดพัฒนาขั้นสุดท้าย ก่อนส่งให้ตรวจ `git diff`, รันชุดทดสอบบนเครื่อง และสร้าง GitHub Release `v1.0.0`

## 1. เริ่ม


ใน PowerShell ที่โฟลเดอร์หลัก:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
Copy-Item .env.example .env
```

เปิด `.env` ใส่ API key ของตัวเอง

## 2. ทดสอบแบบไม่ใช้โควตา AI

```powershell
python -m compileall -q backend
python -m unittest backend.test_classifier_router backend.test_evaluation_metrics backend.test_evaluation_runner backend.test_language_support backend.test_prd_alignment backend.test_provider_errors backend.test_review_api
python -m backend.test_knowledge_base
python -m backend.test_retrieval
python -m backend.evaluate --dry-run
cd frontend
npm ci
npm test
npm run check
npm run build
cd ..
```

ถ้า `npm ci` แจ้ง EPERM ให้หยุด Vite ที่กำลังรันด้วย Ctrl+C ก่อนติดตั้งใหม่ ส่วน `Failed: RuntimeError` ภายใน unit test เป็นเคสจำลอง: ดูผลรวมท้ายสุดว่า OK

## 3. เปิดเว็บ (สอง Terminal)

Terminal 1 ที่โฟลเดอร์หลัก เปิด venv แล้วรัน:

```powershell
python -m uvicorn backend.app:app --reload
```

Terminal 2 ที่โฟลเดอร์หลัก:

```powershell
cd frontend
npm run dev
```

เปิด URL ที่ Vite แสดง (ปกติ http://localhost:5173) ส่วน API docs คือ http://127.0.0.1:8000/docs ใช้บนเครื่องตนเองก่อน ไม่เปิดสู่เครือข่ายสาธารณะ

## 4. เช็กลิสต์คลิกทดสอบ

- สร้าง audit โดยกรอกข้อมูลหรืออัปโหลด `data/demo/major-nc-evidence-pack.json` ข้อมูลนี้เป็นเรื่องสมมติและออกแบบไว้สำหรับเดโม Major NC
- หลัง generate ให้ชี้ส่วน **Normalized Observations** แล้วอธิบายว่าระบบจัดโครงสร้างข้อความก่อน Classifier โดยยังเก็บหลักฐานต้นฉบับไว้ครบ
- ทดสอบ PDF โดยเลือก **Choose text PDF** ใช้ PDF อังกฤษที่ลากเลือกข้อความได้ ขนาดไม่เกิน 5 MB และ 25 หน้า จากนั้นตรวจข้อความพร้อม `[Page N]` ก่อนส่ง AI
- เลือก **Report Language: ไทย (Thai)** เพื่อให้ Finding, Summary, Corrective Action และ Judge narrative เป็นภาษาไทย โดยหลักฐาน PDF ต้นฉบับและรหัส ISO ต้องคงเดิม
- ใช้ปุ่ม **ไทย | EN** ที่มุมขวาบนเพื่อสลับข้อความของหน้าเว็บทั้งระบบ ปุ่มนี้แยกจาก Report Language จึงเลือกหน้าเว็บภาษาไทยแต่สร้างรายงานอังกฤษ หรือกลับกันได้
- ชื่อประเภทข้อค้นพบจะคงศัพท์มาตรฐาน `Major NC`, `Minor NC`, `Observation` และ `OFI` ในทั้งสองภาษาของหน้าเว็บ
- รายงานที่สร้างใหม่จะแสดง Objective Evidence สองส่วน: **หลักฐานต้นฉบับ** สำหรับตรวจสอบย้อนกลับ และ **คำแปลภาษาไทย** สำหรับช่วยอ่าน โดย Judge ใช้เฉพาะต้นฉบับในการตรวจ grounding
- PDF สแกนหรือรูปภาพจะขึ้นว่าไม่พบ selectable text เพราะรุ่นนี้ยังไม่มี OCR
- ตรวจหลักฐานก่อนส่ง ยืนยันการส่ง AI หนึ่งครั้ง รอจนจบ อย่ากดซ้ำ การสร้างหนึ่งรายงานเรียก AI หลายครั้ง
- ตรวจข้อมูลบริษัท findings ข้ออ้างอิงหลักฐานและ disclaimer ผลจัดประเภทอาจเปลี่ยนตามโมเดล
- กลับ Dashboard > Saved audits เปิดรายงานเดิม และลองรีเฟรชหน้าแล้วเปิดใหม่ ข้อมูลต้องอยู่
- แก้ finding โดยกรอกชื่อผู้ตรวจและเหตุผล กด Save reviewed draft ต้องแสดงว่าการประเมินเดิมไม่ครอบคลุมข้อความที่แก้
- ตรวจรายงานและหลักฐานแล้วกรอกชื่อผู้ตรวจ/หมายเหตุ ติ๊กยืนยัน และกด **Mark review complete** สถานะต้องเป็น **Auditor reviewed**
- ลองแก้ finding หลังยืนยันแล้ว สถานะต้องกลับเป็น **Edited · review required** เพื่อบังคับตรวจรอบใหม่
- เปิด View change history ตรวจผู้แก้ เหตุผล และก่อน/หลัง ถ้าสองหน้าต่างแก้ข้อมูล revision เก่าต้องถูกปฏิเสธและให้โหลดใหม่
- Export Markdown และ Print / Save as PDF ตรวจข้อความไม่ล้นหน้าและมี disclaimer โดยเฉพาะรายงานที่แก้ไขแล้ว
- ลองไฟล์ JSON ผิดรูปแบบ/เกินขนาด ต้องแสดงข้อผิดพลาดโดยไม่ส่ง AI
- เมื่อ API quota หมด/บริการล่ม ต้องขึ้นข้อความที่เข้าใจได้ จาก Saved audits สามารถลองสร้างรายการที่ยังไม่มีผลภายหลังได้
- กรณี Judge บล็อก: เปิด API docs แล้วส่ง `data/demo/unsupported-judge-request.json` ไปที่ `POST /reports/judge` เพื่อสาธิตข้อความสรุปที่เกินกว่าหลักฐาน

## 5. สถานะการประเมินและก่อนส่ง

ผลขั้นสุดท้ายอยู่ใน `reports/v1.0/final_eval_report.md` และหลักฐาน Judge/guardrail อยู่ใน `reports/v1.0/judge_hallucination_log.md` หากเปลี่ยนโมเดล prompt rubric หรือ pipeline หลังจากนี้ ต้องรัน `python -m backend.evaluate` ใหม่และแทนที่รายงานด้วยผลจริง ห้ามนำคะแนนจาก pipeline คนละเวอร์ชันมาอ้างเป็นผลปัจจุบัน หากถูกจำกัด quota ให้ resume directory ของรอบนั้น

ก่อน release ให้ทดลองตาม `docs/DEMO_SCRIPT.md` แล้วตรวจ README, release notes, changelog และรายงาน Evaluation ให้ตรงกัน 

เมื่อทดสอบบนเครื่องผ่านแล้วจึงนำไฟล์ source กลับไป branch งานเดิม ตรวจ git diff และทำ PR ตามขั้นตอนทีม ZIP นี้ไม่เปลี่ยน GitHub ให้อัตโนมัติ

## ข้อจำกัดที่ต้องรู้

SQLite อยู่ใน `reports/local/audits.sqlite3` เก็บหลักฐานและประวัติแบบข้อความธรรมดา ชื่อผู้ตรวจเป็นชื่อที่กรอกเอง ไม่มีระบบ login สำหรับผู้ใช้หลายคน เก็บเฉพาะข้อมูลสมมติ การปิดบังข้อมูลติดต่อเป็นเพียง regex เบื้องต้น ไม่ครอบคลุมชื่อหรือ PII ทุกชนิด ถ้าต้องล้างข้อมูลทดสอบ ให้หยุด backend และสำรองฐานข้อมูลก่อนลบไฟล์ฐานข้อมูลนั้น (ประวัติจะหายด้วย)

คำแปล Objective Evidence เป็นข้อความช่วยอ่านที่ AI สร้างขึ้น ต้องเทียบกับหลักฐานต้นฉบับเสมอ ระบบจะไม่ใช้คำแปลแทนหลักฐานและไม่ถือว่าคำแปลเป็นหลักฐานรายการใหม่

Prompt guardrails และ automated judge ช่วยตรวจแต่ไม่รับประกันความถูกต้องหรือการต้าน prompt injection ต้องให้ auditor ตรวจและ sign-off เอง ระบบไม่ออกใบรับรองและไม่ส่งรายงานให้ client อัตโนมัติ
