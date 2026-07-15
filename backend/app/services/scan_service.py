"""
scan_service.py — Scans a network range and saves/updates printers in DB.
This is the canonical scan service used by the scheduler and scan router.
(Replaced the old duplicate scanner_service.py)
"""
from datetime import datetime
import logging

from sqlalchemy.orm import Session

from app.models.printer import Printer
from app.services.printer_info import get_printer_info
from app.services.scanner import scan_network

logger = logging.getLogger(__name__)


def scan_and_save(db: Session, network: str, start: int = 1, end: int = 254):
    """
    Ping every IP in [network.start .. network.end], run SNMP on responding
    hosts, and upsert the result into the database.
    """
    results = []

    devices = scan_network(network, start, end)

    for device in devices:
        if not device["online"]:
            # Mark existing DB entries as offline if they didn't respond to ping
            ip = device["ip"]
            existing = db.query(Printer).filter(Printer.ip_address == ip).first()
            if existing:
                existing.online = False
                existing.status = "Offline"
            continue

        ip = device["ip"]
        logger.debug("[PING OK] %s", ip)

        info = get_printer_info(ip)

        # Skip non-printer devices (no Printer-MIB response)
        if not info:
            logger.debug("[SKIP] %s — not a printer or SNMP disabled", ip)
            continue

        exists = db.query(Printer).filter(Printer.ip_address == ip).first()

        if exists:
            logger.info("[UPDATE] %s", ip)
            _apply_info(exists, info)
            exists.online = True
            exists.status = "Online"
            exists.last_seen = datetime.utcnow()
            db.commit()
            results.append({"id": exists.id, "ip": ip, "action": "updated"})
        else:
            logger.info("[CREATE] %s", ip)
            printer = Printer(
                ip_address=ip,
                hostname=info.get("hostname", ""),
                brand=info.get("brand", ""),
                model=info.get("model", ""),
                serial_number=info.get("serial_number", ""),
                is_color=info.get("is_color", True),
                page_count=info.get("page_count", 0),
                toner_black=info.get("toner_black", 0),
                toner_cyan=info.get("toner_cyan"),
                toner_magenta=info.get("toner_magenta"),
                toner_yellow=info.get("toner_yellow"),
                drum_unit=info.get("drum_unit"),
                fuser_unit=info.get("fuser_unit"),
                laser_unit=info.get("laser_unit"),
                pf_kit_mp=info.get("pf_kit_mp"),
                pf_kit_1=info.get("pf_kit_1"),
                printer_status=info.get("status", "Ready"),
                paper_jam_count=info.get("paper_jam_count", 0),
                last_error=info.get("last_error", ""),
                location="Unknown",
                department="Unknown",
                online=True,
                status="Online",
                last_seen=datetime.utcnow(),
            )
            db.add(printer)
            db.commit()
            db.refresh(printer)
            results.append({"id": printer.id, "ip": ip, "action": "created"})

    return results


def _apply_info(printer: Printer, info: dict):
    """Apply an info dict to an existing Printer ORM object."""
    printer.hostname = info.get("hostname", printer.hostname)
    printer.brand = info.get("brand", printer.brand)
    printer.model = info.get("model", printer.model)
    printer.serial_number = info.get("serial_number", printer.serial_number)
    printer.is_color = info.get("is_color", printer.is_color)
    printer.page_count = info.get("page_count", printer.page_count)
    
    # Location
    if "location" in info and info["location"]:
        printer.location = info["location"]

    # Strict None mapping for supplies (No Fake Data)
    printer.toner_black = info.get("toner_black")
    printer.toner_cyan = info.get("toner_cyan")
    printer.toner_magenta = info.get("toner_magenta")
    printer.toner_yellow = info.get("toner_yellow")
    printer.drum_unit = info.get("drum_unit")
    printer.fuser_unit = info.get("fuser_unit")
    printer.laser_unit = info.get("laser_unit")
    printer.pf_kit_mp = info.get("pf_kit_mp")
    printer.pf_kit_1 = info.get("pf_kit_1")

    printer.printer_status = info.get("status", printer.printer_status)
    printer.paper_jam_count = info.get("paper_jam_count", printer.paper_jam_count)
    printer.last_error = info.get("last_error", printer.last_error)
