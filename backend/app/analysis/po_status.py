"""
Module A — Purchase Order Status Analysis.

classify each PO line OPEN vs CLOSED by Open Qty (>0 ⇒ open).
"""

from __future__ import annotations

import pandas as pd

from app.cleaning import require_columns, rename_canonical, parse_numeric, parse_dates
from app.config import COLUMN_ALIASES


REQUIRED = ["po_no", "vendor_code", "item_code", "po_qty", "open_qty"]  # unit_price uses fallback
OPTIONAL  = ["vendor_name", "item_description", "po_date", "line_total"]


def run(df_raw: pd.DataFrame) -> dict:
    """
    Returns:
        {
            kpis: {...},
            charts: {po_status: {...}, po_value: {...}},
            tables: [{title, rows}]
        }
    """
    mapping = require_columns(df_raw, REQUIRED, "Purchase Order")
    from app.cleaning import detect_columns
    m2 = detect_columns(df_raw)
    for opt in OPTIONAL + ["grpo_rate"]:
        if opt in m2:
            mapping[opt] = m2[opt]

    df = rename_canonical(df_raw, mapping).copy()

    df["po_qty"] = parse_numeric(df["po_qty"])
    # "Price"/"Rate" column may have been mapped to grpo_rate (last-wins) — accept both
    if "unit_price" not in df.columns and "grpo_rate" in df.columns:
        df = df.rename(columns={"grpo_rate": "unit_price"})
    df["unit_price"] = parse_numeric(df["unit_price"])
    df["open_qty"]  = parse_numeric(df["open_qty"])

    if "line_total" in df.columns:
        df["line_total"] = parse_numeric(df["line_total"])
    else:
        df["line_total"] = df["po_qty"] * df["unit_price"]

    if "po_date" in df.columns:
        df["po_date"] = parse_dates(df["po_date"])

    # Classify
    df["status"] = df["open_qty"].apply(
        lambda x: "Open" if pd.notna(x) and x > 0 else "Closed"
    )

    total_lines  = len(df)
    open_lines   = int((df["status"] == "Open").sum())
    closed_lines = int((df["status"] == "Closed").sum())

    unique_pos    = df["po_no"].nunique()
    unique_vendors = df["vendor_code"].nunique()

    total_value_cr  = round(df["line_total"].sum() / 1e7, 2)
    open_value_cr   = round(df.loc[df["status"] == "Open", "line_total"].sum() / 1e7, 2)
    pct_open_value  = round(open_value_cr / total_value_cr * 100, 1) if total_value_cr else 0.0

    # Top vendor open
    top_vendor_open = (
        df[df["status"] == "Open"]
        .groupby("vendor_code")["po_no"]
        .nunique()
        .max()
    )
    top_vendor_open = int(top_vendor_open) if pd.notna(top_vendor_open) else 0

    # Circumference = 314 for r=50
    CIRC = 314.0
    open_pct  = open_lines / total_lines if total_lines else 0
    closed_pct = 1 - open_pct
    open_dash   = round(open_pct * CIRC, 0)
    closed_dash = round(closed_pct * CIRC, 0)
    closed_val_pct = round((total_value_cr - open_value_cr) / total_value_cr * 100, 0) if total_value_cr else 0.0
    open_val_pct   = round(open_value_cr / total_value_cr * 100, 0) if total_value_cr else 0.0

    # Summary table by PO
    po_summary = (
        df.groupby("po_no")
        .agg(
            Vendor_Code=("vendor_code", "first"),
            Vendor_Name=("vendor_name", "first") if "vendor_name" in df.columns else ("vendor_code", "first"),
            Total_Lines=("po_qty", "count"),
            Open_Lines=("status", lambda s: (s == "Open").sum()),
            Total_Qty=("po_qty", "sum"),
            Open_Qty=("open_qty", "sum"),
            Total_Value=("line_total", "sum"),
        )
        .reset_index()
        .rename(columns={"po_no": "PO No"})
    )
    po_summary["Open_Value"] = po_summary.apply(
        lambda r: df.loc[(df["po_no"] == r["PO No"]) & (df["status"] == "Open"), "line_total"].sum(),
        axis=1,
    )
    po_summary["Status"] = po_summary["Open_Lines"].apply(
        lambda x: "Partially Open" if 0 < x < po_summary["Total_Lines"].max() else ("Open" if x > 0 else "Closed")
    )
    po_summary = po_summary.sort_values("Open_Value", ascending=False)

    # Top 25 vendors with highest open exposure
    vendor_open = (
        df[df["status"] == "Open"]
        .groupby("vendor_code")
        .agg(
            Vendor_Name=("vendor_name", "first") if "vendor_name" in df.columns else ("vendor_code", "first"),
            Open_POs=("po_no", "nunique"),
            Open_Lines=("po_no", "count"),
            Open_Value=("line_total", "sum"),
            Open_Qty=("open_qty", "sum"),
        )
        .reset_index()
        .rename(columns={"vendor_code": "Vendor Code"})
        .sort_values("Open_Value", ascending=False)
        .head(25)
    )

    # Open PO transaction list
    open_tx = df[df["status"] == "Open"].copy()
    cols_out = ["po_no", "vendor_code"]
    if "vendor_name"      in open_tx.columns: cols_out.append("vendor_name")
    if "item_code"        in open_tx.columns: cols_out.append("item_code")
    if "item_description" in open_tx.columns: cols_out.append("item_description")
    cols_out += ["po_qty", "open_qty", "unit_price", "line_total"]
    if "po_date"          in open_tx.columns: cols_out.append("po_date")
    open_tx = open_tx[[c for c in cols_out if c in open_tx.columns]]
    open_tx = open_tx.rename(columns={
        "po_no": "PO No", "vendor_code": "Vendor Code",
        "vendor_name": "Vendor Name", "item_code": "Item Code",
        "item_description": "Description", "po_qty": "PO Qty",
        "open_qty": "Open Qty", "unit_price": "Unit Price",
        "line_total": "Line Total", "po_date": "PO Date",
    })

    def _to_rows(frame: pd.DataFrame) -> list[dict]:
        return frame.fillna("").astype(str).to_dict(orient="records")

    return {
        "kpis": {
            "unique_pos":       unique_pos,
            "total_lines":      total_lines,
            "open_lines":       open_lines,
            "closed_lines":     closed_lines,
            "total_value_cr":   total_value_cr,
            "open_value_cr":    open_value_cr,
            "pct_open_value":   pct_open_value,
            "top_vendor_open":  top_vendor_open,
            "unique_vendors":   unique_vendors,
        },
        "charts": {
            "po_status": {
                "total": total_lines,
                "segments": [
                    {"label": "Open",   "value": open_lines,   "dash": open_dash,   "offset": 0},
                    {"label": "Closed", "value": closed_lines, "dash": closed_dash, "offset": -open_dash},
                ],
            },
            "po_value": {
                "closed": {"label": "Closed Value", "value_cr": round(total_value_cr - open_value_cr, 2), "pct": closed_val_pct},
                "open":   {"label": "Open Value",   "value_cr": open_value_cr,  "pct": open_val_pct},
            },
        },
        "tables": [
            {"title": "PO Status Summary",           "rows": _to_rows(po_summary.head(100))},
            {"title": "Top 25 Vendors – Highest Open PO Exposure", "rows": _to_rows(vendor_open)},
            {"title": "Open PO Transaction Data List", "rows": _to_rows(open_tx.head(500))},
        ],
    }
