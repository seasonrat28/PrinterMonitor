from concurrent.futures import ThreadPoolExecutor
import ipaddress
import subprocess


def ping_host(ip: str) -> bool:
    result = subprocess.run(
        ["ping", "-n", "1", "-w", "500", ip],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    return result.returncode == 0


def scan_network(network_prefix: str, start: int, end: int):
    try:
        network = ipaddress.ip_network(f"{network_prefix}.0/24", strict=False)
    except ValueError as exc:
        raise ValueError("Network must look like 192.168.1") from exc

    if start > end:
        raise ValueError("Start address must not be greater than end address")

    ips = [
        str(network.network_address + i)
        for i in range(start, end + 1)
    ]

    def check(ip):
        return {
            "ip": ip,
            "online": ping_host(ip)
        }

    with ThreadPoolExecutor(max_workers=100) as executor:
        return list(executor.map(check, ips))
