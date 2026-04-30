"""UCalgary Data Scraper. Usage: python data_sources/calgary/scrape.py"""
import json, time, logging, re
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
    logger.info("=" * 40)
    logger.info("UCalgary Scraper")
    sources = json.load(open(BASE_DIR / "sources.json"))
    s = sources["campuses"]["calgary"]["sources"]
    results = {"university": sources["university"], "scraped_at": datetime.now(timezone.utc).isoformat()}
    soup = fetch(s["tuition"]["url"])
    if soup:
        text = soup.get_text(" ", strip=True)
        m = re.search(r"Most Faculties.*?\$([\d,]+\.\d+).*?International", text)
        if m:
            results["intl_per_3unit"] = float(m.group(1).replace(",", ""))
            logger.info(f"  Tuition: ${results['intl_per_3unit']}/3-unit course")
    json.dump(results, open(BASE_DIR / "scraped_output.json", "w"), indent=2)
    logger.info(f"Saved to {BASE_DIR / 'scraped_output.json'}")

if __name__ == "__main__":
    main()
