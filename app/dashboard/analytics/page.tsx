'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, DollarSign, Activity, RefreshCw } from 'lucide-react'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d')
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    activeUsers: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    revenueGrowth: 0
  })

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  async function loadAnalytics() {
    setLoading(true)
    try {
      // In production, fetch from API
      // const response = await fetch(`/api/admin/analytics?range=${dateRange}`)
      // const data = await response.json()
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 800))
      setStats({
        totalRevenue: 127540,
        totalUsers: 3847,
        activeUsers: 1923,
        conversionRate: 3.8,
        avgOrderValue: 33.14,
        revenueGrowth: 12.3
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: `+${stats.revenueGrowth}%`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+8.2%',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      change: '+15.3%',
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      change: '+0.4%',
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-slate-400">Real-time business metrics and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={loadAnalytics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-green-500 text-sm font-semibold">{stat.change}</span>
            </div>
            <h3 className="text-slate-400 text-sm mb-1">{stat.title}</h3>
            <p className="text-white text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center text-slate-500">
            <BarChart3 className="w-12 h-12 mb-2" />
          </div>
          <p className="text-slate-400 text-sm text-center">Chart integration coming soon</p>
        </div>

        {/* User Growth Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center text-slate-500">
            <TrendingUp className="w-12 h-12 mb-2" />
          </div>
          <p className="text-slate-400 text-sm text-center">Chart integration coming soon</p>
        </div>
      </div>

      {/* Top Products/Apps */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Top Performing Apps</h3>
        <div className="space-y-4">
          {[
            { name: 'Market Oracle', revenue: '$45,230', users: 1247 },
            { name: 'Logo Studio', revenue: '$32,890', users: 892 },
            { name: 'LegalEase', revenue: '$28,450', users: 634 },
            { name: 'Site Builder', revenue: '$20,970', users: 423 }
          ].map((app) => (
            <div key={app.name} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
              <div>
                <p className="text-white font-medium">{app.name}</p>
                <p className="text-slate-400 text-sm">{app.users} active users</p>
              </div>
              <p className="text-green-500 font-semibold">{app.revenue}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
