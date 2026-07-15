from typing import Optional
from app.vendor.base import BasePrinterVendor

class XeroxVendor(BasePrinterVendor):
    def detect(self, sys_descr: str, sys_object_id: str) -> bool:
        return "xerox" in sys_descr.lower() or "1.3.6.1.4.1.253" in sys_object_id

    def read_counter(self) -> Optional[int]:
        # Walk index table
        index_tree = self.snmp_walk(self.ip, "1.3.6.1.4.1.253.8.53.13.2.1.8.1.20")
        if index_tree:
            for oid, val in index_tree.items():
                if val and "Total Impressions" in val:
                    idx = oid.split(".")[-1]
                    val_oid = f"1.3.6.1.4.1.253.8.53.13.2.1.6.1.20.{idx}"
                    res = self.snmp_get_multiple(self.ip, [val_oid])
                    count_val = res.get(val_oid)
                    if count_val and count_val.isdigit():
                        return int(count_val)
                        
        return super().read_counter()
