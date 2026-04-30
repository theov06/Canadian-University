"""UAlberta Data Scraper. Usage: python data_sources/alberta/scrape.py"""
import json, time, logging
from datetime import datetime, timezone
from pathlib import Path
import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)
BASE_DIR = Path(__file__).parent
HEADERS = {"User-Agent": "CanadaBAExplorer/1.0"}

def fetch(url):
    time.sleep(3)
    logger.info(f"Fetching: {url}")
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
        r.raise_for_status()
        return BeautifulSoup(r.text, "html.parser")
    except Exception as e:
        logger.warning(f"Failed: {e}")
        return None

def main():
    logger.info("UAlberta Scraper")
    sources = json.load(open(BASE_DIR / "sources.json"))
    results = {"university": sources["university"], "scraped_at": datetime.now(timezone.utc).isoformat()}
    json.dump(results, open(BASE_DIR / "scraped_output.json", "w"), indent=2)
    logger.info(f"Saved to {BASE_DIR / 'scraped_output.json'}")

if __name__ == "__main__":
    main()
