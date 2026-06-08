"""Tests for Quantity Variance module."""

import pandas as pd
import pytest
from app.analysis.qty_variance import run


def test_variance_tolerance(po_df, grpo_df):
    result = run(po_df, grpo_df)
    kpis = result["kpis"]
    assert kpis["total_lines"] == 4
    assert kpis["within_tol"] + kpis["above_tol"] == kpis["total_lines"]
    assert 0 <= kpis["exception_rate"] <= 100


def test_item01_above_tolerance(po_df, grpo_df):
    """PO001/ITEM01: PO=100, received=80 → 20% variance (above 5%)."""
    result = run(po_df, grpo_df)
    exceptions = next(t for t in result["tables"] if "Exception" in t["title"])
    items_in_exc = [r["Item Code"] for r in exceptions["rows"]]
    assert "ITEM01" in items_in_exc


def test_item02_within_tolerance(po_df, grpo_df):
    """PO001/ITEM02: PO=50, received=50 → 0% → within tolerance."""
    result = run(po_df, grpo_df)
    kpis = result["kpis"]
    assert kpis["within_tol"] >= 1


def test_charts_structure(po_df, grpo_df):
    result = run(po_df, grpo_df)
    bucket = result["charts"]["variance_buckets"]
    assert "segments" in bucket
    assert len(bucket["segments"]) == 2


def test_five_pct_boundary():
    """Exactly 5% variance should be within tolerance."""
    po = pd.DataFrame({
        "PO No": ["P1"], "Item No.": ["I1"],
        "Quantity": ["100"], "Price": ["10"], "Open Qty": ["0"],
    })
    grpo = pd.DataFrame({
        "GRPO No": ["G1"], "Base Ref": ["P1"], "Item No.": ["I1"],
        "Received Qty": ["95"],  # (100-95)/100 = 5% exactly
        "Rate": ["10"], "Posting Date": ["01-01-2026"],
    })
    result = run(po, grpo)
    assert result["kpis"]["within_tol"] == 1
    assert result["kpis"]["above_tol"] == 0
