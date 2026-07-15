import sqlite3
import logging

logger = logging.getLogger(__name__)


def migrate():
    try:
        conn = sqlite3.connect(r"C:\Users\PORO OPOR\Downloads\PrinterMonitor\backend\database\printer.db")
        cursor = conn.cursor()

        # Add paper_jam_count
        try:
            cursor.execute("ALTER TABLE printers ADD COLUMN paper_jam_count INTEGER DEFAULT 0")
            logger.info("Added paper_jam_count")
        except sqlite3.OperationalError as e:
            logger.warning("Column paper_jam_count may already exist: %s", e)

        # Add last_error
        try:
            cursor.execute("ALTER TABLE printers ADD COLUMN last_error VARCHAR(255) DEFAULT ''")
            logger.info("Added last_error")
        except sqlite3.OperationalError as e:
            logger.warning("Column last_error may already exist: %s", e)

        conn.commit()
        conn.close()
    except Exception:
        logger.exception("Migration error")


if __name__ == "__main__":
    migrate()
