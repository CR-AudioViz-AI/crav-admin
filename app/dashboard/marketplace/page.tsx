'use client'

import { Store, TrendingUp, DollarSign, Package, Star } from 'lucide-react'

export default function MarketplacePage() {
  const products = [
    { id: 1, name: 'Premium Templates Pack', price: 49, sales: 234, rating: 4.8, category: 'Templates' },
    { id: 2, name: 'Logo Design Bundle', price: 79, sales: 189, rating: 4.9, category: 'Design' },
    { id: 3, name: 'Legal Document Suite', price: 99, sales: 156, rating: 4.7, category: 'Legal' },
    { id: 4, name: 'Marketing Automation Tools', price: 129, sales: 123, rating: 4.6, category: 'Marketing' }
  ]

  const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.sales), 0)
  const totalSales = products.reduce((sum, p) => sum + p.sales, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
          <p className="text-slate-400">Manage marketplace products and sales</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Add Product</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-white text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Sales</p>
              <p className="text-white text-2xl font-bold">{totalSales}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/10 p-3 rounded-lg">
              <Store className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Active Products</p>
              <p className="text-white text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold mb-1">{product.name}</h3>
                <span className="bg-slate-700 px-2 py-1 rounded text-slate-300 text-sm">{product.category}</span>
              </div>
              <p className="text-green-500 text-xl font-bold">${product.price}</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating}</span>
              </div>
              <p className="text-slate-400">{product.sales} sales</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
