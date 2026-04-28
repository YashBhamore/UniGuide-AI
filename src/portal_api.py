import argparse
import hashlib
import json
import random
import re
from datetime import date, timedelta
from functools import lru_cache
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import joblib
import pandas as pd
import shap
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


ROOT_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT_DIR / "demo_assets"
DATA_DIR = ROOT_DIR / "data"
MODEL_PATH = ASSETS_DIR / "uniguide_model.pkl"
SSCD_PATH = ASSETS_DIR / "sscd.csv"
METADATA_PATH = ASSETS_DIR / "model_metadata.json"
ITEMS_PATH = DATA_DIR / "clean" / "uikd_items.csv"

FEATURE_DISPLAY = {
    "age": "Age",
    "student_level": "Student Level",
    "program_total_credits": "Program Credits",
    "credits": "Current Credits",
    "semester": "Semester #",
    "program_category": "Program",
    "schol_athlete": "Athlete Scholarship",
    "nationality": "Nationality",
    "int_healthcare_analytics": "Healthcare Analytics Interest",
    "semester_stage": "Semester Stage",
    "int_entrepreneurship": "Entrepreneurship Interest",
    "schol_in_state": "In-State Scholarship",
    "schol_alumni": "Alumni Scholarship",
    "aid_in_state_grant": "In-State Grant",
    "schol_merit": "Merit Scholarship",
}

PLAIN_EXPLANATIONS = {
    "age": "Your age sits in a range that campus employers often hire from.",
    "student_level": "Your student level affects the roles and support paths that fit best.",
    "program_total_credits": "Program progress helps estimate how stable your academic momentum is.",
    "credits": "Current credits help the model infer schedule capacity and full-time enrollment.",
    "semester": "Semester timing matters because many campus roles prefer students who already know the system.",
    "program_category": "Your academic program is one of the strongest matching signals.",
    "schol_athlete": "Scholarship profile affects how the model interprets funding and availability.",
    "nationality": "Nationality changes how the model interprets historical student patterns.",
    "int_healthcare_analytics": "This interest aligns with more technical and research-oriented roles.",
    "semester_stage": "Fall and Spring cohorts show different advisory patterns.",
    "int_entrepreneurship": "Entrepreneurship interest signals initiative and cross-campus engagement.",
    "schol_in_state": "In-state support changes how the model reads financial pressure.",
    "schol_alumni": "Alumni-backed scholarship status slightly changes the support profile.",
    "aid_in_state_grant": "Grant support changes how strongly the model expects work need.",
    "schol_merit": "Merit support may reduce urgency while still signaling strong academic fit.",
}

FIRST_NAMES = [
    "Avery", "Jordan", "Taylor", "Morgan", "Riley", "Cameron", "Noah", "Emma",
    "Sophia", "Liam", "Maya", "Arjun", "Priya", "Mateo", "Aisha", "Lucas",
]
LAST_NAMES = [
    "Nguyen", "Patel", "Johnson", "Garcia", "Kim", "Brown", "Miller", "Singh",
    "Hernandez", "Lopez", "Chen", "Taylor", "Walker", "Bhamore", "Rahman", "Stein",
]

