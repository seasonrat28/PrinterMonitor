from fuji_client import FujiClient
from fuji_parser import parse_info



printer = FujiClient(
    "10.119.34.21",
    "Admin@5218"
)


if printer.login():

    print("LOGIN OK")


    html = printer.get_information()


    result = parse_info(html)


    print(result)


else:

    print("LOGIN FAIL")