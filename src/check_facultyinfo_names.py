import argparse
import csv
import os
from difflib import SequenceMatcher
from zipfile import ZipFile
from xml.etree import ElementTree as ET
from urllib.parse import quote, urljoin

import pandas as pd
import requests
from bs4 import BeautifulSoup

SEARCH_URL = "https://facultyinfo.unt.edu/faculty-search?name={query}"
OUT_PATH = "data/output/facultyinfo_name_check.csv"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) UniGuideAI/0.1"
}
XLSX_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"


def normalize_name(name: str) -> str:
    cleaned = " ".join(str(name).strip().split()).lower()
    cleaned = cleaned.replace(".", "")
    cleaned = cleaned.replace(",", "")
    return cleaned


def format_query_name(name: str) -> str:
    raw = " ".join(str(name).strip().split())
    if "," not in raw:
        return raw

    parts = [part.strip() for part in raw.split(",") if part.strip()]
    if len(parts) < 2:
        return raw.replace(",", " ")

    last_name = parts[0]
    remaining = " ".join(parts[1:])
    return f"{remaining} {last_name}".strip()


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize_name(a), normalize_name(b)).ratio()


def token_overlap_score(a: str, b: str) -> float:
    tokens_a = set(normalize_name(a).split())
    tokens_b = set(normalize_name(b).split())
    if not tokens_a or not tokens_b:
        return 0.0
    return len(tokens_a & tokens_b) / max(len(tokens_a), len(tokens_b))


def load_names(input_path: str, name_column: str | None = None) -> list[str]:
    suffix = os.path.splitext(input_path)[1].lower()

    if suffix == ".txt":
        with open(input_path, "r", encoding="utf-8", errors="ignore") as file_obj:
            names = [line.strip() for line in file_obj if line.strip()]
        return list(dict.fromkeys(names))

    if suffix == ".csv":
        df = pd.read_csv(input_path).fillna("")
        if df.empty:
            return []
        if name_column:
            if name_column not in df.columns:
                raise ValueError(f"Column '{name_column}' not found in {input_path}")
            series = df[name_column]
        else:
            series = df.iloc[:, 0]
        names = [str(value).strip() for value in series if str(value).strip()]
        return list(dict.fromkeys(names))

    if suffix == ".pdf":
        try:
            from pypdf import PdfReader
        except ImportError as exc:
            raise RuntimeError(
                "PDF input requires the 'pypdf' package. "
                "Install it or export the names to .txt/.csv first."
            ) from exc

        reader = PdfReader(input_path)
        raw_text = "\n".join((page.extract_text() or "") for page in reader.pages)
        # Assumption: faculty names appear one per line in the PDF.
        names = [line.strip() for line in raw_text.splitlines() if line.strip()]
        return list(dict.fromkeys(names))

    if suffix == ".xlsx":
        return load_names_from_xlsx(input_path, name_column)

    raise ValueError("Supported input formats are .txt, .csv, .xlsx, and .pdf")


def load_names_from_xlsx(input_path: str, name_column: str | None = None) -> list[str]:
    with ZipFile(input_path) as archive:
        shared_strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared_xml = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in shared_xml.findall(f"{{{XLSX_NS}}}si"):
                shared_strings.append(
                    "".join(text_node.text or "" for text_node in item.iter(f"{{{XLSX_NS}}}t"))
                )

        sheet_xml = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        rows = []
        for row in sheet_xml.findall(f".//{{{XLSX_NS}}}row"):
            values = []
            for cell in row.findall(f"{{{XLSX_NS}}}c"):
                cell_type = cell.attrib.get("t")
                value_node = cell.find(f"{{{XLSX_NS}}}v")
                value = ""
                if value_node is not None and value_node.text is not None:
                    raw_value = value_node.text
                    value = (
                        shared_strings[int(raw_value)]
                        if cell_type == "s"
                        else raw_value
                    )
                values.append(value)
            rows.append(values)

    if not rows:
        return []

    header = rows[0]
    data_rows = rows[1:]
    if not header:
        return []

    if name_column:
        try:
            column_index = header.index(name_column)
        except ValueError as exc:
            raise ValueError(f"Column '{name_column}' not found in {input_path}") from exc
    else:
        column_index = 0

    names = []
    for row in data_rows:
        if column_index >= len(row):
            continue
        value = str(row[column_index]).strip()
        if value:
            names.append(value)

    return list(dict.fromkeys(names))


