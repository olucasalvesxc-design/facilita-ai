import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Zap, Star, Crown, Rocket, ShieldCheck, Package, Calendar, Users, TrendingUp, MessageCircle, Clock } from 'lucide-react';

interface PlansModalProps {
  onClose: () => void;
  currentUser: any;
  profileData: any;
  onSubscribe: (plan: 'start' | 'pro' | 'ultra') => void;
}

const PLANS = [
  {
    id: 'start' as const,
    name: 'Start',
    price: 'R$ 14,90',
    period: '/mês',
    tagline: 'Para começar',
    icon: Rocket,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    glow: 'shadow-blue-500/20',
    kirvanoUrl: import.meta.env.VITE_KIRVANO_START_URL || 'https://pay.kirvano.com/a9e4a8e1-a4c3-43de-933e-21cff8f3f8a3',
    benefits: [
      { icon: ShieldCheck, text: 'Badge "Start" no perfil' },
      { icon: Users, text: 'Aparecer na busca de clientes' },
      { icon: MessageCircle, text: 'Receber pedidos de orçamento' },
      { icon: Calendar, text: 'Catálogo de serviços (até 5)' },
      { icon: Clock, text: 'Sistema de agenda básico' },
    ],
    missing: [
      'Produtos no marketplace',
      'Sistema de filas',
      'Portfólio ilimitado',
      'Destaque na busca',
    ],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 'R$ 23,90',
    period: '/mês',
    tagline: 'Mais popular',
    icon: Star,
    color: 'orange',
    gradient: 'from-orange-500 to-red-500',
    border: 'border-orange-500/40',
    badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    glow: 'shadow-orange-500/20',
    featured: true,
    kirvanoUrl: import.meta.env.VITE_KIRVANO_CHECKOUT_URL || 'https://pay.kirvano.com/a9e4a8e1-a4c3-43de-933e-21cff8f3f8a3',
    benefits: [
      { icon: ShieldCheck, text: 'Badge "Pro" no perfil' },
      { icon: Users, text: 'Aparecer na busca de clientes' },
      { icon: MessageCircle, text: 'Receber pedidos de orçamento' },
      { icon: Calendar, text: 'Catálogo ilimitado de serviços' },
      { icon: Package, text: 'Produtos no marketplace' },
      { icon: Clock, text: 'Agenda e sistema de filas' },
      { icon: TrendingUp, text: 'Portfólio de trabalhos' },
      { icon: Zap, text: 'Destaque na busca' },
    ],
    missing: [],
  },
  {
    id: 'ultra' as const,
    name: 'Ultra',
    price: 'R$ 39,90',
    period: '/mês',
    tagline: 'Máximo destaque',
    icon: Crown,
    color: 'yellow',
    gradient: 'from-yellow-400 to-orange-500',
    border: 'border-yellow-500/40',
    badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    glow: 'shadow-yellow-500/20',
    kirvanoUrl: import.meta.env.VITE_KIRVANO_ULTRA_URL || 'https://pay.kirvano.com/a9e4a8e1-a4c3-43de-933e-21cff8f3f8a3',
    benefits: [
      { icon: ShieldCheck, text: 'Badge "Ultra" dourado no perfil' },
      { icon: Users, text: 'Aparecer na busca de clientes' },
      { icon: MessageCircle, text: 'Receber pedidos de orçamento' },
      { icon: Calendar, text: 'Catálogo ilimitado de serviços' },
      { icon: Package, text: 'Produtos no marketplace' },
      { icon: Clock, text: 'Agenda e sistema de filas' },
      { icon: TrendingUp, text: 'Portfólio de trabalhos' },
      { icon: Crown, text: 'Borda dourada + selo Premium' },
      { icon: Zap, text: 'Posição prioritária na busca' },
      { icon: Star, text: 'Suporte prioritário' },
    ],
    missing: [],
  },
];

export function PlansModal({ onClose, currentUser, profileData, onSubscribe }: PlansModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'start' | 'pro' | 'ultra'>('pro');

  const plan = PLANS.find(p => p.id === selectedPlan)!;

  const handleSubscribe = () => {
    onSubscribe(selectedPlan);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative w-full sm:max-w-lg bg-[#0a0f1c] border border-white/10 rounded-t-[36px] sm:rounded-[36px] overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-0.5">Facilita Aí</p>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Planos Pro</h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-gray-500 text-xs font-bold">Escolha o plano ideal e comece a receber clientes hoje.</p>
        </div>

        {/* Plan selector tabs */}
        <div className="px-6 mb-4 shrink-0">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 gap-1">
            {PLANS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedPlan === p.id
                    ? `bg-gradient-to-r ${p.gradient} text-white shadow-lg`
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Plan card */}
        <div className="px-6 overflow-y-auto flex-grow no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPlan}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
            >
              {/* Price */}
              <div className={`relative rounded-[28px] border ${plan.border} bg-white/3 p-6 mb-4 overflow-hidden shadow-xl ${plan.glow}`}>
                {plan.featured && (
                  <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full bg-gradient-to-r ${plan.gradient} text-white text-[8px] font-black uppercase tracking-widest`}>
                    Mais Popular
                  </div>
                )}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest mb-4 ${plan.badge}`}>
                  <plan.icon size={10} />
                  Plano {plan.name}
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-white tracking-tighter">{plan.price}</span>
                  <span className="text-gray-500 text-sm font-bold pb-1">{plan.period}</span>
                </div>
                <p className="text-gray-500 text-xs font-bold">{plan.tagline} • Cancele quando quiser</p>

                {/* Decorative gradient blob */}
                <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${plan.gradient} opacity-10 blur-2xl`} />
              </div>

              {/* Benefits */}
              <div className="space-y-2 mb-4">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">O que está incluso</p>
                {plan.benefits.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${plan.gradient}`}>
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-white font-medium">{b.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Not included */}
              {plan.missing.length > 0 && (
                <div className="space-y-2 mb-4 opacity-40">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3">Não incluso</p>
                  {plan.missing.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-white/5 border border-white/10">
                        <X size={10} className="text-gray-600" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm text-gray-600 font-medium line-through">{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Compare hint */}
              {selectedPlan !== 'ultra' && (
                <button
                  onClick={() => setSelectedPlan(selectedPlan === 'start' ? 'pro' : 'ultra')}
                  className="w-full text-center text-[10px] text-orange-500/70 font-black uppercase tracking-widest mb-4 hover:text-orange-500 transition-colors"
                >
                  Ver plano superior →
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 pt-4 shrink-0 border-t border-white/5 bg-[#0a0f1c]">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubscribe}
            className={`w-full py-5 rounded-[20px] font-black uppercase tracking-widest text-sm text-white bg-gradient-to-r ${plan.gradient} shadow-xl ${plan.glow} transition-all active:scale-[0.98]`}
          >
            Assinar Plano {plan.name} — {plan.price}/mês
          </motion.button>
          <p className="text-center text-[9px] text-gray-600 font-bold mt-3 uppercase tracking-widest">
            Pagamento seguro via Kirvano · Sem fidelidade
          </p>
        </div>
      </motion.div>
    </div>
  );
}
