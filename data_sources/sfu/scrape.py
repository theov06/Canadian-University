"""
SFU Data Scraper — Fetches tuition and program data from official SFU sources.

Template scraper for Simon Fraser University.
Follows the same pattern as data_sources/ubc/scrape.py.

Usage:
  python data_sources/sfu/scrape.py

Output:
  data_sources/sfu/scraped_output.json
"""

import json
import re
import time
import logging
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent
OUTPUT_FILE = BASE_DIR / "scraped_output.json"
SOURCES_FILE = BASE_DIR / "sources.json"

HEADERS = {"User-Agent": "CanadaBAExplorer/1.0 (educational research project)"}
REQUEST_DELAY = 3


def load_sources() -> dict:
    with open(SOURCES_FILE) as f:
        return json.load(f)


def fetch_page(url: str) -> BeautifulSoup | None:
    try:
        time.sleep(REQUEST_DELAY)
        logger.info(f"Fetching: {url}")
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")
    except requests.RequestException as e:
        logger.warning(f"Failed to fetch {url}: {e}")
        return None


def scrape_tuition(sources: dict) -> dict:
    url = sources.get("tuition_fees", {}).get("url")
    if not url:
        return {"error": "No tuition URL"}

    soup = fetch_page(url)
    if not soup:
        return {"error": f"Could not fetch {url}"}

    text = soup.get_text(" ", strip=True)

    # Extract international per-unit rate for new students
    per_unit = None
    match = re.search(r"for students who entered in 2024/2025 or later\s*\$?([\d,]+\.\d+)", text)
    if match:
        per_unit = float(match.group(1).replace(",", ""))

    return {
        "international_per_unit_new_students": per_unit,
        "yearly_estimate_30_units": round(per_unit * 30, 2) if per_unit else None,
        "source_url": url,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }


def scrape_english_requirements(sources: dict) -> dict:
    url = sources.get("english_requirements", {}).get("url")
    if not url:
        return {"error": "No English requirements URL"}

    soup = fetch_page(url)
    if not soup:
        return {"error": f"Could not fetch {url}"}

    text = soup.get_text(" ", strip=True)

    ielts = re.search(r"Overall\s+([\d.]+)\s+with no part less than\s+([\d.]+)", text)
    toefl = re.search(r"Overall score\s+(\d+)\s+with no part less than\s+(\d+)", text)

    return {
        "ielts_overall": float(ielts.group(1)) if ielts else None,
        "ielts_min_band": float(ielts.group(2)) if ielts else None,
        "toefl_ibt": int(toefl.group(1)) if toefl else None,
        "toefl_min_section": int(toefl.group(2)) if toefl else None,
        "source_url": url,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }


def main():
    logger.info("=" * 50)
    logger.info("🍁 SFU Data Scraper")
    logger.info("=" * 50)

    sources = load_sources()
    burnaby_sources = sources["campuses"]["burnaby"]["sources"]

    tuition = scrape_tuition(burnaby_sources)
    english = scrape_english_requirements(burnaby_sources)

    results = {
        "university": sources["university"],
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "tuition": tuition,
        "english_requirements": english,
    }

    if tuition.get("international_per_unit_new_students"):
        logger.info(f"  ✅ Tuition: ${tuition['international_per_unit_new_students']}/unit")
    if english.get("ielts_overall"):
        logger.info(f"  ✅ IELTS: {english['ielts_overall']}")

    with open(OUTPUT_FILE, "w") as f:
        json.dump(results, f, indent=2)

    logger.info(f"\n✅ Results saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
