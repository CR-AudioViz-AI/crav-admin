'use client';

import { useState, useEffect } from 'react';
import { Bot, Plus, Play, Pause, Trash2, Settings, Clock, Zap, TrendingUp, Newspaper, Package } from 'lucide-react';

interface BotConfig {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'error';
  schedule: string;
  lastRun?: string;
  nextRun?: string;
  runsToday: number;
  config: Record<string, unknown>;
}

const BOT_TYPES = [
  { id: 'trending', label: 'Trending Bot', icon: TrendingUp, desc: 'Monitor trending topics and products', color: 'from-orange-500 to-red-500' },
  { id: 'news', label: 'News Bot', icon: Newspaper, desc: 'Aggregate news from multiple sources', color: 'from-blue-500 to-cyan-500' },
  { id: 'product', label: 'Product Bot', icon: Package, desc: 'Track product prices and availability', color: 'from-green-500 to-emerald-500' },
  { id: 'social', label: 'Social Bot', icon: Zap, desc: 'Monitor social media mentions', color: 'from-purple-500 to-pink-500' },
  { id: 'scraper', label: 'Web Scraper', icon: Bot, desc: 'Custom web scraping bot', color: 'from-gray-500 to-gray-600' },
  { id: 'scheduler', label: 'Task Scheduler', icon: Clock, desc: 'Schedule recurring tasks', color: 'from-yellow-500 to-orange-500' },
];

export default function BotFactoryPage() {
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newBotType, setNewBotType] = useState<string | null>(null);
  const [newBotName, setNewBotName] = useState('');

  useEffect(() => {
    fetchBots();
  }, []);

  async function fetchBots() {
    try {
      const res = await fetch('/api/admin/bots');
      const data = await res.json();
      setBots(data.bots || []);
    } catch (err) {
      console.error('Failed to fetch bots:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createBot() {
    if (!newBotName || !newBotType) return;
    try {
      await fetch('/api/admin/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBotName, type: newBotType }),
      });
      setShowCreate(false);
      setNewBotName('');
      setNewBotType(null);
      fetchBots();
    } catch (err) {
      console.error('Failed to create bot:', err);
    }
  }

  async function toggleBot(botId: string, currentStatus: string) {
    try {
      await fetch(`/api/admin/bots/${botId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus === 'active' ? 'paused' : 'active' }),
      });
      fetchBots();
    } catch (err) {
      console.error('Failed to toggle bot:', err);
    }
  }

  const stats = {
    total: bots.length,
    active: bots.filter(b => b.status === 'active').length,
    paused: bots.filter(b => b.status === 'paused').length,
    error: bots.filter(b => b.status === 'error').length,
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bot className="w-8 h-8 text-purple-400" />
              Bot Factory
            </h1>
            <p className="text-gray-400 mt-1">Create and manage automated bots</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Create Bot
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-gray-400 text-sm">Total Bots</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-400">{stats.active}</div>
            <div className="text-gray-400 text-sm">Active</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-yellow-400">{stats.paused}</div>
            <div className="text-gray-400 text-sm">Paused</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-red-400">{stats.error}</div>
            <div className="text-gray-400 text-sm">Errors</div>
          </div>
        </div>

        {/* Bot Types for Creation */}
        {showCreate && (
          <div className="mb-8 bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">Create New Bot</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {BOT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setNewBotType(type.id)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    newBotType === type.id
                      ? `bg-gradient-to-br ${type.color} shadow-lg`
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <type.icon className="w-6 h-6 mb-2" />
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-gray-300 mt-1">{type.desc}</div>
                </button>
              ))}
            </div>
            {newBotType && (
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  placeholder="Bot name..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                />
                <button
                  onClick={createBot}
                  className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  Create
                </button>
                <button
                  onClick={() => { setShowCreate(false); setNewBotType(null); }}
                  className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bots List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400">Loading bots...</div>
          ) : bots.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400">
              No bots created yet. Click &quot;Create Bot&quot; to get started.
            </div>
          ) : (
            bots.map(bot => {
              const botType = BOT_TYPES.find(t => t.id === bot.type);
              const TypeIcon = botType?.icon || Bot;
              return (
                <div key={bot.id} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${botType?.color || 'from-gray-500 to-gray-600'}`}>
                        <TypeIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-medium">{bot.name}</div>
                        <div className="text-sm text-gray-400">{botType?.label || bot.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className={`font-medium ${
                          bot.status === 'active' ? 'text-green-400' :
                          bot.status === 'paused' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {bot.status.toUpperCase()}
                        </div>
                        <div className="text-gray-500">{bot.runsToday} runs today</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleBot(bot.id, bot.status)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                        >
                          {bot.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
