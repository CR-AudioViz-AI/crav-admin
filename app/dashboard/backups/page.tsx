'use client';
import { useState } from 'react';
import { Database, Download, RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react';
interface Backup { id: string; type: string; size: string; status: 'success' | 'failed'; createdAt: string; }
const MOCK: Backup[] = [
  { id: '1', type: 'Full Database', size: '2.4 GB', status: 'success', createdAt: '2025-12-27T02:00:00Z' },
  { id: '2', type: 'Full Database', size: '2.3 GB', status: 'success', createdAt: '2025-12-26T02:00:00Z' },
  { id: '3', type: 'Full Database', size: '2.2 GB', status: 'failed', createdAt: '2025-12-25T02:00:00Z' },
];
export default function BackupsPage() {
  const [backups] = useState<Backup[]>(MOCK);
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold flex items-center gap-3"><Database className="w-8 h-8 text-teal-400" />Backups</h1><p className="text-gray-400 mt-1">Daily automated backups at 2 AM EST</p></div>
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 rounded-lg"><RefreshCw className="w-4 h-4"/>Create Backup</button>
        </div>
        <div className="space-y-4">{backups.map(b=>(
          <div key={b.id} className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">{b.status==='success'?<CheckCircle className="w-5 h-5 text-green-400"/>:<AlertCircle className="w-5 h-5 text-red-400"/>}<div><div className="font-medium">{b.type}</div><div className="text-sm text-gray-400 flex items-center gap-2"><Clock className="w-3 h-3"/>{new Date(b.createdAt).toLocaleString()}</div></div></div>
            <div className="flex items-center gap-4"><span className="text-gray-400">{b.size}</span>{b.status==='success'&&<button className="p-2 hover:bg-gray-700 rounded-lg"><Download className="w-4 h-4"/></button>}</div>
          </div>
        ))}</div>
      </div>
    </div>
  );
}
