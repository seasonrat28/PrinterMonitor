"""
update_service.py — Refresh a single printer's SNMP data and save a history snapshot.
"""
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.printer import Printer
from app.models.printer_history import PrinterHistory
from app.services.printer_info import get_printer_info


def refresh_printer(db: Session, printer_id: int):
    printer = db.query(Printer).filter(Printer.id == printer_id).first()
    if not printer:
        return None

    info = get_printer_info(printer.ip_address)

    # ---- Offline ----
    if not info:
        printer.online = False
        printer.status = "Offline"
        printer.last_update = datetime.utcnow()
        db.commit()
        db.refresh(printer)
        return printer

    # ---- Apply data ----
    printer.hostname = info.get("hostname", printer.hostname)
    printer.brand = info.get("brand", printer.brand)
    printer.model = info.get("model", printer.model)
    printer.serial_number = info.get("serial_number", printer.serial_number)
    if "location" in info and info["location"]:
        printer.location = info["location"]
    printer.is_color = info.get("is_color", printer.is_color)

    if info.get("page_count") is not None:
        printer.page_count = info["page_count"]

    if info.get("toner_black") is not None:
        printer.toner_black = info["toner_black"]

    # Color toners: only update if SNMP responded (None means not available)
    if info.get("toner_cyan") is not None:
        printer.toner_cyan = info["toner_cyan"]
    if info.get("toner_magenta") is not None:
        printer.toner_magenta = info["toner_magenta"]
    if info.get("toner_yellow") is not None:
        printer.toner_yellow = info["toner_yellow"]

    # Advanced components
    if info.get("drum_unit") is not None:
        printer.drum_unit = info["drum_unit"]
    if info.get("fuser_unit") is not None:
        printer.fuser_unit = info["fuser_unit"]
    if info.get("laser_unit") is not None:
        printer.laser_unit = info["laser_unit"]
    if info.get("pf_kit_mp") is not None:
        printer.pf_kit_mp = info["pf_kit_mp"]
    if info.get("pf_kit_1") is not None:
        printer.pf_kit_1 = info["pf_kit_1"]

    printer.printer_status = info.get("status", printer.printer_status)
    printer.status = "Online"
    printer.online = True
    printer.last_update = datetime.utcnow()

    db.commit()
    db.refresh(printer)

    # ---- History Snapshot ----
    history = PrinterHistory(
        printer_id=printer.id,
        page_count=printer.page_count,
        toner_black=printer.toner_black,
        toner_cyan=printer.toner_cyan,
        toner_magenta=printer.toner_magenta,
        toner_yellow=printer.toner_yellow,
    )
    db.add(history)
    db.commit()

    return printer