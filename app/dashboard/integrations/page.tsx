'use client';
import { useState } from 'react';
import { Puzzle, CheckCircle, XCircle, Settings, ExternalLink } from 'lucide-react';
interface Integration { id: string; name: string; description: string; icon: string; connected: boolean; category: string; }
const MOCK: Integration[] = [
  { id: '1', name: 'Stripe', description: 'Payment processing', icon: '💳', connected: true, category: 'payments' },
  { id: '2', name: 'PayPal', description: 'Payment processing', icon: '🅿️', connected: true, category: 'payments' },
  { id: '3', name: 'Supabase', description: 'Database & Auth', icon: '🗄️', connected: true, category: 'database' },
  { id: '4', name: 'Vercel', description: 'Hosting & Deploy', icon: '▲', connected: true, category: 'hosting' },
  { id: '5', name: 'GitHub', description: 'Version control', icon: '🐙', connected: true, category: 'dev' },
  { id: '6', name: 'Resend', description: 'Email delivery', icon: '📧', connected: true, category: 'email' },
  { id: '7', name: 'Discord', description: 'Notifications', icon: '💬', connected: true, category: 'notifications' },
  { id: '8', name: 'Sentry', description: 'Error tracking', icon: '🐛', connected: true, category: 'monitoring' },
];
export default function IntegrationsPage() {
  const [integrations] = useState<Integration[]>(MOCK);
  const connected = integrations.filter(i=>i.connected).length;
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8"><h1 className="text-3xl font-bold flex items-center gap-3"><Puzzle className="w-8 h-8 text-pink-400" />Integrations</h1><p className="text-gray-400 mt-1">{connected} of {integrations.length} connected</p></div>
        <div className="grid grid-cols-2 gap-4">{integrations.map(i=>(
          <div key={i.id} className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4"><span className="text-2xl">{i.icon}</span><div><div className="font-medium">{i.name}</div><div className="text-sm text-gray-400">{i.description}</div></div></div>
            <div className="flex items-center gap-2">{i.connected?<CheckCircle className="w-5 h-5 text-green-400"/>:<XCircle className="w-5 h-5 text-gray-500"/>}<button className="p-2 hover:bg-gray-700 rounded-lg"><Settings className="w-4 h-4"/></button></div>
          </div>
        ))}</div>
      </div>
    </div>
  );
}
