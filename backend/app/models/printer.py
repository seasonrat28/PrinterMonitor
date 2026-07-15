from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime

from app.db.base_class import Base


class Printer(Base):
    __tablename__ = "printers"

    id = Column(Integer, primary_key=True, index=True)

    ip_address = Column(String(50), unique=True, nullable=False)
    hostname = Column(String(100))
    brand = Column(String(100))
    model = Column(String(100))
    serial_number = Column(String(100))

    location = Column(String(100))
    department = Column(String(100))

    status = Column(String(50), default="Unknown")
    online = Column(Boolean, default=False)
    is_color = Column(Boolean, default=True)

    # จำนวนหน้าที่พิมพ์ทั้งหมด
    page_count = Column(Integer, default=0)

    # ระดับหมึก (%)
    toner_black = Column(Integer, nullable=True)
    toner_cyan = Column(Integer, nullable=True)
    toner_magenta = Column(Integer, nullable=True)
    toner_yellow = Column(Integer, nullable=True)

    # Advanced Component Status — เก็บเป็น % (0-100)
    drum_unit = Column(Integer, nullable=True)
    fuser_unit = Column(Integer, nullable=True)
    laser_unit = Column(Integer, nullable=True)
    pf_kit_mp = Column(Integer, nullable=True)
    pf_kit_1 = Column(Integer, nullable=True)

    # Advanced Component — เก็บจำนวนหน้าคงเหลือ (pages remaining)
    drum_unit_pages = Column(Integer, nullable=True)
    fuser_unit_pages = Column(Integer, nullable=True)
    laser_unit_pages = Column(Integer, nullable=True)
    pf_kit_mp_pages = Column(Integer, nullable=True)
    pf_kit_1_pages = Column(Integer, nullable=True)

    # สถานะเครื่อง
    printer_status = Column(String(100), default="Ready")
    error_code = Column(String(100), default="")
    
    # ข้อผิดพลาดล่าสุดและจำนวนกระดาษติด
    last_error = Column(String(255), default="")
    paper_jam_count = Column(Integer, default=0)

    # เวลาที่พบเครื่องล่าสุด
    last_seen = Column(DateTime, default=datetime.utcnow)

    # เวลาที่อัปเดตข้อมูลล่าสุด
    last_update = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )