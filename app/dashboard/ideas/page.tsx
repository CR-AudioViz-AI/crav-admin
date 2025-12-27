'use client';
import { useState } from 'react';
import { Lightbulb, ThumbsUp, MessageSquare, Plus, TrendingUp, Clock, CheckCircle } from 'lucide-react';
interface Idea { id: string; title: string; description: string; votes: number; comments: number; status: 'new' | 'planned' | 'building' | 'done'; category: string; author: string; createdAt: string; }
const MOCK: Idea[] = [
  { id: '1', title: 'Voice commands for Javari', description: 'Allow users to speak to Javari', votes: 45, comments: 12, status: 'building', category: 'feature', author: 'john@ex.com', createdAt: '2025-12-20' },
  { id: '2', title: 'Dark mode for all apps', description: 'Consistent dark theme', votes: 38, comments: 8, status: 'done', category: 'ui', author: 'jane@ex.com', createdAt: '2025-12-15' },
  { id: '3', title: 'Mobile app', description: 'Native iOS/Android app', votes: 72, comments: 23, status: 'planned', category: 'feature', author: 'bob@ex.com', createdAt: '2025-12-10' },
];
export default function IdeasPage() {
  const [ideas] = useState<Idea[]>(MOCK);
  const statusColors: Record<string, string> = { new: 'bg-blue-500', planned: 'bg-yellow-500', building: 'bg-purple-500', done: 'bg-green-500' };
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold flex items-center gap-3"><Lightbulb className="w-8 h-8 text-yellow-400" />Idea Board</h1><p className="text-gray-400 mt-1">Community feature requests and voting</p></div>
          <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-700"><Plus className="w-4 h-4" />Submit Idea</button>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-8">{['new','planned','building','done'].map(s=><div key={s} className="bg-gray-800 rounded-xl p-4"><div className="text-2xl font-bold">{ideas.filter(i=>i.status===s).length}</div><div className="text-gray-400 text-sm capitalize">{s}</div></div>)}</div>
        <div className="space-y-4">{ideas.sort((a,b)=>b.votes-a.votes).map(idea=>(
          <div key={idea.id} className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1"><button className="p-2 hover:bg-gray-700 rounded-lg"><ThumbsUp className="w-5 h-5"/></button><span className="font-bold">{idea.votes}</span></div>
              <div className="flex-1"><div className="flex items-center gap-3"><h3 className="font-medium">{idea.title}</h3><span className={`px-2 py-0.5 text-xs rounded text-white ${statusColors[idea.status]}`}>{idea.status}</span></div><p className="text-sm text-gray-400 mt-1">{idea.description}</p><div className="flex items-center gap-4 mt-2 text-xs text-gray-500"><span className="flex items-center gap-1"><MessageSquare className="w-3 h-3"/>{idea.comments}</span><span>{idea.author}</span></div></div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  );
}
