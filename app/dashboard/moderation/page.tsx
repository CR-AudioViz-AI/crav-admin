'use client';
import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
interface FlaggedItem { id: string; type: string; content: string; reason: string; reportedBy: string; status: 'pending' | 'approved' | 'rejected'; }
const MOCK: FlaggedItem[] = [
  { id: '1', type: 'comment', content: 'This is spam content...', reason: 'spam', reportedBy: 'user1', status: 'pending' },
  { id: '2', type: 'listing', content: 'Suspicious card listing', reason: 'fraud', reportedBy: 'user2', status: 'pending' },
];
export default function ModerationPage() {
  const [items] = useState<FlaggedItem[]>(MOCK);
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8"><h1 className="text-3xl font-bold flex items-center gap-3"><Shield className="w-8 h-8 text-amber-400" />Content Moderation</h1><p className="text-gray-400 mt-1">{items.filter(i=>i.status==='pending').length} items pending review</p></div>
        <div className="space-y-4">{items.map(item=>(
          <div key={item.id} className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div><div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400"/><span className="font-medium capitalize">{item.type}</span><span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">{item.reason}</span></div><p className="text-sm text-gray-400 mt-2">{item.content}</p></div>
              <div className="flex gap-2"><button className="p-2 bg-green-600 rounded-lg hover:bg-green-700"><CheckCircle className="w-4 h-4"/></button><button className="p-2 bg-red-600 rounded-lg hover:bg-red-700"><XCircle className="w-4 h-4"/></button></div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  );
}
