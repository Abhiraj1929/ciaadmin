'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  })
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  })
  const [selectedMembers, setSelectedMembers] = useState([])

  useEffect(() => {
    fetchMembers()
  }, [pagination.page, pagination.limit, filters.status])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== undefined) {
        setPagination(prev => ({ ...prev, page: 1 }))
        fetchMembers()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [filters.search])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('Fetching members...')

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: filters.status,
        search: filters.search
      })

      const url = `/api/members?${params}`
      console.log('Fetching from:', url)

      const response = await fetch(url)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('API response:', result)

      if (result.success) {
        setMembers(result.data.members)
        setPagination(prev => ({
          ...prev,
          total: result.data.total
        }))
      } else {
        setError(result.error || 'Failed to fetch members')
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      setError('Failed to load members: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteMember = async (id, memberName) => {
    if (!confirm(`Are you sure you want to delete member "${memberName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleteLoading(true)

      const response = await fetch(`/api/members?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        alert('Member deleted successfully')
        await fetchMembers()
        setSelectedMembers(prev => prev.filter(selectedId => selectedId !== id))
      } else {
        alert('Failed to delete member: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting member:', error)
      alert('An error occurred while deleting member')
    } finally {
      setDeleteLoading(false)
    }
  }

  const bulkDeleteMembers = async () => {
    if (selectedMembers.length === 0) {
      alert('Please select members to delete')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedMembers.length} selected members? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleteLoading(true)
      
      const deletePromises = selectedMembers.map(id => 
        fetch(`/api/members?id=${id}`, { method: 'DELETE' })
      )

      const responses = await Promise.all(deletePromises)
      const results = await Promise.all(responses.map(r => r.json()))

      const successful = results.filter(r => r.success).length
      const failed = results.length - successful

      if (successful > 0) {
        alert(`${successful} members deleted successfully${failed > 0 ? `, ${failed} failed` : ''}`)
        await fetchMembers()
        setSelectedMembers([])
      } else {
        alert('Failed to delete any members')
      }
    } catch (error) {
      console.error('Error in bulk delete:', error)
      alert('An error occurred during bulk delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedMembers(members.map(member => member.id))
    } else {
      setSelectedMembers([])
    }
  }

  const handleSelectMember = (id) => {
    setSelectedMembers(prev => 
      prev.includes(id) 
        ? prev.filter(memberId => memberId !== id)
        : [...prev, id]
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'basic': return 'bg-blue-100 text-blue-800'
      case 'premium': return 'bg-purple-100 text-purple-800'
      case 'unlimited': return 'bg-gold-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Members Management</h1>
          <p className="text-gray-600 mt-1">
            {pagination.total} total members
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => fetchMembers()}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            🔄 Refresh
          </button>
          <Link 
            href="/admin/members/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ➕ Add Member
          </Link>
        </div>
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
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Search:</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search by name or email..."
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
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
      {selectedMembers.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-red-800 font-medium">
              {selectedMembers.length} members selected
            </span>
            <button
              onClick={bulkDeleteMembers}
              disabled={deleteLoading}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
            >
              {deleteLoading ? 'Deleting...' : '🗑️ Delete Selected'}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-500">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">Error Loading Members</h3>
              <div className="mt-2 text-sm">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => fetchMembers()}
                  className="bg-red-100 px-3 py-2 rounded text-sm hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search ? 'No members match your search criteria.' : 'No members have been added yet.'}
            </p>
            {!filters.search && (
              <div className="mt-6">
                <Link
                  href="/admin/members/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  ➕ Add First Member
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedMembers.length === members.length && members.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => handleSelectMember(member.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {member.name?.charAt(0).toUpperCase() || 'M'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {member.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{member.email}</div>
                      {member.phone && (
                        <div className="text-sm text-gray-500">{member.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 capitalize">
                        {member.role || 'member'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccessLevelColor(member.access_level)}`}>
                        {member.access_level || 'basic'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(member.created_at).toLocaleDateString()}
                      <br />
                      <span className="text-xs">
                        {new Date(member.created_at).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteMember(member.id, member.name)}
                        disabled={deleteLoading}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Delete member"
                      >
                        🗑️
                      </button>
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
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
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
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
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
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
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
