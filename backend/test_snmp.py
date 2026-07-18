from app.services.snmp_service import snmp_walk

ip = "10.119.34.21"

oid = "1.3.6.1.4.1.1240"

data = snmp_walk(ip, oid)

for k, v in data.items():
    text = str(v).lower()

    if any(x in text for x in [
        "drum",
        "fuser",
        "laser",
        "paper",
        "kit",
        "toner"
    ]):
        print(k, "=", v)