'use client'

import { useState } from 'react'
import {
  FileText, DollarSign, Calendar, Clock, CheckCircle, AlertCircle,
  ExternalLink, Plus, Search, Filter, TrendingUp, Target, Building,
  Users, RefreshCw, Eye, Edit2, Trash2, Download, Upload, Star,
  AlertTriangle, ArrowUpRight, ChevronRight, Award, Briefcase
} from 'lucide-react'

interface Grant {
  id: string
  name: string
  funder: string
  funderType: 'federal' | 'state' | 'foundation' | 'corporate'
  category: string
  amount: { min: number; max: number }
  deadline: string
  status: 'researching' | 'preparing' | 'submitted' | 'under_review' | 'awarded' | 'rejected' | 'not_started'
  priority: 'critical' | 'high' | 'medium' | 'low'
  url: string
  notes: string
  requirements: string[]
  matchScore: number
  submittedDate?: string
  awardedAmount?: number
}

interface GrantCategory {
  name: string
  icon: string
  totalAvailable: string
  grants: number
}

const GRANT_CATEGORIES: GrantCategory[] = [
  { name: 'Technology & AI', icon: '🤖', totalAvailable: '$4B+', grants: 15 },
  { name: 'First Responders', icon: '🚒', totalAvailable: '$400M+', grants: 8 },
  { name: 'Veterans', icon: '🎖️', totalAvailable: '$150M+', grants: 6 },
  { name: 'Military Families', icon: '👨‍👩‍👧', totalAvailable: '$200M+', grants: 5 },
  { name: 'Faith-Based', icon: '⛪', totalAvailable: '$100M+', grants: 4 },
  { name: 'Animal Rescue', icon: '🐕', totalAvailable: '$75M+', grants: 3 },
  { name: 'Education', icon: '📚', totalAvailable: '$25M+', grants: 4 },
  { name: 'Small Business', icon: '💼', totalAvailable: '$50M+', grants: 5 },
]

const GRANTS: Grant[] = [
  // CRITICAL - December Deadlines
  { id: '1', name: 'Skip $10K Grant', funder: 'Skip Money', funderType: 'corporate', category: 'Small Business', amount: { min: 10000, max: 10000 }, deadline: '2025-12-31', status: 'preparing', priority: 'critical', url: 'https://www.skip.money', notes: 'Simple application, cash grant', requirements: ['Business registration', 'Brief pitch'], matchScore: 95 },
  { id: '2', name: 'Amber Grant', funder: 'WomensNet', funderType: 'foundation', category: 'Women-Owned', amount: { min: 10000, max: 25000 }, deadline: '2025-12-31', status: 'not_started', priority: 'critical', url: 'https://ambergrantsforwomen.com', notes: 'Perfect for Cindy as co-founder', requirements: ['Women-owned business', 'Business plan'], matchScore: 90 },
  
  // HIGH - Rolling/Q1
  { id: '3', name: 'Google for Startups Cloud Credits', funder: 'Google', funderType: 'corporate', category: 'Technology & AI', amount: { min: 100000, max: 200000 }, deadline: 'Rolling', status: 'researching', priority: 'high', url: 'https://startup.google.com', notes: '$100K-$200K in cloud credits', requirements: ['Tech startup', 'Growth stage'], matchScore: 88 },
  { id: '4', name: 'Microsoft for Startups', funder: 'Microsoft', funderType: 'corporate', category: 'Technology & AI', amount: { min: 150000, max: 150000 }, deadline: 'Rolling', status: 'not_started', priority: 'high', url: 'https://www.microsoft.com/startups', notes: 'Azure credits + technical support', requirements: ['B2B focus', 'AI/Cloud'], matchScore: 92 },
  { id: '5', name: 'AWS Activate', funder: 'Amazon', funderType: 'corporate', category: 'Technology & AI', amount: { min: 25000, max: 100000 }, deadline: 'Rolling', status: 'not_started', priority: 'high', url: 'https://aws.amazon.com/activate', notes: 'Cloud credits + support', requirements: ['Startup stage'], matchScore: 90 },
  { id: '6', name: 'Hello Alice Small Business Grant', funder: 'Hello Alice', funderType: 'foundation', category: 'Small Business', amount: { min: 5000, max: 25000 }, deadline: 'Rolling', status: 'researching', priority: 'high', url: 'https://helloalice.com', notes: 'Gateway to multiple programs', requirements: ['Account creation', 'Business profile'], matchScore: 85 },
  
  // MEDIUM - Federal
  { id: '7', name: 'NSF SBIR Phase I', funder: 'National Science Foundation', funderType: 'federal', category: 'Technology & AI', amount: { min: 275000, max: 275000 }, deadline: '2025-03-15', status: 'researching', priority: 'medium', url: 'https://www.nsf.gov/sbir', notes: 'AI/ML innovation focus', requirements: ['SAM.gov', 'Technical proposal', 'Budget narrative'], matchScore: 75 },
  { id: '8', name: 'NIH SBIR - Digital Health', funder: 'National Institutes of Health', funderType: 'federal', category: 'Technology & AI', amount: { min: 275000, max: 275000 }, deadline: '2025-04-05', status: 'not_started', priority: 'medium', url: 'https://grants.nih.gov', notes: 'Mental health tech focus', requirements: ['SAM.gov', 'Research plan'], matchScore: 70 },
  { id: '9', name: 'FEMA SAFER Grant', funder: 'FEMA', funderType: 'federal', category: 'First Responders', amount: { min: 50000, max: 2000000 }, deadline: '2025-02-28', status: 'not_started', priority: 'medium', url: 'https://www.fema.gov/grants/preparedness/safer', notes: 'First responder mental health', requirements: ['SAM.gov', 'Partner with dept'], matchScore: 65 },
  { id: '10', name: 'DOJ COPS Mental Health', funder: 'Dept of Justice', funderType: 'federal', category: 'First Responders', amount: { min: 100000, max: 1000000 }, deadline: '2025-05-15', status: 'not_started', priority: 'medium', url: 'https://cops.usdoj.gov', notes: 'Law enforcement wellness', requirements: ['SAM.gov', 'Agency partnership'], matchScore: 60 },
  
  // State & Foundation
  { id: '11', name: 'Florida SBDC Support', funder: 'Florida SBDC', funderType: 'state', category: 'Small Business', amount: { min: 0, max: 50000 }, deadline: 'Rolling', status: 'not_started', priority: 'high', url: 'https://floridasbdc.org', notes: 'Free consulting + grant navigation', requirements: ['FL business'], matchScore: 95 },
  { id: '12', name: 'Bob Woodruff Foundation', funder: 'Bob Woodruff Foundation', funderType: 'foundation', category: 'Veterans', amount: { min: 25000, max: 250000 }, deadline: 'Rolling', status: 'not_started', priority: 'medium', url: 'https://bobwoodrufffoundation.org', notes: 'Veteran services innovation', requirements: ['Veteran focus', 'Impact metrics'], matchScore: 72 },
]

