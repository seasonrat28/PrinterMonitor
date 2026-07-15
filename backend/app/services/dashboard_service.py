# pyrefly: ignore [missing-import]
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.printer import Printer


TONER_LOW_THRESHOLD = 20  # %


def get_dashboard(db: Session):

    total = db.query(Printer).count()

    online = db.query(Printer).filter(Printer.online).count()

    offline = db.query(Printer).filter(~Printer.online).count()

    apeos4620 = db.query(Printer).filter(
        Printer.model.contains("Apeos 4620")
    ).count()

    # เครื่องที่หมึกต่ำกว่า threshold (ใดๆ ก็ได้ 1 สี)
    low_toner = db.query(Printer).filter(
        Printer.online,
        or_(
            Printer.toner_black < TONER_LOW_THRESHOLD,
            Printer.toner_cyan < TONER_LOW_THRESHOLD,
            Printer.toner_magenta < TONER_LOW_THRESHOLD,
            Printer.toner_yellow < TONER_LOW_THRESHOLD,
        )
    ).count()

    # จัดกลุ่ม Fuji Apeos Printers (เรียงตาม IP)
    fuji_qs = (
        db.query(Printer)
        .filter(
            Printer.online,
            or_(
                Printer.model.contains("Apeos"),
                Printer.model.contains("Fuji")
            )
        )
        .order_by(Printer.ip_address.asc())
        .all()
    )
    fuji_printers = [
        {
            "id": p.id,
            "ip_address": p.ip_address,
            "model": p.model or "Unknown",
            "toner_black": p.toner_black,
            "toner_cyan": p.toner_cyan,
            "toner_magenta": p.toner_magenta,
            "toner_yellow": p.toner_yellow,
            "drum_unit": p.drum_unit,
            "page_count": p.page_count,
        }
        for p in fuji_qs
    ]

    # จัดกลุ่ม Other Printers (แบรนด์อื่นๆ)
    other_qs = (
        db.query(Printer)
        .filter(
            Printer.online,
            ~Printer.model.contains("Apeos"),
            ~Printer.model.contains("Fuji")
        )
        .order_by(Printer.ip_address.asc())
        .all()
    )
    other_printers = [
        {
            "id": p.id,
            "ip_address": p.ip_address,
            "model": p.model or "Unknown",
            "toner_black": p.toner_black,
            "toner_cyan": p.toner_cyan,
            "toner_magenta": p.toner_magenta,
            "toner_yellow": p.toner_yellow,
            "drum_unit": p.drum_unit,
            "page_count": p.page_count,
        }
        for p in other_qs
    ]
    low_toner_qs = (
        db.query(Printer)
        .filter(
            Printer.online,
            or_(
                Printer.toner_black < TONER_LOW_THRESHOLD,
                Printer.toner_cyan < TONER_LOW_THRESHOLD,
                Printer.toner_magenta < TONER_LOW_THRESHOLD,
                Printer.toner_yellow < TONER_LOW_THRESHOLD,
            ),
        )
        .order_by(Printer.toner_black.asc())
        .limit(10)
        .all()
    )
    low_toner_printers = [
        {
            "id": p.id,
            "ip_address": p.ip_address,
            "model": p.model or "Unknown",
            "toner_black": p.toner_black,
            "toner_cyan": p.toner_cyan,
            "toner_magenta": p.toner_magenta,
            "toner_yellow": p.toner_yellow,
        }
        for p in low_toner_qs
    ]

    # เครื่องที่มีกระดาษติด หรือมี Error
    error_qs = (
        db.query(Printer)
        .filter(
            Printer.online,
            or_(
                Printer.paper_jam_count > 0,
                Printer.last_error != ""
            )
        )
        .order_by(Printer.last_seen.desc())
        .limit(10)
        .all()
    )
    
    error_printers = [
        {
            "id": p.id,
            "ip_address": p.ip_address,
            "model": p.model or "Unknown",
            "paper_jam_count": p.paper_jam_count,
            "last_error": p.last_error,
        }
        for p in error_qs
    ]

    return {
        "total": total,
        "online": online,
        "offline": offline,
        "apeos4620": apeos4620,
        "low_toner": low_toner,
        "fuji_printers": fuji_printers,
        "other_printers": other_printers,
        "low_toner_printers": low_toner_printers,
        "error_printers": error_printers,
    }