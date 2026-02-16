import os

import pandas as pd

RECS_PATH = "data/output/recommendations.csv"

GOAL_TO_EXPECTED_CATEGORIES = {
    "Find scholarships": {"financial_aid"},
    "Meet academic deadlines": {"academic_policies"},
    "Maintain visa compliance": {"international"},
    "Explore research opportunities": {"research"},
    "Access student support resources": {"advising", "navigate_faq"},
}


def pct(value: float) -> str:
    return f"{100.0 * value:.1f}%"


def main():
    if not os.path.exists(RECS_PATH):
        raise FileNotFoundError(
            f"Missing {RECS_PATH}. Run: .venv/bin/python src/rank_guidance.py"
        )

    recs = pd.read_csv(RECS_PATH).fillna("")
    if recs.empty:
        print("No recommendations found in recommendations.csv.")
        return

    recs["relevance_score"] = pd.to_numeric(recs["relevance_score"], errors="coerce").fillna(0.0)

    # Q1: Do students get non-zero recommendations?
    student_counts = recs.groupby("student_id").size()
    student_nonzero = recs.groupby("student_id")["relevance_score"].max() > 0
    total_students = student_counts.shape[0]
    students_with_any = int((student_counts > 0).sum())
    students_with_nonzero = int(student_nonzero.sum())

    print("=== Recommendation Evaluation ===")
    print("\n1) Non-zero recommendations")
    print(
        f"Students with any recs: {students_with_any}/{total_students} ({pct(students_with_any/total_students)})"
    )
    print(
        f"Students with non-zero score recs: {students_with_nonzero}/{total_students} "
        f"({pct(students_with_nonzero/total_students)})"
    )

    # Q2: Goal consistency by expected category map.
    recs["expected_category_match"] = recs.apply(
        lambda r: str(r["category"]) in GOAL_TO_EXPECTED_CATEGORIES.get(str(r["primary_goal"]), set()),
        axis=1,
    )
    overall_goal_consistency = recs["expected_category_match"].mean()

    print("\n2) Goal consistency")
    print(f"Overall category consistency: {pct(overall_goal_consistency)}")
    print("By goal:")
    for goal, expected_cats in GOAL_TO_EXPECTED_CATEGORIES.items():
        goal_df = recs[recs["primary_goal"] == goal]
        if goal_df.empty:
            print(f"- {goal}: no rows")
            continue
        row_match = goal_df["expected_category_match"].mean()
        student_any_match = goal_df.groupby("student_id")["expected_category_match"].any().mean()
        print(
            f"- {goal}: row_match={pct(row_match)}, "
            f"students_with_at_least_one_expected={pct(student_any_match)}, "
            f"expected={sorted(expected_cats)}"
        )

    # Q3: Basic diversity / concentration check.
    doc_counts = recs["doc_id"].value_counts()
    page_counts = recs["page_title"].value_counts()
    top2_doc_share = doc_counts.head(2).sum() / len(recs)
    top2_page_share = page_counts.head(2).sum() / len(recs)

    print("\n3) Basic diversity")
    print(f"Unique docs recommended: {recs['doc_id'].nunique()} / {len(recs)} rows")
    print(f"Top-2 doc share: {pct(top2_doc_share)}")
    print(f"Top-2 page-title share: {pct(top2_page_share)}")
    if top2_doc_share > 0.5:
        print("Diversity verdict: LOW (recommendations are concentrated in the same few pages).")
    else:
        print("Diversity verdict: ACCEPTABLE (not dominated by the same 2 pages).")
    print("Most recommended docs:")
    for doc_id, count in doc_counts.head(5).items():
        print(f"- {doc_id}: {count} rows")


if __name__ == "__main__":
    main()
