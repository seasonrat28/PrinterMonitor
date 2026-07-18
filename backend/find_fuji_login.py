import requests
from bs4 import BeautifulSoup

ip = "10.119.34.21"

s = requests.Session()
s.verify = False
s.trust_env = False

url = f"https://{ip}/admin/maintenance.html"

r = s.get(url)

print("STATUS", r.status_code)

soup = BeautifulSoup(r.text,"html.parser")


print("=== FORMS ===")

for form in soup.find_all("form"):
    print("ACTION =", form.get("action"))
    print("METHOD =", form.get("method"))

    for inp in form.find_all("input"):
        print(
            inp.get("name"),
            inp.get("type"),
            inp.get("value")
        )


print("\n=== LINKS ===")

for a in soup.find_all("a"):
    print(a.text.strip(), a.get("href"))