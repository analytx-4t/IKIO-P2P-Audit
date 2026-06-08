"""
Executive Dashboard — composes KPIs / charts / top-risks from all modules.
Numbers come from the already-computed module results (no re-computation).
"""

from __future__ import annotations


def run(results: dict) -> dict:
    """
    results: dict of {section_id: module_result}
    Returns the executive section payload.
    """
    po   = results.get("postatus",     {})
    ge   = results.get("gateentry",    {})
    qty  = results.get("qtyvariance",  {})
    pv   = results.get("pricevariance",{})
    gl   = results.get("glbalances",   {})
    aging= results.get("paymentaging", {})
    msme = results.get("msme",         {})
    vm   = results.get("vendormaster", {})
    gex  = results.get("grpoexcept",   {})
    tw   = results.get("threeway",     {})

    # ── KPIs ────────────────────────────────────────────────────────────────
    po_kpi    = po.get("kpis",   {})
    aging_kpi = aging.get("kpis", {})
    msme_kpi  = msme.get("kpis",  {})
    qty_kpi   = qty.get("kpis",   {})
    pv_kpi    = pv.get("kpis",    {})
    tw_kpi    = tw.get("kpis",    {})
    vm_kpi    = vm.get("kpis",    {})
    gl_kpi    = gl.get("kpis",    {})

    kpis = {
        "po_value_cr":      po_kpi.get("total_value_cr", 0),
        "open_value_cr":    po_kpi.get("open_value_cr", 0),
        "ap_outstanding_cr":gl_kpi.get("outstanding_cr", 0),
        "ap_invoices":      aging_kpi.get("total_invoices", 0),
        "msme_breaches":    msme_kpi.get("breaches", 0),
        "late_overdue":     aging_kpi.get("late", 0) + aging_kpi.get("overdue", 0),
        "qty_above_5pct":   qty_kpi.get("above_tol", 0),
        "savings_l":        pv_kpi.get("total_saving_l", 0),
        "threeway_perfect": tw_kpi.get("fully_matched", 0),
        "threeway_total":   tw_kpi.get("total_records", 0),
        "vendor_issues":    vm_kpi.get("duplicates", 0) + vm_kpi.get("missing_gstin", 0),
        "duplicates":       vm_kpi.get("duplicates", 0),
        "missing_gstin":    vm_kpi.get("missing_gstin", 0),
    }
    threeway_pct = (
        round(kpis["threeway_perfect"] / kpis["threeway_total"] * 100, 1)
        if kpis["threeway_total"] else 0.0
    )
    kpis["threeway_pct"] = threeway_pct

    # ── Charts — reuse precomputed ──────────────────────────────────────────
    po_chart   = po.get("charts",   {}).get("po_status", {})
    tw_chart   = tw.get("charts",   {}).get("match_donut", {})
    aging_bars = aging.get("charts",{}).get("aging_bars", [])

    charts = {
        "po_status":    po_chart,
        "three_way":    tw_chart,
        "payment_aging": aging_bars,
    }

    # ── Top 10 Risks ─────────────────────────────────────────────────────────
    top_risks = _build_top_risks(kpis, qty_kpi, msme_kpi, po_kpi, gl_kpi,
                                  tw_kpi, vm_kpi, aging_kpi, pv_kpi,
                                  ge.get("kpis", {}))

    return {
        "kpis":      kpis,
        "charts":    charts,
        "top_risks": top_risks,
    }


def _sev(label: str) -> str:
    return label.upper()


def _build_top_risks(kpis, qty, msme, po, gl, tw, vm, aging, pv, ge):
    risks = []

    qty_exc = qty.get("above_tol", 0)
    if qty_exc:
        risks.append({
            "id": "QTY-01", "risk": "Quantity Variance >5%",
            "magnitude": f"{qty_exc:,} PO lines",
            "severity": _sev("HIGH"),
            "action": "Investigate vendor delivery patterns; tighten GRN tolerance",
        })

    msme_b = msme.get("breaches", 0)
    if msme_b:
        risks.append({
            "id": "MSME-01", "risk": "MSME 45-Day Breach",
            "magnitude": f"{msme_b} invoices",
            "severity": _sev("CRITICAL"),
            "action": "Pay overdue MSE invoices; provision penal interest",
        })

    open_cr = po.get("open_value_cr", 0)
    if open_cr:
        risks.append({
            "id": "PR-01", "risk": "Open PO Value Exposure",
            "magnitude": f"₹{open_cr:.2f} Cr",
            "severity": _sev("HIGH"),
            "action": "Review aged open POs; close stale orders",
        })

    os_cr = gl.get("outstanding_cr", 0)
    if os_cr:
        risks.append({
            "id": "AP-01", "risk": "AP Outstanding",
            "magnitude": f"₹{os_cr:.2f} Cr",
            "severity": _sev("HIGH"),
            "action": "Reconcile and accelerate clearance of high-balance vendors",
        })

    tw_fail = (tw.get("total_records", 0) - tw.get("fully_matched", 0))
    if tw_fail:
        risks.append({
            "id": "3W-01", "risk": "3-Way Match Failure",
            "magnitude": f"{tw_fail:,} lines",
            "severity": _sev("HIGH"),
            "action": "Investigate Qty/Price variance before payment",
        })

    dups = vm.get("duplicates", 0)
    if dups:
        risks.append({
            "id": "VM-01", "risk": "Duplicate Vendors",
            "magnitude": f"{dups} cases",
            "severity": _sev("MEDIUM"),
            "action": "De-duplicate vendor master; block from new POs",
        })

    miss_gstin = vm.get("missing_gstin", 0)
    if miss_gstin:
        risks.append({
            "id": "VM-02", "risk": "Missing GSTIN",
            "magnitude": f"{miss_gstin} vendors",
            "severity": _sev("MEDIUM"),
            "action": "Collect GSTIN before next invoice or block ITC",
        })

    late_cnt = aging.get("late", 0) + aging.get("overdue", 0)
    if late_cnt:
        risks.append({
            "id": "PR-02", "risk": "Late / Overdue Payments",
            "magnitude": f"{late_cnt} invoices",
            "severity": _sev("MEDIUM"),
            "action": "Prioritise aged invoices; renegotiate terms",
        })

    savings_l = pv.get("total_saving_l", 0)
    if savings_l:
        risks.append({
            "id": "SAV-01", "risk": "Price Leakage Opportunity",
            "magnitude": f"₹{savings_l:.1f} L",
            "severity": _sev("LOW"),
            "action": "Consolidate to lowest-rate vendor where feasible",
        })

    ge_exc = ge.get("exceptions", 0)
    if ge_exc:
        risks.append({
            "id": "GE-01", "risk": "Gate-Entry Date Anomalies",
            "magnitude": f"{ge_exc} cases",
            "severity": _sev("LOW"),
            "action": "Investigate GE > GRPO date entries",
        })

    return risks[:10]
