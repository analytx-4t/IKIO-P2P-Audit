"""
Column normalisation layer.

detect_columns(df) → dict mapping canonical names to actual column labels.
rename_columns(df, mapping) → DataFrame with renamed columns.
parse_dates(series) → datetime Series (multiple formats).
parse_numeric(series) → float Series (strips commas/currency symbols).
"""

from __future__ import annotations

import re
from typing import Optional

import pandas as pd

from app.config import COLUMN_ALIASES


def _normalise_header(h: str) -> str:
    """Lowercase, collapse whitespace, strip punctuation variants."""
    return re.sub(r"\s+", " ", str(h).lower().strip().rstrip("."))


def detect_columns(df: pd.DataFrame) -> dict[str, str]:
    """
    Return {canonical_name: actual_column_label} for every canonical name
    that can be matched in df's headers.

    When multiple canonicals share the same alias, last-writer wins because
    the canonical sections are ordered so file-specific names come after
    generic cross-file names. This lets file-specific canonicals override
    generic ones for their native header names.
    """
    actual_headers = {_normalise_header(c): c for c in df.columns}
    result: dict[str, str] = {}
    for canonical, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            key = _normalise_header(alias)
            if key in actual_headers:
                result[canonical] = actual_headers[key]
                break
    return result


def require_columns(
    df: pd.DataFrame,
    canonical_names: list[str],
    file_label: str,
) -> dict[str, str]:
    """
    Like detect_columns but raises ValueError if any required canonical name
    is not found. Returns the mapping of found names.
    """
    mapping = detect_columns(df)
    missing = [n for n in canonical_names if n not in mapping]
    if missing:
        found = list(df.columns[:10])
        raise ValueError(
            f"[{file_label}] Required columns not found: {missing}. "
            f"Detected headers (first 10): {found}. "
            "Check that the correct file is uploaded for this role."
        )
    return mapping


def rename_canonical(df: pd.DataFrame, mapping: dict[str, str]) -> pd.DataFrame:
    """Return a copy of df with columns renamed to their canonical names."""
    rev = {v: k for k, v in mapping.items()}
    return df.rename(columns=rev)


# ── Date parsing ──────────────────────────────────────────────────────────────
_DATE_FORMATS = [
    "%d-%m-%Y", "%d/%m/%Y", "%d-%b-%Y", "%d %b %Y",
    "%Y-%m-%d", "%m/%d/%Y", "%d-%B-%Y",
]


def parse_dates(series: pd.Series) -> pd.Series:
    """Coerce a string Series to datetime, trying multiple formats."""
    s = series.astype(str).str.strip()
    result = pd.to_datetime(s, errors="coerce", dayfirst=True)
    # For rows that are still NaT, try explicit formats
    mask = result.isna() & s.notna() & (s != "nan") & (s != "")
    if mask.any():
        for fmt in _DATE_FORMATS:
            remaining = mask & result.isna()
            if not remaining.any():
                break
            result[remaining] = pd.to_datetime(
                s[remaining], format=fmt, errors="coerce"
            )
    return result


# ── Numeric parsing ───────────────────────────────────────────────────────────
def parse_numeric(series: pd.Series) -> pd.Series:
    """Strip commas, ₹, spaces, and convert to float. Invalid → NaN."""
    cleaned = (
        series.astype(str)
        .str.replace(r"[₹,\s]", "", regex=True)
        .str.replace(r"\((.+)\)", r"-\1", regex=True)  # (123) → -123
    )
    return pd.to_numeric(cleaned, errors="coerce")


# ── Vendor name normalisation ─────────────────────────────────────────────────
_SUFFIX_RE = re.compile(
    r"\b(pvt|ltd|limited|private|llp|inc|corp|co|company|enterprises?|"
    r"industries|industry|trading|traders?|solutions?|services?|group)\b\.?",
    re.IGNORECASE,
)


def normalise_vendor_name(name: str) -> str:
    """Lowercase, strip legal suffixes, collapse whitespace."""
    n = _SUFFIX_RE.sub("", str(name).lower())
    return re.sub(r"\s+", " ", n).strip()


# ── GSTIN / PAN validators ────────────────────────────────────────────────────
_GSTIN_RE = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")
_PAN_RE = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")


def is_valid_gstin(val: Optional[str]) -> bool:
    if not val or str(val).strip().lower() in ("nan", "none", ""):
        return False
    return bool(_GSTIN_RE.match(str(val).strip().upper()))


def is_valid_pan(val: Optional[str]) -> bool:
    if not val or str(val).strip().lower() in ("nan", "none", ""):
        return False
    return bool(_PAN_RE.match(str(val).strip().upper()))
