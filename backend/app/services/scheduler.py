import datetime
import logging
from apscheduler.schedulers.background import BackgroundScheduler

from app.db.session import SessionLocal
from app.services.scan_service import scan_and_save
from app.services.monitor_service import refresh_printer_statuses
from app.core.config import (
    DEFAULT_NETWORK,
    POLL_INTERVAL,
    SCAN_END,
    SCAN_START,
    STATUS_POLL_INTERVAL,
)

scheduler = BackgroundScheduler()
logger = logging.getLogger(__name__)


def auto_scan():
    if not DEFAULT_NETWORK:
        return

    db = SessionLocal()

    try:
        logger.info("%s", "=" * 50)
        logger.info("AUTO SCAN START")

        scan_and_save(db, DEFAULT_NETWORK, SCAN_START, SCAN_END)

        logger.info("AUTO SCAN END")
        logger.info("%s", "=" * 50)

    finally:
        db.close()


def refresh_statuses():
    db = SessionLocal()
    try:
        refresh_printer_statuses(db)
    finally:
        db.close()


def start_scheduler():

    scheduler.add_job(
        auto_scan,
        "interval",
        seconds=POLL_INTERVAL,
        id="network_scan",
        replace_existing=True,
        next_run_time=datetime.datetime.now()
    )
    scheduler.add_job(
        refresh_statuses,
        "interval",
        seconds=STATUS_POLL_INTERVAL,
        id="printer_status_check",
        replace_existing=True,
    )

    scheduler.start()

    logger.info("Scheduler Started")
