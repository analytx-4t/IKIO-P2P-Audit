import React from 'react'

const SOURCE_FILES = [
  { file: 'Purchase_Order.xlsx',    purpose: 'Open & Closed POs',         records: '7,250',  keys: 'PO No, Vendor, Item, Qty, Price, Open Qty' },
  { file: 'GRPO_REPORT.xlsx',       purpose: 'Goods Receipts vs PO',      records: '12,384', keys: 'GRPO No, Gate Entry No, Vendor, Qty, Rate' },
  { file: 'Gate_Entry_Report.xlsx', purpose: 'Security gate entries',     records: '2,323',  keys: 'GE No, Vendor Bill No/Date, Linked GRPO' },
  { file: 'Purchase_Register.xlsx', purpose: 'AP invoices booked',        records: '9,997',  keys: 'Invoice No, PO No, Date, GST values' },
  { file: 'General_Ledger.xlsx',    purpose: 'Vendor ledger movements',   records: '4,211',  keys: 'Vendor, Debit, Credit, Payment Date' },
  { file: 'Vendor_Master.xlsx',     purpose: 'Vendor master data',        records: '1,498',  keys: 'Vendor Code, Name, MSME Reg, GSTIN' },
]

const JOINS = [
  { id: 'J1', a: 'PO',           b: 'GRPO',         key: 'Doc No = PO No' },
  { id: 'J2', a: 'GRPO',         b: 'Gate Entry',   key: 'GRPO No = GE Doc No' },
  { id: 'J3', a: 'GRPO',         b: 'Purchase Reg', key: 'AP No = pchoice No' },
  { id: 'J4', a: 'Purchase Reg', b: 'GL',           key: 'Inv Ref + Vendor + Date' },
  { id: 'J5', a: 'All Trans',    b: 'Vendor Master',key: 'Vendor Code' },
  { id: 'J6', a: 'Item x Vendors',b:'Itself',       key: 'Item No' },
]

const AUDIT_RULES = [
  { id:'A', title:'PO Status',       desc:'OPEN vs CLOSED by Open Qty' },
  { id:'B', title:'Date Sequence',   desc:'Bill ≤ GE ≤ GRPO ≤ AP' },
  { id:'C', title:'Qty Variance',    desc:'0-5% tolerance; >5% review' },
  { id:'D', title:'Price Variance',  desc:'Max-Min spread >5% per item' },
  { id:'E', title:'Savings',         desc:'(Avg-Min) x Total Qty' },
  { id:'F', title:'Vendor Balance',  desc:'Net = Credit - Debit' },
  { id:'G', title:'Payment Aging',   desc:'Days Late = Paid - Due' },
  { id:'H', title:'MSME Breach',     desc:'Delay >45 for Micro+Small' },
  { id:'I', title:'Vendor Quality',  desc:'Dup / Missing GSTIN/PAN' },
  { id:'J', title:'3-Way Match',     desc:'PO/GRPO/Inv 5% tolerance' },
]

const PROCESS_FLOW = [
  { n:1, c:'brand', title:'Purchase Order',    desc:'Buyer raises PO on vendor' },
  { n:2, c:'brand', title:'Gate Entry',         desc:'Security records truck arrival' },
  { n:3, c:'brand', title:'GRPO',               desc:'Goods receipt booked; stock updated' },
  { n:4, c:'indigo', title:'AP Invoice',         desc:'Invoice posted against GRPO' },
  { n:5, c:'indigo', title:'Payment (GL)',        desc:'Treasury releases payment' },
  { n:6, c:'slate', title:'Reconciliation',      desc:'3-way match verification' },
]

export default function DataMap() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold app-title">Data Map, Joins &amp; Audit Logic</h2>
        <p className="text-sm app-muted mt-0.5">Source files, process flow, table joins, and audit rules</p>
      </div>

      {/* Source Files */}
      <div className="app-card rounded-xl border overflow-hidden mb-6">
        <div className="px-6 py-4 border-b app-divider">
          <h3 className="text-sm font-semibold app-title">Source Files Used in Audit</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="app-subtle">
              <tr>
                {['File','Purpose','Records','Key Columns'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold app-label uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {SOURCE_FILES.map(r => (
                <tr key={r.file}>
                  <td className="px-4 py-3 font-medium app-title text-[11px]">{r.file}</td>
                  <td className="px-4 py-3 app-muted text-[11px]">{r.purpose}</td>
                  <td className="px-4 py-3 text-right font-semibold dark:text-white text-[11px]">{r.records}</td>
                  <td className="px-4 py-3 app-muted text-[11px] hidden lg:table-cell">{r.keys}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* P2P Process Flow */}
        <div className="app-card rounded-xl border p-5">
          <h3 className="text-sm font-semibold app-title mb-3">P2P Process Flow</h3>
          <div className="space-y-2">
            {PROCESS_FLOW.map(s => {
              const bg = s.c === 'brand' ? 'bg-brand-600' : s.c === 'indigo' ? 'bg-indigo-500' : 'bg-slate-500'
              return (
                <div key={s.n} className="flex items-center gap-3 p-2 app-subtle rounded-lg">
                  <span className={`w-6 h-6 rounded-full ${bg} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>{s.n}</span>
                  <div>
                    <div className="text-xs font-semibold app-title">{s.title}</div>
                    <div className="text-[10px] app-muted">{s.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Joins */}
        <div className="app-card rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b app-divider">
            <h3 className="text-sm font-semibold app-title">Table-to-Table Joins</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="app-subtle">
                <tr>
                  {['ID','A','B','Key'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] font-semibold app-label uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {JOINS.map(j => (
                  <tr key={j.id}>
                    <td className="px-4 py-2"><span className="text-xs font-semibold text-brand-600">{j.id}</span></td>
                    <td className="px-4 py-2 text-[11px] app-title">{j.a}</td>
                    <td className="px-4 py-2 text-[11px] app-muted">{j.b}</td>
                    <td className="px-4 py-2 text-[11px] app-muted font-mono hidden md:table-cell">{j.key}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Logic */}
      <div className="app-card rounded-xl border p-5">
        <h3 className="text-sm font-semibold app-title mb-3">Audit Logic Applied (A-J)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AUDIT_RULES.map(r => (
            <div key={r.id} className="flex items-start gap-2 p-2 rounded app-subtle">
              <span className="w-5 h-5 rounded bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{r.id}</span>
              <div>
                <div className="text-xs font-semibold app-title">{r.title}</div>
                <div className="text-[10px] app-muted">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
