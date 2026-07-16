# บันทึกการปรับปรุง PrinterMonitor

อัปเดตล่าสุด: 16 กรกฎาคม 2026

## อัปเดต 16 กรกฎาคม 2026

| ส่วน | รายการที่เปลี่ยน | ไฟล์ |
| --- | --- | --- |
| แก้ข้อมูลผิด | เอา hack เฉพาะรุ่น "4620" ที่เอาค่า toner_black ไปทับ drum_unit และบังคับ is_color=False ออก ให้ใช้ค่าที่อ่านจาก SNMP จริงเท่านั้น | `backend/app/services/printer_info.py` |
| Real-time | job ที่รันทุก 30 วิ เปลี่ยนจากเช็คแค่ Online/Offline เป็นดึงข้อมูลเต็ม (toner/page count/status) ของเครื่องที่มีอยู่แล้วด้วย ไม่ต้องรอ full scan ทุก 180 วิ | `backend/app/services/monitor_service.py` |
| หลายวงเครือข่าย | รองรับสแกนหลายวงพร้อมกัน (`DEFAULT_NETWORKS` คั่นด้วย ,) และบันทึกว่าเครื่องแต่ละเครื่องมาจากวงไหน (`network` column ใหม่) พร้อม auto-migration ให้ database เดิมไม่ต้องลบทิ้ง | `backend/app/models/printer.py`, `backend/app/database/init_db.py`, `backend/app/core/config.py`, `backend/app/services/scan_service.py`, `backend/app/services/scheduler.py`, `backend/app/routers/scanner.py`, `backend/.env` |
| หน้าเว็บ | ช่องค้นหาเครือข่ายกรอกได้หลายวงคั่นด้วย , และเพิ่มตัวกรอง "วงเครือข่าย" ในหน้า All Printers (รวมถึงใน Search และ CSV Export) | `frontend/src/pages/Printers.jsx` |

ตรวจสอบแล้ว: syntax ฝั่ง backend ผ่านหมด (`py_compile` + import จริงทั้งแอป), ทดสอบ auto-migration บน DB จำลองแบบ schema เก่าว่าเพิ่มคอลัมน์ได้โดยไม่ลบข้อมูล, และ parse JSX ของ `Printers.jsx` ผ่าน (บิ้ลด์ vite เต็มรูปแบบไม่ได้เพราะเครื่องที่ใช้แก้โค้ดนี้ไม่มี native binding ของ rolldown สำหรับ Linux — ไม่เกี่ยวกับโค้ดที่แก้ ให้ลองบิ้ลด์อีกทีบนเครื่องที่ตั้งค่า dev environment ไว้แล้ว)

## เป้าหมาย

เตรียมโปรแกรมสำหรับใช้งานบนเครื่อง `10.119.43.25` เพื่อค้นหาและติดตามเครื่องพิมพ์ในเครือข่าย `10.119.35.0/24` ด้วย SNMP

## สิ่งที่แก้ไขแล้ว

| ส่วน | รายการที่เปลี่ยน | ไฟล์ |
| --- | --- | --- |
| วงเครือข่าย | เปลี่ยนค่าเริ่มต้นจากวงเดิม `10.119.34` เป็น `10.119.35` และกำหนดช่วง IP 1-254 | `backend/.env`, `backend/app/core/config.py` |
| หน้าค้นหา | เพิ่มช่องระบุ Network และปุ่ม **ค้นหาเครื่องพิมพ์** ในหน้า All Printers | `frontend/src/pages/Printers.jsx`, `frontend/src/services/api.js` |
| API สแกน | รับค่า network/start/end จากหน้าเว็บ แทนการล็อกวง IP ในโค้ด | `backend/app/routers/scanner.py`, `backend/app/services/scanner.py`, `backend/app/services/scan_service.py` |
| SNMP | ปรับการเรียก SNMP ให้เข้ากับ `pysnmp 7.1.27` และอ่านค่า community/port จาก `.env` | `backend/app/services/snmp_service.py` |
| คัดกรองอุปกรณ์ | บันทึกเฉพาะอุปกรณ์ที่ตอบค่า Printer-MIB name หรือ serial number ไม่บันทึกคอมพิวเตอร์/อุปกรณ์เครือข่ายที่ ping ตอบ | `backend/app/services/printer_info.py` |
| สถานะ Online/Offline | เพิ่มการตรวจ SNMP ของเครื่องที่บันทึกไว้ทุก 30 วินาที และเปลี่ยนสถานะเป็น Offline เมื่อไม่ตอบ SNMP | `backend/app/services/monitor_service.py`, `backend/app/services/scheduler.py` |
| การอัปเดตหน้าเว็บ | หน้า Dashboard และ All Printers ดึงข้อมูลใหม่ทุก 15 วินาที | `frontend/src/pages/Dashboard.jsx`, `frontend/src/pages/Printers.jsx` |
| การย้ายเครื่อง | ปรับ `start.bat` ให้สร้าง Python environment และติดตั้ง dependency ใหม่อัตโนมัติบนเครื่องปลายทาง | `start.bat` |
| เอกสาร | เพิ่มตัวอย่างการตั้งค่าและคู่มือติดตั้งที่สำนักงาน | `backend/.env.example`, `SETUP_AT_OFFICE.md` |

