from app.services.snmp_service import snmp_get_multiple, snmp_walk

from app.vendor.brother import BrotherVendor
from app.vendor.hp import HPVendor
from app.vendor.canon import CanonVendor
from app.vendor.ricoh import RicohVendor
from app.vendor.kyocera import KyoceraVendor
from app.vendor.xerox import XeroxVendor
from app.vendor.fuji import FujiVendor
from app.vendor.epson import EpsonVendor
from app.vendor.lexmark import LexmarkVendor
from app.vendor.base import BasePrinterVendor

def get_printer_info(ip: str):
    """
    Retrieves printer information via SNMP using the modular Vendor Engine.
    Returns a dict with all printer data, or None if the device is not a printer.
    """
    # 1. Discovery Phase
    base_oids = [
        "1.3.6.1.2.1.1.1.0", # sysDescr
        "1.3.6.1.2.1.1.2.0", # sysObjectID
        "1.3.6.1.2.1.1.5.0", # sysName
        "1.3.6.1.2.1.1.6.0", # sysLocation
        "1.3.6.1.2.1.43.5.1.1.16.1", # printerName
        "1.3.6.1.2.1.25.3.2.1.3.1" # hrDeviceDescr
    ]
    
    discovery_res = snmp_get_multiple(ip, base_oids, timeout=3)
    if not discovery_res:
        return None
        
    sys_descr = discovery_res.get("1.3.6.1.2.1.1.1.0") or ""
    sys_object_id = discovery_res.get("1.3.6.1.2.1.1.2.0") or ""
    sys_name = discovery_res.get("1.3.6.1.2.1.1.5.0") or ""
    sys_location = discovery_res.get("1.3.6.1.2.1.1.6.0") or ""
    printer_name = discovery_res.get("1.3.6.1.2.1.43.5.1.1.16.1") or ""
    hr_device_descr = discovery_res.get("1.3.6.1.2.1.25.3.2.1.3.1") or ""

    # If it's a completely unresponsive or empty device, fail early
    if not sys_descr and not sys_object_id:
        return None

    # 2. Identify Vendor
    vendor_classes = [
        BrotherVendor,
        HPVendor,
        CanonVendor,
        RicohVendor,
        KyoceraVendor,
        XeroxVendor,
        FujiVendor,
        EpsonVendor,
        LexmarkVendor
    ]
    
    vendor_instance = None
    brand_name = "Unknown"
    
    for v_class in vendor_classes:
        temp_instance = v_class(ip, snmp_get_multiple, snmp_walk)
        if temp_instance.detect(sys_descr, sys_object_id):
            vendor_instance = temp_instance
            brand_name = v_class.__name__.replace("Vendor", "")
            break
            
    if not vendor_instance:
        # Fallback to generic base
        vendor_instance = BasePrinterVendor(ip, snmp_get_multiple, snmp_walk)
        brand_name = "Generic"
        
    # 3. Read Data
    model = vendor_instance.read_model(sys_descr, hr_device_descr, printer_name)
    serial_number = vendor_instance.read_serial()
    status = vendor_instance.read_status()
    page_count = vendor_instance.read_counter()
    supplies = vendor_instance.read_supplies()
    errors_info = vendor_instance.read_errors()
    
    # 4. Determine if it's color (basic heuristic based on supplies)
    is_color = not (supplies.get("toner_cyan") is None and 
                    supplies.get("toner_magenta") is None and 
                    supplies.get("toner_yellow") is None)
                    


    # Return strict dictionary - no fake defaults here.
    return {
        "hostname": sys_name,
        "brand": brand_name if brand_name != "Generic" else "",
        "model": model,
        "serial_number": serial_number,
        "location": sys_location,
        "is_color": is_color,
        "page_count": page_count,
        "toner_black": supplies.get("toner_black"),
        "toner_cyan": supplies.get("toner_cyan"),
        "toner_magenta": supplies.get("toner_magenta"),
        "toner_yellow": supplies.get("toner_yellow"),
        "drum_unit": supplies.get("drum_unit"),
        "fuser_unit": supplies.get("fuser_unit"),
        "laser_unit": supplies.get("laser_unit"),
        "pf_kit_mp": supplies.get("pf_kit_mp"),
        "pf_kit_1": supplies.get("pf_kit_1"),
        "status": status,
        "last_error": errors_info.get("last_error", ""),
        "paper_jam_count": errors_info.get("paper_jam_count", 0)
    }
