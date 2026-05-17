import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Hammer, Phone, MapPin, CheckCircle } from 'lucide-react';

const OG = '#FF7A00';

interface IntroAnimationProps {
  onComplete: () => void;
}

const STORY = [
  { icon: Phone,       text: 'Solicite um serviço',         delay: 0    },
  { icon: MapPin,      text: 'Encontramos o profissional',  delay: 0.18 },
  { icon: CheckCircle, text: 'Problema resolvido',          delay: 0.36 },
];

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => onCompleteRef.current(), 3800),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center z-[100] cursor-pointer select-none"
      style={{ background: '#07090f' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
      onClick={onComplete}
    >
      {/* Glow ambiente */}
      <motion.div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 500, height: 500,
          background: `radial-gradient(circle, rgba(255,122,0,0.07) 0%, transparent 65%)`,
        }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <AnimatePresence mode="wait">

        {/* ── Fase 1 + 2: logo mini + story beats ── */}
        {phase >= 1 && phase < 3 && (
          <motion.div
            key="story"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-10"
          >
            {/* Logo mini com anel pulsante */}
            <div className="relative flex items-center justify-center">
              <motion.div
                className="absolute rounded-[28px]"
                style={{ width: 80, height: 80, background: `${OG}20` }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 280 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
                style={{
                  background: OG,
                  boxShadow: `0 0 35px ${OG}55`,
                }}
              >
                <Hammer size={28} className="text-white -rotate-12" />
              </motion.div>
            </div>

            {/* Story beats */}
            <div className="flex flex-col gap-4 w-64">
              {phase >= 2 && STORY.map(({ icon: Icon, text, delay }) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3.5"
                >
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      background: `${OG}18`,
                      borderColor: `${OG}30`,
                    }}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: delay + 0.05, type: 'spring', damping: 12 }}
                  >
                    <Icon size={18} style={{ color: OG }} />
                  </motion.div>
                  <span className="text-white/75 text-sm font-medium leading-snug">
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Fase 3: logo grande reveal ── */}
        {phase >= 3 && (
          <motion.div
            key="logo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-7 w-full px-8"
          >
            {/* Quadrado laranja grande */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 14, stiffness: 220 }}
              animate-glow={{
                boxShadow: [
                  `0 0 30px ${OG}40`,
                  `0 0 70px ${OG}80`,
                  `0 0 30px ${OG}40`,
                ],
              }}
              className="w-24 h-24 rounded-[28px] flex items-center justify-center"
              style={{
                background: OG,
                boxShadow: `0 0 50px ${OG}60`,
              }}
            >
              <motion.div
                initial={{ rotate: -30, scale: 0.5 }}
                animate={{ rotate: -12, scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 10 }}
              >
                <Hammer size={44} className="text-white" />
              </motion.div>
            </motion.div>

            {/* Texto FACILITA AÍ */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-6xl font-black uppercase italic tracking-tight leading-none text-center w-full"
            >
              <span className="text-white">FACILITA</span>
              <span style={{ color: OG }}> AÍ</span>
            </motion.h1>

            {/* Linha decorativa centralizada */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-px w-24 origin-center"
              style={{ background: `linear-gradient(to right, transparent, ${OG}, transparent)` }}
            />

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm font-medium tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.30)' }}
            >
              A plataforma que resolve seus problemas
            </motion.p>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Hint pular */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 text-[10px] uppercase tracking-widest"
        style={{ color: 'rgba(255,255,255,0.18)' }}
      >
        Toque para pular
      </motion.p>
    </motion.div>
  );
}
