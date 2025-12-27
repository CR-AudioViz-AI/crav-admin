'use client';

import { useState, useEffect } from 'react';
import { Flag, ToggleLeft, ToggleRight, Search, Plus, Users, Globe, Beaker } from 'lucide-react';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: 'all' | 'production' | 'preview' | 'development';
  targetType: 'all' | 'percentage' | 'users';
  targetValue?: number | string[];
  createdAt: string;
}

const MOCK_FLAGS: FeatureFlag[] = [
  { id: '1', key: 'javari_voice', name: 'Javari Voice', description: 'Enable voice synthesis for Javari AI', enabled: true, environment: 'all', targetType: 'all', createdAt: '2025-12-20' },
  { id: '2', key: 'market_oracle_premium', name: 'Market Oracle Premium', description: 'Premium AI stock analysis features', enabled: true, environment: 'production', targetType: 'all', createdAt: '2025-12-15' },
  { id: '3', key: 'beta_app_builder', name: 'App Builder Beta', description: 'AI-powered app generation', enabled: true, environment: 'all', targetType: 'percentage', targetValue: 25, createdAt: '2025-12-22' },
  { id: '4', key: 'new_dashboard_ui', name: 'New Dashboard UI', description: 'Redesigned admin dashboard', enabled: false, environment: 'preview', targetType: 'all', createdAt: '2025-12-25' },
  { id: '5', key: 'stripe_subscriptions', name: 'Stripe Subscriptions', description: 'Enable Stripe subscription payments', enabled: true, environment: 'production', targetType: 'all', createdAt: '2025-11-01' },
  { id: '6', key: 'paypal_checkout', name: 'PayPal Checkout', description: 'PayPal payment option', enabled: true, environment: 'production', targetType: 'all', createdAt: '2025-11-15' },
];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(MOCK_FLAGS);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const filteredFlags = flags.filter(f =>
    f.key.toLowerCase().includes(search.toLowerCase()) ||
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: flags.length,
    enabled: flags.filter(f => f.enabled).length,
    disabled: flags.filter(f => !f.enabled).length,
    beta: flags.filter(f => f.targetType === 'percentage').length,
  };

  function toggleFlag(id: string) {
    setFlags(flags.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Flag className="w-8 h-8 text-purple-400" />
              Feature Flags
            </h1>
            <p className="text-gray-400 mt-1">Control feature rollouts across all apps</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700">
            <Plus className="w-4 h-4" />
            Create Flag
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-gray-400 text-sm">Total Flags</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-400">{stats.enabled}</div>
            <div className="text-gray-400 text-sm">Enabled</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-gray-400">{stats.disabled}</div>
            <div className="text-gray-400 text-sm">Disabled</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-yellow-400">{stats.beta}</div>
            <div className="text-gray-400 text-sm">Beta Rollouts</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search flags..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500" />
        </div>

        {/* Flags List */}
        <div className="space-y-4">
          {filteredFlags.map(flag => (
            <div key={flag.id} className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm bg-gray-700 px-2 py-1 rounded">{flag.key}</span>
                    <span className="font-medium">{flag.name}</span>
                    {flag.environment !== 'all' && (
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        flag.environment === 'production' ? 'bg-green-500/20 text-green-400' :
                        flag.environment === 'preview' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {flag.environment}
                      </span>
                    )}
                    {flag.targetType === 'percentage' && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <Beaker className="w-3 h-3" />
                        {flag.targetValue}% rollout
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{flag.description}</p>
                </div>
                <button onClick={() => toggleFlag(flag.id)} className="p-2">
                  {flag.enabled ? (
                    <ToggleRight className="w-10 h-10 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
