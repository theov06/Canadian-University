"""
USask Data Insertion — Inserts normalized USask data into PostgreSQL.
UPSERT logic, follows same pattern as UBC and SFU modules.

Usage: python data_sources/saskatchewan/insert_data.py
Requires: DATABASE_URL env var, psycopg2-binary, python-dotenv
"""
import json, os, sys, logging
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

def load_data():
    with open(BASE_DIR / "normalized_data.json") as f:
        return json.load(f)

def get_connection():
    url = os.environ.get("DATABASE_URL")
    if not url:
        logger.error("DATABASE_URL not set.")
        sys.exit(1)
    return psycopg2.connect(url)

def slugify(t):
    return t.lower().replace(" ", "-").replace("(", "").replace(")", "")

def upsert_location(cur, city, province, city_size, monthly):
    cur.execute("SELECT id FROM locations WHERE city=%s AND province=%s", (city, province))
    r = cur.fetchone()
    if r:
        cur.execute("UPDATE locations SET city_size=%s, estimated_monthly_living_cost=%s WHERE id=%s", (city_size, monthly, r[0]))
        logger.info(f"  📍 Updated location: {city} (id={r[0]})")
        return r[0]
    cur.execute("INSERT INTO locations (city,province,city_size,estimated_monthly_living_cost) VALUES (%s,%s,%s,%s) RETURNING id", (city, province, city_size, monthly))
    lid = cur.fetchone()[0]
    logger.info(f"  📍 Inserted location: {city} (id={lid})")
    return lid

def upsert_university(cur, name, slug, desc, loc_id, website):
    cur.execute("SELECT id FROM universities WHERE slug=%s", (slug,))
    r = cur.fetchone()
    now = datetime.now(timezone.utc)
    if r:
        cur.execute("UPDATE universities SET name=%s,description=%s,location_id=%s,website_url=%s,source_url=%s,last_updated=%s WHERE id=%s",
                     (name, desc, loc_id, website, website, now, r[0]))
        logger.info(f"  🏫 Updated: {name} (id={r[0]})")
        return r[0]
    cur.execute("INSERT INTO universities (name,slug,description,location_id,website_url,source_url,last_updated) VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                 (name, slug, desc, loc_id, website, website, now))
    uid = cur.fetchone()[0]
    logger.info(f"  🏫 Inserted: {name} (id={uid})")
    return uid

def upsert_program(cur, uni_id, p):
    now = datetime.now(timezone.utc)
    cur.execute("SELECT id FROM programs WHERE university_id=%s AND slug=%s", (uni_id, p["slug"]))
    r = cur.fetchone()
    if r:
        cur.execute("UPDATE programs SET name=%s,degree_type=%s,description=%s,has_coop=%s,program_url=%s,career_outcomes=%s,source_url=%s,last_updated=%s WHERE id=%s",
                     (p["name"], p["degree_type"], p["description"], p["has_coop"], p["program_url"], p["career_outcomes"], p["program_url"], now, r[0]))
        logger.info(f"  📚 Updated: {p['name']} (id={r[0]})")
        return r[0]
    cur.execute("INSERT INTO programs (university_id,name,slug,degree_type,description,has_coop,program_url,career_outcomes,source_url,last_updated) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                 (uni_id, p["name"], p["slug"], p["degree_type"], p["description"], p["has_coop"], p["program_url"], p["career_outcomes"], p["program_url"], now))
    pid = cur.fetchone()[0]
    logger.info(f"  📚 Inserted: {p['name']} (id={pid})")
    return pid

def upsert_requirements(cur, pid, reqs):
    ielts = ielts_min = toefl = gpa = None
    additional = []
    src = None
    for r in reqs:
        if r["type"] == "ielts": ielts, ielts_min, src = r.get("ielts_overall"), r.get("ielts_min_band"), r.get("source_url")
        elif r["type"] == "toefl": toefl = r.get("toefl_ibt")
        elif r["type"] == "gpa": gpa = r.get("min_gpa")
        elif r["type"] in ("application_deadline",): additional.append(f"{r['type'].replace('_',' ').title()}: {r['value']}")
    add_text = "; ".join(additional) if additional else None
    cur.execute("SELECT id FROM requirements WHERE program_id=%s", (pid,))
    row = cur.fetchone()
    if row:
        cur.execute("UPDATE requirements SET ielts_overall=%s,ielts_min_band=%s,toefl_ibt=%s,min_gpa=%s,additional_requirements=%s,source_url=%s,last_updated=NOW() WHERE id=%s",
                     (ielts, ielts_min, toefl, gpa, add_text, src, row[0]))
        logger.info(f"    ✅ Updated requirements")
    else:
        cur.execute("INSERT INTO requirements (program_id,ielts_overall,ielts_min_band,toefl_ibt,min_gpa,additional_requirements,source_url) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                     (pid, ielts, ielts_min, toefl, gpa, add_text, src))
        logger.info(f"    ✅ Inserted requirements")

def upsert_costs(cur, pid, t):
    yearly = int(t["yearly_estimate"])
    yr = t["academic_year"]
    cur.execute("SELECT id FROM costs WHERE program_id=%s AND academic_year=%s", (pid, yr))
    row = cur.fetchone()
    if row:
        cur.execute("UPDATE costs SET tuition_yearly_international=%s,source_url=%s,last_updated=NOW() WHERE id=%s", (yearly, t["source_url"], row[0]))
        logger.info(f"    💰 Updated: ${yearly:,}/year")
    else:
        cur.execute("INSERT INTO costs (program_id,tuition_yearly_international,academic_year,source_url) VALUES (%s,%s,%s,%s)", (pid, yearly, yr, t["source_url"]))
        logger.info(f"    💰 Inserted: ${yearly:,}/year")

def main():
    logger.info("=" * 50)
    logger.info("🍁 USask Data Insertion")
    logger.info("=" * 50)
    data = load_data()
    conn = get_connection()
    cur = conn.cursor()
    try:
        uni = data["university"]
        for campus in data["campuses"]:
            logger.info(f"\n📍 Processing: {campus['name']}")
            loc_id = upsert_location(cur, campus["city"], campus["province"], campus["city_size"], campus["living_costs"]["monthly_estimate"])
            slug = slugify(campus["name"])
            uid = upsert_university(cur, campus["name"], slug, uni["description"], loc_id, uni["official_website"])
            for p in campus["programs"]:
                pid = upsert_program(cur, uid, p)
                upsert_requirements(cur, pid, p["requirements"])
                upsert_costs(cur, pid, p["tuition"])
        conn.commit()
        logger.info("\n✅ All USask data inserted/updated!")
    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()
