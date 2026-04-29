# SFU Data Module

Official data for Simon Fraser University.

## Campus

### SFU Burnaby (Primary BA campus)
- City: Burnaby, BC (Metro Vancouver)
- BA Tuition (international, 2025-26): **$36,429/year** ($1,214.31/unit × 30 units)
- Tuition + fees estimate: ~$37,442/year
- Total yearly cost estimate (with living): ~$54,821
- Living cost estimate: ~$1,449/month
- Application deadline: January 31 (Fall intake)
- BA requires 120 units, 60 at SFU, 45 upper division, 60 in FASS
- 22 BA majors + 30+ joint major combinations

### English Proficiency Requirements

Source: [SFU English Language Requirement](https://www.sfu.ca/students/admission/admission-requirements/english-language-requirement.html)

| Test | Minimum Score | Component Minimums |
|------|--------------|-------------------|
| IELTS Academic | 6.5 overall | No part below 6.0 |
| TOEFL iBT | 88 overall | No part below 20 |
| PTE Academic | 65 overall | Min 60 each skill |
| CAEL | 70 overall | No part below 60 |
| Cambridge | 176 overall | No part below 169 |
| Duolingo | 125 overall | Restricted: only where no other test available |

- IELTS One Skill Retake is **not** accepted

## Files

| File | Purpose |
|------|---------|
| `sources.json` | All official source URLs |
| `normalized_data.json` | Verified, structured data |
| `scrape.py` | Python scraper for SFU tuition and requirements |
| `insert_data.py` | PostgreSQL UPSERT insertion script |

## Data Sources

All data from official SFU websites:
- Tuition: `sfu.ca/students/calendar/.../tuition-fees.html`
- Costs: `sfu.ca/students/admission/fees-scholarships.html`
- English: `sfu.ca/students/admission/admission-requirements/english-language-requirement.html`
- BA program: `sfu.ca/fass/undergrad/.../ba-majors-minors.html`
- Timeline: `sfu.ca/students/admission/apply/timeline-and-evaluation.html`

## Usage

### Frontend (no database needed)
SFU data is integrated into `src/data/sample-programs.ts`. Appears in search, filters, and comparison.

### Database insertion
```bash
npm run db:migrate2
pip install psycopg2-binary python-dotenv
python data_sources/sfu/insert_data.py
```
