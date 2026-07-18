import requests
from bs4 import BeautifulSoup

ip = "10.119.34.21"

s = requests.Session()
s.trust_env = False

urls = [
    "/",
    "/home/status.html",
]

for u in urls:
    r = s.get(f"http://{ip}{u}")

    print("\n======", u, "======")

    soup = BeautifulSoup(r.text, "html.parser")

    for tag in soup.find_all(["a","form","script"]):

        if tag.name == "a":
            print(
                "LINK:",
                tag.get("href")
            )

        elif tag.name == "form":
            print(
                "FORM:",
                tag.get("action")
            )

        elif tag.name == "script":
            print(
                "SCRIPT:",
                tag.get("src")
            )