'use client';

import { useState, useEffect } from 'react';
import { Brain, Search, Plus, Book, FileText, Code, HelpCircle, Trash2, Edit, Eye } from 'lucide-react';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  app?: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

const CATEGORIES = [
  { id: 'product', label: 'Product Info', icon: '📦' },
  { id: 'faq', label: 'FAQs', icon: '❓' },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: '🔧' },
  { id: 'api', label: 'API Docs', icon: '🔗' },
  { id: 'pricing', label: 'Pricing', icon: '💰' },
  { id: 'features', label: 'Features', icon: '✨' },
];

const MOCK_ITEMS: KnowledgeItem[] = [
  { id: '1', title: 'What is Market Oracle?', content: 'Market Oracle is an AI-powered stock analysis tool...', category: 'product', app: 'market-oracle', createdAt: '2025-12-20', updatedAt: '2025-12-27', usageCount: 156 },
  { id: '2', title: 'How do credits work?', content: 'Credits are the universal currency across all CRAIverse apps...', category: 'faq', createdAt: '2025-12-15', updatedAt: '2025-12-25', usageCount: 432 },
  { id: '3', title: 'Payment failed troubleshooting', content: 'If your payment fails, try the following steps...', category: 'troubleshooting', createdAt: '2025-12-10', updatedAt: '2025-12-22', usageCount: 89 },
  { id: '4', title: 'Javari Chat API', content: 'POST /api/javari/chat - Send a message to Javari...', category: 'api', app: 'crav-javari', createdAt: '2025-12-01', updatedAt: '2025-12-20', usageCount: 234 },
];

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeItem[]>(MOCK_ITEMS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: items.length,
    totalUsage: items.reduce((sum, i) => sum + i.usageCount, 0),
    categories: CATEGORIES.map(c => ({ ...c, count: items.filter(i => i.category === c.id).length })),
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              Javari Knowledge Base
            </h1>
            <p className="text-gray-400 mt-1">{stats.total} entries • {stats.totalUsage.toLocaleString()} total lookups</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700">
            <Plus className="w-4 h-4" />
            Add Knowledge
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${!selectedCategory ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            All ({stats.total})
          </button>
          {stats.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === cat.id ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Items */}
        <div className="grid gap-4">
          {filteredItems.map(item => {
            const category = CATEGORIES.find(c => c.id === item.category);
            return (
              <div key={item.id} className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category?.icon}</span>
                      <h3 className="font-medium">{item.title}</h3>
                      {item.app && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">{item.app}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">{item.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.usageCount} lookups</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-gray-700 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
