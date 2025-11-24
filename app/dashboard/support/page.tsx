'use client'

import { MessageSquare, Clock, CheckCircle, AlertCircle, User } from 'lucide-react'

export default function SupportPage() {
  const tickets = [
    { id: 1, user: 'john@example.com', subject: 'Payment issue with Pro plan', status: 'open', priority: 'high', created: '2025-11-23' },
    { id: 2, user: 'sarah@example.com', subject: 'How to use Market Oracle?', status: 'in-progress', priority: 'medium', created: '2025-11-23' },
    { id: 3, user: 'mike@example.com', subject: 'Credits not showing', status: 'resolved', priority: 'low', created: '2025-11-22' },
    { id: 4, user: 'lisa@example.com', subject: 'Feature request: Dark mode', status: 'open', priority: 'low', created: '2025-11-22' }
  ]

  const statusConfig = {
    open: { color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertCircle },
    'in-progress': { color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock },
    resolved: { color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle }
  }

  const priorityColors = {
    high: 'bg-red-500/10 text-red-500',
    medium: 'bg-yellow-500/10 text-yellow-500',
    low: 'bg-slate-700 text-slate-300'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Support Tickets</h1>
          <p className="text-slate-400">Manage customer support requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Open Tickets</p>
              <p className="text-white text-2xl font-bold">{tickets.filter(t => t.status === 'open').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/10 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">In Progress</p>
              <p className="text-white text-2xl font-bold">{tickets.filter(t => t.status === 'in-progress').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Resolved</p>
              <p className="text-white text-2xl font-bold">{tickets.filter(t => t.status === 'resolved').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => {
          const status = statusConfig[ticket.status as keyof typeof statusConfig]
          const StatusIcon = status.icon
          
          return (
            <div key={ticket.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400 text-sm">{ticket.user}</span>
                    <span className={`px-2 py-1 rounded text-xs ${priorityColors[ticket.priority as keyof typeof priorityColors]}`}>
                      {ticket.priority} priority
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">{ticket.subject}</h3>
                  <p className="text-slate-400 text-sm">Created: {new Date(ticket.created).toLocaleDateString()}</p>
                </div>
                <div className={`${status.bg} ${status.color} px-4 py-2 rounded-full flex items-center gap-2`}>
                  <StatusIcon className="w-4 h-4" />
                  {ticket.status}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
