'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MonitorResult {
  app: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  responseTime: number;
  httpStatus: number | null;
  lastDeployment: string | null;
  deploymentStatus: string | null;
  errors: string[];
  checkedAt: string;
}

interface OverallStatus {
  status: 'all_healthy' | 'some_issues' | 'critical';
  totalApps: number;
  healthy: number;
  degraded: number;
  down: number;
  results: MonitorResult[];
  checkedAt: string;
}

const MONITOR_API = 'https://javariai.com/api/monitor';

export default function MonitoringPage() {
  const [status, setStatus] = useState<OverallStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHealing, setIsHealing] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${MONITOR_API}?action=status`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const triggerHeal = async (appName: string) => {
    setIsHealing(appName);
    try {
      const response = await fetch(MONITOR_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'heal', appName }),
      });
      const result = await response.json();
      alert(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);
      // Refresh after healing attempt
      setTimeout(fetchStatus, 5000);
    } catch (error) {
      alert('Failed to trigger healing');
    } finally {
      setIsHealing(null);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'healthy':
      case 'all_healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
      case 'some_issues':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'down':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'healthy':
      case 'all_healthy':
        return '✅';
      case 'degraded':
      case 'some_issues':
        return '⚠️';
      case 'down':
      case 'critical':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">🔍 Platform Monitoring</h1>
          <p className="text-gray-500 mt-1">
            Autonomous health monitoring with self-healing
            {lastRefresh && ` • Last check: ${lastRefresh.toLocaleTimeString()}`}
          </p>
        </div>
        <Button onClick={fetchStatus} disabled={isLoading}>
          {isLoading ? '⏳ Checking...' : '🔄 Refresh'}
        </Button>
      </div>

      {/* Overall Status Banner */}
      {status && (
        <Card className={`mb-6 ${getStatusColor(status.status)}`}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{getStatusIcon(status.status)}</span>
                <div>
                  <h2 className="text-2xl font-bold capitalize">
                    {status.status === 'all_healthy' ? 'All Systems Operational' :
                     status.status === 'some_issues' ? 'Some Issues Detected' :
                     'Critical Issues'}
                  </h2>
                  <p className="opacity-80">
                    {status.healthy} healthy, {status.degraded} degraded, {status.down} down
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">Total Apps Monitored</p>
                <p className="text-3xl font-bold">{status.totalApps}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Healthy</p>
            <p className="text-4xl font-bold text-green-600">{status?.healthy || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Degraded</p>
            <p className="text-4xl font-bold text-yellow-600">{status?.degraded || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Down</p>
            <p className="text-4xl font-bold text-red-600">{status?.down || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Response</p>
            <p className="text-4xl font-bold text-blue-600">
              {status?.results ? Math.round(status.results.reduce((a, b) => a + b.responseTime, 0) / status.results.length) : 0}ms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Individual App Status */}
      <Card>
        <CardHeader>
          <CardTitle>📊 App Status Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !status ? (
            <div className="text-center py-8">
              <p className="text-gray-500">⏳ Running health checks...</p>
            </div>
          ) : status?.results ? (
            <div className="space-y-3">
              {status.results.map(result => (
                <div
                  key={result.app}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getStatusIcon(result.status)}</span>
                      <div>
                        <h3 className="font-semibold">{result.app}</h3>
                        <p className="text-sm opacity-80">
                          {result.responseTime}ms • HTTP {result.httpStatus || 'N/A'}
                          {result.deploymentStatus && ` • Deploy: ${result.deploymentStatus}`}
                        </p>
                        {result.errors.length > 0 && (
                          <p className="text-sm text-red-600 mt-1">
                            Errors: {result.errors.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                      {result.status !== 'healthy' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => triggerHeal(result.app)}
                          disabled={isHealing === result.app}
                        >
                          {isHealing === result.app ? '⏳ Healing...' : '🔧 Auto-Heal'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No monitoring data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
