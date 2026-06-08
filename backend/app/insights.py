"""
AI narrative generation via Anthropic Claude.

Only generates prose — never numbers. The computed KPIs are passed as
context; the model is instructed not to invent or alter any figure.
"""

from __future__ import annotations

import os
import json
from typing import Optional

ANTHROPIC_AVAILABLE = False
try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    pass

_client: Optional["anthropic.Anthropic"] = None


def _get_client():
    global _client
    if _client is None and ANTHROPIC_AVAILABLE:
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if api_key:
            _client = anthropic.Anthropic(api_key=api_key)
    return _client


_SYSTEM_PROMPT = (
    "You are a professional procurement auditor writing concise insights for "
    "an internal audit report. You will be given computed KPIs and findings. "
    "Write 2-4 sentences of clear, actionable prose. "
    "DO NOT invent, alter, or contradict any number provided to you. "
    "Use plain English; no bullet points. Output plain text only."
)


def generate_section_insight(section: str, kpis: dict) -> str:
    """Return a short narrative paragraph for a dashboard section."""
    client = _get_client()
    if client is None:
        return ""

    kpi_text = json.dumps(kpis, indent=2, default=str)
    prompt = (
        f"Section: {section}\n\n"
        f"Computed findings:\n{kpi_text}\n\n"
        "Write a 2-4 sentence audit insight summarising the key risk or finding."
    )
    try:
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            system=_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
        return msg.content[0].text.strip()
    except Exception:
        return ""


def generate_executive_summary(kpis: dict, top_risks: list) -> str:
    """Return a 3-5 sentence executive summary."""
    client = _get_client()
    if client is None:
        return ""

    payload = {"kpis": kpis, "top_risks": top_risks[:5]}
    kpi_text = json.dumps(payload, indent=2, default=str)
    prompt = (
        f"Computed executive findings:\n{kpi_text}\n\n"
        "Write a 3-5 sentence executive summary for a P2P audit report. "
        "Mention the most critical risks by name and quantify using the "
        "exact numbers provided."
    )
    try:
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=500,
            system=_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
        return msg.content[0].text.strip()
    except Exception:
        return ""
