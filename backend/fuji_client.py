import requests
import urllib3

urllib3.disable_warnings()


class FujiClient:

    def __init__(self, ip, password):

        self.base = f"https://{ip}"
        self.password = password

        self.session = requests.Session()
        self.session.verify = False
        self.session.trust_env = False

        self.headers = {
            "User-Agent": "Mozilla/5.0",
            "Referer": self.base + "/home/status.html"
        }

    def login(self):

        r = self.session.post(
            self.base + "/home/status.html",
            data={
                "B1859": self.password,
                "loginurl": "/home/status.html"
            },
            headers=self.headers,
            allow_redirects=False
        )

        print("POST:", r.status_code)
        print("LOCATION:", r.headers.get("Location"))
        print("COOKIE:", self.session.cookies)

        if r.status_code != 301:
            return False

        r = self.session.get(
            self.base + "/home/status.html",
            headers=self.headers
        )

        if "Please Login" in r.text:
            return False

        return True

    def get_information(self):

        r = self.session.get(
            self.base + "/general/information.html?kind=item",
            headers=self.headers
        )

        print("INFO:", r.status_code)

        if r.status_code != 200:
            return None

        return r.text