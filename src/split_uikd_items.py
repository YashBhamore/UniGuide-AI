import os
import re
import hashlib
import pandas as pd

IN_PATH = "data/clean/uikd_enriched.csv"
OUT_PATH = "data/clean/uikd_items.csv"
MIN_CHUNK_WORDS = 30
MAX_CHUNK_WORDS = 120

def make_id(s: str) -> str:
    return hashlib.md5(s.encode("utf-8")).hexdigest()

def normalize_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    return re.sub(r"\s+", " ", text).strip()


def sentence_split(text: str) -> list[str]:
    # Prefer sentence boundaries; fallback to punctuation separators if needed.
    parts = re.split(r"(?<=[.!?])\s+", text)
    parts = [p.strip() for p in parts if p and p.strip()]
    if len(parts) <= 1:
        parts = re.split(r"\s*[;:]\s+", text)
        parts = [p.strip() for p in parts if p and p.strip()]
    return parts

def count_words(text: str) -> int:
    return len(text.split())

def enforce_min_chunk_words(chunks: list[str], min_words: int) -> list[str]:
    chunks = [c.strip() for c in chunks if c and c.strip()]
    if len(chunks) <= 1:
        return [c for c in chunks if count_words(c) >= min_words]

    # Repeatedly merge small chunks into neighbors until all chunks meet threshold
    # or only one chunk remains (for short documents).
    while len(chunks) > 1:
        small_idx = next((i for i, c in enumerate(chunks) if count_words(c) < min_words), None)
        if small_idx is None:
            break
        if small_idx == 0:
            chunks[1] = f"{chunks[0]} {chunks[1]}".strip()
            del chunks[0]
        else:
            chunks[small_idx - 1] = f"{chunks[small_idx - 1]} {chunks[small_idx]}".strip()
            del chunks[small_idx]
    return [c for c in chunks if count_words(c) >= min_words]


def split_into_chunks(
    text: str, min_words: int = MIN_CHUNK_WORDS, max_words: int = MAX_CHUNK_WORDS
) -> list[str]:
    if max_words <= min_words:
        raise ValueError("max_words must be greater than min_words")

    normalized = normalize_text(text)
    if not normalized:
        return []

    sentences = sentence_split(normalized)
    if not sentences:
        sentences = [normalized]

    # First pass: build bounded chunks.
    chunks = []
    current_words = []

    def flush():
        nonlocal current_words
        if current_words:
            chunks.append(" ".join(current_words).strip())
            current_words = []

    for sentence in sentences:
        words = sentence.split()
        if not words:
            continue

        # Hard split sentence fragments that exceed max chunk size.
        while len(words) > max_words:
            head = words[:max_words]
            words = words[max_words:]
            if current_words:
                flush()
            chunks.append(" ".join(head))

        if not words:
            continue

        if current_words and len(current_words) + len(words) > max_words:
            flush()
        current_words.extend(words)

    flush()

    if not chunks:
        return []

    return enforce_min_chunk_words(chunks, min_words)

def guess_item_title(chunk: str) -> str:
    words = chunk.split()
    return " ".join(words[:10]).strip() + ("..." if len(words) > 10 else "")

def main():
    df = pd.read_csv(IN_PATH)

    os.makedirs("data/clean", exist_ok=True)

    rows = []
    for _, r in df.iterrows():
        doc_id = str(r.get("doc_id", ""))
        category = str(r.get("category", ""))
        page_title = str(r.get("page_title", ""))
        url = str(r.get("url", ""))
        captured_at = str(r.get("captured_at", ""))

        text = r.get("text_clean", "")
        chunks = split_into_chunks(text)

        for i, ch in enumerate(chunks):
            item_id = make_id(f"{doc_id}:{i}:{ch[:80]}")
            item_title = guess_item_title(ch)

            rows.append({
                "doc_id": doc_id,
                "item_id": item_id,
                "chunk_index": i,
                "category": category,
                "page_title": page_title,
                "url": url,
                "captured_at": captured_at,
                "item_title": item_title,
                "item_text": ch,
                # carry forward enrich fields if present
                "deadline_signals": r.get("deadline_signals", ""),
                "action_cues": r.get("action_cues", ""),
                "tags": r.get("tags", ""),
            })

    out = pd.DataFrame(rows)
    out.to_csv(OUT_PATH, index=False)
    print(f"Saved: {OUT_PATH}")
    print("Items:", len(out))
    if not out.empty:
        print(out["category"].value_counts().head(10))
        lengths = out["item_text"].astype(str).str.split().str.len()
        print(
            f"Chunk words min/median/max: {lengths.min()}/{int(lengths.median())}/{lengths.max()}"
        )
    else:
        print("No items created.")

if __name__ == "__main__":
    main()
