'use client'

import { useState } from 'react'
import {
  Users, Search, Filter, UserPlus, Mail, Shield, Crown,
  Ban, CheckCircle, Clock, MoreVertical, Download, Eye,
  DollarSign, Activity, Calendar, Globe, Zap, Star, AlertTriangle
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  avatar: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  joinedAt: string
  lastActive: string
  totalSpent: number
  creditsUsed: number
  apps: string[]
  country: string
  riskScore: number
}

interface UserStats {
  total: number
  active: number
  newThisMonth: number
  churnedThisMonth: number
  conversionRate: number
  avgLTV: number
}

const USERS: User[] = [
  { id: '1', email: 'john.designer@gmail.com', name: 'John Designer', avatar: '👨‍🎨', plan: 'pro', status: 'active', joinedAt: '2024-06-15', lastActive: '2 hours ago', totalSpent: 456, creditsUsed: 12500, apps: ['Logo Studio', 'Social Graphics'], country: 'US', riskScore: 5 },
  { id: '2', email: 'sarah.trader@outlook.com', name: 'Sarah Trader', avatar: '👩‍💼', plan: 'enterprise', status: 'active', joinedAt: '2024-03-20', lastActive: '5 min ago', totalSpent: 2340, creditsUsed: 89000, apps: ['Market Oracle'], country: 'UK', riskScore: 2 },
  { id: '3', email: 'mike.freelancer@yahoo.com', name: 'Mike Freelancer', avatar: '👨‍💻', plan: 'pro', status: 'active', joinedAt: '2024-09-01', lastActive: '1 day ago', totalSpent: 178, creditsUsed: 4500, apps: ['Invoice Generator', 'Logo Studio'], country: 'CA', riskScore: 12 },
  { id: '4', email: 'emma.collector@gmail.com', name: 'Emma Collector', avatar: '👩', plan: 'pro', status: 'active', joinedAt: '2024-11-10', lastActive: '3 hours ago', totalSpent: 89, creditsUsed: 2300, apps: ['CravCardverse', 'CravBarrels'], country: 'AU', riskScore: 8 },
  { id: '5', email: 'test.user@temp.com', name: 'Test User', avatar: '🤖', plan: 'free', status: 'suspended', joinedAt: '2024-12-20', lastActive: '5 days ago', totalSpent: 0, creditsUsed: 15000, apps: ['All Apps'], country: 'RU', riskScore: 95 },
  { id: '6', email: 'david.agency@company.com', name: 'David Agency', avatar: '👨‍💻', plan: 'enterprise', status: 'active', joinedAt: '2024-01-15', lastActive: '1 hour ago', totalSpent: 5670, creditsUsed: 234000, apps: ['Logo Studio', 'Social Graphics', 'Invoice Generator'], country: 'US', riskScore: 3 },
  { id: '7', email: 'lisa.travel@gmail.com', name: 'Lisa Travel', avatar: '👩‍🦰', plan: 'pro', status: 'inactive', joinedAt: '2024-08-05', lastActive: '2 weeks ago', totalSpent: 125, creditsUsed: 3200, apps: ['Orlando Deals'], country: 'US', riskScore: 45 },
]

const STATS: UserStats = {
  total: 2847,
  active: 2156,
  newThisMonth: 342,
  churnedThisMonth: 89,
  conversionRate: 12.4,
  avgLTV: 385
}

export default function UserManagementHub() {
  const [searchQuery, setSearchQuery] = useState('')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const filteredUsers = USERS
    .filter(u => !searchQuery || u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(u => planFilter === 'all' || u.plan === planFilter)
    .filter(u => statusFilter === 'all' || u.status === statusFilter)

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-500/20 text-gray-400'
      case 'pro': return 'bg-blue-500/20 text-blue-400'
      case 'enterprise': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'inactive': return 'bg-yellow-500/20 text-yellow-400'
      case 'suspended': return 'bg-red-500/20 text-red-400'
      case 'pending': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getRiskColor = (score: number) => {
    if (score <= 20) return 'text-green-400'
    if (score <= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">User Management</h1>
              <p className="text-violet-200">Monitor and manage platform users</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-violet-600 rounded-lg font-medium">
              <UserPlus className="w-4 h-4" /> Add User
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{STATS.total.toLocaleString()}</p>
            <p className="text-xs text-violet-200">Total Users</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{STATS.active.toLocaleString()}</p>
            <p className="text-xs text-violet-200">Active</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-300">+{STATS.newThisMonth}</p>
            <p className="text-xs text-violet-200">New This Month</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-300">-{STATS.churnedThisMonth}</p>
            <p className="text-xs text-violet-200">Churned</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{STATS.conversionRate}%</p>
            <p className="text-xs text-violet-200">Conversion</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">${STATS.avgLTV}</p>
            <p className="text-xs text-violet-200">Avg LTV</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl"
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* User Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="text-left p-4">User</th>
              <th className="text-left p-4">Plan</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Spent</th>
              <th className="text-right p-4">Credits</th>
              <th className="text-left p-4">Apps</th>
              <th className="text-center p-4">Risk</th>
              <th className="text-center p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-800/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{user.avatar}</span>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs capitalize ${getPlanColor(user.plan)}`}>
                    {user.plan}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-right font-medium">${user.totalSpent}</td>
                <td className="p-4 text-right text-gray-400">{user.creditsUsed.toLocaleString()}</td>
                <td className="p-4">
                  <div className="flex gap-1 flex-wrap">
                    {user.apps.slice(0, 2).map(app => (
                      <span key={app} className="px-2 py-0.5 bg-gray-800 text-xs rounded">{app}</span>
                    ))}
                    {user.apps.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-800 text-xs rounded">+{user.apps.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`font-medium ${getRiskColor(user.riskScore)}`}>
                    {user.riskScore}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-1">
                    <button className="p-2 hover:bg-gray-700 rounded" title="View Details">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-700 rounded" title="Email User">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </button>
                    {user.status !== 'suspended' ? (
                      <button className="p-2 hover:bg-gray-700 rounded" title="Suspend User">
                        <Ban className="w-4 h-4 text-red-400" />
                      </button>
                    ) : (
                      <button className="p-2 hover:bg-gray-700 rounded" title="Unsuspend User">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">Showing {filteredUsers.length} of {USERS.length} users</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-800 rounded-lg text-sm">Previous</button>
          <button className="px-4 py-2 bg-violet-600 rounded-lg text-sm">1</button>
          <button className="px-4 py-2 bg-gray-800 rounded-lg text-sm">2</button>
          <button className="px-4 py-2 bg-gray-800 rounded-lg text-sm">3</button>
          <button className="px-4 py-2 bg-gray-800 rounded-lg text-sm">Next</button>
        </div>
      </div>
    </div>
  )
}
