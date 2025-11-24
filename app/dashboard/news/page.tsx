'use client'

import { Newspaper, TrendingUp, Users, Bell } from 'lucide-react'

export default function NewsPage() {
  const articles = [
    { id: 1, title: 'New AI Features Launched', date: '2025-11-23', views: 1234, category: 'Product' },
    { id: 2, title: 'Market Oracle Reaches 10K Users', date: '2025-11-20', views: 2345, category: 'Milestone' },
    { id: 3, title: 'Q4 Revenue Up 45%', date: '2025-11-18', views: 876, category: 'Business' },
    { id: 4, title: 'Partnership with Major VA Hospital', date: '2025-11-15', views: 1567, category: 'Partnership' }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">News Management</h1>
          <p className="text-slate-400">Manage company news and announcements</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Publish News</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <Newspaper className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Articles</p>
              <p className="text-white text-2xl font-bold">{articles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Views</p>
              <p className="text-white text-2xl font-bold">{articles.reduce((s,a) => s + a.views, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/10 p-3 rounded-lg">
              <Bell className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">This Month</p>
              <p className="text-white text-2xl font-bold">{articles.filter(a => new Date(a.date).getMonth() === new Date().getMonth()).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {articles.map((article) => (
          <div key={article.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">{article.title}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>{new Date(article.date).toLocaleDateString()}</span>
                  <span className="bg-slate-700 px-2 py-1 rounded">{article.category}</span>
                  <span>{article.views.toLocaleString()} views</span>
                </div>
              </div>
              <button className="text-blue-500 hover:text-blue-400">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
