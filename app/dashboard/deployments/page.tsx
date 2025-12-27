'use client';

import { useState, useEffect } from 'react';
import { Rocket, Globe, GitBranch, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface Deployment {
  id: string;
  name: string;
  url: string;
  state: 'READY' | 'ERROR' | 'BUILDING' | 'QUEUED';
  target: string;
  created: string;
  meta?: { githubCommitMessage?: string };
}

interface Project {
  id: string;
  name: string;
  framework: string;
  latestDeployments: Deployment[];
  link?: { type: string; repo: string };
}

export default function DeploymentsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'error' | 'ready'>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/deployments');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }

  async function triggerRedeploy(projectId: string) {
    try {
      await fetch('/api/admin/deployments/redeploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      fetchProjects();
    } catch (err) {
      console.error('Redeploy failed:', err);
    }
  }

  const stats = {
    total: projects.length,
    ready: projects.filter(p => p.latestDeployments?.[0]?.state === 'READY').length,
    error: projects.filter(p => p.latestDeployments?.[0]?.state === 'ERROR').length,
    building: projects.filter(p => p.latestDeployments?.[0]?.state === 'BUILDING').length,
  };

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true;
    const state = p.latestDeployments?.[0]?.state;
    return filter === 'error' ? state === 'ERROR' : state === 'READY';
  });

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'READY': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'ERROR': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'BUILDING': return <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Rocket className="w-8 h-8 text-blue-400" />
              Vercel Deployments
            </h1>
            <p className="text-gray-400 mt-1">{stats.total} projects • {stats.ready} healthy • {stats.error} errors</p>
          </div>
          <button onClick={fetchProjects} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-gray-400 text-sm">Total Projects</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-400">{stats.ready}</div>
            <div className="text-gray-400 text-sm">Healthy</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-red-400">{stats.error}</div>
            <div className="text-gray-400 text-sm">Errors</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-yellow-400">{stats.building}</div>
            <div className="text-gray-400 text-sm">Building</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(['all', 'ready', 'error'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === f ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid gap-4">
          {loading ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400">Loading projects...</div>
          ) : (
            filteredProjects.map(project => {
              const latest = project.latestDeployments?.[0];
              return (
                <div key={project.id} className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStateIcon(latest?.state || 'QUEUED')}
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <Globe className="w-3 h-3" />
                          {latest?.url || 'No deployment'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="text-gray-400">{project.framework || 'Next.js'}</div>
                        <div className="text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {latest?.created ? new Date(latest.created).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => triggerRedeploy(project.id)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                          title="Redeploy"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        {latest?.url && (
                          <a
                            href={`https://${latest.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
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
