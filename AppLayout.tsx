import { useState, ReactNode } from 'react';
import {
  HardHat, LayoutDashboard, FolderOpen, CheckSquare, FileText,
  Users, Bot, Receipt, Settings, LogOut, ChevronLeft, ChevronRight,
  Bell, Search, Menu, X, Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projekter', icon: FolderOpen },
  { id: 'tasks', label: 'Opgaver', icon: CheckSquare },
  { id: 'documents', label: 'Dokumenter', icon: FileText },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'ai', label: 'AI Assistent', icon: Bot },
  { id: 'invoices', label: 'Fakturaer', icon: Receipt },
];

export default function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  const { profile, company, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-40 h-full bg-slate-900 text-white flex flex-col transition-all duration-300
        ${collapsed ? 'w-16' : 'w-60'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-slate-800 px-4 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <HardHat size={16} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-base font-bold">DanskByg<span className="text-orange-400">AI</span></span>
          )}
        </div>

        {/* Company name */}
        {!collapsed && company && (
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-slate-400" />
              <span className="text-xs text-slate-400 truncate">{company.name}</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { onNavigate(id); setMobileOpen(false); }}
              title={collapsed ? label : undefined}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all
                ${currentPage === id
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && label}
            </button>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-slate-800 pb-4">
          <button
            onClick={() => onNavigate('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <Settings size={18} />
            {!collapsed && 'Indstillinger'}
          </button>
          <button
            onClick={signOut}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} />
            {!collapsed && 'Log ud'}
          </button>

          {/* Profile */}
          {!collapsed && (
            <div className="mx-3 mt-3 p-3 bg-slate-800 rounded-xl flex items-center gap-2.5">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{profile?.full_name || 'Bruger'}</div>
                <div className="text-xs text-slate-400 capitalize">{profile?.role || 'member'}</div>
              </div>
            </div>
          )}

          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center py-2 text-slate-500 hover:text-white transition-colors mt-2"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-800"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="relative max-w-xs hidden sm:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Søg projekter, opgaver..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
