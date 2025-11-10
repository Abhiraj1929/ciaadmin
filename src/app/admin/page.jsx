'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refreshData = () => {
    try {
      setLoading(true)
      setError('')
    } catch (e) {
      setError('Unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={refreshData}
            className="flex-1 sm:flex-none bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 text-sm transition-colors duration-200"
            aria-label="Refresh dashboard data"
          >
            <span className="inline-flex items-center gap-2">
              <span>🔄</span>
              <span className="hidden sm:inline">Refresh</span>
            </span>
          </button>
        </div>
      </div>

      {/* Optional Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 sm:px-6 py-4 rounded-lg">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <span className="text-lg shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm sm:text-base">Notice</p>
              <p className="text-xs sm:text-sm mt-1 break-words">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards (placeholders) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard title="Total" value={0} icon="📊" bgColor="bg-blue-100" textColor="text-gray-900" iconColor="text-blue-600" />
        <StatCard title="Active" value={0} icon="✅" bgColor="bg-green-100" textColor="text-green-600" iconColor="text-green-600" />
        <StatCard title="Pending" value={0} icon="⏳" bgColor="bg-yellow-100" textColor="text-yellow-600" iconColor="text-yellow-600" />
        <StatCard title="Inactive" value={0} icon="❌" bgColor="bg-red-100" textColor="text-red-600" iconColor="text-red-600" />
      </div>

      {/* 50 Days Session */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">50 Days Session</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/50-days/addstudentin50dayssession"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200"
            >
              <span>➕</span>
              <span>Add Student</span>
            </Link>
            <Link
              href="/admin/50-days/attendance"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors duration-200"
            >
              <span>🗓️</span>
              <span>Attendance</span>
            </Link>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 text-sm text-gray-600">
          <p className="mb-2">
            Use the buttons above to add student details for this 50-day program or record daily attendance.
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, bgColor, textColor, iconColor }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${textColor} mt-1`}>{value}</p>
        </div>
        <div className={`${bgColor} p-2 sm:p-3 rounded-full shrink-0`}>
          <span className={`${iconColor} text-base sm:text-xl`} role="img" aria-label={title}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  )
}
