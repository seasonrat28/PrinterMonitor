from sqlalchemy.orm import Session

from app.models.printer import Printer
from app.schemas.printer import PrinterCreate


def get_by_id(db: Session, printer_id: int):
    return (
        db.query(Printer)
        .filter(Printer.id == printer_id)
        .first()
    )


def get_all(db: Session):
    return (
        db.query(Printer)
        .order_by(Printer.ip_address)
        .all()
    )


def create(db: Session, printer: PrinterCreate):

    obj = Printer(
        ip_address=printer.ip_address,
        hostname=printer.hostname,
        brand=printer.brand,
        model=printer.model,
        serial_number=printer.serial_number,
        location=printer.location,
        department=printer.department,
        status="Online",
        online=True
    )

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return obj


def delete(db: Session, printer_id: int):

    obj = (
        db.query(Printer)
        .filter(Printer.id == printer_id)
        .first()
    )

    if obj:
        db.delete(obj)
        db.commit()

    return obj