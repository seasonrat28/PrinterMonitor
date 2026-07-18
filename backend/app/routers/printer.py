from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.schemas.printer import PrinterCreate, PrinterUpdate, PrinterResponse
from app.services import printer_service
from app.models.printer import Printer

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