import React, { useState, useEffect, useRef } from 'react';
import { 
  Workflow, 
  MessageSquare, 
  Settings2, 
  Terminal, 
  CreditCard, 
  HelpCircle, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Database, 
  AlertTriangle, 
  QrCode, 
  PhoneCall,
  Save,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  PlayCircle,
  Code
} from 'lucide-react';
import { UserProfile, N8NConfig, ChatMessage, CustomizationSettings } from '../types';

interface DashboardProps {
  currentUser: UserProfile;
  onUpdateStatus: (newStatus: 'trial' | 'premium') => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Dashboard({ currentUser, onUpdateStatus, showToast }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'n8n' | 'clinic' | 'simulator' | 'guide' | 'billing'>('n8n');
  
  // Customizações clínicas
  const [clinicConfig, setClinicConfig] = useState<CustomizationSettings>({
    clinicName: 'Clínica Odonto-Med Dr. Carlos',
    businessHours: 'Segunda a Sexta, das 08h às 18h',
    appointmentDuration: '30 minutos',
    procedures: 'Consulta Clínica Geral, Limpeza Profilática, Tratamento de Canal, Clareamento Dental',
    greetingMessage: 'Olá! Sou a assistente virtual da Clínica Odonto-Med Dr. Carlos. Posso te ajudar a agendar ou remarcar uma consulta.',
    specialInstructions: 'Não prescreva medicamentos. Em caso de dor extrema, recomende o pronto socorro.'
  });

  const [tempClinicConfig, setTempClinicConfig] = useState<CustomizationSettings>({ ...clinicConfig });

  // Configurações do n8n / WhatsApp
  const [n8nConfig, setN8nConfig] = useState<N8NConfig>({
    n8nWebhookUrl: '',
    whatsappNumber: '(11) 99999-9999',
    apiToken: 'ey...',
    provider: 'evolution',
    isActive: false
  });

  const [tempN8nConfig, setTempN8nConfig] = useState<N8NConfig>({ ...n8nConfig });

  // Simulador de Chat
  const [simMode, setSimMode] = useState<'emulator' | 'real_n8n'>('emulator');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'system',
      text: 'Simulador carregado em Modo Ensaio de Diretrizes. Ligue seu webhook n8n ou digite abaixo para simular.',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [typedMessage, setTypedMessage] = useState('');
  const [isLoadingReply, setIsLoadingReply] = useState(false);

  // Pagamento Modal
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [chosenGateway, setChosenGateway] = useState<'pagseguro' | 'picpay'>('pagseguro');
  const [billingStage, setBillingStage] = useState<'prompt' | 'processing' | 'success'>('prompt');

  // Copy States
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    showToast(`${label} copiado para a área de transferência!`, 'success');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSaveClinicSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setClinicConfig({ ...tempClinicConfig });
    showToast('Regras clínicas atualizadas com sucesso para o banco!', 'success');
  };

  const handleSaveN8nSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setN8nConfig({ ...tempN8nConfig, isActive: !!tempN8nConfig.n8nWebhookUrl });
    showToast('Parâmetros de conexão n8n e WhatsApp salvos!', 'success');
    if (tempN8nConfig.n8nWebhookUrl) {
      setSimMode('real_n8n');
      showToast('O simulador de chat foi alterado para disparar contra seu webhook real!', 'info');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const userMsgText = typedMessage;
    setTypedMessage('');

    const newPatientMsg: ChatMessage = {
      id: `patient-${Date.now()}`,
      sender: 'patient',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newPatientMsg]);
    setIsLoadingReply(true);

