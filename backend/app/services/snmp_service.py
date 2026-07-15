import asyncio
import logging
import os

from pysnmp.hlapi.v1arch.asyncio import (
    CommunityData,
    ObjectIdentity,
    ObjectType,
    SnmpDispatcher,
    UdpTransportTarget,
    get_cmd,
    next_cmd,
)

from app.core.config import SNMP_COMMUNITY, SNMP_PORT

# Setup raw SNMP logger
os.makedirs("logs", exist_ok=True)
snmp_logger = logging.getLogger("snmp_raw")
snmp_logger.setLevel(logging.DEBUG)
fh = logging.FileHandler("logs/snmp_raw.log", encoding="utf-8")
formatter = logging.Formatter('Time:\n%(asctime)s\n\n%(message)s\n' + '-'*40)
fh.setFormatter(formatter)
if not snmp_logger.handlers:
    snmp_logger.addHandler(fh)

def log_raw_snmp(ip: str, oid: str, value: str, source: str = "SNMP"):
    """Log raw SNMP response for verification."""
    snmp_logger.debug(f"เครื่อง IP:\n{ip}\n\nOID:\n{oid}\n\nValue:\n{value}\n\nSource:\n{source}")

logger = logging.getLogger(__name__)

TIMEOUT = 3
RETRY = 1


def snmp_get(ip: str, oid: str, timeout: int = TIMEOUT):
    """Return a single SNMP v2c value, or None if the device does not reply."""
    res = snmp_get_multiple(ip, [oid], timeout)
    return res.get(oid) if res else None


def snmp_get_multiple(ip: str, oids: list[str], timeout: int = TIMEOUT) -> dict[str, str]:
    """Return a dictionary of OID -> Value for multiple OIDs in a single request."""
    if not oids:
        return {}

    async def request():
        object_types = [ObjectType(ObjectIdentity(oid)) for oid in oids]
        return await get_cmd(
            SnmpDispatcher(),
            CommunityData(SNMP_COMMUNITY, mpModel=1),
            await UdpTransportTarget.create(
                (ip, SNMP_PORT), timeout=timeout, retries=RETRY
            ),
            *object_types
        )

    try:
        error_indication, error_status, _, var_binds = asyncio.run(request())
        if error_indication or error_status or not var_binds:
            logger.debug("SNMP get returned no var_binds or error for %s: %s %s", ip, error_indication, error_status)
            return {}
        
        results = {}
        for var_bind in var_binds:
            oid_str = str(var_bind[0])
            val_str = str(var_bind[1])
            # If the device returns noSuchObject or noSuchInstance
            if "No Such" in val_str or "No more" in val_str:
                results[oid_str] = None
            else:
                results[oid_str] = val_str
                log_raw_snmp(ip, oid_str, val_str)
        return results
    except Exception:
        logger.exception("[SNMP Error] IP: %s, Multiple OIDs (%d)", ip, len(oids))
        return {}

def snmp_walk(ip: str, base_oid: str = "1.3.6.1.4.1.2435"):
    """
    Walk all OIDs under base_oid.
    Returns list[(oid, value)]
    """

    async def walk():
        results = []

        async for (
            error_indication,
            error_status,
            error_index,
            var_binds,
        ) in next_cmd(
            SnmpDispatcher(),
            CommunityData(SNMP_COMMUNITY, mpModel=1),
            await UdpTransportTarget.create(
                (ip, SNMP_PORT),
                timeout=5,
                retries=1,
            ),
            ObjectType(ObjectIdentity(base_oid)),
            lexicographicMode=False,
        ):

            if error_indication:
                logger.error("SNMP walk error indication for %s: %s", ip, error_indication)
                break

            if error_status:
                logger.error("SNMP walk error status for %s: %s", ip, error_status)
                break

            for oid, value in var_binds:
                results.append((str(oid), str(value)))

        return results

    return asyncio.run(walk())