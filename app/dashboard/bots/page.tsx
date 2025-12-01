// app/dashboard/bots/page.tsx
// Javari Bot Management Dashboard
// Timestamp: 2025-11-30 21:25 EST

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Bot {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  schedule: string;
  status: string;
  description: string;
}

interface BotRun {
  botId: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'success' | 'failed';
  error?: string;
}

export default function BotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [runs, setRuns] = useState<BotRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  const fetchBots = async () => {
    try {
      const resp = await fetch('https://javariai.com/api/bots');
      const data = await resp.json();
      setBots(data.bots || []);
      setRuns(data.recentRuns || []);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
    const interval = setInterval(fetchBots, 30000);
    return () => clearInterval(interval);
  }, []);

  const runBot = async (botId: string) => {
    setRunning(botId);
    try {
      await fetch('https://javariai.com/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run', botId })
      });
      await fetchBots();
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setRunning(null);
    }
  };

  const runAll = async () => {
    setRunning('all');
    try {
      await fetch('https://javariai.com/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_all' })
      });
      await fetchBots();
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setRunning(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'monitoring': return 'bg-blue-500';
      case 'learning': return 'bg-purple-500';
      case 'scraper': return 'bg-green-500';
      case 'deployment': return 'bg-orange-500';
      case 'error-handling': return 'bg-red-500';
      case 'analytics': return 'bg-cyan-500';
      case 'backup': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading bots...</div>;
  }

  const activeCount = bots.filter(b => b.status === 'active').length;
  const successRuns = runs.filter(r => r.status === 'success').length;
  const failedRuns = runs.filter(r => r.status === 'failed').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🤖 Javari Bot Management</h1>
        <Button onClick={runAll} disabled={running === 'all'}>
          {running === 'all' ? 'Running All...' : 'Run All Scheduled Bots'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{bots.length}</div>
            <div className="text-sm text-gray-500">Total Bots</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">{activeCount}</div>
            <div className="text-sm text-gray-500">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600">{successRuns}</div>
            <div className="text-sm text-gray-500">Successful Runs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">{failedRuns}</div>
            <div className="text-sm text-gray-500">Failed Runs</div>
          </CardContent>
        </Card>
      </div>

      {/* Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bots.map(bot => {
          const lastRun = runs.find(r => r.botId === bot.id);
          return (
            <Card key={bot.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{bot.name}</CardTitle>
                  <Badge className={getTypeColor(bot.type)}>{bot.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{bot.description}</p>
                <div className="text-xs text-gray-400 mb-3">
                  <div>Schedule: {bot.schedule}</div>
                  <div>Status: {bot.status}</div>
                  {lastRun && (
                    <div>
                      Last run: {lastRun.status} at {new Date(lastRun.startedAt).toLocaleString()}
                    </div>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => runBot(bot.id)}
                  disabled={running === bot.id}
                >
                  {running === bot.id ? 'Running...' : 'Run Now'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bot Runs</CardTitle>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <p className="text-gray-500">No recent runs</p>
          ) : (
            <div className="space-y-2">
              {runs.slice(0, 10).map((run, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{run.botId}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(run.startedAt).toLocaleString()}
                    </span>
                  </div>
                  <Badge variant={run.status === 'success' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}>
                    {run.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
