'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface KnowledgeEntry {
  id: string;
  topic: string;
  subtopic: string | null;
  skill_level: string | null;
  concept: string;
  explanation: string;
  verified: boolean;
  created_at: string;
}

interface KnowledgeStats {
  total: number;
  verified: number;
  unverified: number;
}

interface TopicStats {
  name: string;
  total: number;
}

const JAVARI_API = 'https://javariai.com/api/javari';

export default function JavariKnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [topics, setTopics] = useState<TopicStats[]>([]);
  const [stats, setStats] = useState<KnowledgeStats>({ total: 0, verified: 0, unverified: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [healthStatus, setHealthStatus] = useState<string>('checking');

  const fetchKnowledge = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('filter', filter);
      if (selectedTopic) params.set('topic', selectedTopic);
      params.set('limit', '100');

      const response = await fetch(`${JAVARI_API}/knowledge?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
        setTopics(data.topics || []);
        setStats(data.stats || { total: 0, verified: 0, unverified: 0 });
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch knowledge:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, selectedTopic]);

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(`${JAVARI_API}/health`);
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data.healthy ? 'healthy' : 'degraded');
      } else {
        setHealthStatus('degraded');
      }
    } catch {
      setHealthStatus('down');
    }
  }, []);

  useEffect(() => {
    fetchKnowledge();
    checkHealth();
    const interval = setInterval(() => {
      fetchKnowledge();
      checkHealth();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchKnowledge, checkHealth]);

  const verifyEntry = async (id: string) => {
    try {
      await fetch(`${JAVARI_API}/knowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'verify' }),
      });
      fetchKnowledge();
    } catch (error) {
      console.error('Failed to verify:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">🧠 Javari Knowledge Base</h1>
          <p className="text-gray-500 mt-1">
            Status: {healthStatus === 'healthy' ? '✅ Healthy' : healthStatus === 'down' ? '❌ Down' : '⏳ Checking'}
            {lastRefresh && ` • Updated: ${lastRefresh.toLocaleTimeString()}`}
          </p>
        </div>
        <Button onClick={fetchKnowledge} disabled={isLoading}>
          {isLoading ? '⏳ Loading...' : '🔄 Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Knowledge</p>
            <p className="text-4xl font-bold text-purple-600">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Verified</p>
            <p className="text-4xl font-bold text-green-600">{stats.verified}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Pending Review</p>
            <p className="text-4xl font-bold text-yellow-600">{stats.unverified}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Topics</p>
            <p className="text-4xl font-bold text-blue-600">{topics.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Topic Distribution */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📊 Knowledge by Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedTopic === '' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedTopic('')}
            >
              All ({stats.total})
            </Badge>
            {topics.slice(0, 20).map(topic => (
              <Badge
                key={topic.name}
                variant={selectedTopic === topic.name ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedTopic(selectedTopic === topic.name ? '' : topic.name)}
              >
                {topic.name} ({topic.total})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
          All ({stats.total})
        </Button>
        <Button variant={filter === 'verified' ? 'default' : 'outline'} onClick={() => setFilter('verified')}>
          ✅ Verified ({stats.verified})
        </Button>
        <Button variant={filter === 'unverified' ? 'default' : 'outline'} onClick={() => setFilter('unverified')}>
          ⏳ Pending ({stats.unverified})
        </Button>
      </div>

      {/* Knowledge Entries */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">⏳ Loading knowledge base...</p>
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p>No knowledge entries found</p>
            </CardContent>
          </Card>
        ) : (
          entries.map(entry => (
            <Card key={entry.id} className={!entry.verified ? 'border-yellow-300 bg-yellow-50/30' : ''}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{entry.verified ? '✅' : '⏳'}</span>
                      <Badge variant="outline">{entry.topic}</Badge>
                      {entry.subtopic && <Badge variant="secondary">{entry.subtopic}</Badge>}
                      {entry.skill_level && <Badge>{entry.skill_level}</Badge>}
                    </div>
                    <h3 className="font-semibold">{entry.concept}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{entry.explanation}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!entry.verified && (
                      <Button size="sm" variant="outline" onClick={() => verifyEntry(entry.id)}>
                        ✓ Verify
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                    >
                      {expandedId === entry.id ? '▲' : '▼'}
                    </Button>
                  </div>
                </div>
                {expandedId === entry.id && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm mb-2">Full Explanation:</h4>
                    <p className="text-sm">{entry.explanation}</p>
                    <p className="text-xs text-gray-400 mt-4">
                      ID: {entry.id} • Created: {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
