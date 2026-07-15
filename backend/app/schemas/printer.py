from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class PrinterBase(BaseModel):
    ip_address: str
    hostname: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    location: Optional[str] = None
    department: Optional[str] = None


class PrinterCreate(PrinterBase):
    pass


class PrinterResponse(PrinterBase):
    id: int

    status: str
    online: bool
    is_color: Optional[bool] = True

    # จำนวนหน้าที่พิมพ์
    page_count: Optional[int] = 0

    # ระดับหมึก (None = ไม่มี / เครื่อง mono)
    toner_black: Optional[int] = 0
    toner_cyan: Optional[int] = None
    toner_magenta: Optional[int] = None
    toner_yellow: Optional[int] = None

    # Advanced Component Status (None = ไม่มีข้อมูล)
    drum_unit: Optional[int] = None
    fuser_unit: Optional[int] = None
    laser_unit: Optional[int] = None
    pf_kit_mp: Optional[int] = None
    pf_kit_1: Optional[int] = None

    # สถานะเครื่อง
    printer_status: Optional[str] = "Ready"
    error_code: Optional[str] = ""

    # ข้อผิดพลาดล่าสุดและกระดาษติด
    last_error: Optional[str] = ""
    paper_jam_count: Optional[int] = 0

    # เวลา
    last_seen: Optional[datetime] = None
    last_update: Optional[datetime] = None

    class Config:
        from_attributes = True