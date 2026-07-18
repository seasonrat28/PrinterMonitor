from bs4 import BeautifulSoup


def parse_info(html):

    soup = BeautifulSoup(html, "html.parser")

    data = {}

    #
    # dt / dd
    #
    dts = soup.find_all("dt")
    dds = soup.find_all("dd")

    for dt, dd in zip(dts, dds):

        key = " ".join(dt.get_text(" ", strip=True).split())
        value = " ".join(dd.get_text(" ", strip=True).split())

        data[key] = value

    #
    # Error History
    #
    errors = []

    table = soup.find("table", class_="errorHistory")

    if table:

        for tr in table.find_all("tr"):

            td = tr.find_all("td")

            if len(td) >= 2:

                errors.append({
                    "error": td[0].get_text(strip=True),
                    "page": td[1].get_text(strip=True)
                })

    data["Error History"] = errors

    return data