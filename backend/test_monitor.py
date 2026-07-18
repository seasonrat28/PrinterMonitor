from fuji_client import FujiClient
from fuji_parser import parse_info

printer = FujiClient(
    "10.119.34.21",
    "Admin@5218"
)

if printer.login():

    html = printer.get_information()

    if html:

        data = parse_info(html)

        from pprint import pprint
        pprint(data)

    else:
        print("อ่านข้อมูลไม่สำเร็จ")

else:

    print("LOGIN FAIL")