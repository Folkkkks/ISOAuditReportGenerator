const STORAGE_KEY = 'iso-audit-ui-language'

const THAI = {
  'Audit Workspace': 'พื้นที่ทำงานการตรวจประเมิน',
  'ISO Audit': 'การตรวจประเมิน ISO',
  'Report Generator': 'ระบบสร้างรายงาน',
  'Local review workspace': 'พื้นที่ตรวจทานภายในเครื่อง',
  'WORKSPACE': 'พื้นที่ทำงาน',
  'Overview': 'ภาพรวม',
  'New audit': 'สร้างการตรวจใหม่',
  'New Audit': 'สร้างการตรวจใหม่',
  'Audit library': 'คลังการตรวจประเมิน',
  'Audits': 'รายการตรวจประเมิน',
  'Reports': 'รายงาน',
  'Report': 'รายงาน',
  'INSIGHTS': 'ข้อมูลเชิงลึก',
  'Evaluation & controls': 'การประเมินและการควบคุม',
  'System ready': 'ระบบพร้อมใช้งาน',
  'Demo Day release · v1.0.0': 'รุ่นสาธิตฉบับสมบูรณ์ · v1.0.0',
  'Human sign-off required': 'ต้องได้รับการยืนยันจากผู้ตรวจประเมิน',
  'Dashboard': 'แดชบอร์ด',
  '+ New Audit': '+ สร้างการตรวจใหม่',
  'ISO Audit Report Generator': 'ระบบสร้างรายงานการตรวจประเมิน ISO',
  'Draft-only system': 'ระบบจัดทำฉบับร่างเท่านั้น',
  'ISO AUDIT WORKSPACE': 'พื้นที่ทำงานการตรวจประเมิน ISO',
  'AUDIT OPERATIONS': 'การดำเนินงานตรวจประเมิน',
  'Good evidence makes better decisions.': 'หลักฐานที่ดีช่วยให้ตัดสินใจได้ดียิ่งขึ้น',
  'Review active drafts, monitor findings, and move every report toward a documented auditor decision.': 'ตรวจทานฉบับร่าง ติดตามข้อค้นพบ และดำเนินรายงานไปสู่การตัดสินใจที่มีหลักฐานของผู้ตรวจประเมิน',
  'Create new audit': 'สร้างการตรวจใหม่',
  'Total audits': 'การตรวจทั้งหมด',
  'Saved locally': 'บันทึกภายในเครื่อง',
  'Major NC': 'Major NC',
  'Minor NC': 'Minor NC',
  'Across saved reports': 'จากรายงานที่บันทึกไว้',
  'Awaiting review': 'รอการตรวจทาน',
  'Auditor action required': 'ผู้ตรวจประเมินต้องดำเนินการ',
  'RECENT ACTIVITY': 'กิจกรรมล่าสุด',
  'Recent audits': 'การตรวจล่าสุด',
  'View audit library →': 'ดูคลังการตรวจประเมิน →',
  'Organization': 'องค์กร',
  'Organization Name': 'ชื่อองค์กร',
  'Audit date': 'วันที่ตรวจ',
  'Audit Date': 'วันที่ตรวจ',
  'Status': 'สถานะ',
  'Findings': 'ข้อค้นพบ',
  'Created': 'วันที่สร้าง',
  'No audits yet': 'ยังไม่มีรายการตรวจประเมิน',
  'Create an audit or import a prepared evidence pack to begin.': 'เริ่มต้นด้วยการสร้างการตรวจหรือนำเข้าชุดหลักฐานที่เตรียมไว้',
  'Create first audit': 'สร้างการตรวจรายการแรก',
  'PORTFOLIO': 'ภาพรวมข้อค้นพบ',
  'Finding mix': 'สัดส่วนข้อค้นพบ',
  'Observations': 'Observation',
  'Observation': 'Observation',
  'Opportunity for Improvement': 'OFI',
  'LATEST EVALUATION': 'ผลประเมินล่าสุด',
  'V1.0.0 FINAL EVALUATION': 'ผลประเมินขั้นสุดท้าย v1.0.0',
  'Cases valid': 'กรณีที่ผ่านการตรวจสอบ',
  'Backend tests': 'การทดสอบระบบหลังบ้าน',
  '38 passed': 'ผ่าน 38 รายการ',
  'Gold status': 'สถานะชุดคำตอบอ้างอิง',
  'Development reviewed': 'ตรวจทานภายในโครงการแล้ว',
  'Clause accuracy': 'ความถูกต้องของข้อกำหนด',
  'Unsupported major': 'ข้อบกพร่องร้ายแรงที่ไม่มีหลักฐานรองรับ',
  'View model controls →': 'ดูการควบคุมโมเดล →',
  'Loading audit workspace…': 'กำลังโหลดพื้นที่ทำงาน…',
  'Dashboard unavailable': 'ไม่สามารถโหลดแดชบอร์ดได้',
  'Try again': 'ลองอีกครั้ง',
  'Generation pending': 'รอสร้างรายงาน',
  'Awaiting auditor review': 'รอผู้ตรวจประเมินตรวจทาน',
  'Awaiting Auditor Review': 'รอผู้ตรวจประเมินตรวจทาน',
  'Edited · review required': 'แก้ไขแล้ว · ต้องตรวจทาน',
  'Human-edited draft — review required': 'ฉบับร่างที่แก้ไขโดยผู้ใช้ — ต้องตรวจทาน',
  'Auditor reviewed': 'ผู้ตรวจประเมินตรวจทานแล้ว',
  'Auditor Reviewed': 'ผู้ตรวจประเมินตรวจทานแล้ว',
  'Revision required': 'ต้องแก้ไข',
  'Needs Revision': 'ต้องแก้ไข',
  'This evidence is saved but has no report. Generate it now? This uses AI quota.': 'หลักฐานนี้ถูกบันทึกแล้วแต่ยังไม่มีรายงาน ต้องการสร้างรายงานตอนนี้หรือไม่? การดำเนินการนี้ใช้โควตา AI',
  'Review generated drafts and continue auditor sign-off.': 'ตรวจทานรายงานฉบับร่างและดำเนินการยืนยันโดยผู้ตรวจประเมิน',
  'Search every saved evidence pack, draft, and reviewed report.': 'ค้นหาชุดหลักฐาน ฉบับร่าง และรายงานที่ตรวจทานแล้วทั้งหมด',
  'Search organization…': 'ค้นหาองค์กร…',
  'All': 'ทั้งหมด',
  'Needs review': 'ต้องตรวจทาน',
  'Reviewed': 'ตรวจทานแล้ว',
  'Edited': 'แก้ไขแล้ว',
  'Pending': 'รอดำเนินการ',
  'Loading saved audits…': 'กำลังโหลดรายการที่บันทึกไว้…',
  '+ New audit': '+ สร้างการตรวจใหม่',
  'No matching audits': 'ไม่พบรายการที่ตรงกัน',
  'Try a different search or create a new audit.': 'ลองใช้คำค้นอื่นหรือสร้างการตรวจรายการใหม่',
  'Could not load saved audits': 'ไม่สามารถโหลดรายการที่บันทึกไว้ได้',
  'Model quality, grounding, prompt versions, and release safeguards.': 'คุณภาพโมเดล ความสอดคล้องกับหลักฐาน เวอร์ชันพรอมต์ และมาตรการเผยแพร่',
  'V1.0.0 · DEMO DAY': 'v1.0.0 · รุ่นสาธิตฉบับสมบูรณ์',
  'The PRD dataset and five-agent pipeline passed final development evaluation.': 'ชุดข้อมูลตาม PRD และกระบวนการ 5 เอเจนต์ผ่านการประเมินขั้นสุดท้ายระหว่างการพัฒนาแล้ว',
  'All 10 messy Acme cases, full Gold reports, schemas, and deterministic clause mappings passed validation.': 'กรณี Acme แบบข้อมูลดิบ 10 ชุด รายงานอ้างอิงฉบับเต็ม สคีมา และการจับคู่ข้อกำหนดแบบกำหนดตายตัวผ่านการตรวจสอบทั้งหมด',
  'Gold-set cases correct': 'กรณีชุดคำตอบอ้างอิงที่ถูกต้อง',
  'Development set · external Gold sign-off pending': 'ชุดพัฒนา · รอผู้ทรงคุณวุฒิรับรองคำตอบอ้างอิง',
  'All passed': 'ผ่านทั้งหมด',
  'Clause precheck': 'การตรวจข้อกำหนดล่วงหน้า',
  'Deterministic Gold pairs': 'คู่ข้อกำหนดอ้างอิงแบบกำหนดตายตัว',
  'Agent stages': 'ขั้นตอนเอเจนต์',
  'Explicit': 'แยกชัดเจน',
  'Normalizer through Judge': 'ตั้งแต่ตัวจัดโครงสร้างถึงตัวตรวจสอบ',
  'Classification F1': 'ค่า F1 ของการจำแนก',
  'PRD threshold ≥ 75%': 'เกณฑ์ PRD ≥ 75%',
  '10/10 exact pairs': 'ตรงกันครบ 10/10 คู่',
  'Unsupported Major NC': 'Major NC ที่ไม่มีหลักฐานรองรับ',
  'PRD release threshold passed': 'ผ่านเกณฑ์เผยแพร่ตาม PRD',
  'FINAL GOLD-SET RESULT': 'ผลชุดคำตอบอ้างอิงขั้นสุดท้าย',
  'Development evaluation metrics': 'ตัวชี้วัดการประเมินชุดพัฒนา',
  'PRD threshold passed': 'ผ่านเกณฑ์ PRD',
  'Classification accuracy': 'ความถูกต้องของการจำแนก',
  'Automated grounding score': 'คะแนนความสอดคล้องกับหลักฐานอัตโนมัติ',
  'Released unsupported Major NCs': 'Major NC ที่เผยแพร่โดยไม่มีหลักฐานรองรับ',
  'PRD threshold': 'เกณฑ์ PRD',
  'Passed': 'ผ่าน',
  'ITERATION 3 · COMPLETED': 'รอบพัฒนาที่ 3 · เสร็จสมบูรณ์',
  'Quality improved while grounding stayed stable.': 'คุณภาพดีขึ้นโดยยังรักษาความสอดคล้องกับหลักฐาน',
  '10 of 10 development cases completed with Gemini 3.5 Flash Lite and classifier rubric v2.': 'ทดสอบชุดพัฒนาครบ 10 จาก 10 กรณีด้วย Gemini 3.5 Flash Lite และเกณฑ์จำแนก v2',
  'Classification macro F1': 'ค่า Macro F1 ของการจำแนก',
  'Target ≥ 75%': 'เป้าหมาย ≥ 75%',
  'Grounding score': 'คะแนนความสอดคล้องกับหลักฐาน',
  'Automated Judge': 'ตรวจด้วยระบบอัตโนมัติ',
  'Release threshold met': 'ผ่านเกณฑ์การเผยแพร่',
  'F1 improvement': 'การเพิ่มขึ้นของ F1',
  'Compared with Iteration 2': 'เทียบกับรอบพัฒนาที่ 2',
  'VERSION CONTROL': 'การควบคุมเวอร์ชัน',
  'Prompt registry': 'ทะเบียนพรอมต์',
  'Tracked': 'ติดตามแล้ว',
  'Safety policy': 'นโยบายความปลอดภัย',
  'Classification rubric': 'เกณฑ์การจำแนก',
  'Builder integrity': 'ความถูกต้องของตัวสร้าง',
  'Model': 'โมเดล',
  'GUARDRAILS': 'มาตรการป้องกัน',
  'Release controls': 'การควบคุมการเผยแพร่',
  'Active': 'ใช้งานอยู่',
  'Evidence treated as untrusted input': 'ถือว่าหลักฐานเป็นข้อมูลที่ยังไม่น่าเชื่อถือ',
  'Embedded instructions are explicitly rejected by the prompt policy.': 'นโยบายพรอมต์ปฏิเสธคำสั่งที่ฝังอยู่ในหลักฐานอย่างชัดเจน',
  'Evidence Judge gate': 'ด่านตรวจสอบหลักฐาน',
  'Unsupported drafts remain hidden from the public report response.': 'ฉบับร่างที่ไม่มีหลักฐานรองรับจะไม่ถูกแสดงเป็นรายงาน',
  'Human review boundary': 'ขอบเขตการตรวจทานโดยมนุษย์',
  'Every report keeps its draft disclaimer and requires sign-off.': 'ทุกรายงานคงข้อความกำกับฉบับร่างและต้องได้รับการยืนยัน',
  'Auditor change history': 'ประวัติการแก้ไขของผู้ตรวจประเมิน',
  'Edits record a reviewer, reason, timestamp, and before/after state.': 'การแก้ไขจะบันทึกผู้ตรวจ เหตุผล เวลา และข้อมูลก่อนกับหลังแก้ไข',
  'SECURITY DEMO': 'การสาธิตความปลอดภัย',
  'Evidence Judge block test': 'ทดสอบการบล็อกด้วยระบบตรวจสอบหลักฐาน',
  'Run a bundled report that deliberately overclaims beyond its source evidence.': 'ทดสอบรายงานที่จงใจกล่าวอ้างเกินกว่าหลักฐานต้นฉบับ',
  'Run Judge Block Demo': 'เรียกใช้การทดสอบ Judge Block',
  'Ready to test the release gate': 'พร้อมทดสอบด่านก่อนเผยแพร่รายงาน',
  'The result is returned by the live Evidence Judge. It is not hard-coded in the interface.': 'ผลลัพธ์มาจาก Evidence Judge ที่ทำงานจริง ไม่ได้กำหนดผลลัพธ์ตายตัวไว้ในหน้าเว็บ',
  'Running Judge…': 'กำลังตรวจสอบ…',
  'Checking the unsupported report…': 'กำลังตรวจรายงานที่มีข้อความไม่ได้รับการรองรับ…',
  'This live request uses the configured model and API quota.': 'คำขอนี้ใช้โมเดลและโควตา API ที่ตั้งค่าไว้',
  'Judge Block Demo failed': 'การทดสอบ Judge Block ไม่สำเร็จ',
  'Evidence Supported': 'หลักฐานรองรับ',
  'Reference Valid': 'ข้ออ้างอิงถูกต้อง',
  'Human Review Required': 'ต้องให้มนุษย์ตรวจทาน',
  'Judge rationale:': 'เหตุผลจากระบบตรวจสอบ:',
  'Unsupported Claims': 'ข้อความที่ไม่มีหลักฐานรองรับ',
  'No unsupported claims returned.': 'ไม่พบข้อความที่ไม่มีหลักฐานรองรับ',
  'Report passed the release gate': 'รายงานผ่านด่านก่อนเผยแพร่',
  'Report blocked — revision required': 'รายงานถูกบล็อก — ต้องแก้ไข',
  'No Judge summary returned.': 'ระบบไม่ได้ส่งสรุปผลการตรวจกลับมา',
  'No finding judgments were returned.': 'ระบบไม่ได้ส่งผลการตรวจข้อค้นพบกลับมา',
  'Development benchmark': 'เกณฑ์ทดสอบระหว่างการพัฒนา',
  'Gold labels are complete, project-authored development annotations. Instructor sign-off is intentionally pending; do not describe them as independently certified labels.': 'ป้ายกำกับอ้างอิงจัดทำครบและผ่านการตรวจทานภายในโครงการแล้ว แต่ยังรอการลงนามจากอาจารย์ จึงไม่ควรกล่าวว่าเป็นชุดข้อมูลที่รับรองโดยอิสระ',
  'Gold labels are project-authored draft annotations, not a held-out or independently certified benchmark. GAP-006 remains visible as the only classification disagreement.': 'ป้ายกำกับอ้างอิงเป็นฉบับร่างที่จัดทำในโครงการ ไม่ใช่เกณฑ์ทดสอบอิสระที่ได้รับการรับรอง โดย GAP-006 เป็นกรณีเดียวที่การจำแนกยังไม่ตรงกัน',
  'Audit Workflow': 'ขั้นตอนการตรวจประเมิน',
  'AI-ASSISTED ISO AUDITING': 'ระบบตรวจประเมิน ISO ด้วย AI',
  'Generate clearer audit reports, faster.': 'สร้างรายงานการตรวจที่ชัดเจนได้รวดเร็วยิ่งขึ้น',
  'Submit audit evidence and let the system assist with finding classification, evidence validation, and draft report generation.': 'ส่งหลักฐานการตรวจเพื่อให้ระบบช่วยจำแนกข้อค้นพบ ตรวจสอบหลักฐาน และสร้างรายงานฉบับร่าง',
  'Start New Audit →': 'เริ่มการตรวจใหม่ →',
  'Follow the process from evidence to draft report': 'ดำเนินการตั้งแต่รวบรวมหลักฐานจนถึงรายงานฉบับร่าง',
  'Evidence': 'หลักฐาน',
  'Submit interview, checklist, and document review evidence.': 'ส่งหลักฐานจากการสัมภาษณ์ รายการตรวจสอบ และการทบทวนเอกสาร',
  'AI Analysis': 'การวิเคราะห์ด้วย AI',
  'Analyze evidence and classify potential audit findings.': 'วิเคราะห์หลักฐานและจำแนกข้อค้นพบที่อาจเกิดขึ้น',
  'Review Major NC, Minor NC, Observation, and OFI classifications.': 'ตรวจทานการจำแนก Major NC, Minor NC, Observation และ OFI',
  'Validation': 'การตรวจสอบความถูกต้อง',
  'Check whether the evidence sufficiently supports the findings.': 'ตรวจว่าหลักฐานรองรับข้อค้นพบอย่างเพียงพอหรือไม่',
  'Review the generated draft report before auditor sign-off.': 'ตรวจทานรายงานฉบับร่างก่อนผู้ตรวจประเมินยืนยัน',
  'System Scope': 'ขอบเขตระบบ',
  'What this application is designed to do': 'วัตถุประสงค์ของแอปพลิเคชันนี้',
  'Evidence-Based': 'อ้างอิงหลักฐาน',
  'Findings are generated from submitted audit evidence and retrieved ISO knowledge.': 'ข้อค้นพบสร้างจากหลักฐานที่ส่งเข้าระบบและความรู้ ISO ที่ค้นคืนมา',
  'Generated findings are checked for sufficient supporting evidence.': 'ข้อค้นพบที่สร้างขึ้นจะถูกตรวจว่ามีหลักฐานรองรับเพียงพอ',
  'Draft Report': 'รายงานฉบับร่าง',
  'The system generates a draft audit report for auditor review.': 'ระบบสร้างรายงานฉบับร่างเพื่อให้ผู้ตรวจประเมินตรวจทาน',
  'Settings': 'การตั้งค่า',
  'Create a new ISO audit and submit evidence': 'สร้างการตรวจ ISO และส่งหลักฐาน',
  'Audit Information': 'ข้อมูลการตรวจประเมิน',
  'Enter the basic information for this audit.': 'กรอกข้อมูลพื้นฐานสำหรับการตรวจครั้งนี้',
  'Enter organization name': 'กรอกชื่อองค์กร',
  'Standard': 'มาตรฐาน',
  'Report Language': 'ภาษาของรายงาน',
  'English': 'อังกฤษ',
  'Source evidence remains in its original language. Generated analysis and report narrative use the selected language.': 'หลักฐานต้นฉบับจะคงภาษาเดิม ส่วนการวิเคราะห์และเนื้อหารายงานจะใช้ภาษาที่เลือก',
  'Audit Evidence': 'หลักฐานการตรวจประเมิน',
  'Add evidence collected during the audit.': 'เพิ่มหลักฐานที่รวบรวมระหว่างการตรวจประเมิน',
  'Interview': 'การสัมภาษณ์',
  'Evidence collected through interviews with personnel.': 'หลักฐานจากการสัมภาษณ์บุคลากร',
  '+ Add Evidence': '+ เพิ่มหลักฐาน',
  'Checklist': 'รายการตรวจสอบ',
  'Results and observations from audit checklists.': 'ผลและข้อสังเกตจากรายการตรวจสอบ',
  'Document Review': 'การทบทวนเอกสาร',
  'Evidence obtained from reviewing documents and records.': 'หลักฐานจากการทบทวนเอกสารและบันทึก',
  'No evidence added yet': 'ยังไม่ได้เพิ่มหลักฐาน',
  'Choose an evidence type above to add audit evidence.': 'เลือกประเภทหลักฐานด้านบนเพื่อเพิ่มหลักฐานการตรวจ',
  'Cancel': 'ยกเลิก',
  'Continue': 'ดำเนินการต่อ',
  'Continue →': 'ดำเนินการต่อ →',
  'Please enter Organization Name.': 'กรุณากรอกชื่อองค์กร',
  'Please select Audit Date.': 'กรุณาเลือกวันที่ตรวจ',
  'Please select Standard.': 'กรุณาเลือกมาตรฐาน',
  'Please add at least one evidence item.': 'กรุณาเพิ่มหลักฐานอย่างน้อยหนึ่งรายการ',
  'Review Audit': 'ตรวจทานข้อมูลการตรวจ',
  'Review the audit information before continuing.': 'ตรวจสอบข้อมูลก่อนดำเนินการต่อ',
  'Review the basic information for this audit.': 'ตรวจสอบข้อมูลพื้นฐานของการตรวจครั้งนี้',
  'No evidence added': 'ไม่มีหลักฐาน',
  'No audit evidence has been added.': 'ยังไม่ได้เพิ่มหลักฐานการตรวจ',
  'Back to Edit': 'กลับไปแก้ไข',
  '← Back': '← กลับ',
  'Submit Audit': 'ส่งข้อมูลการตรวจ',
  'Submit Audit →': 'ส่งข้อมูลการตรวจ →',
  'Import evidence pack': 'นำเข้าชุดหลักฐาน',
  'Import a prepared JSON pack or extract selectable text from a PDF. Review all extracted text before sending it to AI.': 'นำเข้าชุด JSON ที่เตรียมไว้ หรือดึงข้อความที่เลือกได้จาก PDF โปรดตรวจข้อความทั้งหมดก่อนส่งให้ AI',
  'Choose JSON pack': 'เลือกชุด JSON',
  'Maximum 100 KB': 'สูงสุด 100 KB',
  'Choose text PDF': 'เลือก PDF แบบข้อความ',
  'Import failed': 'นำเข้าไม่สำเร็จ',
  'PDF import failed': 'นำเข้า PDF ไม่สำเร็จ',
  'Maximum 5 MB · 25 pages · no OCR': 'สูงสุด 5 MB · 25 หน้า · ไม่รองรับ OCR',
  'Auditee Name': 'ชื่อผู้ให้สัมภาษณ์',
  'Enter auditee name': 'กรอกชื่อผู้ให้สัมภาษณ์',
  'Position': 'ตำแหน่ง',
  'Enter position': 'กรอกตำแหน่ง',
  'Interview Notes': 'บันทึกการสัมภาษณ์',
  'Enter interview notes': 'กรอกบันทึกการสัมภาษณ์',
  'Checklist Item': 'หัวข้อรายการตรวจสอบ',
  'Enter checklist item': 'กรอกหัวข้อรายการตรวจสอบ',
  'Result': 'ผลลัพธ์',
  'Select result': 'เลือกผลลัพธ์',
  'Compliant': 'สอดคล้อง',
  'Non-Compliant': 'ไม่สอดคล้อง',
  'Not Applicable': 'ไม่เกี่ยวข้อง',
  'Notes': 'บันทึก',
  'Enter checklist notes': 'กรอกบันทึกรายการตรวจสอบ',
  'Document Name': 'ชื่อเอกสาร',
  'Enter document name': 'กรอกชื่อเอกสาร',
  'Document Reference': 'เลขอ้างอิงเอกสาร',
  'Enter document reference': 'กรอกเลขอ้างอิงเอกสาร',
  'Review Notes': 'บันทึกการทบทวน',
  'Enter review notes': 'กรอกบันทึกการทบทวน',
  'Enter the evidence information below.': 'กรอกข้อมูลหลักฐานด้านล่าง',
  'Add Evidence': 'เพิ่มหลักฐาน',
  'Please enter the required information.': 'กรุณากรอกข้อมูลที่จำเป็น',
  'Send this evidence to the AI provider and save it locally? Use synthetic data. Remove names, personal data and secrets first.': 'ต้องการส่งหลักฐานนี้ให้ผู้ให้บริการ AI และบันทึกภายในเครื่องหรือไม่? ควรใช้ข้อมูลจำลองและลบชื่อ ข้อมูลส่วนบุคคล และข้อมูลลับก่อน',
  'Mask email addresses and common Thai mobile numbers before storage and AI processing? Names and other personal data still need manual removal.': 'ต้องการปกปิดอีเมลและหมายเลขโทรศัพท์มือถือไทยก่อนบันทึกและประมวลผลด้วย AI หรือไม่? ชื่อและข้อมูลส่วนบุคคลอื่นยังต้องลบด้วยตนเอง',
  'Remove': 'นำออก',
  'Auditee:': 'ผู้ให้สัมภาษณ์:',
  'Position:': 'ตำแหน่ง:',
  'Notes:': 'บันทึก:',
  'Checklist Item:': 'หัวข้อรายการตรวจสอบ:',
  'Result:': 'ผลลัพธ์:',
  'Document:': 'เอกสาร:',
  'Reference:': 'เลขอ้างอิง:',
  'A maximum of 10 evidence items is allowed.': 'เพิ่มหลักฐานได้สูงสุด 10 รายการ',
  'Report Needs Revision': 'รายงานต้องได้รับการแก้ไข',
  'The Evidence Judge blocked this draft from release.': 'ระบบตรวจสอบหลักฐานระงับการแสดงฉบับร่างนี้',
  'Draft withheld for safety': 'ระงับฉบับร่างเพื่อความปลอดภัย',
  'No report is displayed because one or more findings are not sufficiently grounded.': 'ไม่แสดงรายงานเนื่องจากมีข้อค้นพบอย่างน้อยหนึ่งรายการที่หลักฐานรองรับไม่เพียงพอ',
  'Judge Summary': 'สรุปผลการตรวจสอบ',
  'Finding Validation': 'การตรวจสอบข้อค้นพบ',
  'Review these issues and improve the submitted evidence before trying again.': 'ตรวจสอบประเด็นเหล่านี้และปรับปรุงหลักฐานก่อนลองอีกครั้ง',
  'Evidence supported:': 'หลักฐานรองรับ:',
  'Reference valid:': 'เลขอ้างอิงถูกต้อง:',
  'Reason:': 'เหตุผล:',
  'Unsupported claims:': 'ข้อความที่ไม่มีหลักฐานรองรับ:',
  'Yes': 'ใช่',
  'No': 'ไม่ใช่',
  'Revise Evidence': 'แก้ไขหลักฐาน',
  'Audit Report': 'รายงานการตรวจประเมิน',
  'Generated report for auditor review': 'รายงานที่สร้างขึ้นเพื่อให้ผู้ตรวจประเมินตรวจทาน',
  'Print / PDF': 'พิมพ์ / PDF',
  'Information from the generated audit report.': 'ข้อมูลจากรายงานการตรวจที่ระบบสร้างขึ้น',
  'Auditor Review': 'การตรวจทานโดยผู้ตรวจประเมิน',
  'This report requires human review before sign-off.': 'รายงานนี้ต้องได้รับการตรวจทานก่อนการยืนยัน',
  'Auditor review required': 'ต้องได้รับการตรวจทานจากผู้ตรวจประเมิน',
  'Review complete': 'ตรวจทานเสร็จแล้ว',
  'Executive Summary': 'บทสรุปผู้บริหาร',
  'Summary generated from the audit evidence.': 'บทสรุปที่สร้างจากหลักฐานการตรวจประเมิน',
  'Normalized Observations': 'ข้อสังเกตที่จัดรูปแบบแล้ว',
  'Structured observations produced from the submitted evidence before classification.': 'ข้อสังเกตที่จัดโครงสร้างจากหลักฐานก่อนนำไปจำแนกประเภท',
  'No findings': 'ไม่พบข้อค้นพบ',
  'No findings were generated for this audit.': 'ไม่มีข้อค้นพบที่สร้างขึ้นสำหรับการตรวจครั้งนี้',
  'Clause:': 'ข้อกำหนด:',
  'Requirement:': 'รหัสข้อกำหนด:',
  'Objective Evidence:': 'หลักฐานเชิงประจักษ์:',
  'Original evidence': 'หลักฐานต้นฉบับ',
  'Thai translation': 'คำแปลภาษาไทย',
  'Suggested Corrective Action:': 'ข้อเสนอแนะในการแก้ไข:',
  'Evidence Judge': 'ระบบตรวจสอบหลักฐาน',
  'Validation of report grounding and evidence support.': 'ตรวจสอบความสอดคล้องของรายงานและหลักฐานรองรับ',
  'Report Grounded': 'รายงานสอดคล้องกับหลักฐาน',
  'Overall Result': 'ผลรวม',
  'Supported': 'มีหลักฐานรองรับ',
  'Partially Supported': 'มีหลักฐานรองรับบางส่วน',
  'Unsupported': 'ไม่มีหลักฐานรองรับ',
  'Not rechecked after edits': 'ยังไม่ได้ตรวจซ้ำหลังการแก้ไข',
  'No judgment': 'ยังไม่มีผลตรวจสอบ',
  'Open Questions': 'คำถามที่ต้องตรวจสอบเพิ่มเติม',
  'Items that should be checked by the auditor.': 'รายการที่ผู้ตรวจประเมินควรตรวจสอบ',
  'No open questions.': 'ไม่มีคำถามเพิ่มเติม',
  'Disclaimer': 'ข้อสงวนสิทธิ์',
  'Auditor editing & history': 'การแก้ไขและประวัติโดยผู้ตรวจประเมิน',
  'AI draft generation': 'การสร้างฉบับร่างด้วย AI',
  'View change history': 'ดูประวัติการเปลี่ยนแปลง',
  'Change history': 'ประวัติการเปลี่ยนแปลง',
  'No changes recorded.': 'ไม่มีประวัติการเปลี่ยนแปลง',
  'Complete auditor review': 'ยืนยันการตรวจทาน',
  'Confirm that you reviewed the report and its evidence. This records a local acknowledgement; it is not ISO certification approval.': 'ยืนยันว่าคุณได้ตรวจทานรายงานและหลักฐานแล้ว การดำเนินการนี้เป็นการรับรองภายในระบบ ไม่ใช่การอนุมัติใบรับรอง ISO',
  'Reviewer name (self-declared)': 'ชื่อผู้ตรวจทาน (ระบุด้วยตนเอง)',
  'Review note (at least 5 characters)': 'บันทึกการตรวจทาน (อย่างน้อย 5 ตัวอักษร)',
  'I reviewed the report and supporting evidence.': 'ฉันได้ตรวจทานรายงานและหลักฐานประกอบแล้ว',
  'Mark review complete': 'ยืนยันว่าตรวจทานเสร็จแล้ว',
  'Mark this report as auditor reviewed? This does not issue or approve an ISO certificate.': 'ยืนยันว่ารายงานนี้ผ่านการตรวจทานแล้วหรือไม่? การดำเนินการนี้ไม่ใช่การออกหรืออนุมัติใบรับรอง ISO',
  'This audit has no result. Generate now? This uses API quota.': 'รายการตรวจนี้ยังไม่มีผลลัพธ์ ต้องการสร้างตอนนี้หรือไม่? การดำเนินการนี้ใช้โควตา API',
  'Classification': 'ประเภทข้อค้นพบ',
  'Finding statement': 'รายละเอียดข้อค้นพบ',
  'Suggested corrective action': 'ข้อเสนอแนะในการแก้ไข',
  'Reason for change (at least 5 characters)': 'เหตุผลในการแก้ไข (อย่างน้อย 5 ตัวอักษร)',
  'Save reviewed draft': 'บันทึกฉบับร่างที่ตรวจทานแล้ว',
  'Editing a finding below will reopen this report for review.': 'การแก้ไขข้อค้นพบด้านล่างจะเปลี่ยนรายงานกลับเป็นสถานะรอตรวจทาน',
  'AUDITOR REVIEW COMPLETE: human edits were reviewed. The original AI judgment was not rerun and remains historical only.': 'ตรวจทานโดยผู้ตรวจประเมินเสร็จแล้ว: การแก้ไขโดยมนุษย์ได้รับการตรวจทานแล้ว แต่ไม่ได้เรียกใช้การตัดสินของ AI ซ้ำและเก็บไว้เป็นประวัติเท่านั้น',
  'AUDITOR REVIEW COMPLETE: this local acknowledgement is not an authenticated identity or ISO certification decision.': 'ตรวจทานโดยผู้ตรวจประเมินเสร็จแล้ว: การยืนยันภายในระบบนี้ไม่ใช่การยืนยันตัวตนหรือการตัดสินรับรอง ISO',
  'HUMAN-EDITED DRAFT: original AI judgment is stale and does not validate these edits. Auditor review required.': 'ฉบับร่างที่แก้ไขโดยมนุษย์: ผลตรวจเดิมของ AI ไม่ครอบคลุมการแก้ไขนี้ จึงต้องให้ผู้ตรวจประเมินตรวจทาน',
  'AI-generated draft only. Reviewer names below are self-declared, not authenticated identities.': 'เป็นเพียงฉบับร่างที่สร้างด้วย AI ชื่อผู้ตรวจด้านล่างเป็นข้อมูลที่ระบุเองและยังไม่ได้ยืนยันตัวตน',
  'Evidence saved — generation pending': 'บันทึกหลักฐานแล้ว — รอสร้างรายงาน',
  'AI draft — auditor review required': 'ฉบับร่างจาก AI — ต้องให้ผู้ตรวจประเมินตรวจทาน',
  'Blocked — revision required': 'ถูกระงับ — ต้องแก้ไข',
  'Saved audits': 'รายการตรวจที่บันทึกไว้',
  'Saved audits — local single-user demo': 'รายการตรวจที่บันทึกไว้ — ตัวอย่างใช้งานภายในเครื่อง',
  'Drafts are stored only in this local application.': 'ฉบับร่างถูกจัดเก็บภายในแอปพลิเคชันนี้เท่านั้น',
  'No saved audits yet.': 'ยังไม่มีรายการตรวจที่บันทึกไว้',
  'Generate draft': 'สร้างฉบับร่าง',
  'Open report': 'เปิดรายงาน',
  'Interface language': 'ภาษาหน้าเว็บ'
}

