# University of Saskatchewan Data Module

Official data for the University of Saskatchewan (USask), Saskatoon.

## Campus

### USask Saskatoon
- City: Saskatoon, SK
- BA Tuition (international, 2025-26): **$37,878/year** ($1,251.10/credit unit × ~30 cu)
- Total 4-year estimate: ~$151,512 (tuition only)
- Living cost estimate: ~$1,100/month
- Application deadline: Rolling (apply early)
- BA requires 120 credit units
- 24 BA majors in the College of Arts and Science

### English Proficiency Requirements

Source: [USask English Language Proficiency](https://admissions.usask.ca/requirements/english-language-proficiency.php)

| Test | Minimum Score | Component Minimums |
|------|--------------|-------------------|
| IELTS Academic | 6.5 overall | Min 6.0 each |
| TOEFL iBT (old 0-120) | 86 overall | Min 19 each |
| TOEFL iBT (new 1-6) | 4.5 overall | Min 4.0 each |
| PTE Academic | 63 overall | Min 59 each |
| CAEL | 70 overall | Min 60 each |
| Duolingo (DET) | 120 overall | Min 100 each (effective Jan 2026) |
| Cambridge C1 | 176 overall | — |

- All scores from single sitting, valid 2 years
- Old TOEFL 0-120 scores accepted if taken before January 21, 2026

## Files

| File | Purpose |
|------|---------|
| `sources.json` | Official source URLs |
| `normalized_data.json` | Verified structured data |
| `scrape.py` | Python scraper |
| `insert_data.py` | PostgreSQL UPSERT script |

## Data Sources

- Tuition: `admissions.usask.ca/money/tuition.php`
- Rates: `students.usask.ca/money/tuition-fees/undergraduate-tuition.php`
- English: `admissions.usask.ca/requirements/english-language-proficiency.php`
- Programs: `programs.usask.ca/arts-and-science/programs.php`
