import argparse
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "src"


def run_step(label: str, command: list[str]) -> None:
    print(f"\n=== {label} ===", flush=True)
    print(" ".join(command), flush=True)
    subprocess.run(command, check=True, cwd=ROOT)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Run the UniGuide AI pipeline end-to-end."
    )
    parser.add_argument(
        "--skip-scrape",
        action="store_true",
        help="Skip both scraping steps and reuse existing raw CSV files.",
    )
    parser.add_argument(
        "--skip-facultyinfo",
        action="store_true",
        help="Skip the facultyinfo crawl.",
    )
    parser.add_argument(
        "--faculty-max-pages",
        type=int,
        default=25,
        help="Maximum facultyinfo pages to crawl when enabled.",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    python = sys.executable

    if not args.skip_scrape:
        run_step("Scrape UNT seed URLs", [python, str(SRC_DIR / "scrape_uikd.py")])
        if not args.skip_facultyinfo:
            run_step(
                "Scrape UNT faculty info",
                [
                    python,
                    str(SRC_DIR / "scrape_facultyinfo.py"),
                    "--max-pages",
                    str(args.faculty_max_pages),
                ],
            )

    run_step("Clean raw pages", [python, str(SRC_DIR / "clean_uikd.py")])
    run_step("Enrich guidance signals", [python, str(SRC_DIR / "enrich_uikd.py")])
    run_step("Split guidance into items", [python, str(SRC_DIR / "split_uikd_items.py")])
    run_step(
        "Generate synthetic students",
        [python, str(SRC_DIR / "generate_sscd_students.py")],
    )
    run_step("Rank recommendations", [python, str(SRC_DIR / "rank_guidance.py")])
    run_step("Evaluate recommendations", [python, str(SRC_DIR / "evaluate_recs.py")])

    print("\nPipeline complete.", flush=True)


if __name__ == "__main__":
    main()
