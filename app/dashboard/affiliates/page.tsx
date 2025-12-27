'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Link2, Copy, Check, ExternalLink, BarChart3 } from 'lucide-react';

interface AffiliateProgram {
  id: string;
  name: string;
  platform: string;
  commission: string;
  status: 'active' | 'pending' | 'blocked';
  affiliateId?: string;
  affiliateLink?: string;
  earnings: number;
  clicks: number;
  conversions: number;
}

const PROGRAMS: AffiliateProgram[] = [
  { id: '1', name: 'Viator', platform: 'Direct', commission: '8%', status: 'active', affiliateId: 'P00280339', earnings: 245.50, clicks: 1250, conversions: 12 },
  { id: '2', name: 'GetYourGuide', platform: 'Direct', commission: '8%', status: 'active', affiliateId: 'VZYKZYE', earnings: 189.00, clicks: 890, conversions: 8 },
  { id: '3', name: 'ElevenLabs', platform: 'PartnerStack', commission: '22%', status: 'active', affiliateLink: 'https://try.elevenlabs.io/z24t231p5l5f', earnings: 567.80, clicks: 2100, conversions: 23 },
  { id: '4', name: 'Klook', platform: 'Direct', commission: '3-5%', status: 'active', affiliateId: '106921', earnings: 78.25, clicks: 450, conversions: 5 },
  { id: '5', name: 'Discover Cars', platform: 'Direct', commission: '3% lifetime', status: 'active', affiliateId: 'royhenders', earnings: 156.00, clicks: 680, conversions: 6 },
  { id: '6', name: 'Squaremouth', platform: 'Direct', commission: 'Referral fee', status: 'active', affiliateId: '23859', earnings: 89.00, clicks: 320, conversions: 3 },
  { id: '7', name: 'Writesonic', platform: 'PartnerStack', commission: '30% lifetime', status: 'pending', earnings: 0, clicks: 0, conversions: 0 },
  { id: '8', name: 'CJ Affiliate', platform: 'Network', commission: 'Varies', status: 'blocked', earnings: 0, clicks: 0, conversions: 0 },
];

export default function AffiliatesPage() {
  const [programs, setPrograms] = useState<AffiliateProgram[]>(PROGRAMS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalEarnings = programs.reduce((sum, p) => sum + p.earnings, 0);
  const totalClicks = programs.reduce((sum, p) => sum + p.clicks, 0);
  const totalConversions = programs.reduce((sum, p) => sum + p.conversions, 0);
  const activePrograms = programs.filter(p => p.status === 'active').length;

  async function copyToClipboard(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-400" />
              Affiliate Programs
            </h1>
            <p className="text-gray-400 mt-1">{activePrograms} active programs • Track earnings and performance</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-400">${totalEarnings.toFixed(2)}</div>
            <div className="text-gray-400 text-sm">Total Earnings</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold">{totalClicks.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Total Clicks</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-blue-400">{totalConversions}</div>
            <div className="text-gray-400 text-sm">Conversions</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-3xl font-bold text-purple-400">{((totalConversions / totalClicks) * 100 || 0).toFixed(1)}%</div>
            <div className="text-gray-400 text-sm">Conversion Rate</div>
          </div>
        </div>

        {/* Programs Table */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Program</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Commission</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Clicks</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Conv.</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Earnings</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(program => (
                <tr key={program.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{program.name}</div>
                      <div className="text-sm text-gray-400">{program.platform}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-green-400 font-medium">{program.commission}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      program.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      program.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {program.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">{program.clicks.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">{program.conversions}</td>
                  <td className="px-6 py-4 text-right font-medium text-green-400">${program.earnings.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {program.affiliateId && (
                        <button
                          onClick={() => copyToClipboard(program.affiliateId!, program.id)}
                          className="p-2 hover:bg-gray-600 rounded-lg"
                          title="Copy ID"
                        >
                          {copiedId === program.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                      {program.affiliateLink && (
                        <a href={program.affiliateLink} target="_blank" className="p-2 hover:bg-gray-600 rounded-lg">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
