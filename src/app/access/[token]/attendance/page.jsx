'use client'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function AttendancePublicPage() {
  const { token } = useParams()
  const router = useRouter()

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [students, setStudents] = useState([])
  const [presentMap, setPresentMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/access/students', { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load students')
        setStudents(data.students || [])
      } catch (e) {
        setMsg({ type: 'error', text: e.message })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  useEffect(() => {
    const load = async () => {
      setMsg({})
      try {
        const res = await fetch(`/api/access/attendance?date=${date}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load attendance')
        const map = {}; (data.attendance||[]).forEach(r=>{ map[r.student_id]=r.present })
        setPresentMap(map)
      } catch (e) {
        setMsg({ type: 'error', text: e.message })
      }
    }
    load()
  }, [token, date])

  const toggle = (id) => setPresentMap((m)=>({ ...m, [id]: !m[id] }))

  const onSave = async () => {
    setSaving(true); setMsg({})
    try {
      const rows = students.map(s=>({ student_id: s.id, present: !!presentMap[s.id] }))
      const res = await fetch('/api/access/attendance', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ date, rows })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save attendance')
      setMsg({ type: 'success', text: 'Attendance saved.' })
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    } finally {
      setSaving(false)
    }
  }

  const totalPresent = useMemo(()=>Object.values(presentMap).filter(Boolean).length,[presentMap])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Attendance (Public Link)</h1>
        <button onClick={()=>router.push(`/access/${token}/add-student`)} className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50">
          + Add Student
        </button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Date</label>
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm"/>
          <span className="text-sm text-gray-500">Present: {totalPresent} / {students.length}</span>
        </div>

        {msg.text && (
          <div className={`text-sm rounded p-3 border ${msg.type==='success'?'text-green-700 bg-green-50 border-green-200':'text-red-600 bg-red-50 border-red-200'}`}>
            {msg.text}
          </div>
        )}

        {loading ? (
          <div className="text-gray-500 text-sm">Loading students…</div>
        ) : students.length === 0 ? (
          <div className="text-gray-500 text-sm">No students yet.</div>
        ) : (
          <ul className="divide-y">
            {students.map((s)=>(
              <li key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.usn} • Cur: {s.current_streak} • Max: {s.highest_streak}</p>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!presentMap[s.id]} onChange={()=>toggle(s.id)} className="h-4 w-4"/>
                  <span className="text-sm">Present</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <div className="pt-2">
          <button onClick={onSave} disabled={saving || loading} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60">
            {saving?'Saving…':'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  )
}
