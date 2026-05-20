import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mascot, MascotPose } from './Mascot';

interface Slide {
  id: number;
  label: string;
  headline: string[];
  accent: string;
  glow: string;
  pose: MascotPose;
  illustration: React.ReactNode;
}

function IconSearch() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="35" stroke="rgba(255,122,0,0.15)" strokeWidth="2" />
      <circle cx="32" cy="30" r="14" stroke="#FF7A00" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="43" y1="42" x2="54" y2="54" stroke="#FF7A00" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="30" r="6" fill="rgba(255,122,0,0.15)" />
      <circle cx="29" cy="27" r="2" fill="#FF7A00" opacity="0.6" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="35" stroke="rgba(255,122,0,0.15)" strokeWidth="2" />
      <rect x="16" y="30" width="40" height="28" rx="6" stroke="#FF7A00" strokeWidth="2.5" />
      <path d="M 26 30 L 26 24 Q 26 16 36 16 Q 46 16 46 24 L 46 30" stroke="#FF7A00" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <line x1="26" y1="42" x2="46" y2="42" stroke="rgba(255,122,0,0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="36" cy="37" r="3" fill="rgba(255,122,0,0.3)" stroke="#FF7A00" strokeWidth="1.5" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="35" stroke="rgba(255,122,0,0.15)" strokeWidth="2" />
      <rect x="14" y="20" width="44" height="38" rx="6" stroke="#FF7A00" strokeWidth="2.5" />
      <line x1="14" y1="31" x2="58" y2="31" stroke="#FF7A00" strokeWidth="2" />
      <line x1="24" y1="14" x2="24" y2="26" stroke="#FF7A00" strokeWidth="3" strokeLinecap="round" />
      <line x1="48" y1="14" x2="48" y2="26" stroke="#FF7A00" strokeWidth="3" strokeLinecap="round" />
      <rect x="22" y="38" width="8" height="8" rx="2" fill="rgba(255,122,0,0.3)" stroke="#FF7A00" strokeWidth="1" />
      <rect x="36" y="38" width="8" height="8" rx="2" fill="rgba(255,122,0,0.3)" stroke="#FF7A00" strokeWidth="1" />
      <rect x="22" y="50" width="8" height="6" rx="2" fill="rgba(255,122,0,0.15)" />
      <rect x="36" y="50" width="8" height="6" rx="2" fill="#FF7A00" opacity="0.6" />
    </svg>
  );
}

function IconSOS() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="35" stroke="rgba(255,80,0,0.25)" strokeWidth="2" />
      <circle cx="36" cy="36" r="26" stroke="rgba(255,80,0,0.15)" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M36 18 L36 38" stroke="#FF7A00" strokeWidth="4" strokeLinecap="round" />
      <circle cx="36" cy="48" r="3.5" fill="#FF7A00" />
      <path d="M20 20 L16 16 M52 20 L56 16 M20 52 L16 56 M52 52 L56 56" stroke="rgba(255,122,0,0.4)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="35" stroke="rgba(255,122,0,0.15)" strokeWidth="2" />
      <path d="M36 16 C28 16 22 22.3 22 30 C22 40.5 36 56 36 56 C36 56 50 40.5 50 30 C50 22.3 44 16 36 16Z" stroke="#FF7A00" strokeWidth="2.5" fill="rgba(255,122,0,0.1)" />
      <circle cx="36" cy="30" r="6" fill="#FF7A00" opacity="0.8" />
      <circle cx="36" cy="30" r="2.5" fill="white" />
    </svg>
  );
}

function IconLogo() {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
      className="w-28 h-28 rounded-[36px] flex items-center justify-center"
      style={{ background: '#FF7A00', boxShadow: '0 0 80px rgba(255,122,0,0.6), 0 0 160px rgba(255,122,0,0.2)' }}
    >
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    </motion.div>
  );
}

