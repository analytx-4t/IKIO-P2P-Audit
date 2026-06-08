"""
Module C — Quantity Variance Analysis.

Variance % = (PO Qty - Received Qty) / PO Qty * 100
0–5%  = within tolerance
>5%   = out of tolerance
Goods vs Services split by item code prefix (config.SERVICES_ITEM_PREFIX).
"""

from __future__ import annotations

import pandas as pd

from app.cleaning import require_columns, rename_canonical, detect_columns, parse_numeric
from app.config import VARIANCE_TOLERANCE_PCT, SERVICES_ITEM_PREFIX


REQUIRED_PO   = ["po_no", "item_code", "po_qty"]
REQUIRED_GRPO = ["grpo_no", "grpo_base_po", "item_code", "grpo_qty"]


def _is_service(item_code: str) -> bool:
    return str(item_code).strip().upper().startswith(SERVICES_ITEM_PREFIX.upper())


def run(df_po_raw: pd.DataFrame, df_grpo_raw: pd.DataFrame) -> dict:
    # ── Load PO ──────────────────────────────────────────────────────────────
    po_map = require_columns(df_po_raw, REQUIRED_PO, "Purchase Order")
    for opt in ["vendor_code", "vendor_name", "item_description", "unit_price", "line_total"]:
        m2 = detect_columns(df_po_raw)
        if opt in m2:
            po_map[opt] = m2[opt]

    df_po = rename_canonical(df_po_raw, po_map).copy()
    df_po["po_qty"] = parse_numeric(df_po["po_qty"])
    if "unit_price" in df_po.columns:
        df_po["unit_price"] = parse_numeric(df_po["unit_price"])

    # ── Load GRPO ────────────────────────────────────────────────────────────
    grpo_map = require_columns(df_grpo_raw, REQUIRED_GRPO, "GRPO")
    df_grpo = rename_canonical(df_grpo_raw, grpo_map).copy()
    # grpo_base_po may come through as po_no if "PO No" wins over "Base Ref"
    if "grpo_base_po" not in df_grpo.columns and "po_no" in df_grpo.columns:
        df_grpo = df_grpo.rename(columns={"po_no": "grpo_base_po"})
    if "grpo_base_po" not in df_grpo.columns:
        df_grpo["grpo_base_po"] = None
    df_grpo["grpo_qty"] = parse_numeric(df_grpo["grpo_qty"])

    # Aggregate received qty per PO + item
    grpo_agg = (
        df_grpo.groupby(["grpo_base_po", "item_code"], dropna=False)["grpo_qty"]
        .sum()
        .reset_index()
        .rename(columns={"grpo_base_po": "po_no", "grpo_qty": "received_qty"})
    )

    # ── Merge ────────────────────────────────────────────────────────────────
    merged = df_po.merge(grpo_agg, on=["po_no", "item_code"], how="left")
    merged["received_qty"] = merged["received_qty"].fillna(0)
    merged["po_qty"]       = merged["po_qty"].fillna(0)

    # Variance
    denom = merged["po_qty"].replace(0, pd.NA)
    merged["variance_pct"] = (
        (merged["po_qty"] - merged["received_qty"]).abs() / denom * 100
    )

    merged["within_tol"] = merged["variance_pct"] <= VARIANCE_TOLERANCE_PCT
    merged["is_service"]  = merged["item_code"].apply(_is_service)
    merged["type"]        = merged["is_service"].map({True: "Services", False: "Goods"})

    total_lines   = len(merged)
    within_tol    = int(merged["within_tol"].sum())
    above_tol     = int((~merged["within_tol"]).sum())
    exception_rate = round(above_tol / total_lines * 100, 2) if total_lines else 0.0

    # Goods/Services breakdown
    goods_within   = int(((~merged["is_service"]) & merged["within_tol"]).sum())
    goods_above    = int(((~merged["is_service"]) & ~merged["within_tol"]).sum())
    svc_within     = int((merged["is_service"] & merged["within_tol"]).sum())
    svc_above      = int((merged["is_service"] & ~merged["within_tol"]).sum())

    CIRC = 314.0
    with_dash  = round(within_tol / total_lines * CIRC, 0) if total_lines else 0
    above_dash = round(above_tol  / total_lines * CIRC, 0) if total_lines else 0

    # Detail tables
    cols = ["po_no", "item_code"]
    if "vendor_code"      in merged.columns: cols.append("vendor_code")
    if "item_description" in merged.columns: cols.append("item_description")
    cols += ["po_qty", "received_qty", "variance_pct", "within_tol", "type"]

    exceptions_df = merged[~merged["within_tol"]][cols].copy()
    exceptions_df["variance_pct"] = exceptions_df["variance_pct"].round(2)
    exceptions_df["within_tol"] = exceptions_df["within_tol"].map({True: "Yes", False: "No"})
    exceptions_df = exceptions_df.rename(columns={
        "po_no": "PO No", "item_code": "Item Code", "vendor_code": "Vendor Code",
        "item_description": "Description", "po_qty": "PO Qty",
        "received_qty": "Received Qty", "variance_pct": "Variance %",
        "within_tol": "Within Tolerance", "type": "Type",
    })

    all_df = merged[cols].copy()
    all_df["variance_pct"] = all_df["variance_pct"].round(2)
    all_df["within_tol"]   = all_df["within_tol"].map({True: "Yes", False: "No"})
    all_df = all_df.rename(columns={
        "po_no": "PO No", "item_code": "Item Code", "vendor_code": "Vendor Code",
        "item_description": "Description", "po_qty": "PO Qty",
        "received_qty": "Received Qty", "variance_pct": "Variance %",
        "within_tol": "Within Tolerance", "type": "Type",
    })

    def _rows(f): return f.fillna("").astype(str).to_dict(orient="records")

    goods_total = goods_within + goods_above
    svc_total   = svc_within + svc_above

    return {
        "kpis": {
            "total_lines":    total_lines,
            "within_tol":     within_tol,
            "above_tol":      above_tol,
            "exception_rate": exception_rate,
        },
        "charts": {
            "variance_buckets": {
                "total": total_lines,
                "within_pct": round(within_tol / total_lines * 100, 0) if total_lines else 0,
                "segments": [
                    {"label": "Within Tolerance (0-5%)", "value": within_tol, "dash": with_dash,  "offset": 0},
                    {"label": "Above 5% (Out of Tolerance)", "value": above_tol, "dash": above_dash, "offset": -with_dash},
                ],
            },
            "goods_vs_services": [
                {"label": "Goods – Within 0-5%",    "value": goods_within, "pct": round(goods_within / goods_total * 100, 0) if goods_total else 0},
                {"label": "Goods – Above 5%",        "value": goods_above,  "pct": round(goods_above  / goods_total * 100, 0) if goods_total else 0},
                {"label": "Services – Within 0-5%",  "value": svc_within,   "pct": round(svc_within   / svc_total * 100, 0)   if svc_total else 0},
                {"label": "Services – Above 5%",      "value": svc_above,    "pct": round(svc_above    / svc_total * 100, 0)   if svc_total else 0},
            ],
        },
        "tables": [
            {"title": "Quantity Variance Exceptions (>5%)",   "rows": _rows(exceptions_df.head(500))},
            {"title": "Quantity Variance – All Lines",          "rows": _rows(all_df.head(500))},
        ],
    }
