import React from 'react'
import { useStore } from '../store'
import logo from '../assets/logo.jpeg'

export default function LoadingPage() {
  const { progress } = useStore()
  const { pct = 0, message = 'Preparing data…' } = progress

  return (
    <div className="app-bg flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-6">
          <img src={logo} alt="IKIO" className="w-20 h-20 object-contain mx-auto" />
        </div>

        <div className="relative w-24 h-24 mx-auto mb-8">
          <svg className="spinner w-24 h-24" viewBox="0 0 100 100">
            <circle className="stroke-slate-200 dark:stroke-slate-800" cx="50" cy="50" r="42" fill="none" strokeWidth="6" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#ea580c" strokeWidth="6"
              strokeLinecap="round" strokeDasharray="200 65" strokeDashoffset="0" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold app-title">{pct}%</span>
          </div>
        </div>

        <h2 className="text-xl font-semibold app-title mb-2">Processing Audit Data</h2>
        <p className="text-sm app-muted mb-2">Analyzing P2P transactions and generating insights…</p>
        <p className="text-xs app-faint mb-6">{message}</p>

        <div className="w-72 mx-auto app-track rounded-full h-2 overflow-hidden">
          <div
            className="progress-bar h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
