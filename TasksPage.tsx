import { useEffect, useState } from 'react';
import { Plus, Search, X, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Task, Project } from '../lib/database.types';

const STATUS_OPTS = [
  { value: 'todo', label: 'At gøre', color: 'bg-gray-100 text-gray-700' },
  { value: 'in_progress', label: 'I gang', color: 'bg-blue-100 text-blue-700' },
  { value: 'review', label: 'Review', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'done', label: 'Færdig', color: 'bg-green-100 text-green-700' },
];

const PRIORITY_OPTS = [
  { value: 'low', label: 'Lav', color: 'bg-gray-100 text-gray-600' },
  { value: 'medium', label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'Høj', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Haster', color: 'bg-red-100 text-red-700' },
];

interface TaskFormData {
  title: string; description: string; status: string;
  priority: string; project_id: string; due_date: string;
}

const emptyForm: TaskFormData = { title: '', description: '', status: 'todo', priority: 'medium', project_id: '', due_date: '' };

export default function TasksPage() {
  const { company } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TaskFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    if (!company) return;
    const [t, p] = await Promise.all([
      supabase.from('tasks').select('*').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('projects').select('id,name').eq('company_id', company.id),
    ]);
    setTasks((t.data as Task[]) || []);
    setProjects((p.data as Project[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [company]);

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const grouped = STATUS_OPTS.reduce((acc, s) => {
    acc[s.value] = filtered.filter(t => t.status === s.value);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    const payload = {
      company_id: company.id,
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      project_id: form.project_id || projects[0]?.id || '',
      due_date: form.due_date || null,
    };
    if (editId) {
      await supabase.from('tasks').update(payload).eq('id', editId);
    } else {
      await supabase.from('tasks').insert(payload);
    }
    await load();
    setShowModal(false);
    setForm(emptyForm);
    setEditId(null);
    setSaving(false);
  };

  const toggleStatus = async (task: Task) => {
    const next = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'review' : 'done';
    await supabase.from('tasks').update({ status: next }).eq('id', task.id);
    await load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    await load();
  };

  const openEdit = (task: Task) => {
    setEditId(task.id);
    setForm({
      title: task.title, description: task.description, status: task.status,
      priority: task.priority, project_id: task.project_id, due_date: task.due_date || ''
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Opgaver</h1>
          <p className="text-gray-500 text-sm mt-0.5">{tasks.filter(t => t.status !== 'done').length} åbne opgaver</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> Ny opgave
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Søg opgaver..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white">
            <option value="all">Alle</option>
            {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATUS_OPTS.map(status => (
          <div key={status.value} className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${status.color}`}>{status.label}</span>
              <span className="text-xs text-gray-400 font-medium ml-auto">{grouped[status.value]?.length || 0}</span>
            </div>
            <div className="space-y-2.5">
              {grouped[status.value]?.map(task => {
                const priority = PRIORITY_OPTS.find(p => p.value === task.priority);
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
                return (
                  <div key={task.id} className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-gray-800 leading-snug">{task.title}</p>
                      <button onClick={() => handleDelete(task.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0 mt-0.5">
                        <X size={13} />
                      </button>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-400 leading-relaxed mb-2 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {priority && (
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${priority.color}`}>{priority.label}</span>
                      )}
                      {task.due_date && (
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                          {new Date(task.due_date).toLocaleDateString('da-DK')}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => openEdit(task)} className="text-xs text-gray-400 hover:text-gray-700">Rediger</button>
                      <button onClick={() => toggleStatus(task)} className="text-xs text-orange-500 hover:text-orange-600 font-medium ml-auto">
                        {task.status === 'done' ? 'Genåbn' : 'Frem'}
                      </button>
                    </div>
                  </div>
                );
              })}
              {grouped[status.value]?.length === 0 && (
                <div className="text-center py-6 text-xs text-gray-400">Ingen opgaver</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Rediger opgave' : 'Ny opgave'}</h2>
              <button onClick={() => { setShowModal(false); setEditId(null); }} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Titel *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Hvad skal gøres?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Beskrivelse</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Flere detaljer..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Prioritet</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    {PRIORITY_OPTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Projekt</label>
                  <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Intet projekt</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditId(null); }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50">
                  Annuller
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-lg text-sm">
                  {saving ? 'Gemmer...' : editId ? 'Gem' : 'Opret'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
