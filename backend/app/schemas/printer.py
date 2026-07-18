from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class PrinterBase(BaseModel):
    name: Optional[str] = None
    ip_address: str
    password: Optional[str] = None
    location: Optional[str] = None
    brand: Optional[str] = None
    status: Optional[str] = "Unknown"

    # Added fields
    hostname: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    network: Optional[str] = None
    is_color: Optional[bool] = None
    page_count: Optional[int] = None
    toner_black: Optional[int] = None
    toner_cyan: Optional[int] = None
    toner_magenta: Optional[int] = None
    toner_yellow: Optional[int] = None
    drum_unit: Optional[int] = None
    fuser_unit: Optional[int] = None
    laser_unit: Optional[int] = None
    pf_kit_mp: Optional[int] = None
    pf_kit_1: Optional[int] = None
    printer_status: Optional[str] = None
    department: Optional[str] = None
    online: Optional[bool] = None
    last_seen: Optional[datetime] = None
class PrinterCreate(PrinterBase):
    pass

class PrinterUpdate(BaseModel):
    name: Optional[str] = None
    ip_address: Optional[str] = None
    password: Optional[str] = None
    location: Optional[str] = None
    brand: Optional[str] = None
    status: Optional[str] = None

class PrinterResponse(PrinterBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)