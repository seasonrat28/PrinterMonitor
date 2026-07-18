from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import String, Boolean, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.printer_log import PrinterLog

class Printer(Base):
    __tablename__ = "printers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[Optional[str]] = mapped_column(String, index=True)
    ip_address: Mapped[str] = mapped_column(String, unique=True, index=True)
    password: Mapped[Optional[str]] = mapped_column(String)
    location: Mapped[Optional[str]] = mapped_column(String)
    brand: Mapped[Optional[str]] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="Unknown")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Added fields for scan_service.py
    hostname: Mapped[Optional[str]] = mapped_column(String)
    model: Mapped[Optional[str]] = mapped_column(String)
    serial_number: Mapped[Optional[str]] = mapped_column(String)
    network: Mapped[Optional[str]] = mapped_column(String, index=True)
    is_color: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    page_count: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    toner_black: Mapped[Optional[int]] = mapped_column(Integer)
    toner_cyan: Mapped[Optional[int]] = mapped_column(Integer)
    toner_magenta: Mapped[Optional[int]] = mapped_column(Integer)
    toner_yellow: Mapped[Optional[int]] = mapped_column(Integer)
    drum_unit: Mapped[Optional[int]] = mapped_column(Integer)
    fuser_unit: Mapped[Optional[int]] = mapped_column(Integer)
    laser_unit: Mapped[Optional[int]] = mapped_column(Integer)
    pf_kit_mp: Mapped[Optional[int]] = mapped_column(Integer)
    pf_kit_1: Mapped[Optional[int]] = mapped_column(Integer)
    printer_status: Mapped[Optional[str]] = mapped_column(String)
    department: Mapped[Optional[str]] = mapped_column(String)
    online: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    last_seen: Mapped[Optional[datetime]] = mapped_column(DateTime)

    logs: Mapped[List["PrinterLog"]] = relationship("PrinterLog", back_populates="printer", cascade="all, delete-orphan")