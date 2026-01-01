// /lib/hooks/admin/index.ts
// SHARED ADMIN HOOKS - Real Data Only, No Mock Data Ever
// CR AudioViz AI - Production Ready

import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

// ============================================
// TYPES - Match Supabase Schema Exactly
// ============================================

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin' | 'super_admin'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  plan: 'free' | 'pro' | 'business' | 'enterprise'
  credits_balance: number
  created_at: string
  last_sign_in_at: string | null
  metadata: Record<string, any>
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string | null
  paypal_subscription_id: string | null
  plan: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'adjustment'
  description: string
  balance_after: number
  created_at: string
  metadata: Record<string, any>
}

export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user?: User
}

export interface AnalyticsSummary {
  total_users: number
  active_users_today: number
  active_users_week: number
  active_users_month: number
  total_revenue: number
  mrr: number
  arr: number
  total_credits_used: number
  total_subscriptions: number
  churn_rate: number
}

export interface ApiKey {
  id: string
  user_id: string
  name: string
  key_prefix: string
  status: 'active' | 'revoked'
  last_used_at: string | null
  expires_at: string | null
  created_at: string
  permissions: string[]
}

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  assigned_to: string | null
  created_at: string
  updated_at: string
  user?: User
}

export interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string | null
  enabled: boolean
  rollout_percentage: number
  conditions: Record<string, any>
  created_at: string
  updated_at: string
}

// ============================================
// USER HOOKS
// ============================================

export function useUsers(options?: {
  search?: string
  status?: string
  plan?: string
  limit?: number
  offset?: number
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['admin', 'users', options],
    queryFn: async () => {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
      
      if (options?.search) {
        query = query.or(`email.ilike.%${options.search}%,full_name.ilike.%${options.search}%`)
      }
      if (options?.status) {
        query = query.eq('status', options.status)
      }
      if (options?.plan) {
        query = query.eq('plan', options.plan)
      }
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
      }
      
      const { data, error, count } = await query
      
      if (error) throw error
      return { users: data as User[], total: count || 0 }
    }
  })
}

export function useUser(userId: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data as User
    },
    enabled: !!userId
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] })
    }
  })
}

// ============================================
// SUBSCRIPTION HOOKS
// ============================================

export function useSubscriptions(options?: {
  status?: string
  plan?: string
  limit?: number
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['admin', 'subscriptions', options],
    queryFn: async () => {
      let query = supabase
        .from('subscriptions')
        .select('*, user:users(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
      
      if (options?.status) {
        query = query.eq('status', options.status)
      }
      if (options?.plan) {
        query = query.eq('plan', options.plan)
      }
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      
      const { data, error, count } = await query
      
      if (error) throw error
      return { subscriptions: data, total: count || 0 }
    }
  })
}

// ============================================
// CREDIT HOOKS
// ============================================

export function useCreditTransactions(options?: {
  userId?: string
  type?: string
  limit?: number
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['admin', 'credit-transactions', options],
    queryFn: async () => {
      let query = supabase
        .from('credit_transactions')
        .select('*, user:users(id, email, full_name)', { count: 'exact' })
        .order('created_at', { ascending: false })
      
      if (options?.userId) {
        query = query.eq('user_id', options.userId)
      }
      if (options?.type) {
        query = query.eq('type', options.type)
      }
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      
      const { data, error, count } = await query
      
      if (error) throw error
      return { transactions: data as CreditTransaction[], total: count || 0 }
    }
  })
}

export function useAdjustCredits() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      amount, 
      type, 
      description 
    }: { 
      userId: string
      amount: number
      type: 'bonus' | 'adjustment' | 'refund'
      description: string 
    }) => {
      const { data, error } = await supabase.rpc('adjust_user_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_type: type,
        p_description: description
      })
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'credit-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    }
  })
}

// ============================================
// ANALYTICS HOOKS
// ============================================

export function useAnalyticsSummary() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['admin', 'analytics-summary'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_analytics_summary')
      
      if (error) throw error
      return data as AnalyticsSummary
    },
    refetchInterval: 60000 // Refresh every minute
  })
}

