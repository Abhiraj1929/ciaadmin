'use client'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AdminEnquiry() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  })
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  })
  const [selectedSubmissions, setSelectedSubmissions] = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchSubmissions()
  }, [pagination.page, pagination.limit, filters.status])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: filters.status
      })

      const response = await fetch(`/api/enquiry?${params}`)
      const result = await response.json()

      if (result.success) {
        setSubmissions(result.data.submissions)
        setPagination(prev => ({
          ...prev,
          total: result.data.total
        }))
      } else {
        setError(result.error || 'Failed to fetch submissions')
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateSubmissionStatus = async (id, newStatus) => {
    try {
      setActionLoading(true)
      
      const { error } = await supabase
        .from('contact_submissions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('Update error:', error)
        alert('Failed to update status')
        return
      }

      // Refresh submissions
      await fetchSubmissions()
      alert('Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('An error occurred while updating')
    } finally {
      setActionLoading(false)
    }
  }

  const bulkUpdateStatus = async (newStatus) => {
    if (selectedSubmissions.length === 0) {
      alert('Please select submissions first')
      return
    }

    try {
      setActionLoading(true)
      
      const { error } = await supabase
        .from('contact_submissions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedSubmissions)

      if (error) {
        console.error('Bulk update error:', error)
        alert('Failed to update submissions')
        return
      }

      setSelectedSubmissions([])
      await fetchSubmissions()
      alert(`${selectedSubmissions.length} submissions updated successfully`)
    } catch (error) {
      console.error('Error in bulk update:', error)
      alert('An error occurred during bulk update')
    } finally {
      setActionLoading(false)
    }
  }

  const deleteSubmission = async (id) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return
    }

    try {
      setActionLoading(true)
      
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Delete error:', error)
        alert('Failed to delete submission')
        return
      }

      await fetchSubmissions()
      alert('Submission deleted successfully')
    } catch (error) {
      console.error('Error deleting submission:', error)
      alert('An error occurred while deleting')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSubmissions(submissions.map(sub => sub.id))
    } else {
      setSelectedSubmissions([])
    }
  }

  const handleSelectSubmission = (id) => {
    setSelectedSubmissions(prev => 
      prev.includes(id) 
        ? prev.filter(subId => subId !== id)
        : [...prev, id]
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800'
      case 'read': return 'bg-yellow-100 text-yellow-800'
      case 'replied': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Enquiries</h1>
          <p className="text-gray-600 mt-1">
            {pagination.total} total submissions
          </p>
        </div>
        <button
          onClick={() => fetchSubmissions()}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Per Page:</label>
            <select
              value={pagination.limit}
              onChange={(e) => setPagination({...pagination, limit: parseInt(e.target.value), page: 1})}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSubmissions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedSubmissions.length} submissions selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => bulkUpdateStatus('read')}
                disabled={actionLoading}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
              >
                Mark as Read
              </button>
              <button
                onClick={() => bulkUpdateStatus('replied')}
                disabled={actionLoading}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                Mark as Replied
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions</h3>
            <p className="mt-1 text-sm text-gray-500">No contact submissions found with current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.length === submissions.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSubmissions.includes(submission.id)}
                        onChange={() => handleSelectSubmission(submission.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{submission.name}</div>
                        <div className="text-gray-500">{submission.email}</div>
                        {submission.phone && (
                          <div className="text-gray-500">{submission.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {submission.subject || 'No subject'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-sm">
                        <p className="line-clamp-2">{submission.message}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(submission.created_at).toLocaleDateString()}
                      <br />
                      <span className="text-xs">
                        {new Date(submission.created_at).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <select
                          value={submission.status}
                          onChange={(e) => updateSubmissionStatus(submission.id, e.target.value)}
                          disabled={actionLoading}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="unread">Unread</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                        </select>
                        <button
                          onClick={() => deleteSubmission(submission.id)}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Delete submission"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 border rounded text-sm ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
