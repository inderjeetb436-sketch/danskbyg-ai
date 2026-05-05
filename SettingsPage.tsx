import { useEffect, useState } from 'react';
import { Save, Building2, User, Shield, Bell, type LucideIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'profile' | 'company' | 'security' | 'notifications';

export default function SettingsPage() {
  const { profile, company, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profileForm, setProfileForm] = useState({
    full_name: '', job_title: '', phone: '',
  });
  const [companyForm, setCompanyForm] = useState({
    name: '', cvr_number: '', address: '', city: '', zip: '', phone: '', email: '',
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({ full_name: profile.full_name || '', job_title: profile.job_title || '', phone: profile.phone || '' });
    }
    if (company) {
      setCompanyForm({
        name: company.name || '', cvr_number: company.cvr_number || '',
        address: company.address || '', city: company.city || '',
        zip: company.zip || '', phone: company.phone || '', email: company.email || '',
      });
    }
  }, [profile, company]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    await supabase.from('profiles').update(profileForm).eq('id', profile.id);
    await refreshProfile();
    setSaving(false);
    showSaved();
  };

  const saveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    await supabase.from('companies').update(companyForm).eq('id', company.id);
    await refreshProfile();
    setSaving(false);
    showSaved();
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'company', label: 'Virksomhed', icon: Building2 },
    { id: 'security', label: 'Sikkerhed', icon: Shield },
    { id: 'notifications', label: 'Notifikationer', icon: Bell },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Indstillinger</h1>
        <p className="text-gray-500 text-sm mt-0.5">Administrer din konto og virksomhedsprofil</p>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2">
          <Save size={14} /> Gemt!
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Tabs */}
        <div className="sm:w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === id ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-6">
          {activeTab === 'profile' && (
            <form onSubmit={saveProfile} className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Personlig profil</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fulde navn</label>
                <input value={profileForm.full_name} onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Lars Andersen" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Stilling</label>
                <input value={profileForm.job_title} onChange={e => setProfileForm(f => ({ ...f, job_title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Tømrermester" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
                <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="+45 12 34 56 78" />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm">
                  <Save size={15} /> {saving ? 'Gemmer...' : 'Gem ændringer'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'company' && (
            <form onSubmit={saveCompany} className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Virksomhedsprofil</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Virksomhedsnavn</label>
                  <input value={companyForm.name} onChange={e => setCompanyForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">CVR-nummer</label>
                  <input value={companyForm.cvr_number} onChange={e => setCompanyForm(f => ({ ...f, cvr_number: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                  <input type="email" value={companyForm.email} onChange={e => setCompanyForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
                  <input value={companyForm.address} onChange={e => setCompanyForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">By</label>
                  <input value={companyForm.city} onChange={e => setCompanyForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Postnummer</label>
                  <input value={companyForm.zip} onChange={e => setCompanyForm(f => ({ ...f, zip: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
                  <input value={companyForm.phone} onChange={e => setCompanyForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm">
                  <Save size={15} /> {saving ? 'Gemmer...' : 'Gem ændringer'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Sikkerhed</h2>
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-700 font-medium">Din konto er sikret</p>
                <p className="text-xs text-green-600 mt-1">Senest logget ind: {new Date().toLocaleDateString('da-DK')}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Skift adgangskode</h3>
                <div className="space-y-3">
                  <input type="password" placeholder="Nuværende adgangskode"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  <input type="password" placeholder="Ny adgangskode"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  <input type="password" placeholder="Bekræft ny adgangskode"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  <button className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm">
                    Opdater adgangskode
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Notifikationer</h2>
              {[
                { label: 'Projekt deadlines', sub: 'Få besked 3 dage før en deadline', enabled: true },
                { label: 'Nye opgaver', sub: 'Når der oprettes opgaver til dig', enabled: true },
                { label: 'Budget overskridelse', sub: 'Når et projekt nærmer sig budget', enabled: true },
                { label: 'Teamaktivitet', sub: 'Nyt fra dine teammedlemmer', enabled: false },
                { label: 'Ugentlig rapport', sub: 'Sammendrag af dine projekter hver mandag', enabled: true },
              ].map(({ label, sub, enabled }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{label}</div>
                    <div className="text-xs text-gray-400">{sub}</div>
                  </div>
                  <button className={`w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-orange-500' : 'bg-gray-200'} relative`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
              <button className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm">
                <Save size={15} /> Gem præferencer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
