import re
import os
import pandas as pd

IN_PATH = "data/clean/uikd_clean.csv"
OUT_PATH = "data/clean/uikd_enriched.csv"

DEADLINE_WORDS = [
    "deadline", "due", "submit by", "apply by", "last day", "final day",
    "opens", "closes", "closing", "ends", "until"
]

ACTION_WORDS = [
    "apply", "submit", "register", "schedule", "contact", "visit",
    "log in", "login", "portal", "complete", "request", "access"
]

# Month words to catch dates written like "October 9, 2025"
MONTHS = r"(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(tember)?|oct(ober)?|nov(ember)?|dec(ember)?)"

DATE_PATTERNS = [
    # 10/09/2025 or 10-09-25
    r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
    # October 9, 2025 (month name)
    rf"\b{MONTHS}\s+\d{{1,2}}(,)?\s+\d{{2,4}}\b",
    # Fall 2026 / Spring 2026 style terms
    r"\b(fall|spring|summer|winter)\s+\d{4}\b"
]

def to_text(value) -> str:
    if value is None or pd.isna(value):
        return ""
    return str(value)

def find_matches(text: str, patterns: list[str], max_hits: int = 10) -> list[str]:
    text = to_text(text)
    hits = []
    for pat in patterns:
        for m in re.finditer(pat, text, flags=re.IGNORECASE):
            hits.append(m.group(0))
            if len(hits) >= max_hits:
                return hits
    return hits

def find_word_hits(text: str, words: list[str], max_hits: int = 10) -> list[str]:
    text = to_text(text)
    hits = []
    t = text.lower()
    for w in words:
        if w in t:
            hits.append(w)
            if len(hits) >= max_hits:
                break
    return hits

def main():
    df = pd.read_csv(IN_PATH)
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

    df["deadline_signals"] = df["text_clean"].apply(
        lambda t: "; ".join(sorted(set(find_word_hits(t, DEADLINE_WORDS) + find_matches(t, DATE_PATTERNS))))
    )

    df["action_cues"] = df["text_clean"].apply(
        lambda t: "; ".join(sorted(set(find_word_hits(t, ACTION_WORDS))))
    )

    df.to_csv(OUT_PATH, index=False)
    print(f"Saved enriched dataset: {OUT_PATH}")
    print(df[["category", "page_title", "deadline_signals", "action_cues"]].head(7).to_string(index=False))

if __name__ == "__main__":
    main()
