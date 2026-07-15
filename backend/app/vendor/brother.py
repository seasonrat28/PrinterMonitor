from app.vendor.base import BasePrinterVendor
import logging

logger = logging.getLogger(__name__)

class BrotherVendor(BasePrinterVendor):
    def detect(self, sys_descr: str, sys_object_id: str) -> bool:
        return "brother" in sys_descr.lower() or "1.3.6.1.4.1.2435" in sys_object_id

    def read_status(self) -> str:
        # Brother Enterprise MIB Status OIDs
        oids = [
            "1.3.6.1.4.1.2435.2.3.9.4.2.1.5.5.8.0",
            "1.3.6.1.4.1.2435.2.3.9.4.2.1.5.5.1.0",
            "1.3.6.1.4.1.2435.2.3.9.4.2.1.5.5.11.0"
        ]
        res = self.snmp_get_multiple(self.ip, oids)
        br_str = res.get(oids[0]) or res.get(oids[1]) or res.get(oids[2])
        
        if br_str:
            clean_str = ''.join(c for c in br_str if 32 <= ord(c) < 127).strip()
            return self._parse_brother_status(clean_str)
        
        # Fallback to standard Printer-MIB
        return super().read_status()

    def _parse_brother_status(self, brother_str: str) -> str:
        """Parse Brother enterprise status string to match BRAdmin 4."""
        if not brother_str:
            return "Unknown"
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
            return "Toner Empty"
        if "replace drum" in s or "drum end" in s:
            return "Replace Drum"
        if "no paper" in s:
            return "No Paper"
        if "error" in s:
            return "Error"
        if "offline" in s:
            return "Offline"
        if "busy" in s or "receiving" in s:
            return "Receiving Data"
        
        
        return brother_str.title()

    def read_errors(self) -> dict:
        """
        Walks the Brother error history OID and counts jams and extracts the last error.
        """
        result = {
            "last_error": "",
            "paper_jam_count": 0
        }
        
        # Brother Error History Table (String values)
        error_base_oid = "1.3.6.1.4.1.2435.2.3.9.4.2.1.5.5.51.2.1.2"
        try:
            error_walk = self.snmp_walk(self.ip, error_base_oid)
            if error_walk:
                errors = []
                jam_count = 0

                # Support both dict-like and list-of-tuples return formats
                if isinstance(error_walk, dict):
                    items = sorted(error_walk.items())
                else:
                    try:
                        items = sorted(error_walk)
                    except Exception:
                        items = list(error_walk)

                for oid, value in items:
                    if value and isinstance(value, str):
                        clean_val = value.strip()
                        if clean_val and clean_val.lower() != "no error":
                            errors.append(clean_val)
                            if "jam" in clean_val.lower():
                                jam_count += 1

                result["paper_jam_count"] = jam_count

                if errors:
                    result["last_error"] = errors[0]
        except Exception:
            logger.exception("Error reading Brother error history for %s", self.ip)
            
        return result
