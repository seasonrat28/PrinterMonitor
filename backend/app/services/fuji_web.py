import requests
from bs4 import BeautifulSoup


def get_fuji_web_info(ip: str):
    """
    อ่านข้อมูล Consumables จากหน้าเว็บ FUJIFILM Apeos
    """

    url = f"http://{ip}/information.html?kind=item"

    try:
        r = requests.get(url, timeout=5)

        if r.status_code != 200:
            return None

        soup = BeautifulSoup(r.text, "lxml")

        data = {}

        for dt, dd in zip(soup.find_all("dt"), soup.find_all("dd")):

            key = dt.get_text(" ", strip=True)
            value = dd.get_text(" ", strip=True)

            data[key] = value

        return data

    except Exception as e:
        print(e)
        return None