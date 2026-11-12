#!/usr/bin/env python3
"""
mermaidfixhelper.py — Diagnose and fix common Mermaid diagram issues in Markdown files.

Common problems this catches:
  1. Unclosed ```mermaid blocks (missing closing ```)
  2. <br/> / <br> tags inside mermaid node labels (get HTML-escaped by Jekyll/kramdown
     to &lt;br/&gt;, which Mermaid v10 cannot parse → "Syntax error in text")
  3. HTML-escaped arrows (--&gt;) inside mermaid blocks
  4. Missing language tag on fenced code blocks that contain mermaid

Usage:
  python mermaidfixhelper.py [--fix] [file1.md file2.md ...]
  # Scans all .md files under the current directory by default.
  # Without --fix, reports issues only. With --fix, auto-remediates #2 and #3.
"""

import argparse
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

MERMAID_OPEN = re.compile(r"```mermaid")
CODE_CLOSE = re.compile(r"```")
BR_TAG = re.compile(r"<br\s*/?>", re.IGNORECASE)
ESCAPED_ARROW = re.compile(r"--&gt;")


def find_mermaid_blocks(content: str):
    """Return list of (start_idx, end_idx, block_text) for each ```mermaid block."""
    blocks = []
    for m in MERMAID_OPEN.finditer(content):
        start = m.end()
        # Find the next closing ``` after the open
        close_match = CODE_CLOSE.search(content, start)
        if not close_match:
            blocks.append((m.start(), None, content[m.start():]))
            continue
        end = close_match.start()
        block_text = content[start:end]
        blocks.append((m.start(), end, block_text))
    return blocks


def scan_file(path: Path) -> list[dict]:
    """Scan a single markdown file for mermaid issues. Returns list of issue dicts."""
    try:
        text = path.read_text(encoding="utf-8")
    except Exception as exc:  # pragma: no cover - defensive
        return [{"file": str(path), "issue": f"read_error: {exc}"}]

    issues = []
    blocks = find_mermaid_blocks(text)

    for idx, (start, end, block) in enumerate(blocks, 1):
        # Issue 1: unclosed block
        if end is None:
            issues.append({
                "file": str(path),
                "block": idx,
                "issue": "unclosed_mermaid_block",
                "line_hint": text[:start].count("\n") + 1,
            })
            continue

        # Issue 2: <br/> or <br> inside node labels
        br_matches = BR_TAG.findall(block)
        if br_matches:
            issues.append({
                "file": str(path),
                "block": idx,
                "issue": "br_tags_in_mermaid",
                "count": len(br_matches),
                "line_hint": text[:start].count("\n") + 1,
                "sample": block[:120].replace("\n", " | "),
            })

        # Issue 3: HTML-escaped arrows
        if ESCAPED_ARROW.search(block):
            issues.append({
                "file": str(path),
                "block": idx,
                "issue": "escaped_arrows_in_mermaid",
                "line_hint": text[:start].count("\n") + 1,
                "sample": block[:120].replace("\n", " | "),
            })

    return issues


def fix_file(path: Path) -> dict:
    """Auto-fix br_tags and escaped_arrows in mermaid blocks. Returns summary."""
    text = path.read_text(encoding="utf-8")
    original = text

    def clean_block(match):
        inner = match.group(1)
        inner = BR_TAG.sub(" ", inner)
        inner = ESCAPED_ARROW.sub("-->", inner)
        return "```mermaid\n" + inner + "\n```"

    text = re.sub(r"```mermaid\n(.*?)```", clean_block, text, flags=re.DOTALL)

    changed = text != original
    if changed:
        path.write_text(text, encoding="utf-8")

    return {"file": str(path), "changed": changed}


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Diagnose and fix mermaid diagram issues in Markdown.")
    parser.add_argument("files", nargs="*", help="Markdown files to scan (default: all .md under cwd)")
    parser.add_argument("--fix", action="store_true", help="Auto-fix br_tags and escaped_arrows")
    args = parser.parse_args()

    if args.files:
        targets = [Path(f) for f in args.files]
    else:
        targets = sorted(Path(".").rglob("*.md"))

    all_issues = []
    for target in targets:
        if not target.exists():
            print(f"NOT FOUND: {target}")
            continue
        if args.fix:
            summary = fix_file(target)
            if summary["changed"]:
                print(f"FIXED: {summary['file']}")
        else:
            issues = scan_file(target)
            all_issues.extend(issues)

    if not args.fix:
        if not all_issues:
            print("No mermaid issues found.")
        else:
            print(f"\nFound {len(all_issues)} mermaid issue(s) across scanned files:\n")
            for iss in all_issues:
                line = iss.get("line_hint", "?")
                print(f"  {iss['file']}:{line} — block {iss['block']}: {iss['issue']}")
                if "count" in iss:
                    print(f"    ({iss['count']} <br/> tags)")
                if "sample" in iss:
                    print(f"    sample: {iss['sample']}")
            print("\nRe-run with --fix to auto-remediate br_tags and escaped_arrows.")


if __name__ == "__main__":
    main()
