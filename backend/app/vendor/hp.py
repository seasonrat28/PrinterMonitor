from typing import Optional
from app.vendor.base import BasePrinterVendor

class HPVendor(BasePrinterVendor):
    def detect(self, sys_descr: str, sys_object_id: str) -> bool:
        return "hp " in sys_descr.lower() or "hewlett-packard" in sys_descr.lower() or "1.3.6.1.4.1.11" in sys_object_id

    def read_counter(self) -> Optional[int]:
        oids = ["1.3.6.1.4.1.11.2.3.9.4.2.1.4.1.2.5.0"]
        res = self.snmp_get_multiple(self.ip, oids)
        val = res.get(oids[0])
        if val and val.isdigit():
            return int(val)
            
        return super().read_counter()