PROGRAM_COURSES = {
    "Data Science": [
        "INFO 4820|Machine Learning Applications",
        "INFO 5082|Data Science Capstone",
        "MATH 3680|Applied Statistics",
        "INFO 4550|Cloud Data Engineering",
        "INFO 4300|Data Visualization Systems",
        "INFO 4210|Data Wrangling Studio",
    ],
    "Computer Science": [
        "CSCE 3444|Operating Systems",
        "CSCE 3530|Computer Networks",
        "CSCE 4110|Algorithms Design",
        "CSCE 4901|Senior Design Project",
        "CSCE 3600|Systems Programming",
        "CSCE 4350|Artificial Intelligence",
    ],
    "Engineering": [
        "ENGR 3200|Systems Modeling",
        "MEEN 3310|Thermodynamics II",
        "EENG 2710|Digital Logic Design",
        "ENGR 4900|Engineering Project Lab",
        "ENGR 3110|Engineering Data Analysis",
        "ENGR 4100|Control Systems",
    ],
    "Business": [
        "BCIS 3610|Information Systems Design",
        "BLAW 3430|Business Ethics",
        "FINA 3770|Managerial Finance",
        "MKTG 3650|Consumer Insights",
        "DSCI 3870|Business Analytics",
        "MGMT 4470|Project Leadership",
    ],
    "Arts": [
        "ART 3410|Visual Storytelling",
        "COMM 3020|Digital Media Strategy",
        "MUMH 3500|Music and Culture",
        "THEA 3140|Performance Production",
        "ART 4540|Portfolio Studio",
        "COMM 4100|Creative Research Seminar",
    ],
    "General": [
        "UNIV 3100|Career Readiness Lab",
        "COUN 3200|Student Success Strategies",
        "ENGL 3450|Professional Writing",
        "RHAB 3000|Leadership Foundations",
        "SOCI 3200|Campus and Community",
        "HIST 3900|Texas Institutions",
    ],
}

JOB_TEMPLATES = [
    {
        "title": "Research Assistant",
        "dept": "Faculty Research Office",
        "type": "On-Campus",
        "pay": "$14/hr",
        "hours": "10-15 hrs/wk",
        "skills": ["Research", "Data Analysis"],
        "_programs": {"Data Science", "Computer Science", "Engineering"},
        "_interests": {"Healthcare Analytics", "AI & Machine Learning", "Predictive Modeling"},
    },
    {
        "title": "IT Help Desk Specialist",
        "dept": "UNT IT Services",
        "type": "On-Campus",
        "pay": "$13/hr",
        "hours": "12-20 hrs/wk",
        "skills": ["Technical Support", "Communication"],
        "_programs": {"Data Science", "Computer Science", "Engineering"},
        "_interests": {"Big Data Analytics", "AI & Machine Learning"},
    },
    {
        "title": "Student Ambassador",
        "dept": "Office of Admissions",
        "type": "On-Campus",
        "pay": "$12/hr",
        "hours": "8-12 hrs/wk",
        "skills": ["Public Speaking", "Campus Knowledge"],
        "_programs": {"Business", "Arts", "General"},
        "_interests": {"Entrepreneurship", "Business Strategy"},
    },
    {
        "title": "Library Research Aide",
        "dept": "Willis Library",
        "type": "On-Campus",
        "pay": "$12.50/hr",
        "hours": "10-15 hrs/wk",
        "skills": ["Research", "Attention to Detail"],
        "_programs": {"Arts", "General", "Business", "Data Science"},
        "_interests": {"Research", "Big Data Analytics"},
    },
    {
        "title": "Analytics Peer Tutor",
        "dept": "Learning Center",
        "type": "On-Campus",
        "pay": "$15/hr",
        "hours": "6-10 hrs/wk",
        "skills": ["Tutoring", "Statistics"],
        "_programs": {"Data Science", "Business", "Computer Science"},
        "_interests": {"Healthcare Analytics", "Financial Analytics"},
    },
    {
        "title": "Innovation Lab Assistant",
        "dept": "Student Innovation Hub",
        "type": "On-Campus",
        "pay": "$13.50/hr",
        "hours": "10-12 hrs/wk",
        "skills": ["Prototyping", "Initiative"],
        "_programs": {"Engineering", "Data Science", "Business"},
        "_interests": {"Entrepreneurship", "AI & Machine Learning", "Business Strategy"},
    },
]


