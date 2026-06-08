"""Tests for 3-Way Matching module."""

import pandas as pd
import pytest
from app.analysis.three_way import run


def test_perfect_match(po_df, grpo_df, pr_df):
    result = run(po_df, grpo_df, pr_df)
    kpis = result["kpis"]
    assert kpis["total_records"] > 0
    assert kpis["fully_matched"] >= 0
    assert kpis["fully_matched"] <= kpis["total_records"]


def test_match_categories_sum(po_df, grpo_df, pr_df):
    result = run(po_df, grpo_df, pr_df)
    summary_table = next(t for t in result["tables"] if "Summary" in t["title"])
    total_in_table = sum(int(r.get("Count", 0)) for r in summary_table["rows"])
    assert total_in_table == result["kpis"]["total_records"]


def test_all_perfect_match():
    """When qty and price perfectly match, all records = Perfect Match."""
    po = pd.DataFrame({
        "PO No": ["P1"], "Vendor Code": ["V1"],
        "Item No.": ["I1"], "Quantity": ["100"], "Price": ["10"],
    })
    grpo = pd.DataFrame({
        "GRPO No": ["G1"], "Base Ref": ["P1"], "Item No.": ["I1"],
        "Received Qty": ["100"], "Rate": ["10"],
        "Posting Date": ["01-01-2026"],
    })
    pr = pd.DataFrame({
        "Invoice No": ["INV1"], "PO No": ["P1"],
        "Amount": ["1000"],
    })
    result = run(po, grpo, pr)
    assert result["kpis"]["fully_matched"] == 1


def test_charts_structure(po_df, grpo_df, pr_df):
    result = run(po_df, grpo_df, pr_df)
    donut = result["charts"]["match_donut"]
    assert "total" in donut
    assert "segments" in donut
    assert len(donut["segments"]) > 0
