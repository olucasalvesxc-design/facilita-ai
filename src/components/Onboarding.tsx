import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ListOrdered, Target, ShieldCheck, Hammer } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    color: '#FF7A00',
    title: 'Profissionais na palma da mão',
    desc: 'Eletricistas, cabeleireiros, personal trainers e muito mais — perto de você, agora.',
  },
  {
    icon: ListOrdered,
    color: '#3b82f6',
    title: 'Fila digital sem estresse',
    desc: 'Entre em filas virtuais e receba um aviso quando for sua vez.',
  },
  {
    icon: Target,
    color: '#22c55e',
    title: 'Orçamento em minutos',
    desc: 'Descreva o serviço e receba propostas de profissionais verificados rapidamente.',
  },
  {
    icon: ShieldCheck,
    color: '#a855f7',
    title: 'Segurança e confiança',
    desc: 'Todos os profissionais são avaliados pelos próprios clientes.',
  },
];

const FEATURE_DURATION = 2200;

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'features' | 'logo'>('features');
  const [featureIndex, setFeatureIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('facilita_onboarding_seen');
    if (!seen) {
      setVisible(true);
    } else {
      onComplete();
    }
  }, [onComplete]);

  // Auto-advance features
  useEffect(() => {
    if (!visible || phase !== 'features') return;
    const timer = setTimeout(() => {
      if (featureIndex < FEATURES.length - 1) {
        setFeatureIndex(i => i + 1);
      } else {
        setPhase('logo');
      }
    }, FEATURE_DURATION);
    return () => clearTimeout(timer);
  }, [visible, phase, featureIndex]);

  const handleSkip = () => {
    localStorage.setItem('facilita_onboarding_seen', 'true');
    setVisible(false);
    setTimeout(onComplete, 300);
  };

  if (!visible) return null;

  const feat = FEATURES[featureIndex];
  const Icon = feat.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleSkip}
      className="fixed inset-0 z-[1900] flex flex-col items-center justify-center select-none cursor-pointer"
      style={{ background: '#070b13' }}
    >
      <AnimatePresence mode="wait">
        {phase === 'features' ? (
          <motion.div
            key={`feat-${featureIndex}`}
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="flex flex-col items-center text-center px-10 max-w-sm w-full pointer-events-none"
          >
            {/* Progress dots */}
            <div className="flex gap-1.5 mb-12">
              {FEATURES.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    width: i === featureIndex ? 24 : 6,
                    background: i <= featureIndex ? feat.color : 'rgba(255,255,255,0.12)',
                  }}
                />
              ))}
            </div>

            <div
              className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-8"
              style={{ background: `${feat.color}18`, border: `1px solid ${feat.color}35` }}
            >
              <Icon size={44} style={{ color: feat.color }} />
            </div>

            <h2 className="text-white font-black text-2xl uppercase italic tracking-tighter leading-tight mb-4">
              {feat.title}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              {feat.desc}
            </p>

            {/* Progress bar */}
            <div className="mt-16 w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: feat.color }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: FEATURE_DURATION / 1000, ease: 'linear' }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="flex flex-col items-center text-center px-8 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 16, stiffness: 200 }}
              className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #1a0e00, #2d1600)',
                boxShadow: '0 20px 60px rgba(255,122,0,0.4)',
                border: '1px solid rgba(255,122,0,0.3)',
              }}
            >
              <Hammer size={44} className="text-[#FF7A00]" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-3"
            >
              <span className="text-white">FACILITA</span>
              <span className="text-[#FF7A00] ml-2">AÍ</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38 }}
              className="text-gray-500 text-sm font-medium mb-16"
            >
              Tudo que você precisa, em um só lugar.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-600"
            >
              Toque para começar
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
