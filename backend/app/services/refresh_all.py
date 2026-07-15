"""
refresh_all.py — Helper to refresh ALL printers in DB sequentially.
Called by the scheduler or manually from a router endpoint.
"""
from sqlalchemy.orm import Session
from concurrent.futures import ThreadPoolExecutor

from app.models.printer import Printer
from app.services.update_service import refresh_printer
from app.db.session import SessionLocal


def refresh_all(db: Session):
    """Refresh SNMP data for every printer in the database concurrently."""
    printers = db.query(Printer).all()
    results = []

    def update_single_printer(printer_id, ip_address):
        db_worker = SessionLocal()
        try:
            refresh_printer(db_worker, printer_id)
            return {"ip": ip_address, "status": "refreshed"}
        except Exception as exc:
            return {"ip": ip_address, "status": "error", "detail": str(exc)}
        finally:
            db_worker.close()

    with ThreadPoolExecutor(max_workers=min(50, len(printers))) as executor:
        futures = [executor.submit(update_single_printer, p.id, p.ip_address) for p in printers]
        for f in futures:
            results.append(f.result())

    return results