'use client';

import { useState, useEffect } from 'react';
import { Wand2, Play, Check, Loader2, Code, Download, Rocket, Settings, AlertCircle, XCircle, CheckCircle } from 'lucide-react';

interface BuildStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  message?: string;
}

interface AppTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
}

const TEMPLATES: AppTemplate[] = [
  { id: 'saas', name: 'SaaS Platform', description: 'Full-stack SaaS with auth, billing, and dashboard', icon: '🚀', features: ['Auth (Clerk/NextAuth)', 'Stripe Billing', 'Dashboard', 'API Routes'] },
  { id: 'marketplace', name: 'Marketplace', description: 'Multi-vendor marketplace with listings and payments', icon: '🏪', features: ['Vendor Accounts', 'Product Listings', 'Reviews', 'Commission System'] },
  { id: 'ai-tool', name: 'AI Tool', description: 'AI-powered tool with credits and usage tracking', icon: '🤖', features: ['AI Integration', 'Credit System', 'Usage Analytics', 'Rate Limiting'] },
  { id: 'community', name: 'Community Platform', description: 'Social platform with posts, comments, and profiles', icon: '👥', features: ['User Profiles', 'Posts/Comments', 'Notifications', 'Moderation'] },
];

export default function AppBuilderPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<AppTemplate | null>(null);
  const [appName, setAppName] = useState('');
  const [description, setDescription] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [buildComplete, setBuildComplete] = useState(false);

  const startBuild = async () => {
    if (!selectedTemplate || !appName) return;
    
    setIsBuilding(true);
    setBuildComplete(false);
    setBuildSteps([
      { id: '1', name: 'Analyzing requirements', status: 'pending' },
      { id: '2', name: 'Generating project structure', status: 'pending' },
      { id: '3', name: 'Creating components', status: 'pending' },
      { id: '4', name: 'Setting up database schema', status: 'pending' },
      { id: '5', name: 'Configuring authentication', status: 'pending' },
      { id: '6', name: 'Adding API routes', status: 'pending' },
      { id: '7', name: 'Deploying to Vercel', status: 'pending' },
    ]);

    // Simulate build process
    for (let i = 0; i < 7; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setBuildSteps(prev => prev.map((step, idx) => ({
        ...step,
        status: idx < i ? 'complete' : idx === i ? 'running' : 'pending'
      })));
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    setBuildSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
    setBuildComplete(true);
    setIsBuilding(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-purple-400" />
            App Builder
          </h1>
          <p className="text-gray-400 mt-1">AI-powered app generation for the CRAIverse</p>
        </div>

        {!isBuilding && !buildComplete ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Template Selection */}
            <div>
              <h2 className="text-xl font-bold mb-4">1. Choose a Template</h2>
              <div className="grid gap-4">
                {TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'bg-purple-600/30 border-2 border-purple-500'
                        : 'bg-gray-800 border-2 border-transparent hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-400">{template.description}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {template.features.map((f, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-700/50 rounded text-xs">{f}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Configuration */}
            <div>
              <h2 className="text-xl font-bold mb-4">2. Configure Your App</h2>
              <div className="bg-gray-800 rounded-xl p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">App Name</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="my-awesome-app"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what your app does..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  onClick={startBuild}
                  disabled={!selectedTemplate || !appName}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                    selectedTemplate && appName
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-gray-700 cursor-not-allowed text-gray-500'
                  }`}
                >
                  <Rocket className="w-5 h-5" />
                  Start Building
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Build Progress */
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                {buildComplete ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    Build Complete!
                  </>
                ) : (
                  <>
                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                    Building {appName}...
                  </>
                )}
              </h2>
              
              <div className="space-y-4">
                {buildSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3">
                    {step.status === 'complete' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : step.status === 'running' ? (
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    ) : step.status === 'error' ? (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                    )}
                    <span className={step.status === 'complete' ? 'text-gray-300' : step.status === 'running' ? 'text-white' : 'text-gray-500'}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>

              {buildComplete && (
                <div className="mt-8 space-y-4">
                  <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <div className="font-medium text-green-400">🎉 Your app is ready!</div>
                    <div className="text-sm text-gray-400 mt-1">Deployed to: https://{appName}.vercel.app</div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 rounded-lg hover:bg-purple-700">
                      <Code className="w-4 h-4" />
                      View Code
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-700 rounded-lg hover:bg-gray-600">
                      <Rocket className="w-4 h-4" />
                      Open App
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setIsBuilding(false);
                      setBuildComplete(false);
                      setSelectedTemplate(null);
                      setAppName('');
                      setDescription('');
                    }}
                    className="w-full py-2 text-gray-400 hover:text-white"
                  >
                    Build Another App
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
