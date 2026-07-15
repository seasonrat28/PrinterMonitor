from typing import Optional
from app.vendor.base import BasePrinterVendor

class KyoceraVendor(BasePrinterVendor):
    def detect(self, sys_descr: str, sys_object_id: str) -> bool:
        return "kyocera" in sys_descr.lower() or "1.3.6.1.4.1.1347" in sys_object_id

    def read_counter(self) -> Optional[int]:
        oids = ["1.3.6.1.4.1.1347.42.3.1.1.1.1.1"]
        res = self.snmp_get_multiple(self.ip, oids)
        val = res.get(oids[0])
        if val and val.isdigit():
            return int(val)
            
        return super().read_counter()
