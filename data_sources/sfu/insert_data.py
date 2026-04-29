"""
SFU Data Insertion Script — Inserts normalized SFU data into PostgreSQL.

Uses UPSERT logic so it can be run multiple times safely.
Follows the same pattern as data_sources/ubc/insert_data.py.

Usage:
  python data_sources/sfu/insert_data.py

Requires:
  - DATABASE_URL environment variable
  - pip install psycopg2-binary python-dotenv
"""

import json
import os
import sys
import logging
from datetime import datetime, timezone
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

try:
    import psycopg2
except ImportError:
    logger.error("psycopg2 not installed. Run: pip install psycopg2-binary")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent.parent / ".env.local")
except ImportError:
    pass

BASE_DIR = Path(__file__).parent
DATA_FILE = BASE_DIR / "normalized_data.json"


def load_data() -> dict:
    with open(DATA_FILE) as f:
        return json.load(f)


def get_connection():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        logger.error("DATABASE_URL not set.")
        sys.exit(1)
    return psycopg2.connect(db_url)


def slugify(text: str) -> str:
    return text.lower().replace(" ", "-").replace("(", "").replace(")", "")


def upsert_location(cur, city, province, city_size, monthly_cost):
    cur.execute("SELECT id FROM locations WHERE city = %s AND province = %s", (city, province))
    row = cur.fetchone()
    if row:
        cur.execute("UPDATE locations SET city_size = %s, estimated_monthly_living_cost = %s WHERE id = %s",
                     (city_size, monthly_cost, row[0]))
        logger.info(f"  📍 Updated location: {city}, {province} (id={row[0]})")
        return row[0]
    else:
        cur.execute("INSERT INTO locations (city, province, city_size, estimated_monthly_living_cost) VALUES (%s,%s,%s,%s) RETURNING id",
                     (city, province, city_size, monthly_cost))
        lid = cur.fetchone()[0]
        logger.info(f"  📍 Inserted location: {city}, {province} (id={lid})")
        return lid


def upsert_university(cur, name, slug, description, location_id, website, source_url):
    cur.execute("SELECT id FROM universities WHERE slug = %s", (slug,))
    row = cur.fetchone()
    now = datetime.now(timezone.utc)
    if row:
        cur.execute("UPDATE universities SET name=%s, description=%s, location_id=%s, website_url=%s, source_url=%s, last_updated=%s WHERE id=%s",
                     (name, description, location_id, website, source_url, now, row[0]))
        logger.info(f"  🏫 Updated university: {name} (id={row[0]})")
        return row[0]
    else:
        cur.execute("INSERT INTO universities (name,slug,description,location_id,website_url,source_url,last_updated) VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                     (name, slug, description, location_id, website, source_url, now))
        uid = cur.fetchone()[0]
        logger.info(f"  🏫 Inserted university: {name} (id={uid})")
        return uid


def upsert_program(cur, uni_id, prog):
    slug = prog["slug"]
    now = datetime.now(timezone.utc)
    cur.execute("SELECT id FROM programs WHERE university_id = %s AND slug = %s", (uni_id, slug))
    row = cur.fetchone()
    if row:
        cur.execute("UPDATE programs SET name=%s, degree_type=%s, description=%s, has_coop=%s, program_url=%s, career_outcomes=%s, source_url=%s, last_updated=%s WHERE id=%s",
                     (prog["name"], prog["degree_type"], prog["description"], prog["has_coop"], prog["program_url"], prog["career_outcomes"], prog["program_url"], now, row[0]))
        logger.info(f"  📚 Updated program: {prog['name']} (id={row[0]})")
        return row[0]
    else:
        cur.execute("INSERT INTO programs (university_id,name,slug,degree_type,description,has_coop,program_url,career_outcomes,source_url,last_updated) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                     (uni_id, prog["name"], slug, prog["degree_type"], prog["description"], prog["has_coop"], prog["program_url"], prog["career_outcomes"], prog["program_url"], now))
        pid = cur.fetchone()[0]
        logger.info(f"  📚 Inserted program: {prog['name']} (id={pid})")
        return pid


def upsert_requirements(cur, prog_id, requirements):
    ielts_overall = ielts_min = toefl = min_gpa = None
    additional = []
    source_url = None
    for req in requirements:
        if req["type"] == "ielts":
            ielts_overall = req.get("ielts_overall")
            ielts_min = req.get("ielts_min_band")
            source_url = req.get("source_url")
        elif req["type"] == "toefl":
            toefl = req.get("toefl_ibt")
        elif req["type"] == "gpa":
            min_gpa = req.get("min_gpa")
        elif req["type"] in ("application_deadline", "application_fee"):
            additional.append(f"{req['type'].replace('_',' ').title()}: {req['value']}")
    additional_text = "; ".join(additional) if additional else None

    cur.execute("SELECT id FROM requirements WHERE program_id = %s", (prog_id,))
    row = cur.fetchone()
    if row:
        cur.execute("UPDATE requirements SET ielts_overall=%s, ielts_min_band=%s, toefl_ibt=%s, min_gpa=%s, additional_requirements=%s, source_url=%s, last_updated=NOW() WHERE id=%s",
                     (ielts_overall, ielts_min, toefl, min_gpa, additional_text, source_url, row[0]))
        logger.info(f"    ✅ Updated requirements (id={row[0]})")
    else:
        cur.execute("INSERT INTO requirements (program_id,ielts_overall,ielts_min_band,toefl_ibt,min_gpa,additional_requirements,source_url) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                     (prog_id, ielts_overall, ielts_min, toefl, min_gpa, additional_text, source_url))
        logger.info(f"    ✅ Inserted requirements")


def upsert_costs(cur, prog_id, tuition):
    yearly = int(tuition["yearly_estimate"])
    year = tuition["academic_year"]
    src = tuition["source_url"]
    cur.execute("SELECT id FROM costs WHERE program_id = %s AND academic_year = %s", (prog_id, year))
    row = cur.fetchone()
    if row:
        cur.execute("UPDATE costs SET tuition_yearly_international=%s, source_url=%s, last_updated=NOW() WHERE id=%s", (yearly, src, row[0]))
        logger.info(f"    💰 Updated costs: ${yearly:,}/year (id={row[0]})")
    else:
        cur.execute("INSERT INTO costs (program_id,tuition_yearly_international,academic_year,source_url) VALUES (%s,%s,%s,%s)", (prog_id, yearly, year, src))
        logger.info(f"    💰 Inserted costs: ${yearly:,}/year")


def main():
    logger.info("=" * 50)
    logger.info("🍁 SFU Data Insertion")
    logger.info("=" * 50)

    data = load_data()
    conn = get_connection()
    cur = conn.cursor()

    try:
        uni_data = data["university"]
        for campus in data["campuses"]:
            logger.info(f"\n📍 Processing: {campus['name']}")
            living = campus["living_costs"]
            loc_id = upsert_location(cur, campus["city"], campus["province"], campus["city_size"], living["monthly_estimate"])
            campus_slug = slugify(campus["name"])
            uni_id = upsert_university(cur, campus["name"], campus_slug, uni_data["description"], loc_id, uni_data["official_website"], uni_data["official_website"])
            for prog in campus["programs"]:
                prog_id = upsert_program(cur, uni_id, prog)
                upsert_requirements(cur, prog_id, prog["requirements"])
                upsert_costs(cur, prog_id, prog["tuition"])
        conn.commit()
        logger.info("\n✅ All SFU data inserted/updated successfully!")
    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Insertion failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()