## การตรวจสอบที่ทำแล้ว

- ตรวจไวยากรณ์ Python ของไฟล์ backend ที่แก้ไขแล้ว: ผ่าน
- สร้าง production build ของ React/Vite: ผ่าน
- ตรวจว่าโค้ดไม่มีการอ้างอิงวง `10.119.34` ในส่วนการทำงาน: ผ่าน

## สิ่งที่ต้องทดสอบที่องค์กร

ไม่สามารถทดสอบจากคอมพิวเตอร์ที่บ้านได้ เพราะไม่มีเส้นทางไปยังเครือข่าย `10.119.35.0/24`:

1. เปิด `start.bat` บนเครื่อง `10.119.43.25` และรอให้การติดตั้งครั้งแรกเสร็จ
2. เปิดหน้า All Printers แล้วกด **ค้นหาเครื่องพิมพ์** โดยใช้ Network `10.119.35`
3. ยืนยันว่าอย่างน้อยหนึ่งเครื่องแสดงชื่อ/รุ่น และแสดง Online
4. ปิดหรือถอดสายเครือข่ายของเครื่องทดสอบหนึ่งเครื่อง (หากได้รับอนุญาต) แล้วรอไม่เกิน 45 วินาที สถานะควรเปลี่ยนเป็น Offline
5. เปิดเครื่องกลับหรือเชื่อมต่อใหม่ แล้วรอไม่เกิน 45 วินาที สถานะควรกลับเป็น Online

## เงื่อนไขจากฝ่าย Infrastructure

- เครื่อง `10.119.43.25` ต้องติดต่อ `10.119.35.0/24` ได้
- ต้องอนุญาต SNMP แบบ UDP port 161 จากเครื่องที่รันโปรแกรมไปยังเครื่องพิมพ์
- ต้องทราบค่า SNMP community ที่ถูกต้อง แล้วใส่ใน `backend/.env` (`SNMP_COMMUNITY`)
- สำหรับการค้นหาแบบ ping ให้เร็วขึ้น ควรอนุญาต ICMP ด้วย แต่สถานะ Online/Offline ใช้ SNMP เป็นหลัก

## วิธีแก้ปัญหาเบื้องต้น

| อาการ | จุดตรวจสอบ |
| --- | --- |
| กดค้นหาแล้วไม่พบเครื่อง | ตรวจ Network ว่าเป็น `10.119.35`, ตรวจสิทธิ์ ICMP/SNMP และ `SNMP_COMMUNITY` |
| พบเครื่องแต่เป็น Offline ทั้งหมด | ค่า community หรือ UDP 161 ไม่ถูกต้อง/ถูกบล็อก |
| เปิด `start.bat` แล้วติดตั้งไม่สำเร็จ | ตรวจ Python 3.11+ , Node.js LTS และการเข้าถึง package registry ขององค์กร |
| หน้าเว็บเปิดไม่ได้ | ตรวจว่าหน้าต่าง Backend และ Frontend ยังทำงานอยู่ แล้วเปิด `http://localhost:5173` |
