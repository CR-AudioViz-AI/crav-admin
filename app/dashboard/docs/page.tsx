'use client';

import { useState } from 'react';
import { Book, CheckCircle, Circle, AlertCircle, Search, Filter, ExternalLink } from 'lucide-react';

interface AppDoc {
  app: string;
  displayName: string;
  docs: {
    customer: { complete: boolean; url?: string };
    developer: { complete: boolean; url?: string };
    owner: { complete: boolean; url?: string };
    architecture: { complete: boolean; url?: string };
  };
}

const MOCK_DOCS: AppDoc[] = [
  { app: 'crav-javari', displayName: 'Javari AI', docs: { customer: { complete: true, url: '#' }, developer: { complete: true, url: '#' }, owner: { complete: true, url: '#' }, architecture: { complete: true, url: '#' } } },
  { app: 'market-oracle', displayName: 'Market Oracle', docs: { customer: { complete: true, url: '#' }, developer: { complete: true, url: '#' }, owner: { complete: false }, architecture: { complete: true, url: '#' } } },
  { app: 'crav-cardverse', displayName: 'CardVerse', docs: { customer: { complete: true, url: '#' }, developer: { complete: false }, owner: { complete: false }, architecture: { complete: false } } },
  { app: 'cravbarrels', displayName: 'CravBarrels', docs: { customer: { complete: true, url: '#' }, developer: { complete: true, url: '#' }, owner: { complete: false }, architecture: { complete: false } } },
  { app: 'crav-scrapbook', displayName: 'Scrapbook', docs: { customer: { complete: false }, developer: { complete: false }, owner: { complete: false }, architecture: { complete: false } } },
  { app: 'crav-admin', displayName: 'Admin Dashboard', docs: { customer: { complete: false }, developer: { complete: true, url: '#' }, owner: { complete: true, url: '#' }, architecture: { complete: true, url: '#' } } },
];

export default function DocsPage() {
  const [apps, setApps] = useState<AppDoc[]>(MOCK_DOCS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete'>('all');

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.displayName.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    const allComplete = Object.values(app.docs).every(d => d.complete);
    return matchesSearch && (filter === 'complete' ? allComplete : !allComplete);
  });

  const stats = {
    total: apps.length,
    fullyDocumented: apps.filter(a => Object.values(a.docs).every(d => d.complete)).length,
    customerDocs: apps.filter(a => a.docs.customer.complete).length,
    developerDocs: apps.filter(a => a.docs.developer.complete).length,
    ownerDocs: apps.filter(a => a.docs.owner.complete).length,
    archDocs: apps.filter(a => a.docs.architecture.complete).length,
  };

  const DocStatus = ({ complete, url }: { complete: boolean; url?: string }) => (
    <div className="flex items-center gap-2">
      {complete ? (
        <CheckCircle className="w-5 h-5 text-green-400" />
      ) : (
        <Circle className="w-5 h-5 text-gray-500" />
      )}
      {complete && url && (
        <a href={url} target="_blank" className="text-blue-400 hover:underline text-sm">
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Book className="w-8 h-8 text-blue-400" />
              Documentation Center
            </h1>
            <p className="text-gray-400 mt-1">Track documentation status across all apps</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-gray-400 text-sm">Total Apps</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-400">{stats.fullyDocumented}</div>
            <div className="text-gray-400 text-sm">Fully Documented</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-blue-400">{stats.customerDocs}</div>
            <div className="text-gray-400 text-sm">Customer Docs</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-purple-400">{stats.developerDocs}</div>
            <div className="text-gray-400 text-sm">Developer Docs</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-yellow-400">{stats.archDocs}</div>
            <div className="text-gray-400 text-sm">Architecture</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search apps..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg">
            <option value="all">All Apps</option>
            <option value="complete">Fully Documented</option>
            <option value="incomplete">Missing Docs</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">App</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-gray-400">Customer</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-gray-400">Developer</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-gray-400">Owner</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-gray-400">Architecture</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(app => (
                <tr key={app.app} className="border-t border-gray-700 hover:bg-gray-700/30">
                  <td className="px-6 py-4 font-medium">{app.displayName}</td>
                  <td className="px-6 py-4 text-center"><DocStatus {...app.docs.customer} /></td>
                  <td className="px-6 py-4 text-center"><DocStatus {...app.docs.developer} /></td>
                  <td className="px-6 py-4 text-center"><DocStatus {...app.docs.owner} /></td>
                  <td className="px-6 py-4 text-center"><DocStatus {...app.docs.architecture} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
