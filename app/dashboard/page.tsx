'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  AppWindow,
  Rocket,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Globe
} from 'lucide-react';

interface Stat {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  href: string;
}

interface RecentActivity {
  id: string;
  type: 'deploy' | 'user' | 'payment' | 'error';
  message: string;
  time: string;
  status: 'success' | 'error' | 'pending';
}

interface AppStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  requests: string;
}

export default function DashboardPage() {
  const [stats] = useState<Stat[]>([
    { label: 'Monthly Revenue', value: '$4,567', change: 12.5, icon: DollarSign, href: '/dashboard/revenue' },
    { label: 'Active Users', value: '1,284', change: 8.2, icon: Users, href: '/dashboard/users' },
    { label: 'Total Apps', value: '14', change: 2, icon: AppWindow, href: '/dashboard/apps' },
    { label: 'Deployments Today', value: '23', change: -5.1, icon: Rocket, href: '/dashboard/deployments' },
  ]);

  const [activities] = useState<RecentActivity[]>([
    { id: '1', type: 'deploy', message: 'crav-javari deployed to production', time: '2 min ago', status: 'success' },
    { id: '2', type: 'payment', message: 'New subscription: Pro Plan ($29/mo)', time: '15 min ago', status: 'success' },
    { id: '3', type: 'user', message: 'New user registered: john@example.com', time: '32 min ago', status: 'success' },
    { id: '4', type: 'error', message: 'API rate limit warning: market-oracle', time: '1 hr ago', status: 'pending' },
    { id: '5', type: 'deploy', message: 'crav-cardverse build failed', time: '2 hr ago', status: 'error' },
  ]);

  const [appStatuses] = useState<AppStatus[]>([
    { name: 'Javari AI', status: 'healthy', uptime: '99.9%', requests: '12.4K/hr' },
    { name: 'Market Oracle', status: 'healthy', uptime: '99.8%', requests: '8.2K/hr' },
    { name: 'CardVerse', status: 'degraded', uptime: '98.2%', requests: '3.1K/hr' },
    { name: 'CravBarrels', status: 'healthy', uptime: '99.9%', requests: '1.8K/hr' },
    { name: 'Admin Dashboard', status: 'healthy', uptime: '100%', requests: '456/hr' },
  ]);

  // ARR Progress
  const currentARR = 54814.68;
  const targetARR = 1000000;
  const progressPercent = (currentARR / targetARR) * 100;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, Roy! 👋</h1>
        <p className="text-gray-400 mt-1">Here's what's happening across the CRAIverse today.</p>
      </div>

      {/* ARR Progress Banner */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-400">Progress to $1M ARR Goal</div>
            <div className="text-3xl font-bold text-purple-400">${currentARR.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Remaining</div>
            <div className="text-xl font-medium">${(targetARR - currentARR).toLocaleString()}</div>
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-400">
          <span>{progressPercent.toFixed(2)}% complete</span>
          <Link href="/dashboard/revenue" className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
            View Details <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-gray-700/50 rounded-lg">
                <stat.icon className="w-5 h-5 text-purple-400" />
              </div>
              <span className={`flex items-center text-sm ${stat.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(stat.change)}%
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold group-hover:text-purple-400 transition-colors">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Recent Activity
            </h2>
            <Link href="/dashboard/logs" className="text-sm text-purple-400 hover:text-purple-300">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
                {activity.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                ) : activity.status === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                ) : (
                  <Zap className="w-5 h-5 text-yellow-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="text-sm">{activity.message}</div>
                  <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* App Health */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              App Health
            </h2>
            <Link href="/dashboard/apps" className="text-sm text-purple-400 hover:text-purple-300">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {appStatuses.map((app) => (
              <div key={app.name} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    app.status === 'healthy' ? 'bg-green-400' :
                    app.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <span className="font-medium">{app.name}</span>
                </div>
                <div className="text-right text-sm">
                  <div className="text-gray-400">{app.uptime}</div>
                  <div className="text-xs text-gray-500">{app.requests}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/dashboard/app-builder"
          className="p-4 bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-colors text-center"
        >
          <Zap className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="font-medium">Build New App</div>
          <div className="text-xs text-gray-400">AI-Powered</div>
        </Link>
        <Link
          href="/dashboard/deployments"
          className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors text-center"
        >
          <Rocket className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div className="font-medium">View Deployments</div>
          <div className="text-xs text-gray-400">23 today</div>
        </Link>
        <Link
          href="/dashboard/users"
          className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors text-center"
        >
          <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="font-medium">Manage Users</div>
          <div className="text-xs text-gray-400">1,284 active</div>
        </Link>
        <Link
          href="/dashboard/settings"
          className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors text-center"
        >
          <Activity className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="font-medium">Platform Settings</div>
          <div className="text-xs text-gray-400">Configure</div>
        </Link>
      </div>
    </div>
  );
}
