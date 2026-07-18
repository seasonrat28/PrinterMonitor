from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.printer import Printer
from app.schemas.printer import PrinterCreate, PrinterUpdate

def create_printer(db: Session, printer: PrinterCreate) -> Printer:
    db_printer = Printer(**printer.model_dump())
    db.add(db_printer)
    db.commit()
    db.refresh(db_printer)
    return db_printer

def update_printer(db: Session, db_printer: Printer, printer_update: PrinterUpdate) -> Printer:
    update_data = printer_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_printer, key, value)
    
    db.commit()
    db.refresh(db_printer)
    return db_printer

def delete_printer(db: Session, db_printer: Printer) -> Printer:
    db.delete(db_printer)
    db.commit()
    return db_printer

def get_printer(db: Session, printer_id: int) -> Optional[Printer]:
    stmt = select(Printer).where(Printer.id == printer_id)
    return db.execute(stmt).scalars().first()

def list_printers(db: Session, skip: int = 0, limit: int = 100) -> List[Printer]:
    stmt = select(Printer).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())