import { useState, FormEvent } from 'react';
import { HardHat, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export default function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cvrNumber, setCvrNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Adgangskoden skal være mindst 8 tegn.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleStep2 = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signUpError } = await signUp(email, password, fullName);
    if (signUpError) {
      setLoading(false);
      setError('Der opstod en fejl. E-mailen er muligvis allerede i brug.');
      return;
    }

    // Get the new user session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Create company
      const { data: company } = await supabase
        .from('companies')
        .insert({ name: companyName, cvr_number: cvrNumber || null })
        .select()
        .single();

      if (company) {
        // Link profile to company
        await supabase
          .from('profiles')
          .update({ company_id: company.id, role: 'admin' })
          .eq('id', session.user.id);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => step === 2 ? setStep(1) : onNavigate('landing')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft size={15} /> {step === 2 ? 'Tilbage' : 'Tilbage til forsiden'}
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <HardHat size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DanskByg<span className="text-orange-500">AI</span></span>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${s <= step ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {s < step ? <CheckCircle size={14} /> : s}
                </div>
                {s < 2 && <div className={`h-0.5 w-8 transition-colors ${s < step ? 'bg-orange-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
            <span className="ml-2 text-xs text-gray-500">Trin {step} af 2</span>
          </div>

          {step === 1 ? (
            <>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Opret din konto</h1>
              <p className="text-gray-500 text-sm mb-6">Udfyld dine personlige oplysninger.</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}

              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fulde navn</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    placeholder="Lars Andersen"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="lars@virksomhed.dk"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Adgangskode</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="Mindst 8 tegn"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-sm transition-colors"
                >
                  Fortsæt
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Din virksomhed</h1>
              <p className="text-gray-500 text-sm mb-6">Fortæl os om din byggevirksomhed.</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}

              <form onSubmit={handleStep2} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Virksomhedsnavn</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    required
                    placeholder="Andersen Byg A/S"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">CVR-nummer <span className="text-gray-400 font-normal">(valgfrit)</span></label>
                  <input
                    type="text"
                    value={cvrNumber}
                    onChange={e => setCvrNumber(e.target.value)}
                    placeholder="12345678"
                    maxLength={8}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-xs text-orange-700">
                    Ved at oprette en konto accepterer du vores vilkår og privatlivspolitik. Dine data opbevares sikkert i Danmark.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors"
                >
                  {loading ? 'Opretter konto...' : 'Opret konto gratis'}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Har du allerede en konto?{' '}
            <button onClick={() => onNavigate('login')} className="text-orange-500 hover:text-orange-600 font-semibold">
              Log ind
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
