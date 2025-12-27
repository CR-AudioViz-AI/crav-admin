'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, Filter, AlertTriangle, Info, AlertCircle, CheckCircle, Clock, User, Globe } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  action: string;
  user?: string;
  app?: string;
  ip?: string;
  details?: string;
}

const MOCK_LOGS: LogEntry[] = [
  { id: '1', timestamp: '2025-12-27T16:45:00Z', level: 'success', action: 'User login', user: 'john@example.com', app: 'crav-website', ip: '192.168.1.1' },
  { id: '2', timestamp: '2025-12-27T16:42:00Z', level: 'info', action: 'API call', user: 'system', app: 'market-oracle', details: 'GET /api/stocks/analyze' },
  { id: '3', timestamp: '2025-12-27T16:40:00Z', level: 'warning', action: 'Rate limit approaching', app: 'crav-javari', details: '85% of hourly limit used' },
  { id: '4', timestamp: '2025-12-27T16:38:00Z', level: 'error', action: 'Payment failed', user: 'jane@example.com', app: 'crav-cardverse', details: 'Card declined' },
  { id: '5', timestamp: '2025-12-27T16:35:00Z', level: 'success', action: 'Subscription created', user: 'bob@example.com', app: 'crav-website', details: 'Pro plan' },
  { id: '6', timestamp: '2025-12-27T16:30:00Z', level: 'info', action: 'Deployment triggered', app: 'crav-admin', details: 'Vercel auto-deploy' },
  { id: '7', timestamp: '2025-12-27T16:25:00Z', level: 'warning', action: 'High memory usage', app: 'crav-market-oracle', details: '92% memory used' },
  { id: '8', timestamp: '2025-12-27T16:20:00Z', level: 'success', action: 'Bot completed', app: 'trending-bot', details: 'Found 15 trending items' },
];

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user?.toLowerCase().includes(search.toLowerCase()) ||
      log.app?.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = !levelFilter || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const stats = {
    total: logs.length,
    info: logs.filter(l => l.level === 'info').length,
    warning: logs.filter(l => l.level === 'warning').length,
    error: logs.filter(l => l.level === 'error').length,
    success: logs.filter(l => l.level === 'success').length,
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'border-l-blue-400';
      case 'warning': return 'border-l-yellow-400';
      case 'error': return 'border-l-red-400';
      case 'success': return 'border-l-green-400';
      default: return 'border-l-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="w-8 h-8 text-slate-400" />
              Audit Logs
            </h1>
            <p className="text-gray-400 mt-1">System-wide activity monitoring</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <button onClick={() => setLevelFilter(null)} className={`bg-gray-800 rounded-xl p-4 transition-all ${!levelFilter ? 'ring-2 ring-white' : ''}`}>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-gray-400 text-sm">All</div>
          </button>
          <button onClick={() => setLevelFilter('info')} className={`bg-gray-800 rounded-xl p-4 transition-all ${levelFilter === 'info' ? 'ring-2 ring-blue-400' : ''}`}>
            <div className="text-2xl font-bold text-blue-400">{stats.info}</div>
            <div className="text-gray-400 text-sm">Info</div>
          </button>
          <button onClick={() => setLevelFilter('success')} className={`bg-gray-800 rounded-xl p-4 transition-all ${levelFilter === 'success' ? 'ring-2 ring-green-400' : ''}`}>
            <div className="text-2xl font-bold text-green-400">{stats.success}</div>
            <div className="text-gray-400 text-sm">Success</div>
          </button>
          <button onClick={() => setLevelFilter('warning')} className={`bg-gray-800 rounded-xl p-4 transition-all ${levelFilter === 'warning' ? 'ring-2 ring-yellow-400' : ''}`}>
            <div className="text-2xl font-bold text-yellow-400">{stats.warning}</div>
            <div className="text-gray-400 text-sm">Warnings</div>
          </button>
          <button onClick={() => setLevelFilter('error')} className={`bg-gray-800 rounded-xl p-4 transition-all ${levelFilter === 'error' ? 'ring-2 ring-red-400' : ''}`}>
            <div className="text-2xl font-bold text-red-400">{stats.error}</div>
            <div className="text-gray-400 text-sm">Errors</div>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-slate-500" />
        </div>

        {/* Logs */}
        <div className="space-y-2">
          {filteredLogs.map(log => (
            <div key={log.id} className={`bg-gray-800 rounded-lg p-4 border-l-4 ${getLevelColor(log.level)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getLevelIcon(log.level)}
                  <div>
                    <div className="font-medium">{log.action}</div>
                    {log.details && <div className="text-sm text-gray-400 mt-1">{log.details}</div>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {log.user && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {log.user}</span>}
                      {log.app && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {log.app}</span>}
                      {log.ip && <span>{log.ip}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
