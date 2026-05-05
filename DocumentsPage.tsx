import { useEffect, useState } from 'react';
import { FileText, Upload, Search, Trash2, Download, FolderOpen, File, Image, FileSpreadsheet, type LucideIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Document, Project } from '../lib/database.types';

interface DocWithProject extends Document {
  project_name?: string;
}

const FILE_ICONS: Record<string, LucideIcon> = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  xls: FileSpreadsheet,
  jpg: Image,
  jpeg: Image,
  png: Image,
  default: File,
};

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return FILE_ICONS[ext] || FILE_ICONS.default;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MOCK_DOCS = [
  { name: 'Byggetilladelse_Nordhavn.pdf', file_type: 'pdf', size: 245780, project_name: 'Nordhavn Kontor' },
  { name: 'Strukturel_tegning_v2.pdf', file_type: 'pdf', size: 1823400, project_name: 'Nordhavn Kontor' },
  { name: 'Budget_Q2_2026.xlsx', file_type: 'xlsx', size: 82340, project_name: 'Tagombygning Vesterbro' },
  { name: 'Foto_aflevering_01.jpg', file_type: 'jpg', size: 3421000, project_name: 'Badeværelse Frederiksberg' },
  { name: 'Kontrakt_kundeunderskrevet.pdf', file_type: 'pdf', size: 456200, project_name: 'Tagombygning Vesterbro' },
];

export default function DocumentsPage() {
  const { company, profile } = useAuth();
  const [documents, setDocuments] = useState<DocWithProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!company) return;
    const [d, p] = await Promise.all([
      supabase.from('documents').select('*').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('projects').select('id,name').eq('company_id', company.id),
    ]);

    const docs = ((d.data || []) as Document[]).map(doc => ({
      ...doc,
      project_name: ((p.data || []) as Project[]).find(pr => pr.id === doc.project_id)?.name,
    }));
    setDocuments(docs);
    setProjects((p.data || []) as Project[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [company]);

  const filtered = documents.filter(doc => {
    const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchProject = projectFilter === 'all' || doc.project_id === projectFilter;
    return matchSearch && matchProject;
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !company || !profile) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      await supabase.from('documents').insert({
        company_id: company.id,
        name: file.name,
        file_type: file.name.split('.').pop() || '',
        file_url: '',
        size: file.size,
        uploaded_by: profile.id,
        project_id: projectFilter !== 'all' ? projectFilter : null,
      });
    }

    await load();
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Slet dokument?')) return;
    await supabase.from('documents').delete().eq('id', id);
    await load();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dokumenter</h1>
          <p className="text-gray-500 text-sm mt-0.5">{documents.length} dokumenter gemt</p>
        </div>
        <label className={`flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
          <Upload size={16} />
          {uploading ? 'Uploader...' : 'Upload fil'}
          <input type="file" multiple className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Søg dokumenter..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
          <option value="all">Alle projekter</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 && documents.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-500 font-medium mb-2">Ingen dokumenter endnu</h3>
          <p className="text-gray-400 text-sm mb-4">Upload tegninger, kontrakter og andre dokumenter</p>
          <label className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 cursor-pointer inline-block">
            Upload dit første dokument
            <input type="file" multiple className="hidden" onChange={handleUpload} />
          </label>
        </div>
      ) : (
        <>
          {/* Demo documents when empty */}
          {filtered.length === 0 && documents.length === 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
              Eksempel på dokumenter du kan uploade
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span className="col-span-5">Navn</span>
              <span className="col-span-3">Projekt</span>
              <span className="col-span-2">Størrelse</span>
              <span className="col-span-2 text-right">Handlinger</span>
            </div>
            <div className="divide-y divide-gray-50">
              {(filtered.length > 0 ? filtered : MOCK_DOCS.map((d, i) => ({
                ...d, id: `mock-${i}`, company_id: '', uploaded_by: null, project_id: null, file_url: '', created_at: new Date().toISOString()
              }))).map((doc) => {
                const Icon = getFileIcon(doc.name);
                const isMock = doc.id?.startsWith('mock-');
                return (
                  <div key={doc.id} className={`grid sm:grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors ${isMock ? 'opacity-50' : ''}`}>
                    <div className="sm:col-span-5 flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                        <div className="text-xs text-gray-400">{doc.file_type?.toUpperCase() || 'Fil'}</div>
                      </div>
                    </div>
                    <div className="sm:col-span-3 text-sm text-gray-500 truncate">
                      {(doc as { project_name?: string }).project_name || '—'}
                    </div>
                    <div className="sm:col-span-2 text-sm text-gray-500">{formatSize(doc.size || 0)}</div>
                    <div className="sm:col-span-2 flex items-center justify-end gap-2">
                      {!isMock && doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Download size={15} />
                        </a>
                      )}
                      {!isMock && (
                        <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
