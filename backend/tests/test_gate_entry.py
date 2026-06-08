"""Tests for Gate Entry Date Integrity module."""

import pytest
import pandas as pd
from app.analysis.gate_entry import run


def test_integrity_high(ge_df, grpo_df):
    result = run(ge_df, grpo_df)
    kpis = result["kpis"]
    # GE003: GE Date 03-01-2026, GRPO Date 02-01-2026 → GE > GRPO (exception)
    assert kpis["exceptions"] >= 1
    assert kpis["integrity_pct"] < 100


def test_no_exceptions():
    """All GE dates before GRPO dates → 100% integrity."""
    ge = pd.DataFrame({
        "Gate Entry No": ["GE001", "GE002"],
        "GRPO No":       ["G001",  "G002"],
        "GE Date":       ["01-01-2026", "01-01-2026"],
    })
    grpo = pd.DataFrame({
        "GRPO No":      ["G001",  "G002"],
        "Posting Date": ["02-01-2026", "03-01-2026"],
    })
    result = run(ge, grpo)
    assert result["kpis"]["exceptions"] == 0
    assert result["kpis"]["integrity_pct"] == 100.0


def test_exception_table_populated(ge_df, grpo_df):
    result = run(ge_df, grpo_df)
    exc_table = next(t for t in result["tables"] if "Exception" in t["title"])
    assert len(exc_table["rows"]) >= 1


def test_charts_structure(ge_df, grpo_df):
    result = run(ge_df, grpo_df)
    pve = result["charts"]["pass_vs_exception"]
    assert "segments" in pve
    assert len(pve["segments"]) == 2
