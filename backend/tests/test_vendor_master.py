"""Tests for Vendor Master Validation module."""

import pytest
from app.analysis.vendor_master import run


def test_duplicate_detection(vm_df):
    result = run(vm_df)
    # V001 and V003 both have normalised name "alpha" → duplicates
    assert result["kpis"]["duplicates"] >= 2


def test_missing_gstin(vm_df):
    result = run(vm_df)
    # V002 has "INVALID", V003 has "" → 2 missing/invalid
    assert result["kpis"]["missing_gstin"] >= 2


def test_valid_gstin_counted_correctly(vm_df):
    result = run(vm_df)
    total = result["kpis"]["total_vendors"]
    missing = result["kpis"]["missing_gstin"]
    assert missing <= total


def test_missing_pan(vm_df):
    result = run(vm_df)
    # V003 has "" PAN → 1 missing
    assert result["kpis"]["missing_pan"] >= 1


def test_msme_distribution(vm_df):
    result = run(vm_df)
    assert result["kpis"]["micro_cnt"] == 1
    assert result["kpis"]["small_cnt"] == 1
    assert result["kpis"]["medium_cnt"] == 1


def test_tables_present(vm_df):
    result = run(vm_df)
    titles = [t["title"] for t in result["tables"]]
    assert any("Duplicate" in t for t in titles)
    assert any("GSTIN" in t for t in titles)
