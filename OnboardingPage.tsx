import { useState } from 'react';
import { HardHat, Building2, CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [cvrNumber, setCvrNumber] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { data: company } = await supabase
      .from('companies')
      .insert({ name: companyName, cvr_number: cvrNumber || null })
      .select()
      .single();

    if (company) {
      await supabase
        .from('profiles')
        .update({ company_id: company.id, role: 'admin' })
        .eq('id', user.id);
    }

    await refreshProfile();
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HardHat size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">Velkommen til DanskBygAI!</h1>
          <p className="text-slate-400 text-sm">Lad os sætte din virksomhed op — det tager kun 1 minut.</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Building2 size={20} className="text-orange-500" />
            <h2 className="font-bold text-gray-900">Opret din virksomhed</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Virksomhedsnavn *</label>
              <input
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Andersen Byg A/S"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CVR-nummer <span className="text-gray-400 font-normal">(valgfrit)</span></label>
              <input
                value={cvrNumber}
                onChange={e => setCvrNumber(e.target.value)}
                placeholder="12345678"
                maxLength={8}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="bg-orange-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-orange-800">Du får adgang til:</p>
              {['Projektstyring', 'AI Assistent', 'Teamadministration', 'Fakturering', 'Dokumenthåndtering'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-orange-700">
                  <CheckCircle size={13} className="text-green-500" /> {f}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={saving || !companyName}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {saving ? 'Opretter...' : <><span>Kom i gang</span><ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
