"""SAIT Data Scraper. Usage: python data_sources/sait/scrape.py"""
import json, time, logging
from datetime import datetime, timezone
from pathlib import Path
import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)
BASE_DIR = Path(__file__).parent

def main():
    logger.info("SAIT Scraper")
    sources = json.load(open(BASE_DIR / "sources.json"))
    results = {"university": sources["university"], "scraped_at": datetime.now(timezone.utc).isoformat()}
    time.sleep(3)
    try:
        r = requests.get(sources["campuses"]["calgary"]["sources"]["degrees"]["url"], headers={"User-Agent": "CanadaBAExplorer/1.0"}, timeout=20)
        soup = BeautifulSoup(r.text, "html.parser")
        results["page_title"] = soup.find("title").get_text(strip=True) if soup.find("title") else None
        logger.info(f"  Page: {results.get('page_title')}")
    except Exception as e:
        logger.warning(f"Failed: {e}")
    json.dump(results, open(BASE_DIR / "scraped_output.json", "w"), indent=2)
    logger.info(f"Saved to {BASE_DIR / 'scraped_output.json'}")

if __name__ == "__main__":
    main()
