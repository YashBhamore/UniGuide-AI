import os

import pandas as pd

ITEMS_PATH = "data/clean/uikd_items.csv"
STUDENTS_PATH = "data/synthetic/sscd_students.csv"
OUT_PATH = "data/output/recommendations.csv"
TOP_K = 5

GOAL_KEYWORDS = {
    "Find scholarships": ["scholarship", "financial aid", "grant", "waiver", "tuition", "funding"],
    "Meet academic deadlines": ["deadline", "due", "calendar", "opens", "closes", "withdraw", "drop"],
    "Maintain visa compliance": ["international", "visa", "i-20", "sevis", "cpt", "opt", "compliance"],
    "Explore research opportunities": ["research", "faculty", "proposal", "grant", "fellowship", "funding"],
    "Access student support resources": ["advising", "appointment", "support", "faq", "help", "navigate"],
}

FOCUS_KEYWORDS = {
    "Financial planning": ["aid", "cost", "tuition", "waiver", "scholarship", "loan"],
    "Registration and records": ["register", "registrar", "withdraw", "drop", "transcript", "calendar"],
    "Immigration and visa": ["visa", "international", "cpt", "opt", "i-20", "sevis"],
    "Research and innovation": ["research", "funding", "proposal", "lab", "faculty"],
    "Campus support": ["advising", "support", "services", "resource", "appointment"],
}

CATEGORY_BOOSTS = {
    "Find scholarships": {"financial_aid": 2.0},
    "Meet academic deadlines": {"academic_policies": 2.0},
    "Maintain visa compliance": {"international": 2.0},
    "Explore research opportunities": {"research": 2.0, "faculty_info": 1.5},
    "Access student support resources": {"advising": 2.0, "navigate_faq": 2.0},
}


def normalize(value) -> str:
    if value is None or pd.isna(value):
        return ""
    return str(value).strip()


def has_term(text: str, term: str) -> bool:
    return term.lower() in text


def suggest_action(action_cues: str) -> str:
    actions = [a.strip() for a in normalize(action_cues).split(";") if a.strip()]
    if not actions:
        return "Review page details"
    return f"{actions[0].capitalize()} now"


def score_item(item_row, student_row):
    goal = normalize(student_row.get("primary_goal"))
    focus_area = normalize(student_row.get("focus_area"))
    urgency = normalize(student_row.get("urgency")).lower()
    is_international = normalize(student_row.get("international_status")).lower() in {
        "yes",
        "international",
        "true",
        "1",
    }

    category = normalize(item_row.get("category")).lower()
    text_blob = " ".join(
        [
            normalize(item_row.get("page_title")),
            normalize(item_row.get("item_title")),
            normalize(item_row.get("item_text")),
            normalize(item_row.get("tags")),
            normalize(item_row.get("action_cues")),
            normalize(item_row.get("deadline_signals")),
            category,
        ]
    ).lower()

    score = 0.0
    reasons = []

    goal_terms = GOAL_KEYWORDS.get(goal, [])
    goal_hits = [term for term in goal_terms if has_term(text_blob, term)]
    if goal_hits:
        score += 2.5 * min(len(goal_hits), 4)
        reasons.append(f"goal_match:{', '.join(goal_hits[:3])}")

    focus_terms = FOCUS_KEYWORDS.get(focus_area, [])
    focus_hits = [term for term in focus_terms if has_term(text_blob, term)]
    if focus_hits:
        score += 1.5 * min(len(focus_hits), 3)
        reasons.append(f"focus_match:{', '.join(focus_hits[:2])}")

    goal_category_boost = CATEGORY_BOOSTS.get(goal, {})
    if category in goal_category_boost:
        score += goal_category_boost[category]
        reasons.append(f"category_boost:{category}")

    has_deadline = bool(normalize(item_row.get("deadline_signals")))
    has_action = bool(normalize(item_row.get("action_cues")))
    if has_action:
        score += 0.7
        reasons.append("actionable_page")
    if has_deadline:
        score += 0.7
        reasons.append("deadline_signal")
        if urgency in {"high", "urgent"}:
            score += 1.0
            reasons.append("urgency_boost")

    if is_international:
        if any(term in text_blob for term in ("international", "visa", "i-20", "cpt", "opt")):
            score += 1.2
            reasons.append("international_relevant")

    return round(score, 3), "; ".join(reasons[:4]) if reasons else "weak_match"


def main():
    if not os.path.exists(ITEMS_PATH):
        raise FileNotFoundError(
            f"Missing {ITEMS_PATH}. Run: python src/split_uikd_items.py"
        )
    if not os.path.exists(STUDENTS_PATH):
        raise FileNotFoundError(
            f"Missing {STUDENTS_PATH}. Run: python src/generate_sscd_students.py"
        )

    items = pd.read_csv(ITEMS_PATH).fillna("")
    students = pd.read_csv(STUDENTS_PATH).fillna("")

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

    rows = []
    for _, student in students.iterrows():
        student_id = normalize(student.get("student_id"))
        scored = []

        for _, item in items.iterrows():
            score, explanation = score_item(item, student)
            if score <= 0:
                continue
            scored.append((score, explanation, item))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_items = []
        seen_doc_ids = set()
        for score, explanation, item in scored:
            doc_id = normalize(item.get("doc_id"))
            if doc_id in seen_doc_ids:
                continue
            top_items.append((score, explanation, item))
            seen_doc_ids.add(doc_id)
            if len(top_items) == TOP_K:
                break

        for rank, (score, explanation, item) in enumerate(top_items, start=1):
            rows.append(
                {
                    "student_id": student_id,
                    "primary_goal": normalize(student.get("primary_goal")),
                    "focus_area": normalize(student.get("focus_area")),
                    "urgency": normalize(student.get("urgency")),
                    "rank": rank,
                    "item_id": normalize(item.get("item_id")),
                    "doc_id": normalize(item.get("doc_id")),
                    "category": normalize(item.get("category")),
                    "page_title": normalize(item.get("page_title")),
                    "item_title": normalize(item.get("item_title")),
                    "url": normalize(item.get("url")),
                    "relevance_score": score,
                    "explanation": explanation,
                    "action_suggestion": suggest_action(item.get("action_cues", "")),
                    "deadline_signals": normalize(item.get("deadline_signals")),
                    "action_cues": normalize(item.get("action_cues")),
                    "tags": normalize(item.get("tags")),
                }
            )

    out = pd.DataFrame(rows)
    out.to_csv(OUT_PATH, index=False)
    print(f"Saved recommendations: {OUT_PATH}")
    print(
        f"Students: {students['student_id'].nunique()} | "
        f"Recommendations: {len(out)} | Top-K: {TOP_K}"
    )
    print(out.head(10).to_string(index=False))


if __name__ == "__main__":
    main()