const storage = typeof localStorage === 'undefined' ? null : localStorage
let language = storage?.getItem(STORAGE_KEY) === 'th' ? 'th' : 'en'
const originalText = new WeakMap()
const originalAttributes = new WeakMap()
let observer
let scheduled = false

const dynamicThai = [
  [/^(\d+) finding\(s\) generated\.$/, (_, n) => `สร้างข้อค้นพบแล้ว ${n} รายการ`],
  [/^(\d+) evidence item\(s\) added\.$/, (_, n) => `เพิ่มหลักฐานแล้ว ${n} รายการ`],
  [/^Add (Interview|Checklist|Document Review) Evidence$/, (_, type) => `เพิ่มหลักฐาน${THAI[type]}`],
  [/^Edit (F-\d+)$/, (_, id) => `แก้ไข ${id}`],
  [/^Reviewed by (.+) on (.+)\.$/, (_, name, date) => `ตรวจทานโดย ${name} เมื่อ ${date}`],
  [/^Created (.+)$/, (_, date) => `สร้างเมื่อ ${date}`],
  [/^Extracting (.+)…$/, (_, name) => `กำลังอ่าน ${name}…`],
  [/^(.+) · text extracted$/, (_, name) => `${name} · ดึงข้อความแล้ว`]
]

export function getUiLanguage() {
  return language
}

