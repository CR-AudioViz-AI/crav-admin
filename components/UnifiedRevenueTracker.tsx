'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, Users,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Calendar,
  Download, RefreshCw, Filter, Globe, Zap, Crown, Gift, Target
} from 'lucide-react'

interface RevenueStream {
  id: string
  name: string
  app: string
  type: 'subscription' | 'one-time' | 'affiliate' | 'ads' | 'credits'
  amount: number
  change: number
  changePercent: number
  transactions: number
  period: string
}

interface AppRevenue {
  app: string
  icon: string
  mrr: number
  arr: number
  growth: number
  subscribers: number
  churnRate: number
  ltv: number
  arpu: number
}

interface AffiliatePartner {
  name: string
  clicks: number
  conversions: number
  revenue: number
  commission: number
  conversionRate: number
}

const REVENUE_STREAMS: RevenueStream[] = [
  { id: '1', name: 'Pro Subscriptions', app: 'Market Oracle', type: 'subscription', amount: 12450, change: 2340, changePercent: 23.1, transactions: 498, period: 'This Month' },
  { id: '2', name: 'Premium Plans', app: 'Logo Studio', type: 'subscription', amount: 8920, change: 1560, changePercent: 21.2, transactions: 356, period: 'This Month' },
  { id: '3', name: 'AI Credits', app: 'All Apps', type: 'credits', amount: 6780, change: 890, changePercent: 15.1, transactions: 1234, period: 'This Month' },
  { id: '4', name: 'Affiliate - Trading', app: 'Market Oracle', type: 'affiliate', amount: 4560, change: 780, changePercent: 20.6, transactions: 89, period: 'This Month' },
  { id: '5', name: 'Affiliate - Travel', app: 'Orlando Deals', type: 'affiliate', amount: 3420, change: -120, changePercent: -3.4, transactions: 67, period: 'This Month' },
  { id: '6', name: 'Course Sales', app: 'CravBarrels', type: 'one-time', amount: 2890, change: 450, changePercent: 18.4, transactions: 58, period: 'This Month' },
  { id: '7', name: 'Marketplace Fees', app: 'CravCardverse', type: 'one-time', amount: 2340, change: 670, changePercent: 40.1, transactions: 234, period: 'This Month' },
]

const APP_REVENUES: AppRevenue[] = [
  { app: 'Market Oracle', icon: '📈', mrr: 18500, arr: 222000, growth: 24.5, subscribers: 742, churnRate: 3.2, ltv: 450, arpu: 24.93 },
  { app: 'Logo Studio', icon: '🎨', mrr: 12300, arr: 147600, growth: 18.2, subscribers: 492, churnRate: 4.1, ltv: 380, arpu: 25.00 },
  { app: 'Social Graphics', icon: '📱', mrr: 8900, arr: 106800, growth: 15.8, subscribers: 356, churnRate: 5.2, ltv: 320, arpu: 25.00 },
  { app: 'Invoice Generator', icon: '📄', mrr: 6200, arr: 74400, growth: 12.4, subscribers: 248, churnRate: 4.8, ltv: 290, arpu: 25.00 },
  { app: 'CravBarrels', icon: '🥃', mrr: 4800, arr: 57600, growth: 28.6, subscribers: 192, churnRate: 2.8, ltv: 520, arpu: 25.00 },
  { app: 'CravCardverse', icon: '🃏', mrr: 3900, arr: 46800, growth: 35.2, subscribers: 156, churnRate: 3.5, ltv: 410, arpu: 25.00 },
  { app: 'Orlando Deals', icon: '🏰', mrr: 2400, arr: 28800, growth: 8.9, subscribers: 96, churnRate: 6.1, ltv: 240, arpu: 25.00 },
]

const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  { name: 'Investopedia Academy', clicks: 4520, conversions: 89, revenue: 17800, commission: 2670, conversionRate: 1.97 },
  { name: 'Undercover Tourist', clicks: 3890, conversions: 156, revenue: 45600, commission: 3648, conversionRate: 4.01 },
  { name: 'PSA Grading', clicks: 2340, conversions: 234, revenue: 11700, commission: 1755, conversionRate: 10.0 },
  { name: 'Canva Pro', clicks: 5670, conversions: 340, revenue: 40800, commission: 8160, conversionRate: 6.0 },
  { name: 'Master of Malt', clicks: 1890, conversions: 67, revenue: 8900, commission: 890, conversionRate: 3.54 },
]

