'use client'

import { CreditCard, DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react'

export default function PaymentsPage() {
  const transactions = [
    { id: 1, user: 'john@example.com', amount: 99, status: 'completed', method: 'Stripe', date: '2025-11-23' },
    { id: 2, user: 'sarah@example.com', amount: 29, status: 'completed', method: 'PayPal', date: '2025-11-23' },
    { id: 3, user: 'mike@example.com', amount: 299, status: 'pending', method: 'Stripe', date: '2025-11-23' },
    { id: 4, user: 'lisa@example.com', amount: 49, status: 'completed', method: 'Stripe', date: '2025-11-22' }
  ]

  const totalRevenue = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0)
  const pendingAmount = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Payment Management</h1>
        <p className="text-slate-400">Monitor transactions and payment processing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-white text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/10 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Pending</p>
              <p className="text-white text-2xl font-bold">${pendingAmount}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Transactions</p>
              <p className="text-white text-2xl font-bold">{transactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white font-semibold mb-1">{tx.user}</p>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>{new Date(tx.date).toLocaleDateString()}</span>
                  <span className="bg-slate-700 px-2 py-1 rounded">{tx.method}</span>
                  <span className={`px-2 py-1 rounded ${
                    tx.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
              <p className="text-green-500 text-xl font-bold">${tx.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
