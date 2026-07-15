from app.vendor.base import BasePrinterVendor

class CanonVendor(BasePrinterVendor):
    def detect(self, sys_descr: str, sys_object_id: str) -> bool:
        return "canon" in sys_descr.lower() or "1.3.6.1.4.1.1602" in sys_object_id
