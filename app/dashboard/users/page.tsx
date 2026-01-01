'use client';

// ============================================================================
// USERS MANAGEMENT PAGE - PRODUCTION READY
// Real data from Supabase - No mock data
// CR AudioViz AI - Henderson Standard
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  Mail, 
  TrendingUp, 
  Search, 
  Filter,
  MoreVertical,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  subscription_tier: string;
  credits_balance: number;
  last_login_at: string | null;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  activeThisMonth: number;
  newThisWeek: number;
  proUsers: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query with search
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (search) {
        query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      setUsers(data || []);
      setTotalCount(count || 0);

      // Fetch stats
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [totalResult, activeResult, newResult, proResult] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('last_login_at', thirtyDaysAgo),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
        supabase.from('users').select('*', { count: 'exact', head: true }).in('subscription_tier', ['pro', 'business', 'enterprise'])
      ]);

      setStats({
        totalUsers: totalResult.count || 0,
        activeThisMonth: activeResult.count || 0,
        newThisWeek: newResult.count || 0,
        proUsers: proResult.count || 0
      });

    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const getPlanBadgeColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise': return 'bg-purple-100 text-purple-700';
      case 'business': return 'bg-blue-100 text-blue-700';
      case 'pro': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="text-blue-400 hover:underline mb-2 inline-block text-sm">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users Management</h1>
            <p className="text-gray-400 mt-1">Manage customers and track activity</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          iconColor="text-blue-400"
          value={stats?.totalUsers || 0}
          label="Total Users"
          loading={loading && !stats}
        />
        <StatCard
          icon={TrendingUp}
          iconColor="text-green-400"
          value={stats?.activeThisMonth || 0}
          label="Active This Month"
          loading={loading && !stats}
        />
        <StatCard
          icon={UserPlus}
          iconColor="text-purple-400"
          value={stats?.newThisWeek || 0}
          label="New This Week"
          loading={loading && !stats}
        />
        <StatCard
          icon={Mail}
          iconColor="text-amber-400"
          value={stats?.proUsers || 0}
          label="Pro+ Users"
          loading={loading && !stats}
        />
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

      {/* Search & Filters */}
      <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800/50 rounded-xl overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No users found</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-2 text-blue-400 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Credits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                            {(user.name || user.email || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{user.name || 'No name'}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(user.subscription_tier)}`}>
                        {user.subscription_tier || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{(user.credits_balance || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {formatDate(user.last_login_at)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-gray-700 rounded-lg">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalCount)} of {totalCount} users
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-2 bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-2 bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-gray-500 text-xs mt-6">
        Data from Supabase • {totalCount} total users
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  iconColor,
  value,
  label,
  loading
}: {
  icon: React.ElementType;
  iconColor: string;
  value: number;
  label: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-16 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-24"></div>
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          <p className="text-sm text-gray-400">{label}</p>
        </>
      )}
    </div>
  );
}
