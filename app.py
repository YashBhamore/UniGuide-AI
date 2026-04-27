from pathlib import Path
import json
import warnings

import joblib
import matplotlib.patches as mpatches
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap
import streamlit as st
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

warnings.filterwarnings("ignore")

ROOT_DIR = Path(__file__).resolve().parent
ASSETS_DIR = ROOT_DIR / "demo_assets"
MODEL_PATH = ASSETS_DIR / "uniguide_model.pkl"
SSCD_PATH = ASSETS_DIR / "sscd.csv"
METADATA_PATH = ASSETS_DIR / "model_metadata.json"

NAV_OPTIONS = [
    "Home",
    "AI Advisor",
    "Academics",
    "Career Match",
    "Scholarships",
    "Appointments",
    "Profile",
]

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

DEMO_PROFILE = {
    "name": "Yash Bhamore",
    "email": "yash.bhamore@unt.edu",
    "euid": "ybm0042",
    "age": 21,
    "student_level": "Undergraduate",
    "program_category": "Data Science",
    "semester_stage": "Fall",
    "semester": 3,
    "credits": 12,
    "program_total_credits": 120,
    "gpa": 3.7,
    "nationality": "American",
    "status": "Domestic",
    "advisor": "Dr. Sarah Mitchell",
    "advisor_email": "sarah.mitchell@unt.edu",
    "schol_alumni": 0,
    "schol_athlete": 0,
    "schol_in_state": 1,
    "schol_merit": 1,
    "aid_in_state_grant": 0,
    "int_entrepreneurship": 1,
    "int_healthcare_analytics": 1,
}

COURSES = [
    {
        "code": "INFO 4820",
        "name": "Machine Learning Applications",
        "prof": "Dr. Park",
        "progress": 72,
        "grade": "A-",
        "credits": 3,
        "color": "#1565C0",
        "recordings": 4,
        "assignments": 2,
    },
    {
        "code": "INFO 5082",
        "name": "Data Science Capstone",
        "prof": "Dr. Whitworth",
        "progress": 88,
        "grade": "A",
        "credits": 3,
        "color": "#2E7D32",
        "recordings": 6,
        "assignments": 1,
    },
    {
        "code": "MATH 3680",
        "name": "Applied Statistics",
        "prof": "Dr. Chen",
        "progress": 55,
        "grade": "B+",
        "credits": 3,
        "color": "#00695C",
        "recordings": 3,
        "assignments": 3,
    },
    {
        "code": "INFO 4550",
        "name": "Cloud Data Engineering",
        "prof": "Dr. Voss",
        "progress": 40,
        "grade": "B",
        "credits": 3,
        "color": "#E65100",
        "recordings": 2,
        "assignments": 4,
    },
]

JOBS = [
    {
        "title": "Research Assistant",
        "dept": "Data Science Dept.",
        "match": 94,
        "type": "On-Campus",
        "pay": "$14/hr",
        "hours": "10-15 hrs/wk",
        "skills": ["Python", "Data Analysis"],
        "why": [
            "Your Data Science program is a direct match.",
            "Your GPA clears the common 3.5 threshold for research hiring.",
            "Your semester timing aligns with typical faculty hiring windows.",
        ],
    },
    {
        "title": "IT Help Desk Specialist",
        "dept": "UNT IT Services",
        "match": 88,
        "type": "On-Campus",
        "pay": "$13/hr",
        "hours": "12-20 hrs/wk",
        "skills": ["Technical Support", "Communication"],
        "why": [
            "Your technical background is a strong fit.",
            "Domestic status simplifies employment paperwork.",
            "Full-time enrollment helps for scheduling and eligibility.",
        ],
    },
    {
        "title": "Student Ambassador",
        "dept": "Office of Admissions",
        "match": 82,
        "type": "On-Campus",
        "pay": "$12/hr",
        "hours": "8-12 hrs/wk",
        "skills": ["Public Speaking", "Campus Knowledge"],
        "why": [
            "Semester 3 means you already know campus systems well.",
            "Your profile fits student-facing roles with moderate flexibility.",
            "Your interests suggest strong communication and initiative.",
        ],
    },
    {
        "title": "Library Research Aide",
        "dept": "Willis Library",
        "match": 76,
        "type": "On-Campus",
        "pay": "$12.50/hr",
        "hours": "10-15 hrs/wk",
        "skills": ["Research", "Attention to Detail"],
        "why": [
            "Flexible hours fit a 12-credit schedule.",
            "Your research-oriented major supports the role well.",
            "This role strengthens academic and graduate-school readiness.",
        ],
    },
]

SCHOLARSHIPS = [
    {
        "name": "Data Science Excellence Award",
        "amount": "$3,000",
        "deadline": "May 15, 2026",
        "match": 92,
        "eligible": True,
        "req": "GPA 3.5+, Data Science major, domestic status preferred",
    },
    {
        "name": "UNT Merit Scholarship Renewal",
        "amount": "$2,500",
        "deadline": "Apr 30, 2026",
        "match": 95,
        "eligible": True,
        "req": "GPA 3.5+, renewable annually",
    },
    {
        "name": "STEM Futures Fund",
        "amount": "$1,500",
        "deadline": "Jun 1, 2026",
        "match": 80,
        "eligible": True,
        "req": "STEM program, sophomore or later",
    },
    {
        "name": "Texas Public Education Grant",
        "amount": "$4,200",
        "deadline": "Jul 1, 2026",
        "match": 70,
        "eligible": False,
        "req": "Need-based, FAFSA required",
    },
]

ASSIGNMENTS = [
    {
        "course": "INFO 5082",
        "title": "Capstone Final Pitch Presentation",
        "due": "Apr 27, 2026",
        "status": "In Progress",
        "priority": "High",
    },
    {
        "course": "INFO 4820",
        "title": "Neural Network Lab Report",
        "due": "May 2, 2026",
        "status": "Not Started",
        "priority": "High",
    },
    {
        "course": "MATH 3680",
        "title": "Regression Analysis Problem Set 4",
        "due": "May 5, 2026",
        "status": "Not Started",
        "priority": "Medium",
    },
    {
        "course": "INFO 4550",
        "title": "AWS Pipeline Architecture Design",
        "due": "May 8, 2026",
        "status": "Not Started",
        "priority": "Medium",
    },
    {
        "course": "INFO 4820",
        "title": "Midterm Reflection Essay",
        "due": "Apr 30, 2026",
        "status": "Submitted",
        "priority": "Low",
    },
]

