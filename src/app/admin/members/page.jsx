'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import MembersHeader from './components/MembersHeader'
import MembersFilters from './components/MembersFilters'
import BulkActions from './components/BulkActions'
import ErrorMessage from './components/ErrorMessage'
import MembersTable from './components/MembersTable'
import LoadingSpinner from './components/LoadingSpinner'
import Pagination from './components/Pagination'
import { useMembersData } from '../../../hooks/useMembersData'

export default function AdminMembers() {
  const {
    members,
    loading,
    error,
    deleteLoading,
    pagination,
    filters,
    selectedMembers,
    setPagination,
    setFilters,
    setSelectedMembers,
    fetchMembers,
    deleteMember,
    bulkDeleteMembers
  } = useMembersData()

  return (
    <div className="space-y-6">
      <MembersHeader 
        totalMembers={pagination.total}
        onRefresh={fetchMembers}
        loading={loading}
      />

      <MembersFilters 
        filters={filters}
        pagination={pagination}
        onFiltersChange={setFilters}
        onPaginationChange={setPagination}
      />

      <BulkActions 
        selectedMembers={selectedMembers}
        onBulkDelete={bulkDeleteMembers}
        deleteLoading={deleteLoading}
      />

      <ErrorMessage 
        error={error}
        onRetry={fetchMembers}
      />

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <MembersTable 
            members={members}
            selectedMembers={selectedMembers}
            onSelectAll={(checked) => {
              if (checked) {
                setSelectedMembers(members.map(member => member.id))
              } else {
                setSelectedMembers([])
              }
            }}
            onSelectMember={(id) => {
              setSelectedMembers(prev => 
                prev.includes(id) 
                  ? prev.filter(memberId => memberId !== id)
                  : [...prev, id]
              )
            }}
            onDeleteMember={deleteMember}
            deleteLoading={deleteLoading}
            filters={filters}
          />
        )}
      </div>

      <Pagination 
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  )
}