def parse_args():
    parser = argparse.ArgumentParser(description="Serve the UniGuide portal API.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    return parser.parse_args()


def stable_int(value: str) -> int:
    return int(hashlib.md5(value.encode("utf-8")).hexdigest(), 16)


def normalize_identifier(identifier: str) -> str:
    cleaned = (identifier or "").strip().lower()
    return cleaned or "demo@unt.edu"


def split_csv_field(value: str) -> list[str]:
    return [part.strip() for part in str(value or "").split(",") if part.strip()]


def clean_page_title(title: str) -> str:
    title = str(title or "").replace("|  University of North Texas", "")
    title = title.replace("| University of North Texas", "").strip()
    return title


def refresh_profile_flags(profile: dict) -> None:
    scholarships = profile.get("scholarships", []) or []
    interests = profile.get("interests", []) or []
    profile["schol_alumni"] = int(any("Alumni" in s for s in scholarships)) if "schol_alumni" not in profile or isinstance(profile["schol_alumni"], bool) or isinstance(profile["schol_alumni"], int) else profile["schol_alumni"]
    profile["schol_athlete"] = int(any("Athlete" in s for s in scholarships)) if "schol_athlete" not in profile or isinstance(profile["schol_athlete"], bool) or isinstance(profile["schol_athlete"], int) else profile["schol_athlete"]
    profile["schol_in_state"] = int(any("State" in s for s in scholarships)) if "schol_in_state" not in profile or isinstance(profile["schol_in_state"], bool) or isinstance(profile["schol_in_state"], int) else profile["schol_in_state"]
    profile["schol_merit"] = int(any("Merit" in s or "General" in s for s in scholarships)) if "schol_merit" not in profile or isinstance(profile["schol_merit"], bool) or isinstance(profile["schol_merit"], int) else profile["schol_merit"]
    profile["int_entrepreneurship"] = int(any("Entrepreneur" in s for s in interests)) if "int_entrepreneurship" not in profile or isinstance(profile["int_entrepreneurship"], bool) or isinstance(profile["int_entrepreneurship"], int) else profile["int_entrepreneurship"]
    profile["int_healthcare_analytics"] = int(any("Healthcare" in s for s in interests)) if "int_healthcare_analytics" not in profile or isinstance(profile["int_healthcare_analytics"], bool) or isinstance(profile["int_healthcare_analytics"], int) else profile["int_healthcare_analytics"]


def infer_name(identifier: str, seed: int) -> str:
    if "@" in identifier:
        local = identifier.split("@", 1)[0]
    else:
        local = identifier
    pieces = [piece for piece in re.split(r"[^a-zA-Z]+", local) if piece]
    if len(pieces) >= 2:
        return " ".join(piece.capitalize() for piece in pieces[:2])
    if len(pieces) == 1 and len(pieces[0]) > 2:
        return pieces[0].capitalize()
    return f"{FIRST_NAMES[seed % len(FIRST_NAMES)]} {LAST_NAMES[(seed // 7) % len(LAST_NAMES)]}"


@lru_cache(maxsize=1)
def load_model_bundle():
    metadata = {}
    if METADATA_PATH.exists():
        metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))

    sscd = pd.read_csv(SSCD_PATH)
    df = sscd.copy()
    df.drop(
        columns=["student_id", "SSN", "date_of_birth", "place_of_birth", "academic_advisor"],
        inplace=True,
    )

    schol_d = df["scholarships"].fillna("").str.get_dummies(sep=", ")
    schol_d.columns = [
        "schol_" + c.lower().replace(" ", "_").replace("-", "_")
        for c in schol_d.columns
    ]
    df = pd.concat([df, schol_d], axis=1).drop(columns=["scholarships"])

    aid_d = df["financial_aid"].fillna("").str.get_dummies(sep=", ")
    aid_d.columns = [
        "aid_" + c.lower().replace(" ", "_").replace("-", "_")
        for c in aid_d.columns
    ]
    df = pd.concat([df, aid_d], axis=1).drop(columns=["financial_aid"])

    int_d = df["area_of_interest"].fillna("").str.get_dummies(sep=", ")
    int_d.columns = [
        "int_" + c.lower().replace(" ", "_").replace("-", "_")
        for c in int_d.columns
    ]
    df = pd.concat([df, int_d], axis=1).drop(columns=["area_of_interest"])

    df["has_research"] = df["research"].notna().astype(int)
    df.drop(columns=["research"], inplace=True)

    le_fitted = {}
    for col in [
        "student_level",
        "international_status",
        "program_category",
        "semester_stage",
        "part_time_enrollment",
        "nationality",
    ]:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        le_fitted[col] = le

    df["target"] = (df["on_campus_work"] == "Yes").astype(int)
    df.drop(columns=["on_campus_work"], inplace=True)

    X = df.drop(columns=["target"])
    y = df["target"]

    selected_features = metadata.get("selected_features")
    if not selected_features:
        rf_base = RandomForestClassifier(n_estimators=100, random_state=42)
        rf_base.fit(X, y)
        importances = pd.Series(rf_base.feature_importances_, index=X.columns)
        selected_features = importances[importances >= 0.01].index.tolist()

    X_sel = X[selected_features]
    _, X_test, _, _ = train_test_split(
        X_sel, y, test_size=0.2, random_state=42, stratify=y
    )

    model = joblib.load(MODEL_PATH)
    explainer = shap.TreeExplainer(model)
    shap_vals = explainer.shap_values(X_test)
    if isinstance(shap_vals, list):
        sv = shap_vals[1]
    else:
        sv = shap_vals[:, :, 1]
    mean_shap = pd.Series(abs(sv).mean(axis=0), index=selected_features).to_dict()

    return {
        "model": model,
        "explainer": explainer,
        "encoders": le_fitted,
        "selected_features": selected_features,
        "mean_shap": mean_shap,
        "sscd": pd.read_csv(SSCD_PATH),
    }


