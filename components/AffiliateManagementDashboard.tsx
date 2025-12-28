'use client'

import { useState } from 'react'
import {
  Gift, DollarSign, TrendingUp, ExternalLink, CheckCircle,
  Clock, AlertCircle, Copy, BarChart3, Target, Zap, Globe,
  RefreshCw, Plus, Settings, Eye, MousePointer, ShoppingCart
} from 'lucide-react'

interface AffiliateProgram {
  id: string
  name: string
  logo: string
  commission: string
  type: 'recurring' | 'one-time' | 'per-booking' | 'per-lead'
  status: 'active' | 'pending' | 'review'
  platforms: string[]
  link: string
  clicks: number
  conversions: number
  revenue: number
  lastPayout: string
}

interface PlatformRevenue {
  platform: string
  icon: string
  affiliates: string[]
  monthlyRevenue: number
  projectedAnnual: number
  growth: number
}

const AFFILIATE_PROGRAMS: AffiliateProgram[] = [
  { id: '1', name: 'ElevenLabs', logo: '🎙️', commission: '22% recurring', type: 'recurring', status: 'active', platforms: ['Javari AI', 'Audio Tools'], link: 'https://try.elevenlabs.io/z24t231p5l5f', clicks: 1245, conversions: 62, revenue: 2904, lastPayout: '2024-12-15' },
  { id: '2', name: 'Viator', logo: '🎫', commission: '8% per booking', type: 'per-booking', status: 'active', platforms: ['Orlando Trip Deal'], link: 'https://www.viator.com/?pid=P00280339', clicks: 3420, conversions: 156, revenue: 4680, lastPayout: '2024-12-20' },
  { id: '3', name: 'GetYourGuide', logo: '🗺️', commission: '8% per booking', type: 'per-booking', status: 'active', platforms: ['Orlando Trip Deal'], link: 'https://www.getyourguide.com?partner_id=VZYKZYE', clicks: 2890, conversions: 134, revenue: 3890, lastPayout: '2024-12-18' },
  { id: '4', name: 'Discover Cars', logo: '🚗', commission: '3% lifetime', type: 'recurring', status: 'active', platforms: ['Orlando Trip Deal', 'Travel'], link: 'https://www.discovercars.com', clicks: 890, conversions: 45, revenue: 1250, lastPayout: '2024-12-10' },
  { id: '5', name: 'Printful', logo: '👕', commission: '10% + margins', type: 'one-time', status: 'active', platforms: ['Market Forge'], link: 'https://www.printful.com', clicks: 567, conversions: 89, revenue: 2340, lastPayout: '2024-12-22' },
  { id: '6', name: 'Crawlbase', logo: '🕷️', commission: '25% recurring', type: 'recurring', status: 'active', platforms: ['Developer Tools'], link: 'https://crawlbase.com/?s=mMXcTb6S', clicks: 234, conversions: 12, revenue: 890, lastPayout: '2024-12-05' },
  { id: '7', name: 'Awin Network', logo: '🔗', commission: 'Varies', type: 'one-time', status: 'active', platforms: ['CravBarrels', 'Multiple'], link: 'https://www.awin.com', clicks: 1890, conversions: 78, revenue: 1560, lastPayout: '2024-12-15' },
  { id: '8', name: 'Klook', logo: '✈️', commission: '3-5% per booking', type: 'per-booking', status: 'active', platforms: ['Orlando Trip Deal'], link: 'https://www.klook.com?aid=106921', clicks: 1230, conversions: 67, revenue: 1890, lastPayout: '2024-12-12' },
  // Pending programs
  { id: '9', name: 'Writesonic', logo: '✍️', commission: '30% lifetime', type: 'recurring', status: 'pending', platforms: ['Javari AI'], link: '', clicks: 0, conversions: 0, revenue: 0, lastPayout: '-' },
  { id: '10', name: 'Booking.com', logo: '🏨', commission: '25-40%', type: 'per-booking', status: 'review', platforms: ['Orlando Trip Deal'], link: '', clicks: 0, conversions: 0, revenue: 0, lastPayout: '-' },
  { id: '11', name: 'Choice Home Warranty', logo: '🏠', commission: '$75/sale', type: 'per-lead', status: 'pending', platforms: ['CR Realtor'], link: '', clicks: 0, conversions: 0, revenue: 0, lastPayout: '-' },
]

const PLATFORM_REVENUE: PlatformRevenue[] = [
  { platform: 'Orlando Trip Deal', icon: '🏰', affiliates: ['Viator', 'GetYourGuide', 'Klook', 'Discover Cars'], monthlyRevenue: 11710, projectedAnnual: 140520, growth: 24.5 },
  { platform: 'Javari AI', icon: '🤖', affiliates: ['ElevenLabs'], monthlyRevenue: 2904, projectedAnnual: 34848, growth: 18.2 },
  { platform: 'Market Forge', icon: '🎨', affiliates: ['Printful'], monthlyRevenue: 2340, projectedAnnual: 28080, growth: 35.8 },
  { platform: 'CravBarrels', icon: '🥃', affiliates: ['Awin Network'], monthlyRevenue: 1560, projectedAnnual: 18720, growth: 12.4 },
  { platform: 'Developer Tools', icon: '💻', affiliates: ['Crawlbase'], monthlyRevenue: 890, projectedAnnual: 10680, growth: 28.9 },
]

