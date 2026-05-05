import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Plus, Trash2, Sparkles, HardHat } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  company_id: string;
  user_id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

const SUGGESTIONS = [
  'Hvad er de typiske udgifter til tagombyggelse?',
  'Hvilke krav er der til stillads efter dansk lov?',
  'Hjælp mig med at lave et budget for et badeværelse',
  'Hvad skal jeg huske ved aflevering af et projekt?',
  'Hvilke forsikringer skal en håndværksvirksomhed have?',
  'Forklar BR18 brandkrav for mig',
];

function simulateAIResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('tag') || msg.includes('tagombyggelse')) {
    return `For en typisk tagombyggelse i Danmark kan du forvente følgende udgifter:\n\n**Materialer:**\n- Tagsten/tagpap: 200-400 kr./m²\n- Isolering (350mm): 150-250 kr./m²\n- Undertag og lægter: 80-120 kr./m²\n\n**Arbejdsomkostninger:**\n- Tømrer: 450-600 kr./time\n- Stillafs: 15-25 kr./m² per uge\n\n**Eksempel — 100 m² taget:**\n- Materialer: ca. 55.000 kr.\n- Arbejde (150 timer): ca. 75.000 kr.\n- Stillafs (3 uger): ca. 7.500 kr.\n- **Total: ca. 137.500 kr.** (ekskl. moms)\n\nHusk at tilføje 10-15% buffer til uforudsete udgifter. Ønsker du hjælp med at lave et detaljeret budget?`;
  }

  if (msg.includes('stillafs') || msg.includes('stilladskrav')) {
    return `**Stillafsregler i Danmark (Arbejdstilsynet):**\n\nDe vigtigste krav:\n\n1. **Stilladstegning** — kræves for stillafs over 6 meter\n2. **Stillafsinspektør** — autoriseret montage og demontage\n3. **Kantbræt** — mindst 15 cm højt ved alle åbne sider\n4. **Rækværk** — 1 meter højt ved arbejde over 2 meter\n5. **Daglig inspektion** — dokumenteret i stillafsbog\n\n**Ansvar:**\nBygherren og entreprenøren deler ansvaret for at stilladset er i forsvarlig stand.\n\n**Vigtig lov:** AT-vejledning A.2.3 om stillafs. Du kan finde den på at.dk.\n\nHar du et specifikt stillafsprojekt jeg kan hjælpe med?`;
  }

  if (msg.includes('budget') || msg.includes('badeværelse')) {
    return `**Budget for badeværelsesrenovering (standard 6-8 m²):**\n\n| Post | Pris ekskl. moms |\n|------|------------------|\n| Fliser (gulv + vægge) | 8.000-15.000 kr. |\n| Sanitetsartikler | 5.000-20.000 kr. |\n| VVS arbejde | 15.000-25.000 kr. |\n| El-arbejde | 5.000-10.000 kr. |\n| Tømrerarbejde | 8.000-15.000 kr. |\n| Fugt/vandtætning | 3.000-6.000 kr. |\n| **Total** | **44.000-91.000 kr.** |\n\n**Tips:**\n- Book VVS og el tidligt — de er svære at få fat i\n- Sæt 15% buffer af til uforudsete arbejder\n- Aftal fast pris hvis muligt\n\nVil du have mig til at generere et specifikt tilbud baseret på dine krav?`;
  }

  if (msg.includes('aflevering') || msg.includes('projekt')) {
    return `**Checkliste ved aflevering af byggeprojekt:**\n\n**Dokumentation:**\n- Byggetilladelse afsluttet\n- Ibrugtagningstilladelse (om nødvendigt)\n- Drift- og vedligeholdelsesmanual\n- Garantierklæringer fra leverandører\n- El-certifikat (autoriseret el-installatør)\n- VVS-dokumentation\n\n**Teknisk gennemgang:**\n- Gennemgang med bygherren\n- Mangelliste udfyldt og underskrevet\n- Nøgleaflevering dokumenteret\n- Foto-dokumentation af skjulte installationer\n\n**Økonomi:**\n- Slutopgørelse underskrevet\n- Sidste faktura udstedt\n- Tilbageholdelsebeløb aftalt (typisk 5%)\n\n**Lovpligtige:**\n- Energimærke (hvis krævet)\n- Byggesagsafslutning hos kommunen\n\nHar du brug for en specifik checkliste til dit projekt?`;
  }

  if (msg.includes('forsikring')) {
    return `**Nødvendige forsikringer for en håndværksvirksomhed:**\n\n1. **Erhvervsansvarsforsikring** — dækker skader du påfører 3. mand. *Anbefaling: min. 10 mio. kr.*\n\n2. **Arbejdsskadeforsikring** — lovpligtig! Dækker dine ansatte ved arbejdsskade\n\n3. **Produktansvarsforsikring** — dækker skader fra dit arbejde efter aflevering\n\n4. **Byggesagsforsikring** — dækker fejl opdaget op til 10 år efter aflevering\n\n5. **Maskinskade/Løsøreforsikring** — dækker dit udstyr og materialer\n\n6. **Erhvervskøretøjsforsikring** — firmabiler, varevogne etc.\n\n**Pris estimat** for en mellemstor tømrervirksomhed (5 ansatte):\n- Samlet forsikringspakke: 25.000-45.000 kr./år\n\nKontakt din forsikringsrådgiver for et tilbud. Vil du have hjælp til hvad du skal spørge om?`;
  }

  if (msg.includes('br18') || msg.includes('brand')) {
    return `**BR18 Brandkrav — Oversigt:**\n\nBygningsreglementet 2018 stiller disse vigtige brandkrav:\n\n**Bygningsklasser:**\n- Klasse 1: Enfamiliehuse (lavest krav)\n- Klasse 2: Flerfamiliehuse, kontorer\n- Klasse 3-4: Hospitaler, plejehjem, høje bygninger\n\n**Vigtige krav:**\n\n*Brandmateriale:*\n- Bærende konstruktioner: minimum A2-s1,d0\n- Facadebeklædning: min. D-s2,d2 (til 22 meter)\n\n*Brandvæg:*\n- Skel mod nabo: 30 cm ud over tagflade ELLER 1,80 m brandmur\n\n*Flugtveje:*\n- Max 25 meter fra opholds-areal til nødudgang\n- Trapper: EI 60 (60 minutters brandmodstand)\n\n*Brandalarmer:*\n- Røgalarm i alle opholds-rum i boliger\n- Automatisk brandanlæg kræves ved > 1000 m²\n\n**Ressource:** bygningsreglementet.dk har de fulge krav.\n\nSpørg gerne om et specifikt projekt!`;
  }

  const responses = [
    `Det er et godt spørgsmål! Inden for dansk byggeri er der mange aspekter at tage hensyn til. Kan du fortælle mig lidt mere om din specifikke situation? Så kan jeg give dig et mere præcist svar.\n\nJeg kan hjælpe dig med:\n- Budgettering og økonomi\n- Byggelovgivning (BR18, AB 18)\n- Projektstyring\n- Tekniske løsninger\n- Tilbudsskrivning`,
    `Tak for spørgsmålet! Som bygge-AI har jeg erfaring med mange aspekter af dansk byggeri. For at hjælpe dig bedst muligt — kan du specificere, om det drejer sig om:\n\n1. Et konkret projekt\n2. Generel vejledning\n3. Lovgivning og regler\n4. Økonomi og priser\n\nSå kan jeg give dig det mest relevante svar!`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export default function AIAssistantPage() {
  const { profile, company } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    if (!company || !profile) return;
    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('company_id', company.id)
      .eq('user_id', profile.id)
      .order('updated_at', { ascending: false });
    setConversations((data as Conversation[]) || []);
  };

  useEffect(() => { loadConversations(); }, [company, profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const startNewConversation = async () => {
    if (!company || !profile) return;
    const { data } = await supabase
      .from('ai_conversations')
      .insert({ company_id: company.id, user_id: profile.id, title: 'Ny samtale', messages: [] })
      .select()
      .single();
    if (data) {
      const conv = data as unknown as Conversation;
      setConversations(prev => [conv, ...prev]);
      setActiveConvId(conv.id);
      setMessages([]);
    }
  };

  const selectConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages || []);
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('ai_conversations').delete().eq('id', id);
    if (activeConvId === id) {
      setActiveConvId(null);
      setMessages([]);
    }
    loadConversations();
  };

  const sendMessage = async (content?: string) => {
    const text = content || input.trim();
    if (!text) return;

    let convId = activeConvId;

    if (!convId) {
      if (!company || !profile) return;
      const { data } = await supabase
        .from('ai_conversations')
        .insert({ company_id: company.id, user_id: profile.id, title: text.slice(0, 50), messages: [] })
        .select()
        .single();
      if (!data) return;
      const conv = data as unknown as Conversation;
      convId = conv.id;
      setActiveConvId(convId);
      setConversations(prev => [conv, ...prev]);
    }

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setTyping(true);

    const delay = 800 + Math.random() * 1200;
    setTimeout(async () => {
      const aiContent = simulateAIResponse(text);
      const aiMsg: Message = { role: 'assistant', content: aiContent, timestamp: new Date().toISOString() };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      setTyping(false);

      const isFirst = newMessages.length === 1;
      await supabase
        .from('ai_conversations')
        .update({
          messages: finalMessages,
          ...(isFirst ? { title: text.slice(0, 60) } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', convId!);

      loadConversations();
    }, delay);
  };

  const renderMessage = (content: string) => {
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-bold mt-2 first:mt-0">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('**')) {
          return <p key={i} className="font-semibold">{line.replace(/\*\*/g, '')}</p>;
        }
        if (line.startsWith('- ')) {
          return <p key={i} className="ml-2">• {line.slice(2)}</p>;
        }
        if (line.startsWith('#')) {
          return <p key={i} className="font-bold text-base">{line.replace(/^#+\s/, '')}</p>;
        }
        if (line === '') return <br key={i} />;
        return <p key={i}>{line}</p>;
      });
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversations sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 hidden sm:flex">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 mb-3">AI Assistent</h2>
          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus size={16} /> Ny samtale
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6 px-4">Start en ny samtale med AI assistenten</p>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`flex items-center gap-2 px-3 py-2.5 mx-2 rounded-xl cursor-pointer transition-colors group ${activeConvId === conv.id ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50'}`}
              >
                <Bot size={14} className={activeConvId === conv.id ? 'text-orange-500' : 'text-gray-400'} />
                <span className="text-sm text-gray-700 truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                <HardHat size={30} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">DanskBygAI Assistent</h3>
              <p className="text-gray-500 text-sm mb-6">
                Jeg er specialiseret i dansk byggeri og kan hjælpe med love, budgetter, projektstyring og meget mere.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition-all text-left"
                  >
                    <Sparkles size={13} className="text-orange-400 flex-shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-orange-500 text-white rounded-tr-sm'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="space-y-0.5">{renderMessage(msg.content)}</div>
                ) : (
                  msg.content
                )}
                <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-orange-200' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={16} className="text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Stil et spørgsmål om byggeri, lovgivning, budgetter..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              className="w-12 h-12 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">AI assistenten er til vejledning — konsulter altid en professionel for juridisk eller teknisk rådgivning.</p>
        </div>
      </div>
    </div>
  );
}
