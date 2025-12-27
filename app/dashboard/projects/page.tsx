'use client';
import { useState } from 'react';
import { FolderKanban, Plus, ExternalLink, Github, Globe } from 'lucide-react';
interface Project { id: string; name: string; description: string; status: 'active' | 'maintenance' | 'archived'; repo: string; url?: string; }
const MOCK: Project[] = [
  { id: '1', name: 'Javari AI', description: 'AI assistant platform', status: 'active', repo: 'crav-javari', url: 'javariai.com' },
  { id: '2', name: 'Market Oracle', description: 'Stock analysis tool', status: 'active', repo: 'crav-market-oracle', url: 'marketoracle.app' },
  { id: '3', name: 'CravBarrels', description: 'Spirits collection', status: 'active', repo: 'cravbarrels', url: 'cravbarrels.com' },
];
export default function ProjectsPage() {
  const [projects] = useState<Project[]>(MOCK);
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold flex items-center gap-3"><FolderKanban className="w-8 h-8 text-blue-400" />Projects</h1><p className="text-gray-400 mt-1">Manage all CRAIverse projects</p></div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg"><Plus className="w-4 h-4"/>New Project</button>
        </div>
        <div className="grid gap-4">{projects.map(p=>(
          <div key={p.id} className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div><div className="font-medium">{p.name}</div><div className="text-sm text-gray-400">{p.description}</div></div>
            <div className="flex items-center gap-4">
              <span className={`px-2 py-1 text-xs rounded ${p.status==='active'?'bg-green-500/20 text-green-400':'bg-gray-500/20 text-gray-400'}`}>{p.status}</span>
              <a href={`https://github.com/CR-AudioViz-AI/${p.repo}`} target="_blank" className="p-2 hover:bg-gray-700 rounded-lg"><Github className="w-4 h-4"/></a>
              {p.url && <a href={`https://${p.url}`} target="_blank" className="p-2 hover:bg-gray-700 rounded-lg"><Globe className="w-4 h-4"/></a>}
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  );
}
