from typing import Optional
from app.vendor.base import BasePrinterVendor

class EpsonVendor(BasePrinterVendor):
    def detect(self, sys_descr: str, sys_object_id: str) -> bool:
        return "epson" in sys_descr.lower() or "1.3.6.1.4.1.1248" in sys_object_id

    def read_serial(self) -> Optional[str]:
        oids = ["1.3.6.1.4.1.1248.1.2.2.1.1.1.5.1"]
        res = self.snmp_get_multiple(self.ip, oids)
        val = res.get(oids[0])
        if val:
            return val
        return super().read_serial()
