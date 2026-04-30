"""UCalgary Data Insertion. Usage: python data_sources/calgary/insert_data.py"""
import json, os, sys, logging
from datetime import datetime, timezone
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)
try:
    import psycopg2
except ImportError:
    logger.error("pip install psycopg2-binary"); sys.exit(1)
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent.parent / ".env.local")
except ImportError:
    pass

BASE_DIR = Path(__file__).parent

def main():
    logger.info("UCalgary Data Insertion")
    data = json.load(open(BASE_DIR / "normalized_data.json"))
    conn = psycopg2.connect(os.environ.get("DATABASE_URL", ""))
    cur = conn.cursor()
    try:
        uni = data["university"]
        for campus in data["campuses"]:
            slug = campus["name"].lower().replace(" ", "-")
            cur.execute("SELECT id FROM locations WHERE city=%s AND province=%s", (campus["city"], campus["province"]))
            r = cur.fetchone()
            if r:
                loc_id = r[0]
                cur.execute("UPDATE locations SET city_size=%s, estimated_monthly_living_cost=%s WHERE id=%s", (campus["city_size"], campus["living_costs"]["monthly_estimate"], loc_id))
            else:
                cur.execute("INSERT INTO locations (city,province,city_size,estimated_monthly_living_cost) VALUES (%s,%s,%s,%s) RETURNING id", (campus["city"], campus["province"], campus["city_size"], campus["living_costs"]["monthly_estimate"]))
                loc_id = cur.fetchone()[0]
            now = datetime.now(timezone.utc)
            cur.execute("SELECT id FROM universities WHERE slug=%s", (slug,))
            r = cur.fetchone()
            if r:
                uid = r[0]
                cur.execute("UPDATE universities SET name=%s,description=%s,location_id=%s,website_url=%s,last_updated=%s WHERE id=%s", (campus["name"], uni["description"], loc_id, uni["official_website"], now, uid))
            else:
                cur.execute("INSERT INTO universities (name,slug,description,location_id,website_url,source_url,last_updated) VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id", (campus["name"], slug, uni["description"], loc_id, uni["official_website"], uni["official_website"], now))
                uid = cur.fetchone()[0]
            for p in campus["programs"]:
                cur.execute("SELECT id FROM programs WHERE university_id=%s AND slug=%s", (uid, p["slug"]))
                r = cur.fetchone()
                if r:
                    pid = r[0]
                    cur.execute("UPDATE programs SET name=%s,degree_type=%s,description=%s,has_coop=%s,program_url=%s,career_outcomes=%s,last_updated=%s WHERE id=%s", (p["name"], p["degree_type"], p["description"], p["has_coop"], p["program_url"], p["career_outcomes"], now, pid))
                else:
                    cur.execute("INSERT INTO programs (university_id,name,slug,degree_type,description,has_coop,program_url,career_outcomes,source_url,last_updated) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id", (uid, p["name"], p["slug"], p["degree_type"], p["description"], p["has_coop"], p["program_url"], p["career_outcomes"], p["program_url"], now))
                    pid = cur.fetchone()[0]
                logger.info(f"  Program: {p['name']} (id={pid})")
        conn.commit()
        logger.info("Done!")
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()
