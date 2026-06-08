"""Shared synthetic DataFrames for all tests."""

import pandas as pd
import pytest


@pytest.fixture
def po_df():
    return pd.DataFrame({
        "PO No": ["PO001", "PO001", "PO002", "PO003"],
        "Vendor Code": ["V001", "V001", "V002", "V003"],
        "Vendor Name": ["Alpha Ltd", "Alpha Ltd", "Beta Pvt", "Gamma Inc"],
        "Item No.": ["ITEM01", "ITEM02", "ITEM01", "ITEM03"],
        "Item Description": ["Widget A", "Widget B", "Widget A", "Gadget C"],
        "Quantity": ["100", "50", "200", "30"],
        "Price": ["10.0", "20.0", "10.0", "50.0"],
        "Open Qty": ["20", "0", "200", "0"],
    })


@pytest.fixture
def grpo_df():
    return pd.DataFrame({
        "GRPO No": ["G001", "G002", "G003"],
        "Base Ref": ["PO001", "PO001", "PO002"],
        "Item No.": ["ITEM01", "ITEM02", "ITEM01"],
        "Received Qty": ["80", "50", "200"],
        "Rate": ["10.5", "20.0", "9.0"],
        "Posting Date": ["01-01-2026", "01-01-2026", "02-01-2026"],
        "Gate Entry No": ["GE001", "GE002", "GE003"],
        "Vendor Code": ["V001", "V001", "V002"],
    })


@pytest.fixture
def ge_df():
    return pd.DataFrame({
        "Gate Entry No": ["GE001", "GE002", "GE003", "GE004"],
        "GRPO No": ["G001", "G002", "G003", "MISSING"],
        "GE Date": ["01-01-2026", "01-01-2026", "03-01-2026", "05-01-2026"],
        "Vendor Bill Date": ["31-12-2025", "31-12-2025", "01-01-2026", "01-01-2026"],
    })


@pytest.fixture
def pr_df():
    return pd.DataFrame({
        "Invoice No": ["INV001", "INV002", "INV003", "INV004"],
        "PO No": ["PO001", "PO001", "PO002", "PO004"],
        "Vendor Code": ["V001", "V001", "V002", "V099"],
        "Invoice Date": ["05-01-2026", "06-01-2026", "07-01-2026", "08-01-2026"],
        "Due Date":     ["04-02-2026", "05-02-2026", "06-02-2026", "07-02-2026"],
        "Amount":       ["800", "1000", "1800", "500"],
        "Payment Date": ["01-02-2026", "20-03-2026", "", "01-02-2026"],
    })


@pytest.fixture
def gl_df():
    return pd.DataFrame({
        "Account Code": ["V001", "V001", "V002", "V002", "V003"],
        "Account Name": ["Alpha Ltd", "Alpha Ltd", "Beta Pvt", "Beta Pvt", "Gamma Inc"],
        "Debit":  ["0", "500", "1000", "0", "300"],
        "Credit": ["2000", "0", "0", "1500", "300"],
    })


@pytest.fixture
def vm_df():
    return pd.DataFrame({
        "Vendor Code": ["V001", "V002", "V003", "V004", "V005"],
        "Vendor Name": ["Alpha Ltd", "Beta Pvt Ltd", "Alpha Ltd", "Delta Co", "Epsilon"],
        "MSME Reg":    ["MICRO", "SMALL", "N", "MEDIUM", "N"],
        "GSTIN":       ["27AAAAA0000A1Z5", "INVALID", "", "29BBBBB1111B2Z6", "33CCCCC2222C3Z7"],
        "PAN":         ["AAAAA0000A", "BBBBB1111B", "", "CCCCC2222C", "DDDDD3333D"],
    })
