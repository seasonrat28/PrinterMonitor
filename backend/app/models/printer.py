from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base

class Printer(Base):
    __tablename__ = "printers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=True)
    ip_address = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=True)
    location = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    status = Column(String, default="Unknown")
    created_at = Column(DateTime, default=datetime.utcnow)

    logs = relationship("PrinterLog", back_populates="printer", cascade="all, delete-orphan")