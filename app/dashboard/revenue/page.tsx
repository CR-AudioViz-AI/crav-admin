'use client';

// ============================================================================
// REVENUE DASHBOARD - PRODUCTION READY
// Real data from Supabase - No mock data
// CR AudioViz AI - Henderson Standard
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Users, 
  ArrowUp, 
  ArrowDown,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface RevenueData {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  totalRevenue: number;
  avgRevenuePerUser: number;
}

interface RevenueStream {
  name: string;
  amount: number;
  percentage: number;
}

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  current_period_end: string;
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [streams, setStreams] = useState<RevenueStream[]>([]);
  const [recentSubs, setRecentSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const planPrices: Record<string, number> = {
    'free': 0,
    'starter': 9,
    'basic': 19,
    'pro': 29,
    'business': 99,
    'enterprise': 299
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch active subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active');

      if (subError) throw subError;

      // Calculate MRR from active subscriptions
      const mrr = subscriptions?.reduce((sum, s) => sum + (planPrices[s.plan] || 0), 0) || 0;
      const arr = mrr * 12;

      // Fetch total payments
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'succeeded');

      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Fetch user count for ARPU
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const avgRevenuePerUser = userCount ? totalRevenue / userCount : 0;

      setData({
        mrr,
        arr,
        activeSubscriptions: subscriptions?.length || 0,
        totalRevenue,
        avgRevenuePerUser
      });

      // Calculate revenue streams by plan
      const streamsByPlan = new Map<string, number>();
      subscriptions?.forEach(s => {
        const amount = planPrices[s.plan] || 0;
        streamsByPlan.set(s.plan, (streamsByPlan.get(s.plan) || 0) + amount);
      });

      const totalMRR = mrr || 1; // Avoid division by zero
      const calculatedStreams: RevenueStream[] = Array.from(streamsByPlan.entries())
        .map(([plan, amount]) => ({
          name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
          amount,
          percentage: (amount / totalMRR) * 100
        }))
        .sort((a, b) => b.amount - a.amount);

      setStreams(calculatedStreams);

      // Fetch recent subscriptions
      const { data: recent } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentSubs(recent || []);

    } catch (err: any) {
      console.error('Error loading revenue:', err);
      setError(err.message || 'Failed to load revenue data');
      
      // Set empty defaults
      setData({
        mrr: 0,
        arr: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
        avgRevenuePerUser: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // ARR Progress
  const targetARR = 1000000;
  const progressPercent = Math.min(((data?.arr || 0) / targetARR) * 100, 100);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="text-blue-400 hover:underline mb-2 inline-block text-sm">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
            <p className="text-gray-400 mt-1">Track revenue, subscriptions, and financial metrics</p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !data ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={DollarSign}
              label="Monthly Recurring Revenue"
              value={formatCurrency(data?.mrr || 0)}
              iconColor="text-green-400"
            />
            <MetricCard
              icon={TrendingUp}
              label="Annual Run Rate"
              value={formatCurrency(data?.arr || 0)}
              iconColor="text-blue-400"
            />
            <MetricCard
              icon={CreditCard}
              label="Active Subscriptions"
              value={(data?.activeSubscriptions || 0).toString()}
              iconColor="text-purple-400"
            />
            <MetricCard
              icon={Users}
              label="Avg Revenue Per User"
              value={formatCurrency(data?.avgRevenuePerUser || 0)}
              iconColor="text-amber-400"
            />
          </div>

          {/* ARR Progress */}
          <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold">$1M ARR Goal Progress</h2>
                <p className="text-gray-400 text-sm">
                  {formatCurrency(data?.arr || 0)} of {formatCurrency(targetARR)}
                </p>
              </div>
              <span className="text-2xl font-bold text-blue-400">
                {progressPercent.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-gray-500 text-sm mt-2">
              {formatCurrency(targetARR - (data?.arr || 0))} remaining to reach goal
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Streams */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Revenue by Plan</h2>
              {streams.length > 0 ? (
                <div className="space-y-4">
                  {streams.map((stream) => (
                    <div key={stream.name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300">{stream.name}</span>
                        <span className="font-medium">{formatCurrency(stream.amount)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${stream.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{stream.percentage.toFixed(1)}% of MRR</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No active subscriptions</p>
              )}
            </div>

            {/* Recent Subscriptions */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Subscriptions</h2>
              {recentSubs.length > 0 ? (
                <div className="space-y-3">
                  {recentSubs.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{sub.plan} Plan</p>
                        <p className="text-xs text-gray-400">
                          {sub.status === 'active' ? 'Active' : sub.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-400">
                          {formatCurrency(planPrices[sub.plan] || 0)}/mo
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No subscriptions yet</p>
              )}
            </div>
          </div>

          {/* Total Revenue */}
          <div className="mt-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Lifetime Revenue</p>
                <p className="text-3xl font-bold text-green-400">{formatCurrency(data?.totalRevenue || 0)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-400/20" />
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <p className="text-center text-gray-500 text-xs mt-6">
        Data from Supabase • Real-time revenue metrics
      </p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  iconColor
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor: string;
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
