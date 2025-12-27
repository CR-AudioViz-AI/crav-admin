'use client';

import { useState } from 'react';
import { Settings, Bell, Shield, Palette, Globe, Database, Mail, CreditCard, Save, RotateCcw } from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ElementType;
  settings: Setting[];
}

interface Setting {
  key: string;
  label: string;
  description: string;
  type: 'toggle' | 'text' | 'select' | 'number';
  value: boolean | string | number;
  options?: string[];
}

export default function SettingsPage() {
  const [sections, setSections] = useState<SettingSection[]>([
    {
      id: 'general',
      title: 'General',
      icon: Settings,
      settings: [
        { key: 'site_name', label: 'Site Name', description: 'The name of your platform', type: 'text', value: 'CR AudioViz AI' },
        { key: 'tagline', label: 'Tagline', description: 'Your platform tagline', type: 'text', value: 'Your Story. Our Design' },
        { key: 'maintenance_mode', label: 'Maintenance Mode', description: 'Disable public access', type: 'toggle', value: false },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      settings: [
        { key: 'email_notifications', label: 'Email Notifications', description: 'Send email alerts', type: 'toggle', value: true },
        { key: 'discord_webhook', label: 'Discord Notifications', description: 'Send to Discord', type: 'toggle', value: true },
        { key: 'error_alerts', label: 'Error Alerts', description: 'Alert on system errors', type: 'toggle', value: true },
      ],
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      settings: [
        { key: 'require_2fa', label: 'Require 2FA', description: 'For admin accounts', type: 'toggle', value: false },
        { key: 'session_timeout', label: 'Session Timeout', description: 'Minutes until logout', type: 'number', value: 60 },
        { key: 'max_login_attempts', label: 'Max Login Attempts', description: 'Before lockout', type: 'number', value: 5 },
      ],
    },
    {
      id: 'payments',
      title: 'Payments',
      icon: CreditCard,
      settings: [
        { key: 'stripe_enabled', label: 'Stripe Enabled', description: 'Accept Stripe payments', type: 'toggle', value: true },
        { key: 'paypal_enabled', label: 'PayPal Enabled', description: 'Accept PayPal', type: 'toggle', value: true },
        { key: 'default_currency', label: 'Default Currency', description: 'Primary currency', type: 'select', value: 'USD', options: ['USD', 'EUR', 'GBP'] },
      ],
    },
  ]);

  const [hasChanges, setHasChanges] = useState(false);

  function updateSetting(sectionId: string, key: string, value: boolean | string | number) {
    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, settings: s.settings.map(set => set.key === key ? { ...set, value } : set) }
        : s
    ));
    setHasChanges(true);
  }

  async function saveSettings() {
    // Save to API
    setHasChanges(false);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="w-8 h-8 text-gray-400" />
              Platform Settings
            </h1>
            <p className="text-gray-400 mt-1">Configure your platform</p>
          </div>
          {hasChanges && (
            <div className="flex gap-3">
              <button onClick={() => setHasChanges(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button onClick={saveSettings} className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {sections.map(section => (
            <div key={section.id} className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <section.icon className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-bold">{section.title}</h2>
              </div>
              <div className="space-y-6">
                {section.settings.map(setting => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{setting.label}</div>
                      <div className="text-sm text-gray-400">{setting.description}</div>
                    </div>
                    {setting.type === 'toggle' && (
                      <button
                        onClick={() => updateSetting(section.id, setting.key, !setting.value)}
                        className={`w-12 h-6 rounded-full transition-colors ${setting.value ? 'bg-green-500' : 'bg-gray-600'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${setting.value ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    )}
                    {setting.type === 'text' && (
                      <input
                        type="text"
                        value={setting.value as string}
                        onChange={(e) => updateSetting(section.id, setting.key, e.target.value)}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg w-64"
                      />
                    )}
                    {setting.type === 'number' && (
                      <input
                        type="number"
                        value={setting.value as number}
                        onChange={(e) => updateSetting(section.id, setting.key, parseInt(e.target.value))}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg w-24"
                      />
                    )}
                    {setting.type === 'select' && (
                      <select
                        value={setting.value as string}
                        onChange={(e) => updateSetting(section.id, setting.key, e.target.value)}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      >
                        {setting.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
