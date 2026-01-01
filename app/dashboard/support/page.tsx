'use client';

// ============================================================================
// SUPPORT TICKETS PAGE - PRODUCTION READY
// Real data from Supabase - No mock data
// CR AudioViz AI - Henderson Standard
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Ticket {
  id: string;
  ticket_number: string;
  user_email: string;
  user_name: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query
      let query = supabase
        .from('support_tickets')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (search) {
        query = query.or(`title.ilike.%${search}%,user_email.ilike.%${search}%,ticket_number.ilike.%${search}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      setTickets(data || []);
      setTotalCount(count || 0);

      // Fetch stats
      const [totalResult, openResult, inProgressResult, resolvedResult] = await Promise.all([
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'resolved')
      ]);

      setStats({
        total: totalResult.count || 0,
        open: openResult.count || 0,
        inProgress: inProgressResult.count || 0,
        resolved: resolvedResult.count || 0
      });

    } catch (err: any) {
      console.error('Error loading tickets:', err);
      setError(err.message || 'Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-red-500/20 text-red-400';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400';
      case 'resolved': return 'bg-green-500/20 text-green-400';
      case 'closed': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const formatTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
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
            <h1 className="text-3xl font-bold">Support Tickets</h1>
            <p className="text-gray-400 mt-1">Manage customer support requests</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={MessageSquare}
          value={stats?.total || 0}
          label="Total Tickets"
          color="text-blue-400"
          loading={loading && !stats}
        />
        <StatCard
          icon={AlertCircle}
          value={stats?.open || 0}
          label="Open"
          color="text-red-400"
          loading={loading && !stats}
        />
        <StatCard
          icon={Clock}
          value={stats?.inProgress || 0}
          label="In Progress"
          color="text-yellow-400"
          loading={loading && !stats}
        />
        <StatCard
          icon={CheckCircle}
          value={stats?.resolved || 0}
          label="Resolved"
          color="text-green-400"
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
              placeholder="Search by title, email, or ticket number..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-gray-800/50 rounded-xl overflow-hidden">
        {loading && tickets.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No tickets found</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-700">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 hover:bg-gray-700/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-gray-500 font-mono">
                          #{ticket.ticket_number}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status?.replace('_', ' ')}
                        </span>
                        <span className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <h3 className="font-medium text-white mb-1">{ticket.title}</h3>
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{ticket.user_email}</span>
                        <span>•</span>
                        <span>{ticket.category}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(ticket.created_at)}</span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-700 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalCount)} of {totalCount}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-2 bg-gray-700 rounded-lg disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-2 bg-gray-700 rounded-lg disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <p className="text-center text-gray-500 text-xs mt-6">
        Data from Supabase • {totalCount} total tickets
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
  loading
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <div className={`w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-12 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-20"></div>
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
        </>
      )}
    </div>
  );
}