RECORDINGS = [
    {
        "course": "INFO 5082",
        "title": "Phase 4: XAI Integration Walkthrough",
        "date": "Apr 22, 2026",
        "duration": "52 min",
    },
    {
        "course": "INFO 4820",
        "title": "Lecture 18: Transformer Architectures",
        "date": "Apr 21, 2026",
        "duration": "68 min",
    },
    {
        "course": "MATH 3680",
        "title": "Ch 9: Multiple Linear Regression",
        "date": "Apr 20, 2026",
        "duration": "45 min",
    },
    {
        "course": "INFO 4550",
        "title": "AWS Lambda and Event-Driven Design",
        "date": "Apr 19, 2026",
        "duration": "55 min",
    },
]

APPOINTMENT_SLOTS = [
    {"date": "Tue, Apr 29", "time": "10:00 AM", "available": True},
    {"date": "Tue, Apr 29", "time": "2:30 PM", "available": True},
    {"date": "Wed, Apr 30", "time": "11:00 AM", "available": False},
    {"date": "Thu, May 1", "time": "9:00 AM", "available": True},
    {"date": "Thu, May 1", "time": "3:00 PM", "available": True},
    {"date": "Fri, May 2", "time": "1:00 PM", "available": True},
]

PLAIN_EXPLANATIONS = {
    "age": "Your age sits in the range that most campus employers commonly hire from.",
    "student_level": "Your student level affects the kinds of roles and campus support pathways you qualify for.",
    "program_total_credits": "Program progress helps estimate whether you can balance work with academic load.",
    "credits": "Current credits help the model judge time capacity and full-time status.",
    "semester": "Semester timing matters because many campus roles prefer students who already know the system.",
    "program_category": "Your academic program is one of the strongest signals in matching student roles.",
    "schol_athlete": "Athletic scholarship status shifts how the model interprets schedule flexibility and funding.",
    "nationality": "Nationality acts as a proxy for patterns present in the training data.",
    "int_healthcare_analytics": "This interest aligns with more technical and research-oriented campus positions.",
    "semester_stage": "Fall and Spring cohorts show different employment and advising patterns.",
    "int_entrepreneurship": "Entrepreneurship interest signals initiative and cross-campus involvement.",
    "schol_in_state": "In-state support changes how the model reads financial pressure and aid profile.",
    "schol_alumni": "Alumni-backed scholarship status slightly shifts the model's estimate of support available.",
    "aid_in_state_grant": "Grant support affects how strongly the model expects on-campus work need.",
    "schol_merit": "Merit support can lower work urgency while still signaling strong academic fit.",
}