@lru_cache(maxsize=1)
def load_items() -> pd.DataFrame:
    return pd.read_csv(ITEMS_PATH).fillna("")


def build_profile(identifier: str, overrides: dict | None = None) -> dict:
    bundle = load_model_bundle()
    seed = stable_int(identifier)
    row = bundle["sscd"].iloc[seed % len(bundle["sscd"])].to_dict()
    advisor_names = split_csv_field(row.get("academic_advisor", ""))
    advisor = advisor_names[0] if advisor_names else "Dr. Sarah Mitchell"
    name = infer_name(identifier, seed)
    scholarships = split_csv_field(row.get("scholarships", ""))[:3]
    interests = split_csv_field(row.get("area_of_interest", ""))[:3]
    status = row.get("international_status", "Domestic")
    profile = {
        "student_id": row.get("student_id", f"SSCD_{seed % 1000:03d}"),
        "name": name,
        "email": identifier if "@" in identifier else f"{identifier}@my.unt.edu",
        "euid": identifier.split("@", 1)[0] if "@" in identifier else identifier,
        "age": int(row.get("age", 21)),
        "level": row.get("student_level", "Undergraduate"),
        "program": row.get("program_category", "General"),
        "semesterStage": row.get("semester_stage", "Fall"),
        "semester": int(row.get("semester", 3)),
        "programTotalCredits": int(row.get("program_total_credits", 120)),
        "credits": int(row.get("credits", 12)),
        "gpa": round(2.8 + ((seed % 100) / 100) + (0.12 if scholarships else 0.0), 2),
        "nationality": row.get("nationality", "American"),
        "status": status,
        "advisor": advisor,
        "advisorEmail": re.sub(r"[^a-z]+", ".", advisor.lower()).strip(".") + "@unt.edu",
        "scholarships": scholarships,
        "interests": interests,
        "schol_alumni": int(any("Alumni" in s for s in scholarships)),
        "schol_athlete": int(any("Athlete" in s for s in scholarships)),
        "schol_in_state": int(any("In-State" in s for s in scholarships)),
        "schol_merit": int(any("Merit" in s or "General" in s for s in scholarships)),
        "aid_in_state_grant": int("grant" in str(row.get("financial_aid", "")).lower()),
        "int_entrepreneurship": int(any("Entrepreneur" in s for s in interests)),
        "int_healthcare_analytics": int(any("Healthcare" in s for s in interests)),
    }

    if profile["gpa"] > 4.0:
        profile["gpa"] = 3.98

    if overrides:
        profile.update({k: v for k, v in overrides.items() if v not in ("", None)})
        if "program" in overrides:
            profile["program"] = overrides["program"]
        if "level" in overrides:
            profile["level"] = overrides["level"]

    refresh_profile_flags(profile)

    return profile


