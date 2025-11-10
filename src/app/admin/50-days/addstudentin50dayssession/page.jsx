'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddStudentIn50DaysSessionPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', usn: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // simple alphanumeric check for USN
      if (!/^[a-zA-Z0-9]+$/.test(form.usn)) {
        throw new Error('USN must be alphanumeric.')
      }

      const res = await fetch('/api/50-days/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), usn: form.usn.trim().toUpperCase() })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add student')

      setSuccess('Student added successfully.')
      setForm({ name: '', usn: '' })
    } catch (err) {
      setError(err.message || 'Failed to add student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Add Student - 50 Days Session</h1>
        <button onClick={() => router.back()} className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50">← Back</button>
      </div>

      {error && <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</div>}
      {success && <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">{success}</div>}

      <form onSubmit={onSubmit} className="bg-white rounded-lg border shadow-sm p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            name="name"
            required
            value={form.name}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Student name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">USN *</label>
          <input
            name="usn"
            required
            value={form.usn}
            onChange={(e) => onChange({ target: { name: 'usn', value: e.target.value.toUpperCase() } })}
            className="mt-1 w-full rounded-lg border px-3 py-2 uppercase"
            placeholder="e.g., 1AT23CS001"
            pattern="[A-Za-z0-9]+"
            title="Alphanumeric only"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Save Student'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/50-days/attendance')}
            className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50"
          >
            Go to Attendance
          </button>
        </div>
      </form>
    </div>
  )
}
