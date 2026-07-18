from app.services.snmp_service import snmp_get_multiple

def parse_brother_status(brother_str: str) -> str:
    """Parse Brother enterprise status string to match BRAdmin 4."""
    if not brother_str:
        return None
    s = brother_str.lower()
    if "sleep" in s:
        if "deep" in s:
            return "Deep Sleep"
        return "Sleep"
    if "ready" in s:
        return "Ready"
    if "printing" in s:
        return "Printing"
    if "warming" in s or "warm" in s:
        return "Warming Up"
    if "jam" in s:
        return "Paper Jam"
    if "cover" in s or "open" in s:
        return "Cover Open"
    if "toner low" in s:
        return "Toner Low"
    if "replace toner" in s:
        return "Replace Toner"
    if "replace drum" in s or "drum end" in s:
        return "Replace Drum"
    if "error" in s:
        return "Error"
    if "offline" in s:
        return "Offline"
    if "busy" in s or "receiving" in s:
        return "Busy"
    
    # Capitalize first letter of each word if we don't know it
    return brother_str.title()

def parse_standard_status(hr_status: str, hr_error: str) -> str:
    """Parse standard Printer-MIB status."""
    # hrPrinterStatus: 1=other, 2=unknown, 3=idle, 4=printing, 5=warmup
    status_map = {
        "1": "Other",
        "2": "Unknown",
        "3": "Ready",
        "4": "Printing",
        "5": "Warming Up"
    }
    base_status = status_map.get(hr_status, "Online")
    return base_status

