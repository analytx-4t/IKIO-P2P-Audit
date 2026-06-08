import React, { useState, useRef } from 'react'
import { uploadFiles, analyzeStream } from '../api'
import { useStore } from '../store'
import logo from '../assets/logo.jpeg'

const FILE_SLOTS = [
  { role: 'vendor_master',    label: 'Vendor Master Sheet',  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { role: 'purchase_order',   label: 'Purchase Order',       icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { role: 'gate_entry',       label: 'Gate Entry Report',    icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3' },
  { role: 'grpo',             label: 'GRPO Report',          icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { role: 'purchase_register',label: 'Purchase Register',    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { role: 'general_ledger',   label: 'General Ledger',       icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
]

export default function UploadPage() {
  const { setPage, setSessionId, setResults, setProgress } = useStore()
  const [uploaded, setUploaded] = useState({})  // role → File
  const [error, setError] = useState('')
  const inputRefs = useRef({})

  const handleFile = (role, file) => {
    if (!file) return
    setUploaded(prev => ({ ...prev, [role]: file }))
  }

  const handleDrop = (role, e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('dragover')
    const file = e.dataTransfer.files[0]
    if (file) handleFile(role, file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('dragover')
  }

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragover')
  }

  const fileCount = Object.keys(uploaded).length
  const canSubmit = fileCount > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setError('')
    try {
      const items = Object.entries(uploaded).map(([role, file]) => ({ role, file }))
      const { session_id } = await uploadFiles(items)
      setSessionId(session_id)
      setPage('loading')

      analyzeStream(session_id, {
        onProgress: ({ pct, message }) => setProgress({ pct, message }),
        onResult: (result) => {
          setResults(result)
          setPage('dashboard')
        },
        onError: (msg) => {
          setError(msg)
          setPage('upload')
        },
      })
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="app-gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-32 h-32 mb-4">
            <img src={logo} alt="IKIO" className="w-28 h-28 object-contain" />
          </div>
          <h1 className="text-3xl font-bold app-title tracking-tight">
            Upload Procurement Audit Data Files
          </h1>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 mb-8">
          {FILE_SLOTS.map(({ role, label, icon }) => {
            const file = uploaded[role]
            return (
              <div
                key={role}
                className="upload-zone group app-card border-2 border-dashed hover:border-orange-500 rounded-xl p-5 cursor-pointer transition-all shadow-sm hover:shadow-md"
                onClick={() => inputRefs.current[role]?.click()}
                onDrop={e => handleDrop(role, e)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  ref={el => inputRefs.current[role] = el}
                  onChange={e => handleFile(role, e.target.files[0])}
                />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg app-subtle flex items-center justify-center flex-shrink-0">
                    {file ? (
                      <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.086l3.75-5.25z" clipRule="evenodd"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 app-faint" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium app-title">{label}</div>
                    {file ? (
                      <div className="text-xs text-emerald-500 truncate">{file.name}</div>
                    ) : (
                      <div className="text-xs app-faint">Click to upload (.xlsx, .xls, .csv)</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="text-xs app-muted">
            <span>{fileCount}</span> / 6 files uploaded
          </div>
          <button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-600/25"
          >
            Submit &amp; Analyze
          </button>
        </div>
      </div>
    </div>
  )
}
