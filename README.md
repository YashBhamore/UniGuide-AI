# UniGuide AI
<img width="851" height="574" alt="image" src="https://github.com/user-attachments/assets/b6f9df45-a2e0-4eea-bca1-0ce2aef55dd5" />

UniGuide AI is a student decision-support system for UNT. It turns public university webpages into structured guidance items, trains an advisory model on synthetic student data, and surfaces personalized recommendations through a full-stack React portal — including a conversational AI agent that answers student questions grounded in real UNT guidance data.

## What This Builds

This project includes:

- A knowledge pipeline from raw UNT pages to agent-ready guidance items.
- An integrated `facultyinfo.unt.edu` scraper for faculty and research discovery pages.
- A synthetic student cohort (SSCD-style profiles).
- A recommendation engine that returns top 5 items per student with explanations.
- An evaluation script for coverage, goal consistency, and diversity.
- A Random Forest advisory model (92.5% accuracy, F1: 0.9456, ROC-AUC: 0.97) trained on 1,000 synthetic UNT student records.
- A full React + Vite portal with an **AI Action Center** — a chat agent backed by 1,059 real UNT guidance chunks.

## ✨ AI Action Center

The centerpiece of the portal is the **AI Action Center** — a conversational advisor tab that gives students actionable, personalized answers without leaving the app.

**How it works:**

**Demo**: https://drive.google.com/file/d/1wnxISm9Qh92K6K81kcjjfmDSW2NNtWnK/view?usp=sharing 

1. **Priority action cards** are auto-generated from the student's profile: high-priority assignments (with due dates), eligible scholarships (with deadlines), and UNT calendar items like Fall registration. Clicking any card pre-fills the chat.
2. **Smart local answers** — the chat engine matches the student's question against their real profile data (program, GPA, advisor, scholarships, assignments) and returns a personalized, natural-language response for topics like:
   - Scholarship eligibility and application deadlines
   - Fall registration checklist and advisor clearance steps
   - On-campus job recommendations by AI match score
   - Advisor contact, office hours, and appointment booking
   - International student / F-1 employment guidance
   - GPA standing and academic priority items
3. **Real UNT source links** — the backend `/api/ask` endpoint runs a keyword search over `uikd_items.csv` (1,059 scraped UNT guidance chunks) and returns matching page links, shown as clickable badges below each answer.
4. **Next Semester Prep checklist** tracks the five key steps every student should complete before Fall registration.

**Result:** Students get clean, personalized advice grounded in real UNT data — not raw webpage dumps.

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
  Serves the React portal: profile inference, model prediction, job/scholarship ranking, and the `/api/ask` AI chat endpoint that searches the UNT guidance knowledge base.

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

## Running the Portal (React + AI Agent)

The main interface is a React + Vite portal backed by a Python API. You need two terminals.

**Terminal 1 — Python API** (model inference + AI Action Center search):

```bash
.venv/bin/python src/portal_api.py
```

**Terminal 2 — React frontend**:

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173`. The portal works even if the API is offline — it falls back to demo data automatically.

### Portal tabs

| Tab | What it shows |
|-----|--------------|
| Dashboard | AI advisory score, urgent assignments, top job + scholarship matches |
| **AI Action Center** | Conversational AI agent — personalized answers + real UNT source links |
| Academics | Courses, assignments, recordings, AI homework assistant |
| Career Match | On-campus jobs ranked by AI compatibility |
| Scholarships | Funding opportunities matched to your profile |
| Appointments | Book advising sessions with your assigned advisor |
| Profile | Academic info and notification preferences |

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
