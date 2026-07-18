from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Text, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.printer import Printer

class PrinterLog(Base):
    __tablename__ = "printer_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    printer_id: Mapped[int] = mapped_column(ForeignKey("printers.id"))
    page_counter: Mapped[Optional[int]] = mapped_column()
    toner: Mapped[Optional[str]] = mapped_column(String)
    drum: Mapped[Optional[str]] = mapped_column(String)
    scan_count: Mapped[Optional[str]] = mapped_column(String)
    paper_jam: Mapped[Optional[int]] = mapped_column()
    raw_json: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    printer: Mapped["Printer"] = relationship("Printer", back_populates="logs")
