import os

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

RAW_PATH = "data/raw/uikd_raw.csv"
CLEAN_PATH = "data/clean/uikd_clean.csv"
TEXT_COL_CANDIDATES = ("text_clean", "text_raw", "text")


def pick_text_column(columns):
    for col in TEXT_COL_CANDIDATES:
        if col in columns:
            return col
    raise ValueError(
        "No usable text column found. Expected one of: text_clean, text_raw, text."
    )


def normalize_text(value):
    if value is None or pd.isna(value):
        return ""
    return " ".join(str(value).split())


def extract_keywords(texts, top_n=8):
    # Keep input length unchanged; blank tags for empty pages.
    clean_texts = [normalize_text(t) for t in texts]
    nonempty_idx = [i for i, t in enumerate(clean_texts) if t]

    if not nonempty_idx:
        return [""] * len(clean_texts)

    nonempty_docs = [clean_texts[i] for i in nonempty_idx]
    vectorizer = TfidfVectorizer(stop_words="english", max_features=2000)
    tfidf_matrix = vectorizer.fit_transform(nonempty_docs)
    feature_names = vectorizer.get_feature_names_out()

    keywords_nonempty = []
    for row in tfidf_matrix:
        data = row.toarray().ravel()
        if data.sum() == 0:
            keywords_nonempty.append("")
            continue
        top_idx = data.argsort()[::-1][:top_n]
        top_keywords = [feature_names[i] for i in top_idx if data[i] > 0]
        keywords_nonempty.append(", ".join(top_keywords))

    tags = [""] * len(clean_texts)
    for i, original_i in enumerate(nonempty_idx):
        tags[original_i] = keywords_nonempty[i]
    return tags


def main():
    df = pd.read_csv(RAW_PATH)
    os.makedirs("data/clean", exist_ok=True)

    text_col = pick_text_column(df.columns)
    if text_col != "text_clean":
        df["text_clean"] = df[text_col]

    # Preserve row count from raw; normalize text and keep scraper-error rows with blank text/tags.
    df["text_clean"] = df["text_clean"].apply(normalize_text)
    df["tags"] = extract_keywords(df["text_clean"].tolist(), top_n=8)

    # Stable one-row-per-page behavior.
    if "url" in df.columns:
        df = df.drop_duplicates(subset=["url"], keep="first").reset_index(drop=True)

    df.to_csv(CLEAN_PATH, index=False)
    print(f"Saved cleaned dataset with tags: {CLEAN_PATH}")
    print(f"Rows: {len(df)} | Empty text rows: {(df['text_clean'].str.len() == 0).sum()}")
    print(df[["category", "page_title", "tags"]].head().to_string(index=False))


if __name__ == "__main__":
    main()
