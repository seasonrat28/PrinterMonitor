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