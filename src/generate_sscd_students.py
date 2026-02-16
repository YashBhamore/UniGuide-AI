import os
import random

import pandas as pd

OUT_PATH = "data/synthetic/sscd_students.csv"
N_STUDENTS = 300
RANDOM_SEED = 42

STUDENT_LEVELS = ["Undergraduate", "Graduate", "Doctoral"]
MAJOR_INTERESTS = [
    "Computer Science",
    "Data Science",
    "Electrical Engineering",
    "Business Analytics",
    "Public Health",
    "Biology",
    "Psychology",
    "Education",
    "Finance",
    "Mechanical Engineering",
]
PRIMARY_GOALS = [
    "Find scholarships",
    "Meet academic deadlines",
    "Maintain visa compliance",
    "Explore research opportunities",
    "Access student support resources",
]
GOAL_TO_FOCUS = {
    "Find scholarships": ["Financial planning", "Campus support"],
    "Meet academic deadlines": ["Registration and records", "Campus support"],
    "Maintain visa compliance": ["Immigration and visa", "Registration and records"],
    "Explore research opportunities": ["Research and innovation", "Financial planning"],
    "Access student support resources": ["Campus support", "Registration and records"],
}
URGENCY_LEVELS = ["Low", "Medium", "High"]
ENROLLMENT_TERMS = ["Spring 2026", "Summer 2026", "Fall 2026"]
PREFERRED_SUPPORT = ["Webpage guidance", "Advisor meeting", "Email support", "Checklist"]


def weighted_choice(values, weights):
    return random.choices(values, weights=weights, k=1)[0]


def make_student(student_num: int):
    student_id = f"S{student_num:04d}"
    level = weighted_choice(STUDENT_LEVELS, [0.55, 0.3, 0.15])
    goal = weighted_choice(PRIMARY_GOALS, [0.24, 0.25, 0.16, 0.17, 0.18])
    focus_area = random.choice(GOAL_TO_FOCUS[goal])
    major = random.choice(MAJOR_INTERESTS)
    urgency = weighted_choice(URGENCY_LEVELS, [0.25, 0.5, 0.25])

    # Visa-compliance goal implies international profile.
    if goal == "Maintain visa compliance":
        international_status = "Yes"
    else:
        international_status = weighted_choice(["No", "Yes"], [0.72, 0.28])

    return {
        "student_id": student_id,
        "student_level": level,
        "international_status": international_status,
        "major_interest": major,
        "primary_goal": goal,
        "focus_area": focus_area,
        "urgency": urgency,
        "enrollment_term": random.choice(ENROLLMENT_TERMS),
        "preferred_support": random.choice(PREFERRED_SUPPORT),
    }


def main():
    random.seed(RANDOM_SEED)
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

    students = [make_student(i) for i in range(1, N_STUDENTS + 1)]
    out = pd.DataFrame(students)
    out.to_csv(OUT_PATH, index=False)

    print(f"Saved synthetic students: {OUT_PATH}")
    print(f"Rows: {len(out)}")
    print(out["primary_goal"].value_counts().to_string())


if __name__ == "__main__":
    main()
