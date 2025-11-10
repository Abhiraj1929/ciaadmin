'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AttendanceSummaryPage() {
  const router = useRouter()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [students, setStudents] = useState([])
  const [attendanceRows, setAttendanceRows] = useState([]) // [{ student_id, present }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load students once
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/50-days/students')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load students')
        setStudents(data.students || [])
      } catch (e) {
        setError(e.message || 'Failed to load students')
      } finally {
        setLoading(false)
      }
    }
    loadStudents()
  }, [])

  // Load attendance when date changes
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const res = await fetch(`/api/50-days/attendance?date=${date}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load attendance')
        setAttendanceRows(data.attendance || [])
      } catch (e) {
        setError(e.message || 'Failed to load attendance')
      }
    }
    loadAttendance()
  }, [date])

  // Build lookups
  const presentIdSet = useMemo(() => {
    const s = new Set()
    for (const row of attendanceRows) if (row.present) s.add(row.student_id)
    return s
  }, [attendanceRows])

  const presentStudents = useMemo(
    () => students.filter((s) => presentIdSet.has(s.id)),
    [students, presentIdSet]
  )

  const absentStudents = useMemo(() => {
    // A student is absent if they exist in students but not in presentIdSet
    const present = presentIdSet
    return students.filter((s) => !present.has(s.id))
  }, [students, presentIdSet])

  const counts = {
    total: students.length,
    present: presentStudents.length,
    absent: absentStudents.length,
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Attendance Summary - 50 Days Session</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/admin/50-days/attendance')} className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50">
            ← Mark Attendance
          </button>
          <button onClick={() => router.back()} className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50">
            Back
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6 space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />

          <div className="ml-auto flex flex-wrap gap-2">
            <Chip label={`Total: ${counts.total}`} />
            <Chip label={`Present: ${counts.present}`} tone="green" />
            <Chip label={`Absent: ${counts.absent}`} tone="red" />
          </div>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</div>}

        {loading ? (
          <div className="text-gray-500 text-sm">Loading…</div>
        ) : students.length === 0 ? (
          <div className="text-gray-500 text-sm">No students yet. Add students first.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Present list */}
            <div className="border rounded-lg">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-900">Present ({counts.present})</h2>
              </div>
              {presentStudents.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No one marked present for {date}.</div>
              ) : (
                <ul className="divide-y">
                  {presentStudents.map((s) => (
                    <li key={s.id} className="px-4 py-3">
                      <p className="font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.usn}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Absent list */}
            <div className="border rounded-lg">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-900">Absent ({counts.absent})</h2>
              </div>
              {absentStudents.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No absentees for {date} 🎉</div>
              ) : (
                <ul className="divide-y">
                  {absentStudents.map((s) => (
                    <li key={s.id} className="px-4 py-3">
                      <p className="font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.usn}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Chip({ label, tone }) {
  const tones = {
    green: 'bg-green-100 text-green-700 border-green-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
  }
  const cls = tones[tone] || tones.default
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${cls}`}>{label}</span>
}
