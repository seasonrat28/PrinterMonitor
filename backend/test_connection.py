import requests


s = requests.Session()
s.trust_env = False


r = s.get(
    "https://10.119.34.21/home/status.html",
    verify=False,
    timeout=10
)

print(r.status_code)
print(r.text[:100])