from app.services.snmp_service import snmp_get_multiple

ip = "10.119.34.21"

oids = [
    "1.3.6.1.2.1.1.5.0",   # sysName
    "1.3.6.1.2.1.1.6.0",   # sysLocation
    "1.3.6.1.2.1.1.1.0"    # sysDescr
]

result = snmp_get_multiple(ip, oids, timeout=3)

for k,v in result.items():
    print(k,"=",v)