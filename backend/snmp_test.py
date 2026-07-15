import logging
from app.services.snmp_service import snmp_get_multiple

logger = logging.getLogger(__name__)


def test_printer(ip: str):
    logger.info("--- Testing Printer IP: %s ---", ip)
    
    # Check Location
    base_oids = ["1.3.6.1.2.1.1.6.0", "1.3.6.1.2.1.1.1.0"]
    res = snmp_get_multiple(ip, base_oids)
    logger.info("[System Info]")
    logger.info("sysDescr: %s", res.get("1.3.6.1.2.1.1.1.0", "No Response"))
    logger.info("sysLocation: '%s'", res.get("1.3.6.1.2.1.1.6.0", "No Response"))
    
    # Check Supplies Table
    logger.info("[Supplies Descriptions]")
    desc_oids = {f"1.3.6.1.2.1.43.11.1.1.6.1.{i}": i for i in range(1, 21)}
    desc_res = snmp_get_multiple(ip, list(desc_oids.keys()))
    
    valid_indices = []
    for oid, desc in desc_res.items():
        if desc:
            idx = desc_oids[oid]
            valid_indices.append(idx)
            logger.info("Index %s: %s", idx, desc)
            
    if not valid_indices:
        logger.warning("No standard supplies found on this printer!")
        return

    logger.info("[Supplies Levels]")
    level_oids = [f"1.3.6.1.2.1.43.11.1.1.9.1.{i}" for i in valid_indices]
    max_oids = [f"1.3.6.1.2.1.43.11.1.1.8.1.{i}" for i in valid_indices]
    
    lvl_res = snmp_get_multiple(ip, level_oids + max_oids)
    
    for idx in valid_indices:
        lvl = lvl_res.get(f"1.3.6.1.2.1.43.11.1.1.9.1.{idx}")
        mx = lvl_res.get(f"1.3.6.1.2.1.43.11.1.1.8.1.{idx}")
        logger.info("Index %s -> Current Level (9.1): %s, Max Capacity (8.1): %s", idx, lvl, mx)
        
    logger.info("--------------------------------")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        logger.info("Usage: python snmp_test.py <IP_ADDRESS>")
    else:
        # Need to run within event loop if needed, but snmp_get_multiple already runs its own
        test_printer(sys.argv[1])
