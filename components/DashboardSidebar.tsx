'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  AppWindow,
  Users,
  Rocket,
  Wand2,
  Bot,
  Github,
  Users2,
  DollarSign,
  Flag,
  FileText,
  Settings,
  Brain,
  Book,
  Lightbulb,
  FolderKanban,
  Mail,
  Shield,
  Bell,
  Key,
  Database,
  Scale,
  Puzzle,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Apps', href: '/dashboard/apps', icon: AppWindow },
      { name: 'Users', href: '/dashboard/users', icon: Users },
      { name: 'Revenue', href: '/dashboard/revenue', icon: DollarSign, badge: '$54.8K ARR' },
    ],
  },
  {
    title: 'Development',
    items: [
      { name: 'Deployments', href: '/dashboard/deployments', icon: Rocket },
      { name: 'App Builder', href: '/dashboard/app-builder', icon: Wand2, badge: 'AI' },
      { name: 'Bot Factory', href: '/dashboard/bot-factory', icon: Bot },
      { name: 'Repositories', href: '/dashboard/repositories', icon: Github },
      { name: 'Feature Flags', href: '/dashboard/feature-flags', icon: Flag },
    ],
  },
  {
    title: 'AI & Knowledge',
    items: [
      { name: 'Knowledge Base', href: '/dashboard/knowledge-base', icon: Brain },
      { name: 'Documentation', href: '/dashboard/docs', icon: Book },
    ],
  },
  {
    title: 'Business',
    items: [
      { name: 'Affiliates', href: '/dashboard/affiliates', icon: Users2 },
      { name: 'Campaigns', href: '/dashboard/campaigns', icon: Mail },
      { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    ],
  },
  {
    title: 'Community',
    items: [
      { name: 'Ideas', href: '/dashboard/ideas', icon: Lightbulb },
      { name: 'Moderation', href: '/dashboard/moderation', icon: Shield },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'API Gateway', href: '/dashboard/api-gateway', icon: Key },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { name: 'Integrations', href: '/dashboard/integrations', icon: Puzzle },
      { name: 'Backups', href: '/dashboard/backups', icon: Database },
      { name: 'Audit Logs', href: '/dashboard/logs', icon: FileText },
      { name: 'Legal', href: '/dashboard/legal', icon: Scale },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(navigation.map(g => g.title));
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CR</span>
          </div>
          {!collapsed && <span className="font-bold text-lg">Admin</span>}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-800 rounded hidden lg:block"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navigation.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-400"
              >
                {group.title}
                {expandedGroups.includes(group.title) ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
            {(collapsed || expandedGroups.includes(group.title)) && (
              <div className="mt-1 space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-purple-600/20 text-purple-400 border-l-2 border-purple-500'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.name}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-500">
            <div>CR AudioViz AI Admin</div>
            <div>v1.0.0 • © 2025</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-800 rounded"
            >
              <X className="w-5 h-5" />
            </button>
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-gray-900 border-r border-gray-800 transition-all ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
}
