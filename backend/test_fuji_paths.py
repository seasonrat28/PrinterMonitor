import requests

ip = "10.119.34.21"

session = requests.Session()
session.trust_env = False

paths = [
    "/",
    "/status.html",
    "/information.html?kind=item",
    "/monitor.html",
    "/ews/status.html",
    "/ews/information.html?kind=item",
    "/cgi-bin/status.html",
    "/mobile/status.html",
    "/mobile/status",
    "/home/status.html",
    "/home/information.html?kind=item",
    "/home/information.html",
]

for p in paths:
    url = f"http://{ip}{p}"

    try:
        r = session.get(url, timeout=3)

        print(
            r.status_code,
            url,
            r.text[:50].replace("\n"," ")
        )

    except Exception as e:
        print("ERR", url, e)