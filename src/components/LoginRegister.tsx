import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  ShieldCheck, 
  Building2, 
  PhoneCall, 
  Stethoscope, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../types';

interface LoginRegisterProps {
  initialMode: 'login' | 'register';
  onAuthSuccess: (user: UserProfile) => void;
  onBackToLanding: () => void;
}

export default function LoginRegister({ initialMode, onAuthSuccess, onBackToLanding }: LoginRegisterProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Registration States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [professionalId, setProfessionalId] = useState(''); // CRM/CRO
  
  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Local Error Handling
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password || !document || !professionalId) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha precisa ter no mínimo 6 caracteres de segurança.');
      return;
    }

    // Provedor de dados B2B mockado na memória
    const newUser: UserProfile = {
      name,
      email,
      document,
      phone: phone || '(11) 99999-9999',
      professionalId,
      status: 'trial',
      trialDaysLeft: 7
    };

    onAuthSuccess(newUser);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Por favor, digite seu e-mail corporativo e senha.');
      return;
    }

    // Criar demo se não tiver credencial específica
    const loggedUser: UserProfile = {
      name: 'Dr. Ricardo Pinheiro',
      email: loginEmail,
      document: '42.123.456/0001-90',
      phone: '(11) 99876-5432',
      professionalId: 'CRM-SP 485123',
      status: 'trial',
      trialDaysLeft: 5
    };

    onAuthSuccess(loggedUser);
  };

  return (
    <div className="py-14 max-w-xl mx-auto px-4" id="auth-container">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200">
        
        {/* Title Indicator */}
        <div className="text-center space-y-2.5 mb-8">
          <div className="bg-blue-50 p-3 rounded-full w-fit mx-auto text-[#0F4C81] mb-2 border border-blue-100">
            {mode === 'register' ? <Stethoscope className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            {mode === 'register' ? 'Registre sua Clínica na IA' : 'Acesso ao Painel Seguro'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            {mode === 'register' ? 'Habilite seu período de testes de 7 dias e configure seu webhook do n8n.' : 'Gerencie as integrações de WhatsApp e webhooks de IA do seu consultório.'}
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-center gap-2 mb-6">
            <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {mode === 'register' ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nome Completo do Responsável *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400 h-4.5 w-4.5" />
                <input 
                  type="text"
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0F4C81] focus:bg-white text-slate-800 outline-none transition-all"
                  placeholder="Ex: Dr. Ricardo Pinheiro"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">E-mail Corporativo *</label>
                <input 
                  type="email"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0F4C81] focus:bg-white text-slate-800 outline-none transition-all"
                  placeholder="seuemail@clinica.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Senha de Acesso *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400 h-4.5 w-4.5" />
                  <input 
                    type="password"
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0F4C81] focus:bg-white text-slate-800 outline-none transition-all"
                    placeholder="Min. 6 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">CPF ou CNPJ *</label>
                <input 
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0F4C81] focus:bg-white text-slate-800 outline-none transition-all"
                  placeholder="00.000.000/0001-00"
                  value={document}
                  onChange={e => setDocument(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Conselho Médico (CRM/CRO) *</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 text-slate-400 h-4.5 w-4.5" />
                  <input 
                    type="text"
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0F4C81] focus:bg-white text-slate-800 outline-none transition-all"
                    placeholder="Ex: CRO-SP 12345"
                    value={professionalId}
                    onChange={e => setProfessionalId(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">WhatsApp / Telefone Residencial ou Comercial</label>
              <div className="relative">
                <PhoneCall className="absolute left-3 top-3 text-slate-400 h-4.5 w-4.5" />
                <input 
                  type="text"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0F4C81] focus:bg-white text-slate-800 outline-none transition-all"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-[#0F4C81] to-[#1E40AF] hover:from-[#1E40AF] hover:to-[#0F4C81] text-white font-semibold py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2 text-xs"
              id="btn-confirm-register"
            >
              Criar Conta e Iniciar Trial de 7 Dias
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center pt-3">
              <span className="text-slate-400 text-xs">Já tem uma conta de integrações? </span>
              <button 
                type="button" 
                onClick={() => setMode('login')} 
                className="text-[#0F4C81] font-bold text-xs hover:underline"
              >
                Fazer Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Seu E-mail Cadastrado</label>
              <input 
                type="email"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0F4C81] focus:bg-white text-slate-800 outline-none transition-all"
                placeholder="seuemail@clinica.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400 h-4.5 w-4.5" />
                <input 
                  type="password"
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0F4C81] focus:bg-white text-slate-800 outline-none transition-all"
                  placeholder="Sua senha secreta"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl shadow transition-all text-xs flex items-center justify-center gap-2"
              id="btn-confirm-login"
            >
              Entrar no Ambientes
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center pt-2">
              <span className="text-slate-400 text-xs">Não possui cadastro? </span>
              <button 
                type="button" 
                onClick={() => setMode('register')} 
                className="text-[#0F4C81] font-bold text-xs hover:underline"
              >
                Criar conta teste
              </button>
            </div>
          </form>
        )}

        <button 
          onClick={onBackToLanding}
          className="mt-6 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors w-full text-center block"
        >
          ← Voltar à vitrine principal
        </button>

      </div>
    </div>
  );
}