export function useRevenueData(period: '7d' | '30d' | '90d' | '1y' = '30d') {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['admin', 'revenue', period],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_revenue_by_period', {
        p_period: period
      })
      
      if (error) throw error
      return data
    }
  })
}

export function useUserGrowth(period: '7d' | '30d' | '90d' | '1y' = '30d') {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['admin', 'user-growth', period],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_growth_by_period', {
        p_period: period
      })
      
      if (error) throw error
      return data
    }
  })
}

// ============================================
// ACTIVITY & AUDIT HOOKS
// ============================================

export function useActivityLog(options?: {
  userId?: string
  action?: string
  limit?: number
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['admin', 'activity-log', options],
    queryFn: async () => {
      let query = supabase
        .from('activity_log')
        .select('*, user:users(id, email, full_name, avatar_url)')
        .order('created_at', { ascending: false })
      
      if (options?.userId) {
        query = query.eq('user_id', options.userId)
      }
      if (options?.action) {
        query = query.eq('action', options.action)
      }
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data as ActivityLog[]
    }
  })
}

export function useRealtimeActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const supabase = createClient()
  
  useEffect(() => {
    // Initial fetch
    supabase
      .from('activity_log')
      .select('*, user:users(id, email, full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setActivities(data as ActivityLog[])
      })
    
    // Real-time subscription
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_log' },
        async (payload) => {
          // Fetch full record with user data
          const { data } = await supabase
            .from('activity_log')
            .select('*, user:users(id, email, full_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()
          
          if (data) {
            setActivities(prev => [data as ActivityLog, ...prev.slice(0, 49)])
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  return activities
}

// ============================================
// SUPPORT TICKET HOOKS
// ============================================

export function useSupportTickets(options?: {
  status?: string
  priority?: string
  limit?: number
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['admin', 'support-tickets', options],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select('*, user:users(id, email, full_name)', { count: 'exact' })
        .order('created_at', { ascending: false })
      
      if (options?.status) {
        query = query.eq('status', options.status)
      }
      if (options?.priority) {
        query = query.eq('priority', options.priority)
      }
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      
      const { data, error, count } = await query
      
      if (error) throw error
      return { tickets: data as SupportTicket[], total: count || 0 }
    }
  })
}

export function useUpdateTicket() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: string; updates: Partial<SupportTicket> }) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', ticketId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'support-tickets'] })
    }
  })
}

// ============================================
// FEATURE FLAG HOOKS
// ============================================

export function useFeatureFlags() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['admin', 'feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('key')
      
      if (error) throw error
      return data as FeatureFlag[]
    }
  })
}

export function useToggleFeatureFlag() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useMutation({
    mutationFn: async ({ flagId, enabled }: { flagId: string; enabled: boolean }) => {
      const { data, error } = await supabase
        .from('feature_flags')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('id', flagId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feature-flags'] })
    }
  })
}

// ============================================
// API KEY HOOKS
// ============================================

export function useApiKeys(userId?: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['admin', 'api-keys', userId],
    queryFn: async () => {
      let query = supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data as ApiKey[]
    }
  })
}

// ============================================
// DASHBOARD STATS HOOK (Combined)
// ============================================

export function useDashboardStats() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: async () => {
      // Parallel fetch for performance
      const [
        usersResult,
        subscriptionsResult,
        revenueResult,
        ticketsResult
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.rpc('get_total_revenue'),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open')
      ])
      
      return {
        totalUsers: usersResult.count || 0,
        activeSubscriptions: subscriptionsResult.count || 0,
        totalRevenue: revenueResult.data || 0,
        openTickets: ticketsResult.count || 0
      }
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })
}

// ============================================
// UTILITY: Loading & Error States
// ============================================

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
      <span className="text-gray-500">{message}</span>
    </div>
  )
}

export function ErrorState({ 
  error, 
  onRetry 
}: { 
  error: Error
  onRetry?: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-red-600 text-xl">!</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-500 text-sm mb-4">{error.message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ 
  title, 
  description, 
  action 
}: { 
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-gray-400 text-2xl">∅</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
