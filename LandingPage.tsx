import { useState } from 'react';
import {
  Building2, CheckCircle, ChevronRight, BarChart3, Users, FileText,
  Bot, Shield, Zap, Star, ArrowRight, HardHat, Hammer, Ruler
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <HardHat size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DanskByg<span className="text-orange-500">AI</span></span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Funktioner</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Priser</a>
              <a href="#about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Om os</a>
              <button
                onClick={() => onNavigate('login')}
                className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >Log ind</button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
              >Start gratis</button>
            </div>
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <div className="w-6 h-0.5 bg-gray-800 mb-1.5" />
              <div className="w-6 h-0.5 bg-gray-800 mb-1.5" />
              <div className="w-6 h-0.5 bg-gray-800" />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            <a href="#features" className="block text-gray-600">Funktioner</a>
            <a href="#pricing" className="block text-gray-600">Priser</a>
            <button onClick={() => onNavigate('login')} className="block text-gray-700 font-medium">Log ind</button>
            <button onClick={() => onNavigate('register')} className="block w-full py-2 bg-orange-500 text-white rounded-lg font-semibold">Start gratis</button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-sm font-medium mb-6">
                <Zap size={14} />
                Bygget til danske håndværkere
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Styr hele din<br />
                <span className="text-orange-400">byggevirksomhed</span><br />
                med AI
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0">
                DanskBygAI samler projekter, dokumenter, teamets opgaver og AI-assistenten i ét dansk system. Spar tid, undgå fejl og voks din forretning.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => onNavigate('register')}
                  className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-orange-500/25"
                >
                  Start gratis i dag <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-6 py-3.5 border border-white/20 hover:border-white/40 text-white font-medium rounded-xl transition-colors"
                >
                  Se demo
                </button>
              </div>
              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400" /> Ingen kreditkort</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400" /> Dansk support</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400" /> GDPR-sikker</span>
              </div>
            </div>
            <div className="flex-1 w-full max-w-lg">
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-slate-400 text-xs">DanskBygAI Dashboard</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Aktive projekter', value: '12', icon: Building2, color: 'text-blue-400 bg-blue-400/10' },
                    { label: 'Åbne opgaver', value: '47', icon: CheckCircle, color: 'text-green-400 bg-green-400/10' },
                    { label: 'Teammedlemmer', value: '8', icon: Users, color: 'text-purple-400 bg-purple-400/10' },
                    { label: 'Dokumenter', value: '134', icon: FileText, color: 'text-orange-400 bg-orange-400/10' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-slate-700/50 rounded-xl p-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} mb-2`}>
                        <Icon size={16} />
                      </div>
                      <div className="text-xl font-bold text-white">{value}</div>
                      <div className="text-xs text-slate-400">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <Bot size={12} className="text-white" />
                    </div>
                    <span className="text-xs text-slate-300 font-medium">AI Assistent</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    "Projekt Nordhavn er 68% afsluttet. Budget forbrug er 2,3M kr. af 3,5M kr. Deadline er om 23 dage..."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 mb-6">Brugt af 500+ danske byggevirksomheder</p>
          <div className="flex flex-wrap justify-center gap-8 text-gray-400 font-semibold text-sm">
            {['Andersen Byg A/S', 'Nørrebro Renovering', 'VSM Entreprenør', 'KB Tømrer', 'Sjællands El', 'Nordbyg ApS'].map(c => (
              <span key={c} className="flex items-center gap-1.5">
                <HardHat size={14} className="text-orange-400" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Alt du behøver for at drive din virksomhed</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Fra tilbud til aflevering — DanskBygAI håndterer hele byggeprocessen med intelligente AI-værktøjer.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Building2, color: 'bg-blue-50 text-blue-600', title: 'Projektstyring',
                desc: 'Hold styr på alle projekter, budgetter og deadlines. Se status i realtid og undgå forsinkelser.'
              },
              {
                icon: Bot, color: 'bg-orange-50 text-orange-600', title: 'AI Assistent',
                desc: 'Spørg AI\'en om alt fra byggelovgivning til budgetanalyse. Spar timer på administrativt arbejde.'
              },
              {
                icon: Users, color: 'bg-green-50 text-green-600', title: 'Teamstyring',
                desc: 'Tildel opgaver, se hvem der arbejder på hvad, og sørg for at alle ved hvad de skal.'
              },
              {
                icon: FileText, color: 'bg-slate-50 text-slate-600', title: 'Dokumenthåndtering',
                desc: 'Gem tegninger, kontrakter og rapporter sikkert i skyen. Altid tilgængeligt fra telefon eller PC.'
              },
              {
                icon: BarChart3, color: 'bg-yellow-50 text-yellow-600', title: 'Økonomi & Fakturering',
                desc: 'Udsted fakturaer, track betalinger og hold øje med budgettet på alle projekter samtidig.'
              },
              {
                icon: Shield, color: 'bg-red-50 text-red-600', title: 'GDPR & Sikkerhed',
                desc: 'Alle data gemmes sikkert i Danmark. GDPR-kompatibel og krypteret end-to-end.'
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-3">Hvad siger vores kunder?</h2>
            <p className="text-slate-400">Rigtige anmeldelser fra danske håndværksmestre</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Lars Andersen', role: 'Indehaver, Andersen Byg A/S',
                text: 'DanskBygAI har sparet os 8 timer om ugen på administration. AI\'en er virkelig god til at svare på spørgsmål om byggelov og kontrakter.'
              },
              {
                name: 'Mette Christensen', role: 'Daglig leder, VSM Entreprenør',
                text: 'Endelig et system der er lavet til os håndværkere og ikke til it-folk. Nem at lære, og vores folk bruger det faktisk.'
              },
              {
                name: 'Thomas Nielsen', role: 'Tømrermester, KB Tømrer',
                text: 'Vi kan nu følge alle vores projekter live. Budgetoversigten er guld værd, og fakturering tager 5 minutter nu.'
              },
            ].map(({ name, role, text }) => (
              <div key={name} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f97316" className="text-orange-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{text}"</p>
                <div>
                  <div className="font-semibold text-white">{name}</div>
                  <div className="text-slate-400 text-xs">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Gennemsigtige priser</h2>
            <p className="text-gray-500">Vælg den plan der passer til din virksomhed. Ingen skjulte gebyrer.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter', price: '299', period: '/md', popular: false,
                features: ['Op til 3 projekter', '2 brugere', '5 GB lagerplads', 'AI Assistent (20 spørgsmål/dag)', 'E-mail support'],
              },
              {
                name: 'Professionel', price: '699', period: '/md', popular: true,
                features: ['Ubegrænsede projekter', '10 brugere', '50 GB lagerplads', 'Ubegrænset AI Assistent', 'Fakturering', 'Prioritet support', 'API adgang'],
              },
              {
                name: 'Enterprise', price: '1.499', period: '/md', popular: false,
                features: ['Alt i Professionel', 'Ubegrænsede brugere', '500 GB lagerplads', 'Tilpasset AI træning', 'SLA garanti', 'Dedikeret support', 'On-premise mulighed'],
              },
            ].map(({ name, price, period, popular, features }) => (
              <div key={name} className={`rounded-2xl p-6 border-2 relative ${popular ? 'border-orange-500 shadow-lg shadow-orange-100' : 'border-gray-200'}`}>
                {popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                    MEST POPULÆR
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-gray-900">{price} kr.</span>
                  <span className="text-gray-500 text-sm pb-0.5">{period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onNavigate('register')}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${popular ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                >
                  Kom i gang
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <Hammer size={40} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Klar til at modernisere din byggevirksomhed?</h2>
          <p className="text-orange-100 mb-8 text-lg">Start gratis i dag. Ingen kreditkort krævet. Opsæt på 5 minutter.</p>
          <button
            onClick={() => onNavigate('register')}
            className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors inline-flex items-center gap-2 text-lg"
          >
            Start gratis nu <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                  <HardHat size={14} className="text-white" />
                </div>
                <span className="text-white font-bold">DanskBygAI</span>
              </div>
              <p className="text-sm leading-relaxed">Bygget i Danmark, til danske byggevirksomheder.</p>
            </div>
            {[
              { title: 'Produkt', links: ['Funktioner', 'Priser', 'Changelog', 'Roadmap'] },
              { title: 'Support', links: ['Hjælpecenter', 'Kontakt os', 'Status', 'API Docs'] },
              { title: 'Virksomhed', links: ['Om os', 'Blog', 'Karriere', 'Privatliv'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-white font-semibold mb-3 text-sm">{title}</h4>
                <ul className="space-y-2">
                  {links.map(l => <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs">© 2026 DanskBygAI ApS. CVR: 12345678. Alle rettigheder forbeholdes.</p>
            <div className="flex items-center gap-2">
              <Ruler size={14} className="text-orange-400" />
              <span className="text-xs">Made in Denmark</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
