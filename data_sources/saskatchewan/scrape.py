"""
USask Data Scraper — Fetches tuition and program data from official USask sources.
Follows the same pattern as data_sources/ubc/scrape.py and data_sources/sfu/scrape.py.

Usage: python data_sources/saskatchewan/scrape.py
Output: data_sources/saskatchewan/scraped_output.json
"""
import json, re, time, logging
from datetime import datetime, timezone
from pathlib import Path
import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)
BASE_DIR = Path(__file__).parent
HEADERS = {"User-Agent": "CanadaBAExplorer/1.0 (educational research project)"}
REQUEST_DELAY = 3

def load_sources():
    with open(BASE_DIR / "sources.json") as f:
        return json.load(f)

def fetch_page(url):
    try:
        time.sleep(REQUEST_DELAY)
        logger.info(f"Fetching: {url}")
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")
    except requests.RequestException as e:
        logger.warning(f"Failed: {url}: {e}")
        return None

def scrape_tuition(sources):
    url = sources.get("tuition", {}).get("url")
    if not url:
        return {"error": "No tuition URL"}
    soup = fetch_page(url)
    if not soup:
        return {"error": f"Could not fetch {url}"}
    text = soup.get_text(" ", strip=True)
    match = re.search(r"Arts and Science\s*[–-]\s*Arts\s*\$?([\d,]+)", text)
    intl = None
    if match:
        intl = int(match.group(1).replace(",", ""))
    return {"arts_international_yearly": intl, "source_url": url, "scraped_at": datetime.now(timezone.utc).isoformat()}

def scrape_english(sources):
    url = sources.get("english_proficiency", {}).get("url")
    if not url:
        return {"error": "No English URL"}
    soup = fetch_page(url)
    if not soup:
        return {"error": f"Could not fetch {url}"}
    text = soup.get_text(" ", strip=True)
    ielts = re.search(r"Overall Band Score:\s*([\d.]+)", text)
    return {
        "ielts_overall": float(ielts.group(1)) if ielts else None,
        "source_url": url,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }

def main():
    logger.info("=" * 50)
    logger.info("🍁 USask Data Scraper")
    logger.info("=" * 50)
    sources = load_sources()["campuses"]["saskatoon"]["sources"]
    tuition = scrape_tuition(sources)
    english = scrape_english(sources)
    results = {"university": "University of Saskatchewan", "scraped_at": datetime.now(timezone.utc).isoformat(), "tuition": tuition, "english": english}
    if tuition.get("arts_international_yearly"):
        logger.info(f"  ✅ Arts tuition: ${tuition['arts_international_yearly']}/year")
    out = BASE_DIR / "scraped_output.json"
    with open(out, "w") as f:
        json.dump(results, f, indent=2)
    logger.info(f"\n✅ Saved to {out}")

if __name__ == "__main__":
    main()
