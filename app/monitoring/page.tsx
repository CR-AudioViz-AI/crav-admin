'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, AlertTriangle, CheckCircle, XCircle, TrendingUp, RefreshCw, Zap } from 'lucide-react'

interface AppHealth {
  app_name: string
  status: 'healthy' | 'degraded' | 'down'
  last_check: string
  response_time_ms: number
  error_count_24h: number
  uptime_percentage: number
}

interface ErrorLog {
  id: string
  app_name: string
  error_type: string
  error_message: string
  stack_trace: string
  created_at: string
  auto_fixed: boolean
  fix_strategy: string | null
}

interface PerformanceMetric {
  app_name: string
  avg_response_time: number
  p95_response_time: number
  total_requests_24h: number
  error_rate: number
}

export default function MonitoringDashboard() {
  const [apps, setApps] = useState<AppHealth[]>([])
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch app health status
      const { data: healthData } = await supabase
        .from('app_health_status')
        .select('*')
        .order('last_check', { ascending: false })

      if (healthData) setApps(healthData)

      // Fetch recent errors
      const { data: errorData } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (errorData) setErrors(errorData)

      // Fetch performance metrics
      const { data: metricsData } = await supabase
        .from('app_performance_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(17) // One per app

      if (metricsData) setMetrics(metricsData)

      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error fetching monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50'
      case 'degraded': return 'text-yellow-600 bg-yellow-50'
      case 'down': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />
      case 'degraded': return <AlertTriangle className="w-5 h-5" />
      case 'down': return <XCircle className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  const healthyApps = apps.filter(a => a.status === 'healthy').length
  const totalApps = apps.length
  const avgResponseTime = apps.reduce((sum, a) => sum + a.response_time_ms, 0) / apps.length || 0
  const autoFixedErrors = errors.filter(e => e.auto_fixed).length
  const totalErrors = errors.length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Javari AI - Platform Monitoring</h1>
            <p className="text-gray-600 mt-1">Real-time health and performance tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button onClick={fetchData} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">App Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{healthyApps}/{totalApps}</p>
                  <p className="text-xs text-gray-500 mt-1">Apps Online</p>
                </div>
                <div className="text-green-600">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{avgResponseTime.toFixed(0)}ms</p>
                  <p className="text-xs text-gray-500 mt-1">Across all apps</p>
                </div>
                <div className="text-blue-600">
                  <Zap className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Auto-Fix Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalErrors > 0 ? ((autoFixedErrors / totalErrors) * 100).toFixed(0) : 0}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{autoFixedErrors}/{totalErrors} errors</p>
                </div>
                <div className="text-purple-600">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {metrics.reduce((sum, m) => sum + m.total_requests_24h, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                </div>
                <div className="text-indigo-600">
                  <Activity className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* App Status Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>Live health monitoring for all 17 applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.map((app) => (
                <div
                  key={app.app_name}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={getStatusColor(app.status)}>
                        {getStatusIcon(app.status)}
                      </div>
                      <h3 className="font-semibold text-sm">{app.app_name}</h3>
                    </div>
                    <Badge className={getStatusColor(app.status)}>
                      {app.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Response Time:</span>
                      <span className="font-medium">{app.response_time_ms}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime (24h):</span>
                      <span className="font-medium">{app.uptime_percentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Errors (24h):</span>
                      <span className="font-medium">{app.error_count_24h}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Check:</span>
                      <span className="font-medium">
                        {new Date(app.last_check).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Errors */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Errors</CardTitle>
            <CardDescription>Latest 20 errors with auto-fix status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {errors.map((error) => (
                <div
                  key={error.id}
                  className="border-l-4 border-gray-200 pl-4 py-2 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{error.app_name}</Badge>
                        <Badge variant="destructive">{error.error_type}</Badge>
                        {error.auto_fixed && (
                          <Badge className="bg-green-100 text-green-800">
                            Auto-Fixed: {error.fix_strategy}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{error.error_message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(error.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Response times and request volumes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-2 font-medium">Application</th>
                    <th className="pb-2 font-medium">Avg Response</th>
                    <th className="pb-2 font-medium">P95 Response</th>
                    <th className="pb-2 font-medium">Requests (24h)</th>
                    <th className="pb-2 font-medium">Error Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => (
                    <tr key={metric.app_name} className="border-b last:border-0">
                      <td className="py-3">{metric.app_name}</td>
                      <td className="py-3">{metric.avg_response_time.toFixed(0)}ms</td>
                      <td className="py-3">{metric.p95_response_time.toFixed(0)}ms</td>
                      <td className="py-3">{metric.total_requests_24h.toLocaleString()}</td>
                      <td className="py-3">
                        <Badge variant={metric.error_rate > 5 ? 'destructive' : 'outline'}>
                          {metric.error_rate.toFixed(2)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
