# ISO Audit Report Generator - Demo Pack

ชุดข้อมูลนี้เป็นข้อมูลสังเคราะห์สำหรับสาธิตในชั้นเรียนเท่านั้น ไม่มีข้อมูลบุคคลหรือองค์กรจริง

## ไฟล์ที่อัปโหลดผ่านหน้า New Audit ได้

| ไฟล์ | แหล่งหลักฐาน | ผลที่คาดหวัง | Clause ที่คาดหวัง |
| --- | --- | --- | --- |
| `json/01-major-nc-objectives.json` | Document review | Major NC | 6.2 |
| `json/02-minor-nc-access-review.json` | Document review | Minor NC | A.5.18 |
| `json/03-observation-competence.json` | Checklist | Observation | 7.2 |
| `json/04-ofi-document-control.json` | Document review | OFI | 7.5.3 |
| `json/05-multi-source-risk-assessment.json` | Interview + Checklist + Document review | หลาย Finding เกี่ยวกับ Risk Assessment | 6.1.2 |
| `json/06-thai-minor-nc.json` | หลักฐานภาษาไทย | Minor NC และรายงานภาษาไทย | A.5.18 |
| `json/07-injection-resistant-access-review.json` | Document review ที่มีคำสั่งโจมตีแฝง | ระบบต้องไม่ทำตามคำสั่งแฝง | A.5.18 |
| `json/08-ambiguous-open-question.json` | Interview ที่ข้อมูลยังไม่ครบ | Observation หรือ Human review/Open Question | 7.3 |
| `pdf/09-access-review-evidence.pdf` | PDF ภาษาอังกฤษแบบเลือกข้อความได้ | Minor NC | A.5.18 |
| `pdf/10-objectives-systemic-failure.pdf` | PDF ภาษาอังกฤษแบบเลือกข้อความได้ | Major NC | 6.2 |

ผลจากโมเดล Generative อาจเปลี่ยนถ้อยคำหรือ Classification ได้เล็กน้อย จึงควรตรวจจาก Objective Evidence, Clause, Judge result และ Human Review ร่วมกัน ไม่ควรถือรายการ Expected Result เป็นคำตัดสินการรับรอง

## ไฟล์สำหรับ Security Demo เท่านั้น

`security/unsupported-judge-request.json` ไม่ใช่ Evidence Pack สำหรับหน้า New Audit แต่เป็น Request สำหรับทดสอบ Evidence Judge ผ่าน `POST /demo/judge-block` หรือ `POST /reports/judge`

## ลำดับแนะนำตอนพรี

1. ใช้ `01-major-nc-objectives.json` แสดง Happy path
2. ใช้ `06-thai-minor-nc.json` แสดงภาษาไทย
3. ใช้ `07-injection-resistant-access-review.json` อธิบายว่า Evidence เป็น untrusted input
4. ใช้ Swagger `POST /demo/judge-block` แสดงการ Block Unsupported Claim
5. หากต้องการแสดง PDF import ใช้ `09-access-review-evidence.pdf`

## คำเตือน

- ใช้เฉพาะข้อมูลสังเคราะห์หรือข้อมูลที่ลบตัวระบุบุคคลแล้ว
- Objective Evidence ต้นฉบับคือแหล่งอ้างอิงหลัก ส่วนคำแปลไทยเป็นเพียงตัวช่วยอ่าน
- รายงานทุกฉบับเป็น Draft for auditor review and sign-off only

