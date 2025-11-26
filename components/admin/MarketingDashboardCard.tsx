// ============================================================================
// CR AUDIOVIZ AI - MARKETING & CROSS-SELL DASHBOARD CARD
// Complete admin dashboard card for Marketing Engine
// Created: 2025-11-25
// Version: 2.0.0 - Investor-Grade Edition
// 
// Features: Cross-selling, A/B testing, funnel visualization, attribution,
// third-party ads, real-time alerts, mobile-first, helpdesk integration
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface DashboardStats {
  // Core metrics
  active_campaigns: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue: number;
  avg_ctr: number;
  avg_conversion_rate: number;
  
  // Cross-sell specific
  cross_sell_impressions: number;
  cross_sell_clicks: number;
  cross_sell_conversions: number;
  cross_sell_revenue: number;
  
  // Third-party ads
  ad_impressions: number;
  ad_clicks: number;
  ad_revenue: number;
  
  // Funnel metrics
  funnel_visitors: number;
  funnel_leads: number;
  funnel_mqls: number;
  funnel_sqls: number;
  funnel_opportunities: number;
  funnel_customers: number;
  
  // Attribution
  organic_revenue: number;
  paid_revenue: number;
  referral_revenue: number;
  direct_revenue: number;
  
  // Period comparison
  revenue_change: number;
  impressions_change: number;
  conversions_change: number;
  
  // Health
  health_score: number;
  active_alerts: number;
}

interface AppLeaderboardEntry {
  app_id: string;
  name: string;
  slug: string;
  category: string;
  icon_url?: string;
  rating: 'A' | 'B' | 'C' | 'D' | 'F';
  rating_score: number;
  mrr: number;
  active_users: number;
  cross_sell_enabled: boolean;
  cross_sell_conversions: number;
  cross_sell_revenue: number;
  last_updated: string;
}

interface Campaign {
  campaign_id: string;
  name: string;
  description?: string;
  campaign_type: 'cross_sell' | 'third_party' | 'internal' | 'ab_test';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'scheduled';
  start_date?: string;
  end_date?: string;
  budget?: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversion_rate: number;
  roas: number;
  target_apps: string[];
  created_at: string;
  updated_at: string;
}

interface Advertiser {
  advertiser_id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  category: string;
  status: 'pending' | 'approved' | 'active' | 'paused' | 'rejected';
  total_spend: number;
  active_campaigns: number;
  created_at: string;
}

interface ABTest {
  test_id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variant_a: {
    name: string;
    impressions: number;
    conversions: number;
    conversion_rate: number;
  };
  variant_b: {
    name: string;
    impressions: number;
    conversions: number;
    conversion_rate: number;
  };
  confidence_level: number;
  winner?: 'A' | 'B' | 'inconclusive';
  started_at?: string;
  ended_at?: string;
}

interface Alert {
  alert_id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  action_url?: string;
}

interface FunnelStage {
  name: string;
  count: number;
  conversion_rate: number;
  color: string;
}

type TabType = 'overview' | 'campaigns' | 'apps' | 'advertisers' | 'ab_tests' | 'funnel' | 'alerts' | 'settings';

// ============================================================================
// CONSTANTS
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const HELP_LINKS = {
  documentation: 'https://docs.craudiovizai.com/marketing',
  helpdesk: 'https://support.craudiovizai.com',
  tutorials: 'https://docs.craudiovizai.com/marketing/tutorials',
  api: 'https://docs.craudiovizai.com/api/marketing',
};

const TAB_CONFIG: { id: TabType; label: string; icon: string; badge?: boolean }[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'campaigns', label: 'Campaigns', icon: '🎯' },
  { id: 'apps', label: 'Apps', icon: '📱' },
  { id: 'advertisers', label: 'Advertisers', icon: '💼' },
  { id: 'ab_tests', label: 'A/B Tests', icon: '🧪' },
  { id: 'funnel', label: 'Funnel', icon: '🔄' },
  { id: 'alerts', label: 'Alerts', icon: '🔔', badge: true },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const RATING_COLORS: Record<string, string> = {
  A: 'bg-green-500',
  B: 'bg-blue-500',
  C: 'bg-yellow-500',
  D: 'bg-orange-500',
  F: 'bg-red-500',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  paused: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  draft: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400' },
  completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  scheduled: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  pending: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

function getHealthColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <div className="flex items-center justify-center py-8">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`} />
    </div>
  );
}

function EmptyState({ 
  icon, 
  title, 
  description, 
  action 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="text-center py-12">
      <span className="text-4xl mb-4 block">{icon}</span>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  icon,
  format = 'number',
  helpText,
}: {
  label: string;
  value: number;
  change?: number;
  icon: string;
  format?: 'number' | 'currency' | 'percent';
  helpText?: string;
}) {
  const formattedValue = useMemo(() => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return formatPercent(value);
      default:
        return formatNumber(value);
    }
  }, [value, format]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            {label}
            {helpText && (
              <span className="group relative cursor-help">
                <span className="text-gray-400 text-xs">ⓘ</span>
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {helpText}
                </span>
              </span>
            )}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formattedValue}</p>
          {typeof change === 'number' && (
            <p className={`text-sm mt-1 flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span>{change >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="text-gray-400">vs last period</span>
            </p>
          )}
        </div>
        <span className="text-2xl opacity-80">{icon}</span>
      </div>
    </div>
  );
}

