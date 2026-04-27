import re
from urllib.parse import urlparse
import pandas as pd

IN_TXT = "URLS.txt"
OUT_CSV = "seed_urls_filtered.csv"
EXTRA_ALLOWED_HOSTS = {
    "unt-scholarships.awardspring.com",
    "untscholarships.awardspring.com",
}

# Remove obvious noise paths for student decision-support scope
EXCLUDE_PATTERNS = [
    r"/news", r"/events", r"/event", r"/calendar", r"/gallery",
    r"/people", r"/directory", r"/staff", r"/faculty-staff",
    r"/annual", r"/report", r"/press", r"/jobs", r"/careers",
    r"/give", r"/giving",  # optional: keep only if you want donation guidance (usually not needed)
    r"bncollege\.com",     # bookstore
    r"login", r"/app/#", r"eab\.com",  # authenticated tools
]

# Keep patterns that are typically student-decision relevant
INCLUDE_HINTS = [
    r"financialaid", r"scholar", r"grant", r"loan", r"tuition", r"waiver",
    r"registrar", r"academic", r"deadline", r"drop", r"withdraw", r"graduat",
    r"advis", r"appointment", r"navigate", r"faq",
    r"international", r"isss", r"cpt", r"opt", r"visa", r"i-20",
    r"research", r"funding", r"opportunit", r"undergraduate research", r"student research"
]

def normalize(url: str) -> str:
    url = url.strip()
    url = url.split("#")[0]  # remove fragments
    return url

def host_from_url(url: str) -> str:
    return urlparse(url).netloc.lower().split(":")[0]

def is_allowed_domain(url: str) -> bool:
    host = host_from_url(url)
    return host == "unt.edu" or host.endswith(".unt.edu") or host in EXTRA_ALLOWED_HOSTS

def main():
    with open(IN_TXT, "r", encoding="utf-8", errors="ignore") as f:
        urls = [normalize(line) for line in f.readlines() if line.strip().startswith("http")]

    urls = list(dict.fromkeys(urls))  # unique while preserving order

    kept = []
    for u in urls:
        low = u.lower()

        # Keep UNT domains only (+ explicit allowlist exceptions).
        if not is_allowed_domain(u):
            continue

        # Exclude if matches any exclude pattern
        if any(re.search(p, low) for p in EXCLUDE_PATTERNS):
            continue

        # Include only if it has student-relevant hints
        if any(re.search(p, low) for p in INCLUDE_HINTS):
            kept.append(u)

    # Assign basic categories by domain/path hints
    rows = []
    for u in kept:
        low = u.lower()
        if "financialaid" in low or "scholar" in low or "loan" in low or "grant" in low:
            cat = "financial_aid"
        elif "international" in low or "isss" in low or "cpt" in low or "opt" in low or "visa" in low or "i-20" in low:
            cat = "international"
        elif "research" in low or "funding" in low:
            cat = "research"
        elif "navigate" in low or "faq" in low:
            cat = "navigate_faq"
        elif "advis" in low or "appointment" in low:
            cat = "advising"
        elif "registrar" in low or "academic" in low or "deadline" in low or "drop" in low or "withdraw" in low or "graduat" in low:
            cat = "academic_policies"
        else:
            cat = "student_resources"

        rows.append({"category": cat, "source_org": "UNT", "url": u})

    df = pd.DataFrame(rows)
    df.to_csv(OUT_CSV, index=False)
    print(f"Saved: {OUT_CSV} | URLs kept: {len(df)}")
    print(df["category"].value_counts())

if __name__ == "__main__":
    main()