def build_input_row(profile: dict) -> pd.DataFrame:
    bundle = load_model_bundle()
    encoders = bundle["encoders"]
    safe_level = profile["level"] if profile["level"] in encoders["student_level"].classes_ else encoders["student_level"].classes_[0]
    safe_program = profile["program"] if profile["program"] in encoders["program_category"].classes_ else encoders["program_category"].classes_[0]
    safe_stage = profile["semesterStage"] if profile["semesterStage"] in encoders["semester_stage"].classes_ else encoders["semester_stage"].classes_[0]
    safe_nationality = profile["nationality"] if profile["nationality"] in encoders["nationality"].classes_ else encoders["nationality"].classes_[0]
    row = {
        "student_level": encoders["student_level"].transform([safe_level])[0],
        "program_category": encoders["program_category"].transform([safe_program])[0],
        "semester_stage": encoders["semester_stage"].transform([safe_stage])[0],
        "semester": int(profile["semester"]),
        "program_total_credits": int(profile["programTotalCredits"]),
        "credits": int(profile["credits"]),
        "age": int(profile["age"]),
        "nationality": encoders["nationality"].transform([safe_nationality])[0],
        "schol_alumni": int(profile.get("schol_alumni", 0)),
        "schol_athlete": int(profile.get("schol_athlete", 0)),
        "schol_in_state": int(profile.get("schol_in_state", 0)),
        "schol_merit": int(profile.get("schol_merit", 0)),
        "aid_in_state_grant": int(profile.get("aid_in_state_grant", 0)),
        "int_entrepreneurship": int(profile.get("int_entrepreneurship", 0)),
        "int_healthcare_analytics": int(profile.get("int_healthcare_analytics", 0)),
    }
    input_df = pd.DataFrame([row])
    for feature in bundle["selected_features"]:
        if feature not in input_df.columns:
            input_df[feature] = 0
    return input_df[bundle["selected_features"]]


def build_prediction(profile: dict) -> dict:
    bundle = load_model_bundle()
    input_df = build_input_row(profile)
    model = bundle["model"]
    explainer = bundle["explainer"]
    pred = int(model.predict(input_df)[0])
    prob_yes = float(model.predict_proba(input_df)[0][1])
    shap_val = explainer.shap_values(input_df)
    if isinstance(shap_val, list):
        sv_row = shap_val[1][0]
    else:
        sv_row = shap_val[0, :, 1]

    shap_df = pd.DataFrame(
        {
            "feature": bundle["selected_features"],
            "display": [FEATURE_DISPLAY.get(f, f) for f in bundle["selected_features"]],
            "shap": sv_row,
        }
    ).sort_values("shap", key=abs, ascending=False)

    signals = []
    for _, row in shap_df.head(5).iterrows():
        magnitude = abs(float(row["shap"]))
        if magnitude >= 0.08:
            signal = "Strong"
        elif magnitude >= 0.03:
            signal = "Good"
        else:
            signal = "Weak"
        signals.append(
            {
                "factor": row["display"],
                "signal": signal,
                "positive": bool(row["shap"] >= 0),
                "text": PLAIN_EXPLANATIONS.get(row["feature"], "This factor influenced the model output."),
            }
        )

    confidence = prob_yes if pred == 1 else 1 - prob_yes
    match_score = int(round(prob_yes * 100))
    return {
        "pred": pred,
        "probYes": round(prob_yes, 4),
        "confidence": round(confidence, 4),
        "matchScore": match_score,
        "signals": signals,
        "topPercentLabel": "Top 8% of students" if match_score >= 92 else "Competitive match profile",
    }


