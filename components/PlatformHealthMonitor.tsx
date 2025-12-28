'use client'

import { useState, useEffect } from 'react'
import {
  Activity, Server, Database, Globe, AlertTriangle, CheckCircle,
  XCircle, Clock, Zap, RefreshCw, Bell, Settings, Eye,
  TrendingUp, TrendingDown, Cpu, HardDrive, Wifi, Shield
} from 'lucide-react'

interface ServiceStatus {
  name: string
  status: 'operational' | 'degraded' | 'down' | 'maintenance'
  uptime: number
  responseTime: number
  lastChecked: string
  region: string
  icon: string
}

interface Deployment {
  app: string
  status: 'ready' | 'building' | 'error' | 'queued'
  url: string
  lastDeployed: string
  commitMessage: string
  branch: string
}

interface Alert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  service: string
  timestamp: string
  acknowledged: boolean
}

interface Metric {
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  change: number
}

const SERVICES: ServiceStatus[] = [
  { name: 'Vercel Edge Network', status: 'operational', uptime: 99.99, responseTime: 45, lastChecked: '30s ago', region: 'Global', icon: '🌐' },
  { name: 'Supabase Database', status: 'operational', uptime: 99.95, responseTime: 12, lastChecked: '30s ago', region: 'US East', icon: '🗄️' },
  { name: 'Stripe Payments', status: 'operational', uptime: 99.99, responseTime: 180, lastChecked: '30s ago', region: 'Global', icon: '💳' },
  { name: 'OpenAI API', status: 'degraded', uptime: 98.50, responseTime: 850, lastChecked: '30s ago', region: 'US', icon: '🤖' },
  { name: 'Anthropic Claude', status: 'operational', uptime: 99.90, responseTime: 320, lastChecked: '30s ago', region: 'US', icon: '🧠' },
  { name: 'GitHub Actions', status: 'operational', uptime: 99.80, responseTime: 2100, lastChecked: '1m ago', region: 'Global', icon: '⚙️' },
  { name: 'SendGrid Email', status: 'operational', uptime: 99.95, responseTime: 95, lastChecked: '30s ago', region: 'US', icon: '📧' },
  { name: 'Cloudflare CDN', status: 'operational', uptime: 99.99, responseTime: 18, lastChecked: '30s ago', region: 'Global', icon: '☁️' },
]

const DEPLOYMENTS: Deployment[] = [
  { app: 'crav-market-oracle', status: 'ready', url: 'https://crav-market-oracle.vercel.app', lastDeployed: '15 min ago', commitMessage: 'Add gamification system', branch: 'main' },
  { app: 'crav-logo-studio', status: 'ready', url: 'https://crav-logo-studio.vercel.app', lastDeployed: '22 min ago', commitMessage: 'Update training hub', branch: 'main' },
  { app: 'crav-social-graphics', status: 'building', url: 'https://crav-social-graphics.vercel.app', lastDeployed: '2 min ago', commitMessage: 'Fix TypeScript errors', branch: 'main' },
  { app: 'crav-invoice-generator', status: 'ready', url: 'https://crav-invoice-generator.vercel.app', lastDeployed: '18 min ago', commitMessage: 'Add export features', branch: 'main' },
  { app: 'cravbarrels', status: 'ready', url: 'https://cravbarrels.vercel.app', lastDeployed: '35 min ago', commitMessage: 'Virtual tasting room', branch: 'main' },
  { app: 'crav-cardverse', status: 'ready', url: 'https://crav-cardverse.vercel.app', lastDeployed: '40 min ago', commitMessage: 'Trading hub component', branch: 'main' },
  { app: 'crav-orlando-deals', status: 'ready', url: 'https://crav-orlando-deals.vercel.app', lastDeployed: '1 hour ago', commitMessage: 'Crowd calendar AI', branch: 'main' },
  { app: 'crav-admin', status: 'ready', url: 'https://crav-admin.vercel.app', lastDeployed: '2 hours ago', commitMessage: 'Revenue tracking', branch: 'main' },
]

const ALERTS: Alert[] = [
  { id: '1', severity: 'warning', message: 'OpenAI API response time elevated (850ms avg)', service: 'OpenAI API', timestamp: '5 min ago', acknowledged: false },
  { id: '2', severity: 'info', message: 'Scheduled maintenance: Supabase DB optimization tonight 2-4 AM EST', service: 'Supabase', timestamp: '1 hour ago', acknowledged: true },
  { id: '3', severity: 'info', message: 'New deployment: crav-social-graphics building', service: 'Vercel', timestamp: '2 min ago', acknowledged: false },
]