function MiniChart({ 
  data, 
  color = 'blue',
  height = 40 
}: { 
  data: number[]; 
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const colorClasses: Record<string, string> = {
    blue: 'fill-blue-500',
    green: 'fill-green-500',
    yellow: 'fill-yellow-500',
    red: 'fill-red-500',
  };
  
  return (
    <svg className="w-full" height={height} viewBox={`0 0 ${data.length * 10} ${height}`}>
      {data.map((value, i) => {
        const barHeight = ((value - min) / range) * (height - 4);
        return (
          <rect
            key={i}
            x={i * 10 + 2}
            y={height - barHeight - 2}
            width={6}
            height={barHeight}
            rx={1}
            className={`${colorClasses[color]} opacity-80`}
          />
        );
      })}
    </svg>
  );
}

function ProgressBar({ 
  value, 
  max, 
  color = 'blue',
  showLabel = true,
  size = 'md'
}: { 
  value: number; 
  max: number; 
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const percent = Math.min((value / max) * 100, 100);
  
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };
  
  return (
    <div className="w-full">
      <div className={`bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`${colorClasses[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formatNumber(value)} / {formatNumber(max)} ({percent.toFixed(0)}%)
        </p>
      )}
    </div>
  );
}

function Badge({ 
  children, 
  variant = 'default',
  size = 'md'
}: { 
  children: React.ReactNode; 
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
  };
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_COLORS[status] || STATUS_COLORS.draft;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${config.bg} ${config.text}`}>
      {status}
    </span>
  );
}

// ============================================================================
// TAB COMPONENTS
// ============================================================================

// Overview Tab - Main dashboard view
function OverviewTab({
  stats,
  topApps,
  recentCampaigns,
  alerts,
}: {
  stats: DashboardStats | null;
  topApps: AppLeaderboardEntry[];
  recentCampaigns: Campaign[];
  alerts: Alert[];
}) {
  if (!stats) return <LoadingSpinner />;
  
  // Sample chart data - replace with real data
  const revenueData = [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45];
  const impressionsData = [100, 120, 110, 150, 140, 180, 170, 200, 190, 220, 210, 250];
  
  return (
    <div className="space-y-6">
      {/* Health Score Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${getHealthColor(stats.health_score)} flex items-center justify-center text-white font-bold text-lg`}>
              {stats.health_score}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Marketing Health Score</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stats.health_score >= 80 ? 'Excellent' : stats.health_score >= 60 ? 'Good' : stats.health_score >= 40 ? 'Needs Attention' : 'Critical'}
              </p>
            </div>
          </div>
          {stats.active_alerts > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                {stats.active_alerts} active alert{stats.active_alerts > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Main KPI Grid - Mobile Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Revenue"
          value={stats.total_revenue}
          change={stats.revenue_change}
          icon="💰"
          format="currency"
          helpText="Combined revenue from cross-sell and third-party ads"
        />
        <StatCard
          label="Impressions"
          value={stats.total_impressions}
          change={stats.impressions_change}
          icon="👁"
          helpText="Total promotional impressions across all apps"
        />
        <StatCard
          label="Conversions"
          value={stats.total_conversions}
          change={stats.conversions_change}
          icon="🎯"
          helpText="Successful cross-sell and ad conversions"
        />
        <StatCard
          label="Avg CTR"
          value={stats.avg_ctr}
          icon="📈"
          format="percent"
          helpText="Click-through rate across all campaigns"
        />
      </div>
      
      {/* Revenue Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            💵 Revenue Breakdown
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cross-Sell Revenue</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(stats.cross_sell_revenue)}
                </span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.cross_sell_revenue / stats.total_revenue) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-gray-600 dark:text-gray-400">Third-Party Ad Revenue</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(stats.ad_revenue)}
                </span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.ad_revenue / stats.total_revenue) * 100}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Mini Revenue Chart */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Revenue Trend (12 weeks)</p>
            <MiniChart data={revenueData} color="green" />
          </div>
        </div>
        
        {/* Attribution Channels */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            📊 Attribution by Channel
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Organic', value: stats.organic_revenue, color: 'green' },
              { name: 'Paid', value: stats.paid_revenue, color: 'blue' },
              { name: 'Referral', value: stats.referral_revenue, color: 'purple' },
              { name: 'Direct', value: stats.direct_revenue, color: 'yellow' },
            ].map((channel) => {
              const total = stats.organic_revenue + stats.paid_revenue + stats.referral_revenue + stats.direct_revenue;
              const percent = total > 0 ? (channel.value / total) * 100 : 0;
              return (
                <div key={channel.name} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-gray-600 dark:text-gray-400">{channel.name}</span>
                  <div className="flex-1">
                    <ProgressBar value={percent} max={100} color={channel.color} showLabel={false} size="sm" />
                  </div>
                  <span className="w-16 text-right text-sm font-medium text-gray-900 dark:text-white">
                    {formatPercent(percent)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Active Campaigns & Top Apps - Mobile Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Campaigns */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              🎯 Active Campaigns
            </h3>
            <span className="text-sm text-gray-500">{stats.active_campaigns} active</span>
          </div>
          <div className="space-y-3">
            {recentCampaigns.slice(0, 4).map((campaign) => (
              <div 
                key={campaign.campaign_id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg">
                    {campaign.campaign_type === 'cross_sell' ? '🔗' : 
                     campaign.campaign_type === 'ab_test' ? '🧪' : '📢'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{campaign.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(campaign.impressions)} imp • {formatPercent(campaign.ctr)} CTR
                    </p>
                  </div>
                </div>
                <StatusBadge status={campaign.status} />
              </div>
            ))}
            {recentCampaigns.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No active campaigns</p>
            )}
          </div>
        </div>
        
        {/* Top Apps Leaderboard */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              📱 Top Performing Apps
            </h3>
            <a href="/admin/marketing/apps" className="text-sm text-blue-600 hover:text-blue-700">View all →</a>
          </div>
          <div className="space-y-2">
            {topApps.slice(0, 5).map((app, index) => (
              <div 
                key={app.app_id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-400">
                  #{index + 1}
                </span>
                <div className={`w-8 h-8 rounded-lg ${RATING_COLORS[app.rating]} flex items-center justify-center text-white text-sm font-bold`}>
                  {app.rating}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{app.name}</p>
                  <p className="text-xs text-gray-500">{formatNumber(app.active_users)} users</p>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(app.mrr)}/mo
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group">
            <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Campaign</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🧪</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Start A/B Test</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🔄</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Update Ratings</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors group">
            <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Export Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Campaigns Tab
function CampaignsTab({
  campaigns,
  onCreateCampaign,
  onToggleCampaign,
  onViewDetails,
}: {
  campaigns: Campaign[];
  onCreateCampaign: () => void;
  onToggleCampaign: (id: string, action: 'activate' | 'pause') => void;
  onViewDetails: (id: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'revenue' | 'impressions' | 'ctr' | 'created'>('revenue');
  
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;
    if (filter !== 'all') {
      filtered = campaigns.filter((c) => c.status === filter);
    }
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.revenue - a.revenue;
        case 'impressions':
          return b.impressions - a.impressions;
        case 'ctr':
          return b.ctr - a.ctr;
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  }, [campaigns, filter, sortBy]);
  
  return (
    <div className="space-y-4">
      {/* Header Controls - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'paused', 'draft'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="impressions">Sort by Impressions</option>
            <option value="ctr">Sort by CTR</option>
            <option value="created">Sort by Date</option>
          </select>
          <button
            onClick={onCreateCampaign}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            <span className="hidden sm:inline">New Campaign</span>
          </button>
        </div>
      </div>
      
      {/* Campaigns List - Mobile Cards / Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Campaign</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Impressions</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Clicks</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">CTR</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Conversions</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">ROAS</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredCampaigns.map((campaign) => (
              <tr 
                key={campaign.campaign_id}
                className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                onClick={() => onViewDetails(campaign.campaign_id)}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {campaign.campaign_type === 'cross_sell' ? '🔗' : 
                       campaign.campaign_type === 'ab_test' ? '🧪' : '📢'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{campaign.name}</p>
                      <p className="text-xs text-gray-500">{campaign.campaign_type}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={campaign.status} />
                </td>
                <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                  {formatNumber(campaign.impressions)}
                </td>
                <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                  {formatNumber(campaign.clicks)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={campaign.ctr >= 2 ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}>
                    {formatPercent(campaign.ctr)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                  {formatNumber(campaign.conversions)}
                </td>
                <td className="py-3 px-4 text-right font-medium text-green-600">
                  {formatCurrency(campaign.revenue)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={campaign.roas >= 1 ? 'text-green-600' : 'text-red-600'}>
                    {campaign.roas.toFixed(2)}x
                  </span>
                </td>
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center gap-1">
                    {campaign.status === 'active' ? (
                      <button
                        onClick={() => onToggleCampaign(campaign.campaign_id, 'pause')}
                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                        title="Pause campaign"
                      >
                        ⏸
                      </button>
                    ) : campaign.status === 'paused' ? (
                      <button
                        onClick={() => onToggleCampaign(campaign.campaign_id, 'activate')}
                        className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Activate campaign"
                      >
                        ▶
                      </button>
                    ) : null}
                    <button
                      className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="More options"
                    >
                      ⋮
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filteredCampaigns.map((campaign) => (
          <div 
            key={campaign.campaign_id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            onClick={() => onViewDetails(campaign.campaign_id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {campaign.campaign_type === 'cross_sell' ? '🔗' : 
                   campaign.campaign_type === 'ab_test' ? '🧪' : '📢'}
                </span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{campaign.name}</h4>
                  <p className="text-xs text-gray-500 capitalize">{campaign.campaign_type}</p>
                </div>
              </div>
              <StatusBadge status={campaign.status} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-gray-500">Impressions</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatNumber(campaign.impressions)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">CTR</p>
                <p className={`font-medium ${campaign.ctr >= 2 ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                  {formatPercent(campaign.ctr)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="font-medium text-green-600">{formatCurrency(campaign.revenue)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredCampaigns.length === 0 && (
        <EmptyState
          icon="🎯"
          title="No campaigns found"
          description={filter === 'all' ? "Create your first marketing campaign to start driving cross-sells and revenue." : `No ${filter} campaigns found.`}
          action={{ label: 'Create Campaign', onClick: onCreateCampaign }}
        />
      )}
    </div>
  );
}

// Apps Tab - App Leaderboard
function AppsTab({
  apps,
  onUpdateRatings,
  onToggleCrossSell,
}: {
  apps: AppLeaderboardEntry[];
  onUpdateRatings: () => void;
  onToggleCrossSell: (appId: string, enabled: boolean) => void;
}) {
  const [sortBy, setSortBy] = useState<'rating' | 'mrr' | 'users' | 'conversions'>('rating');
  
  const sortedApps = useMemo(() => {
    return [...apps].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating_score - a.rating_score;
        case 'mrr':
          return b.mrr - a.mrr;
        case 'users':
          return b.active_users - a.active_users;
        case 'conversions':
          return b.cross_sell_conversions - a.cross_sell_conversions;
        default:
          return 0;
      }
    });
  }, [apps, sortBy]);
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">App Leaderboard</h3>
          <p className="text-sm text-gray-500">Apps ranked by cross-sell performance</p>
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="rating">Sort by Rating</option>
            <option value="mrr">Sort by MRR</option>
            <option value="users">Sort by Users</option>
            <option value="conversions">Sort by Conversions</option>
          </select>
          <button
            onClick={onUpdateRatings}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            🔄 <span className="hidden sm:inline">Update Ratings</span>
          </button>
        </div>
      </div>
      
      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sortedApps.map((app, index) => (
          <div 
            key={app.app_id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="relative">
                {app.icon_url ? (
                  <img src={app.icon_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                    {app.name.charAt(0)}
                  </div>
                )}
                <span className="absolute -top-1 -left-1 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">{app.name}</h4>
                  <div className={`w-6 h-6 rounded ${RATING_COLORS[app.rating]} flex items-center justify-center text-white text-xs font-bold`}>
                    {app.rating}
                  </div>
                </div>
                <p className="text-xs text-gray-500">{app.category}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={app.cross_sell_enabled}
                  onChange={(e) => onToggleCrossSell(app.app_id, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-2">
                <p className="text-xs text-gray-500">MRR</p>
                <p className="font-semibold text-green-600">{formatCurrency(app.mrr)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-2">
                <p className="text-xs text-gray-500">Active Users</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatNumber(app.active_users)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-2">
                <p className="text-xs text-gray-500">Cross-Sell Conv.</p>
                <p className="font-semibold text-blue-600">{formatNumber(app.cross_sell_conversions)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-2">
                <p className="text-xs text-gray-500">Cross-Sell Rev.</p>
                <p className="font-semibold text-purple-600">{formatCurrency(app.cross_sell_revenue)}</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Rating Score: {app.rating_score}/100</span>
                <span className="text-gray-400">Updated {getRelativeTime(app.last_updated)}</span>
              </div>
              <div className="mt-1.5 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${RATING_COLORS[app.rating]}`}
                  style={{ width: `${app.rating_score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {apps.length === 0 && (
        <EmptyState
          icon="📱"
          title="No apps found"
          description="Your apps will appear here once they're registered in the system."
        />
      )}
    </div>
  );
}

// Advertisers Tab
function AdvertisersTab({
  advertisers,
  onApprove,
  onReject,
  onInvite,
}: {
  advertisers: Advertiser[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onInvite: () => void;
}) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
  
  const filteredAdvertisers = useMemo(() => {
    if (filter === 'all') return advertisers;
    if (filter === 'pending') return advertisers.filter((a) => a.status === 'pending');
    return advertisers.filter((a) => a.status === 'active');
  }, [advertisers, filter]);
  
  const pendingCount = advertisers.filter((a) => a.status === 'pending').length;
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            All ({advertisers.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filter === 'pending' ? 'bg-orange-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            Pending
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${filter === 'pending' ? 'bg-white/20' : 'bg-orange-500 text-white'}`}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            Active
          </button>
        </div>
        <button
          onClick={onInvite}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Invite Advertiser
        </button>
      </div>
      
      {/* Advertisers List */}
      <div className="space-y-3">
        {filteredAdvertisers.map((advertiser) => (
          <div 
            key={advertiser.advertiser_id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                  {advertiser.company_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {advertiser.company_name}
                    </h4>
                    <StatusBadge status={advertiser.status} />
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {advertiser.contact_name} • {advertiser.contact_email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Spend</p>
                  <p className="font-semibold text-green-600">{formatCurrency(advertiser.total_spend)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Campaigns</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{advertiser.active_campaigns}</p>
                </div>
                
                {advertiser.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApprove(advertiser.advertiser_id)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(advertiser.advertiser_id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredAdvertisers.length === 0 && (
        <EmptyState
          icon="💼"
          title={filter === 'pending' ? 'No pending advertisers' : 'No advertisers yet'}
          description="Third-party advertisers can promote their products on your platform. Invite advertisers to get started."
          action={{ label: 'Invite Advertiser', onClick: onInvite }}
        />
      )}
    </div>
  );
}

// A/B Tests Tab
function ABTestsTab({
  tests,
  onCreateTest,
  onEndTest,
}: {
  tests: ABTest[];
  onCreateTest: () => void;
  onEndTest: (testId: string, winner: 'A' | 'B') => void;
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">A/B Testing</h3>
          <p className="text-sm text-gray-500">Test different variations to optimize performance</p>
        </div>
        <button
          onClick={onCreateTest}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New A/B Test
        </button>
      </div>
      
      {/* Tests List */}
      <div className="space-y-4">
        {tests.map((test) => (
          <div 
            key={test.test_id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{test.name}</h4>
                  <StatusBadge status={test.status} />
                </div>
                {test.started_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    Started {formatDate(test.started_at)}
                    {test.ended_at && ` • Ended ${formatDate(test.ended_at)}`}
                  </p>
                )}
              </div>
              {test.confidence_level >= 95 && !test.winner && test.status === 'running' && (
                <Badge variant="success">Significant</Badge>
              )}
            </div>
            
            {/* Variants Comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Variant A */}
              <div className={`p-4 rounded-lg border-2 ${test.winner === 'A' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">Variant A</span>
                  {test.winner === 'A' && <Badge variant="success" size="sm">Winner 🏆</Badge>}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{test.variant_a.name}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Impressions</span>
                    <span className="font-medium">{formatNumber(test.variant_a.impressions)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Conversions</span>
                    <span className="font-medium">{formatNumber(test.variant_a.conversions)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Conv. Rate</span>
                    <span className="font-bold text-lg">{formatPercent(test.variant_a.conversion_rate)}</span>
                  </div>
                </div>
              </div>
              
              {/* Variant B */}
              <div className={`p-4 rounded-lg border-2 ${test.winner === 'B' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">Variant B</span>
                  {test.winner === 'B' && <Badge variant="success" size="sm">Winner 🏆</Badge>}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{test.variant_b.name}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Impressions</span>
                    <span className="font-medium">{formatNumber(test.variant_b.impressions)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Conversions</span>
                    <span className="font-medium">{formatNumber(test.variant_b.conversions)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Conv. Rate</span>
                    <span className="font-bold text-lg">{formatPercent(test.variant_b.conversion_rate)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Confidence & Actions */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Statistical Confidence:</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${test.confidence_level >= 95 ? 'bg-green-500' : test.confidence_level >= 80 ? 'bg-yellow-500' : 'bg-gray-400'}`}
                      style={{ width: `${test.confidence_level}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${test.confidence_level >= 95 ? 'text-green-600' : 'text-gray-600'}`}>
                    {formatPercent(test.confidence_level)}
                  </span>
                </div>
              </div>
              
              {test.status === 'running' && test.confidence_level >= 95 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onEndTest(test.test_id, 'A')}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Pick A as Winner
                  </button>
                  <button
                    onClick={() => onEndTest(test.test_id, 'B')}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Pick B as Winner
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {tests.length === 0 && (
        <EmptyState
          icon="🧪"
          title="No A/B tests yet"
          description="Create A/B tests to optimize your cross-sell messaging, placement, and timing."
          action={{ label: 'Create A/B Test', onClick: onCreateTest }}
        />
      )}
    </div>
  );
}

// Funnel Tab
function FunnelTab({ stats }: { stats: DashboardStats | null }) {
  if (!stats) return <LoadingSpinner />;
  
  const stages: FunnelStage[] = [
    { name: 'Visitors', count: stats.funnel_visitors, conversion_rate: 100, color: 'bg-blue-500' },
    { name: 'Leads', count: stats.funnel_leads, conversion_rate: (stats.funnel_leads / stats.funnel_visitors) * 100, color: 'bg-cyan-500' },
    { name: 'MQLs', count: stats.funnel_mqls, conversion_rate: (stats.funnel_mqls / stats.funnel_leads) * 100, color: 'bg-green-500' },
    { name: 'SQLs', count: stats.funnel_sqls, conversion_rate: (stats.funnel_sqls / stats.funnel_mqls) * 100, color: 'bg-yellow-500' },
    { name: 'Opportunities', count: stats.funnel_opportunities, conversion_rate: (stats.funnel_opportunities / stats.funnel_sqls) * 100, color: 'bg-orange-500' },
    { name: 'Customers', count: stats.funnel_customers, conversion_rate: (stats.funnel_customers / stats.funnel_opportunities) * 100, color: 'bg-purple-500' },
  ];
  
  const maxCount = stages[0].count;
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Marketing Funnel</h3>
        <p className="text-sm text-gray-500">Track conversion through each stage of your marketing funnel</p>
      </div>
      
      {/* Visual Funnel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const widthPercent = Math.max((stage.count / maxCount) * 100, 20);
            const isLast = index === stages.length - 1;
            
            return (
              <div key={stage.name} className="relative">
                <div 
                  className={`${stage.color} rounded-lg p-4 transition-all duration-500 hover:opacity-90 cursor-pointer`}
                  style={{ width: `${widthPercent}%`, marginLeft: `${(100 - widthPercent) / 2}%` }}
                >
                  <div className="flex items-center justify-between text-white">
                    <span className="font-medium">{stage.name}</span>
                    <span className="font-bold">{formatNumber(stage.count)}</span>
                  </div>
                </div>
                {!isLast && (
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 text-xs text-gray-500 bg-white dark:bg-gray-800 px-2 z-10">
                    ↓ {formatPercent(stages[index + 1].conversion_rate)} conv.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Stage Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((stage, index) => (
          <div key={stage.name} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className={`w-3 h-3 ${stage.color} rounded-full mx-auto mb-2`} />
            <p className="text-xs text-gray-500 mb-1">{stage.name}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(stage.count)}</p>
            {index > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {formatPercent(stage.conversion_rate)} from prev.
              </p>
            )}
          </div>
        ))}
      </div>
      
      {/* Overall Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-blue-100 text-sm">Overall Conversion</p>
          <p className="text-2xl font-bold">
            {formatPercent((stats.funnel_customers / stats.funnel_visitors) * 100)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <p className="text-green-100 text-sm">Lead → Customer</p>
          <p className="text-2xl font-bold">
            {formatPercent((stats.funnel_customers / stats.funnel_leads) * 100)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-purple-100 text-sm">Avg. Time to Convert</p>
          <p className="text-2xl font-bold">14 days</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <p className="text-orange-100 text-sm">Customer LTV</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.total_revenue / stats.funnel_customers)}</p>
        </div>
      </div>
    </div>
  );
}

// Alerts Tab
function AlertsTab({
  alerts,
  onAcknowledge,
  onDismiss,
}: {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');
  
  const filteredAlerts = useMemo(() => {
    if (filter === 'unread') return alerts.filter((a) => !a.acknowledged);
    return alerts;
  }, [alerts, filter]);
  
  const unreadCount = alerts.filter((a) => !a.acknowledged).length;
  
  const alertTypeConfig: Record<string, { icon: string; bg: string; border: string }> = {
    warning: { icon: '⚠️', bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800' },
    error: { icon: '🚨', bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800' },
    info: { icon: 'ℹ️', bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800' },
    success: { icon: '✅', bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-800' },
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${filter === 'unread' ? 'bg-white/20' : 'bg-red-500 text-white'}`}>
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            All ({alerts.length})
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => alerts.forEach((a) => !a.acknowledged && onAcknowledge(a.alert_id))}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const config = alertTypeConfig[alert.type];
          return (
            <div 
              key={alert.alert_id}
              className={`${config.bg} border ${config.border} rounded-xl p-4 ${!alert.acknowledged ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{config.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{getRelativeTime(alert.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => onAcknowledge(alert.alert_id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                    {alert.action_url && (
                      <a 
                        href={alert.action_url}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View details →
                      </a>
                    )}
                    <button
                      onClick={() => onDismiss(alert.alert_id)}
                      className="text-sm text-gray-400 hover:text-gray-600"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredAlerts.length === 0 && (
        <EmptyState
          icon="🔔"
          title={filter === 'unread' ? 'No unread alerts' : 'No alerts'}
          description="You're all caught up! We'll notify you when something needs your attention."
        />
      )}
    </div>
  );
}

// Settings Tab
function SettingsTab({ onSave }: { onSave: (settings: Record<string, unknown>) => void }) {
  const [settings, setSettings] = useState({
    crossSellEnabled: true,
    thirdPartyAdsEnabled: true,
    autoOptimization: true,
    emailAlerts: true,
    slackAlerts: false,
    minConfidenceLevel: 95,
    defaultBudgetAlert: 80,
  });
  
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Marketing Settings</h3>
        <p className="text-sm text-gray-500">Configure your marketing engine behavior and notifications</p>
      </div>
      
      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white">General</h4>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Cross-Sell Promotions</p>
            <p className="text-sm text-gray-500">Enable cross-selling between your apps</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.crossSellEnabled}
              onChange={(e) => setSettings({ ...settings, crossSellEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Third-Party Ads</p>
            <p className="text-sm text-gray-500">Allow approved advertisers to run campaigns</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.thirdPartyAdsEnabled}
              onChange={(e) => setSettings({ ...settings, thirdPartyAdsEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Auto-Optimization</p>
            <p className="text-sm text-gray-500">Automatically pause underperforming campaigns</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoOptimization}
              onChange={(e) => setSettings({ ...settings, autoOptimization: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white">Notifications</h4>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Email Alerts</p>
            <p className="text-sm text-gray-500">Receive alerts via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailAlerts}
              onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Slack Integration</p>
            <p className="text-sm text-gray-500">Send alerts to Slack channel</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.slackAlerts}
              onChange={(e) => setSettings({ ...settings, slackAlerts: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
      
      {/* Thresholds */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white">Thresholds</h4>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-gray-700 dark:text-gray-300">A/B Test Confidence Level</label>
            <span className="text-sm text-gray-500">{settings.minConfidenceLevel}%</span>
          </div>
          <input
            type="range"
            min="80"
            max="99"
            value={settings.minConfidenceLevel}
            onChange={(e) => setSettings({ ...settings, minConfidenceLevel: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum confidence required to declare a winner</p>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-gray-700 dark:text-gray-300">Budget Alert Threshold</label>
            <span className="text-sm text-gray-500">{settings.defaultBudgetAlert}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={settings.defaultBudgetAlert}
            onChange={(e) => setSettings({ ...settings, defaultBudgetAlert: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <p className="text-xs text-gray-500 mt-1">Alert when campaign budget reaches this percentage</p>
        </div>
      </div>
      
      {/* Help Links */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">📚 Resources</h4>
        <div className="grid grid-cols-2 gap-3">
          <a href={HELP_LINKS.documentation} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 hover:underline">
            📖 Documentation
          </a>
          <a href={HELP_LINKS.helpdesk} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 hover:underline">
            🎧 Helpdesk
          </a>
          <a href={HELP_LINKS.tutorials} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 hover:underline">
            🎬 Tutorials
          </a>
          <a href={HELP_LINKS.api} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 hover:underline">
            🔌 API Reference
          </a>
        </div>
      </div>
      
      <button
        onClick={() => onSave(settings)}
        className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
      >
        Save Settings
      </button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface MarketingDashboardCardProps {
  apiBaseUrl?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export default function MarketingDashboardCard({
  apiBaseUrl = API_BASE,
  className = '',
  defaultExpanded = false,
}: MarketingDashboardCardProps) {
  // State
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [apps, setApps] = useState<AppLeaderboardEntry[]>([]);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // In production, these would be real API calls
      // For now, using mock data
      
      // Mock stats
      setStats({
        active_campaigns: 12,
        total_impressions: 1250000,
        total_clicks: 45000,
        total_conversions: 2340,
        total_revenue: 87500,
        avg_ctr: 3.6,
        avg_conversion_rate: 5.2,
        cross_sell_impressions: 890000,
        cross_sell_clicks: 32000,
        cross_sell_conversions: 1800,
        cross_sell_revenue: 67000,
        ad_impressions: 360000,
        ad_clicks: 13000,
        ad_revenue: 20500,
        funnel_visitors: 50000,
        funnel_leads: 8500,
        funnel_mqls: 3200,
        funnel_sqls: 1400,
        funnel_opportunities: 650,
        funnel_customers: 280,
        organic_revenue: 35000,
        paid_revenue: 28000,
        referral_revenue: 15500,
        direct_revenue: 9000,
        revenue_change: 12.5,
        impressions_change: 8.3,
        conversions_change: 15.2,
        health_score: 84,
        active_alerts: 3,
      });
      
      // Mock campaigns
      setCampaigns([
        { campaign_id: 'CMP-001', name: 'Market Oracle → VerifyForge', description: 'Cross-sell testing platform to stock users', campaign_type: 'cross_sell', status: 'active', impressions: 45000, clicks: 1800, conversions: 156, revenue: 4680, ctr: 4.0, conversion_rate: 8.7, roas: 2.4, target_apps: ['market-oracle'], spend: 1950, created_at: '2025-11-01', updated_at: '2025-11-25' },
        { campaign_id: 'CMP-002', name: 'Legalease → Builder', description: 'Cross-sell document builder', campaign_type: 'cross_sell', status: 'active', impressions: 32000, clicks: 1120, conversions: 89, revenue: 2670, ctr: 3.5, conversion_rate: 7.9, roas: 2.1, target_apps: ['legalease'], spend: 1270, created_at: '2025-11-05', updated_at: '2025-11-24' },
        { campaign_id: 'CMP-003', name: 'Holiday Special Banner', description: 'Third-party holiday promotion', campaign_type: 'third_party', status: 'active', impressions: 78000, clicks: 2340, conversions: 187, revenue: 5610, ctr: 3.0, conversion_rate: 8.0, roas: 1.8, target_apps: [], spend: 3120, created_at: '2025-11-15', updated_at: '2025-11-25' },
        { campaign_id: 'CMP-004', name: 'CTA Button Test', description: 'Testing button colors', campaign_type: 'ab_test', status: 'running', impressions: 12000, clicks: 480, conversions: 42, revenue: 1260, ctr: 4.0, conversion_rate: 8.75, roas: 2.5, target_apps: [], spend: 500, created_at: '2025-11-20', updated_at: '2025-11-25' },
      ]);
      
      // Mock apps
      setApps([
        { app_id: 'APPX-001', name: 'Market Oracle', slug: 'market-oracle', category: 'Finance', rating: 'A', rating_score: 92, mrr: 12500, active_users: 3400, cross_sell_enabled: true, cross_sell_conversions: 450, cross_sell_revenue: 13500, icon_url: '', last_updated: '2025-11-25T10:30:00Z' },
        { app_id: 'APPX-002', name: 'VerifyForge', slug: 'verifyforge', category: 'Development', rating: 'A', rating_score: 88, mrr: 9800, active_users: 2100, cross_sell_enabled: true, cross_sell_conversions: 320, cross_sell_revenue: 9600, icon_url: '', last_updated: '2025-11-25T09:15:00Z' },
        { app_id: 'APPX-003', name: 'Legalease', slug: 'legalease', category: 'Legal', rating: 'B', rating_score: 78, mrr: 7200, active_users: 1800, cross_sell_enabled: true, cross_sell_conversions: 210, cross_sell_revenue: 6300, icon_url: '', last_updated: '2025-11-24T16:45:00Z' },
        { app_id: 'APPX-004', name: 'Builder Web', slug: 'builder', category: 'Productivity', rating: 'B', rating_score: 75, mrr: 5600, active_users: 1450, cross_sell_enabled: true, cross_sell_conversions: 180, cross_sell_revenue: 5400, icon_url: '', last_updated: '2025-11-24T14:20:00Z' },
        { app_id: 'APPX-005', name: 'Newsletter Pro', slug: 'newsletter', category: 'Marketing', rating: 'C', rating_score: 62, mrr: 3400, active_users: 890, cross_sell_enabled: false, cross_sell_conversions: 95, cross_sell_revenue: 2850, icon_url: '', last_updated: '2025-11-23T11:30:00Z' },
      ]);
      
      // Mock advertisers
      setAdvertisers([
        { advertiser_id: 'ADVR-001', company_name: 'TechCorp Solutions', contact_name: 'John Smith', contact_email: 'john@techcorp.com', category: 'Technology', status: 'active', total_spend: 12500, active_campaigns: 3, created_at: '2025-10-01' },
        { advertiser_id: 'ADVR-002', company_name: 'Growth Marketing Inc', contact_name: 'Sarah Johnson', contact_email: 'sarah@growthmarketing.com', category: 'Marketing', status: 'active', total_spend: 8900, active_campaigns: 2, created_at: '2025-10-15' },
        { advertiser_id: 'ADVR-003', company_name: 'StartupXYZ', contact_name: 'Mike Chen', contact_email: 'mike@startupxyz.com', category: 'SaaS', status: 'pending', total_spend: 0, active_campaigns: 0, created_at: '2025-11-20' },
      ]);
      
      // Mock A/B tests
      setABTests([
        { test_id: 'ABT-001', name: 'CTA Button Color Test', status: 'running', variant_a: { name: 'Blue Button', impressions: 6000, conversions: 21, conversion_rate: 0.35 }, variant_b: { name: 'Green Button', impressions: 6000, conversions: 28, conversion_rate: 0.47 }, confidence_level: 87, started_at: '2025-11-20' },
        { test_id: 'ABT-002', name: 'Headline Copy Test', status: 'completed', variant_a: { name: 'Original Headline', impressions: 15000, conversions: 45, conversion_rate: 0.30 }, variant_b: { name: 'New Headline', impressions: 15000, conversions: 72, conversion_rate: 0.48 }, confidence_level: 98, winner: 'B', started_at: '2025-11-01', ended_at: '2025-11-18' },
      ]);
      
      // Mock alerts
      setAlerts([
        { alert_id: 'ALT-001', type: 'warning', title: 'Campaign Budget Running Low', message: 'Holiday Special Banner campaign has used 85% of its budget.', timestamp: '2025-11-25T09:30:00Z', acknowledged: false, action_url: '/admin/marketing/campaigns/CMP-003' },
        { alert_id: 'ALT-002', type: 'success', title: 'A/B Test Reached Significance', message: 'Headline Copy Test has reached 98% statistical significance.', timestamp: '2025-11-25T08:15:00Z', acknowledged: false, action_url: '/admin/marketing/ab-tests/ABT-002' },
        { alert_id: 'ALT-003', type: 'info', title: 'New Advertiser Application', message: 'StartupXYZ has applied to become an advertiser.', timestamp: '2025-11-24T16:00:00Z', acknowledged: false, action_url: '/admin/marketing/advertisers' },
      ]);
      
    } catch (error) {
      console.error('Failed to fetch marketing data:', error);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);
  
  useEffect(() => {
    if (expanded) {
      fetchData();
    }
  }, [expanded, fetchData]);
  
  // Action handlers
  const handleCreateCampaign = () => {
    // TODO: Open campaign creation modal
    console.log('Create campaign');
  };
  
  const handleToggleCampaign = async (id: string, action: 'activate' | 'pause') => {
    try {
      await fetch(`${apiBaseUrl}/api/marketing/campaigns/${id}/${action}`, { method: 'POST' });
      fetchData();
    } catch (error) {
      console.error(`Failed to ${action} campaign:`, error);
    }
  };
  
  const handleViewCampaignDetails = (id: string) => {
    console.log('View campaign:', id);
  };
  
  const handleUpdateRatings = async () => {
    try {
      await fetch(`${apiBaseUrl}/api/marketing/ratings/update-all`, { method: 'POST' });
      fetchData();
    } catch (error) {
      console.error('Failed to update ratings:', error);
    }
  };
  
  const handleToggleCrossSell = async (appId: string, enabled: boolean) => {
    try {
      await fetch(`${apiBaseUrl}/api/marketing/apps/${appId}/cross-sell`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to toggle cross-sell:', error);
    }
  };
  
  const handleApproveAdvertiser = async (id: string) => {
    try {
      await fetch(`${apiBaseUrl}/api/marketing/advertisers/${id}/approve`, { method: 'POST' });
      fetchData();
    } catch (error) {
      console.error('Failed to approve advertiser:', error);
    }
  };
  
  const handleRejectAdvertiser = async (id: string) => {
    try {
      await fetch(`${apiBaseUrl}/api/marketing/advertisers/${id}/reject`, { method: 'POST' });
      fetchData();
    } catch (error) {
      console.error('Failed to reject advertiser:', error);
    }
  };
  
  const handleInviteAdvertiser = () => {
    console.log('Invite advertiser');
  };
  
  const handleCreateABTest = () => {
    console.log('Create A/B test');
  };
  
  const handleEndABTest = async (testId: string, winner: 'A' | 'B') => {
    try {
      await fetch(`${apiBaseUrl}/api/marketing/ab-tests/${testId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to end A/B test:', error);
    }
  };
  
  const handleAcknowledgeAlert = async (id: string) => {
    setAlerts((prev) => prev.map((a) => a.alert_id === id ? { ...a, acknowledged: true } : a));
  };
  
  const handleDismissAlert = async (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.alert_id !== id));
  };
  
  const handleSaveSettings = (settings: Record<string, unknown>) => {
    console.log('Save settings:', settings);
  };
  
  // Health status
  const healthStatus = stats?.health_score ? (stats.health_score >= 80 ? 'healthy' : stats.health_score >= 60 ? 'warning' : 'error') : 'idle';
  const statusColors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    idle: 'bg-gray-400',
  };
  
  const unreadAlerts = alerts.filter((a) => !a.acknowledged).length;
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
      {/* Card Header (Always Visible) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-2xl sm:text-3xl">📣</span>
          <div className="text-left">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
              Marketing & Cross-Sell Engine
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {stats
                ? `${stats.active_campaigns} campaigns • ${formatCurrency(stats.total_revenue)} revenue`
                : 'Loading...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {unreadAlerts > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {unreadAlerts}
            </span>
          )}
          <div className={`w-3 h-3 rounded-full ${statusColors[healthStatus]}`} />
          <span className="text-gray-400 text-lg sm:text-xl">
            {expanded ? '▼' : '▶'}
          </span>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Tabs - Horizontal scroll on mobile */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex border-b border-gray-200 dark:border-gray-700 px-4 min-w-max">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge && unreadAlerts > 0 && tab.id === 'alerts' && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {unreadAlerts}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                {activeTab === 'overview' && (
                  <OverviewTab
                    stats={stats}
                    topApps={apps}
                    recentCampaigns={campaigns}
                    alerts={alerts}
                  />
                )}
                {activeTab === 'campaigns' && (
                  <CampaignsTab
                    campaigns={campaigns}
                    onCreateCampaign={handleCreateCampaign}
                    onToggleCampaign={handleToggleCampaign}
                    onViewDetails={handleViewCampaignDetails}
                  />
                )}
                {activeTab === 'apps' && (
                  <AppsTab
                    apps={apps}
                    onUpdateRatings={handleUpdateRatings}
                    onToggleCrossSell={handleToggleCrossSell}
                  />
                )}
                {activeTab === 'advertisers' && (
                  <AdvertisersTab
                    advertisers={advertisers}
                    onApprove={handleApproveAdvertiser}
                    onReject={handleRejectAdvertiser}
                    onInvite={handleInviteAdvertiser}
                  />
                )}
                {activeTab === 'ab_tests' && (
                  <ABTestsTab
                    tests={abTests}
                    onCreateTest={handleCreateABTest}
                    onEndTest={handleEndABTest}
                  />
                )}
                {activeTab === 'funnel' && (
                  <FunnelTab stats={stats} />
                )}
                {activeTab === 'alerts' && (
                  <AlertsTab
                    alerts={alerts}
                    onAcknowledge={handleAcknowledgeAlert}
                    onDismiss={handleDismissAlert}
                  />
                )}
                {activeTab === 'settings' && (
                  <SettingsTab onSave={handleSaveSettings} />
                )}
              </>
            )}
          </div>
          
          {/* Footer with Help Links */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-850">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-xs text-gray-500">
                Marketing Engine v2.0.0 • Last updated {new Date().toLocaleTimeString()}
              </p>
              <div className="flex items-center gap-4">
                <a href={HELP_LINKS.documentation} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700">
                  📖 Docs
                </a>
                <a href={HELP_LINKS.helpdesk} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700">
                  🎧 Support
                </a>
                <a href={HELP_LINKS.api} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700">
                  🔌 API
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
