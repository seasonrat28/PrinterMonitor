from sqlalchemy import Column, Integer, DateTime, ForeignKey
from datetime import datetime

from app.db.base_class import Base

class PrinterHistory(Base):
    __tablename__ = "printer_history"

    id = Column(Integer, primary_key=True, index=True)
    printer_id = Column(Integer, ForeignKey("printers.id", ondelete="CASCADE"), nullable=False)
    
    page_count = Column(Integer, default=0)
    toner_black = Column(Integer, default=0)
    toner_cyan = Column(Integer, default=0)
    toner_magenta = Column(Integer, default=0)
    toner_yellow = Column(Integer, default=0)
    
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
