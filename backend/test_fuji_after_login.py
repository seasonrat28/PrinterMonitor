import requests
from bs4 import BeautifulSoup
import urllib3

urllib3.disable_warnings()

ip = "10.119.34.21"

s = requests.Session()
s.verify = False
s.trust_env = False

headers = {
    "User-Agent": "Mozilla/5.0",
    "Referer": f"https://{ip}/"
}


# เปิดหน้าแรกก่อน
r = s.get(
    f"https://{ip}/",
    headers=headers
)

print("HOME:", r.status_code)
print("COOKIE BEFORE:", s.cookies)


# login
payload = {
    "B1859": "Admin@5218",
    "loginurl": "/admin/information.html"
}


r = s.post(
    f"https://{ip}/home/status.html",
    data=payload,
    headers=headers,
    allow_redirects=True
)


print("FINAL:", r.status_code)
print("URL:", r.url)
print("COOKIE AFTER:", s.cookies)


print("================")

soup = BeautifulSoup(r.text,"html.parser")

print(
    soup.get_text(
        "\n",
        strip=True
    )[:2000]
)