"""Load Excel / CSV files into pandas DataFrames."""

import io
import pandas as pd
from pathlib import Path


def load_file(path_or_bytes, filename: str) -> pd.DataFrame:
    """
    Read an .xlsx, .xls, or .csv file and return a DataFrame.
    Tries multiple encodings for CSV; uses openpyxl for xlsx.
    """
    ext = Path(filename).suffix.lower()
    if ext in (".xlsx", ".xls"):
        return _load_excel(path_or_bytes, filename)
    elif ext == ".csv":
        return _load_csv(path_or_bytes)
    else:
        raise ValueError(f"Unsupported file type '{ext}' for file '{filename}'.")


def _load_excel(path_or_bytes, filename: str) -> pd.DataFrame:
    engine = "openpyxl" if filename.lower().endswith(".xlsx") else None
    try:
        df = pd.read_excel(path_or_bytes, engine=engine, header=0, dtype=str)
    except Exception:
        # Some files have a merged/multi-row header — try skipping 1 row
        if hasattr(path_or_bytes, "seek"):
            path_or_bytes.seek(0)
        df = pd.read_excel(path_or_bytes, engine=engine, header=1, dtype=str)
    return df.dropna(how="all").reset_index(drop=True)


def _load_csv(path_or_bytes) -> pd.DataFrame:
    data = path_or_bytes
    if hasattr(data, "read"):
        data = data.read()
    if isinstance(data, bytes):
        for enc in ("utf-8-sig", "utf-8", "latin-1", "cp1252"):
            try:
                return pd.read_csv(
                    io.StringIO(data.decode(enc)), dtype=str
                ).dropna(how="all").reset_index(drop=True)
            except (UnicodeDecodeError, Exception):
                continue
        raise ValueError("Could not decode CSV with any known encoding.")
    return pd.read_csv(data, dtype=str).dropna(how="all").reset_index(drop=True)
