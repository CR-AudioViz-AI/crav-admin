'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  BookOpen,
  Sparkles,
  Activity,
  TrendingUp,
  Database,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface KnowledgeEntry {
  id: string;
  topic: string;
  subtopic: string | null;
  skill_level: string | null;
  concept: string;
  explanation: string;
  examples: string[];
  best_practices: string[];
  common_mistakes: string[];
  verified: boolean;
  verified_at: string | null;
  tags: string[] | null;
  confidence_score: number;
  times_referenced: number;
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
  verified: number;
  unverified: number;
}

const JAVARI_API_BASE = 'https://javariai.com/api/javari';

export default function JavariKnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [topics, setTopics] = useState<TopicStats[]>([]);
  const [stats, setStats] = useState<KnowledgeStats>({ total: 0, verified: 0, unverified: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'degraded' | 'down' | 'checking'>('checking');

  const fetchKnowledge = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('filter', filter);
      if (selectedTopic) params.set('topic', selectedTopic);
      params.set('limit', '100');

      const response = await fetch(`${JAVARI_API_BASE}/knowledge?${params}`);
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
      const response = await fetch(`${JAVARI_API_BASE}/health`);
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
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchKnowledge();
      checkHealth();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchKnowledge, checkHealth]);

  const verifyEntry = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${JAVARI_API_BASE}/knowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'verify' }),
      });
      if (response.ok) {
        fetchKnowledge();
      }
    } catch (error) {
      console.error('Failed to verify:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectEntry = async (id: string) => {
    if (!confirm('Delete this knowledge entry?')) return;
    setActionLoading(id);
    try {
      const response = await fetch(`${JAVARI_API_BASE}/knowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject' }),
      });
      if (response.ok) {
        fetchKnowledge();
      }
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.concept.toLowerCase().includes(query) ||
      entry.explanation.toLowerCase().includes(query) ||
      entry.topic.toLowerCase().includes(query)
    );
  });

  const getHealthColor = () => {
    switch (healthStatus) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            Javari Knowledge Base
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Activity className={`h-4 w-4 ${getHealthColor()}`} />
            {healthStatus === 'healthy' ? 'System Healthy' : healthStatus === 'checking' ? 'Checking...' : 'System Issues'}
            {lastRefresh && (
              <span className="text-xs">• Last updated: {lastRefresh.toLocaleTimeString()}</span>
            )}
          </p>
        </div>
        <Button onClick={fetchKnowledge} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Knowledge</p>
                <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
              </div>
              <Database className="h-10 w-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.unverified}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Topics</p>
                <p className="text-3xl font-bold text-blue-600">{topics.length}</p>
              </div>
              <BookOpen className="h-10 w-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-50 to-white border-cyan-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Learning</p>
                <p className="text-xl font-bold text-cyan-600">Active</p>
              </div>
              <Sparkles className="h-10 w-10 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Distribution */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Knowledge by Topic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {topics.slice(0, 15).map(topic => (
              <Badge
                key={topic.name}
                variant={selectedTopic === topic.name ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedTopic(selectedTopic === topic.name ? '' : topic.name)}
              >
                {topic.name} ({topic.total})
              </Badge>
            ))}
            {topics.length > 15 && (
              <Badge variant="secondary">+{topics.length - 15} more</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search knowledge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
            All ({stats.total})
          </Button>
          <Button variant={filter === 'verified' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('verified')}>
            <CheckCircle className="h-4 w-4 mr-1" /> Verified ({stats.verified})
          </Button>
          <Button variant={filter === 'unverified' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('unverified')}>
            <Clock className="h-4 w-4 mr-1" /> Pending ({stats.unverified})
          </Button>
        </div>
      </div>

      {/* Knowledge Entries */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-500" />
            <p className="mt-2 text-muted-foreground">Loading knowledge base...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-2">No knowledge entries found</p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map(entry => (
            <Card key={entry.id} className={!entry.verified ? 'border-yellow-300 bg-yellow-50/30' : ''}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {entry.verified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <Badge variant="outline">{entry.topic}</Badge>
                      {entry.subtopic && <Badge variant="secondary">{entry.subtopic}</Badge>}
                      {entry.skill_level && (
                        <Badge className="text-xs">{entry.skill_level}</Badge>
                      )}
                    </div>
                    <h3 className="font-medium">{entry.concept}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{entry.explanation}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!entry.verified && (
                      <>
                        <Button size="sm" variant="outline" className="text-green-600" onClick={() => verifyEntry(entry.id)} disabled={actionLoading === entry.id}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => rejectEntry(entry.id)} disabled={actionLoading === entry.id}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>
                      {expandedId === entry.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {expandedId === entry.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm">Full Explanation</h4>
                      <p className="text-sm mt-1">{entry.explanation}</p>
                    </div>
                    {entry.examples?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm">Examples</h4>
                        {entry.examples.map((ex, i) => (
                          <pre key={i} className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">{ex}</pre>
                        ))}
                      </div>
                    )}
                    {entry.best_practices?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm">Best Practices</h4>
                        <ul className="text-sm list-disc list-inside">{entry.best_practices.map((bp, i) => <li key={i}>{bp}</li>)}</ul>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      ID: {entry.id} • Created: {new Date(entry.created_at).toLocaleString()}
                    </div>
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
