"""
UBC Data Scraper — Fetches tuition and program data from official UBC sources.

This is a template scraper for the University of British Columbia.
Future universities should follow the same pattern:
  data_sources/<university_slug>/scrape.py

Usage:
  python data_sources/ubc/scrape.py

Output:
  data_sources/ubc/scraped_output.json
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
REQUEST_DELAY = 3  # seconds between requests


def load_sources() -> dict:
    """Load the sources.json for this university."""
    with open(SOURCES_FILE) as f:
        return json.load(f)


def fetch_page(url: str) -> BeautifulSoup | None:
    """Fetch a page with polite delay."""
    try:
        time.sleep(REQUEST_DELAY)
        logger.info(f"Fetching: {url}")
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")
    except requests.RequestException as e:
        logger.warning(f"Failed to fetch {url}: {e}")
        return None


def extract_tuition_table(soup: BeautifulSoup) -> list[dict]:
    """Extract tuition rows from UBC consultation pages."""
    rows = []
    table = soup.find("table")
    if not table:
        return rows

    for tr in table.find_all("tr"):
        cells = [td.get_text(strip=True) for td in tr.find_all("td")]
        if len(cells) >= 7:
            program_text = cells[0]
            try:
                per_credit_str = cells[3].replace("$", "").replace(",", "")
                yearly_str = cells[4].replace("$", "").replace(",", "")
                per_credit = float(per_credit_str) if per_credit_str else None
                yearly = float(yearly_str) if yearly_str else None
            except (ValueError, IndexError):
                per_credit = None
                yearly = None

            rows.append({
                "program": program_text,
                "per_credit_2025_26": per_credit,
                "yearly_2025_26": yearly,
            })
    return rows


def extract_meta(soup: BeautifulSoup) -> dict:
    """Extract page title and meta description."""
    title = soup.find("title")
    desc = soup.find("meta", attrs={"name": "description"})
    return {
        "page_title": title.get_text(strip=True) if title else None,
        "meta_description": desc["content"] if desc and desc.get("content") else None,
    }


def scrape_campus_tuition(campus_sources: dict) -> dict:
    """Scrape tuition data for a campus."""
    tuition_url = campus_sources.get("tuition_per_credit", {}).get("url")
    if not tuition_url:
        return {"error": "No tuition URL found"}

    soup = fetch_page(tuition_url)
    if not soup:
        return {"error": f"Could not fetch {tuition_url}"}

    rows = extract_tuition_table(soup)

    # Find the Arts row for new students
    arts_row = None
    for row in rows:
        prog = row["program"].lower()
        if "arts" in prog and ("2025s" in prog or "later" in prog):
            arts_row = row
            break

    return {
        "all_rows": rows,
        "arts_new_students": arts_row,
        "source_url": tuition_url,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }


def scrape_ba_requirements(sources: dict) -> dict:
    """Scrape BA degree requirements page."""
    url = sources.get("ba_requirements", {}).get("url") or sources.get("ba_degree_info", {}).get("url")
    if not url:
        return {"error": "No BA requirements URL"}

    soup = fetch_page(url)
    if not soup:
        return {"error": f"Could not fetch {url}"}

    text = soup.get_text(" ", strip=True)

    # Extract credit numbers
    total_credits = None
    arts_credits = None

    match_total = re.search(r"(\d+)\s*(?:BA-eligible\s+)?credits", text)
    if match_total:
        total_credits = int(match_total.group(1))

    match_arts = re.search(r"at least\s+(\d+)\s+(?:credits\s+)?must be taken within the Faculty of Arts", text)
    if match_arts:
        arts_credits = int(match_arts.group(1))

    return {
        "total_credits": total_credits,
        "arts_credits": arts_credits,
        "source_url": url,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }


def main():
    """Main scraping pipeline for UBC."""
    logger.info("=" * 50)
    logger.info("🍁 UBC Data Scraper")
    logger.info("=" * 50)

    sources = load_sources()
    results = {
        "university": sources["university"],
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "campuses": {},
    }

    for campus_key, campus_data in sources["campuses"].items():
        logger.info(f"\n📍 Scraping {campus_data['name']}...")
        campus_sources = campus_data["sources"]

        tuition = scrape_campus_tuition(campus_sources)
        ba_reqs = scrape_ba_requirements(campus_sources)

        results["campuses"][campus_key] = {
            "name": campus_data["name"],
            "city": campus_data["city"],
            "province": campus_data["province"],
            "tuition": tuition,
            "ba_requirements": ba_reqs,
        }

        if tuition.get("arts_new_students"):
            arts = tuition["arts_new_students"]
            logger.info(f"  ✅ Arts tuition: ${arts.get('per_credit_2025_26')}/credit, ${arts.get('yearly_2025_26')}/year")
        else:
            logger.warning(f"  ⚠ Could not extract Arts tuition row")

        if ba_reqs.get("total_credits"):
            logger.info(f"  ✅ BA requires {ba_reqs['total_credits']} credits")

    # Save output
    with open(OUTPUT_FILE, "w") as f:
        json.dump(results, f, indent=2)

    logger.info(f"\n✅ Results saved to {OUTPUT_FILE}")
    logger.info("Note: Use normalized_data.json for verified data. Scraped data is for validation.")


if __name__ == "__main__":
    main()
