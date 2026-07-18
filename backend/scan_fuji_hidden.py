import requests

ip = "10.119.34.21"

paths = [
    "/home/information.html?kind=item",
    "/home/information.html",
    "/home/maintenance.html",
    "/home/maintenance_information.html",

    "/device/information.html",
    "/device/maintenance.html",
    "/device/status.html",

    "/maintenance.html",
    "/maintenance/information.html",

    "/admin/information.html",
    "/admin/maintenance.html",

    "/report.html",
    "/export.html",
    "/csv.html",

    "/home/export.html",
    "/home/export.csv",
]


s = requests.Session()
s.verify=False
s.trust_env=False


for p in paths:

    try:
        r=s.get(
            f"https://{ip}{p}",
            timeout=3
        )

        if r.status_code == 200:
            print("FOUND:", p)
            print(r.text[:100])

        else:
            print(r.status_code,p)

    except Exception as e:
        print("ERR",p,e)