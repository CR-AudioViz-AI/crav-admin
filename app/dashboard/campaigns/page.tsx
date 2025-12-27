'use client';
import { useState } from 'react';
import { Mail, Plus, Play, Pause, BarChart3, Users, Send } from 'lucide-react';
interface Campaign { id: string; name: string; status: 'draft' | 'active' | 'paused' | 'completed'; sent: number; opened: number; clicked: number; }
const MOCK: Campaign[] = [
  { id: '1', name: 'Welcome Series', status: 'active', sent: 1250, opened: 890, clicked: 234 },
  { id: '2', name: 'Market Oracle Launch', status: 'completed', sent: 3500, opened: 2100, clicked: 567 },
  { id: '3', name: 'Holiday Promo', status: 'draft', sent: 0, opened: 0, clicked: 0 },
];
export default function CampaignsPage() {
  const [campaigns] = useState<Campaign[]>(MOCK);
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold flex items-center gap-3"><Mail className="w-8 h-8 text-rose-400" />Email Campaigns</h1></div>
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 rounded-lg"><Plus className="w-4 h-4"/>New Campaign</button>
        </div>
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-700/50"><th className="text-left px-6 py-4 text-sm text-gray-400">Campaign</th><th className="text-center px-6 py-4 text-sm text-gray-400">Status</th><th className="text-right px-6 py-4 text-sm text-gray-400">Sent</th><th className="text-right px-6 py-4 text-sm text-gray-400">Open Rate</th><th className="text-right px-6 py-4 text-sm text-gray-400">Click Rate</th></tr></thead>
            <tbody>{campaigns.map(c=>(
              <tr key={c.id} className="border-t border-gray-700">
                <td className="px-6 py-4 font-medium">{c.name}</td>
                <td className="px-6 py-4 text-center"><span className={`px-2 py-1 text-xs rounded ${c.status==='active'?'bg-green-500/20 text-green-400':c.status==='completed'?'bg-blue-500/20 text-blue-400':'bg-gray-500/20 text-gray-400'}`}>{c.status}</span></td>
                <td className="px-6 py-4 text-right">{c.sent.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">{c.sent?(c.opened/c.sent*100).toFixed(1):0}%</td>
                <td className="px-6 py-4 text-right">{c.sent?(c.clicked/c.sent*100).toFixed(1):0}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
