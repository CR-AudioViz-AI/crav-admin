'use client';

/**
 * CR AudioViz AI - Admin Dashboard
 * Mobile-Optimized Version
 * 
 * Features:
 * - Responsive grid: 1 col mobile → 2 col tablet → 3 col desktop
 * - 48px minimum touch targets
 * - Compact stats display on mobile
 * - Horizontal scroll category filter
 * - Pull-to-refresh support ready
 * 
 * @timestamp Thursday, December 25, 2025 - 6:40 PM EST
 */

import { useState } from 'react';
import { Activity, Bot, Newspaper, Megaphone, Users, DollarSign, CreditCard, Store, HeadphonesIcon, BarChart3, Settings, FileText, Heart, Search, Filter, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { UniversalCreditsBar } from '@/components/UniversalCreditsBar'

const dashboardCards = [
  {
    id: 'operations',
    title: 'Operations',
    description: '50+ metrics, gauges, and real-time alerts',
    icon: Activity,
    href: '/dashboard/operations',
    color: 'from-blue-500 to-blue-600',
    stats: { active: '127', alerts: '3', uptime: '99.8%' },
    category: 'monitoring'
  },
  {
    id: 'ai-management',
    title: 'AI Management',
    description: 'Chat with Javari, upload training data',
    icon: Bot,
    href: '/dashboard/ai-management',
    color: 'from-purple-500 to-purple-600',
    stats: { conversations: '1,234', models: '5', accuracy: '94%' },
    category: 'ai'
  },
  {
    id: 'news',
    title: 'News Dashboard',
    description: 'Feed Javari knowledge, create content',
    icon: Newspaper,
    href: '/dashboard/news',
    color: 'from-green-500 to-green-600',
    stats: { articles: '45', sources: '12', updated: '2m ago' },
    category: 'content'
  },
  {
    id: 'marketing',
    title: 'Marketing',
    description: 'Campaigns, newsletters, social media',
    icon: Megaphone,
    href: '/dashboard/marketing',
    color: 'from-pink-500 to-pink-600',
    stats: { campaigns: '8', reach: '45K', engagement: '12%' },
    category: 'content'
  },
  {
    id: 'users',
    title: 'Users',
    description: 'Customer database and activity',
    icon: Users,
    href: '/dashboard/users',
    color: 'from-indigo-500 to-indigo-600',
    stats: { total: '1,247', active: '892', new: '+45' },
    category: 'users'
  },
  {
    id: 'cost-tracker',
    title: 'Cost Tracker',
    description: 'Track expenses and subscriptions',
    icon: DollarSign,
    href: '/dashboard/cost-tracker',
    color: 'from-yellow-500 to-yellow-600',
    stats: { monthly: '$2,459', ytd: '$24,892', vendors: '12' },
    category: 'finance'
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'Revenue, transactions, billing',
    icon: CreditCard,
    href: '/dashboard/payments',
    color: 'from-emerald-500 to-emerald-600',
    stats: { revenue: '$12,450', transactions: '342', pending: '5' },
    category: 'finance'
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Products and commission tracking',
    icon: Store,
    href: '/dashboard/marketplace',
    color: 'from-orange-500 to-orange-600',
    stats: { products: '234', creators: '67', sales: '$5,670' },
    category: 'content'
  },
  {
    id: 'support',
    title: 'Support',
    description: 'Customer support tickets',
    icon: HeadphonesIcon,
    href: '/dashboard/support',
    color: 'from-red-500 to-red-600',
    stats: { open: '12', resolved: '234', avgTime: '2.3h' },
    category: 'users'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Usage and performance metrics',
    icon: BarChart3,
    href: '/dashboard/analytics',
    color: 'from-teal-500 to-teal-600',
    stats: { users: '12.5K', sessions: '45.2K', bounce: '32%' },
    category: 'monitoring'
  },
  {
    id: 'pricing',
    title: 'Pricing',
    description: 'Plans, credits, pricing tiers',
    icon: Settings,
    href: '/dashboard/pricing',
    color: 'from-violet-500 to-violet-600',
    stats: { plans: '4', avgRev: '$67.89', churn: '4.2%' },
    category: 'finance'
  },
  {
    id: 'grants',
    title: 'Grants',
    description: 'Applications and funding pipeline',
    icon: FileText,
    href: '/dashboard/grants',
    color: 'from-cyan-500 to-cyan-600',
    stats: { applied: '8', awarded: '2', pipeline: '$600K' },
    category: 'finance'
  },
  {
    id: 'health',
    title: 'System Health',
    description: 'Infrastructure monitoring',
    icon: Heart,
    href: '/dashboard/health',
    color: 'from-rose-500 to-rose-600',
    stats: { status: 'Healthy', errors: '0', latency: '45ms' },
    category: 'monitoring'
  },
];

const categories = [
  { id: 'all', label: 'All' },
  { id: 'monitoring', label: 'Monitoring' },
  { id: 'finance', label: 'Finance' },
  { id: 'content', label: 'Content' },
  { id: 'users', label: 'Users' },
  { id: 'ai', label: 'AI' },
];

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCards = dashboardCards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <UniversalCreditsBar isAdmin={true} credits={0} />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header - Compact on mobile */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">
            Admin Dashboard
          </h1>
          <p className="text-sm md:text-lg text-gray-600">
            Business operations management
          </p>
        </div>

        {/* Search - Full width, 48px height */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl
                         text-base placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                         min-h-[48px] transition-all"
              style={{ fontSize: '16px' }} // Prevent iOS zoom
            />
          </div>
        </div>

        {/* Category Filter - Horizontal scroll on mobile */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                  min-h-[40px] transition-all touch-manipulation
                  ${selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Cards Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredCards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="group touch-manipulation"
            >
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg 
                              active:scale-[0.98] transition-all duration-200 
                              overflow-hidden border border-gray-100 h-full">
                {/* Color bar */}
                <div className={`h-1.5 md:h-2 bg-gradient-to-r ${card.color}`} />
                
                <div className="p-4 md:p-6">
                  {/* Icon and Title Row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 md:p-3 rounded-lg bg-gradient-to-r ${card.color} 
                                    flex-shrink-0 shadow-lg`}>
                      <card.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 
                                     group-hover:text-blue-600 transition-colors truncate">
                        {card.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 truncate">
                        {card.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 
                                             group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                  
                  {/* Stats Row - Compact on mobile */}
                  <div className="flex gap-3 md:gap-4 pt-3 border-t border-gray-100">
                    {Object.entries(card.stats).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase tracking-wide truncate">
                          {key}
                        </p>
                        <p className="text-sm md:text-base font-semibold text-gray-900 truncate">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No results message */}
        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No modules match your search</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium 
                         min-h-[44px] px-4 touch-manipulation"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      
      {/* Safe area padding for iOS */}
      <div className="pb-safe" />
    </div>
  )
}