def build_courses(profile: dict, seed: int) -> list[dict]:
    catalog = PROGRAM_COURSES.get(profile["program"], PROGRAM_COURSES["General"])
    rotation = seed % len(catalog)
    selected = (catalog[rotation:] + catalog[:rotation])[:4]
    rng = random.Random(seed)
    courses = []
    for idx, item in enumerate(selected):
        code, name = item.split("|", 1)
        progress = min(95, 35 + int(profile["semester"]) * 9 + idx * 7 + rng.randint(0, 8))
        grade_scale = ["B", "B+", "A-", "A"]
        grade = grade_scale[(seed + idx) % len(grade_scale)]
        color = ["#2563EB", "#059669", "#7C3AED", "#D97706"][idx % 4]
        courses.append(
            {
                "code": code,
                "name": name,
                "prof": ["Dr. Park", "Dr. Whitworth", "Dr. Chen", "Dr. Voss", "Dr. Rahman", "Dr. Stein"][(seed + idx) % 6],
                "progress": progress,
                "grade": grade,
                "credits": 3,
                "color": color,
                "recordings": 2 + ((seed + idx) % 5),
                "assignments": 1 + ((seed + idx * 3) % 4),
            }
        )
    return courses


def build_assignments(courses: list[dict], seed: int) -> list[dict]:
    today = date.today()
    templates = [
        "Final Project Brief",
        "Model Evaluation Report",
        "Presentation Deck",
        "Architecture Reflection",
        "Case Analysis",
        "Problem Set",
    ]
    items = []
    for idx, course in enumerate(courses[:4]):
        items.append(
            {
                "course": course["code"],
                "title": f"{course['name']} {templates[(seed + idx) % len(templates)]}",
                "due": (today + timedelta(days=idx + 1 + (seed % 3))).strftime("%b %d, %Y"),
                "status": ["in-progress", "not-started", "submitted"][(seed + idx) % 3],
                "priority": ["high", "high", "medium", "low"][idx % 4],
            }
        )
    return items


def build_recordings(courses: list[dict], seed: int) -> list[dict]:
    today = date.today()
    topics = [
        "Research Methods",
        "System Walkthrough",
        "Studio Critique",
        "Applied Analytics",
        "Decision Frameworks",
        "Project Milestones",
    ]
    recordings = []
    for idx, course in enumerate(courses[:4]):
        recordings.append(
            {
                "course": course["code"],
                "title": f"{course['name']}: {topics[(seed + idx) % len(topics)]}",
                "date": (today - timedelta(days=idx + 2)).strftime("%b %d, %Y"),
                "duration": f"{42 + ((seed + idx) % 24)} min",
            }
        )
    return recordings


