from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.printer import Printer


TONER_LOW_THRESHOLD = 20  # %


def get_dashboard(db: Session):

    total = db.query(Printer).count()

    online = db.query(Printer).filter(
        Printer.online == True
    ).count()

    offline = db.query(Printer).filter(
        Printer.online == False
    ).count()

    apeos4620 = db.query(Printer).filter(
        Printer.model.contains("Apeos 4620")
    ).count()

    # เครื่องที่หมึกต่ำกว่า threshold (ใดๆ ก็ได้ 1 สี)
    low_toner = db.query(Printer).filter(
        Printer.online == True,
        or_(
            Printer.toner_black < TONER_LOW_THRESHOLD,
            Printer.toner_cyan < TONER_LOW_THRESHOLD,
            Printer.toner_magenta < TONER_LOW_THRESHOLD,
            Printer.toner_yellow < TONER_LOW_THRESHOLD,
        )
    ).count()

    # 5 เครื่องล่าสุดที่ online (เรียงตาม last_seen)
    recent_qs = (
        db.query(Printer)
        .filter(Printer.online == True)
        .order_by(Printer.last_seen.desc())
        .limit(5)
        .all()
    )
    recent_printers = [
        {
            "id": p.id,
            "ip_address": p.ip_address,
            "model": p.model or "Unknown",
            "toner_black": p.toner_black,
            "toner_cyan": p.toner_cyan,
            "toner_magenta": p.toner_magenta,
            "toner_yellow": p.toner_yellow,
            "page_count": p.page_count,
            "last_seen": p.last_seen.isoformat() if p.last_seen else None,
        }
        for p in recent_qs
    ]

    # เครื่องที่ toner ต่ำ (details) สำหรับ alert panel
    low_toner_qs = (
        db.query(Printer)
        .filter(
            Printer.online == True,
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

    return {
        "total": total,
        "online": online,
        "offline": offline,
        "apeos4620": apeos4620,
        "low_toner": low_toner,
        "recent_printers": recent_printers,
        "low_toner_printers": low_toner_printers,
    }