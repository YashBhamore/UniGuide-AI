# UniGuide AI
<img width="851" height="574" alt="image" src="https://github.com/user-attachments/assets/b6f9df45-a2e0-4eea-bca1-0ce2aef55dd5" />

UniGuide AI is a student decision-support pipeline for UNT. It turns public university webpages into structured guidance items, generates synthetic student profiles, ranks top recommendations per student goal, and evaluates recommendation quality.

## What This Builds

This project includes:

- A knowledge pipeline from raw UNT pages to agent-ready guidance items.
- An integrated `facultyinfo.unt.edu` scraper for faculty and research discovery pages.
- A synthetic student cohort (SSCD-style profiles).
- A recommendation engine that returns top 5 items per student with explanations.
- An evaluation script for coverage, goal consistency, and diversity.
- A Streamlit demo app powered by a trained classification model with SHAP explanations.

## Pipeline Outputs

Core data artifacts:

- `data/raw/uikd_raw.csv`
- `data/clean/uikd_clean.csv`
- `data/clean/uikd_enriched.csv`
- `data/clean/uikd_items.csv`

Agent artifacts:

- `data/synthetic/sscd_students.csv`
- `data/output/recommendations.csv`

Demo app assets:

- `app.py`
- `demo_assets/uniguide_model.pkl`
- `demo_assets/sscd.csv`
- `demo_assets/model_metadata.json`
- `ui_reference/UniGuideAI.jsx` (React design reference used to refresh the Streamlit portal UI)
- `frontend/` (new Vite + React portal UI implemented from the improved design bundle)

## Scripts

- `src/filter_urls.py`  
  Filters large URL lists to student-relevant UNT pages.
- `src/scrape_uikd.py`  
  Scrapes pages and builds the raw UIKD dataset.
- `src/scrape_facultyinfo.py`  
  Crawls `facultyinfo.unt.edu` and adds faculty/research pages into the raw corpus.
- `src/clean_uikd.py`  
  Merges raw sources, normalizes text, and adds TF-IDF tags.
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
- `src/run_pipeline.py`  
  Runs the pipeline end-to-end, with optional facultyinfo scraping.
- `src/portal_api.py`
  Serves the React portal with profile-specific API data and model-backed advisory results.

## Quick Start

1. Create and activate your virtual environment (if needed).
2. Install dependencies:

```bash
.venv/bin/pip install -r requirements.txt
```

3. Run the full pipeline:

```bash
.venv/bin/python src/run_pipeline.py --skip-scrape
```

4. Launch the demo app:

```bash
.venv/bin/streamlit run app.py
```

## New Portal UI

The repo now also includes a dedicated React frontend that implements the newer UI more faithfully than Streamlit can.

Run it with:

```bash
.venv/bin/python src/portal_api.py
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal, usually `http://localhost:5173`.

## Recommended Full Flow (Including Scraping)

If you want to rebuild from URLs:

```bash
.venv/bin/python src/filter_urls.py
.venv/bin/python src/run_pipeline.py --faculty-max-pages 25
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
- `src/clean_uikd.py` automatically includes `data/raw/facultyinfo_raw.csv` when present.
- Generated datasets are reproducible by rerunning the scripts.
