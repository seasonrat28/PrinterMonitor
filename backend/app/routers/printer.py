from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import SessionLocal
from app.models.printer import Printer
from app.models.printer_history import PrinterHistory
from app.schemas.printer import PrinterCreate
from app.services import printer_service
from app.services.printer_info import get_printer_info
from app.services.update_service import refresh_printer


# ---------- Request Models ----------
class AddByIpRequest(BaseModel):
    ips: List[str]  # รองรับหลาย IP


class DeleteByIpRequest(BaseModel):
    ip: str


# ---------- Router ----------
router = APIRouter(prefix="/printers", tags=["Printers"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- CRUD ----------
@router.get("/")
def get_printers(db: Session = Depends(get_db)):
    return printer_service.get_all(db)


@router.post("/")
def create_printer(printer: PrinterCreate, db: Session = Depends(get_db)):
    return printer_service.create(db, printer)


@router.delete("/{printer_id}")
def delete_printer(printer_id: int, db: Session = Depends(get_db)):
    printer = printer_service.delete(db, printer_id)
    if not printer:
        raise HTTPException(status_code=404, detail="Printer not found")
    return {"message": "Deleted"}


@router.post("/{printer_id}/refresh")
def refresh(printer_id: int, db: Session = Depends(get_db)):
    printer = refresh_printer(db, printer_id)
    if not printer:
        raise HTTPException(status_code=404, detail="Printer not found")
    return printer


# ---------- Add by IP (bulk) ----------
@router.post("/add-by-ip")
def add_by_ip(req: AddByIpRequest, db: Session = Depends(get_db)):
    """
    เพิ่มหรืออัปเดตเครื่องพิมพ์ด้วย IP address (รองรับหลาย IP พร้อมกัน)
    Returns: list of results per IP
    """
    results = []

    for ip in req.ips:
        ip = ip.strip()
        if not ip:
            continue

        exists = db.query(Printer).filter(Printer.ip_address == ip).first()
        if exists:
            # อัปเดตข้อมูลล่าสุด
            updated = refresh_printer(db, exists.id)
            results.append({"ip": ip, "action": "updated", "id": updated.id if updated else exists.id})
            continue

        info = get_printer_info(ip)
        
        # If offline or no SNMP, create as Unknown
        printer_data = PrinterCreate(
            ip_address=ip,
            hostname=info.get("hostname", "") if info else "Unknown",
            brand=info.get("brand", "") if info else "",
            model=info.get("model", "") if info else "",
            serial_number=info.get("serial_number", "") if info else "",
            location=info.get("location", "") if info else "",
            department=""
        )
        obj = printer_service.create(db, printer_data)
        
        if info:
            refreshed = refresh_printer(db, obj.id)
            results.append({"ip": ip, "action": "created", "id": refreshed.id if refreshed else obj.id})
        else:
            # Mark it offline explicitly
            obj.online = False
            db.commit()
            results.append({"ip": ip, "action": "created_offline", "id": obj.id})

    if not results:
        raise HTTPException(status_code=400, detail="No valid IPs provided")

    return results


# ---------- Delete by IP ----------
@router.delete("/ip/{ip}")
def delete_printer_by_ip(ip: str, db: Session = Depends(get_db)):
    obj = db.query(Printer).filter(Printer.ip_address == ip).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Printer not found")
    printer_service.delete(db, obj.id)
    return {"message": "Deleted", "ip": ip}


# ---------- History ----------
@router.get("/{printer_id}/history")
def get_history(printer_id: int, db: Session = Depends(get_db)):
    history = (
        db.query(PrinterHistory)
        .filter(PrinterHistory.printer_id == printer_id)
        .order_by(PrinterHistory.timestamp.asc())
        .limit(200)
        .all()
    )
    return history


# ---------- Printer Live Info ----------
@router.get("/{printer_id}/info")
def printer_info(printer_id: int, db: Session = Depends(get_db)):
    printer = printer_service.get_by_id(db, printer_id)
    if not printer:
        raise HTTPException(status_code=404, detail="Printer not found")
    return get_printer_info(printer.ip_address)