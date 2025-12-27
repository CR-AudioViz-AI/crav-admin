'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, Users, ArrowUp, ArrowDown } from 'lucide-react';

interface RevenueStream {
  name: string;
  amount: number;
  percentage: number;
  trend: number;
}

export default function RevenuePage() {
  const [data] = useState({
    mrr: 4567.89,
    arr: 54814.68,
    mrrGrowth: 12.5,
    todayRevenue: 234.56,
    monthRevenue: 5123.45,
    activeSubscriptions: 127,
    newSubscriptions: 23,
    churnRate: 2.1,
    avgRevenuePerUser: 35.97,
  });

  const streams: RevenueStream[] = [
    { name: 'SaaS Subscriptions', amount: 2450.00, percentage: 53.6, trend: 8.2 },
    { name: 'Credit Purchases', amount: 890.00, percentage: 19.5, trend: 15.3 },
    { name: 'Marketplace Commissions', amount: 567.89, percentage: 12.4, trend: -2.1 },
    { name: 'Affiliate Earnings', amount: 432.00, percentage: 9.5, trend: 22.5 },
    { name: 'Enterprise Licenses', amount: 228.00, percentage: 5.0, trend: 0 },
  ];

  const targetARR = 1000000;
  const progressToGoal = (data.arr / targetARR) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-400" />
              Revenue Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Track your path to $1M ARR</p>
          </div>
        </div>

        {/* Goal Progress */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-400">Progress to $1M ARR Goal</div>
              <div className="text-3xl font-bold text-green-400">${data.arr.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Remaining</div>
              <div className="text-xl font-medium">${(targetARR - data.arr).toLocaleString()}</div>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-4 rounded-full transition-all" style={{ width: `${Math.min(progressToGoal, 100)}%` }} />
          </div>
          <div className="text-center mt-2 text-sm text-gray-400">{progressToGoal.toFixed(2)}% complete</div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">MRR</div>
              <span className={`flex items-center text-sm ${data.mrrGrowth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.mrrGrowth > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(data.mrrGrowth)}%
              </span>
            </div>
            <div className="text-2xl font-bold mt-2">${data.mrr.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-sm text-gray-400">Today</div>
            <div className="text-2xl font-bold mt-2 text-green-400">${data.todayRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-sm text-gray-400">Active Subscriptions</div>
            <div className="text-2xl font-bold mt-2">{data.activeSubscriptions}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-sm text-gray-400">Churn Rate</div>
            <div className="text-2xl font-bold mt-2 text-yellow-400">{data.churnRate}%</div>
          </div>
        </div>

        {/* Revenue Streams */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6">Revenue Streams</h2>
          <div className="space-y-4">
            {streams.map((stream, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{stream.name}</span>
                    <span className="text-green-400 font-medium">${stream.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: `${stream.percentage}%` }} />
                  </div>
                </div>
                <div className={`ml-4 flex items-center ${stream.trend > 0 ? 'text-green-400' : stream.trend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {stream.trend > 0 ? <ArrowUp className="w-4 h-4" /> : stream.trend < 0 ? <ArrowDown className="w-4 h-4" /> : null}
                  <span className="text-sm">{Math.abs(stream.trend)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
