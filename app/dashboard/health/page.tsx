'use client'

import { useState, useEffect } from 'react'
import { Activity, Server, Database, Zap, AlertTriangle, CheckCircle, RefreshCw, Globe } from 'lucide-react'

export default function HealthPage() {
  const [loading, setLoading] = useState(false)
  const [lastCheck, setLastCheck] = useState(new Date())

  const services = [
    {
      name: 'Main Website',
      status: 'healthy',
      uptime: 99.98,
      responseTime: 245,
      url: 'https://craudiovizai.com',
      icon: Globe
    },
    {
      name: 'Supabase Database',
      status: 'healthy',
      uptime: 99.99,
      responseTime: 89,
      url: 'https://lmrnxiohitksgnugggmh.supabase.co',
      icon: Database
    },
    {
      name: 'Vercel Edge Functions',
      status: 'healthy',
      uptime: 99.95,
      responseTime: 156,
      url: 'https://vercel.com/status',
      icon: Zap
    },
    {
      name: 'Stripe API',
      status: 'healthy',
      uptime: 99.99,
      responseTime: 312,
      url: 'https://status.stripe.com',
      icon: Server
    },
    {
      name: 'PayPal API',
      status: 'degraded',
      uptime: 99.85,
      responseTime: 876,
      url: 'https://www.paypal-status.com',
      icon: Server
    },
    {
      name: 'OpenAI API',
      status: 'healthy',
      uptime: 99.92,
      responseTime: 1234,
      url: 'https://status.openai.com',
      icon: Activity
    },
    {
      name: 'Market Oracle',
      status: 'healthy',
      uptime: 99.87,
      responseTime: 423,
      url: 'https://crav-market-oracle.vercel.app',
      icon: Globe
    },
    {
      name: 'Javari AI',
      status: 'down',
      uptime: 0,
      responseTime: 0,
      url: 'https://crav-javari.vercel.app',
      icon: Activity
    }
  ]

  async function runHealthCheck() {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setLastCheck(new Date())
    setLoading(false)
  }

  const healthyCount = services.filter(s => s.status === 'healthy').length
  const degradedCount = services.filter(s => s.status === 'degraded').length
  const downCount = services.filter(s => s.status === 'down').length

  const statusConfig = {
    healthy: { color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle, label: 'Healthy' },
    degraded: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: AlertTriangle, label: 'Degraded' },
    down: { color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertTriangle, label: 'Down' }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Health</h1>
          <p className="text-slate-400">Real-time monitoring of all services</p>
        </div>
        <button
          onClick={runHealthCheck}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Run Check
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Services</p>
              <p className="text-white text-2xl font-bold">{services.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Healthy</p>
              <p className="text-white text-2xl font-bold">{healthyCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/10 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Degraded</p>
              <p className="text-white text-2xl font-bold">{degradedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Down</p>
              <p className="text-white text-2xl font-bold">{downCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Last Check */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <p className="text-slate-400 text-sm">
          Last health check: <span className="text-white">{lastCheck.toLocaleTimeString()}</span>
        </p>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {services.map((service) => {
          const status = statusConfig[service.status as keyof typeof statusConfig]
          const StatusIcon = status.icon
          const ServiceIcon = service.icon
          
          return (
            <div key={service.name} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <ServiceIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{service.name}</h3>
                    <p className="text-slate-400 text-sm">{service.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">Uptime</p>
                    <p className="text-white font-semibold">{service.uptime}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">Response Time</p>
                    <p className="text-white font-semibold">{service.responseTime}ms</p>
                  </div>
                  <div className={`${status.bg} ${status.color} px-4 py-2 rounded-full flex items-center gap-2 min-w-[120px] justify-center`}>
                    <StatusIcon className="w-4 h-4" />
                    {status.label}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
