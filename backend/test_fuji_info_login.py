import requests
from bs4 import BeautifulSoup
import urllib3

urllib3.disable_warnings()

ip = "10.119.34.21"

s = requests.Session()
s.verify = False
s.trust_env = False


# login
s.post(
    f"https://{ip}/home/status.html",
    data={
        "B1859": "Admin@5218",
        "loginurl": "/home/status.html"
    },
    allow_redirects=True
)


paths = [
    "/information.html?kind=item",
    "/home/information.html?kind=item",
    "/admin/information.html?kind=item",
    "/maintenance.html",
    "/home/maintenance.html",
    "/admin/maintenance.html",
]


for path in paths:

    r = s.get(
        f"https://{ip}{path}"
    )

    print("\n================")
    print(path)
    print(r.status_code)

    if r.status_code == 200:

        soup = BeautifulSoup(
            r.text,
            "html.parser"
        )

        text = soup.get_text(
            "\n",
            strip=True
        )

        print(text[:1500])