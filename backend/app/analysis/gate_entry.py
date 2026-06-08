"""
Module B — Gate Entry Date Integrity.

Rule: Vendor Bill Date ≤ GE Date ≤ GRPO Date ≤ AP Date.
"""

from __future__ import annotations

import pandas as pd

from app.cleaning import require_columns, rename_canonical, detect_columns, parse_dates


REQUIRED_GE   = ["ge_no", "ge_date"]
REQUIRED_GRPO = ["grpo_no", "grpo_date"]


def run(df_ge_raw: pd.DataFrame, df_grpo_raw: pd.DataFrame) -> dict:
    # ── Gate Entry ────────────────────────────────────────────────────────────
    ge_map = require_columns(df_ge_raw, REQUIRED_GE, "Gate Entry")
    m2 = detect_columns(df_ge_raw)
    for opt in ["ge_grpo_no", "grpo_no", "vendor_bill_date", "vendor_bill_no", "vendor_code"]:
        if opt in m2:
            ge_map[opt] = m2[opt]

    df_ge = rename_canonical(df_ge_raw, ge_map).copy()
    # "GRPO No" in a GE file may have been claimed by grpo_no (last-wins) — normalise
    if "ge_grpo_no" not in df_ge.columns and "grpo_no" in df_ge.columns:
        df_ge = df_ge.rename(columns={"grpo_no": "ge_grpo_no"})
    df_ge["ge_date"] = parse_dates(df_ge["ge_date"])
    if "vendor_bill_date" in df_ge.columns:
        df_ge["vendor_bill_date"] = parse_dates(df_ge["vendor_bill_date"])

    # ── GRPO ─────────────────────────────────────────────────────────────────
    grpo_map = require_columns(df_grpo_raw, ["grpo_no"], "GRPO")
    m2g = detect_columns(df_grpo_raw)
    for opt in ["grpo_date", "posting_date"]:
        if opt in m2g:
            grpo_map[opt] = m2g[opt]
    df_grpo_full = rename_canonical(df_grpo_raw, grpo_map).copy()
    # grpo_date may have come through as posting_date
    if "grpo_date" not in df_grpo_full.columns and "posting_date" in df_grpo_full.columns:
        df_grpo_full = df_grpo_full.rename(columns={"posting_date": "grpo_date"})
    keep = [c for c in ["grpo_no", "grpo_date"] if c in df_grpo_full.columns]
    df_grpo = df_grpo_full[keep].copy()
    if "grpo_date" in df_grpo.columns:
        df_grpo["grpo_date"] = parse_dates(df_grpo["grpo_date"])
    else:
        df_grpo["grpo_date"] = pd.NaT
    df_grpo = df_grpo.drop_duplicates("grpo_no")

    # ── Merge GE ↔ GRPO ──────────────────────────────────────────────────────
    if "ge_grpo_no" in df_ge.columns:
        merged = df_ge.merge(
            df_grpo, left_on="ge_grpo_no", right_on="grpo_no", how="left"
        )
    else:
        # No join key — just work with GE alone
        merged = df_ge.copy()
        merged["grpo_date"] = pd.NaT

    total_ge = len(merged)

    # Classify GE vs GRPO relationship
    merged["_has_grpo_date"] = merged["grpo_date"].notna()
    merged["_ge_lt_grpo"]    = merged["ge_date"] < merged["grpo_date"]
    merged["_ge_eq_grpo"]    = merged["ge_date"] == merged["grpo_date"]
    merged["_ge_gt_grpo"]    = merged["ge_date"] > merged["grpo_date"]

    missing_grpo_date = int(merged["grpo_date"].isna().sum())
    missing_bill_date = int(merged["vendor_bill_date"].isna().sum()) if "vendor_bill_date" in merged.columns else 0

    ge_lt_grpo = int((merged["_ge_lt_grpo"] & merged["_has_grpo_date"]).sum())
    ge_eq_grpo = int((merged["_ge_eq_grpo"] & merged["_has_grpo_date"]).sum())
    ge_gt_grpo = int((merged["_ge_gt_grpo"] & merged["_has_grpo_date"]).sum())  # exceptions

    pass_count = ge_lt_grpo + ge_eq_grpo
    integrity_pct = round(pass_count / total_ge * 100, 2) if total_ge else 0.0

    # Donut: pass vs exception
    CIRC = 314.0
    pass_dash = round(pass_count / total_ge * CIRC, 0) if total_ge else 0
    exc_dash  = round(ge_gt_grpo / total_ge * CIRC, 0) if total_ge else 0

    # Exception detail table
    exceptions = merged[merged["_ge_gt_grpo"] & merged["_has_grpo_date"]].copy()
    exc_cols = ["ge_no", "ge_date", "grpo_date"]
    if "vendor_bill_date" in exceptions.columns: exc_cols.append("vendor_bill_date")
    if "vendor_bill_no"   in exceptions.columns: exc_cols.append("vendor_bill_no")
    if "vendor_code"      in exceptions.columns: exc_cols.append("vendor_code")
    if "ge_grpo_no"       in exceptions.columns: exc_cols.append("ge_grpo_no")
    exceptions = exceptions[[c for c in exc_cols if c in exceptions.columns]]
    exceptions = exceptions.rename(columns={
        "ge_no": "GE No", "ge_date": "GE Date", "grpo_date": "GRPO Date",
        "vendor_bill_date": "Vendor Bill Date", "vendor_bill_no": "Vendor Bill No",
        "vendor_code": "Vendor Code", "ge_grpo_no": "GRPO No",
    })

    # Full GE list
    full_cols = ["ge_no", "ge_date"]
    if "ge_grpo_no"       in merged.columns: full_cols.append("ge_grpo_no")
    if "grpo_date"        in merged.columns: full_cols.append("grpo_date")
    if "vendor_bill_date" in merged.columns: full_cols.append("vendor_bill_date")
    if "vendor_code"      in merged.columns: full_cols.append("vendor_code")
    full_list = merged[full_cols].copy()
    full_list = full_list.rename(columns={
        "ge_no": "GE No", "ge_date": "GE Date", "ge_grpo_no": "GRPO No",
        "grpo_date": "GRPO Date", "vendor_bill_date": "Vendor Bill Date",
        "vendor_code": "Vendor Code",
    })

    def _rows(frame):
        return frame.fillna("").astype(str).to_dict(orient="records")

    return {
        "kpis": {
            "gate_entries":      total_ge,
            "grpo_docs":         df_grpo_raw.shape[0],
            "exceptions":        ge_gt_grpo,
            "integrity_pct":     integrity_pct,
            "missing_grpo_date": missing_grpo_date,
            "missing_bill_date": missing_bill_date,
            "ge_lt_grpo":        ge_lt_grpo,
            "ge_eq_grpo":        ge_eq_grpo,
        },
        "charts": {
            "pass_vs_exception": {
                "total": total_ge,
                "integrity_pct": integrity_pct,
                "segments": [
                    {"label": "Pass",      "value": pass_count, "dash": pass_dash, "offset": 0},
                    {"label": "Exception", "value": ge_gt_grpo, "dash": exc_dash,  "offset": -pass_dash},
                ],
            },
            "detailed_checks": [
                {"label": "Total",             "value": total_ge,         "pct": 100},
                {"label": "GE = GRPO (same)",  "value": ge_eq_grpo,       "pct": round(ge_eq_grpo / total_ge * 100, 1) if total_ge else 0},
                {"label": "GE < GRPO (normal)","value": ge_lt_grpo,       "pct": round(ge_lt_grpo / total_ge * 100, 1) if total_ge else 0},
                {"label": "GE > GRPO (error)", "value": ge_gt_grpo,       "pct": round(ge_gt_grpo / total_ge * 100, 1) if total_ge else 0},
                {"label": "Missing GRPO Date", "value": missing_grpo_date,"pct": round(missing_grpo_date / total_ge * 100, 1) if total_ge else 0},
                {"label": "Missing Bill Date", "value": missing_bill_date,"pct": round(missing_bill_date / total_ge * 100, 1) if total_ge else 0},
            ],
        },
        "tables": [
            {"title": "GE > GRPO Date Exceptions",   "rows": _rows(exceptions)},
            {"title": "Gate Entry Full Transaction List", "rows": _rows(full_list.head(500))},
        ],
    }
