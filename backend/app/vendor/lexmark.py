from typing import Optional
from app.vendor.base import BasePrinterVendor

class LexmarkVendor(BasePrinterVendor):
    def detect(self, sys_descr: str, sys_object_id: str) -> bool:
        return "lexmark" in sys_descr.lower() or "1.3.6.1.4.1.641" in sys_object_id

    def read_counter(self) -> Optional[int]:
        # Walk index table
        index_tree = self.snmp_walk(self.ip, "1.3.6.1.4.1.641.6.4.2.1.1.2.1")
        if index_tree:
            for oid, val in index_tree.items():
                if val == "2":
                    idx = oid.split(".")[-1]
                    val_oid = f"1.3.6.1.4.1.641.6.4.2.1.1.4.1.{idx}"
                    res = self.snmp_get_multiple(self.ip, [val_oid])
                    count_val = res.get(val_oid)
                    if count_val and count_val.isdigit():
                        return int(count_val)
                        
        return super().read_counter()
