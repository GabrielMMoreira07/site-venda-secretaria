import React from 'react';
import { 
  PhoneCall, 
  ArrowRight, 
  Clock, 
  Calendar, 
  CheckCircle, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Workflow, 
  MessageSquare
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: 'landing' | 'login' | 'register' | 'dashboard') => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="flex flex-col bg-[#F8FAFC]" id="landing-page">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 bg-gradient-to-b from-[#F0F5FA] via-white to-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0F4C81 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Copywriting Left */}
            <div className="lg:col-span-7 flex flex-col text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 w-fit">
                <Workflow className="h-4 w-4 text-[#0F4C81]" />
                <span className="text-xs font-bold text-[#0F4C81] font-display uppercase tracking-wider">Hospedagem & Integração n8n</span>
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-5xl text-slate-900 tracking-tight leading-tight">
                Leve sua Secretária IA do <span className="text-[#0D9488]">n8n</span> direto para o <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F4C81] to-[#1E40AF]">WhatsApp dos seus Clientes</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl">
                O painel de controle que faltava para seu fluxo de IA. Permita que médicos, dentistas e clínicas gerenciem as diretrizes de atendimento diretamente por uma interface amigável, enquanto você processa tudo via n8n e envia de volta ao WhatsApp.
              </p>

              {/* CTA Row */}
              <div className="flex flex-col sm:flex-row gap-4 pt-3">
                <button 
                  onClick={() => onNavigate('register')}
                  className="bg-gradient-to-r from-[#0F4C81] to-[#1E40AF] hover:from-[#1E40AF] hover:to-[#0F4C81] text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-900/10 transition-all flex items-center justify-center gap-2.5 text-base active:scale-[0.98]"
                  id="hero-cta-free-trial"
                >
                  Criar Conta de Teste (7 dias)
                  <ArrowRight className="h-5 w-5" />
                </button>
                <a 
                  href="#pricing"
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-7 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-sm"
                  id="hero-cta-pricing"
                >
                  Preços da Licença
                </a>
              </div>

              {/* Real Performance Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                <div>
                  <span className="block font-display font-bold text-2xl text-slate-900">100%</span>
                  <span className="text-xs text-slate-400">Flexibilidade n8n</span>
                </div>
                <div>
                  <span className="block font-display font-bold text-2xl text-[#0D9488]">0%</span>
                  <span className="text-xs text-slate-400">Mensalidades no Core</span>
                </div>
                <div>
                  <span className="block font-display font-bold text-2xl text-[#0F4C81]">R$ 3k</span>
                  <span className="text-xs text-slate-400">Licença Vitalícia</span>
                </div>
              </div>

            </div>

            {/* Micro Interaction UI Preview Right */}
            <div className="lg:col-span-5 relative" id="hero-graphic">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100 to-indigo-100/50 rounded-3xl blur-2xl opacity-50"></div>
              
              <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80">
                
                {/* Header Widget */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F0F5FA] flex items-center justify-center">
                      <Workflow className="w-5 h-5 text-[#0F4C81]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 text-left">Gatilho do n8n</p>
                      <p className="text-[10px] text-slate-400 text-left">webhook-active-whatsapp</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-mono font-bold uppercase tracking-wider">Conectado</span>
                </div>

                {/* Simulated Chat Nodes */}
                <div className="space-y-4 text-xs text-left max-h-[280px] overflow-y-auto mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 font-mono block mb-1">Passo 1: Recebe Mensagem WhatsApp</span>
                    <p className="text-slate-600">"Gostaria de agendar retorno com a Dra. Mariana na sexta-feira às 14h."</p>
                  </div>

                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-[9px] font-bold text-[#0F4C81] font-mono block mb-1">Passo 2: Processador n8n + IA</span>
                    <p className="text-slate-700">O n8n consulta a API do painel da clínica para obter as regras de agendamento e disponibilidade.</p>
                  </div>

                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
                    <span className="text-[9px] font-bold text-teal-700 font-mono block mb-1">Passo 3: WhatsApp Resposta Automatizada</span>
                    <p className="text-teal-800">"Confirmado! Reservamos seu horário para sexta-feira às 14h com a Dra. Mariana. Faremos seu preparo."</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Integração WhatsApp</p>
                    <p className="text-xs font-semibold text-slate-800">Evolution / Z-API / Cloud API</p>
                  </div>
                  <button 
                    onClick={() => onNavigate('register')}
                    className="bg-[#0F4C81] hover:bg-blue-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                  >
                    Testar Integração
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Seção de Benefícios */}
      <section id="benefits" className="py-20 bg-white border-y border-slate-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-[#0F4C81]">Eficiência para Clínicas</span>
            <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight">
              A Ponte de IA Perfeita entre o n8n e o WhatsApp do seu Cliente
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Hospede o setup inicial para o médico ou secretária fornecer os insumos de regras em um painel seguro, e permita que o seu robô no n8n consulte e execute tudo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-8 bg-[#F8FAFC] rounded-2xl border border-slate-200/60 space-y-4 hover:shadow-lg transition-all text-left">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#0F4C81] flex items-center justify-center font-bold">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">Sem Códigos Expostos</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Seu cliente médico apenas configura as regras comerciais da clínica de forma intuitiva. Suas chaves de API secretas, fluxo do n8n e prompt system permanecem 100% seguros no seu servidor.
              </p>
            </div>

            <div className="p-8 bg-[#F8FAFC] rounded-2xl border border-slate-200/60 space-y-4 hover:shadow-lg transition-all text-left">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center font-bold">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">Sincronia Inteligente</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                As consultas e regras de procedimento de saúde enviadas pelo menu do dashboard do cliente se tornam acessíveis via endpoint JSON para o seu nó de integração HTTP no n8n.
              </p>
            </div>

            <div className="p-8 bg-[#F8FAFC] rounded-2xl border border-slate-200/60 space-y-4 hover:shadow-lg transition-all text-left">
              <div className="h-10 w-10 rounded-xl bg-[#F0F5FA] text-indigo-600 flex items-center justify-center font-bold">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">WhatsApp Sem Dor de Cabeça</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Aprenda a mapear e disparar requisições em provedores como Evolution API ou Z-API após a aprovação de agendamento automático do paciente.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Seção de Preços */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-[#F8FAFC] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-[#0D9488]">Transparência e Parceria</span>
            <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight">
              Uma Licença Vitalícia Sem Mensalidades
            </h2>
            <p className="text-slate-500 text-sm">
              Use a estrutura do painel, forneça o link seguro para seus clientes clínicos e construa sua própria receita recorrente de agência integradora de Inteligência Artificial.
            </p>
          </div>

          {/* Pricing Box Clean & Minimal */}
          <div className="max-w-md mx-auto relative bg-white border border-slate-200 rounded-2xl p-8 shadow-xl text-left overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#0F4C81] text-white text-[9px] uppercase font-mono tracking-wider font-bold py-1 px-4 rounded-bl-xl">
              Mais Solicitado
            </div>

            <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-[#0F4C81] block mb-1">Licença B2B</span>
            <h3 className="font-display font-bold text-xl text-slate-900 mb-4">Acesso Vitalício Health IA</h3>

            <div className="my-5 flex items-baseline gap-1 bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="text-slate-500 font-semibold text-xs">R$</span>
              <span className="text-slate-900 font-display font-bold text-3xl">3.000</span>
              <span className="text-slate-500 font-semibold text-xs">,00 Pagamento Único</span>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Você ganha suporte inicial para seu n8n e documentação passo a passo do fluxo para as APIs de envio do WhatsApp.
            </p>

            <div className="space-y-3 border-t border-slate-100 pt-5 mb-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Integração total via Webhooks de API</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Painel Clínico de Personalização Amigável</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Simulador de Teste Rápido integrado</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Checkouts de pagamento reais disponíveis</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('register')}
              className="w-full bg-[#0F4C81] hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow"
            >
              Começar Teste Prático de 7 Dias
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-white border-t border-slate-900 mt-auto text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-450">
          <div>
            <span>© 2026 Secretária IA. Desenvolvido para Automações n8n & WhatsApp B2B.</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hover:text-white cursor-pointer">Termos</span>
            <span className="hover:text-white cursor-pointer">Segurança LGPD</span>
            <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-850">
              <span className="h-2 w-2 rounded-full bg-[#0D9488]"></span>
              <span className="text-[10px] font-mono text-slate-300">FastAPI & n8n Prontos</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
