import requests


def get_fuji_web_info(ip: str):

    url = f"http://{10.119.34.21}/information.html?kind=item"

    r = requests.get(url, timeout=5)

    print("STATUS:", r.status_code)
    print("URL:", r.url)

    print(r.text[:2000])

    return {}