import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye, X, LogIn, UserPlus, Compass, ShoppingBag,
  Calendar, AlertTriangle, ArrowRight, ChevronRight,
  Zap, Users, Phone,
} from 'lucide-react';

// ─── Tour Steps ────────────────────────────────────────────────────────────────
const TOUR_STEPS = [
  {
    icon: Compass,
    color: '#FF7A00',
    title: 'Encontre profissionais',
    desc: 'Na aba Explorar, você vê profissionais próximos de você — eletricistas, cabeleireiros, personal trainers e muito mais.',
  },
  {
    icon: ShoppingBag,
    color: '#3b82f6',
    title: 'Compre produtos locais',
    desc: 'Profissionais também vendem produtos. Encontre itens de beleza, ferramentas e mais — direto de quem entende do assunto.',
  },
  {
    icon: Calendar,
    color: '#22c55e',
    title: 'Agende serviços',
    desc: 'Agende horários diretamente pelo app, entre na fila digital ou solicite um orçamento com poucos cliques.',
  },
  {
    icon: Phone,
    color: '#ef4444',
    title: 'Emergência em 1 clique',
    desc: 'Acesse contatos de emergência como SAMU, Bombeiros e Polícia na aba Emergência — sem precisar procurar.',
  },
  {
    icon: Users,
    color: '#a855f7',
    title: 'Chat direto',
    desc: 'Converse com o profissional, receba propostas e confirme serviços sem sair do app.',
  },
];

// ─── Demo Banner ───────────────────────────────────────────────────────────────
export function DemoBanner({ onExit, onSignUp }: { onExit: () => void; onSignUp: () => void }) {
  return (
    <motion.div
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-[999] flex items-center justify-between gap-2 px-4 py-2.5"
      style={{ background: 'linear-gradient(90deg, #1a0800, #2d1200)', borderBottom: '1px solid rgba(255,122,0,0.25)' }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-5 h-5 rounded-md bg-orange-500/20 flex items-center justify-center shrink-0">
          <Eye size={11} className="text-orange-400" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-orange-300 truncate">
          Modo demonstração
        </span>
        <span className="text-[10px] text-gray-500 hidden sm:inline truncate">
          — explorando sem conta
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onSignUp}
          className="flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-widest hover:bg-orange-600 transition-all active:scale-95"
        >
          <UserPlus size={11} />
          Criar conta
        </button>
        <button
          onClick={onExit}
          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          title="Sair do modo demo"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Auth Prompt Modal ─────────────────────────────────────────────────────────
export function AuthPromptModal({
  open,
  onClose,
  onSignUp,
  onLogin,
  message,
}: {
  open: boolean;
  onClose: () => void;
  onSignUp: () => void;
  onLogin: () => void;
  message?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="relative w-full max-w-sm bg-[#121826] border border-white/10 rounded-[36px] overflow-hidden shadow-2xl"
          >
            {/* Top accent */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #FF7A00, #ff4500)' }} />

            <div className="p-8 text-center">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-5 rounded-[24px] flex items-center justify-center"
                style={{ background: 'rgba(255,122,0,0.12)', border: '1px solid rgba(255,122,0,0.2)' }}>
                <Zap size={28} className="text-orange-400" />
              </div>

              <h3 className="text-white font-black text-xl uppercase italic tracking-tighter leading-none mb-2">
                Torne-se um usuário
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {message || 'Crie sua conta gratuita para continuar e aproveitar todos os recursos do Facilita Aí.'}
              </p>

              <div className="space-y-3">
                <button
                  onClick={onSignUp}
                  className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 hover:bg-orange-600 active:scale-95 transition-all"
                >
                  <UserPlus size={16} />
                  Criar conta grátis
                </button>
                <button
                  onClick={onLogin}
                  className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all"
                >
                  <LogIn size={16} />
                  Já tenho conta
                </button>
              </div>

              <button onClick={onClose} className="mt-4 text-[10px] text-gray-600 hover:text-gray-400 transition-colors font-bold uppercase tracking-widest">
                Continuar explorando
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Demo Tour ─────────────────────────────────────────────────────────────────
export function DemoTour({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[1800] flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDone}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative w-full max-w-sm bg-[#121826] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
        >
          {/* Progress bar */}
          <div className="h-1 w-full bg-white/5">
            <motion.div
              className="h-full rounded-full"
              style={{ background: current.color }}
              animate={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <div className="p-8 text-center">
            {/* Step counter */}
            <div className="flex justify-center gap-1.5 mb-6">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 20 : 6,
                    background: i <= step ? current.color : 'rgba(255,255,255,0.1)',
                  }}
                />
              ))}
            </div>

            {/* Icon */}
            <div
              className="w-20 h-20 mx-auto mb-5 rounded-[28px] flex items-center justify-center"
              style={{ background: `${current.color}18`, border: `1px solid ${current.color}30` }}
            >
              <Icon size={36} style={{ color: current.color }} />
            </div>

            <h3 className="text-white font-black text-2xl uppercase italic tracking-tighter leading-none mb-3">
              {current.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              {current.desc}
            </p>

            <div className="flex gap-3">
              <button
                onClick={onDone}
                className="flex-1 py-4 bg-white/5 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 active:scale-95 transition-all"
              >
                Pular tour
              </button>
              <button
                onClick={() => isLast ? onDone() : setStep(s => s + 1)}
                className="flex-[2] py-4 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
                style={{ background: current.color, boxShadow: `0 8px 24px ${current.color}30` }}
              >
                {isLast ? (
                  <><Zap size={14} /> Explorar agora</>
                ) : (
                  <><ArrowRight size={14} /> Próximo</>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Demo CTA Final ────────────────────────────────────────────────────────────
export function DemoCtaBanner({ onSignUp, onLogin }: { onSignUp: () => void; onLogin: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 8 }}
      className="fixed bottom-24 lg:bottom-6 left-4 right-4 z-[500] max-w-sm mx-auto"
    >
      <div
        className="rounded-[28px] p-5 flex items-center gap-4 shadow-2xl"
        style={{ background: '#121826', border: '1px solid rgba(255,122,0,0.2)' }}
      >
        <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center shrink-0">
          <Zap size={18} className="text-white" />
        </div>
        <div className="flex-grow min-w-0">
          <p className="text-white font-black text-sm uppercase tracking-tight leading-none mb-0.5">
            Gostou?
          </p>
          <p className="text-gray-400 text-[10px]">Crie sua conta e comece agora.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSignUp}
            className="bg-orange-500 text-white px-4 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-orange-600 active:scale-95 transition-all flex items-center gap-1"
          >
            <UserPlus size={11} /> Criar conta
          </button>
          <button onClick={() => setDismissed(true)} className="text-gray-600 hover:text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
