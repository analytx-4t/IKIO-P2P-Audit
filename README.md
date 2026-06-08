# IKIO P2P Audit Dashboard

Full-stack procure-to-pay audit tool — React + FastAPI.

## Architecture

```
backend/   FastAPI (Python) — pandas analysis, SSE progress, AI insights
frontend/  React + Vite + Tailwind — identical UI to the original index.html
```

---

## Prerequisites

| Tool    | Version |
|---------|---------|
| Python  | 3.10+   |
| Node.js | 18+     |
| npm     | 9+      |

---

## Setup

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Set your Anthropic API key (optional — AI narrative only):

```bash
# Windows PowerShell
$env:ANTHROPIC_API_KEY = "sk-ant-..."

# macOS/Linux
export ANTHROPIC_API_KEY="sk-ant-..."
```

Start the server:

```bash
uvicorn app.main:app --reload --port 8000
```

API is live at `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App opens at `http://localhost:5173`.

---

## Uploading Files

The dashboard expects up to **6 Excel / CSV files** mapped to these roles:

| Role key             | Upload label         | Contents                               |
|----------------------|----------------------|----------------------------------------|
| `vendor_master`      | Vendor Master Sheet  | Vendor code, name, MSME reg, GSTIN, PAN |
| `purchase_order`     | Purchase Order       | PO lines, qty, price, open qty         |
| `gate_entry`         | Gate Entry Report    | GE date, linked GRPO, vendor bill date |
| `grpo`               | GRPO Report          | Goods receipts vs PO                   |
| `purchase_register`  | Purchase Register    | AP invoices, due dates, payment dates  |
| `general_ledger`     | General Ledger       | Vendor debit / credit movements        |

You can upload **any subset** — sections whose source file is missing will show an empty state.

---

## Column Normalisation

Column headers are detected automatically via hundreds of aliases in `backend/app/config.py → COLUMN_ALIASES`. If a required column is missing the API returns a clear error message listing expected aliases.

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

---

## API Endpoints

| Method | Path                          | Description                        |
|--------|-------------------------------|------------------------------------|
| POST   | `/api/upload`                 | Upload files; returns `session_id` |
| GET    | `/api/analyze/{session_id}`   | SSE stream: progress + final result|
| POST   | `/api/insights/{section}`     | AI narrative for a section         |
| GET    | `/api/result/{session_id}`    | Re-fetch stored result             |
| GET    | `/api/health`                 | Health check                       |

---

## Analysis Modules

| ID  | Module           | Rule                                            |
|-----|------------------|-------------------------------------------------|
| A   | po_status        | OPEN/CLOSED by Open Qty > 0                     |
| B   | gate_entry       | Bill ≤ GE ≤ GRPO ≤ AP date sequence             |
| C   | qty_variance     | (PO−Received)/PO; 0–5% OK, >5% flag             |
| D/E | price_variance   | (Max−Min)/Max per item; savings = (Avg−Min)×Qty |
| F   | gl_balances      | Net = Credit − Debit per vendor                 |
| G   | payment_aging    | Days Late buckets; FIFO invoice matching        |
| H   | msme             | 45-day limit for Micro/Small; 27% p.a. penalty  |
| I   | vendor_master    | Duplicate names, invalid GSTIN/PAN              |
| J   | three_way        | PO ↔ GRPO ↔ Invoice within 5% tolerance        |

---

## Configuration Constants (`backend/app/config.py`)

```python
VARIANCE_TOLERANCE_PCT  = 5.0   # qty & price threshold
MSME_PAYMENT_LIMIT_DAYS = 45    # MSMED Act §16
MSME_PENALTY_RATE_PA    = 0.27  # 27% p.a. (3× RBI Bank Rate 9%)
SERVICES_ITEM_PREFIX    = "SV"  # Item code prefix for services
```
