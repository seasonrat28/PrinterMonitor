import requests
from bs4 import BeautifulSoup
import urllib3

urllib3.disable_warnings()

ip = "10.119.34.21"

s = requests.Session()
s.verify = False
s.trust_env = False


# เปิดหน้า login ก่อน
url = f"https://{ip}/admin/maintenance.html"

r = s.get(url)

print("GET:", r.status_code)


# password Fuji
payload = {
    "B1859": "Admin@5218",
    "loginurl": "/admin/maintenance.html",
}


r = s.post(
    f"https://{ip}/home/status.html",
    data=payload,
    allow_redirects=True
)


print("POST:", r.status_code)
print("FINAL URL:", r.url)

print("================")


soup = BeautifulSoup(r.text,"html.parser")

print(soup.get_text("\n",strip=True)[:2000])


print("================")
print("COOKIE")
print(s.cookies)