"""Tests for GL Vendor Balances module."""

import pandas as pd
import pytest
from app.analysis.gl_balances import run


def test_balance_classification(gl_df):
    result = run(gl_df)
    kpis = result["kpis"]
    # V001: credit=2000, debit=500 → net=1500 → Outstanding
    # V002: credit=1500, debit=1000 → net=500 → Outstanding
    # V003: credit=300, debit=300 → net=0 → Fully Paid
    assert kpis["outstanding_cnt"] == 2
    assert kpis["fully_paid_cnt"] == 1
    assert kpis["advance_cnt"] == 0
    assert kpis["total_vendors"] == 3


def test_advance_balance():
    gl = pd.DataFrame({
        "Account Code": ["VA"],
        "Debit":  ["1000"],
        "Credit": ["500"],
    })
    result = run(gl)
    assert result["kpis"]["advance_cnt"] == 1
    assert result["kpis"]["outstanding_cnt"] == 0


def test_net_balance_computation(gl_df):
    result = run(gl_df)
    # outstanding_cr should be positive
    assert result["kpis"]["outstanding_cr"] >= 0


def test_donut_segments(gl_df):
    result = run(gl_df)
    segs = result["charts"]["payment_status"]["segments"]
    assert len(segs) == 3
    labels = {s["label"] for s in segs}
    assert labels == {"Outstanding", "Fully Paid", "Advance/Debit"}
