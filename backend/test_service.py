from app.services.fuji_service import get_printer_info

info = get_printer_info(
    "10.119.34.21",
    "Admin@5218"
)

print(info)