const SLIDES: Slide[] = [
  {
    id: 0,
    label: 'O problema',
    headline: ['Precisa de um serviço', 'e não sabe', 'por onde começar?'],
    accent: 'rgba(255,122,0,0.06)',
    glow: 'rgba(255,122,0,0.04)',
    pose: 'thinking',
    illustration: (
      <div className="relative flex items-center justify-center w-40 h-40">
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,122,0,0.08) 0%, transparent 70%)' }} />
        {[{ t: '-top-2 -left-4', d: '0s', s: '2.5rem' }, { t: '-top-6 right-2', d: '0.4s', s: '2rem' }, { t: 'top-2 -right-6', d: '0.8s', s: '2.2rem' }].map((q, i) => (
          <motion.span
            key={i}
            className={`absolute ${q.t} font-black`}
            style={{ fontSize: q.s, color: '#FF7A00', opacity: 0.35, fontFamily: 'Syne, sans-serif' }}
            animate={{ y: [0, -6, 0], opacity: [0.35, 0.6, 0.35] }}
            transition={{ duration: 2, repeat: Infinity, delay: parseFloat(q.d) }}
          >?</motion.span>
        ))}
        <IconSearch />
      </div>
    ),
  },
  {
    id: 1,
    label: 'Profissionais',
    headline: ['Encontre profissionais', 'perto', 'de você'],
    accent: 'rgba(255,122,0,0.07)',
    glow: 'rgba(255,122,0,0.05)',
    pose: 'pointing',
    illustration: (
      <div className="relative flex items-center justify-center w-40 h-40">
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,122,0,0.1) 0%, transparent 70%)' }} />
        {[{ x: '-left-8 top-6', delay: 0 }, { x: 'right-0 top-0', delay: 0.3 }, { x: '-left-2 -bottom-2', delay: 0.6 }].map((p, i) => (
          <motion.div
            key={i}
            className={`absolute ${p.x} w-7 h-7 rounded-full border-2 flex items-center justify-center`}
            style={{ borderColor: '#FF7A00', background: 'rgba(255,122,0,0.1)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: p.delay }}
          >
            <div className="w-3 h-3 rounded-full" style={{ background: '#FF7A00' }} />
          </motion.div>
        ))}
        <IconMap />
      </div>
    ),
  },
  {
    id: 2,
    label: 'Marketplace',
    headline: ['Compre', 'produtos locais'],
    accent: 'rgba(34,197,94,0.04)',
    glow: 'rgba(34,197,94,0.03)',
    pose: 'shopping',
    illustration: (
      <div className="relative flex items-center justify-center w-40 h-40">
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,122,0,0.08) 0%, transparent 70%)' }} />
        {['-top-4 -left-6', '-top-2 right-2', 'bottom-0 -left-2'].map((pos, i) => (
          <motion.div
            key={i}
            className={`absolute ${pos} w-10 h-10 rounded-xl border flex items-center justify-center`}
            style={{ borderColor: 'rgba(255,122,0,0.3)', background: '#0e0e0e' }}
            animate={{ y: [0, -4, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
          >
            <div className="w-4 h-4 rounded" style={{ background: 'rgba(255,122,0,0.4)' }} />
          </motion.div>
        ))}
        <IconBag />
      </div>
    ),
  },
  {
    id: 3,
    label: 'Agendamento',
    headline: ['Agende serviços', 'em segundos'],
    accent: 'rgba(139,92,246,0.04)',
    glow: 'rgba(139,92,246,0.03)',
    pose: 'calendar',
    illustration: (
      <div className="relative flex items-center justify-center w-40 h-40">
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,122,0,0.08) 0%, transparent 70%)' }} />
        <motion.div
          className="absolute -top-3 right-0 text-xs font-black px-2 py-1 rounded-lg"
          style={{ background: 'rgba(255,122,0,0.15)', border: '1px solid rgba(255,122,0,0.3)', color: '#FF7A00', fontFamily: 'Syne, sans-serif' }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >14:00 ✓</motion.div>
        <IconCalendar />
      </div>
    ),
  },
  {
    id: 4,
    label: 'Emergência',
    headline: ['Precisa urgente?', 'Resolva', 'na hora'],
    accent: 'rgba(239,68,68,0.06)',
    glow: 'rgba(255,80,0,0.05)',
    pose: 'alert',
    illustration: (
      <div className="relative flex items-center justify-center w-40 h-40">
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ background: 'radial-gradient(circle, rgba(255,60,0,0.15) 0%, transparent 70%)' }}
        />
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: 'rgba(255,80,0,0.3)' }}
            animate={{ scale: [1, 1.8 + i * 0.3], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
        <IconSOS />
      </div>
    ),
  },
  {
    id: 5,
    label: 'Facilita Aí',
    headline: ['Tudo em', 'um só lugar'],
    accent: 'rgba(255,122,0,0.1)',
    glow: 'rgba(255,122,0,0.08)',
    pose: 'welcome',
    illustration: <IconLogo />,
  },
];

