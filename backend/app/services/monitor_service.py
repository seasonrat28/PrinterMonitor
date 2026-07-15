from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.printer import Printer
from app.services.snmp_service import snmp_get_multiple

SYS_NAME_OID = "1.3.6.1.2.1.1.5.0"


def refresh_printer_statuses(db: Session) -> None:
    """Update the live state of saved printers without running a full discovery."""
    printers = db.query(Printer).all()
    if not printers:
        return

    def check(printer_id, ip_address):
        # Quick check for sysName
        res = snmp_get_multiple(ip_address, [SYS_NAME_OID], timeout=2)
        is_online = bool(res.get(SYS_NAME_OID))
        return printer_id, is_online

    with ThreadPoolExecutor(max_workers=min(50, len(printers))) as executor:
        states = dict(executor.map(lambda p: check(p.id, p.ip_address), printers))

    now = datetime.utcnow()
    for printer in printers:
        is_online = states[printer.id]
        printer.online = is_online
        printer.status = "Online" if is_online else "Offline"
        if is_online:
            printer.last_seen = now

    db.commit()
