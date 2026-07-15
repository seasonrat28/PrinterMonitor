from typing import Dict, Any, Optional

class BasePrinterVendor:
    """
    Base class for vendor-specific SNMP extraction.
    Implements standard Printer-MIB and HOST-RESOURCES-MIB fallbacks.
    """
    def __init__(self, ip: str, snmp_get_multiple_func, snmp_walk_func):
        self.ip = ip
        self.snmp_get_multiple = snmp_get_multiple_func
        self.snmp_walk = snmp_walk_func

    def detect(self, sys_descr: str, sys_object_id: str) -> bool:
        """Return True if this class handles the given printer."""
        return False

    def read_model(self, sys_descr: str, hr_device_descr: str, printer_name: str) -> Optional[str]:
        # hrDeviceDescr > printerName > sysDescr
        return hr_device_descr or printer_name or sys_descr or None

    def read_serial(self) -> Optional[str]:
        # Printer-MIB Serial
        res = self.snmp_get_multiple(self.ip, ["1.3.6.1.2.1.43.5.1.1.17.1"])
        val = res.get("1.3.6.1.2.1.43.5.1.1.17.1")
        return val if val else None

    def read_status(self) -> str:
        # Printer-MIB Status
        oids = ["1.3.6.1.2.1.25.3.5.1.1.1", "1.3.6.1.2.1.25.3.5.1.2.1"]
        res = self.snmp_get_multiple(self.ip, oids)
        hr_status = res.get("1.3.6.1.2.1.25.3.5.1.1.1")
        
        status_map = {
            "1": "Other",
            "2": "Unknown",
            "3": "Ready",
            "4": "Printing",
            "5": "Warming Up"
        }
        
        if hr_status in status_map:
            return status_map[hr_status]
        
        return "Unknown"

    def read_supplies(self) -> Dict[str, Any]:
        """
        Return dict mapping generic names to % remaining.
        """
        desc_oids = {f"1.3.6.1.2.1.43.11.1.1.6.1.{i}": i for i in range(1, 21)}
        desc_results = self.snmp_get_multiple(self.ip, list(desc_oids.keys()))
        
        valid_indices = []
        for oid, desc in desc_results.items():
            if desc:
                valid_indices.append(desc_oids[oid])
                
        level_oids = [f"1.3.6.1.2.1.43.11.1.1.9.1.{i}" for i in valid_indices]
        max_oids = [f"1.3.6.1.2.1.43.11.1.1.8.1.{i}" for i in valid_indices]
        
        supply_results = {}
        if valid_indices:
            supply_results = self.snmp_get_multiple(self.ip, level_oids + max_oids)
            
        def get_percent(i):
            level_str = supply_results.get(f"1.3.6.1.2.1.43.11.1.1.9.1.{i}")
            max_str = supply_results.get(f"1.3.6.1.2.1.43.11.1.1.8.1.{i}")
            try:
                lvl = int(level_str)
                mx = int(max_str)
                # SNMP Standard: -3 means 'Some remaining' (OK)
                if lvl == -3:
                    return 100
                if mx > 0 and lvl >= 0:
                    return int((lvl / mx) * 100)
            except (ValueError, TypeError):
                pass
            return None

        supplies = {
            "toner_black": None,
            "toner_cyan": None,
            "toner_magenta": None,
            "toner_yellow": None,
            "drum_unit": None,
            "fuser_unit": None,
            "laser_unit": None,
            "pf_kit_mp": None,
            "pf_kit_1": None
        }
        
        for i in valid_indices:
            desc = desc_results.get(f"1.3.6.1.2.1.43.11.1.1.6.1.{i}", "")
            pct = get_percent(i)
            
            if pct is not None:
                desc_lower = desc.lower()
                if "toner" in desc_lower or "cartridge" in desc_lower:
                    if "black" in desc_lower or "(k)" in desc_lower or " k " in desc_lower or desc_lower.endswith(" k"):
                        supplies["toner_black"] = pct
                    elif "cyan" in desc_lower or "(c)" in desc_lower or " c " in desc_lower or desc_lower.endswith(" c"):
                        supplies["toner_cyan"] = pct
                    elif "magenta" in desc_lower or "(m)" in desc_lower or " m " in desc_lower or desc_lower.endswith(" m"):
                        supplies["toner_magenta"] = pct
                    elif "yellow" in desc_lower or "(y)" in desc_lower or " y " in desc_lower or desc_lower.endswith(" y"):
                        supplies["toner_yellow"] = pct
                    elif "toner" in desc_lower and not ("cyan" in desc_lower or "magenta" in desc_lower or "yellow" in desc_lower):
                        supplies["toner_black"] = pct
                elif "drum" in desc_lower:
                    supplies["drum_unit"] = pct
                elif "fuser" in desc_lower:
                    supplies["fuser_unit"] = pct
                elif "laser" in desc_lower:
                    supplies["laser_unit"] = pct
                elif "pf kit mp" in desc_lower or "pf_kit_mp" in desc_lower or "kit mp" in desc_lower:
                    supplies["pf_kit_mp"] = pct
                elif "pf kit 1" in desc_lower or "pf_kit_1" in desc_lower or "kit 1" in desc_lower:
                    supplies["pf_kit_1"] = pct
                elif "pf kit" in desc_lower:
                    supplies["pf_kit_1"] = pct
                    
        return supplies

    def read_counter(self) -> Optional[int]:
        # Printer-MIB Page Count
        res = self.snmp_get_multiple(self.ip, ["1.3.6.1.2.1.43.10.2.1.4.1.1"])
        count_str = res.get("1.3.6.1.2.1.43.10.2.1.4.1.1")
        if count_str and count_str.isdigit():
            return int(count_str)
        return None

    def read_errors(self) -> Dict[str, Any]:
        """
        Return dict containing error and jam information.
        """
        return {
            "last_error": "",
            "paper_jam_count": 0
        }