const SLIDE_DURATION = 5000;

interface HeroSliderProps {
  onExplore?: () => void;
}

export function HeroSlider({ onExplore }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), []);
  const goTo = useCallback((i: number) => setCurrent(i), []);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(next, SLIDE_DURATION);
    return () => clearTimeout(t);
  }, [current, paused, next]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{
        background: `radial-gradient(ellipse 90% 60% at 50% 10%, ${slide.accent} 0%, transparent 70%), #050505`,
        transition: 'background 1s ease',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ background: `radial-gradient(ellipse 60% 40% at 50% 80%, ${slide.glow} 0%, transparent 60%)` }}
      />

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center pt-24 pb-8 px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-8 max-w-2xl text-center w-full"
          >
            {/* Label */}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full"
              style={{ color: '#FF7A00', background: 'rgba(255,122,0,0.1)', border: '1px solid rgba(255,122,0,0.2)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {slide.label}
            </motion.span>

            {/* Illustration + Mascot row */}
            <div className="flex items-end justify-center gap-6 sm:gap-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', damping: 16 }}
              >
                {slide.illustration}
              </motion.div>

              <Mascot pose={slide.pose} size={130} />
            </div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="font-black leading-none tracking-tighter"
              style={{ fontFamily: 'Syne, system-ui, sans-serif', fontSize: 'clamp(2.2rem, 7vw, 4.5rem)' }}
            >
              {slide.headline.map((line, i) => (
                <span key={i} className={`block ${i === 1 ? 'text-[#FF7A00]' : 'text-white'}`}>
                  {line}
                </span>
              ))}
            </motion.h1>

            {/* CTA on last slide */}
            {current === SLIDES.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
              >
                <button
                  onClick={onExplore}
                  className="w-full sm:w-auto font-black uppercase text-sm tracking-widest text-white px-8 py-4 rounded-2xl transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #FF7A00, #FF5500)',
                    boxShadow: '0 0 40px rgba(255,122,0,0.35), 0 10px 30px rgba(0,0,0,0.3)',
                    fontFamily: 'Syne, sans-serif',
                  }}
                >
                  Explorar o app
                </button>
                <button
                  className="w-full sm:w-auto font-bold text-sm text-gray-400 px-8 py-4 rounded-2xl border transition-all hover:border-orange-500/40 hover:text-white"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', fontFamily: 'Syne, sans-serif' }}
                  onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Saiba mais ↓
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav: dots + progress */}
      <div className="flex flex-col items-center gap-3 pb-10 px-6">
        {/* Progress bar */}
        <div className="w-48 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            key={current}
            className="h-full rounded-full"
            style={{ background: '#FF7A00' }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
          />
        </div>

        {/* Dots */}
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all rounded-full"
              style={{
                width: i === current ? 24 : 6,
                height: 6,
                background: i === current ? '#FF7A00' : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 right-8 hidden sm:flex flex-col items-center gap-1.5"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-600">scroll</span>
        <div className="w-0.5 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, rgba(255,122,0,0.5), transparent)' }} />
      </motion.div>
    </section>
  );
}