export default function AffiliateManagementDashboard() {
  const [activeTab, setActiveTab] = useState<'programs' | 'platforms' | 'links' | 'payouts'>('programs')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const totalRevenue = AFFILIATE_PROGRAMS.filter(p => p.status === 'active').reduce((sum, p) => sum + p.revenue, 0)
  const totalClicks = AFFILIATE_PROGRAMS.filter(p => p.status === 'active').reduce((sum, p) => sum + p.clicks, 0)
  const totalConversions = AFFILIATE_PROGRAMS.filter(p => p.status === 'active').reduce((sum, p) => sum + p.conversions, 0)
  const activePrograms = AFFILIATE_PROGRAMS.filter(p => p.status === 'active').length
  const pendingPrograms = AFFILIATE_PROGRAMS.filter(p => p.status !== 'active').length

  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0'

  const filteredPrograms = AFFILIATE_PROGRAMS.filter(p => statusFilter === 'all' || p.status === statusFilter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'review': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Affiliate Management</h1>
              <p className="text-amber-200">Track and optimize passive revenue streams</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-amber-600 rounded-lg font-medium">
            <Plus className="w-4 h-4" /> Add Program
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-amber-200 text-sm mb-1">Monthly Revenue</p>
            <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-amber-200 text-sm mb-1">Total Clicks</p>
            <p className="text-2xl font-bold text-white">{totalClicks.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-amber-200 text-sm mb-1">Conversions</p>
            <p className="text-2xl font-bold text-white">{totalConversions}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-amber-200 text-sm mb-1">Conv. Rate</p>
            <p className="text-2xl font-bold text-white">{conversionRate}%</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-amber-200 text-sm mb-1">Programs</p>
            <p className="text-2xl font-bold text-white">{activePrograms} <span className="text-sm text-amber-200">+ {pendingPrograms} pending</span></p>
          </div>
        </div>

        {/* Annual Goal */}
        <div className="mt-6 bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">🎯 Goal: $50,000 Annual Passive Revenue</span>
            <span className="text-amber-200">${(totalRevenue * 12).toLocaleString()} projected / $50,000</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-300 rounded-full"
              style={{ width: `${Math.min(((totalRevenue * 12) / 50000) * 100, 100)}%` }}
            />
          </div>
          <p className="text-sm text-amber-200 mt-2">
            {(((totalRevenue * 12) / 50000) * 100).toFixed(1)}% to goal • ${(50000 - (totalRevenue * 12)).toLocaleString()} remaining
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'programs', label: 'Programs', icon: Gift },
          { id: 'platforms', label: 'By Platform', icon: Globe },
          { id: 'links', label: 'Link Manager', icon: ExternalLink },
          { id: 'payouts', label: 'Payouts', icon: DollarSign },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === tab.id ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <>
          <div className="flex gap-2 mb-4">
            {['all', 'active', 'pending', 'review'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                  statusFilter === status ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left p-4">Program</th>
                  <th className="text-left p-4">Commission</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Clicks</th>
                  <th className="text-right p-4">Conv.</th>
                  <th className="text-right p-4">Revenue</th>
                  <th className="text-center p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredPrograms.map(program => (
                  <tr key={program.id} className="hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{program.logo}</span>
                        <div>
                          <p className="font-medium">{program.name}</p>
                          <p className="text-xs text-gray-400">{program.platforms.join(', ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{program.commission}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(program.status)}`}>
                        {program.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">{program.clicks.toLocaleString()}</td>
                    <td className="p-4 text-right">{program.conversions}</td>
                    <td className="p-4 text-right font-bold text-green-400">
                      ${program.revenue.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        {program.link && (
                          <button
                            onClick={() => navigator.clipboard.writeText(program.link)}
                            className="p-2 hover:bg-gray-700 rounded"
                            title="Copy Link"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                        <button className="p-2 hover:bg-gray-700 rounded" title="View Stats">
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded" title="Settings">
                          <Settings className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Platforms Tab */}
      {activeTab === 'platforms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLATFORM_REVENUE.map(platform => (
            <div key={platform.platform} className="bg-gray-900 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{platform.icon}</span>
                <div>
                  <h3 className="font-semibold">{platform.platform}</h3>
                  <p className="text-xs text-gray-400">{platform.affiliates.length} affiliate programs</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400">Monthly Revenue</p>
                  <p className="text-xl font-bold text-green-400">${platform.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Projected Annual</p>
                  <p className="text-xl font-bold">${platform.projectedAnnual.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div className="flex flex-wrap gap-1">
                  {platform.affiliates.map(aff => (
                    <span key={aff} className="px-2 py-0.5 bg-gray-800 text-xs rounded">{aff}</span>
                  ))}
                </div>
                <span className="text-green-400 text-sm">+{platform.growth}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Links Tab */}
      {activeTab === 'links' && (
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
          <h3 className="font-semibold mb-4">Quick Copy Links</h3>
          <div className="space-y-3">
            {AFFILIATE_PROGRAMS.filter(p => p.status === 'active' && p.link).map(program => (
              <div key={program.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{program.logo}</span>
                  <div>
                    <p className="font-medium">{program.name}</p>
                    <p className="text-xs text-gray-400 font-mono truncate max-w-md">{program.link}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(program.link)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded text-sm"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === 'payouts' && (
        <div className="bg-gray-900 rounded-xl border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold">Recent Payouts</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {AFFILIATE_PROGRAMS.filter(p => p.status === 'active').sort((a, b) => new Date(b.lastPayout).getTime() - new Date(a.lastPayout).getTime()).map(program => (
              <div key={program.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{program.logo}</span>
                  <div>
                    <p className="font-medium">{program.name}</p>
                    <p className="text-xs text-gray-400">Last payout: {program.lastPayout}</p>
                  </div>
                </div>
                <p className="font-bold text-green-400">${program.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
