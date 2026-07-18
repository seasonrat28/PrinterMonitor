import requests
from bs4 import BeautifulSoup

ip = "10.119.34.21"

s = requests.Session()
s.trust_env = False

url = f"http://{ip}/"

r = s.get(url)

soup = BeautifulSoup(r.text, "html.parser")

print("=== LINKS ===")

for a in soup.find_all("a"):
    href = a.get("href")
    text = a.text.strip()

    if href:
        print(text, "=>", href)