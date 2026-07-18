import requests

ip = "10.119.34.21"

paths = [
    "/home/information.html",
    "/home/information.html?kind=item",
    "/information.html?kind=item",
    "/home/maintenance.html",
    "/home/device.html",
    "/home/device_information.html",
    "/device/information.html",
    "/maintenance.html",
    "/information.html",
]

s=requests.Session()
s.trust_env=False

for p in paths:
    r=s.get(f"http://{ip}{p}")

    if r.status_code == 200:
        print("FOUND", p)
    else:
        print(r.status_code,p)