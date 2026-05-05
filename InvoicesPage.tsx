import { useEffect, useState } from 'react';
import { Plus, Receipt, Search, X, ChevronDown, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Invoice, Project } from '../lib/database.types';

const STATUS_CONFIG = {
  draft: { label: 'Kladde', color: 'bg-gray-100 text-gray-600' },
  sent: { label: 'Sendt', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Betalt', color: 'bg-green-100 text-green-700' },
  overdue: { label: 'Overskredet', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Annulleret', color: 'bg-gray-100 text-gray-400' },
};

interface InvoiceFormData {
  number: string; client_name: string; amount: string;
  vat_amount: string; status: string; due_date: string;
  issued_date: string; project_id: string; notes: string;
}

const emptyForm: InvoiceFormData = {
  number: '', client_name: '', amount: '', vat_amount: '',
  status: 'draft', due_date: '', issued_date: new Date().toISOString().slice(0, 10),
  project_id: '', notes: ''
};

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 900) + 100;
  return `INV-${year}-${seq}`;
}

export default function InvoicesPage() {
  const { company } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<InvoiceFormData>({ ...emptyForm, number: generateInvoiceNumber() });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    if (!company) return;
    const [inv, proj] = await Promise.all([
      supabase.from('invoices').select('*').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('projects').select('id,name').eq('company_id', company.id),
    ]);
    setInvoices((inv.data as Invoice[]) || []);
    setProjects((proj.data as Project[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [company]);

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.client_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount + i.vat_amount, 0);
  const totalPending = invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.amount + i.vat_amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount + i.vat_amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    const payload = {
      company_id: company.id,
      number: form.number,
      client_name: form.client_name,
      amount: parseFloat(form.amount) || 0,
      vat_amount: parseFloat(form.vat_amount) || 0,
      status: form.status,
      due_date: form.due_date || null,
      issued_date: form.issued_date,
      project_id: form.project_id || null,
      notes: form.notes,
    };
    if (editId) {
      await supabase.from('invoices').update(payload).eq('id', editId);
    } else {
      await supabase.from('invoices').insert(payload);
    }
    await load();
    setShowModal(false);
    setForm({ ...emptyForm, number: generateInvoiceNumber() });
    setEditId(null);
    setSaving(false);
  };

  const openEdit = (inv: Invoice) => {
    setEditId(inv.id);
    setForm({
      number: inv.number, client_name: inv.client_name,
      amount: inv.amount.toString(), vat_amount: inv.vat_amount.toString(),
      status: inv.status, due_date: inv.due_date || '',
      issued_date: inv.issued_date, project_id: inv.project_id || '', notes: inv.notes,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Slet faktura?')) return;
    await supabase.from('invoices').delete().eq('id', id);
    await load();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Fakturaer</h1>
          <p className="text-gray-500 text-sm mt-0.5">{invoices.length} fakturaer i alt</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setEditId(null); setForm({ ...emptyForm, number: generateInvoiceNumber() }); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> Ny faktura
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Betalt</div>
          <div className="text-2xl font-extrabold text-green-700">{(totalPaid / 1000).toFixed(1)}K kr.</div>
          <div className="text-xs text-green-500 mt-0.5">{invoices.filter(i => i.status === 'paid').length} fakturaer</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Afventer</div>
          <div className="text-2xl font-extrabold text-blue-700">{(totalPending / 1000).toFixed(1)}K kr.</div>
          <div className="text-xs text-blue-500 mt-0.5">{invoices.filter(i => i.status === 'sent').length} fakturaer</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Forsinket</div>
          <div className="text-2xl font-extrabold text-red-700">{(totalOverdue / 1000).toFixed(1)}K kr.</div>
          <div className="text-xs text-red-500 mt-0.5">{invoices.filter(i => i.status === 'overdue').length} fakturaer</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Søg fakturaer..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white">
            <option value="all">Alle</option>
            {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Receipt size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-500 font-medium mb-2">Ingen fakturaer</h3>
          <button onClick={() => setShowModal(true)} className="mt-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600">
            Opret faktura
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span className="col-span-2">Nummer</span>
            <span className="col-span-3">Kunde</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Beløb (ink. moms)</span>
            <span className="col-span-2">Forfald</span>
            <span className="col-span-1 text-right">...</span>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map(inv => {
              const status = STATUS_CONFIG[inv.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
              const total = inv.amount + inv.vat_amount;
              return (
                <div key={inv.id} className="grid sm:grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="sm:col-span-2 font-mono text-sm font-semibold text-gray-900">{inv.number}</div>
                  <div className="sm:col-span-3 text-sm text-gray-700">{inv.client_name || '—'}</div>
                  <div className="sm:col-span-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>{status.label}</span>
                  </div>
                  <div className="sm:col-span-2 text-sm font-semibold text-gray-900">{total.toLocaleString('da-DK')} kr.</div>
                  <div className="sm:col-span-2 text-sm text-gray-500">
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString('da-DK') : '—'}
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-end gap-1.5">
                    <button onClick={() => openEdit(inv)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download size={14} />
                    </button>
                    <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Rediger faktura' : 'Ny faktura'}</h2>
              <button onClick={() => { setShowModal(false); setEditId(null); }} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fakturanr. *</label>
                  <input required value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kundenavn</label>
                <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Kundens navn" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Projekt</label>
                <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">Intet projekt</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Beløb ekskl. moms (kr.)</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value, vat_amount: (parseFloat(e.target.value) * 0.25).toFixed(2) }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Moms 25% (kr.)</label>
                  <input type="number" value={form.vat_amount} onChange={e => setForm(f => ({ ...f, vat_amount: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                    placeholder="0" readOnly />
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                <span className="text-gray-500">Total inkl. moms: </span>
                <span className="font-bold text-gray-900">
                  {((parseFloat(form.amount) || 0) + (parseFloat(form.vat_amount) || 0)).toLocaleString('da-DK')} kr.
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Udstedelsesdato</label>
                  <input type="date" value={form.issued_date} onChange={e => setForm(f => ({ ...f, issued_date: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Forfaldsdato</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Noter</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Betalingsbetingelser, noter osv." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditId(null); }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50">
                  Annuller
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-lg text-sm">
                  {saving ? 'Gemmer...' : editId ? 'Gem' : 'Opret faktura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