export function t(value) {
  const text = String(value ?? '')
  if (language !== 'th') return text
  if (THAI[text]) return THAI[text]
  for (const [pattern, replace] of dynamicThai) {
    if (pattern.test(text)) return text.replace(pattern, replace)
  }
  return text
}

function translateTextNode(node) {
  if (!originalText.has(node)) originalText.set(node, node.nodeValue)
  const source = originalText.get(node)
  const trimmed = source.trim()
  if (!trimmed) return
  const normalized = trimmed.replace(/\s+/g, ' ')
  const translated = language === 'th' ? t(normalized) : trimmed
  const leading = source.match(/^\s*/)[0]
  const trailing = source.match(/\s*$/)[0]
  const next = `${leading}${translated}${trailing}`
  if (node.nodeValue !== next) node.nodeValue = next
}

function translateAttributes(element) {
  const names = ['placeholder', 'aria-label', 'title']
  let saved = originalAttributes.get(element)
  if (!saved) {
    saved = new Map()
    originalAttributes.set(element, saved)
  }
  for (const name of names) {
    if (!element.hasAttribute(name)) continue
    if (!saved.has(name)) saved.set(name, element.getAttribute(name))
    const source = saved.get(name)
    element.setAttribute(name, language === 'th' ? t(source) : source)
  }
}

