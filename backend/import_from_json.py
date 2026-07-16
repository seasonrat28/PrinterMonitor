import json
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.printer import Printer
from app.database.init_db import init_database

def main():
    # Make sure DB is initialized
    init_database()

    with open("excel_preview.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    db = SessionLocal()
    try:
        # Load data from "ไอพีปริ้นเตอร์เปาโลเกษตร " sheet which has IP, Location, Building etc
        sheet_data = data.get("ไอพีปริ้นเตอร์เปาโลเกษตร ", {}).get("data", [])
        
        # Also let's check "สำรวจขนาดเครื่อง"
        sheet2 = data.get("สำรวจขนาดเครื่อง", {}).get("data", [])
        
        all_rows = sheet_data + sheet2
        
        updated_count = 0
        added_count = 0
        
        for row in all_rows:
            ip = str(row.get("IP", "")).strip()
            if not ip or ip == "nan":
                continue
                
            location = str(row.get("สถานที่ตั้งเครื่อง", "")).strip()
            details = str(row.get("คำอธิบายเพิ่มเติม", "")).strip()
            
            if location == "nan": location = ""
            if details == "nan": details = ""
            
            full_loc = location
            if details:
                full_loc += f" ({details})"
                
            printer = db.query(Printer).filter(Printer.ip_address == ip).first()
            if printer:
                printer.location = full_loc
                updated_count += 1
            else:
                printer = Printer(
                    ip_address=ip,
                    location=full_loc,
                    department="Unknown",
                    status="Unknown",
                    online=False,
                    is_color=True
                )
                db.add(printer)
                added_count += 1
                
        db.commit()
        print(f"Updated {updated_count} printers, added {added_count} printers from Excel data.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
