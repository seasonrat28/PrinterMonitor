from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.printer import Printer
from app.services.printer_info import get_printer_info
from app.services.scan_service import _apply_info

SYS_NAME_OID = "1.3.6.1.2.1.1.5.0"


def refresh_printer_statuses(db: Session) -> None:
    """
    Update the live state of saved printers without running a full network
    discovery. Unlike a ping sweep, this queries each already-known printer's
    IP directly via SNMP, so toner/page-count/status get refreshed on this
    (fast, 30s) cycle instead of waiting for the full network scan cycle.
    """
    printers = db.query(Printer).all()
    if not printers:
        return

    def check(printer_id, ip_address):
        # Full SNMP fetch (sysName, toner, page count, status, ...)
        info = get_printer_info(ip_address)
        return printer_id, info

    with ThreadPoolExecutor(max_workers=min(50, len(printers))) as executor:
        results = dict(executor.map(lambda p: check(p.id, p.ip_address), printers))

    now = datetime.utcnow()
    for printer in printers:
        info = results[printer.id]
        is_online = bool(info)
        printer.online = is_online
        if is_online:
            _apply_info(printer, info)
            printer.printer_status = info.get("status", printer.printer_status)
            printer.status = "Online"
            printer.last_seen = now
        else:
            printer.status = "Offline"

    db.commit()
