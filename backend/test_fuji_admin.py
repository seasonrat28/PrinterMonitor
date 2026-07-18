import requests
from bs4 import BeautifulSoup

ip = "10.119.34.21"

s = requests.Session()
s.verify = False
s.trust_env = False


url = f"https://{ip}/admin/maintenance.html"

r = s.get(url)

print("STATUS:", r.status_code)

soup = BeautifulSoup(r.text, "html.parser")


print("========== TEXT ==========")

text = soup.get_text("\n", strip=True)

print(text[:3000])