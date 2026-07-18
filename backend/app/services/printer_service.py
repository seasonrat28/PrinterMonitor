from sqlalchemy.orm import Session
from app.models.printer import Printer
from app.schemas.printer import PrinterCreate, PrinterUpdate

def create_printer(db: Session, printer: PrinterCreate):
    db_printer = Printer(**printer.model_dump())
    db.add(db_printer)
    db.commit()
    db.refresh(db_printer)
    return db_printer

def update_printer(db: Session, db_printer: Printer, printer_update: PrinterUpdate):
    update_data = printer_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_printer, key, value)
    
    db.commit()
    db.refresh(db_printer)
    return db_printer

def delete_printer(db: Session, db_printer: Printer):
    db.delete(db_printer)
    db.commit()
    return db_printer

def get_printer(db: Session, printer_id: int):
    return db.query(Printer).filter(Printer.id == printer_id).first()

def list_printers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Printer).offset(skip).limit(limit).all()