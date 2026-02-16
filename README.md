# UniGuide AI

UniGuide AI is a student decision-support pipeline for UNT. It turns public university webpages into structured guidance items, generates synthetic student profiles, ranks top recommendations per student goal, and evaluates recommendation quality.

## What This Builds

This project is not only a dataset build. It includes:

- A knowledge pipeline from raw UNT pages to agent-ready guidance items.
- A synthetic student cohort (SSCD-style profiles).
- A recommendation engine that returns top 5 items per student with explanations.
- An evaluation script for coverage, goal consistency, and diversity.

## Pipeline Outputs

Core data artifacts:

- `data/raw/uikd_raw.csv`
- `data/clean/uikd_clean.csv`
- `data/clean/uikd_enriched.csv`
- `data/clean/uikd_items.csv`

Agent artifacts:

- `data/synthetic/sscd_students.csv`
- `data/output/recommendations.csv`

## Scripts

- `src/filter_urls.py`  
  Filters large URL lists to student-relevant UNT pages.
- `src/scrape_uikd.py`  
  Scrapes pages and builds the raw UIKD dataset.
- `src/clean_uikd.py`  
  Normalizes text and adds TF-IDF tags.
- `src/enrich_uikd.py`  
  Adds deadline and action signals.
- `src/split_uikd_items.py`  
  Splits long pages into guidance chunks (items dataset).
- `src/generate_sscd_students.py`  
  Creates synthetic student profiles.
- `src/rank_guidance.py`  
  Scores and ranks top recommendations per student.
- `src/evaluate_recs.py`  
  Evaluates non-zero recommendations, goal consistency, and diversity.

## Quick Start

1. Create and activate your virtual environment (if needed).
2. Install dependencies:

```bash
.venv/bin/pip install pandas scikit-learn requests beautifulsoup4 lxml
```

3. Run the full pipeline:

```bash
.venv/bin/python src/clean_uikd.py
.venv/bin/python src/enrich_uikd.py
.venv/bin/python src/split_uikd_items.py
.venv/bin/python src/generate_sscd_students.py
.venv/bin/python src/rank_guidance.py
.venv/bin/python src/evaluate_recs.py
```

## Recommended Full Flow (Including Scraping)

If you want to rebuild from URLs:

```bash
.venv/bin/python src/filter_urls.py
.venv/bin/python src/scrape_uikd.py
.venv/bin/python src/clean_uikd.py
.venv/bin/python src/enrich_uikd.py
.venv/bin/python src/split_uikd_items.py
.venv/bin/python src/generate_sscd_students.py
.venv/bin/python src/rank_guidance.py
.venv/bin/python src/evaluate_recs.py
```

## Validation Checks

Useful one-liners:

```bash
.venv/bin/python -c "import pandas as pd; print(pd.read_csv('data/raw/uikd_raw.csv').shape)"
.venv/bin/python -c "import pandas as pd; print(pd.read_csv('data/clean/uikd_clean.csv').shape)"
.venv/bin/python -c "import pandas as pd; print(pd.read_csv('data/clean/uikd_enriched.csv').shape)"
.venv/bin/python -c "import pandas as pd; print(len(pd.read_csv('data/clean/uikd_items.csv')))"
.venv/bin/python -c "import pandas as pd; print(pd.read_csv('data/synthetic/sscd_students.csv').shape)"
.venv/bin/python -c "import pandas as pd; print(pd.read_csv('data/output/recommendations.csv').shape)"
```

## Notes

- `.gitignore` excludes `data/`, `Data/`, `.venv/`, and local artifacts.
- Generated datasets are reproducible by rerunning the scripts.
