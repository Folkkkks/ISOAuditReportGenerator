# เช็กลิสต์ตรวจหน้าเว็บฉบับ Professional UI

การตรวจนี้ไม่ต้องสร้างรายงาน AI ใหม่ ใช้ฐานข้อมูลเดิมได้

1. เปิด Overview แล้วตรวจว่าการ์ด Total audits, Major NC, Minor NC และ Awaiting review ตรงกับรายการที่บันทึก
2. ตาราง Recent audits ต้องเปิดรายงานเดิมได้ และ Finding mix ต้องแสดงจำนวนตามประเภท
3. เมนู Overview, New audit, Audit library, Reports และ Evaluation & controls ต้องกดเปลี่ยนหน้าได้ทุกเมนู
4. Audit library ต้องค้นหาชื่อองค์กรและกรอง Needs review, Edited, Pending ได้
5. Reports ต้องแสดงเฉพาะรายการที่มีรายงานแล้ว
6. New audit ต้องแสดง Import evidence pack เต็มแนวเดียวกับฟอร์ม และการกด Interview, Checklist, Document Review ต้องเปิดหน้าต่างเพิ่มหลักฐาน
7. Evaluation & controls ต้องแสดง Classification Macro F1 100%, Clause Accuracy 100%, Unsupported Major NC 0, rubric v2 และ guardrails
8. เปิดรายงานเดิม ตรวจหน้า Auditor editing และ Change history แล้วลอง Markdown/Print ตามเดิม
9. ลดขนาดหน้าต่างเพื่อตรวจว่าตารางเลื่อนได้ เมนูยุบ และข้อความไม่ทับกัน

หากสถิติเป็นศูนย์ทั้งที่มีข้อมูลเดิม ให้ตรวจว่าได้คัดลอก `reports/local/audits.sqlite3` และ restart backend แล้ว
