'use client';
import { useState } from 'react';
import { Scale, FileText, Shield, Clock, Edit, ExternalLink } from 'lucide-react';
interface LegalDoc { id: string; name: string; type: string; lastUpdated: string; version: string; url: string; }
const MOCK: LegalDoc[] = [
  { id: '1', name: 'Terms of Service', type: 'terms', lastUpdated: '2025-12-01', version: '2.1', url: '/legal/terms' },
  { id: '2', name: 'Privacy Policy', type: 'privacy', lastUpdated: '2025-12-01', version: '2.0', url: '/legal/privacy' },
  { id: '3', name: 'Cookie Policy', type: 'cookies', lastUpdated: '2025-11-15', version: '1.2', url: '/legal/cookies' },
  { id: '4', name: 'Refund Policy', type: 'refunds', lastUpdated: '2025-10-20', version: '1.0', url: '/legal/refunds' },
];
export default function LegalPage() {
  const [docs] = useState<LegalDoc[]>(MOCK);
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8"><h1 className="text-3xl font-bold flex items-center gap-3"><Scale className="w-8 h-8 text-indigo-400" />Legal Documents</h1></div>
        <div className="space-y-4">{docs.map(d=>(
          <div key={d.id} className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4"><FileText className="w-5 h-5 text-indigo-400"/><div><div className="font-medium">{d.name}</div><div className="text-sm text-gray-400 flex items-center gap-2"><Clock className="w-3 h-3"/>Updated {d.lastUpdated}<span className="px-2 py-0.5 bg-gray-700 rounded text-xs">v{d.version}</span></div></div></div>
            <div className="flex gap-2"><button className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="w-4 h-4"/></button><a href={d.url} target="_blank" className="p-2 hover:bg-gray-700 rounded-lg"><ExternalLink className="w-4 h-4"/></a></div>
          </div>
        ))}</div>
      </div>
    </div>
  );
}
