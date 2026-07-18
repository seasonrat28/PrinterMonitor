import requests

ip = "10.119.34.21"

s = requests.Session()
s.trust_env = False

r = s.get(
    f"http://{ip}/",
    timeout=5
)

print("STATUS:", r.status_code)

print("================")
print(r.text[:5000])
print("================")

print("COOKIE")
print(s.cookies)