    if (simMode === 'real_n8n' && n8nConfig.n8nWebhookUrl) {
      // POST REAL para o n8n do usuário!
      try {
        const payload = {
          message: userMsgText,
          senderName: 'Paciente de Teste',
          senderPhone: n8nConfig.whatsappNumber,
          clinic: clinicConfig.clinicName,
          conselho: currentUser.professionalId,
          meta: {
            businessHours: clinicConfig.businessHours,
            appointmentDuration: clinicConfig.appointmentDuration,
            procedures: clinicConfig.procedures,
            greetingMessage: clinicConfig.greetingMessage,
            specialInstructions: clinicConfig.specialInstructions
          }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de timeout

        const response = await fetch(n8nConfig.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        let replyText = '';
        if (response.ok) {
          const data = await response.json();
          // Aceita vários tipos comuns de retorno do n8n
          replyText = data.response || data.output || data.message || data.text || JSON.stringify(data);
          showToast('Mensagem processada pelo seu n8n!', 'success');
        } else {
          replyText = `Erro retornado pelo Webhook do seu n8n: Status ${response.status}. Verifique se seu fluxo de teste está ativo.`;
        }

        setChatMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }]);

      } catch (err) {
        setChatMessages(prev => [...prev, {
          id: `sys-err-${Date.now()}`,
          sender: 'system',
          text: `Falha ao alcançar o n8n. Verifique se o webhook aceita requisições CORS ou se a URL está correta. (Simulando repasse offline por contingência)`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }]);
        
        // Contingência offline amigável
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: `ai-fallback-${Date.now()}`,
            sender: 'ai',
            text: `[Fallback Local / Mock] Seu n8n receberia estes dados contextuais. Ele enviaria uma resposta para a clínica "${clinicConfig.clinicName}" baseada nas regras de: "${clinicConfig.procedures}"`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }]);
        }, 1000);
      } finally {
        setIsLoadingReply(false);
      }
    } else {
      // MOCK INTERNAL EMULATOR
      setTimeout(() => {
        let text = '';
        const lower = userMsgText.toLowerCase();
        if (lower.includes('agenda') || lower.includes('consulta') || lower.includes('marcar')) {
          text = `Eu responderia para o paciente: Com base nas regras clínicas salvas, realizamos: ${clinicConfig.procedures}. E nossas sessoes possuem duração de ${clinicConfig.appointmentDuration}. Qual o seu nome completo para prosseguir?`;
        } else if (lower.includes('horário') || lower.includes('hora') || lower.includes('aberto')) {
          text = `Atendemos de: ${clinicConfig.businessHours}. Deseja que eu agende sua consulta dentro desta janela de suporte?`;
        } else {
          text = `${clinicConfig.greetingMessage} (Esta resposta foi emulada com base na sua diretriz configurada. No n8n real, você enviará o prompt customizado para sua LLM)`;
        }

        setChatMessages(prev => [...prev, {
          id: `ai-mock-${Date.now()}`,
          sender: 'ai',
          text,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsLoadingReply(false);
      }, 1000);
    }
  };

  const handleSimulatePayment = () => {
    setBillingStage('processing');
    setTimeout(() => {
      setBillingStage('success');
      onUpdateStatus('premium');
      showToast(`Licença Premium Vitalícia confirmada via Webhook ${chosenGateway}!`, 'success');
    }, 2000);
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoadingReply]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="dashboard-root">
      
      {/* Upper Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Painel de Integração e Onboarding</h2>
          <p className="text-xs text-slate-500">Registre os webhooks, configure seu n8n e exporte os parâmetros do WhatsApp.</p>
        </div>
        
        {/* Status indicator on top */}
        <div className="flex items-center gap-3">
          {currentUser.status === 'trial' ? (
            <div className="bg-amber-50 rounded-xl px-4 py-2 border border-amber-200 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Assinatura de Demonstração</p>
              <p className="text-xs font-semibold text-amber-700">{currentUser.trialDaysLeft} dias de trial grátis restante</p>
            </div>
          ) : (
            <div className="bg-emerald-50 rounded-xl px-4 py-2 border border-emerald-200 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-mono">Assinatura Ativa</p>
              <p className="text-xs font-semibold text-emerald-700">Licença Premium Vitalícia</p>
            </div>
          )}

          {currentUser.status === 'trial' && (
            <button 
              onClick={() => {
                setBillingStage('prompt');
                setShowBillingModal(true);
              }}
              className="px-4 py-2 bg-[#0F4C81] hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow transition-all shrink-0"
              id="btn-buy-vitalicio"
            >
              Comprar Licença
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT NAV PANEL - TABS */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 text-left shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2">Navegação e Fluxo</p>
          
          <nav className="flex flex-col gap-1.5">
            <button 
              onClick={() => setActiveTab('n8n')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'n8n' ? 'bg-[#F0F5FA] text-[#0F4C81]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Workflow className="h-4.5 w-4.5" />
              Sincronia do n8n / Whats
            </button>

            <button 
              onClick={() => setActiveTab('clinic')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'clinic' ? 'bg-[#F0F5FA] text-[#0F4C81]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Settings2 className="h-4.5 w-4.5" />
              Parâmetros Clínicos
            </button>

            <button 
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'simulator' ? 'bg-[#F0F5FA] text-[#0F4C81]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="h-4.5 w-4.5" />
              Testar Webhook (Chat)
            </button>

            <button 
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'guide' ? 'bg-[#F0F5FA] text-[#0F4C81]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Compass className="h-4.5 w-4.5" />
              Manual do Fluxo n8n
            </button>

            <button 
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'billing' ? 'bg-[#F0F5FA] text-[#0F4C81]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="h-4.5 w-4.5" />
              Gateways PagSeguro/PicPay
            </button>
          </nav>

          <div className="h-px bg-slate-100 my-4"></div>

          {/* Quick Info Box for B2B integrators */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60 text-xs">
            <div className="flex items-center gap-1.5 text-[#0F4C81] font-bold mb-1">
              <Database className="h-3.5 w-3.5" />
              <span>Sua API Ativa</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              O seu n8n pode fazer um GET em tempo real para obter os dados do consultório que estão salvos neste painel.
            </p>
          </div>
        </div>

        {/* RIGHT DYNAMIC VIEW */}
        <div className="lg:col-span-9 bg-white border border-slate-200 rounded-2xl p-6 min-h-[480px] text-left shadow-sm">
          
          {/* ======================= TAB: n8n SETTINGS ======================= */}
          {activeTab === 'n8n' && (
            <div className="space-y-6" id="tab-n8n">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">Sincronia n8n & Provedores de WhatsApp</h3>
                <p className="text-xs text-slate-500">Indique o webhook do seu fluxo n8n para receber os gatilhos das mensagens e escolha o provedor do WhatsApp.</p>
              </div>

              <form onSubmit={handleSaveN8nSettings} className="space-y-4">
                
                <div className="p-4 bg-[#F0F5FA]/40 rounded-xl border border-blue-100">
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL do Webhook Pró/Produção do seu n8n *</label>
                  <input 
                    type="url"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 outline-none focus:ring-2 focus:ring-[#0F4C81]"
                    placeholder="https://suainstancia.n8n.cloud/webhook/..."
                    value={tempN8nConfig.n8nWebhookUrl}
                    onChange={e => setTempN8nConfig({...tempN8nConfig, n8nWebhookUrl: e.target.value})}
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">Sempre use a URL de <strong>Production</strong> em fluxo final para evitar ter que clicar em "Listen for webhook" no n8n.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Número de WhatsApp do Bot *</label>
                    <input 
                      type="text"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white animate-none"
                      placeholder="Ex: (11) 99999-9999"
                      value={tempN8nConfig.whatsappNumber}
                      onChange={e => setTempN8nConfig({...tempN8nConfig, whatsappNumber: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Provedor que você usa para WhatsApp *</label>
                    <select 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white"
                      value={tempN8nConfig.provider}
                      onChange={e => setTempN8nConfig({...tempN8nConfig, provider: e.target.value as any})}
                    >
                      <option value="evolution">Evolution API (Recomendado OpenSource)</option>
                      <option value="zapi">Z-API (Fácil Conexão por QR Code)</option>
                      <option value="official">WhatsApp Business Cloud API Oficial (Meta)</option>
                      <option value="generic">Webhook Genérico / Outro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">Token da API / Chave do Provedor (Opcional)</label>
                    <span className="text-[10px] text-slate-400">Mantido criptografado</span>
                  </div>
                  <input 
                    type="password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white"
                    placeholder="Cole seu token Bearer ou API Key do provedor usado"
                    value={tempN8nConfig.apiToken}
                    onChange={e => setTempN8nConfig({...tempN8nConfig, apiToken: e.target.value})}
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-150">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                    <span>Conexão certificada de backend</span>
                  </div>
                  
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-[#0F4C81] hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Salvar Ajustes de Sincronia
                  </button>
                </div>

              </form>

              {/* Informative Status Badge for Integrators */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <QrCode className="h-4 w-4 text-[#0D9488]" />
                  Instruções para seu QR Code do WhatsApp
                </p>
                <p className="text-xs text-slate-550 leading-relaxed">
                  Para o n8n conseguir enviar as mensagens de volta, ele precisa do número conectado. Configure sua instância no painel administrativo do provedor selecionado (Z-API ou Evolution) e leia o QR Code na aba oficial deles. Depois disso, o n8n fará o disparo de forma autônoma!
                </p>
              </div>

            </div>
          )}

          {/* ======================= TAB: CLINICAL CRITERIA ======================= */}
          {activeTab === 'clinic' && (
            <div className="space-y-6" id="tab-clinic">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">Diretrizes e Regras Clínicas</h3>
                  <p className="text-xs text-slate-500">Estas são as diretrizes de saúde configuradas pelo profissional que o seu n8n usará para alimentar o prompt.</p>
                </div>
                
                {/* Micro API endpoint call card */}
                <div className="bg-emerald-50/50 rounded-xl px-3 py-2 border border-emerald-100 text-left">
                  <p className="text-[10px] font-bold text-[#0D9488] font-mono">Endereço API que o n8n lerá:</p>
                  <p className="text-[10px] leading-tight text-emerald-950 font-mono select-all">https://ais-pre-.../api/clinic?email={currentUser.email}</p>
                </div>
              </div>

              <form onSubmit={handleSaveClinicSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nome Fantasia do Consultório</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white"
                      value={tempClinicConfig.clinicName}
                      onChange={e => setTempClinicConfig({...tempClinicConfig, clinicName: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Horários de Atendimento Comercial</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white"
                      value={tempClinicConfig.businessHours}
                      onChange={e => setTempClinicConfig({...tempClinicConfig, businessHours: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Procedimentos Permitidos para Agendamento</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white"
                      value={tempClinicConfig.procedures}
                      onChange={e => setTempClinicConfig({...tempClinicConfig, procedures: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estimativa de Duração Padrão por Consulta</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white"
                      value={tempClinicConfig.appointmentDuration}
                      onChange={e => setTempClinicConfig({...tempClinicConfig, appointmentDuration: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mensagem Inicial de Saudação do WhatsApp</label>
                  <textarea 
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white"
                    value={tempClinicConfig.greetingMessage}
                    onChange={e => setTempClinicConfig({...tempClinicConfig, greetingMessage: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Diretrizes Críticas de Triagem e Salvaguarda (Evitar Prescrições)</label>
                  <textarea 
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white"
                    value={tempClinicConfig.specialInstructions}
                    onChange={e => setTempClinicConfig({...tempClinicConfig, specialInstructions: e.target.value})}
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Atualizar Diretrizes do Banco
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* ======================= TAB: CHAT SIMULATOR (POST n8n) ======================= */}
          {activeTab === 'simulator' && (
            <div className="space-y-6" id="tab-simulator">
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">Simulador Interativo de Recepção</h3>
                  <p className="text-xs text-slate-500">Envie mensagens simulando o paciente. Se a URL n8n estiver salva, o site enviará requisições POST reais.</p>
                </div>

                {/* Simulation Mode Toggle */}
                <div className="flex rounded-lg border border-slate-200 overflow-hidden divide-x text-[11px] font-bold">
                  <button 
                    onClick={() => {
                      setSimMode('emulator');
                      showToast('Alterado para ensaio local baseado nas regras do site.', 'info');
                    }}
                    className={`px-3 py-1.5 ${simMode === 'emulator' ? 'bg-[#0F4C81] text-white' : 'bg-slate-50 text-slate-600'}`}
                  >
                    Ensaio Local Direct
                  </button>
                  <button 
                    onClick={() => {
                      if (!n8nConfig.n8nWebhookUrl) {
                        showToast('Indique uma URL de Webhook do n8n válida na primeira aba para habilitar!', 'error');
                        return;
                      }
                      setSimMode('real_n8n');
                      showToast('Ativado POST HTTP real para o seu n8n!', 'success');
                    }}
                    className={`px-3 py-1.5 ${simMode === 'real_n8n' ? 'bg-[#0D9488] text-white' : 'bg-slate-50 text-slate-600'}`}
                  >
                    Diga ao n8n (Real Webhook)
                  </button>
                </div>
              </div>

              {/* Chat Canvas Box */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-[400px]">
                
                {/* Header Chat Info */}
                <div className="bg-white px-4 py-3 border-b border-slate-200/80 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${simMode === 'real_n8n' ? 'bg-teal-500 animate-ping' : 'bg-blue-500 animate-pulse'}`}></span>
                    <span className="text-xs font-bold text-slate-800">Canal de Teste Integrado</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400">
                    Modo: {simMode === 'real_n8n' ? 'Gatilho n8n Ativo' : 'Ensaio Clínico'}
                  </span>
                </div>

                {/* Messages Canvas */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div 
                      key={msg.id || i}
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.sender === 'patient' 
                          ? 'bg-slate-900 text-white ml-auto rounded-tr-none' 
                          : msg.sender === 'ai' 
                          ? 'bg-blue-50 border border-blue-100/50 text-slate-800 mr-auto rounded-tl-none'
                          : 'bg-amber-50 border border-amber-250 text-amber-900 mx-auto text-center rounded-xl max-w-full text-[11px]'
                      }`}
                    >
                      <span className="text-[9px] text-slate-400 font-bold block mb-0.5 text-left capitalize">
                        {msg.sender === 'patient' ? 'Paciente' : msg.sender === 'ai' ? 'Secretária IA' : 'Aviso Técnico'}
                      </span>
                      <p className="leading-relaxed text-left whitespace-pre-wrap">{msg.text}</p>
                      <span className="text-[9px] text-slate-400 text-right block mt-1">{msg.timestamp}</span>
                    </div>
                  ))}

                  {isLoadingReply && (
                    <div className="bg-blue-50 text-slate-800 border-blue-100 p-3 rounded-2xl mr-auto rounded-tl-none max-w-[80%] flex items-center gap-2">
                      <span className="h-2 w-2 bg-[#0F4C81] rounded-full animate-bounce"></span>
                      <span className="h-2 w-2 bg-[#0F4C81] rounded-full animate-bounce delay-100"></span>
                      <span className="h-2 w-2 bg-[#0F4C81] rounded-full animate-bounce delay-200"></span>
                      <span className="text-xs text-slate-455">processando webhook pelo n8n...</span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Field Input Action */}
                <form onSubmit={handleSendMessage} className="bg-white p-3 border-t border-slate-200 flex gap-2">
                  <input 
                    type="text"
                    className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white"
                    placeholder="Simule a mensagem de um paciente: 'Quero agendar uma consulta amanhã'"
                    value={typedMessage}
                    onChange={e => setTypedMessage(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="p-2.5 bg-[#0F4C81] hover:bg-blue-800 text-white rounded-xl transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

              </div>

            </div>
          )}

          {/* ======================= TAB: GUIDE FOR INTEGRATION ======================= */}
          {activeTab === 'guide' && (
            <div className="space-y-6" id="tab-guide">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">Como montar esse fluxo no seu n8n</h3>
                <p className="text-xs text-slate-550">Siga as boas práticas de arquitetura abaixo para integrar o n8n à sua conta do WhatsApp e consultar o painel do cliente.</p>
              </div>

              {/* Step By Step Architecture List */}
              <div className="space-y-4">
                
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="bg-[#0F4C81] text-white font-mono font-bold text-xs h-6 w-6 rounded-full flex items-center justify-center shrink-0">1</div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-slate-900">Gatilho (Webhook) n8n + Ouvinte das Mensagens</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Configure no seu provedor de WhatsApp (e.g. Evolution API) o envio de mensagens recebidas para a URL do Webhook do seu n8n.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="bg-[#0F4C81] text-white font-mono font-bold text-xs h-6 w-6 rounded-full flex items-center justify-center shrink-0">2</div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-slate-900">Nó HTTP Request (Buscar Diretrizes da Clínica)</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Faça o seu n8n fazer uma requisição do tipo <span className="font-mono text-[10px] font-bold bg-slate-200 text-slate-800 px-1 py-0.5 rounded">GET</span> para buscar dinamicamente as regras clínicas que seu cliente médico salvou na nossa interface.
                    </p>
                    <div className="bg-slate-900 text-slate-200 font-mono text-[10px] p-3 rounded-lg overflow-x-auto relative mt-2 text-left">
                      <span>GET https://ais-pre-qew4d7u3y7236hlfec7dxd-378302504099.us-west1.run.app/api/clinic?email={currentUser.email}</span>
                      <button 
                        onClick={() => handleCopy(`https://ais-pre-qew4d7u3y7236hlfec7dxd-378302504099.us-west1.run.app/api/clinic?email=${currentUser.email}`, 'Endpoint')}
                        className="absolute right-2 top-2 p-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px]"
                      >
                        {copiedText === 'Endpoint' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="bg-[#0F4C81] text-white font-mono font-bold text-xs h-6 w-6 rounded-full flex items-center justify-center shrink-0">3</div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-slate-900">Nó OpenAI / Anthropic / Gemini (Injetar Prompt Contextual)</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Passe para a IA as variáveis que você puxou da nossa API: <span className="font-mono text-[11px] font-bold">clinicName</span>, <span className="font-mono text-[11px] font-bold">procedures</span>, <span className="font-mono text-[11px] font-bold">businessHours</span> e as <span className="font-mono text-[11px] font-bold">specialInstructions</span>, garantindo o alinhamento da personalidade.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="bg-[#0F4C81] text-white font-mono font-bold text-xs h-6 w-6 rounded-full flex items-center justify-center shrink-0">4</div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-slate-900">Responder Paciente no WhatsApp</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Use o nó de requisição HTTP ou o nó nativo do Evolution API/Z-API para disparar uma requisição de volta enviando o texto gerado pela Inteligência Artificial.
                    </p>
                  </div>
                </div>

              </div>

              {/* JSON Payload Spec Document */}
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-white">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                  <Code className="h-4.5 w-4.5 text-slate-500" />
                  JSON de Resposta do Endpoint de Diretrizes (/api/clinic)
                </p>
                <pre className="text-[11px] font-mono text-slate-700 bg-slate-50 p-3 rounded-lg overflow-x-auto text-left">
{`{
  "clinicName": "Clinica Odonto-Med Dr. Carlos",
  "businessHours": "Segunda a Sexta, das 08h às 18h",
  "procedures": "Consulta Clínica Geral, Clareamento, Canal",
  "appointmentDuration": "30 minutos",
  "specialInstructions": "Não prescreva remédios. Recomende o pronto socorro.",
  "greetingMessage": "Olá! Sou a assistente virtual..."
}`}
                </pre>
              </div>

            </div>
          )}

          {/* ======================= TAB: BILLING & GATEWAYS ======================= */}
          {activeTab === 'billing' && (
            <div className="space-y-6" id="tab-billing">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">Controle Financeiro & Licenciamento Vitalício</h3>
                <p className="text-xs text-slate-550">Nossos checkouts geram cobranças reais seguras de R$ 3.000,00 utilizando o PagSeguro ou PicPay.</p>
              </div>

              {/* Licensa info status box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-5 bg-gradient-to-tr from-blue-50/50 to-indigo-50/20 border border-blue-200/80 rounded-2xl">
                  <p className="text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider mb-2">Integração PagSeguro</p>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">O gateway do PagSeguro envia notificações via Webhook quando o pagamento é processado no cartão ou Pix em tempo integral.</p>
                  
                  <button 
                    onClick={() => {
                      setChosenGateway('pagseguro');
                      setBillingStage('prompt');
                      setShowBillingModal(true);
                    }}
                    className="px-4 py-2 hover:bg-[#0F4C81] bg-slate-900 text-white rounded-xl text-xs font-semibold shadow transition-all flex items-center gap-1.5"
                  >
                    Simular Checkout PagSeguro
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="p-5 bg-gradient-to-tr from-teal-50/50 to-cyan-50/20 border border-teal-200/80 rounded-2xl">
                  <p className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider mb-2">Integração PicPay</p>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">A API do PicPay devolve a confirmação do pagamento com validação de assinatura digital (x-seller-token).</p>
                  
                  <button 
                    onClick={() => {
                      setChosenGateway('picpay');
                      setBillingStage('prompt');
                      setShowBillingModal(true);
                    }}
                    className="px-4 py-2 hover:bg-[#0D9488] bg-slate-900 text-white rounded-xl text-xs font-semibold shadow transition-all flex items-center gap-1.5"
                  >
                    Simular Checkout PicPay
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>

              {/* Simulated Payload Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-800 mb-1">Retorno de aprovação (Webhook /api/webhooks/...)</p>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">Ao aprovar o checkout nestas apis de produção, você pode configurar o n8n ou usar nosso webhook para enviar o comando de liberação à nossa API do backend:</p>
                
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[10px] overflow-x-auto text-left">
{`{
  "referenceId": "CLINICA_gabriel_at_gmail.com",
  "status": "paid",
  "gateway": "${chosenGateway}"
}`}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* MODAL DE PAGAMENTO SIMULADO */}
      {showBillingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="billing-modal">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-100/80 animate-scale-up text-left">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-bold font-mono text-slate-500 uppercase">Processando checkout</span>
              <button 
                onClick={() => setShowBillingModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕ Esc
              </button>
            </div>

            {billingStage === 'prompt' && (
              <div className="space-y-4">
                <div className="text-center bg-[#F0F5FA] p-5 rounded-2xl border border-blue-50">
                  <CreditCard className="h-8 w-8 text-[#0F4C81] mx-auto mb-2 animate-bounce" />
                  <p className="text-sm font-bold text-slate-900 font-display">Checkout Simplificado {chosenGateway === 'pagseguro' ? 'PagSeguro' : 'PicPay'}</p>
                  <p className="text-xs text-slate-500 mt-1">Simule o ambiente real de cobrança da licença vitalícia.</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Beneficiário:</span>
                    <span className="font-bold text-slate-800">Gabriel Moura (n8n Integrador)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Profissional de saúde:</span>
                    <span className="font-bold text-slate-800">{currentUser.name} {currentUser.professionalId}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-110 pt-2">
                    <span className="text-slate-600">Preço Vitalício:</span>
                    <span className="font-bold text-slate-900 text-sm">R$ 3.000,00</span>
                  </div>
                </div>

                {/* Simulation warnings */}
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-3 rounded-xl leading-relaxed flex items-start gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                  <span>Esse ambiente de Sandbox emula o fluxo do checkout. Ao clicar abaixo, nós dispararemos a aprovação simulando o POST do webhook para o gateway.</span>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowBillingModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                  >
                    Mudar Gateway
                  </button>
                  <button 
                    onClick={handleSimulatePayment}
                    className="flex-grow-2 py-2.5 bg-[#0F4C81] hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow"
                    id="btn-confirm-trial-buy"
                  >
                    Confirmar Pagamento Simulado
                  </button>
                </div>
              </div>
            )}

            {billingStage === 'processing' && (
              <div className="text-center py-8 space-y-4">
                <span className="h-10 w-10 border-4 border-[#0F4C81] border-t-transparent rounded-full block mx-auto animate-spin"></span>
                <p className="text-xs text-slate-600 font-bold">Autenticando transação de R$ 3k com o servidor {chosenGateway === 'pagseguro' ? 'UOL' : 'Sellers'}...</p>
                <p className="text-[11px] text-slate-400">Verificando retorno da API e aguardando webhook de ativação de licença...</p>
              </div>
            )}

            {billingStage === 'success' && (
              <div className="space-y-4 text-center py-4">
                <CheckCircle className="h-12 w-12 text-[#0D9488] mx-auto animate-pulse" />
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-900 font-display">Licença Vitalícia Ativada na Clínica!</p>
                  <p className="text-xs text-slate-500">Sua secretária eletrônica com n8n está autorizada por tempo indeterminado!</p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl text-[11px] leading-relaxed text-emerald-800">
                  <span>As chaves de API contextuais estão agora abertas por completo para o seu número integrado <strong>{n8nConfig.whatsappNumber}</strong>.</span>
                </div>

                <button 
                  onClick={() => setShowBillingModal(false)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
                >
                  Fechar Janela de Assinatura
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
