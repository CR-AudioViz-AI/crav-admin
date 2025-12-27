'use client';
import { useState } from 'react';
import { Bell, Send, Plus, Settings, Smartphone, Mail, MessageSquare } from 'lucide-react';
interface NotificationTemplate { id: string; name: string; type: 'push' | 'email' | 'sms'; trigger: string; active: boolean; }
const MOCK: NotificationTemplate[] = [
  { id: '1', name: 'Welcome Email', type: 'email', trigger: 'user.signup', active: true },
  { id: '2', name: 'Payment Success', type: 'email', trigger: 'payment.success', active: true },
  { id: '3', name: 'Low Credits Alert', type: 'push', trigger: 'credits.low', active: true },
  { id: '4', name: 'New Feature Announcement', type: 'push', trigger: 'manual', active: false },
];
export default function NotificationsPage() {
  const [templates] = useState<NotificationTemplate[]>(MOCK);
  const icons: Record<string, React.ElementType> = { push: Smartphone, email: Mail, sms: MessageSquare };
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold flex items-center gap-3"><Bell className="w-8 h-8 text-orange-400" />Notifications</h1></div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 rounded-lg"><Plus className="w-4 h-4"/>New Template</button>
        </div>
        <div className="space-y-4">{templates.map(t=>{const Icon=icons[t.type];return(
          <div key={t.id} className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4"><div className="p-2 bg-gray-700 rounded-lg"><Icon className="w-5 h-5"/></div><div><div className="font-medium">{t.name}</div><div className="text-sm text-gray-400">Trigger: {t.trigger}</div></div></div>
            <div className="flex items-center gap-4"><span className={`px-2 py-1 text-xs rounded ${t.active?'bg-green-500/20 text-green-400':'bg-gray-500/20 text-gray-400'}`}>{t.active?'Active':'Inactive'}</span><button className="p-2 hover:bg-gray-700 rounded-lg"><Settings className="w-4 h-4"/></button></div>
          </div>
        );})}</div>
      </div>
    </div>
  );
}
