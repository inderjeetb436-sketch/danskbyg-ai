import { useEffect, useState } from 'react';
import { Plus, Users, Mail, MoreHorizontal, X, Shield, User, Wrench } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { TeamMember, Profile } from '../lib/database.types';

const ROLE_CONFIG = {
  admin: { label: 'Administrator', color: 'bg-red-100 text-red-700', icon: Shield },
  manager: { label: 'Projektleder', color: 'bg-blue-100 text-blue-700', icon: User },
  member: { label: 'Teammedlem', color: 'bg-gray-100 text-gray-600', icon: Users },
  worker: { label: 'Håndværker', color: 'bg-orange-100 text-orange-700', icon: Wrench },
};

interface MemberWithProfile extends TeamMember {
  profile?: Profile | null;
}

export default function TeamPage() {
  const { company, profile: currentProfile } = useAuth();
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const load = async () => {
    if (!company) return;
    const { data: tm } = await supabase
      .from('team_members')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: true });

    if (!tm) { setLoading(false); return; }

    const userIds = tm.filter(m => m.user_id).map(m => m.user_id as string);
    let profiles: Profile[] = [];
    if (userIds.length > 0) {
      const { data } = await supabase.from('profiles').select('*').in('id', userIds);
      profiles = data || [];
    }

    setMembers(tm.map(m => ({
      ...m,
      profile: profiles.find(p => p.id === m.user_id) || null,
    })));
    setLoading(false);
  };

  useEffect(() => { load(); }, [company]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    await supabase.from('team_members').insert({
      company_id: company.id,
      invited_email: inviteEmail,
      role: inviteRole,
      status: 'invited',
    });
    await load();
    setShowModal(false);
    setInviteEmail('');
    setInviteRole('member');
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Fjern teammedlem?')) return;
    await supabase.from('team_members').delete().eq('id', id);
    await load();
    setMenuOpen(null);
  };

  const handleRoleChange = async (id: string, role: string) => {
    await supabase.from('team_members').update({ role }).eq('id', id);
    await load();
    setMenuOpen(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Team</h1>
          <p className="text-gray-500 text-sm mt-0.5">{members.length} teammedlemmer</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> Inviter medlem
        </button>
      </div>

      {/* Team stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {Object.entries(ROLE_CONFIG).map(([role, config]) => {
          const count = members.filter(m => m.role === role).length;
          const Icon = config.icon;
          return (
            <div key={role} className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${config.color} mb-2`}>
                <Icon size={16} />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">{count}</div>
              <div className="text-xs text-gray-500">{config.label}</div>
            </div>
          );
        })}
      </div>

      {/* Members list */}
      {members.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Users size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-500 font-medium mb-2">Ingen teammedlemmer endnu</h3>
          <p className="text-gray-400 text-sm mb-4">Inviter dit team til at komme i gang</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600"
          >
            Inviter første medlem
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span className="col-span-5">Navn / E-mail</span>
            <span className="col-span-3">Rolle</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2 text-right">Handlinger</span>
          </div>
          <div className="divide-y divide-gray-50">
            {members.map(member => {
              const roleConfig = ROLE_CONFIG[member.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.member;
              const displayName = member.profile?.full_name || member.invited_email || 'Ukendt';
              const email = member.profile ? `${member.invited_email}` : member.invited_email;
              const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              const isCurrentUser = member.user_id === currentProfile?.id;

              return (
                <div key={member.id} className="grid sm:grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="sm:col-span-5 flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-700 text-xs font-bold">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        {displayName}
                        {isCurrentUser && <span className="text-xs text-gray-400">(dig)</span>}
                      </div>
                      {email && <div className="text-xs text-gray-400 truncate">{email}</div>}
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleConfig.color}`}>
                      {roleConfig.label}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      member.status === 'active' ? 'bg-green-100 text-green-700' :
                      member.status === 'invited' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {member.status === 'active' ? 'Aktiv' : member.status === 'invited' ? 'Inviteret' : member.status}
                    </span>
                  </div>
                  <div className="sm:col-span-2 flex justify-end relative">
                    {!isCurrentUser && (
                      <>
                        <button
                          onClick={() => setMenuOpen(menuOpen === member.id ? null : member.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {menuOpen === member.id && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-10 w-44 py-1">
                            {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                              <button key={role} onClick={() => handleRoleChange(member.id, role)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                <config.icon size={13} /> Sæt som {config.label}
                              </button>
                            ))}
                            <div className="border-t border-gray-100 mt-1 pt-1">
                              <button onClick={() => handleDelete(member.id)} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                Fjern fra team
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Inviter teammedlem</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail *</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="kollega@virksomhed.dk" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rolle</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                    <option key={role} value={role}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700">
                  Der vil blive sendt en invitation til den angivne e-mailadresse. Personen skal oprette en konto for at acceptere.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50">
                  Annuller
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-lg text-sm">
                  {saving ? 'Sender...' : 'Send invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