def get_printer_info(ip: str):
    """
    Retrieves printer information via SNMP using batching for optimal performance.
    Returns a dict with all printer data, or None if the device is not a printer.
    """
    base_oids = {
        "sysName": "1.3.6.1.2.1.1.5.0",
        "sysLocation": "1.3.6.1.2.1.1.6.0",
        "sysDescr": "1.3.6.1.2.1.1.1.0",
        "printerName": "1.3.6.1.2.1.43.5.1.1.16.1",
        "hrDeviceDescr": "1.3.6.1.2.1.25.3.2.1.3.1",
        "serialNumber": "1.3.6.1.2.1.43.5.1.1.17.1",
        "pageCount": "1.3.6.1.2.1.43.10.2.1.4.1.1",
        "hrPrinterStatus": "1.3.6.1.2.1.25.3.5.1.1.1",
        "hrPrinterError": "1.3.6.1.2.1.25.3.5.1.2.1",
        "brStatus1": "1.3.6.1.4.1.2435.2.3.9.4.2.1.5.5.8.0",
        "brStatus2": "1.3.6.1.4.1.2435.2.3.9.4.2.1.5.5.1.0",
        "brStatus3": "1.3.6.1.4.1.2435.2.3.9.4.2.1.5.5.11.0"
    }
    
    # Batch 1: System info
    base_results = snmp_get_multiple(ip, list(base_oids.values()), timeout=3)
    
    printer_name = base_results.get(base_oids["printerName"])
    serial_number = base_results.get(base_oids["serialNumber"])
    
    # If standard printer OIDs are missing, maybe not a printer
    if not printer_name and not serial_number:
        return None
        
    hostname = base_results.get(base_oids["sysName"], "")
    location = (
    base_results.get(base_oids["sysLocation"])
    or base_results.get(base_oids["sysName"])
    or "Unknown"
)
    model = base_results.get(base_oids["hrDeviceDescr"]) or printer_name or ""
    sys_descr = base_results.get(base_oids["sysDescr"], "")
    page_count_str = base_results.get(base_oids["pageCount"])
    page_count = int(page_count_str) if page_count_str and page_count_str.isdigit() else 0
    
    # Status Mapping
    final_status = "Online"
    is_brother = "brother" in model.lower() or "brother" in sys_descr.lower()
    
    if is_brother:
        # Try to parse Brother string
        br_str = (
            base_results.get(base_oids["brStatus1"]) or 
            base_results.get(base_oids["brStatus2"]) or 
            base_results.get(base_oids["brStatus3"])
        )
        if br_str:
            # Clean hex/weird chars if any
            clean_str = ''.join(c for c in br_str if 32 <= ord(c) < 127).strip()
            final_status = parse_brother_status(clean_str)
        else:
            final_status = parse_standard_status(
                base_results.get(base_oids["hrPrinterStatus"]), 
                base_results.get(base_oids["hrPrinterError"])
            )
    else:
        final_status = parse_standard_status(
            base_results.get(base_oids["hrPrinterStatus"]), 
            base_results.get(base_oids["hrPrinterError"])
        )
        
    # Batch 2: Supply Descriptions
    # 20 items is safe for one request.
    desc_oids = {f"1.3.6.1.2.1.43.11.1.1.6.1.{i}": i for i in range(1, 21)}
    desc_results = snmp_get_multiple(ip, list(desc_oids.keys()), timeout=2)
    
    # Identify which indices actually exist
    valid_indices = []
    for oid, desc in desc_results.items():
        if desc:
            valid_indices.append(desc_oids[oid])
            
    # Batch 3: Levels and Max Capacities for valid indices
    level_oids = [f"1.3.6.1.2.1.43.11.1.1.9.1.{i}" for i in valid_indices]
    max_oids = [f"1.3.6.1.2.1.43.11.1.1.8.1.{i}" for i in valid_indices]
    
    supply_results = {}

    if valid_indices:
        supply_results = snmp_get_multiple(
            ip,
            level_oids + max_oids,
            timeout=2
        )


    def get_percent(i):
        level_str = supply_results.get(
            f"1.3.6.1.2.1.43.11.1.1.9.1.{i}"
        )

        max_str = supply_results.get(
            f"1.3.6.1.2.1.43.11.1.1.8.1.{i}"
        )

        try:
            lvl = int(level_str)
            mx = int(max_str)

            if mx > 0 and lvl >= 0:
                return int((lvl / mx) * 100)

        except (ValueError, TypeError):
            pass

        return None

    toner_black = None
    toner_cyan = None
    toner_magenta = None
    toner_yellow = None
    drum_unit = None
    fuser_unit = None
    laser_unit = None
    pf_kit_mp = None
    pf_kit_1 = None
    
    for i in valid_indices:
        desc = desc_results.get(f"1.3.6.1.2.1.43.11.1.1.6.1.{i}", "")
        pct = get_percent(i)
        
        if pct is not None:
            desc_lower = desc.lower()
            if "toner" in desc_lower or "cartridge" in desc_lower:
                if "black" in desc_lower or "(k)" in desc_lower or " k " in desc_lower or desc_lower.endswith(" k"):
                    toner_black = pct
                elif "cyan" in desc_lower or "(c)" in desc_lower or " c " in desc_lower or desc_lower.endswith(" c"):
                    toner_cyan = pct
                elif "magenta" in desc_lower or "(m)" in desc_lower or " m " in desc_lower or desc_lower.endswith(" m"):
                    toner_magenta = pct
                elif "yellow" in desc_lower or "(y)" in desc_lower or " y " in desc_lower or desc_lower.endswith(" y"):
                    toner_yellow = pct
                elif "toner" in desc_lower and not ("cyan" in desc_lower or "magenta" in desc_lower or "yellow" in desc_lower):
                    toner_black = pct
            elif "drum" in desc_lower:
                drum_unit = pct
            elif "fuser" in desc_lower:
                fuser_unit = pct
            elif "laser" in desc_lower:
                laser_unit = pct
            elif "pf kit mp" in desc_lower or "pf_kit_mp" in desc_lower or "kit mp" in desc_lower:
                pf_kit_mp = pct
            elif "pf kit 1" in desc_lower or "pf_kit_1" in desc_lower or "kit 1" in desc_lower:
                pf_kit_1 = pct
            elif "pf kit" in desc_lower:
                pf_kit_1 = pct


    is_color = not (
    toner_cyan is None and
    toner_magenta is None and
    toner_yellow is None
)

    is_color = not (
        toner_cyan is None and
        toner_magenta is None and
        toner_yellow is None
    )

    print("=" * 50)
    print("HOSTNAME :", hostname)
    print("LOCATION :", location)
    print("SYSNAME  :", base_results.get(base_oids["sysName"]))
    print("SYSLOC   :", base_results.get(base_oids["sysLocation"]))
    print("=" * 50)

    return {
        "hostname": hostname or "",
        "brand": "Brother" if is_brother else "",
        "model": model or "",
        "serial_number": serial_number or "",
        "location": location or "",
        "is_color": is_color,
        "page_count": page_count,
        "toner_black": toner_black if toner_black is not None else 0,
        "toner_cyan": toner_cyan,
        "toner_magenta": toner_magenta,
        "toner_yellow": toner_yellow,
        "drum_unit": drum_unit,
        "fuser_unit": fuser_unit,
        "laser_unit": laser_unit,
        "pf_kit_mp": pf_kit_mp,
        "pf_kit_1": pf_kit_1,
        "status": final_status
    }