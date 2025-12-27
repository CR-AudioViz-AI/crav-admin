'use client';

import { useState, useEffect } from 'react';
import { Flag, Users, Crown, Beaker, Gift, Shield, Search, Plus, Save } from 'lucide-react';

interface UserFlag {
  id: string;
  user_id: string;
  email: string;
  name: string;
  flags: string[];
  created_at: string;
}

const FLAG_TYPES = [
  { id: 'free_tester', label: 'Free Tester', icon: Beaker, color: 'bg-purple-500' },
  { id: 'vip', label: 'VIP', icon: Crown, color: 'bg-yellow-500' },
  { id: 'beta', label: 'Beta User', icon: Flag, color: 'bg-blue-500' },
  { id: 'lifetime', label: 'Lifetime', icon: Gift, color: 'bg-green-500' },
  { id: 'admin', label: 'Admin', icon: Shield, color: 'bg-red-500' },
  { id: 'partner', label: 'Partner', icon: Users, color: 'bg-indigo-500' },
];

export default function AccountFlagsPage() {
  const [users, setUsers] = useState<UserFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserFlag | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/account-flags');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateFlags(userId: string, flags: string[]) {
    try {
      await fetch('/api/admin/account-flags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, flags }),
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update flags:', err);
    }
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const flagCounts = FLAG_TYPES.map(flag => ({
    ...flag,
    count: users.filter(u => u.flags?.includes(flag.id)).length
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Account Flags</h1>
            <p className="text-gray-400 mt-1">Manage user access tiers and special flags</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Add Flag Type
          </button>
        </div>

        {/* Flag Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {flagCounts.map(flag => (
            <div key={flag.id} className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${flag.color}`}>
                  <flag.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{flag.count}</div>
                  <div className="text-xs text-gray-400">{flag.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">User</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Flags</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{user.name || 'No name'}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {FLAG_TYPES.map(flag => {
                          const hasFlag = user.flags?.includes(flag.id);
                          return (
                            <button
                              key={flag.id}
                              onClick={() => {
                                const newFlags = hasFlag
                                  ? user.flags.filter(f => f !== flag.id)
                                  : [...(user.flags || []), flag.id];
                                updateFlags(user.user_id, newFlags);
                              }}
                              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                hasFlag ? flag.color + ' text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                              }`}
                            >
                              {flag.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-gray-600 rounded-lg">
                        <Save className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
