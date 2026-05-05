import { useEffect, useState } from 'react';
import {
  BarChart3, TrendingUp, AlertCircle, CheckCircle2,
  FolderOpen, Users, FileText, ArrowRight, Clock, Building2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Project, Task } from '../lib/database.types';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  on_hold: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planlægning',
  active: 'Aktiv',
  on_hold: 'Pauseret',
  completed: 'Afsluttet',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { profile, company } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamCount, setTeamCount] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;
    const load = async () => {
      const [p, t, tm, d] = await Promise.all([
        supabase.from('projects').select('*').eq('company_id', company.id).order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').eq('company_id', company.id).neq('status', 'done').order('due_date', { ascending: true }).limit(5),
        supabase.from('team_members').select('id', { count: 'exact' }).eq('company_id', company.id),
        supabase.from('documents').select('id', { count: 'exact' }).eq('company_id', company.id),
      ]);
      setProjects(p.data || []);
      setTasks(t.data || []);
      setTeamCount(tm.count || 0);
      setDocCount(d.count || 0);
      setLoading(false);
    };
    load();
  }, [company]);

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date()).length;

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Godmorgen' : greetingHour < 17 ? 'Goddag' : 'Godaften';
  const firstName = profile?.full_name?.split(' ')[0] || 'der';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">{greeting}, {firstName}!</h1>
        <p className="text-gray-500 text-sm mt-1">Her er et overblik over {company?.name || 'din virksomhed'} i dag.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Aktive projekter', value: activeProjects, icon: FolderOpen,
            color: 'text-blue-600 bg-blue-50', sub: `${projects.length} total`, action: () => onNavigate('projects')
          },
          {
            label: 'Åbne opgaver', value: tasks.length, icon: CheckCircle2,
            color: 'text-green-600 bg-green-50', sub: `${overdueTasks} overskredet`, action: () => onNavigate('tasks')
          },
          {
            label: 'Teammedlemmer', value: teamCount, icon: Users,
            color: 'text-orange-600 bg-orange-50', sub: 'aktive brugere', action: () => onNavigate('team')
          },
          {
            label: 'Dokumenter', value: docCount, icon: FileText,
            color: 'text-slate-600 bg-slate-50', sub: 'gemte filer', action: () => onNavigate('documents')
          },
        ].map(({ label, value, icon: Icon, color, sub, action }) => (
          <button
            key={label}
            onClick={action}
            className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3`}>
              <Icon size={20} />
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{value}</div>
            <div className="text-sm text-gray-600 font-medium">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent projects */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Seneste projekter</h2>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1"
            >
              Se alle <ArrowRight size={12} />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-10">
              <Building2 size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Ingen projekter endnu</p>
              <button
                onClick={() => onNavigate('projects')}
                className="mt-3 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600"
              >
                Opret projekt
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map(project => {
                const pct = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0;
                return (
                  <div key={project.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FolderOpen size={18} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">{project.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABELS[project.status] || project.status}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Fremskridt</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-bold text-gray-900">{pct}%</div>
                      <div className="text-xs text-gray-400">budget</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Budget overview */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-orange-500" />
              <h2 className="font-bold text-gray-900">Budget overblik</h2>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Total budget</span>
                  <span className="font-semibold text-gray-900">{(totalBudget / 1000).toFixed(0)}K kr.</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-full bg-blue-400 rounded-full w-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Brugt</span>
                  <span className="font-semibold text-orange-600">{(totalSpent / 1000).toFixed(0)}K kr.</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: totalBudget > 0 ? `${Math.min(100, Math.round((totalSpent / totalBudget) * 100))}%` : '0%' }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tilgængeligt</span>
                  <span className="font-bold text-green-600">{((totalBudget - totalSpent) / 1000).toFixed(0)}K kr.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming tasks */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-orange-500" />
                <h2 className="font-bold text-gray-900">Kommende opgaver</h2>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-orange-500 hover:text-orange-600 font-semibold"
              >
                Se alle
              </button>
            </div>
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Ingen åbne opgaver</p>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 4).map(task => (
                  <div key={task.id} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`mt-0.5 text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${PRIORITY_COLORS[task.priority] || 'bg-gray-100 text-gray-600'}`}>
                      {task.priority === 'urgent' ? 'Haster' : task.priority === 'high' ? 'Høj' : task.priority === 'medium' ? 'Normal' : 'Lav'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-800 font-medium truncate">{task.title}</div>
                      {task.due_date && (
                        <div className={`text-xs mt-0.5 flex items-center gap-1 ${new Date(task.due_date) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
                          {new Date(task.due_date) < new Date() && <AlertCircle size={11} />}
                          {new Date(task.due_date).toLocaleDateString('da-DK')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick tip */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <TrendingUp size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-orange-900 mb-1">Tip fra AI Assistenten</h3>
                <p className="text-xs text-orange-700 leading-relaxed">
                  Prøv at spørge AI\'en: "Hvad er de typiske udgifter til en tagombyggelse?" for at få et hurtigt budgetestimat.
                </p>
                <button
                  onClick={() => onNavigate('ai')}
                  className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  Åbn AI Assistent <ArrowRight size={11} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
