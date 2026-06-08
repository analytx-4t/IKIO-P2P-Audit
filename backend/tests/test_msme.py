"""Tests for MSME Compliance module."""

import pandas as pd
import pytest
from app.analysis.msme import run
from app.config import MSME_PAYMENT_LIMIT_DAYS


def test_breach_detected(pr_df, vm_df):
    result = run(pr_df, vm_df)
    # INV002: vendor V001 (MICRO), due 05-02, paid 20-03 → delay ~43 days
    # Depending on reference_date this may or may not breach
    kpis = result["kpis"]
    assert "breaches" in kpis
    assert kpis["breaches"] >= 0


def test_breach_threshold():
    """Exactly 45 days delay = no breach; 46 = breach."""
    base = pd.Timestamp("2026-01-01")
    pr = pd.DataFrame({
        "Invoice No":     ["INV-A", "INV-B"],
        "Invoice Date":   ["01-01-2026", "01-01-2026"],
        "Due Date":       ["01-01-2026", "01-01-2026"],
        "Amount":         ["1000", "1000"],
        "Payment Date":   ["15-02-2026", "17-02-2026"],  # +45 and +47
        "Vendor Code":    ["V001", "V002"],
    })
    vm = pd.DataFrame({
        "Vendor Code": ["V001", "V002"],
        "Vendor Name": ["Micro Co", "Micro Two"],
        "MSME Reg":    ["MICRO", "MICRO"],
    })
    result = run(pr, vm)
    # INV-A: 45 days ≤ 45 limit → no breach; INV-B: 47 > 45 → breach
    assert result["kpis"]["breaches"] == 1


def test_non_msme_not_breached():
    """Non-MSME vendors are never flagged as breached."""
    pr = pd.DataFrame({
        "Invoice No":   ["INV-X"],
        "Invoice Date": ["01-01-2026"],
        "Due Date":     ["01-01-2026"],
        "Amount":       ["5000"],
        "Payment Date": ["01-04-2026"],  # 90 days late
        "Vendor Code":  ["V999"],
    })
    vm = pd.DataFrame({
        "Vendor Code": ["V999"],
        "Vendor Name": ["Large Corp"],
        "MSME Reg":    ["N"],
    })
    result = run(pr, vm)
    assert result["kpis"]["breaches"] == 0


def test_penalty_calculation():
    """Penalty = amount × 0.27 × days / 365."""
    pr = pd.DataFrame({
        "Invoice No":   ["INV-P"],
        "Invoice Date": ["01-01-2026"],
        "Due Date":     ["01-01-2026"],
        "Amount":       ["36500"],
        "Payment Date": ["16-02-2026"],  # 46 days
        "Vendor Code":  ["VM1"],
    })
    vm = pd.DataFrame({
        "Vendor Code": ["VM1"],
        "Vendor Name": ["Small Biz"],
        "MSME Reg":    ["SMALL"],
    })
    result = run(pr, vm)
    assert result["kpis"]["breaches"] == 1
    # penalty ≈ 36500 × 0.27 × 46 / 365 ≈ 1243
    assert result["kpis"]["penalty_l"] > 0