export default function UnifiedRevenueTracker() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month')
  const [view, setView] = useState<'overview' | 'apps' | 'affiliates' | 'projections'>('overview')

  const totalMRR = APP_REVENUES.reduce((sum, app) => sum + app.mrr, 0)
  const totalARR = APP_REVENUES.reduce((sum, app) => sum + app.arr, 0)
  const totalSubscribers = APP_REVENUES.reduce((sum, app) => sum + app.subscribers, 0)
  const avgGrowth = APP_REVENUES.reduce((sum, app) => sum + app.growth, 0) / APP_REVENUES.length
  const totalAffiliateRevenue = AFFILIATE_PARTNERS.reduce((sum, p) => sum + p.commission, 0)

  // Calculate progress to $1M ARR goal
  const arrGoal = 1000000
  const arrProgress = (totalARR / arrGoal) * 100
  const monthsToGoal = Math.ceil((arrGoal - totalARR) / (totalMRR * (avgGrowth / 100)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Revenue Command Center</h1>
              <p className="text-emerald-200">CR AudioViz AI LLC - All Revenue Streams</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 bg-white/20 border-0 rounded-lg text-white"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-emerald-200 text-sm mb-1">Monthly Recurring</p>
            <p className="text-3xl font-bold text-white">${totalMRR.toLocaleString()}</p>
            <p className="text-sm text-green-300 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-4 h-4" /> +{avgGrowth.toFixed(1)}% avg growth
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-emerald-200 text-sm mb-1">Annual Run Rate</p>
            <p className="text-3xl font-bold text-white">${(totalARR / 1000).toFixed(0)}K</p>
            <p className="text-sm text-emerald-200 mt-1">{arrProgress.toFixed(1)}% to $1M goal</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-emerald-200 text-sm mb-1">Total Subscribers</p>
            <p className="text-3xl font-bold text-white">{totalSubscribers.toLocaleString()}</p>
            <p className="text-sm text-green-300 flex items-center gap-1 mt-1">
              <Users className="w-4 h-4" /> Across all apps
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-emerald-200 text-sm mb-1">Affiliate Revenue</p>
            <p className="text-3xl font-bold text-white">${totalAffiliateRevenue.toLocaleString()}</p>
            <p className="text-sm text-emerald-200 mt-1">{AFFILIATE_PARTNERS.length} partners</p>
          </div>
        </div>

        {/* $1M Goal Progress */}
        <div className="mt-6 bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">🎯 Path to $1M ARR</span>
            <span className="text-emerald-200">${totalARR.toLocaleString()} / $1,000,000</span>
          </div>
          <div className="h-4 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-300 rounded-full transition-all"
              style={{ width: `${Math.min(arrProgress, 100)}%` }}
            />
          </div>
          <p className="text-sm text-emerald-200 mt-2">
            At current growth rate, reaching $1M ARR in approximately <strong>{monthsToGoal} months</strong>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'apps', label: 'By App', icon: Globe },
          { id: 'affiliates', label: 'Affiliates', icon: Gift },
          { id: 'projections', label: 'Projections', icon: Target },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              view === tab.id ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {view === 'overview' && (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">Revenue Streams</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {REVENUE_STREAMS.map(stream => (
                <div key={stream.id} className="p-4 flex items-center justify-between hover:bg-gray-800/50">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      stream.type === 'subscription' ? 'bg-blue-500/20 text-blue-400' :
                      stream.type === 'affiliate' ? 'bg-purple-500/20 text-purple-400' :
                      stream.type === 'credits' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {stream.type === 'subscription' ? <Crown className="w-4 h-4" /> :
                       stream.type === 'affiliate' ? <Gift className="w-4 h-4" /> :
                       stream.type === 'credits' ? <Zap className="w-4 h-4" /> :
                       <CreditCard className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{stream.name}</p>
                      <p className="text-sm text-gray-400">{stream.app} • {stream.transactions} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${stream.amount.toLocaleString()}</p>
                    <p className={`text-sm flex items-center justify-end gap-1 ${stream.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stream.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {stream.change >= 0 ? '+' : ''}{stream.changePercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Apps Tab */}
      {view === 'apps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {APP_REVENUES.map(app => (
            <div key={app.app} className="bg-gray-900 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{app.icon}</span>
                <div>
                  <h3 className="font-semibold">{app.app}</h3>
                  <p className="text-sm text-gray-400">{app.subscribers} subscribers</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400">MRR</p>
                  <p className="font-bold text-lg">${app.mrr.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">ARR</p>
                  <p className="font-bold text-lg">${(app.arr / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Growth</p>
                  <p className="font-bold text-green-400">+{app.growth}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Churn</p>
                  <p className="font-bold text-red-400">{app.churnRate}%</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-800 text-sm">
                <span className="text-gray-400">LTV: ${app.ltv}</span>
                <span className="text-gray-400">ARPU: ${app.arpu}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Affiliates Tab */}
      {view === 'affiliates' && (
        <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left p-4">Partner</th>
                <th className="text-right p-4">Clicks</th>
                <th className="text-right p-4">Conversions</th>
                <th className="text-right p-4">Conv. Rate</th>
                <th className="text-right p-4">Revenue</th>
                <th className="text-right p-4">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {AFFILIATE_PARTNERS.map(partner => (
                <tr key={partner.name} className="hover:bg-gray-800/50">
                  <td className="p-4 font-medium">{partner.name}</td>
                  <td className="p-4 text-right">{partner.clicks.toLocaleString()}</td>
                  <td className="p-4 text-right">{partner.conversions}</td>
                  <td className="p-4 text-right">{partner.conversionRate.toFixed(2)}%</td>
                  <td className="p-4 text-right">${partner.revenue.toLocaleString()}</td>
                  <td className="p-4 text-right font-bold text-green-400">${partner.commission.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-800">
              <tr>
                <td className="p-4 font-bold">Total</td>
                <td className="p-4 text-right font-bold">{AFFILIATE_PARTNERS.reduce((s, p) => s + p.clicks, 0).toLocaleString()}</td>
                <td className="p-4 text-right font-bold">{AFFILIATE_PARTNERS.reduce((s, p) => s + p.conversions, 0)}</td>
                <td className="p-4 text-right">-</td>
                <td className="p-4 text-right font-bold">${AFFILIATE_PARTNERS.reduce((s, p) => s + p.revenue, 0).toLocaleString()}</td>
                <td className="p-4 text-right font-bold text-green-400">${AFFILIATE_PARTNERS.reduce((s, p) => s + p.commission, 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Projections Tab */}
      {view === 'projections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
            <h3 className="font-semibold mb-4">Revenue Projections</h3>
            <div className="space-y-4">
              {[3, 6, 12].map(months => {
                const projectedMRR = totalMRR * Math.pow(1 + (avgGrowth / 100), months)
                return (
                  <div key={months} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span>{months} Month Projection</span>
                    <div className="text-right">
                      <p className="font-bold">${Math.round(projectedMRR).toLocaleString()}/mo</p>
                      <p className="text-xs text-gray-400">${Math.round(projectedMRR * 12).toLocaleString()} ARR</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
            <h3 className="font-semibold mb-4">Milestone Tracker</h3>
            <div className="space-y-3">
              {[
                { milestone: '$500K ARR', target: 500000, icon: '🎯' },
                { milestone: '$750K ARR', target: 750000, icon: '🚀' },
                { milestone: '$1M ARR', target: 1000000, icon: '🏆' },
              ].map(m => {
                const progress = (totalARR / m.target) * 100
                const achieved = totalARR >= m.target
                return (
                  <div key={m.milestone} className={`p-3 rounded-lg ${achieved ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-800'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2">
                        {m.icon} {m.milestone}
                      </span>
                      {achieved ? (
                        <span className="text-green-400 text-sm">✓ Achieved</span>
                      ) : (
                        <span className="text-sm text-gray-400">{progress.toFixed(1)}%</span>
                      )}
                    </div>
                    {!achieved && (
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