export function localize(root = document.body) {
  if (!root) return
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root)
    return
  }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return
  const element = root.nodeType === Node.ELEMENT_NODE ? root : null
  if (element?.closest('[data-i18n-ignore], .language-switcher')) return
  if (element) translateAttributes(element)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  let node
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.matches('[data-i18n-ignore], .language-switcher') || node.closest('[data-i18n-ignore], .language-switcher')) continue
      translateAttributes(node)
    } else if (!node.parentElement?.closest('[data-i18n-ignore], .language-switcher')) {
      translateTextNode(node)
    }
  }
  document.documentElement.lang = language === 'th' ? 'th' : 'en'
}

function ensureSwitcher() {
  const topbar = document.querySelector('.topbar')
  if (!topbar || topbar.querySelector('.language-switcher')) return
  const wrapper = document.createElement('div')
  wrapper.className = 'language-switcher no-print'
  wrapper.setAttribute('role', 'group')
  wrapper.setAttribute('aria-label', t('Interface language'))
  wrapper.innerHTML = '<button type="button" data-ui-language="th">ไทย</button><button type="button" data-ui-language="en">EN</button>'
  wrapper.querySelectorAll('[data-ui-language]').forEach(button => {
    const active = button.dataset.uiLanguage === language
    button.classList.toggle('active', active)
    button.setAttribute('aria-pressed', String(active))
    button.addEventListener('click', () => setUiLanguage(button.dataset.uiLanguage))
  })
  let actionGroup = topbar.querySelector('.report-header-actions, .topbar-actions')
  if (!actionGroup) {
    actionGroup = document.createElement('div')
    actionGroup.className = 'topbar-actions'
    for (const child of [...topbar.children].slice(1)) actionGroup.append(child)
    topbar.append(actionGroup)
  }
  actionGroup.prepend(wrapper)
}

export function setUiLanguage(value) {
  language = value === 'th' ? 'th' : 'en'
  storage?.setItem(STORAGE_KEY, language)
  if (typeof document === 'undefined') return
  localize(document.body)
  document.querySelectorAll('.language-switcher').forEach(wrapper => {
    wrapper.setAttribute('aria-label', t('Interface language'))
    wrapper.querySelectorAll('[data-ui-language]').forEach(button => {
      const active = button.dataset.uiLanguage === language
      button.classList.toggle('active', active)
      button.setAttribute('aria-pressed', String(active))
    })
  })
}

export function startUiLocalization() {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return
  if (observer) return
  const refresh = () => {
    scheduled = false
    ensureSwitcher()
    localize(document.body)
  }
  observer = new MutationObserver(() => {
    if (scheduled) return
    scheduled = true
    queueMicrotask(refresh)
  })
  observer.observe(document.body, { childList: true, subtree: true })
  refresh()
}
