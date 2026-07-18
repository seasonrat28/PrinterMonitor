import asyncio

from pysnmp.hlapi.v1arch.asyncio import (
    CommunityData,
    ObjectIdentity,
    ObjectType,
    SnmpDispatcher,
    UdpTransportTarget,
    get_cmd,
    walk_cmd,
)

from app.core.config import SNMP_COMMUNITY, SNMP_PORT

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
        return results
    except Exception as exc:
        print(f"[SNMP Error] IP: {ip}, Multiple OIDs ({len(oids)}) -> {exc}")
        return {}



def snmp_walk(ip: str, oid: str, timeout: int = TIMEOUT) -> dict[str, str]:
    """SNMP Walk for pysnmp 7.x v1arch asyncio."""

    async def request():
        results = {}

        dispatcher = SnmpDispatcher()

        target = await UdpTransportTarget.create(
            (ip, SNMP_PORT),
            timeout=timeout,
            retries=RETRY
        )

        async for (
            error_indication,
            error_status,
            error_index,
            var_binds
        ) in walk_cmd(
            dispatcher,
            CommunityData(SNMP_COMMUNITY, mpModel=1),
            target,
            ObjectType(ObjectIdentity(oid))
        ):

            if error_indication:
                print(error_indication)
                break

            if error_status:
                print(error_status)
                break

            for var_bind in var_binds:
                oid_str = str(var_bind[0])
                value = str(var_bind[1])

                if "No Such" not in value:
                    results[oid_str] = value

        return results

    try:
        return asyncio.run(request())

    except Exception as exc:
        print(f"[SNMP Walk Error] IP: {ip}, OID: {oid} -> {exc}")
        return {}