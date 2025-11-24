'use client'

import { useState } from 'react'
import { Search, Filter, DollarSign, Calendar, CheckCircle, Clock, XCircle, Plus } from 'lucide-react'

export default function GrantsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const grants = [
    {
      id: 1,
      name: 'FEMA Community Safety Grant',
      amount: 500000,
      status: 'approved',
      deadline: '2025-12-31',
      category: 'Safety',
      description: 'Funding for community safety initiatives and first responder training'
    },
    {
      id: 2,
      name: 'DOJ Veterans Support Program',
      amount: 350000,
      status: 'pending',
      deadline: '2025-11-30',
      category: 'Veterans',
      description: 'Support programs for veteran mental health and transition services'
    },
    {
      id: 3,
      name: 'VA Technology Innovation Grant',
      amount: 750000,
      status: 'in-progress',
      deadline: '2026-02-15',
      category: 'Technology',
      description: 'Tech solutions for veteran healthcare and services'
    },
    {
      id: 4,
      name: 'Faith-Based Community Outreach',
      amount: 250000,
      status: 'rejected',
      deadline: '2025-10-01',
      category: 'Community',
      description: 'Support for faith-based community service programs'
    },
    {
      id: 5,
      name: 'Small Business Digital Transformation',
      amount: 450000,
      status: 'approved',
      deadline: '2026-01-31',
      category: 'Business',
      description: 'Helping small businesses adopt digital tools and AI'
    }
  ]

  const filteredGrants = grants.filter(grant => {
    const matchesSearch = grant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         grant.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || grant.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusConfig = {
    approved: { color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle, label: 'Approved' },
    pending: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock, label: 'Pending' },
    'in-progress': { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Clock, label: 'In Progress' },
    rejected: { color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle, label: 'Rejected' }
  }

  const totalApproved = grants.filter(g => g.status === 'approved').reduce((sum, g) => sum + g.amount, 0)
  const totalPending = grants.filter(g => g.status === 'pending' || g.status === 'in-progress').reduce((sum, g) => sum + g.amount, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Grant Tracking</h1>
          <p className="text-slate-400">Monitor and manage grant applications</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Application
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-500/10 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Approved Funding</p>
              <p className="text-white text-2xl font-bold">${(totalApproved / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-500/10 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Pending Review</p>
              <p className="text-white text-2xl font-bold">${(totalPending / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Applications</p>
              <p className="text-white text-2xl font-bold">{grants.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search grants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Grants List */}
      <div className="space-y-4">
        {filteredGrants.map((grant) => {
          const status = statusConfig[grant.status as keyof typeof statusConfig]
          const StatusIcon = status.icon
          
          return (
            <div key={grant.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-white text-lg font-semibold mb-2">{grant.name}</h3>
                  <p className="text-slate-400 text-sm mb-3">{grant.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Deadline: {new Date(grant.deadline).toLocaleDateString()}
                    </span>
                    <span className="bg-slate-700 px-2 py-1 rounded text-slate-300">
                      {grant.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-500 text-xl font-bold mb-2">
                    ${(grant.amount / 1000).toFixed(0)}K
                  </p>
                  <div className={`${status.bg} ${status.color} px-3 py-1 rounded-full flex items-center gap-1 text-sm`}>
                    <StatusIcon className="w-4 h-4" />
                    {status.label}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredGrants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No grants found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
