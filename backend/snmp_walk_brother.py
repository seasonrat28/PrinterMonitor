import asyncio
import sys
from pysnmp.hlapi.v1arch.asyncio import (
    CommunityData,
    ObjectIdentity,
    SnmpDispatcher,
    UdpTransportTarget,
    next_cmd,
)

async def snmp_walk(ip: str, start_oid: str):
    print(f"Walking OID {start_oid} on {ip}...")
    
    results = {}
    dispatcher = SnmpDispatcher()
    
    # next_cmd iterates through the OID tree
    varBinds = await next_cmd(
        dispatcher,
        CommunityData('public', mpModel=1),
        await UdpTransportTarget.create((ip, 161), timeout=2, retries=1),
        ObjectIdentity(start_oid)
    )
    
    async for errorIndication, errorStatus, errorIndex, varBindTable in varBinds:
        if errorIndication:
            print(f"Error: {errorIndication}")
            break
        elif errorStatus:
            print(f"Error: {errorStatus.prettyPrint()} at {errorIndex}")
            break
        else:
            for varBindRow in varBindTable:
                for oid, val in varBindRow:
                    oid_str = str(oid)
                    val_str = str(val)
                    
                    # Stop if we went past the subtree we wanted
                    if not oid_str.startswith(start_oid):
                        return results
                    
                    results[oid_str] = val_str
                    print(f"{oid_str} = {val_str}")

    return results

def main():
    if len(sys.argv) < 2:
        print("Usage: python snmp_walk_brother.py <IP_ADDRESS>")
        return

    ip = sys.argv[1]
    
    print("--- 1. Checking Standard Printer MIB (Supplies) ---")
    asyncio.run(snmp_walk(ip, "1.3.6.1.2.1.43.11"))
    
    print("\n--- 2. Checking Brother Private MIB ---")
    # 1.3.6.1.4.1.2435 is Brother's enterprise OID
    asyncio.run(snmp_walk(ip, "1.3.6.1.4.1.2435"))

if __name__ == "__main__":
    main()
