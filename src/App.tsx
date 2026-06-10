import React, { useState } from 'react';
import { 
  PhoneCall, 
  LogOut, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Workflow
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from './types';
import LandingPage from './components/LandingPage';
import LoginRegister from './components/LoginRegister';
import Dashboard from './components/Dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register' | 'dashboard'>('landing');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Feedback Alerts (Toasts)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
    showToast(`Bem-vindo, ${user.name}! Painel de integrações ativado.`, 'success');
  };

  const handleUpdateStatus = (newStatus: 'trial' | 'premium') => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        status: newStatus,
        trialDaysLeft: newStatus === 'premium' ? 0 : 7
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]" id="app-wrapper">
      
      {/* GLOBAL TOAST BANNER */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-xs font-semibold ${
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-250 text-emerald-800' :
              toast.type === 'error' ? 'bg-rose-50 border-rose-250 text-rose-800' :
              'bg-blue-50 border-blue-250 text-blue-800'
            }`}
            id="global-toast"
          >
            {toast.type === 'success' && <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />}
            {toast.type === 'info' && <Info className="h-4.5 w-4.5 text-blue-600 shrink-0" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-150" id="header-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand / Minimal Utility B2B style */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer" 
            onClick={() => currentView !== 'dashboard' && setCurrentView('landing')}
            id="brand-logo"
          >
            <div className="bg-[#0F4C81] p-2 rounded-lg text-white">
              <Workflow className="h-5 w-5" />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-base text-slate-900 tracking-tight block">
                Painel <span className="text-[#0F4C81]">n8n Whats</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold block">Conselho Clínico Integrado</span>
            </div>
          </div>

          {/* Nav Actions / Login State details */}
          <nav className="flex items-center gap-4" id="nav-actions">
            {currentView === 'landing' && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentView('login')} 
                  className="text-xs font-semibold text-slate-650 hover:text-[#0F4C81] transition-colors px-3 py-1.5 rounded-lg"
                  id="nav-login-btn"
                >
                  Acessar Painel
                </button>
                <button 
                  onClick={() => setCurrentView('register')} 
                  className="bg-[#0F4C81] hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-[0.98]"
                  id="nav-register-btn"
                >
                  Teste Grátis 7 dias
                </button>
              </div>
            )}

            {currentView !== 'landing' && currentView !== 'dashboard' && (
              <button 
                onClick={() => setCurrentView('landing')} 
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                id="nav-back-btn"
              >
                ← Voltar para a vitrine
              </button>
            )}

            {currentView === 'dashboard' && currentUser && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-medium">{currentUser.professionalId}</span>
                </div>
                
                {currentUser.status === 'trial' ? (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 rounded-full border border-amber-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-[9px] font-bold text-amber-700 font-mono">TRIAL RESTANTE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[9px] font-bold text-emerald-700 font-mono">VITALÍCIO</span>
                  </div>
                )}

                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-450 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg transition-all"
                  title="Sair do painel"
                  id="logout-btn"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            )}
          </nav>

        </div>
      </header>

      {/* RENDER VIEW PORT */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="landing"
            >
              <LandingPage onNavigate={setCurrentView} />
            </motion.div>
          )}

          {(currentView === 'login' || currentView === 'register') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              key="auth"
            >
              <LoginRegister 
                initialMode={currentView}
                onAuthSuccess={handleAuthSuccess}
                onBackToLanding={() => setCurrentView('landing')}
              />
            </motion.div>
          )}

          {currentView === 'dashboard' && currentUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="dashboard"
            >
              <Dashboard 
                currentUser={currentUser}
                onUpdateStatus={handleUpdateStatus}
                showToast={showToast}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}
