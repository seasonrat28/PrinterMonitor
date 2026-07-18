from fuji_client import FujiClient
from fuji_parser import parse_info


def get_printer_info(ip: str, password: str):
    """
    Login เข้าเครื่อง Fuji แล้วดึงข้อมูลทั้งหมด
    """

    client = FujiClient(ip, password)

    if not client.login():
        raise Exception("Login Failed")

    html = client.get_information()

    return parse_info(html)