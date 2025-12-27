'use client';
import { useState } from 'react';
import { Key, Plus, Copy, Trash2, RefreshCw, Check } from 'lucide-react';
interface ApiKey { id: string; name: string; key: string; permissions: string[]; lastUsed?: string; requests: number; }
const MOCK: ApiKey[] = [
  { id: '1', name: 'Production Key', key: 'crav_live_xxxxx...xxxxx', permissions: ['read', 'write'], lastUsed: '2025-12-27', requests: 15234 },
  { id: '2', name: 'Development Key', key: 'crav_dev_xxxxx...xxxxx', permissions: ['read'], lastUsed: '2025-12-26', requests: 890 },
];
export default function ApiGatewayPage() {
  const [keys] = useState<ApiKey[]>(MOCK);
  const [copied, setCopied] = useState<string|null>(null);
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold flex items-center gap-3"><Key className="w-8 h-8 text-cyan-400" />API Gateway</h1><p className="text-gray-400 mt-1">Manage API keys and access</p></div>
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 rounded-lg"><Plus className="w-4 h-4"/>Create Key</button>
        </div>
        <div className="space-y-4">{keys.map(k=>(
          <div key={k.id} className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div><div className="font-medium">{k.name}</div><div className="text-sm text-gray-400 font-mono mt-1">{k.key}</div><div className="flex gap-2 mt-2">{k.permissions.map(p=><span key={p} className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">{p}</span>)}</div></div>
              <div className="text-right"><div className="text-sm text-gray-400">{k.requests.toLocaleString()} requests</div><div className="flex gap-2 mt-2"><button onClick={()=>{setCopied(k.id);setTimeout(()=>setCopied(null),2000)}} className="p-2 hover:bg-gray-700 rounded-lg">{copied===k.id?<Check className="w-4 h-4 text-green-400"/>:<Copy className="w-4 h-4"/>}</button><button className="p-2 hover:bg-gray-700 rounded-lg"><RefreshCw className="w-4 h-4"/></button><button className="p-2 hover:bg-gray-700 rounded-lg text-red-400"><Trash2 className="w-4 h-4"/></button></div></div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  );
}
