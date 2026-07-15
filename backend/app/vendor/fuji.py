from app.vendor.base import BasePrinterVendor

class FujiVendor(BasePrinterVendor):
    def detect(self, sys_descr: str, sys_object_id: str) -> bool:
        return "fuji" in sys_descr.lower() or "1.3.6.1.4.1.397" in sys_object_id or "1.3.6.1.4.1.297" in sys_object_id
