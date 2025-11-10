"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function Attendance50DaysPage() {
  const router = useRouter();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [presentMap, setPresentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch students
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/50-days/students");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load students");
        setStudents(data.students || []);
      } catch (e) {
        setError(e.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, []);

  // Load attendance for chosen date
  useEffect(() => {
    const loadAttendance = async () => {
      setSuccess("");
      try {
        const res = await fetch(`/api/50-days/attendance?date=${date}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load attendance");
        const map = {};
        (data.attendance || []).forEach((r) => {
          map[r.student_id] = r.present;
        });
        setPresentMap(map);
      } catch (e) {
        setError(e.message || "Failed to load attendance");
      }
    };
    loadAttendance();
  }, [date]);

  const toggle = (id) => setPresentMap((m) => ({ ...m, [id]: !m[id] }));

  const onSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const rows = students.map((s) => ({
        student_id: s.id,
        present: !!presentMap[s.id],
      }));

      const res = await fetch("/api/50-days/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save attendance");

      setSuccess("Attendance saved.");
    } catch (e) {
      setError(e.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const totalPresent = useMemo(
    () => Object.values(presentMap).filter(Boolean).length,
    [presentMap]
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Attendance - 50 Days Session
        </h1>
        <button
          onClick={() => router.back()}
          className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <span className="text-sm text-gray-500">
            Present: {totalPresent} / {students.length}
          </span>
          <button
            onClick={() =>
              router.push("/admin/50-days/addstudentin50dayssession")
            }
            className="ml-auto text-sm px-3 py-2 rounded-lg border hover:bg-gray-50"
          >
            + Add Student
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-gray-500 text-sm">Loading students…</div>
        ) : students.length === 0 ? (
          <div className="text-gray-500 text-sm">
            No students yet. Add some first.
          </div>
        ) : (
          <ul className="divide-y">
            {students.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between">
  <div>
    <p className="font-medium text-gray-900">{s.name}</p>
    <p className="text-xs text-gray-500">
      {s.usn} • Cur: {s.current_streak} • Max: {s.highest_streak}
    </p>
  </div>
  <label className="inline-flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={!!presentMap[s.id]}
      onChange={() => toggle(s.id)}
      className="h-4 w-4"
    />
    <span className="text-sm">Present</span>
  </label>
</li>

            ))}
          </ul>
        )}

        <div className="pt-2">
          <button
            onClick={onSave}
            disabled={saving || loading}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Attendance"}
          </button>
          <button
            onClick={() => router.push("/admin/50-days/attendance-summary")}
            className="ml-4 text-sm px-3 py-2 rounded-lg border hover:bg-gray-50"
          >
            View Summary
          </button>
        </div>
      </div>
    </div>
  );
}
