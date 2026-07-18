from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import String
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

    logs: Mapped[List["PrinterLog"]] = relationship("PrinterLog", back_populates="printer", cascade="all, delete-orphan")