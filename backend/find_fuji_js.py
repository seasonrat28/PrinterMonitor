import requests

ip = "10.119.34.21"

s = requests.Session()
s.trust_env = False

url = f"http://{ip}/common/js/ews.js"

r = s.get(url)

print("STATUS:", r.status_code)

text = r.text

for line in text.splitlines():
    if "information" in line.lower():
        print(line)