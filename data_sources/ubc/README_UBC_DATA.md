# UBC Data Module

Official data for the University of British Columbia, covering both campuses.

## Campuses

### UBC Vancouver
- City: Vancouver, BC
- BA Tuition (international, 2025-26): **$49,549/year** ($1,651.62/credit × 30 credits)
- Total 4-year estimate: ~$198,194 (tuition only)
- Living cost estimate: ~$1,800/month
- Application deadline: January 15
- BA requires 120 credits, at least 72 in Faculty of Arts

### UBC Okanagan
- City: Kelowna, BC
- BA Tuition (international, 2025-26): **$49,549/year** ($1,651.62/credit × 30 credits)
- Total 4-year estimate: ~$198,194 (tuition only)
- Living cost estimate: ~$1,300/month
- Application deadline: March 31 (extended for 2026)
- BA requires 120 credits, 48 at 300/400 level

### English Proficiency Requirements (both campuses)

Vancouver source: [UBC Academic Calendar — English Language Proficiency Tests](https://vancouver.calendar.ubc.ca/admissions/english-language-admission-standard/english-language-proficiency-tests)
Okanagan source: [UBC Okanagan Calendar — English Language Proficiency Tests and Programs](https://okanagan.calendar.ubc.ca/admissions/english-language-admission-standard/english-language-proficiency-tests-and-programs)

| Test | Minimum Score | Component Minimums |
|------|--------------|-------------------|
| IELTS Academic | 6.5 overall | No band below 6.0 |
| TOEFL iBT | 90 overall | R:22, L:22, W:21, S:21 |
| PTE Academic | 65 overall | R:60, L:60, W:60, S:60 |
| Duolingo (DET) | 125 overall | R:115, L:115, W:120, S:120 |
| CAEL | 70 overall | — |
| Cambridge | 180 | B2 First / C1 Advanced / C2 Proficiency |

- IELTS General, IELTS Indicator, and IELTS One Skill Retake are **not** accepted
- All scores must be achieved in a **single sitting**
- Tests taken more than **2 years** prior to application are not considered

Okanagan-only additional pathways:
- Okanagan College EAP Level 4 (EAPD 030 + EAPS 030 or EAPW 030 & EAPR 030, 70%+ each)
- UBC Okanagan English Foundation Program (EAP_O 103 & EAP_O 104) for conditional admission

## Files

| File | Purpose |
|------|---------|
| `sources.json` | All official source URLs with descriptions and last-checked dates |
| `normalized_data.json` | Verified, structured data ready for insertion |
| `scrape.py` | Python scraper for fetching tuition tables from UBC consultation pages |
| `insert_data.py` | PostgreSQL insertion script with UPSERT logic |

## Data Sources

All data sourced from official UBC websites:
- Tuition: `consultations.students.ubc.ca` (Board of Governors approved rates)
- Requirements: `you.ubc.ca/applying-ubc/requirements/`
- BA degree info: `arts.ubc.ca` and `fass.ok.ubc.ca`
- Living costs: `you.ubc.ca/financial-planning/cost/`
- Deadlines: `you.ubc.ca/applying-ubc/dates-deadlines/`

## Usage

### Frontend (no database needed)
UBC data is already integrated into `src/data/sample-programs.ts`. Both campuses appear in search, filters, and comparison.

### Database insertion
```bash
# Run migration first (adds campus fields)
npm run db:migrate2

# Then insert UBC data
pip install psycopg2-binary python-dotenv
python data_sources/ubc/insert_data.py
```

### Scraper (for data validation)
```bash
pip install beautifulsoup4 requests
python data_sources/ubc/scrape.py
```

## Adding More Universities

Follow this same pattern:
```
data_sources/
  ubc/              ← this module
  university_of_toronto/
    sources.json
    normalized_data.json
    scrape.py
    insert_data.py
    README_DATA.md
  mcgill/
    ...
```

Each module is self-contained with its own sources, scraper, and insertion logic.
