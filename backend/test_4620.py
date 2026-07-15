import logging

logger = logging.getLogger(__name__)
# Mock SNMP Data based on 10.119.34.21.txt
MOCK_DATA = {
    # Discovery Phase
    "1.3.6.1.2.1.1.1.0": "FUJIFILM Apeos 4620 SZ ; ESSmain 1.13",
    "1.3.6.1.2.1.1.2.0": ".1.3.6.1.4.1.297.1.111.101.1.50.1.4.1",
    
    # Supply 1: Black Toner
    "1.3.6.1.2.1.43.11.1.1.6.1.1": "Black Toner Cartridge",
    "1.3.6.1.2.1.43.11.1.1.8.1.1": "11000",
    "1.3.6.1.2.1.43.11.1.1.9.1.1": "9570",

    # Supply 2: Drum Unit
    "1.3.6.1.2.1.43.11.1.1.6.1.2": "Drum Unit",
    "1.3.6.1.2.1.43.11.1.1.8.1.2": "73000",
    "1.3.6.1.2.1.43.11.1.1.9.1.2": "70983",
}

def get_percent(i):
    level_str = MOCK_DATA.get(f"1.3.6.1.2.1.43.11.1.1.9.1.{i}")
    max_str = MOCK_DATA.get(f"1.3.6.1.2.1.43.11.1.1.8.1.{i}")
    try:
        lvl = int(level_str)
        mx = int(max_str)
        if lvl == -3:
            return 100
        if mx > 0 and lvl >= 0:
            return int((lvl / mx) * 100)
    except (ValueError, TypeError):
        pass
    return None

def run_test():
    logger.info("%s", "=" * 50)
    logger.info(" SIMULATING: FUJIFILM Apeos 4620 SZ (10.119.34.21)")
    logger.info("%s", "=" * 50)
    
    # Process all supplies
    results = {}
    for i in [1, 2]:
        desc = MOCK_DATA.get(f"1.3.6.1.2.1.43.11.1.1.6.1.{i}")
        max_val = MOCK_DATA.get(f"1.3.6.1.2.1.43.11.1.1.8.1.{i}")
        current_val = MOCK_DATA.get(f"1.3.6.1.2.1.43.11.1.1.9.1.{i}")
        percent = get_percent(i)
        
        results[desc] = f"Max: {max_val}, Current: {current_val} => Calculated Percentage: {percent}%"
        
    for k, v in results.items():
        logger.info("[%s] %s", k, v)
    logger.info("%s", "=" * 50)

if __name__ == "__main__":
    run_test()
