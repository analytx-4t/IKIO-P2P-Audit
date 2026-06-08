import React from 'react'

const GLOSSARY = [
  { term: 'PO',          def: 'Purchase Order – buyer\'s formal request to supply goods or services.' },
  { term: 'GRPO',        def: 'Goods Receipt against PO – the receiving document booked when goods enter stock.' },
  { term: 'Gate Entry',  def: 'Security record at the factory gate when material physically arrives.' },
  { term: 'AP Invoice',  def: 'Accounts Payable Invoice – supplier\'s bill, posted in accounts.' },
  { term: 'GL',          def: 'General Ledger – chronological record of every accounting transaction.' },
  { term: 'GSTIN',       def: '15-character Goods & Services Tax Identification Number.' },
  { term: 'PAN',         def: '10-character Permanent Account Number (Income-Tax).' },
  { term: 'MSME',        def: 'Micro, Small and Medium Enterprise – per MSMED Act, 2006.' },
  { term: 'FIFO',        def: 'First-In-First-Out – matching the earliest invoice to the earliest payment.' },
  { term: '3-Way Match', def: 'Reconciliation of PO ↔ GRPO ↔ Invoice for Qty and Price.' },
  { term: 'Variance %',  def: '( Difference ÷ Original Value ) × 100 — expressed as a percentage.' },
  { term: 'Aging Bucket',def: 'Range of days an invoice has been pending past due date.' },
  { term: 'NIL Balance', def: 'A vendor for whom Total Credit equals Total Debit – fully paid.' },
  { term: 'Days Late',   def: 'Whole-number difference between Payment Date and Due Date (no decimals).' },
]

const REGULATIONS = [
  { title: 'MSMED Act, 2006, Sections 15 & 16', desc: '45-day payment rule and compound interest for MSEs.' },
  { title: 'CGST Act, 2017', desc: 'Levy of tax, ITC eligibility, tax invoice format.' },
  { title: 'Income-Tax Act, 1961, Section 206AA', desc: 'Higher TDS rate where PAN is not furnished.' },
  { title: 'Companies Act, 2013, Section 143', desc: 'Auditor responsibility on internal financial controls.' },
  { title: 'CARO 2020, Clause 3(ii)(b)', desc: 'Auditor reporting on inventory and procurement controls.' },
  { title: 'RBI Master Direction on Bank Rate', desc: 'Reference rate for MSME penal interest (3 × Bank Rate).' },
]

export default function Appendix() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Appendix &amp; Technical Notes</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Methodology, data sources, and risk legend for the IKIO P2P Audit</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Risk Legend */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Risk Classification Legend</h3>
          <div className="space-y-2 text-sm">
            {[
              { level: 'High Risk',    color: 'rose',  desc: 'Critical exceptions needing immediate action (e.g., 45-day MSME breaches, invoice without GE)' },
              { level: 'Medium Risk',  color: 'amber', desc: 'Significant data gaps requiring process improvement (e.g., missing GSTIN/PAN, rate mismatches)' },
              { level: 'Monitor',      color: 'blue',  desc: 'Trends to track over time (e.g., early payment by SME category, payment aging distribution)' },
            ].map(r => (
              <div key={r.level} className={`flex items-center gap-3 p-2 rounded-lg bg-${r.color}-50 dark:bg-${r.color}-900/20`}>
                <span className={`w-2 h-2 rounded-full bg-${r.color}-500 shrink-0`} />
                <div>
                  <span className={`font-medium text-${r.color}-700 dark:text-${r.color}-300`}>{r.level}</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Data Sources</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'PO Data',        name: 'Purchase Orders' },
              { label: 'GRPO Data',      name: 'Goods Receipt PO' },
              { label: 'Invoice Data',   name: 'Invoice Register' },
              { label: 'Gate Entry Data',name: 'Gate Entry Log' },
              { label: 'Vendor Master',  name: 'Vendor Database' },
              { label: 'GL Balances',    name: 'General Ledger' },
            ].map(d => (
              <div key={d.label} className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-1.5">
                <span className="text-slate-600 dark:text-slate-400">{d.label}</span>
                <span className="text-slate-900 dark:text-white font-medium">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Methodology */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Audit Methodology</h3>
        <div className="space-y-5">
          {[
            { n:1, title:'Data Extraction', body:'All six ERP datasets (PO, GRPO, GE, Purchase Register, GL, Vendor Master) loaded as-uploaded.' },
            { n:2, title:'Cleaning & Normalisation', bullets:[
              'Dates parsed in dd-mm-yyyy.',
              'Vendor names normalised (lowercase, suffix-stripped) for duplicate detection.',
              'GSTIN validated against the 15-character standard.',
              'General Ledger nested header rows parsed into flat transaction list.',
              'Payment Delay Days rounded to whole integers (no decimal points).',
            ]},
            { n:3, title:'Analysis Rules', bullets:[
              'Variance threshold: 5% for both quantity and price.',
              'Quantity bucketing: 0–5% (within tolerance) and >5% (out of tolerance).',
              'Goods vs Services classification by Item Code prefix.',
              'FIFO payment matching for invoice ↔ payment linkage.',
              'MSME 45-day breach computed per MSMED Act §16.',
            ]},
            { n:5, title:'Limitations', bullets:[
              'Analysis is based on uploaded data; transactions after the snapshot are not reflected.',
              'MSME penalty uses an indicative 27% p.a. rate (3 × RBI Bank Rate of 9%).',
              'Service-line classification assumes Item Codes follow the documented prefix convention.',
            ]},
          ].map(step => (
            <div key={step.n} className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step.n}</div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{step.title}</div>
                {step.body && <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{step.body}</p>}
                {step.bullets && (
                  <ul className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-0.5 list-none">
                    {step.bullets.map(b => (
                      <li key={b} className="flex gap-1.5"><span className="text-brand-500 font-bold">•</span>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Glossary */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Glossary of Terms</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase w-36">Term</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase">Definition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {GLOSSARY.map(g => (
                <tr key={g.term} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white text-xs">{g.term}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-[11px]">{g.def}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regulatory References */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Regulatory References</h3>
        <div className="space-y-2.5">
          {REGULATIONS.map(r => (
            <div key={r.title} className="flex gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <span className="text-brand-500 font-bold text-xs mt-0.5 shrink-0">•</span>
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white">{r.title}</span>
                <span className="text-xs text-slate-600 dark:text-slate-400"> — {r.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Report Preparation Notes</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Data Period:</span> FY 2025-26 (January 2026 to March 2026).
        </p>
      </div>
    </>
  )
}
