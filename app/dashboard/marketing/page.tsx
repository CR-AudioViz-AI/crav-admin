'use client'

import { useState } from 'react'
import { Mail, Users, TrendingUp, Target, Send, Eye, MousePointerClick } from 'lucide-react'

export default function MarketingPage() {
  const campaigns = [
    { id: 1, name: 'Product Launch - Logo Studio', status: 'active', sent: 5234, opened: 2876, clicked: 892, conversions: 134 },
    { id: 2, name: 'Holiday Promo 2025', status: 'scheduled', sent: 0, opened: 0, clicked: 0, conversions: 0 },
    { id: 3, name: 'User Onboarding Series', status: 'active', sent: 8921, opened: 5123, clicked: 1876, conversions: 445 },
    { id: 4, name: 'Re-engagement Campaign', status: 'completed', sent: 3456, opened: 1234, clicked: 456, conversions: 89 }
  ]

  const stats = {
    totalSent: campaigns.reduce((s, c) => s + c.sent, 0),
    totalOpened: campaigns.reduce((s, c) => s + c.opened, 0),
    totalClicked: campaigns.reduce((s, c) => s + c.clicked, 0),
    totalConversions: campaigns.reduce((s, c) => s + c.conversions, 0)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Marketing Campaigns</h1>
          <p className="text-slate-400">Manage email campaigns and track performance</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Send className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <Mail className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Emails Sent</p>
              <p className="text-white text-2xl font-bold">{stats.totalSent.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-500/10 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Open Rate</p>
              <p className="text-white text-2xl font-bold">{((stats.totalOpened/stats.totalSent)*100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-500/10 p-3 rounded-lg">
              <MousePointerClick className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Click Rate</p>
              <p className="text-white text-2xl font-bold">{((stats.totalClicked/stats.totalOpened)*100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-500/10 p-3 rounded-lg">
              <Target className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Conversions</p>
              <p className="text-white text-2xl font-bold">{stats.totalConversions}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold mb-2">{campaign.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  campaign.status === 'active' ? 'bg-green-500/10 text-green-500' :
                  campaign.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {campaign.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Sent</p>
                <p className="text-white font-semibold">{campaign.sent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400">Opened</p>
                <p className="text-white font-semibold">{campaign.opened.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400">Clicked</p>
                <p className="text-white font-semibold">{campaign.clicked.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400">Converted</p>
                <p className="text-white font-semibold">{campaign.conversions}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
