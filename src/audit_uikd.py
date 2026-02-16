import pandas as pd

CLEAN_PATH = "data/clean/uikd_clean.csv"

def main():
    df = pd.read_csv(CLEAN_PATH)

    print("\n=== UIKD DATA AUDIT (CLEAN DATASET) ===")
    print(f"Rows: {len(df)}")
    print(f"Columns: {len(df.columns)}")

    print("\nCategory counts:")
    print(df["category"].value_counts())

    print("\nMissing values per column:")
    print(df.isna().sum())

    lengths = df["text_clean"].astype(str).str.len()
    print("\nText length stats (characters):")
    print(lengths.describe())

if __name__ == "__main__":
    main()
