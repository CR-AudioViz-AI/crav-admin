'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function JavariAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [bots, setBots] = useState<any[]>([]);
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [feedUrl, setFeedUrl] = useState('');
  const [feedTopic, setFeedTopic] = useState('');
  const [feedText, setFeedText] = useState('');
  const [feedResult, setFeedResult] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    
    // Load stats
    const { data: statsData } = await supabase
      .from('admin_knowledge_overview')
      .select('*')
      .single();
    setStats(statsData);

    // Load sources
    const { data: sourcesData } = await supabase
      .from('knowledge_sources')
      .select('*')
      .order('priority', { ascending: false });
    setSources(sourcesData || []);

    // Load apps
    const { data: appsData } = await supabase
      .from('admin_app_health')
      .select('*');
    setApps(appsData || []);

    // Load bots
    const { data: botsData } = await supabase
      .from('admin_bot_status')
      .select('*');
    setBots(botsData || []);

    // Load recent knowledge
    const { data: knowledgeData } = await supabase
      .from('javari_knowledge')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setKnowledge(knowledgeData || []);

    setLoading(false);
  }

  async function handleFeed() {
    setFeedResult('Processing...');
    try {
      const res = await fetch('/api/admin/javari/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedUrl ? 'url' : 'text',
          url: feedUrl,
          text: feedText,
          topic: feedTopic,
          category: 'general'
        })
      });
      const data = await res.json();
      setFeedResult(data.success ? `✅ Added ${data.entriesCreated} entries` : `❌ ${data.error}`);
      if (data.success) loadData();
    } catch (e) {
      setFeedResult(`❌ Error: ${e}`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading Javari Brain...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧠 Javari AI Dashboard</h1>
        <p className="text-gray-400">Monitor, manage, and feed her knowledge</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {['overview', 'knowledge', 'sources', 'apps', 'bots', 'feed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg capitalize ${
              activeTab === tab ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
        <button onClick={loadData} className="px-4 py-2 bg-gray-800 rounded-lg ml-auto">
          🔄 Refresh
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Knowledge" value={stats.total_knowledge} />
            <StatCard label="Verified" value={stats.verified_knowledge} />
            <StatCard label="Knowledge Sources" value={stats.active_sources} />
            <StatCard label="Insights" value={stats.total_insights} />
            <StatCard label="Error Patterns" value={stats.error_patterns_count} />
            <StatCard label="Cached Solutions" value={stats.cached_solutions} />
            <StatCard label="Topics" value={stats.unique_topics} />
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">📱 Apps ({apps.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {apps.map((app: any) => (
                <div key={app.app_name} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{app.display_name}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      app.status === 'live' ? 'bg-green-600' : 'bg-yellow-600'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  {app.open_errors > 0 && (
                    <div className="text-red-400 text-sm mt-1">⚠️ {app.open_errors} errors</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">🤖 Bots ({bots.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {bots.map((bot: any) => (
                <div key={bot.bot_name} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{bot.bot_name}</span>
                    <span className={`w-3 h-3 rounded-full ${bot.is_active ? 'bg-green-400' : 'bg-gray-600'}`} />
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    {bot.total_runs} runs • {bot.success_rate}% success
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Tab */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">📚 Knowledge Base ({knowledge.length} recent entries)</h2>
          {knowledge.map((k: any) => (
            <div key={k.id} className="bg-gray-900 p-4 rounded-lg">
              <div className="flex gap-2 mb-2">
                <span className="px-2 py-1 bg-purple-600/30 rounded text-xs">{k.topic}</span>
                {k.subtopic && <span className="px-2 py-1 bg-gray-700 rounded text-xs">{k.subtopic}</span>}
                {k.verified && <span className="px-2 py-1 bg-green-600/30 rounded text-xs">✓ Verified</span>}
              </div>
              <div className="font-medium">{k.concept}</div>
              <div className="text-gray-400 text-sm mt-1 line-clamp-2">{k.explanation}</div>
            </div>
          ))}
        </div>
      )}

      {/* Sources Tab */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">🌐 Knowledge Sources ({sources.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sources.map((s: any) => (
              <div key={s.id} className="bg-gray-900 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{s.source_name}</span>
                  <span className={`w-2 h-2 rounded-full ${s.is_active ? 'bg-green-400' : 'bg-gray-600'}`} />
                </div>
                <div className="text-gray-400 text-xs">{s.category} • {s.source_type} • P{s.priority}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apps Tab */}
      {activeTab === 'apps' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">📱 Registered Apps ({apps.length})</h2>
          {apps.map((app: any) => (
            <div key={app.app_name} className="bg-gray-900 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-lg">{app.display_name}</div>
                  <div className="text-gray-400 text-sm">{app.app_name}</div>
                </div>
                <span className={`px-3 py-1 rounded ${
                  app.status === 'live' ? 'bg-green-600' : 
                  app.status === 'development' ? 'bg-yellow-600' : 'bg-gray-600'
                }`}>
                  {app.status}
                </span>
              </div>
              {app.production_url && (
                <a href={app.production_url} target="_blank" className="text-blue-400 text-sm hover:underline block mt-2">
                  {app.production_url}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bots Tab */}
      {activeTab === 'bots' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">🤖 Autonomous Bots ({bots.length})</h2>
          {bots.map((bot: any) => (
            <div key={bot.bot_name} className="bg-gray-900 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="font-medium text-lg">{bot.bot_name}</div>
                  <div className="text-gray-400 text-sm">{bot.bot_type}</div>
                </div>
                <span className={`px-3 py-1 rounded ${bot.is_active ? 'bg-green-600' : 'bg-gray-600'}`}>
                  {bot.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-800 p-3 rounded">
                  <div className="text-2xl font-bold">{bot.total_runs}</div>
                  <div className="text-xs text-gray-400">Total Runs</div>
                </div>
                <div className="bg-gray-800 p-3 rounded">
                  <div className="text-2xl font-bold text-green-400">{bot.successful_runs}</div>
                  <div className="text-xs text-gray-400">Successful</div>
                </div>
                <div className="bg-gray-800 p-3 rounded">
                  <div className={`text-2xl font-bold ${bot.success_rate >= 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {bot.success_rate}%
                  </div>
                  <div className="text-xs text-gray-400">Success Rate</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold mb-4">➕ Feed Javari New Knowledge</h2>
          <div className="bg-gray-900 p-6 rounded-lg space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Topic *</label>
              <input
                type="text"
                value={feedTopic}
                onChange={(e) => setFeedTopic(e.target.value)}
                placeholder="e.g., Stripe Webhooks, Florida Real Estate"
                className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">URL to Scrape</label>
              <input
                type="url"
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                placeholder="https://docs.stripe.com/webhooks"
                className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Or Paste Text Directly</label>
              <textarea
                value={feedText}
                onChange={(e) => setFeedText(e.target.value)}
                placeholder="Paste documentation, guides, or knowledge here..."
                rows={6}
                className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none font-mono text-sm"
              />
            </div>
            <button
              onClick={handleFeed}
              disabled={!feedTopic || (!feedUrl && !feedText)}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg font-medium"
            >
              ⚡ Feed to Javari
            </button>
            {feedResult && (
              <div className={`p-4 rounded-lg ${feedResult.startsWith('✅') ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                {feedResult}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <div className="text-3xl font-bold">{value?.toLocaleString() || 0}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
}
