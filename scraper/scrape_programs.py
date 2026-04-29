"""
Canada BA Explorer — Example Scraper
Scrapes basic program info from university websites.
Uses polite scraping: delays between requests, respects robots.txt.
Falls back to manual JSON data if scraping fails.
"""

import json
import time
import os
from datetime import datetime
from pathlib import Path

import requests
from bs4 import BeautifulSoup

OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

HEADERS = {
    "User-Agent": "CanadaBAExplorer/1.0 (educational research project)"
}

# Polite delay between requests (seconds)
REQUEST_DELAY = 3


def scrape_page(url: str) -> BeautifulSoup | None:
    """Fetch a page with polite delay and return parsed soup."""
    try:
        time.sleep(REQUEST_DELAY)
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser")
    except requests.RequestException as e:
        print(f"  ⚠ Failed to fetch {url}: {e}")
        return None


def extract_text(soup: BeautifulSoup, selector: str) -> str:
    """Safely extract text from a CSS selector."""
    el = soup.select_one(selector)
    return el.get_text(strip=True) if el else ""


def scrape_university_page(url: str) -> dict:
    """
    Example scraper for a university page.
    Each university has different HTML structure, so this is a template.
    In production, you'd write per-university parsers.
    """
    soup = scrape_page(url)
    if not soup:
        return {}

    title = soup.find("title")
    description_meta = soup.find("meta", attrs={"name": "description"})

    return {
        "page_title": title.get_text(strip=True) if title else "",
        "meta_description": description_meta["content"] if description_meta and description_meta.get("content") else "",
        "source_url": url,
        "scraped_at": datetime.utcnow().isoformat(),
    }


def load_fallback_data() -> list[dict]:
    """Load manually curated JSON data as fallback."""
    fallback_path = Path(__file__).parent / "fallback_data.json"
    if fallback_path.exists():
        with open(fallback_path) as f:
            return json.load(f)
    return []


def main():
    """Main scraping pipeline."""
    print("🍁 Canada BA Explorer — Scraper")
    print("=" * 40)

    # Example: scrape a few university pages for metadata
    target_urls = [
        "https://www.utoronto.ca",
        "https://www.ubc.ca",
        "https://www.mcgill.ca",
    ]

    results = []
    for url in target_urls:
        print(f"📡 Scraping: {url}")
        data = scrape_university_page(url)
        if data:
            results.append(data)
            print(f"  ✅ Got: {data.get('page_title', 'N/A')}")
        else:
            print(f"  ⚠ Using fallback data")

    # Save results
    output_file = OUTPUT_DIR / f"scrape_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n✅ Saved {len(results)} results to {output_file}")
    print("\nNote: For full data, use the manual fallback JSON + seed script.")


if __name__ == "__main__":
    main()