def build_jobs(profile: dict, prediction: dict, seed: int) -> list[dict]:
    interests = set(profile.get("interests", []))
    results = []
    for idx, template in enumerate(JOB_TEMPLATES):
        t_programs = template["_programs"]
        t_interests = template["_interests"]
        score = 55
        if profile["program"] in t_programs:
            score += 18
        if interests & t_interests:
            score += 12
        if profile["status"] == "Domestic":
            score += 4
        if int(profile["semester"]) >= 3:
            score += 5
        score += min(8, max(0, prediction["matchScore"] - 70) // 5)
        score += (seed + idx) % 5
        score = min(97, score)
        why = []
        if profile["program"] in t_programs:
            why.append(f"Your {profile['program']} program aligns strongly with this role.")
        if interests & t_interests:
            why.append(f"Your interests in {', '.join(sorted(interests & t_interests)[:2])} support this match.")
        if int(profile["semester"]) >= 3:
            why.append("Your current semester suggests enough campus familiarity for the role.")
        if profile["gpa"] >= 3.5:
            why.append(f"Your GPA of {profile['gpa']:.2f} strengthens the application profile.")
        results.append({
            "title": template["title"],
            "dept": template["dept"],
            "type": template["type"],
            "pay": template["pay"],
            "hours": template["hours"],
            "skills": template["skills"],
            "match": score,
            "why": why[:3] or ["This role aligns with your current academic profile."],
        })
    results.sort(key=lambda item: item["match"], reverse=True)
    return results[:4]


def build_scholarships(profile: dict, seed: int) -> list[dict]:
    items = load_items().copy()
    if items.empty:
        return []

    items["blob"] = (
        items["page_title"].astype(str)
        + " "
        + items["item_title"].astype(str)
        + " "
        + items["item_text"].astype(str)
        + " "
        + items["tags"].astype(str)
    ).str.lower()

    scholarship_terms = ("scholarship", "grant", "waiver", "funding", "financial aid")
    mask = items["blob"].apply(lambda text: any(term in text for term in scholarship_terms))
    items = items[mask].copy()
    if items.empty:
        return []

    def score_row(row):
        text = row["blob"]
        score = 50
        score += sum(term in text for term in scholarship_terms) * 6
        if row["category"] == "financial_aid":
            score += 18
        if profile["status"] == "International" and ("international" in text or row["category"] == "international"):
            score += 15
        if profile["status"] == "Domestic" and ("texas" in text or "in-state" in text):
            score += 10
        if profile["gpa"] >= 3.5 and ("merit" in text or "award" in text):
            score += 8
        score += (seed % 4)
        return min(97, score)

    items["score"] = items.apply(score_row, axis=1)
    items = items.sort_values("score", ascending=False).drop_duplicates("doc_id").head(4)

    scholarships = []
    for _, row in items.iterrows():
        deadline_parts = split_csv_field(row.get("deadline_signals", ""))
        scholarships.append(
            {
                "name": clean_page_title(row.get("page_title", "UNT Scholarship Opportunity")),
                "amount": ["$1,500", "$2,500", "$3,000", "$4,000"][stable_int(str(row.get("doc_id"))) % 4],
                "deadline": deadline_parts[0] if deadline_parts else "See page for latest date",
                "match": int(row["score"]),
                "eligible": row["score"] >= 78,
                "req": row.get("tags", "")[:120] or "Review the linked guidance page for full eligibility details.",
                "url": row.get("url", ""),
            }
        )
    return scholarships


def build_briefing(profile: dict, prediction: dict, jobs: list[dict], scholarships: list[dict], assignments: list[dict]) -> list[str]:
    urgent_count = sum(1 for item in assignments if item["priority"] == "high")
    return [
        f"AI advisory score is {prediction['matchScore']}% for on-campus work.",
        f"Top job match is {jobs[0]['title']} at {jobs[0]['match']}%." if jobs else "Job matches are available for discussion.",
        f"{sum(1 for item in scholarships if item['eligible'])} scholarship opportunities are currently marked eligible.",
        f"{urgent_count} academic tasks are currently high priority.",
    ]


def build_portal_payload(identifier: str, overrides: dict | None = None) -> dict:
    normalized = normalize_identifier(identifier)
    seed = stable_int(normalized)
    profile = build_profile(normalized, overrides=overrides)
    prediction = build_prediction(profile)
    profile["matchScore"] = prediction["matchScore"]
    courses = build_courses(profile, seed)
    assignments = build_assignments(courses, seed)
    recordings = build_recordings(courses, seed)
    jobs = build_jobs(profile, prediction, seed)
    scholarships = build_scholarships(profile, seed)
    briefing = build_briefing(profile, prediction, jobs, scholarships, assignments)
    return {
        "user": profile,
        "courses": courses,
        "jobs": jobs,
        "scholarships": scholarships,
        "assignments": assignments,
        "recordings": recordings,
        "insights": {
            "jobMatch": prediction["matchScore"],
            "scholarshipMatch": max((item["match"] for item in scholarships), default=76),
            "workStudyMatch": max(55, min(94, prediction["matchScore"] - 12)),
            "signals": prediction["signals"],
            "briefing": briefing,
            "topPercentLabel": prediction["topPercentLabel"],
        },
    }


def build_ask_response(q: str) -> dict:
    if not q:
        return {"ok": True, "answer": "Please ask a question and I'll do my best to help.", "sources": []}

    items = load_items().copy()
    words = re.findall(r"[a-z]+", q.lower())
    stop = {"the","a","an","is","are","how","do","i","to","for","of","my","what","when","and","in","at","on"}
    keywords = [w for w in words if w not in stop and len(w) > 2]

    if items.empty or not keywords:
        return {"ok": True, "answer": "I couldn't find a specific match in the UNT guidance library, but your advisor can help with most questions. Check the Appointments tab to book a session.", "sources": []}

    items["blob"] = (
        items["page_title"].astype(str) + " " +
        items["item_title"].astype(str) + " " +
        items["item_text"].astype(str) + " " +
        items["tags"].astype(str)
    ).str.lower()

    def score_row(text: str) -> int:
        return sum(text.count(kw) for kw in keywords)

    items["_score"] = items["blob"].apply(score_row)
    top = items[items["_score"] > 0].sort_values("_score", ascending=False).drop_duplicates("doc_id").head(4)

    if top.empty:
        return {"ok": True, "answer": "I couldn't find a close match in the UNT guidance library for that question. Your advisor is the best resource — book a session in the Appointments tab.", "sources": []}

    sources = []
    snippets = []
    for _, row in top.iterrows():
        title = clean_page_title(row.get("page_title", "UNT Guidance"))
        text = str(row.get("item_text", ""))[:300]
        url = str(row.get("url", ""))
        sources.append({"title": title, "url": url})
        snippets.append(f"• {text}")

    answer = (
        f"Based on UNT's guidance library, here's what I found for \"{q}\":\n\n" +
        "\n\n".join(snippets[:2]) +
        "\n\nFor the most current details, see the linked sources below. You can also book an advising session in the Appointments tab."
    )
    return {"ok": True, "answer": answer, "sources": sources}


class PortalHandler(BaseHTTPRequestHandler):
    def _write_json(self, payload: dict, status: int = 200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._write_json({"ok": True})

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self._write_json({"ok": True, "service": "uniguide-portal-api"})
            return
        if parsed.path == "/api/portal":
            identifier = parse_qs(parsed.query).get("identifier", ["demo@unt.edu"])[0]
            self._write_json({"ok": True, "portal": build_portal_payload(identifier)})
            return
        if parsed.path == "/api/ask":
            q = parse_qs(parsed.query).get("q", [""])[0].strip()
            self._write_json(build_ask_response(q))
            return
        self._write_json({"ok": False, "error": "Not found"}, status=404)

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/api/login":
            self._write_json({"ok": False, "error": "Not found"}, status=404)
            return

        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            self._write_json({"ok": False, "error": "Invalid JSON"}, status=400)
            return

        identifier = normalize_identifier(payload.get("identifier", "demo@unt.edu"))
        overrides = payload.get("overrides") or {}
        portal = build_portal_payload(identifier, overrides=overrides)
        self._write_json({"ok": True, "portal": portal})


def main():
    args = parse_args()
    server = ThreadingHTTPServer((args.host, args.port), PortalHandler)
    print(f"Portal API listening on http://{args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
