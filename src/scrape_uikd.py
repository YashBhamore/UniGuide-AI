import os
import time
import hashlib
from datetime import datetime

import pandas as pd
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) UniGuideAI/0.1"
}

CACHE_DIR = "data/html_cache"
OUT_RAW = "data/raw/uikd_raw.csv"


def url_to_id(url: str) -> str:
    return hashlib.md5(url.encode("utf-8")).hexdigest()


def fetch_html(url: str, cache_path: str) -> str:
    # Use cache if available (prevents re-hitting the website)
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

    resp = requests.get(url, headers=HEADERS, timeout=25)
    resp.raise_for_status()

    html = resp.text
    with open(cache_path, "w", encoding="utf-8") as f:
        f.write(html)

    time.sleep(1.5)  # polite delay
    return html


def extract_title_and_text(html: str) -> tuple[str, str]:
    soup = BeautifulSoup(html, "lxml")

    title = soup.title.get_text(strip=True) if soup.title else ""

    # Try to get main content first
    main_content = soup.find("main")

    if main_content:
        target = main_content
    else:
        target = soup

    # Remove junk
    for tag in target(["script", "style", "noscript", "header", "footer", "nav"]):
        tag.decompose()

    text = target.get_text(separator=" ", strip=True)
    text = " ".join(text.split())

    return title, text



def main():
    os.makedirs(CACHE_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(OUT_RAW), exist_ok=True)

    seeds = pd.read_csv("seed_urls.csv")

    rows = []
    

    for _, r in seeds.iterrows():
        category = r["category"]
        source_org = r["source_org"]
        url = r["url"]

        doc_id = url_to_id(url)
        cache_path = os.path.join(CACHE_DIR, f"{doc_id}.html")

        try:
            html = fetch_html(url, cache_path)
            page_title, text_clean = extract_title_and_text(html)

            rows.append({
                "doc_id": doc_id,
                "source_org": source_org,
                "category": category,
                "page_title": page_title,
                "url": url,
                "captured_at": datetime.utcnow().isoformat(),
                "text_clean": text_clean
            })

        except Exception as e:
            rows.append({
                "doc_id": doc_id,
                "source_org": source_org,
                "category": category,
                "page_title": "",
                "url": url,
                "captured_at": datetime.utcnow().isoformat(),
                "text_clean": "",
                "error": str(e)
            })

    df = pd.DataFrame(rows)
    df.to_csv(OUT_RAW, index=False)
    print(f"Saved: {OUT_RAW}")
    print(df[['category','page_title','url']].to_string(index=False))


if __name__ == "__main__":
    main()
