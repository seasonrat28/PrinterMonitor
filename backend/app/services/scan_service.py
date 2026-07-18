"""
scan_service.py — Scans a network range and saves/updates printers in DB.
This is the canonical scan service used by the scheduler and scan router.
(Replaced the old duplicate scanner_service.py)
"""
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.printer import Printer
from app.services.printer_info import get_printer_info
from app.services.scanner import scan_network


def scan_and_save_multi(db: Session, networks: list[str], start: int = 1, end: int = 254):
    """Scan multiple network prefixes (e.g. ["10.119.34", "10.119.35", "10.119.43"])
    one at a time and combine the results."""
    combined = []
    for network in networks:
        network = network.strip()
        if not network:
            continue
        print(f"--- Scanning network {network} ---")
        combined.extend(scan_and_save(db, network, start, end))
    return combined


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
        print(f"[PING OK] {ip}")

        info = get_printer_info(ip)
        print(info)
        print(f"Location from SNMP = {info.get('location') if info else None}")

        # Skip non-printer devices (no Printer-MIB response)
        if not info:
            print(f"[SKIP] {ip} — not a printer or SNMP disabled")
            continue

        exists = db.query(Printer).filter(Printer.ip_address == ip).first()

        if exists:
            print(f"[UPDATE] {ip}")
            _apply_info(exists, info)
            exists.network = network
            exists.online = True
            exists.status = "Online"
            exists.last_seen = datetime.utcnow()
            db.commit()
            results.append({"id": exists.id, "ip": ip, "action": "updated"})
        else:
            print(f"[CREATE] {ip}")
            printer = Printer(
                ip_address=ip,
                network=network,
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
                location=info.get("location", "Unknown"),
                department=info.get("department", "Unknown"),
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
    printer.location = info.get("location", printer.location)
    printer.department = info.get("department", printer.department)
    printer.is_color = info.get("is_color", printer.is_color)
    printer.page_count = info.get("page_count", printer.page_count)
    printer.toner_black = info.get("toner_black", printer.toner_black)
    

    # Only overwrite color toners if SNMP returned a real value
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
