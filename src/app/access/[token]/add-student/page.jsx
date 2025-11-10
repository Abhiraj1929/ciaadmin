'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AddStudentPublicPage() {
  const { token } = useParams() // URL param
  const router = useRouter()
  const [form, setForm] = useState({ name: '', usn: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setMsg({})

    try {
      const res = await fetch('/api/access/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name.trim(), usn: form.usn.trim().toUpperCase() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMsg({ type: 'success', text: 'Student added!' })
      setForm({ name: '', usn: '' })
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Add Student (Public Link)</h1>
        <button onClick={() => router.push(`/access/${token}/attendance`)} className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50">
          → Attendance
        </button>
      </div>

      {msg.text && (
        <div className={`mb-3 text-sm rounded p-3 border ${msg.type==='success'?'text-green-700 bg-green-50 border-green-200':'text-red-600 bg-red-50 border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={onSubmit} className="bg-white rounded-lg border shadow-sm p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            value={form.name}
            onChange={(e)=>setForm(f=>({...f,name:e.target.value}))}
            required className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Student name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">USN *</label>
          <input
            value={form.usn}
            onChange={(e)=>setForm(f=>({...f,usn:e.target.value.toUpperCase()}))}
            required className="mt-1 w-full rounded-lg border px-3 py-2 uppercase"
            placeholder="e.g., 1AT23CS001" pattern="[A-Za-z0-9]+"
            title="Alphanumeric only"
          />
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
          {loading?'Saving…':'Save Student'}
        </button>
      </form>
    </div>
  )
}
