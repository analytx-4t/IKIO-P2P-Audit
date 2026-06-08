"""
Module I — Vendor Master Validation.

- Duplicate vendor names (normalised: lowercase, strip suffixes)
- Missing/invalid GSTIN (15-char standard)
- Missing PAN (10-char standard)
- MSME distribution
"""

from __future__ import annotations

import pandas as pd

from app.cleaning import (
    require_columns, rename_canonical, detect_columns,
    normalise_vendor_name, is_valid_gstin, is_valid_pan,
)


REQUIRED = ["vendor_code", "vendor_name"]


def run(df_raw: pd.DataFrame) -> dict:
    mapping = require_columns(df_raw, REQUIRED, "Vendor Master")
    for opt in ["gstin", "pan", "msme_category", "state"]:
        m2 = detect_columns(df_raw)
        if opt in m2:
            mapping[opt] = m2[opt]

    df = rename_canonical(df_raw, mapping).copy()

    total_vendors = len(df)

    # ── Duplicates ────────────────────────────────────────────────────────────
    df["norm_name"] = df["vendor_name"].apply(normalise_vendor_name)
    dup_groups = df.groupby("norm_name").filter(lambda g: len(g) > 1)
    dup_count  = dup_groups["vendor_code"].nunique()

    # ── GSTIN validation ──────────────────────────────────────────────────────
    if "gstin" in df.columns:
        df["gstin_valid"] = df["gstin"].apply(is_valid_gstin)
        missing_gstin = int((~df["gstin_valid"]).sum())
    else:
        df["gstin_valid"] = False
        missing_gstin = total_vendors

    # ── PAN validation ────────────────────────────────────────────────────────
    if "pan" in df.columns:
        df["pan_valid"] = df["pan"].apply(is_valid_pan)
        missing_pan = int((~df["pan_valid"]).sum())
    else:
        df["pan_valid"] = False
        missing_pan = total_vendors

    # ── MSME distribution ─────────────────────────────────────────────────────
    if "msme_category" in df.columns:
        msme_dist = (
            df["msme_category"]
            .astype(str).str.strip().str.upper()
            .value_counts()
            .reset_index()
            .rename(columns={"msme_category": "Category", "count": "Count"})
        )
        # Normalise common labels
        cat_map = {"MICRO": "Micro", "SMALL": "Small", "MEDIUM": "Medium",
                   "N": "Non-MSME", "NAN": "Non-MSME", "NONE": "Non-MSME", "": "Non-MSME"}
        msme_dist["Category"] = msme_dist["Category"].map(cat_map).fillna(msme_dist["Category"])
        msme_counts = msme_dist.set_index("Category")["Count"].to_dict()
    else:
        msme_counts = {}

    micro_cnt    = int(msme_counts.get("Micro", 0))
    small_cnt    = int(msme_counts.get("Small", 0))
    medium_cnt   = int(msme_counts.get("Medium", 0))
    non_msme_cnt = int(msme_counts.get("Non-MSME", total_vendors - micro_cnt - small_cnt - medium_cnt))

    # Donut: exceptions
    CIRC = 314.0
    total_exc = int(dup_count) + missing_gstin + missing_pan
    dup_dash   = round(int(dup_count) / total_exc * CIRC, 0) if total_exc else 0
    gstin_dash = round(missing_gstin / total_exc * CIRC, 0) if total_exc else 0
    pan_dash   = round(missing_pan   / total_exc * CIRC, 0) if total_exc else 0

    # MSME bars
    msme_total = micro_cnt + small_cnt + medium_cnt + non_msme_cnt
    msme_bars = [
        {"label": "Micro",     "value": micro_cnt,    "pct": round(micro_cnt    / msme_total * 100, 0) if msme_total else 0},
        {"label": "Small",     "value": small_cnt,    "pct": round(small_cnt    / msme_total * 100, 0) if msme_total else 0},
        {"label": "Medium",    "value": medium_cnt,   "pct": round(medium_cnt   / msme_total * 100, 0) if msme_total else 0},
        {"label": "Non-MSME",  "value": non_msme_cnt, "pct": round(non_msme_cnt / msme_total * 100, 0) if msme_total else 0},
    ]

    # Duplicate vendor table
    dup_table = (
        dup_groups.groupby("norm_name")
        .agg(
            vendor_codes=("vendor_code", lambda x: ", ".join(x.astype(str).unique())),
            vendor_names=("vendor_name", lambda x: " | ".join(x.unique())),
            count=("vendor_code", "count"),
        )
        .reset_index()
        .rename(columns={"norm_name": "Normalised Name", "vendor_codes": "Vendor Codes",
                          "vendor_names": "Vendor Names", "count": "Count"})
        .sort_values("Count", ascending=False)
    )

    # Missing GSTIN table
    if "gstin" in df.columns:
        missing_gstin_df = df[~df["gstin_valid"]][["vendor_code", "vendor_name", "gstin"]].copy()
        missing_gstin_df = missing_gstin_df.rename(columns={
            "vendor_code": "Vendor Code", "vendor_name": "Vendor Name", "gstin": "GSTIN (Invalid/Missing)",
        })
    else:
        missing_gstin_df = pd.DataFrame(columns=["Vendor Code", "Vendor Name", "GSTIN (Invalid/Missing)"])

    # Full vendor table
    keep = ["vendor_code", "vendor_name"]
    for c in ["gstin", "pan", "msme_category", "state"]:
        if c in df.columns:
            keep.append(c)
    full_vm = df[keep].rename(columns={
        "vendor_code": "Vendor Code", "vendor_name": "Vendor Name",
        "gstin": "GSTIN", "pan": "PAN", "msme_category": "MSME Category",
        "state": "State",
    })

    def _rows(f):
        return f.fillna("").astype(str).to_dict(orient="records")

    return {
        "kpis": {
            "total_vendors":  total_vendors,
            "duplicates":     int(dup_count),
            "missing_gstin":  missing_gstin,
            "missing_pan":    missing_pan,
            "micro_cnt":      micro_cnt,
            "small_cnt":      small_cnt,
            "medium_cnt":     medium_cnt,
            "non_msme_cnt":   non_msme_cnt,
        },
        "charts": {
            "exceptions_donut": {
                "total": total_exc,
                "segments": [
                    {"label": "Duplicate Vendors", "value": int(dup_count), "dash": dup_dash,   "offset": 0,          "color": "#ef4444"},
                    {"label": "Missing GSTIN",     "value": missing_gstin,  "dash": gstin_dash, "offset": -dup_dash,  "color": "#f59e0b"},
                    {"label": "Missing PAN",        "value": missing_pan,   "dash": pan_dash,   "offset": -(dup_dash + gstin_dash), "color": "#6366f1"},
                ],
            },
            "msme_bars": msme_bars,
        },
        "tables": [
            {"title": "Duplicate Vendor Names",         "rows": _rows(dup_table.head(200))},
            {"title": "Vendors with Missing/Invalid GSTIN", "rows": _rows(missing_gstin_df.head(300))},
            {"title": "Vendor Master – Full List",       "rows": _rows(full_vm.head(500))},
        ],
    }
