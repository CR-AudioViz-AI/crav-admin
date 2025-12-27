'use client';

import { useState, useEffect } from 'react';
import { GitBranch, Star, Eye, GitFork, Clock, ExternalLink, RefreshCw, Search, AlertCircle } from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  default_branch: string;
}

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRepos();
  }, []);

  async function fetchRepos() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/repositories');
      const data = await res.json();
      setRepos(data.repos || []);
    } catch (err) {
      console.error('Failed to fetch repos:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredRepos = repos.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: repos.length,
    withIssues: repos.filter(r => r.open_issues_count > 0).length,
    languages: [...new Set(repos.map(r => r.language).filter(Boolean))].length,
  };

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      TypeScript: 'bg-blue-500',
      JavaScript: 'bg-yellow-500',
      Python: 'bg-green-500',
      CSS: 'bg-purple-500',
      HTML: 'bg-orange-500',
    };
    return colors[lang] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <GitBranch className="w-8 h-8 text-green-400" />
              GitHub Repositories
            </h1>
            <p className="text-gray-400 mt-1">{stats.total} repositories • {stats.languages} languages</p>
          </div>
          <button onClick={fetchRepos} className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-gray-400 text-sm">Total Repos</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-yellow-400">{stats.withIssues}</div>
            <div className="text-gray-400 text-sm">With Open Issues</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-purple-400">{stats.languages}</div>
            <div className="text-gray-400 text-sm">Languages</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Repos Grid */}
        <div className="grid gap-4">
          {loading ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400">Loading repositories...</div>
          ) : (
            filteredRepos.map(repo => (
              <div key={repo.id} className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <a href={repo.html_url} target="_blank" className="font-medium text-blue-400 hover:underline">
                        {repo.name}
                      </a>
                      {repo.language && (
                        <span className={`px-2 py-0.5 text-xs rounded ${getLanguageColor(repo.language)} text-white`}>
                          {repo.language}
                        </span>
                      )}
                      {repo.open_issues_count > 0 && (
                        <span className="flex items-center gap-1 text-yellow-400 text-sm">
                          <AlertCircle className="w-3 h-3" />
                          {repo.open_issues_count} issues
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-sm text-gray-400 mt-1">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" /> {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" /> {repo.forks_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(repo.pushed_at).toLocaleDateString()}
                      </span>
                      <span className="text-gray-600">{repo.default_branch}</span>
                    </div>
                  </div>
                  <a href={repo.html_url} target="_blank" className="p-2 hover:bg-gray-700 rounded-lg">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
