'use client';

import { useState, useEffect } from 'react';
import { Key, Shield, Eye, EyeOff, Copy, Search, Plus, RefreshCw, AlertTriangle, Check } from 'lucide-react';

interface Credential {
  id: string;
  key: string;
  value: string;
  category: string;
  target: string[];
  created_at: string;
  comment?: string;
}

const CATEGORIES = [
  { id: 'ai', label: 'AI Providers', icon: '🤖', color: 'from-purple-500 to-purple-600' },
  { id: 'payment', label: 'Payment', icon: '💳', color: 'from-green-500 to-green-600' },
  { id: 'database', label: 'Database', icon: '🗄️', color: 'from-blue-500 to-blue-600' },
  { id: 'auth', label: 'Authentication', icon: '🔐', color: 'from-yellow-500 to-yellow-600' },
  { id: 'analytics', label: 'Analytics', icon: '📊', color: 'from-pink-500 to-pink-600' },
  { id: 'storage', label: 'Storage', icon: '☁️', color: 'from-cyan-500 to-cyan-600' },
  { id: 'email', label: 'Email', icon: '📧', color: 'from-red-500 to-red-600' },
  { id: 'apis', label: 'External APIs', icon: '🔗', color: 'from-indigo-500 to-indigo-600' },
  { id: 'media', label: 'Media', icon: '🎬', color: 'from-orange-500 to-orange-600' },
  { id: 'affiliate', label: 'Affiliates', icon: '💰', color: 'from-emerald-500 to-emerald-600' },
];

export default function VaultPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchCredentials();
  }, []);

  async function fetchCredentials() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/vault');
      const data = await res.json();
      setCredentials(data.credentials || []);
    } catch (err) {
      console.error('Failed to fetch credentials:', err);
    } finally {
      setLoading(false);
    }
  }

  function toggleVisibility(key: string) {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(key)) {
      newVisible.delete(key);
    } else {
      newVisible.add(key);
    }
    setVisibleKeys(newVisible);
  }

  async function copyToClipboard(value: string, key: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const filteredCredentials = credentials.filter(cred => {
    const matchesSearch = cred.key.toLowerCase().includes(search.toLowerCase()) ||
      cred.comment?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || cred.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = CATEGORIES.map(cat => ({
    ...cat,
    count: credentials.filter(c => c.category === cat.id).length
  }));

  const totalCredentials = credentials.length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-400" />
              Credentials Vault
            </h1>
            <p className="text-gray-400 mt-1">{totalCredentials} credentials secured • Synced from Vercel</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchCredentials} className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add Credential
            </button>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {categoryCounts.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`p-4 rounded-xl transition-all ${
                selectedCategory === cat.id
                  ? `bg-gradient-to-br ${cat.color} shadow-lg scale-105`
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div className="text-left">
                  <div className="text-xl font-bold">{cat.count}</div>
                  <div className="text-xs text-gray-300">{cat.label}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search credentials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Credentials List */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-700">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading credentials...</div>
            ) : filteredCredentials.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No credentials found</div>
            ) : (
              filteredCredentials.map(cred => (
                <div key={cred.id} className="p-4 hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-green-400" />
                        <span className="font-mono font-medium">{cred.key}</span>
                        {cred.target?.includes('production') && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">PROD</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-4">
                        <span className="text-sm text-gray-400 font-mono">
                          {visibleKeys.has(cred.key)
                            ? cred.value
                            : cred.value?.substring(0, 8) + '•'.repeat(20)}
                        </span>
                      </div>
                      {cred.comment && (
                        <div className="text-xs text-gray-500 mt-1">{cred.comment}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleVisibility(cred.key)}
                        className="p-2 hover:bg-gray-600 rounded-lg"
                      >
                        {visibleKeys.has(cred.key) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(cred.value, cred.key)}
                        className="p-2 hover:bg-gray-600 rounded-lg"
                      >
                        {copiedKey === cred.key ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
