import { useEffect, useState } from 'react';
import {
  Plus, FolderOpen, Search, Filter, MoreHorizontal,
  Calendar, DollarSign, User, X, ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Project } from '../lib/database.types';

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-700 border-blue-200',
  active: 'bg-green-100 text-green-700 border-green-200',
  on_hold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planlægning',
  active: 'Aktiv',
  on_hold: 'Pauseret',
  completed: 'Afsluttet',
};

interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  budget: string;
  start_date: string;
  end_date: string;
  address: string;
  client_name: string;
  client_email: string;
  client_phone: string;
}

const emptyForm: ProjectFormData = {
  name: '', description: '', status: 'planning', budget: '',
  start_date: '', end_date: '', address: '', client_name: '', client_email: '', client_phone: ''
};

export default function ProjectsPage() {
  const { company } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ProjectFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const load = async () => {
    if (!company) return;
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [company]);

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    const payload = {
      company_id: company.id,
      name: form.name,
      description: form.description,
      status: form.status,
      budget: parseFloat(form.budget) || 0,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      address: form.address,
      client_name: form.client_name,
      client_email: form.client_email,
      client_phone: form.client_phone,
    };

    if (selectedProject) {
      await supabase.from('projects').update(payload).eq('id', selectedProject.id);
    } else {
      await supabase.from('projects').insert(payload);
    }
    await load();
    setShowModal(false);
    setForm(emptyForm);
    setSelectedProject(null);
    setSaving(false);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setForm({
      name: project.name,
      description: project.description,
      status: project.status,
      budget: project.budget.toString(),
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      address: project.address,
      client_name: project.client_name,
      client_email: project.client_email,
      client_phone: project.client_phone,
    });
    setShowModal(true);
    setMenuOpen(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette projekt?')) return;
    await supabase.from('projects').delete().eq('id', id);
    await load();
    setMenuOpen(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Projekter</h1>
          <p className="text-gray-500 text-sm mt-0.5">{projects.length} projekter i alt</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setSelectedProject(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> Nyt projekt
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søg projekter..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
          >
            <option value="all">Alle statusser</option>
            <option value="planning">Planlægning</option>
            <option value="active">Aktiv</option>
            <option value="on_hold">Pauseret</option>
            <option value="completed">Afsluttet</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Projects grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-500 font-medium mb-2">Ingen projekter fundet</h3>
          <p className="text-gray-400 text-sm mb-4">Opret dit første projekt for at komme i gang</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600"
          >
            Opret projekt
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(project => {
            const budgetPct = project.budget > 0 ? Math.min(100, Math.round((project.spent / project.budget) * 100)) : 0;
            return (
              <div key={project.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{project.name}</h3>
                    {project.address && <p className="text-xs text-gray-400 mt-0.5 truncate">{project.address}</p>}
                  </div>
                  <div className="relative flex-shrink-0 ml-2">
                    <button
                      onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                      className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {menuOpen === project.id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-10 w-36 py-1">
                        <button onClick={() => handleEdit(project)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Rediger</button>
                        <button onClick={() => handleDelete(project.id)} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Slet</button>
                      </div>
                    )}
                  </div>
                </div>

                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[project.status]}`}>
                  {STATUS_LABELS[project.status] || project.status}
                </span>

                {project.description && (
                  <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">{project.description}</p>
                )}

                <div className="mt-4 space-y-2">
                  {project.client_name && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <User size={12} /> {project.client_name}
                    </div>
                  )}
                  {(project.start_date || project.end_date) && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={12} />
                      {project.start_date && new Date(project.start_date).toLocaleDateString('da-DK')}
                      {project.start_date && project.end_date && ' — '}
                      {project.end_date && new Date(project.end_date).toLocaleDateString('da-DK')}
                    </div>
                  )}
                  {project.budget > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <DollarSign size={12} /> {project.budget.toLocaleString('da-DK')} kr.
                    </div>
                  )}
                </div>

                {project.budget > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Budget brugt</span>
                      <span className={budgetPct >= 90 ? 'text-red-500 font-semibold' : ''}>{budgetPct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${budgetPct >= 90 ? 'bg-red-500' : budgetPct >= 70 ? 'bg-orange-500' : 'bg-green-500'}`}
                        style={{ width: `${budgetPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {project.progress > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Fremskridt</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{selectedProject ? 'Rediger projekt' : 'Nyt projekt'}</h2>
              <button onClick={() => { setShowModal(false); setSelectedProject(null); }} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Projektnavn *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="f.eks. Tagombyggelse Vesterbro" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Beskrivelse</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Beskriv projektet..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="planning">Planlægning</option>
                    <option value="active">Aktiv</option>
                    <option value="on_hold">Pauseret</option>
                    <option value="completed">Afsluttet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget (kr.)</label>
                  <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Startdato</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Slutdato</label>
                  <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Projekadresse" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kundenavn</label>
                  <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Kundens navn" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kunde tlf.</label>
                  <input value={form.client_phone} onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="12 34 56 78" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setSelectedProject(null); }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50">
                  Annuller
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-lg text-sm">
                  {saving ? 'Gemmer...' : selectedProject ? 'Gem ændringer' : 'Opret projekt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