const METRICS: Metric[] = [
  { name: 'Total Requests', value: 1284567, unit: '/day', trend: 'up', change: 12.5 },
  { name: 'Avg Response Time', value: 145, unit: 'ms', trend: 'down', change: -8.2 },
  { name: 'Error Rate', value: 0.12, unit: '%', trend: 'down', change: -0.05 },
  { name: 'Active Users', value: 2847, unit: 'now', trend: 'up', change: 15.3 },
]

export default function PlatformHealthMonitor() {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'deployments' | 'alerts'>('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const operationalCount = SERVICES.filter(s => s.status === 'operational').length
  const degradedCount = SERVICES.filter(s => s.status === 'degraded').length
  const downCount = SERVICES.filter(s => s.status === 'down').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': case 'ready': return 'text-green-400 bg-green-500/20'
      case 'degraded': case 'building': return 'text-yellow-400 bg-yellow-500/20'
      case 'down': case 'error': return 'text-red-400 bg-red-500/20'
      case 'maintenance': case 'queued': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Platform Health Monitor</h1>
              <p className="text-cyan-200">Real-time system status & performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-white text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>
            <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg">
              <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{operationalCount}</p>
              <p className="text-sm text-cyan-200">Operational</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">{degradedCount}</p>
              <p className="text-sm text-cyan-200">Degraded</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-white">{downCount}</p>
              <p className="text-sm text-cyan-200">Down</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 flex items-center gap-3">
            <Server className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{DEPLOYMENTS.length}</p>
              <p className="text-sm text-cyan-200">Deployments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {METRICS.map(metric => (
          <div key={metric.name} className="bg-gray-900 rounded-xl border border-gray-700 p-4">
            <p className="text-sm text-gray-400 mb-1">{metric.name}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">
                {metric.value.toLocaleString()}<span className="text-sm text-gray-400">{metric.unit}</span>
              </p>
              <span className={`flex items-center gap-1 text-sm ${
                metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'services', label: 'Services', icon: Server },
          { id: 'deployments', label: 'Deployments', icon: Globe },
          { id: 'alerts', label: 'Alerts', icon: Bell, badge: ALERTS.filter(a => !a.acknowledged).length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === tab.id ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge && tab.badge > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-xs rounded-full">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Services Tab */}
      {(activeTab === 'overview' || activeTab === 'services') && (
        <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold">External Services</h3>
            <span className="text-sm text-gray-400">Last updated: Just now</span>
          </div>
          <div className="divide-y divide-gray-800">
            {SERVICES.map(service => (
              <div key={service.name} className="p-4 flex items-center justify-between hover:bg-gray-800/50">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{service.icon}</span>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-400">{service.region}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm">{service.uptime}% uptime</p>
                    <p className="text-xs text-gray-400">{service.responseTime}ms</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deployments Tab */}
      {(activeTab === 'overview' || activeTab === 'deployments') && (
        <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold">Active Deployments</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {DEPLOYMENTS.map(deployment => (
              <div key={deployment.app} className="p-4 flex items-center justify-between hover:bg-gray-800/50">
                <div className="flex items-center gap-4">
                  <span className={`w-3 h-3 rounded-full ${
                    deployment.status === 'ready' ? 'bg-green-500' :
                    deployment.status === 'building' ? 'bg-yellow-500 animate-pulse' :
                    deployment.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <p className="font-medium">{deployment.app}</p>
                    <p className="text-sm text-gray-400">{deployment.commitMessage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="text-gray-400">{deployment.lastDeployed}</p>
                    <p className="text-xs text-gray-500">{deployment.branch}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(deployment.status)}`}>
                    {deployment.status}
                  </span>
                  <a href={deployment.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                    <Globe className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {ALERTS.map(alert => (
            <div key={alert.id} className={`p-4 rounded-xl border ${getSeverityColor(alert.severity)} ${alert.acknowledged ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {alert.severity === 'critical' && <XCircle className="w-5 h-5 mt-0.5" />}
                  {alert.severity === 'warning' && <AlertTriangle className="w-5 h-5 mt-0.5" />}
                  {alert.severity === 'info' && <Bell className="w-5 h-5 mt-0.5" />}
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm opacity-75">{alert.service} • {alert.timestamp}</p>
                  </div>
                </div>
                {!alert.acknowledged && (
                  <button className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded">
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
