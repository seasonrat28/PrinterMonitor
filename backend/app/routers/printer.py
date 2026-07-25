from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.schemas.printer import PrinterCreate, PrinterUpdate, PrinterResponse
from app.services import printer_service
from app.models.printer import Printer
from app.models.printer_history import PrinterHistory
from app.services.update_service import refresh_printer

router = APIRouter(prefix="/printers", tags=["Printers"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=List[PrinterResponse])
def list_printers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return printer_service.list_printers(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=PrinterResponse)
def get_printer(id: int, db: Session = Depends(get_db)):
    printer = printer_service.get_printer(db, id)
    if not printer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Printer not found")
    return printer

@router.post("", response_model=PrinterResponse, status_code=status.HTTP_201_CREATED)
def create_printer(printer: PrinterCreate, db: Session = Depends(get_db)):
    return printer_service.create_printer(db, printer)

@router.put("/{id}", response_model=PrinterResponse)
def update_printer(id: int, printer_update: PrinterUpdate, db: Session = Depends(get_db)):
    db_printer = printer_service.get_printer(db, id)
    if not db_printer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Printer not found")
    return printer_service.update_printer(db, db_printer, printer_update)

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_printer(id: int, db: Session = Depends(get_db)):
    db_printer = printer_service.get_printer(db, id)
    if not db_printer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Printer not found")
    printer_service.delete_printer(db, db_printer)
    return {"message": "Printer deleted successfully"}


@router.post("/{id}/refresh", response_model=PrinterResponse)
def refresh_one_printer(id: int, db: Session = Depends(get_db)):
    db_printer = printer_service.get_printer(db, id)
    if not db_printer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Printer not found")

    refreshed = refresh_printer(db, id)
    if refreshed is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Printer not found")
    return refreshed


@router.get("/{id}/history")
def get_printer_history(id: int, db: Session = Depends(get_db)):
    db_printer = printer_service.get_printer(db, id)
    if not db_printer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Printer not found")

    history = db.query(PrinterHistory).filter(PrinterHistory.printer_id == id).order_by(PrinterHistory.timestamp.asc()).all()
    return [
        {
            "id": item.id,
            "printer_id": item.printer_id,
            "page_count": item.page_count,
            "toner_black": item.toner_black,
            "toner_cyan": item.toner_cyan,
            "toner_magenta": item.toner_magenta,
            "toner_yellow": item.toner_yellow,
            "timestamp": item.timestamp.isoformat() if item.timestamp else None,
        }
        for item in history
    ]


@router.post("/add-by-ip", status_code=status.HTTP_200_OK)
def add_printer_by_ip(payload: dict, db: Session = Depends(get_db)):
    ips = payload.get("ips") or []
    if not isinstance(ips, list) or not ips:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please provide at least one IP address")

    results = []
    for ip in ips:
        existing = printer_service.get_printer_by_ip(db, ip)
        if existing:
            results.append({"ip": ip, "action": "updated", "detail": "Already exists"})
        else:
            try:
                printer_service.create_printer(db, PrinterCreate(ip_address=ip, status="Unknown"))
                results.append({"ip": ip, "action": "created"})
            except Exception as e:
                results.append({"ip": ip, "action": "failed", "detail": str(e)})

    return results


@router.delete("/ip/{ip}", status_code=status.HTTP_200_OK)
def delete_printer_by_ip(ip: str, db: Session = Depends(get_db)):
    db_printer = printer_service.get_printer_by_ip(db, ip)
    if not db_printer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Printer not found")
    printer_service.delete_printer(db, db_printer)
    return {"message": "Printer deleted successfully"}