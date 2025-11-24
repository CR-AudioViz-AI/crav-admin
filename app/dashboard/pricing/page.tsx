'use client'

import { DollarSign, Users, TrendingUp, Edit } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    { id: 1, name: 'Starter', price: 0, credits: 100, users: 1247, active: true },
    { id: 2, name: 'Basic', price: 29, credits: 200, users: 892, active: true },
    { id: 3, name: 'Pro', price: 99, credits: 1000, users: 423, active: true },
    { id: 4, name: 'Premium', price: 299, credits: 5000, users: 156, active: true }
  ]

  const totalRevenue = plans.reduce((s, p) => s + (p.price * p.users), 0)
  const totalUsers = plans.reduce((s, p) => s + p.users, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pricing Management</h1>
          <p className="text-slate-400">Manage subscription plans and pricing</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Add Plan</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Monthly Revenue</p>
              <p className="text-white text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Subscribers</p>
              <p className="text-white text-2xl font-bold">{totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/10 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Active Plans</p>
              <p className="text-white text-2xl font-bold">{plans.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-sm">{plan.credits.toLocaleString()} credits</p>
              </div>
              <button className="text-blue-500 hover:text-blue-400">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <p className="text-green-500 text-3xl font-bold mb-4">${plan.price}<span className="text-sm text-slate-400">/mo</span></p>
            <p className="text-slate-400 text-sm">{plan.users.toLocaleString()} subscribers</p>
          </div>
        ))}
      </div>
    </div>
  )
}