def parse_results(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    results = []

    for block in soup.select(".results-result"):
        name = block.select_one(".result-name")
        title = block.select_one(".result-title")
        department = block.select_one(".result-department")
        college = block.select_one(".result-college")
        profile_link = block.select_one("a.fis-link")

        results.append(
            {
                "matched_name": name.get_text(" ", strip=True) if name else "",
                "title": title.get_text(" ", strip=True) if title else "",
                "department": department.get_text(" ", strip=True) if department else "",
                "college": college.get_text(" ", strip=True) if college else "",
                "profile_url": (
                    urljoin("https://facultyinfo.unt.edu", profile_link["href"])
                    if profile_link and profile_link.get("href")
                    else ""
                ),
            }
        )

    return results


def classify_matches(query_name: str, results: list[dict]) -> dict:
    normalized_query = normalize_name(query_name)
    exact_matches = [row for row in results if normalize_name(row["matched_name"]) == normalized_query]

    if exact_matches:
        best = exact_matches[0]
        return {
            "status": "exact_match",
            "match_count": len(results),
            "exact_match_count": len(exact_matches),
            "best_match_name": best["matched_name"],
            "best_match_score": 1.0,
            "best_match_title": best["title"],
            "best_match_department": best["department"],
            "best_match_college": best["college"],
            "best_match_profile_url": best["profile_url"],
            "all_profile_urls": " | ".join(
                row["profile_url"] for row in exact_matches if row["profile_url"]
            ),
        }

    if results:
        scored = sorted(
            (
                (
                    similarity(query_name, row["matched_name"]),
                    token_overlap_score(query_name, row["matched_name"]),
                    row,
                )
                for row in results
            ),
            key=lambda item: (item[0], item[1]),
            reverse=True,
        )
        best_score, overlap_score, best = scored[0]
        is_partial_match = best_score >= 0.88 or (
            best_score >= 0.8 and overlap_score >= 0.5
        )
        return {
            "status": "partial_match" if is_partial_match else "not_found",
            "match_count": len(results),
            "exact_match_count": 0,
            "best_match_name": best["matched_name"],
            "best_match_score": round(best_score, 3),
            "best_match_title": best["title"],
            "best_match_department": best["department"],
            "best_match_college": best["college"],
            "best_match_profile_url": best["profile_url"],
            "all_profile_urls": " | ".join(
                row["profile_url"] for row in results[:10] if row["profile_url"]
            ),
        }

    return {
        "status": "not_found",
        "match_count": 0,
        "exact_match_count": 0,
        "best_match_name": "",
        "best_match_score": 0.0,
        "best_match_title": "",
        "best_match_department": "",
        "best_match_college": "",
        "best_match_profile_url": "",
        "all_profile_urls": "",
    }


def check_name(session: requests.Session, query_name: str) -> dict:
    formatted_query_name = format_query_name(query_name)
    url = SEARCH_URL.format(query=quote(formatted_query_name))
    response = session.get(url, timeout=25)
    response.raise_for_status()
    results = parse_results(response.text)
    summary = classify_matches(formatted_query_name, results)

    return {
        "query_name": query_name,
        "formatted_query_name": formatted_query_name,
        "search_url": url,
        **summary,
    }


def add_review_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    def recommend(row) -> str:
        status = str(row.get("status", ""))
        profile_url = str(row.get("best_match_profile_url", "")).strip()
        best_name = str(row.get("best_match_name", "")).strip()

        if status == "exact_match":
            return "confirmed_on_site"
        if status == "partial_match":
            return "review_likely_same_person"
        if status == "not_found" and best_name and profile_url:
            return "review_possible_name_variation"
        return "likely_missing_from_site"

    df["recommended_action"] = df.apply(recommend, axis=1)
    df["needs_manual_review"] = df["recommended_action"].isin(
        {"review_likely_same_person", "review_possible_name_variation"}
    )
    return df


def parse_args():
    parser = argparse.ArgumentParser(
        description="Batch-check faculty names against facultyinfo.unt.edu"
    )
    parser.add_argument(
        "--input",
        required=True,
        help="Path to a .txt, .csv, or .pdf file containing faculty names.",
    )
    parser.add_argument(
        "--name-column",
        default=None,
        help="CSV column name to use for faculty names. Defaults to the first column.",
    )
    parser.add_argument(
        "--output",
        default=OUT_PATH,
        help="Output CSV path for the faculty name check results.",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    names = load_names(args.input, args.name_column)
    os.makedirs(os.path.dirname(args.output), exist_ok=True)

    session = requests.Session()
    session.headers.update(HEADERS)

    rows = []
    for name in names:
        rows.append(check_name(session, name))

    out = add_review_columns(pd.DataFrame(rows))
    out.to_csv(args.output, index=False, quoting=csv.QUOTE_MINIMAL)
    print(f"Saved: {args.output}")
    print(f"Names checked: {len(out)}")
    print(out["recommended_action"].value_counts().to_string())
    if not out.empty:
        print(
            out[
                [
                    "query_name",
                    "status",
                    "recommended_action",
                    "best_match_name",
                    "best_match_profile_url",
                ]
            ].head(20).to_string(index=False)
        )


if __name__ == "__main__":
    main()
