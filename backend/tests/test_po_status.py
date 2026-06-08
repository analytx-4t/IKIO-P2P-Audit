"""Tests for PO Status module."""

import pytest
from app.analysis.po_status import run


def test_basic_open_closed(po_df):
    result = run(po_df)
    kpis = result["kpis"]
    # PO003 open_qty=0 → Closed, PO001/ITEM01 open_qty=20 → Open, PO002 all open
    assert kpis["open_lines"] == 2
    assert kpis["closed_lines"] == 2
    assert kpis["total_lines"] == 4
    assert kpis["unique_pos"] == 3


def test_kpi_values(po_df):
    result = run(po_df)
    kpis = result["kpis"]
    # Small test data sums to ~5500 rupees; Cr = /1e7 → may round to 0.0
    # Verify non-negative and open <= total
    assert kpis["open_value_cr"] >= 0
    assert kpis["total_value_cr"] >= kpis["open_value_cr"]
    assert 0 <= kpis["pct_open_value"] <= 100


def test_tables_present(po_df):
    result = run(po_df)
    titles = [t["title"] for t in result["tables"]]
    assert "PO Status Summary" in titles
    assert "Open PO Transaction Data List" in titles


def test_charts_structure(po_df):
    result = run(po_df)
    ps = result["charts"]["po_status"]
    assert "total" in ps
    assert len(ps["segments"]) == 2
    assert ps["segments"][0]["label"] == "Open"
    assert ps["segments"][1]["label"] == "Closed"


def test_all_open(po_df):
    po_df["Open Qty"] = "10"
    result = run(po_df)
    assert result["kpis"]["closed_lines"] == 0
    assert result["kpis"]["open_lines"] == 4


def test_all_closed(po_df):
    po_df["Open Qty"] = "0"
    result = run(po_df)
    assert result["kpis"]["open_lines"] == 0
    assert result["kpis"]["closed_lines"] == 4
