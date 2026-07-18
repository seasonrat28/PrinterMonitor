import requests

ip="10.119.34.21"

s=requests.Session()
s.verify=False
s.trust_env=False

for url in [
    f"https://{ip}/",
    f"https://{ip}/home/status.html",
    f"https://{ip}/information.html?kind=item",
]:

    try:
        r=s.get(url,timeout=5)
        print(r.status_code,url)

    except Exception as e:
        print("ERR",url,e)