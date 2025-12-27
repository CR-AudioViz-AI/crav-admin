'use client';

import { useState } from 'react';
import { Wand2, Code, Rocket, FileCode, Database, Layout, Loader2, CheckCircle, Sparkles } from 'lucide-react';

interface BuildStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'complete' | 'error';
}

const APP_TEMPLATES = [
  { id: 'saas', label: 'SaaS App', icon: '🚀', desc: 'Full-stack SaaS with auth, payments, dashboard' },
  { id: 'marketplace', label: 'Marketplace', icon: '🛒', desc: 'Buy/sell platform with listings and transactions' },
  { id: 'ai-tool', label: 'AI Tool', icon: '🤖', desc: 'AI-powered tool with credit system' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊', desc: 'Analytics and data visualization' },
  { id: 'cms', label: 'Content Platform', icon: '📝', desc: 'Blog, docs, or content management' },
  { id: 'custom', label: 'Custom', icon: '✨', desc: 'Describe your app in natural language' },
];

export default function AppBuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [appName, setAppName] = useState('');
  const [building, setBuilding] = useState(false);
  const [steps, setSteps] = useState<BuildStep[]>([]);
  const [result, setResult] = useState<{ repoUrl?: string; deployUrl?: string } | null>(null);

  async function startBuild() {
    if (!appName || (!prompt && !selectedTemplate)) return;
    
    setBuilding(true);
    setResult(null);
    
    const buildSteps: BuildStep[] = [
      { id: 'analyze', label: 'Analyzing requirements...', status: 'pending' },
      { id: 'scaffold', label: 'Scaffolding project structure...', status: 'pending' },
      { id: 'components', label: 'Generating components...', status: 'pending' },
      { id: 'api', label: 'Creating API routes...', status: 'pending' },
      { id: 'database', label: 'Setting up database...', status: 'pending' },
      { id: 'github', label: 'Pushing to GitHub...', status: 'pending' },
      { id: 'deploy', label: 'Deploying to Vercel...', status: 'pending' },
    ];
    
    setSteps(buildSteps);

    try {
      const res = await fetch('/api/admin/app-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName,
          template: selectedTemplate,
          prompt,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSteps(buildSteps.map(s => ({ ...s, status: 'complete' })));
        setResult({ repoUrl: data.repoUrl, deployUrl: data.deployUrl });
      } else {
        setSteps(buildSteps.map((s, i) => ({ 
          ...s, 
          status: i < 3 ? 'complete' : 'error' 
        })));
      }
    } catch (err) {
      console.error('Build failed:', err);
    } finally {
      setBuilding(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300">Powered by Javari AI</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">App Builder</h1>
          <p className="text-gray-400 text-lg">Describe your app and Javari will build it for you</p>
        </div>

        {/* App Name */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-400 mb-2">App Name</label>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="my-awesome-app"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
          />
        </div>

        {/* Templates */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-400 mb-4">Choose a Template (Optional)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {APP_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                className={`p-4 rounded-xl text-left transition-all ${
                  selectedTemplate === template.id
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg scale-105'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <span className="text-2xl">{template.icon}</span>
                <div className="font-medium mt-2">{template.label}</div>
                <div className="text-xs text-gray-400 mt-1">{template.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-400 mb-2">Describe Your App</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Create a trading card marketplace where users can list, buy, and sell cards. Include user profiles, messaging, and a rating system..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        {/* Build Button */}
        <button
          onClick={startBuild}
          disabled={building || !appName}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium text-lg flex items-center justify-center gap-3 hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {building ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Building...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Build App with Javari
            </>
          )}
        </button>

        {/* Build Progress */}
        {steps.length > 0 && (
          <div className="mt-8 bg-gray-800 rounded-xl p-6">
            <h3 className="font-medium mb-4">Build Progress</h3>
            <div className="space-y-3">
              {steps.map(step => (
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
                  <span className={step.status === 'complete' ? 'text-green-400' : 'text-gray-400'}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="font-medium text-lg">App Created Successfully!</h3>
            </div>
            <div className="space-y-3">
              {result.repoUrl && (
                <a href={result.repoUrl} target="_blank" className="flex items-center gap-2 text-blue-400 hover:underline">
                  <Code className="w-4 h-4" /> {result.repoUrl}
                </a>
              )}
              {result.deployUrl && (
                <a href={result.deployUrl} target="_blank" className="flex items-center gap-2 text-green-400 hover:underline">
                  <Rocket className="w-4 h-4" /> {result.deployUrl}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
