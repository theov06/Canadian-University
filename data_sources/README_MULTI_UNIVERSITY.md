# Multi-University Data — Whitelist System

Only approved institutions are included. All others have been removed.

## Approved Universities (10)

| # | Institution | City | Province | Type | Int'l Tuition/yr |
|---|------------|------|----------|------|-----------------|
| 1 | UBC Vancouver | Vancouver | BC | University | $49,549 |
| 2 | UBC Okanagan | Kelowna | BC | University | $49,549 |
| 3 | SFU Burnaby | Burnaby | BC | University | $36,429 |
| 4 | University of Saskatchewan | Saskatoon | SK | University | $37,878 |
| 5 | University of Victoria | Victoria | BC | University | $27,444 |
| 6 | University of Manitoba | Winnipeg | MB | University | $19,800 |
| 7 | UNBC | Prince George | BC | University | ~$22,000 |
| 8 | University of Lethbridge | Lethbridge | AB | University | ~$20,000 |
| 9 | MacEwan University | Edmonton | AB | University | ~$22,000 |
| 10 | University of New Brunswick | Fredericton | NB | University | ~$19,500 |

## Approved Colleges & Polytechnics (18)

### British Columbia
- Langara College (Vancouver) — Arts Transfer
- Douglas College (New Westminster) — Arts Transfer
- Vancouver Community College (Vancouver) — Diplomas
- Camosun College (Victoria) — Arts Transfer
- Okanagan College (Kelowna) — Arts Transfer
- Selkirk College (Castlegar) — Arts Transfer
- Capilano University (North Vancouver) — BA
- KPU (Surrey) — BA
- TRU (Kamloops) — BA
- BCIT (Burnaby) — Technology Diplomas

### Alberta
- SAIT (Calgary) — Technology
- NAIT (Edmonton) — Technology
- Bow Valley College (Calgary) — Diplomas
- NorQuest College (Edmonton) — Diplomas
- Red Deer Polytechnic — Diplomas/Transfer
- Medicine Hat College — Diplomas/Transfer
- Northwestern Polytechnic (Grande Prairie) — Diplomas/Transfer

### Saskatchewan
- Saskatchewan Polytechnic (Saskatoon) — Applied

### New Brunswick
- NBCC (Fredericton) — Applied

## Removed Institutions
- University of Toronto
- McGill University
- University of Ottawa
- University of Alberta
- Dalhousie University
- University of Waterloo
- Queen's University
- University of Calgary

## Data Pipeline

Each university has its own module under `data_sources/`:
```
data_sources/
  ubc/          — Detailed (scraped + verified)
  sfu/          — Detailed (scraped + verified)
  saskatchewan/ — Detailed (scraped + verified)
```

Colleges and new universities use the shared sample data in `src/data/sample-programs.ts`.
Individual data modules can be added as needed following the same pattern.

## Institution Types

- `university` — Offers BA degrees directly
- `college` — Offers diplomas, certificates, and transfer programs
- `polytechnic` — Offers applied/technology programs
