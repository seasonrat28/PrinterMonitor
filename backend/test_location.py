from app.services.printer_info import get_printer_info

ip = "10.119.34.21"   # เปลี่ยนเป็น IP เครื่อง Fuji

info = get_printer_info(ip)

print(info)