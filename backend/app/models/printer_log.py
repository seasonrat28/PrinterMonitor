from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base

class PrinterLog(Base):
    __tablename__ = "printer_logs"

    id = Column(Integer, primary_key=True, index=True)
    printer_id = Column(Integer, ForeignKey("printers.id"))
    page_counter = Column(Integer, nullable=True)
    toner = Column(String, nullable=True)
    drum = Column(String, nullable=True)
    scan_count = Column(String, nullable=True)
    paper_jam = Column(Integer, nullable=True)
    raw_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    printer = relationship("Printer", back_populates="logs")