const PIPELINE_STATS = {
  totalTracking: GRANTS.length,
  totalPotential: '$600M+',
  submitted: GRANTS.filter(g => g.status === 'submitted' || g.status === 'under_review').length,
  awarded: GRANTS.filter(g => g.status === 'awarded').length,
  awardedAmount: 0,
  successRate: 0,
}

export default function GrantsManagementHub() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'calendar' | 'categories' | 'requirements'>('pipeline')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null)

  const filteredGrants = GRANTS
    .filter(g => statusFilter === 'all' || g.status === statusFilter)
    .filter(g => priorityFilter === 'all' || g.priority === priorityFilter)
    .filter(g => !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.funder.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'awarded': return 'bg-green-500/20 text-green-400'
      case 'submitted': return 'bg-blue-500/20 text-blue-400'
      case 'under_review': return 'bg-purple-500/20 text-purple-400'
      case 'preparing': return 'bg-yellow-500/20 text-yellow-400'
      case 'researching': return 'bg-cyan-500/20 text-cyan-400'
      case 'rejected': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getFunderIcon = (type: string) => {
    switch (type) {
      case 'federal': return '🏛️'
      case 'state': return '🏢'
      case 'foundation': return '🏦'
      case 'corporate': return '🏬'
      default: return '📋'
    }
  }

  const criticalDeadlines = GRANTS.filter(g => g.priority === 'critical' && g.status !== 'awarded' && g.status !== 'rejected')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Grants Management Hub</h1>
              <p className="text-emerald-200">Track, apply, and win funding for CR AudioViz AI</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg font-medium">
              <Plus className="w-4 h-4" /> Add Grant
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{PIPELINE_STATS.totalTracking}</p>
            <p className="text-xs text-emerald-200">Grants Tracking</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{PIPELINE_STATS.totalPotential}</p>
            <p className="text-xs text-emerald-200">Total Pool</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{PIPELINE_STATS.submitted}</p>
            <p className="text-xs text-emerald-200">Submitted</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{PIPELINE_STATS.awarded}</p>
            <p className="text-xs text-emerald-200">Awarded</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">${PIPELINE_STATS.awardedAmount.toLocaleString()}</p>
            <p className="text-xs text-emerald-200">Won</p>
          </div>
        </div>
      </div>

      {/* Critical Deadlines Alert */}
      {criticalDeadlines.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-red-400">Critical Deadlines ({criticalDeadlines.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {criticalDeadlines.map(grant => (
              <div key={grant.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                <div>
                  <p className="font-medium">{grant.name}</p>
                  <p className="text-sm text-gray-400">{grant.funder} • ${grant.amount.max.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-medium">{grant.deadline}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(grant.status)}`}>{grant.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'pipeline', label: 'Pipeline', icon: FileText },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'categories', label: 'Categories', icon: Briefcase },
          { id: 'requirements', label: 'Requirements', icon: CheckCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search grants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="researching">Researching</option>
              <option value="preparing">Preparing</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="awarded">Awarded</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Grants List */}
          <div className="space-y-3">
            {filteredGrants.map(grant => (
              <div
                key={grant.id}
                className={`bg-gray-900 rounded-xl border p-4 hover:border-emerald-500/50 transition-all cursor-pointer ${getPriorityColor(grant.priority)}`}
                onClick={() => setSelectedGrant(grant)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getFunderIcon(grant.funderType)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{grant.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(grant.status)}`}>
                          {grant.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{grant.funder} • {grant.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">
                      ${grant.amount.min === grant.amount.max
                        ? grant.amount.max.toLocaleString()
                        : `${(grant.amount.min / 1000).toFixed(0)}K - ${(grant.amount.max / 1000).toFixed(0)}K`}
                    </p>
                    <p className="text-sm text-gray-400">Due: {grant.deadline}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" /> {grant.matchScore}% match
                    </span>
                    <span>{grant.requirements.length} requirements</span>
                  </div>
                  <a
                    href={grant.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm"
                  >
                    Apply <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GRANT_CATEGORIES.map(cat => (
            <div key={cat.name} className="bg-gray-900 rounded-xl border border-gray-700 p-4 hover:border-emerald-500/50 transition-all cursor-pointer">
              <span className="text-4xl block mb-3">{cat.icon}</span>
              <h3 className="font-semibold">{cat.name}</h3>
              <p className="text-2xl font-bold text-emerald-400">{cat.totalAvailable}</p>
              <p className="text-sm text-gray-400">{cat.grants} opportunities</p>
            </div>
          ))}
        </div>
      )}

      {/* Requirements Tab */}
      {activeTab === 'requirements' && (
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
          <h3 className="font-semibold mb-4">Pre-Application Requirements Checklist</h3>
          <div className="space-y-4">
            {[
              { item: 'SAM.gov Registration (UEI Number)', status: 'pending', note: 'Required for ALL federal grants - Takes 2-3 weeks', url: 'https://sam.gov' },
              { item: 'Grants.gov Account', status: 'pending', note: 'After SAM.gov is complete', url: 'https://grants.gov' },
              { item: 'Hello Alice Account', status: 'pending', note: 'Gateway to multiple programs', url: 'https://helloalice.com' },
              { item: 'Florida SBDC Registration', status: 'pending', note: 'Free consulting + grant navigation', url: 'https://floridasbdc.org' },
              { item: 'EIN (Employer ID Number)', status: 'complete', note: 'EIN: 93-4520864', url: '' },
              { item: 'Articles of Incorporation', status: 'complete', note: 'Florida S-Corp', url: '' },
              { item: 'Business Bank Account', status: 'complete', note: 'Required for receiving funds', url: '' },
            ].map((req, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {req.status === 'complete' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  )}
                  <div>
                    <p className="font-medium">{req.item}</p>
                    <p className="text-sm text-gray-400">{req.note}</p>
                  </div>
                </div>
                {req.url && (
                  <a
                    href={req.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm"
                  >
                    Go <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
          <h3 className="font-semibold mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {GRANTS
              .filter(g => g.deadline !== 'Rolling' && g.status !== 'awarded' && g.status !== 'rejected')
              .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
              .map(grant => (
                <div key={grant.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      grant.priority === 'critical' ? 'bg-red-500' :
                      grant.priority === 'high' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium">{grant.name}</p>
                      <p className="text-sm text-gray-400">{grant.funder}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{grant.deadline}</p>
                    <p className="text-sm text-emerald-400">${grant.amount.max.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            <div className="pt-4 border-t border-gray-700">
              <h4 className="font-medium text-gray-400 mb-3">Rolling Deadlines</h4>
              {GRANTS.filter(g => g.deadline === 'Rolling').map(grant => (
                <div key={grant.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg mb-2">
                  <div>
                    <p className="font-medium">{grant.name}</p>
                    <p className="text-sm text-gray-400">{grant.funder}</p>
                  </div>
                  <p className="text-emerald-400">${grant.amount.max.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
