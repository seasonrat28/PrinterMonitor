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

        # Add fields for scan_service
        new_columns = [
            ("hostname", "VARCHAR(255)"),
            ("model", "VARCHAR(255)"),
            ("serial_number", "VARCHAR(255)"),
            ("network", "VARCHAR(255)"),
            ("is_color", "BOOLEAN DEFAULT 0"),
            ("page_count", "INTEGER DEFAULT 0"),
            ("toner_black", "INTEGER"),
            ("toner_cyan", "INTEGER"),
            ("toner_magenta", "INTEGER"),
            ("toner_yellow", "INTEGER"),
            ("drum_unit", "INTEGER"),
            ("fuser_unit", "INTEGER"),
            ("laser_unit", "INTEGER"),
            ("pf_kit_mp", "INTEGER"),
            ("pf_kit_1", "INTEGER"),
            ("printer_status", "VARCHAR(255)"),
            ("department", "VARCHAR(255)"),
            ("online", "BOOLEAN DEFAULT 0"),
            ("last_seen", "DATETIME")
        ]
        
        for col_name, col_type in new_columns:
            try:
                cursor.execute(f"ALTER TABLE printers ADD COLUMN {col_name} {col_type}")
                logger.info(f"Added {col_name}")
            except sqlite3.OperationalError as e:
                logger.warning(f"Column {col_name} may already exist: %s", e)

        conn.commit()
        conn.close()
    except Exception:
        logger.exception("Migration error")


if __name__ == "__main__":
    migrate()