st.set_page_config(
    page_title="UniGuide AI - Student Intelligence Portal",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown(
    """
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

:root {
    --navy: #0A1628;
    --navy-mid: #112240;
    --navy-light: #1B3A6B;
    --blue: #1565C0;
    --blue-mid: #1976D2;
    --blue-pale: #E3F2FD;
    --teal: #00695C;
    --teal-pale: #E0F2F1;
    --green: #2E7D32;
    --green-pale: #E8F5E9;
    --amber: #E65100;
    --amber-pale: #FFF3E0;
    --gold: #F9A825;
    --red: #B71C1C;
    --red-pale: #FFEBEE;
    --bg: #F0F4F8;
    --card: #FFFFFF;
    --text: #0D1B2A;
    --muted: #64748B;
    --subtle: #94A3B8;
    --border: #E2E8F0;
}

html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', sans-serif;
}

body {
    background: radial-gradient(circle at top right, rgba(21,101,192,0.10), transparent 28%),
                linear-gradient(180deg, #F5F8FC 0%, #EEF3F8 100%);
}

#MainMenu, footer, header { visibility: hidden; }
[data-testid="stAppViewContainer"] {
    background: transparent;
}
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, var(--navy) 0%, #0E1D33 100%);
    border-right: 1px solid rgba(255,255,255,0.06);
}
[data-testid="stSidebar"] * {
    color: white;
}
[data-testid="stSidebar"] .stRadio label {
    color: rgba(255,255,255,0.72) !important;
    font-weight: 600;
}
[data-testid="stSidebar"] .stButton button {
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    color: white;
    font-weight: 700;
}

.block-container {
    padding: 1.4rem 1.8rem 2rem;
}

.hero-banner {
    background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 48%, var(--navy-light) 100%);
    border-radius: 22px;
    padding: 28px 30px;
    margin-bottom: 22px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 18px 60px rgba(10,22,40,0.18);
}
.hero-banner::after {
    content: "";
    position: absolute;
    right: -60px;
    top: -70px;
    width: 240px;
    height: 240px;
    border-radius: 50%;
    background: rgba(21,101,192,0.16);
}
.hero-banner::before {
    content: "";
    position: absolute;
    left: -50px;
    bottom: -90px;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: rgba(249,168,37,0.10);
}
.hero-kicker {
    color: rgba(255,255,255,0.75);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 10px;
}
.hero-title {
    color: white;
    font-size: 31px;
    font-weight: 800;
    letter-spacing: -0.04em;
    margin: 0 0 8px;
}
.hero-sub {
    color: rgba(255,255,255,0.68);
    font-size: 14px;
    line-height: 1.7;
    max-width: 820px;
}
.hero-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
}
.hero-stat {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 14px 16px;
    backdrop-filter: blur(8px);
}
.hero-stat-value {
    color: white;
    font-size: 22px;
    font-weight: 800;
}
.hero-stat-label {
    color: rgba(255,255,255,0.55);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 2px;
}

.section-title {
    font-size: 13px;
    font-weight: 800;
    color: var(--blue);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 8px 0 12px;
}

.info-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 20px 22px;
    box-shadow: 0 12px 36px rgba(13,27,42,0.05);
}
.info-card h3 {
    margin: 0 0 4px;
    color: var(--text);
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.02em;
}
.muted-copy {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.65;
}

.mini-stat {
    background: white;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px 18px;
    box-shadow: 0 8px 20px rgba(15,23,42,0.04);
}
.mini-stat-label {
    font-size: 11px;
    font-weight: 800;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
}
.mini-stat-value {
    font-size: 30px;
    font-weight: 800;
    margin-top: 6px;
    letter-spacing: -0.04em;
}
.mini-stat-sub {
    font-size: 11px;
    color: var(--subtle);
    margin-top: 4px;
}

.status-card-yes, .status-card-no {
    border-radius: 20px;
    padding: 22px 24px;
    border: 1.5px solid;
    margin-bottom: 16px;
}
.status-card-yes {
    background: linear-gradient(135deg, var(--green-pale), #F2FAF1);
    border-color: var(--green);
}
.status-card-no {
    background: linear-gradient(135deg, var(--amber-pale), #FFF7EE);
    border-color: var(--amber);
}
.status-title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.04em;
    margin: 0 0 8px;
}
.status-sub {
    font-size: 13px;
    color: var(--muted);
}
.progress-track {
    width: 100%;
    height: 8px;
    border-radius: 999px;
    background: rgba(100,116,139,0.18);
    overflow: hidden;
    margin: 14px 0 8px;
}
.progress-fill {
    height: 100%;
    border-radius: 999px;
}

.advice-box {
    border-radius: 16px;
    padding: 16px 18px;
    border-left: 4px solid;
    margin-bottom: 14px;
    font-size: 13px;
    line-height: 1.65;
}
.advice-box strong {
    display: block;
    margin-bottom: 4px;
}

.job-card, .scholar-card, .plain-list-item {
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px 18px;
    background: white;
    box-shadow: 0 8px 24px rgba(15,23,42,0.035);
    margin-bottom: 12px;
}
.job-card-title {
    color: var(--text);
    font-weight: 800;
    font-size: 15px;
    margin-bottom: 2px;
}
.job-card-meta, .list-sub {
    color: var(--muted);
    font-size: 12px;
}
.pill {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    margin: 4px 6px 0 0;
}
.pill-blue {
    background: var(--blue-pale);
    color: var(--blue);
}
.pill-teal {
    background: var(--teal-pale);
    color: var(--teal);
}
.pill-green {
    background: var(--green-pale);
    color: var(--green);
}
.pill-amber {
    background: var(--amber-pale);
    color: var(--amber);
}
.score-text {
    font-size: 14px;
    font-weight: 800;
}
.login-shell {
    min-height: calc(100vh - 2rem);
    display: flex;
    align-items: stretch;
}
.login-left {
    background: linear-gradient(145deg, var(--navy) 0%, var(--navy-mid) 52%, var(--navy-light) 100%);
    border-radius: 26px;
    padding: 42px 44px;
    position: relative;
    overflow: hidden;
    min-height: 680px;
}
.login-left::before {
    content: "";
    position: absolute;
    top: -90px;
    right: -70px;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: rgba(21,101,192,0.12);
}
.login-left::after {
    content: "";
    position: absolute;
    bottom: -70px;
    left: -70px;
    width: 230px;
    height: 230px;
    border-radius: 50%;
    background: rgba(249,168,37,0.08);
}
.login-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 48px;
}
.login-logo-mark {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    background: var(--blue);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
}
.login-brand {
    color: white;
    font-size: 20px;
    font-weight: 800;
}
.login-copy {
    color: rgba(255,255,255,0.65);
    font-size: 15px;
    line-height: 1.75;
}
.login-title {
    color: white;
    font-size: 42px;
    line-height: 1.08;
    font-weight: 800;
    letter-spacing: -0.05em;
    margin: 0 0 16px;
}
.feature-row {
    display: flex;
    gap: 14px;
    margin-top: 18px;
}
.feature-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.feature-title {
    color: white;
    font-weight: 700;
    font-size: 14px;
}
.feature-copy {
    color: rgba(255,255,255,0.5);
    font-size: 12px;
    line-height: 1.55;
}
.sidebar-meter {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 14px 14px 12px;
}
.slot-card {
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 12px 14px;
    background: white;
}
@media (max-width: 1100px) {
    .hero-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
""",
    unsafe_allow_html=True,
)


@st.cache_resource
def load_everything():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Missing model file: {MODEL_PATH}")
    if not SSCD_PATH.exists():
        raise FileNotFoundError(f"Missing SSCD file: {SSCD_PATH}")

    metadata = {}
    if METADATA_PATH.exists():
        with open(METADATA_PATH, "r", encoding="utf-8") as file_obj:
            metadata = json.load(file_obj)

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
    mean_shap = np.abs(sv).mean(axis=0)

    return model, explainer, le_fitted, selected_features, mean_shap


model, explainer, le_fitted, selected_features, mean_shap = load_everything()

sl_classes = le_fitted["student_level"].classes_.tolist()
pc_classes = le_fitted["program_category"].classes_.tolist()
ss_classes = le_fitted["semester_stage"].classes_.tolist()
nat_classes = le_fitted["nationality"].classes_.tolist()


def init_state():
    if "logged_in" not in st.session_state:
        st.session_state.logged_in = False
    if "profile" not in st.session_state:
        st.session_state.profile = DEMO_PROFILE.copy()
    if "page" not in st.session_state:
        st.session_state.page = "Home"
    if "booking" not in st.session_state:
        st.session_state.booking = None
    if "academic_ai_answer" not in st.session_state:
        st.session_state.academic_ai_answer = ""


def initials(name: str) -> str:
    return "".join(part[0] for part in name.split()[:2]).upper()


def pill(text: str, kind: str = "blue") -> str:
    return f"<span class='pill pill-{kind}'>{text}</span>"


def match_color(score: int) -> str:
    if score >= 90:
        return "#2E7D32"
    if score >= 75:
        return "#00695C"
    if score >= 60:
        return "#E65100"
    return "#B71C1C"


def status_color(status: str) -> str:
    if status == "Submitted":
        return "#2E7D32"
    if status == "In Progress":
        return "#1565C0"
    return "#E65100"


def build_input_row(profile: dict) -> pd.DataFrame:
    row = {
        "student_level": le_fitted["student_level"].transform([profile["student_level"]])[0],
        "program_category": le_fitted["program_category"].transform([profile["program_category"]])[0],
        "semester_stage": le_fitted["semester_stage"].transform([profile["semester_stage"]])[0],
        "semester": int(profile["semester"]),
        "program_total_credits": int(profile["program_total_credits"]),
        "credits": int(profile["credits"]),
        "age": int(profile["age"]),
        "nationality": le_fitted["nationality"].transform([profile["nationality"]])[0],
        "schol_alumni": int(profile.get("schol_alumni", 0)),
        "schol_athlete": int(profile.get("schol_athlete", 0)),
        "schol_in_state": int(profile.get("schol_in_state", 0)),
        "schol_merit": int(profile.get("schol_merit", 0)),
        "aid_in_state_grant": int(profile.get("aid_in_state_grant", 0)),
        "int_entrepreneurship": int(profile.get("int_entrepreneurship", 0)),
        "int_healthcare_analytics": int(profile.get("int_healthcare_analytics", 0)),
    }
    input_df = pd.DataFrame([row])
    for feature in selected_features:
        if feature not in input_df.columns:
            input_df[feature] = 0
    return input_df[selected_features]


def predict_profile(profile: dict) -> dict:
    input_df = build_input_row(profile)
    pred = int(model.predict(input_df)[0])
    prob_yes = float(model.predict_proba(input_df)[0][1])
    shap_val = explainer.shap_values(input_df)
    if isinstance(shap_val, list):
        sv_row = shap_val[1][0]
    else:
        sv_row = shap_val[0, :, 1]

    shap_df = pd.DataFrame(
        {
            "feature": selected_features,
            "display": [FEATURE_DISPLAY.get(f, f) for f in selected_features],
            "shap": sv_row,
        }
    ).sort_values("shap", key=abs, ascending=False)

    summary = []
    for _, row in shap_df.head(5).iterrows():
        direction = "toward" if row["shap"] >= 0 else "away from"
        score_label = "on-campus work"
        plain = PLAIN_EXPLANATIONS.get(row["feature"], "This factor influenced the model output.")
        summary.append(
            {
                "title": row["display"],
                "impact": row["shap"],
                "caption": f"{plain} It is pushing the prediction {direction} {score_label}.",
            }
        )

    confidence = prob_yes if pred == 1 else 1 - prob_yes
    return {
        "pred": pred,
        "prob_yes": prob_yes,
        "confidence": confidence,
        "match_score": int(round(prob_yes * 100)),
        "shap_df": shap_df,
        "summary": summary,
    }


def render_login():
    left, right = st.columns([1.12, 0.88], gap="large")
    with left:
        st.markdown(
            """
<div class="login-left">
  <div class="login-logo">
    <div class="login-logo-mark">🎓</div>
    <div>
      <div class="login-brand">UniGuide AI</div>
      <div style="color:rgba(255,255,255,0.45);font-size:11px;">University of North Texas</div>
    </div>
  </div>
  <h1 class="login-title">Your personal<br/>campus intelligence.</h1>
  <div class="login-copy">
    One portal for advising, academics, scholarships, career matching, and AI-powered guidance built around UNT student needs.
  </div>
  <div class="feature-row">
    <div class="feature-icon">🤖</div>
    <div>
      <div class="feature-title">AI Advisor</div>
      <div class="feature-copy">Explainable predictions, personalized advisory reasoning, and action-oriented next steps.</div>
    </div>
  </div>
  <div class="feature-row">
    <div class="feature-icon">📚</div>
    <div>
      <div class="feature-title">Smart Academics</div>
      <div class="feature-copy">Courses, recordings, assignments, and lightweight academic support in one place.</div>
    </div>
  </div>
  <div class="feature-row">
    <div class="feature-icon">💼</div>
    <div>
      <div class="feature-title">Career Match</div>
      <div class="feature-copy">Surface job and scholarship opportunities that align with your program and current stage.</div>
    </div>
  </div>
  <div style="position:absolute;left:44px;bottom:32px;color:rgba(255,255,255,0.28);font-size:11px;">
    INFO 5082 · Data Science Capstone · 2026
  </div>
</div>
""",
            unsafe_allow_html=True,
        )

    with right:
        st.markdown(
            """
<div class="info-card" style="margin-top:38px;">
  <h3>Welcome back</h3>
  <div class="muted-copy" style="margin-bottom:18px;">
    Use the demo profile to enter the upgraded portal experience and explore the integrated advisory screens.
  </div>
</div>
""",
            unsafe_allow_html=True,
        )
        with st.form("login_form", border=False):
            st.text_input("EUID or Email", placeholder="ybm0042@my.unt.edu")
            st.text_input("Password", placeholder="••••••••", type="password")
            login = st.form_submit_button("Enter UniGuide AI", use_container_width=True)
        st.caption("Or skip the form and load the capstone demo profile directly.")
        if st.button("⚡ Quick Demo - Yash Bhamore", use_container_width=True):
            st.session_state.logged_in = True
            st.session_state.profile = DEMO_PROFILE.copy()
            st.session_state.page = "Home"
            st.rerun()
        if login:
            st.session_state.logged_in = True
            st.session_state.profile = DEMO_PROFILE.copy()
            st.session_state.page = "Home"
            st.rerun()


def render_sidebar(profile: dict, prediction: dict):
    with st.sidebar:
        st.markdown(
            f"""
<div style="padding:4px 0 18px;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:14px;">
  <div style="display:flex;align-items:center;gap:10px;">
    <div style="width:38px;height:38px;border-radius:12px;background:#1565C0;display:flex;align-items:center;justify-content:center;font-size:18px;">🎓</div>
    <div>
      <div style="font-weight:800;font-size:16px;color:white;">UniGuide AI</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.45);">UNT Student Intelligence Portal</div>
    </div>
  </div>
</div>
<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
  <div style="width:40px;height:40px;border-radius:999px;background:#1565C0;display:flex;align-items:center;justify-content:center;font-weight:800;">{initials(profile['name'])}</div>
  <div>
    <div style="font-size:13px;font-weight:700;color:white;">{profile['name']}</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.45);">{profile['euid']} · {profile['student_level']}</div>
  </div>
</div>
""",
            unsafe_allow_html=True,
        )

        page = st.radio(
            "Navigation",
            NAV_OPTIONS,
            index=NAV_OPTIONS.index(st.session_state.page),
            label_visibility="collapsed",
        )
        st.session_state.page = page

        st.markdown("<div style='height:10px;'></div>", unsafe_allow_html=True)
        st.markdown(
            f"""
<div class="sidebar-meter">
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:11px;color:rgba(255,255,255,0.55);">AI Match Score</span>
    <span style="font-size:12px;font-weight:800;color:#F9A825;">{prediction['match_score']}%</span>
  </div>
  <div style="margin-top:10px;height:6px;border-radius:999px;background:rgba(255,255,255,0.10);overflow:hidden;">
    <div style="width:{prediction['match_score']}%;height:100%;border-radius:999px;background:linear-gradient(90deg,#F9A825,#1565C0);"></div>
  </div>
  <div style="font-size:10px;color:rgba(255,255,255,0.35);margin-top:8px;">
    GPA {profile['gpa']} · Sem {profile['semester']} · {profile['credits']} credits
  </div>
</div>
""",
            unsafe_allow_html=True,
        )
        st.markdown("<div style='height:10px;'></div>", unsafe_allow_html=True)
        if st.button("Reload Demo Student", use_container_width=True):
            st.session_state.profile = DEMO_PROFILE.copy()
            st.rerun()
        if st.button("Log Out", use_container_width=True):
            st.session_state.logged_in = False
            st.session_state.page = "Home"
            st.rerun()


def render_header(title: str, subtitle: str, prediction: dict):
    score_label = "HIGH PRIORITY" if prediction["pred"] == 1 else "LOWER PRIORITY"
    st.markdown(
        f"""
<div class="hero-banner">
  <div class="hero-kicker">UniGuide AI Advisory Workspace</div>
  <div class="hero-title">{title}</div>
  <div class="hero-sub">{subtitle}</div>
  <div class="hero-grid">
    <div class="hero-stat">
      <div class="hero-stat-value">{prediction['match_score']}%</div>
      <div class="hero-stat-label">On-Campus Match</div>
    </div>
    <div class="hero-stat">
      <div class="hero-stat-value">{prediction['confidence'] * 100:.1f}%</div>
      <div class="hero-stat-label">Model Confidence</div>
    </div>
    <div class="hero-stat">
      <div class="hero-stat-value">1,059</div>
      <div class="hero-stat-label">Knowledge Chunks</div>
    </div>
    <div class="hero-stat">
      <div class="hero-stat-value">{score_label}</div>
      <div class="hero-stat-label">Advisory Signal</div>
    </div>
  </div>
</div>
""",
        unsafe_allow_html=True,
    )


def render_home(profile: dict, prediction: dict):
    render_header(
        f"Good day, {profile['name'].split()[0]}",
        f"{profile['program_category']} · Semester {profile['semester']} · A polished student portal inspired by your new JSX layout, now backed by the existing Streamlit model.",
        prediction,
    )

    urgent = [a for a in ASSIGNMENTS if a["status"] != "Submitted" and a["priority"] == "High"]
    stat_cols = st.columns(4)
    stats = [
        ("GPA", profile["gpa"], "Dean's List eligible", "#2E7D32"),
        ("Credits", profile["credits"], "This semester", "#1565C0"),
        ("Semester", f"#{profile['semester']}", "Current progress", "#00695C"),
        ("Assignments Due", len(urgent), "High priority this week", "#E65100" if urgent else "#2E7D32"),
    ]
    for col, (label, value, sub, color) in zip(stat_cols, stats):
        with col:
            st.markdown(
                f"""
<div class="mini-stat">
  <div class="mini-stat-label">{label}</div>
  <div class="mini-stat-value" style="color:{color};">{value}</div>
  <div class="mini-stat-sub">{sub}</div>
</div>
""",
                unsafe_allow_html=True,
            )

    left, right = st.columns([1.06, 0.94], gap="large")
    with left:
        st.markdown("<div class='section-title'>Top Opportunities</div>", unsafe_allow_html=True)
        for job in JOBS[:3]:
            st.markdown(
                f"""
<div class="job-card">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
    <div>
      <div class="job-card-title">💼 {job['title']}</div>
      <div class="job-card-meta">{job['dept']} · {job['pay']} · {job['hours']}</div>
      <div style="margin-top:8px;">{''.join(pill(skill, 'blue') for skill in job['skills'])}</div>
    </div>
    <div class="score-text" style="color:{match_color(job['match'])};">{job['match']}%</div>
  </div>
</div>
""",
                unsafe_allow_html=True,
            )

    with right:
        st.markdown("<div class='section-title'>Upcoming Deadlines</div>", unsafe_allow_html=True)
        for item in ASSIGNMENTS[:4]:
            st.markdown(
                f"""
<div class="plain-list-item">
  <div style="display:flex;justify-content:space-between;gap:12px;">
    <div>
      <div class="job-card-title">{item['title']}</div>
      <div class="list-sub">{item['course']} · Due {item['due']}</div>
    </div>
    <div class="score-text" style="color:{status_color(item['status'])};font-size:12px;">{item['status']}</div>
  </div>
</div>
""",
                unsafe_allow_html=True,
            )


def render_shap_chart(shap_df: pd.DataFrame, prob_yes: float):
    fig, ax = plt.subplots(figsize=(7.2, 4.8))
    chart_df = shap_df.sort_values("shap", key=abs, ascending=True)
    colors = ["#B71C1C" if value < 0 else "#1565C0" for value in chart_df["shap"]]
    bars = ax.barh(chart_df["display"], chart_df["shap"], color=colors, edgecolor="none", height=0.65)
    ax.axvline(0, color="#94A3B8", linewidth=0.8)
    ax.set_xlabel('SHAP contribution toward "On-Campus Work = Yes"', fontsize=10)
    ax.set_title(f"Local explanation - Confidence {prob_yes * 100:.1f}%", fontsize=11, fontweight="bold", pad=10)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_visible(False)
    ax.tick_params(axis="y", labelsize=9)
    ax.tick_params(axis="x", labelsize=9)
    for bar, val in zip(bars, chart_df["shap"]):
        if abs(val) > 0.002:
            ax.text(
                val + (0.001 if val >= 0 else -0.001),
                bar.get_y() + bar.get_height() / 2,
                f"{val:+.3f}",
                va="center",
                ha="left" if val >= 0 else "right",
                fontsize=8,
                color="#334155",
            )
    pos_patch = mpatches.Patch(color="#1565C0", label="Pushes toward Yes")
    neg_patch = mpatches.Patch(color="#B71C1C", label="Pushes toward No")
    ax.legend(handles=[pos_patch, neg_patch], loc="lower right", fontsize=8, framealpha=0.9)
    fig.tight_layout()
    st.pyplot(fig, use_container_width=True)
    plt.close(fig)


def render_ai_advisor(profile: dict, prediction: dict):
    render_header(
        "AI Advisor",
        "Edit the student profile, rerun the model, and view both the high-level advisory recommendation and the SHAP-level reasoning.",
        prediction,
    )

    left, right = st.columns([0.94, 1.06], gap="large")
    with left:
        st.markdown("<div class='section-title'>Student Profile</div>", unsafe_allow_html=True)
        with st.form("advisor_form", border=False):
            c1, c2 = st.columns(2)
            with c1:
                age = st.slider("Age", 17, 45, value=int(profile["age"]))
            with c2:
                nationality = st.selectbox(
                    "Nationality",
                    nat_classes,
                    index=nat_classes.index(profile["nationality"]),
                )

            c3, c4 = st.columns(2)
            with c3:
                student_level = st.selectbox(
                    "Student Level",
                    sl_classes,
                    index=sl_classes.index(profile["student_level"]),
                )
            with c4:
                status = st.selectbox(
                    "Status",
                    ["Domestic", "International"],
                    index=0 if profile["status"] == "Domestic" else 1,
                )

            c5, c6 = st.columns(2)
            with c5:
                program_category = st.selectbox(
                    "Program",
                    pc_classes,
                    index=pc_classes.index(profile["program_category"]),
                )
            with c6:
                semester_stage = st.selectbox(
                    "Semester Stage",
                    ss_classes,
                    index=ss_classes.index(profile["semester_stage"]),
                )

            c7, c8, c9 = st.columns(3)
            with c7:
                semester = st.number_input("Semester #", 1, 12, value=int(profile["semester"]))
            with c8:
                credits = st.number_input("Credits This Semester", 3, 21, value=int(profile["credits"]))
            with c9:
                program_total_credits = st.number_input(
                    "Program Credits",
                    30,
                    150,
                    value=int(profile["program_total_credits"]),
                )

            st.markdown("<div class='section-title'>Support and Interests</div>", unsafe_allow_html=True)
            scholarship_cols = st.columns(4)
            with scholarship_cols[0]:
                schol_alumni = st.checkbox("Alumni", value=bool(profile["schol_alumni"]))
            with scholarship_cols[1]:
                schol_athlete = st.checkbox("Athlete", value=bool(profile["schol_athlete"]))
            with scholarship_cols[2]:
                schol_in_state = st.checkbox("In-State", value=bool(profile["schol_in_state"]))
            with scholarship_cols[3]:
                schol_merit = st.checkbox("Merit", value=bool(profile["schol_merit"]))
            aid_in_state_grant = st.checkbox(
                "In-State Grant",
                value=bool(profile["aid_in_state_grant"]),
            )
            interest_cols = st.columns(2)
            with interest_cols[0]:
                int_entrepreneurship = st.checkbox(
                    "Entrepreneurship",
                    value=bool(profile["int_entrepreneurship"]),
                )
            with interest_cols[1]:
                int_healthcare_analytics = st.checkbox(
                    "Healthcare Analytics",
                    value=bool(profile["int_healthcare_analytics"]),
                )
            analyzed = st.form_submit_button("Analyze Student Profile", use_container_width=True)

        if analyzed:
            st.session_state.profile.update(
                {
                    "age": age,
                    "nationality": nationality,
                    "student_level": student_level,
                    "status": status,
                    "program_category": program_category,
                    "semester_stage": semester_stage,
                    "semester": semester,
                    "credits": credits,
                    "program_total_credits": program_total_credits,
                    "schol_alumni": int(schol_alumni),
                    "schol_athlete": int(schol_athlete),
                    "schol_in_state": int(schol_in_state),
                    "schol_merit": int(schol_merit),
                    "aid_in_state_grant": int(aid_in_state_grant),
                    "int_entrepreneurship": int(int_entrepreneurship),
                    "int_healthcare_analytics": int(int_healthcare_analytics),
                }
            )
            st.rerun()

    with right:
        if prediction["pred"] == 1:
            st.markdown(
                f"""
<div class="status-card-yes">
  <div class="status-title" style="color:#2E7D32;">High Priority - On-Campus Work Likely</div>
  <div class="status-sub">This profile aligns strongly with patterns associated with on-campus employment readiness.</div>
  <div class="progress-track"><div class="progress-fill" style="width:{prediction['prob_yes'] * 100:.0f}%;background:#2E7D32;"></div></div>
  <div class="status-sub">Confidence: {prediction['prob_yes'] * 100:.1f}%</div>
</div>
<div class="advice-box" style="background:#E8F5E9;border-left-color:#2E7D32;color:#1B5E20;">
  <strong>Advisor Recommendation</strong>
  Refer this student to MyUNT and campus employment listings, confirm work-study or aid interactions, and consider research-adjacent roles first.
</div>
""",
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                f"""
<div class="status-card-no">
  <div class="status-title" style="color:#E65100;">Lower Priority - On-Campus Work Less Likely</div>
  <div class="status-sub">This profile does not currently show a strong work-match signal compared with the training data.</div>
  <div class="progress-track"><div class="progress-fill" style="width:{(1 - prediction['prob_yes']) * 100:.0f}%;background:#E65100;"></div></div>
  <div class="status-sub">Confidence: {(1 - prediction['prob_yes']) * 100:.1f}%</div>
</div>
<div class="advice-box" style="background:#FFF3E0;border-left-color:#E65100;color:#BF360C;">
  <strong>Advisor Recommendation</strong>
  Consider academic counseling, scholarship guidance, and lower-friction campus support options before prioritizing employment pathways.
</div>
""",
                unsafe_allow_html=True,
            )

        st.markdown("<div class='section-title'>Plain-English Model Signals</div>", unsafe_allow_html=True)
        for item in prediction["summary"]:
            impact_kind = "green" if item["impact"] >= 0 else "amber"
            direction = "Supports" if item["impact"] >= 0 else "Reduces"
            st.markdown(
                f"""
<div class="plain-list-item">
  <div style="display:flex;justify-content:space-between;gap:14px;align-items:flex-start;">
    <div>
      <div class="job-card-title">{item['title']}</div>
      <div class="muted-copy">{item['caption']}</div>
    </div>
    {pill(direction, impact_kind)}
  </div>
</div>
""",
                unsafe_allow_html=True,
            )

        st.markdown("<div class='section-title'>SHAP Explanation</div>", unsafe_allow_html=True)
        render_shap_chart(prediction["shap_df"], prediction["prob_yes"])


def render_academics(profile: dict, prediction: dict):
    render_header(
        "Academics",
        "A cleaner academic workspace inspired by the JSX portal: course snapshots, assignments, recordings, and a lightweight AI study assistant.",
        prediction,
    )

    courses_tab, assignments_tab, recordings_tab, help_tab = st.tabs(
        ["Courses", "Assignments", "Recordings", "AI Help"]
    )

    with courses_tab:
        cols = st.columns(2)
        for idx, course in enumerate(COURSES):
            with cols[idx % 2]:
                st.markdown(
                    f"""
<div class="info-card" style="margin-bottom:14px;">
  <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
    <div>
      <h3>{course['name']}</h3>
      <div class="muted-copy">{course['code']} · {course['prof']}</div>
    </div>
    <div class="score-text" style="color:{course['color']};font-size:20px;">{course['grade']}</div>
  </div>
  <div style="margin-top:14px;">
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748B;margin-bottom:6px;">
      <span>Course progress</span><span>{course['progress']}%</span>
    </div>
    <div class="progress-track" style="margin:0;"><div class="progress-fill" style="width:{course['progress']}%;background:{course['color']};"></div></div>
  </div>
  <div style="margin-top:12px;">
    {pill(f"{course['recordings']} recordings", 'blue')}
    {pill(f"{course['assignments']} assignments", 'teal')}
  </div>
</div>
""",
                    unsafe_allow_html=True,
                )

    with assignments_tab:
        for item in ASSIGNMENTS:
            st.markdown(
                f"""
<div class="plain-list-item">
  <div style="display:flex;justify-content:space-between;gap:14px;align-items:flex-start;">
    <div>
      <div class="job-card-title">{item['title']}</div>
      <div class="list-sub">{item['course']} · Due {item['due']} · Priority {item['priority']}</div>
    </div>
    <div class="score-text" style="color:{status_color(item['status'])};font-size:12px;">{item['status']}</div>
  </div>
</div>
""",
                unsafe_allow_html=True,
            )

    with recordings_tab:
        for rec in RECORDINGS:
            st.markdown(
                f"""
<div class="plain-list-item">
  <div style="display:flex;justify-content:space-between;gap:14px;align-items:flex-start;">
    <div>
      <div class="job-card-title">▶ {rec['title']}</div>
      <div class="list-sub">{rec['course']} · {rec['date']}</div>
    </div>
    <div class="score-text" style="color:#1565C0;font-size:12px;">{rec['duration']}</div>
  </div>
</div>
""",
                unsafe_allow_html=True,
            )

    with help_tab:
        st.markdown(
            """
<div class="info-card" style="margin-bottom:14px;">
  <h3>AI Assignment Help</h3>
  <div class="muted-copy">Ask a quick coursework question. The response stays lightweight and tailored to the current demo student profile.</div>
</div>
""",
            unsafe_allow_html=True,
        )
        question = st.text_input(
            "Question",
            placeholder="How should I structure my capstone conclusion section?",
        )
        if st.button("Ask UniGuide AI", key="ask_ai"):
            if question.strip():
                st.session_state.academic_ai_answer = (
                    f'For "{question}", start by grounding the response in your {profile["program_category"]} coursework. '
                    "Review the most recent lecture recording first, outline your argument in three parts, "
                    "and tie each recommendation back to evidence or evaluation metrics. "
                    f"If you still feel stuck, bring a draft to {profile['advisor']} for feedback."
                )
        if st.session_state.academic_ai_answer:
            st.markdown(
                f"""
<div class="advice-box" style="background:#E3F2FD;border-left-color:#1565C0;color:#0A3D77;">
  <strong>UniGuide AI Response</strong>
  {st.session_state.academic_ai_answer}
</div>
""",
                unsafe_allow_html=True,
            )


def render_career(profile: dict, prediction: dict):
    render_header(
        "Career Match",
        "A polished opportunity board for on-campus work, using the new portal style while keeping the advisory model front and center.",
        prediction,
    )
    for job in JOBS:
        st.markdown(
            f"""
<div class="job-card">
  <div style="display:flex;justify-content:space-between;gap:18px;align-items:flex-start;">
    <div style="flex:1;">
      <div class="job-card-title">{job['title']}</div>
      <div class="job-card-meta">{job['dept']} · {job['type']} · {job['pay']} · {job['hours']}</div>
      <div style="margin-top:10px;">
        {''.join(f"<div class='muted-copy'>• {reason}</div>" for reason in job['why'])}
      </div>
      <div style="margin-top:10px;">{''.join(pill(skill, 'blue') for skill in job['skills'])}</div>
    </div>
    <div style="text-align:right;min-width:84px;">
      <div class="mini-stat-value" style="font-size:28px;color:{match_color(job['match'])};">{job['match']}%</div>
      <div class="mini-stat-sub">AI Match</div>
    </div>
  </div>
</div>
""",
            unsafe_allow_html=True,
        )


def render_scholarships(profile: dict, prediction: dict):
    render_header(
        "Scholarships",
        "A clearer scholarship view with match strength, deadline visibility, and eligibility cues drawn from the new design direction.",
        prediction,
    )
    for scholarship in SCHOLARSHIPS:
        eligibility = pill("Eligible", "green") if scholarship["eligible"] else pill("Review Needed", "amber")
        st.markdown(
            f"""
<div class="scholar-card">
  <div style="display:flex;justify-content:space-between;gap:18px;align-items:flex-start;">
    <div style="flex:1;">
      <div class="job-card-title">{scholarship['name']}</div>
      <div class="muted-copy" style="margin:6px 0 8px;">{scholarship['req']}</div>
      <div>{eligibility}</div>
      <div class="list-sub" style="margin-top:8px;">Deadline: {scholarship['deadline']} · Match {scholarship['match']}%</div>
    </div>
    <div style="text-align:right;min-width:110px;">
      <div class="mini-stat-value" style="font-size:28px;color:#2E7D32;">{scholarship['amount']}</div>
      <div class="mini-stat-sub">Estimated Value</div>
    </div>
  </div>
</div>
""",
            unsafe_allow_html=True,
        )


def render_appointments(profile: dict, prediction: dict):
    render_header(
        "Appointments",
        "A cleaner advising handoff with bookable slots and a short prep brief for the advisor conversation.",
        prediction,
    )
    left, right = st.columns([0.94, 1.06], gap="large")
    with left:
        st.markdown(
            f"""
<div class="info-card">
  <h3>{profile['advisor']}</h3>
  <div class="muted-copy">Academic Advisor · Department of Information Science</div>
  <div class="muted-copy" style="margin-top:4px;color:#1565C0;">{profile['advisor_email']}</div>
</div>
""",
            unsafe_allow_html=True,
        )
        st.markdown("<div class='section-title'>Available Slots</div>", unsafe_allow_html=True)
        grid_cols = st.columns(2)
        for idx, slot in enumerate(APPOINTMENT_SLOTS):
            with grid_cols[idx % 2]:
                label = f"{slot['date']} · {slot['time']}"
                if st.button(
                    label,
                    key=f"slot_{idx}",
                    use_container_width=True,
                    disabled=not slot["available"],
                ):
                    st.session_state.booking = label
        if st.session_state.booking:
            st.success(f"Appointment booked: {st.session_state.booking} with {profile['advisor']}")

    with right:
        st.markdown("<div class='section-title'>Prepare for the Session</div>", unsafe_allow_html=True)
        brief_items = [
            f"AI advisory score is {prediction['match_score']}% for on-campus work.",
            "Three strong job matches are ready for discussion.",
            "Two scholarship deadlines are approaching soon.",
            "High-priority coursework may affect employment timing.",
        ]
        for item in brief_items:
            st.markdown(
                f"""
<div class="plain-list-item">
  <div class="muted-copy" style="font-size:13px;color:#0D1B2A;">{item}</div>
</div>
""",
                unsafe_allow_html=True,
            )


def render_profile(profile: dict, prediction: dict):
    render_header(
        "Profile",
        "A tighter student profile overview with the same visual language as the JSX portal and the current model score woven into it.",
        prediction,
    )
    left, right = st.columns([0.78, 1.22], gap="large")
    with left:
        st.markdown(
            f"""
<div class="info-card" style="text-align:center;">
  <div style="width:82px;height:82px;border-radius:999px;background:#1565C0;color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:28px;margin:0 auto 14px;">{initials(profile['name'])}</div>
  <h3>{profile['name']}</h3>
  <div class="muted-copy">{profile['email']}</div>
  <div class="muted-copy" style="color:#1565C0;margin-top:2px;">EUID: {profile['euid']}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;">
    <div class="mini-stat"><div class="mini-stat-label">GPA</div><div class="mini-stat-value" style="font-size:22px;color:#2E7D32;">{profile['gpa']}</div></div>
    <div class="mini-stat"><div class="mini-stat-label">AI Score</div><div class="mini-stat-value" style="font-size:22px;color:#F9A825;">{prediction['match_score']}%</div></div>
    <div class="mini-stat"><div class="mini-stat-label">Semester</div><div class="mini-stat-value" style="font-size:22px;color:#1565C0;">{profile['semester']}</div></div>
    <div class="mini-stat"><div class="mini-stat-label">Credits</div><div class="mini-stat-value" style="font-size:22px;color:#00695C;">{profile['credits']}</div></div>
  </div>
  <div style="margin-top:14px;">
    {pill(profile['program_category'], 'blue')}
    {pill(profile['status'], 'teal')}
    {pill(profile['student_level'], 'green')}
  </div>
</div>
""",
            unsafe_allow_html=True,
        )

    with right:
        fields = [
            ("Student Level", profile["student_level"]),
            ("Program", profile["program_category"]),
            ("Semester Stage", profile["semester_stage"]),
            ("Student Status", profile["status"]),
            ("Nationality", profile["nationality"]),
            ("Academic Advisor", profile["advisor"]),
            ("Advisor Email", profile["advisor_email"]),
        ]
        st.markdown("<div class='section-title'>Academic Information</div>", unsafe_allow_html=True)
        for key, value in fields:
            st.markdown(
                f"""
<div class="plain-list-item">
  <div style="display:flex;justify-content:space-between;gap:18px;">
    <div class="list-sub" style="font-weight:700;">{key}</div>
    <div class="muted-copy" style="color:#0D1B2A;">{value}</div>
  </div>
</div>
""",
                unsafe_allow_html=True,
            )


def main():
    init_state()
    if not st.session_state.logged_in:
        render_login()
        return

    profile = st.session_state.profile
    prediction = predict_profile(profile)
    render_sidebar(profile, prediction)

    page = st.session_state.page
    if page == "Home":
        render_home(profile, prediction)
    elif page == "AI Advisor":
        render_ai_advisor(profile, prediction)
    elif page == "Academics":
        render_academics(profile, prediction)
    elif page == "Career Match":
        render_career(profile, prediction)
    elif page == "Scholarships":
        render_scholarships(profile, prediction)
    elif page == "Appointments":
        render_appointments(profile, prediction)
    else:
        render_profile(profile, prediction)

    st.markdown(
        """
<div style="margin-top:18px;padding-top:14px;border-top:1px solid rgba(148,163,184,0.24);font-size:11px;color:#94A3B8;text-align:center;">
  UniGuide AI · Streamlit portal refreshed from the React design reference · Random Forest + SHAP advisory demo
</div>
""",
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    main()
