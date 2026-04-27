import argparse
import hashlib
import os
import time
from collections import deque
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse, urlunparse

import pandas as pd
import requests
from bs4 import BeautifulSoup

START_URL = "https://facultyinfo.unt.edu/"
SOURCE_ORG = "UNT"
CATEGORY = "faculty_info"
CACHE_DIR = "data/html_cache/facultyinfo"
OUT_RAW = "data/raw/facultyinfo_raw.csv"
REQUEST_DELAY_SECONDS = 1.0
DEFAULT_MAX_PAGES = 10

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) UniGuideAI/0.1"
}

SKIP_PATH_HINTS = (
    "/user",
    "/login",
    "/search",
    "/faculty-search",
)
SKIP_EXTENSIONS = (
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".csv",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".svg",
    ".zip",
)


def url_to_id(url: str) -> str:
    return hashlib.md5(url.encode("utf-8")).hexdigest()


def normalize_url(url: str) -> str:
    parsed = urlparse(url.strip())
    clean_path = parsed.path or "/"
    if clean_path != "/" and clean_path.endswith("/"):
        clean_path = clean_path.rstrip("/")
    normalized = parsed._replace(
        scheme=parsed.scheme.lower(),
        netloc=parsed.netloc.lower(),
        path=clean_path,
        params="",
        query="",
        fragment="",
    )
    return urlunparse(normalized)


def should_visit(url: str, allowed_host: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return False
    if parsed.netloc.lower() != allowed_host.lower():
        return False
    if any(parsed.path.lower().endswith(ext) for ext in SKIP_EXTENSIONS):
        return False
    if any(hint in parsed.path.lower() for hint in SKIP_PATH_HINTS):
        return False
    return True


def fetch_html(session: requests.Session, url: str, cache_dir: str) -> str:
    cache_path = os.path.join(cache_dir, f"{url_to_id(url)}.html")
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8", errors="ignore") as file_obj:
            return file_obj.read()

    response = session.get(url, timeout=25)
    response.raise_for_status()
    html = response.text

    with open(cache_path, "w", encoding="utf-8") as file_obj:
        file_obj.write(html)

    time.sleep(REQUEST_DELAY_SECONDS)
    return html


def extract_title_text_and_links(html: str, base_url: str) -> tuple[str, str, list[str]]:
    soup = BeautifulSoup(html, "lxml")
    title = soup.title.get_text(strip=True) if soup.title else ""

    main_content = soup.find("main")
    target = main_content if main_content else soup

    for tag in target(["script", "style", "noscript", "header", "footer", "nav"]):
        tag.decompose()

    text = " ".join(target.get_text(separator=" ", strip=True).split())

    links = []
    for anchor in soup.find_all("a", href=True):
        absolute = normalize_url(urljoin(base_url, anchor["href"]))
        links.append(absolute)

    # Keep discovery order stable while removing duplicates.
    unique_links = list(dict.fromkeys(links))
    return title, text, unique_links


def scrape_site(start_url: str, max_pages: int) -> pd.DataFrame:
    start_url = normalize_url(start_url)
    allowed_host = urlparse(start_url).netloc

    os.makedirs(CACHE_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(OUT_RAW), exist_ok=True)

    session = requests.Session()
    session.headers.update(HEADERS)

    queue = deque([start_url])
    seen = set()
    rows = []

    while queue and len(rows) < max_pages:
        current_url = queue.popleft()
        if current_url in seen or not should_visit(current_url, allowed_host):
            continue
        seen.add(current_url)

        try:
            html = fetch_html(session, current_url, CACHE_DIR)
            page_title, text_clean, links = extract_title_text_and_links(html, current_url)

            rows.append(
                {
                    "doc_id": url_to_id(current_url),
                    "source_org": SOURCE_ORG,
                    "category": CATEGORY,
                    "page_title": page_title,
                    "url": current_url,
                    "captured_at": datetime.now(timezone.utc).isoformat(),
                    "text_clean": text_clean,
                }
            )

            for link in links:
                if link not in seen and should_visit(link, allowed_host):
                    queue.append(link)

        except Exception as exc:
            rows.append(
                {
                    "doc_id": url_to_id(current_url),
                    "source_org": SOURCE_ORG,
                    "category": CATEGORY,
                    "page_title": "",
                    "url": current_url,
                    "captured_at": datetime.now(timezone.utc).isoformat(),
                    "text_clean": "",
                    "error": str(exc),
                }
            )

    return pd.DataFrame(rows)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Scrape a single UNT site starting from one URL."
    )
    parser.add_argument("--start-url", default=START_URL, help="Seed URL to start from.")
    parser.add_argument(
        "--max-pages",
        type=int,
        default=DEFAULT_MAX_PAGES,
        help="Maximum number of pages to crawl on the same host.",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    df = scrape_site(start_url=args.start_url, max_pages=args.max_pages)
    df.to_csv(OUT_RAW, index=False)

    print(f"Saved: {OUT_RAW}")
    print(f"Pages scraped: {len(df)}")
    if not df.empty:
        print(df[["page_title", "url"]].to_string(index=False))


if __name__ == "__main__":
    main()
