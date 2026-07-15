# 🖨️ PrinterMonitor

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

> บันทึกการเปลี่ยนแปลงและรายการทดสอบก่อนใช้งานจริงอยู่ที่ [`WORK_LOG.md`](WORK_LOG.md)

**PrinterMonitor** เป็นระบบสำหรับค้นหา ตรวจสอบ และจัดการเครื่องพิมพ์ในเครือข่ายเน็ตเวิร์ก (Network Printers) แบบอัตโนมัติ พร้อมหน้า Dashboard สรุปผลและเช็คระดับหมึกพิมพ์ (Toner) ผ่านโปรโตคอล **SNMP** 

โปรเจกต์นี้ถูกออกแบบมาเพื่อลดภาระงานของฝ่าย IT ในการเดินตรวจสอบเครื่องพิมพ์ทีละเครื่อง โดยระบบจะทำการสแกนเน็ตเวิร์กและดึงข้อมูลอัปเดตสถานะแบบ Real-time นำเสนอผ่าน User Interface ที่ทันสมัย

## ✨ ฟีเจอร์หลัก (Key Features)

- 🔍 **Network Scanner**: สแกนหาเครื่องพิมพ์ที่กำลังทำงานอยู่ในเครือข่าย (Ping & SNMP Discovery)
- 📊 **SNMP Fetching**: ดึงข้อมูลรุ่นของเครื่อง (Brand/Model), Serial Number, Page Counter, และระดับหมึก (Toner K/C/M/Y) อัตโนมัติ
- ⏱️ **Automated Background Job**: มี Scheduler รันทำงานอยู่เบื้องหลังเพื่ออัปเดตสถานะ (Online/Offline) และปริมาณหมึกอย่างต่อเนื่อง
- 🎨 **Premium Dashboard**: หน้าแอปพลิเคชันสวยงาม ใช้งานง่าย ค้นหาข้อมูลได้แบบ Real-time สร้างด้วย React และ Vite
- ⚙️ **RESTful API**: พัฒนาด้วย FastAPI ประสิทธิภาพสูง รองรับการนำ API ไปต่อยอดในระบบอื่นๆ ขององค์กร
- 💾 **Data Export**: สามารถส่งออกข้อมูลเครื่องพิมพ์ทั้งหมดเป็นไฟล์ CSV ได้

---

## 🛠️ โครงสร้างของโปรเจกต์ (Architecture)

โปรเจกต์นี้ถูกแบ่งออกเป็น 2 ส่วนหลักๆ (Microservices architecture style) คือ Backend และ Frontend

### 1. Backend (FastAPI + SQLite + pysnmp)
- **ตำแหน่ง:** โฟลเดอร์ `backend/`
- ทำหน้าที่จัดการฐานข้อมูล SQLite (ผ่าน SQLAlchemy), สแกนเน็ตเวิร์กเบื้องหลัง, และสื่อสารกับเครื่องพิมพ์ผ่าน SNMP (pysnmp)
- มี API Documentation ในตัว (Swagger UI) ที่ `http://localhost:8000/docs`

### 2. Frontend (React + Vite)
- **ตำแหน่ง:** โฟลเดอร์ `frontend/`
- หน้าตาของแอปพลิเคชันพัฒนาด้วย React 18 และ Vite
- ใช้ Vanilla CSS พร้อมเทคนิค Glassmorphism และ Gradients ทำให้ UI ดูโมเดิร์น

---

## 🚀 วิธีการติดตั้งและเริ่มต้นใช้งาน (Quick Start)

### วิธีรันแบบรวบรัด (Windows)
วิธีที่ง่ายที่สุด คือการใช้ไฟล์ Batch Script ที่เตรียมไว้:

1. ดับเบิลคลิกที่ไฟล์ **`start.bat`** ในโฟลเดอร์หลัก
2. ระบบจะเปิดหน้าต่าง Command Prompt ขึ้นมาเพื่อรัน Backend และ Frontend
3. **เว็บบราว์เซอร์จะเปิดไปที่ `http://localhost:5173` อัตโนมัติ!**
4. สามารถเริ่มต้นใช้งาน Dashboard ได้ทันที 

> ⚠️ *หมายเหตุ: ห้ามปิดหน้าต่าง Command Prompt สีดำขณะใช้งาน แต่สามารถย่อพับ (Minimize) ได้*

### วิธีรันด้วยตนเอง (Manual Setup)

**รัน Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate     # สำหรับ Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

**รัน Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📝 วิธีการใช้งาน Dashboard

1. **Dashboard Overview**: แสดงสรุปยอดรวมของปริ้นเตอร์ทั้งหมด, จำนวนเครื่อง Online/Offline, และแจ้งเตือน Toner ต่ำ (ต่ำกว่า 20%)
2. **All Printers**: หน้าตารางแสดงรายการเครื่องพิมพ์ทั้งหมดในระบบ
   - **Toner Bars**: แถบสีแสดงระดับหมึก 4 สี (ดำ, ฟ้า, แดง, เหลือง)
   - **Search**: ค้นหาเครื่องตาม IP, Model หรือ Hostname ได้ทันที
   - **Refresh**: ปุ่มดึงข้อมูลล่าสุดจาก SNMP แบบ Manual
   - **Export CSV**: ดาวน์โหลดข้อมูลออกเป็นไฟล์ CSV สำหรับทำรายงาน
3. **Network Scanning**: คุณสามารถระบุวงเครือข่าย เช่น `10.119.35` แล้วกดปุ่ม "ค้นหาเครื่องพิมพ์" ระบบจะสแกนหา IP 1-254 ในเบื้องหลัง

---

## ⚙️ การตั้งค่าระบบเพิ่มเติม (Configuration)

หากต้องการปรับแต่งการทำงาน สามารถแก้ไขไฟล์ `backend/.env` ได้:

```env
APP_NAME=Printer Monitor
PORT=8000
SNMP_COMMUNITY=public
SNMP_PORT=161
DEFAULT_NETWORK=10.119.35
POLL_INTERVAL=180          # ระยะเวลา Auto Scan (วินาที)
STATUS_POLL_INTERVAL=30    # ระยะเวลาเช็คสถานะ Online/Offline (วินาที)
```
