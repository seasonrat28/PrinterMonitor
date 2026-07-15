from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

DATABASE_DIR = BASE_DIR / "database"
DATABASE_DIR.mkdir(exist_ok=True)

DB_PATH = DATABASE_DIR / "printer.db"

APP_NAME = os.getenv("APP_NAME", "Printer Monitor")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

DATABASE_URL = f"sqlite:///{DB_PATH}"

SNMP_COMMUNITY = os.getenv("SNMP_COMMUNITY", "public")
SNMP_PORT = int(os.getenv("SNMP_PORT", "161"))
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "180"))
STATUS_POLL_INTERVAL = int(os.getenv("STATUS_POLL_INTERVAL", "30"))
DEFAULT_NETWORK = os.getenv("DEFAULT_NETWORK", "10.119.35")
SCAN_START = int(os.getenv("SCAN_START", "1"))
SCAN_END = int(os.getenv("SCAN_END", "254"))
