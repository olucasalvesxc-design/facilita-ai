import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const OG = '#FF7A00';
const DISPLAY = '"Bricolage Grotesque", system-ui, sans-serif';
const BODY = '"DM Sans", system-ui, sans-serif';
const SLIDE_DURATION = 5500;

// ── Slide visuals ─────────────────────────────────────────────────────────────

function VisualQuestion() {
  return (
    <div className="relative w-[260px] h-[200px] select-none">
      {[
        { top: 0, left: 10, size: 52, delay: 0, opacity: 0.9 },
        { top: 40, left: 140, size: 36, delay: 0.4, opacity: 0.55 },
        { top: 110, left: 50, size: 44, delay: 0.8, opacity: 0.7 },
      ].map((b, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', top: b.top, left: b.left,
            width: b.size + 32, height: b.size + 16,
            borderRadius: 16, background: '#0e0e0e',
            border: '1px solid rgba(255,122,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
        >
          <span style={{ fontSize: b.size, fontWeight: 900, color: OG, opacity: b.opacity, fontFamily: DISPLAY, lineHeight: 1 }}>?</span>
        </motion.div>
      ))}
      <div style={{
        position: 'absolute', bottom: 0, right: 0, width: 72, height: 72,
        borderRadius: '50%', border: '1.5px solid rgba(255,122,0,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#090909',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={OG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
    </div>
  );
}

function VisualProfessionals() {
  const pros = [
    { name: 'Fernanda C.', role: 'Cabeleireira', stars: 5, dist: '0,3km', color: '#f97316' },
    { name: 'Lucas M.', role: 'Eletricista', stars: 4.8, dist: '0,8km', color: '#3b82f6' },
    { name: 'Ana R.', role: 'Personal', stars: 5, dist: '1,1km', color: '#a855f7' },
  ];
  return (
    <div className="flex flex-col gap-2.5 w-[240px]">
      {pros.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.12, duration: 0.4 }}
          style={{
            background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: p.color + '22', border: `1.5px solid ${p.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: p.color, fontFamily: DISPLAY }}>{p.name[0]}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'white', fontFamily: DISPLAY }}>{p.name}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: BODY }}>{p.dist}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: BODY }}>{p.role}</span>
              <span style={{ fontSize: 9, color: '#f59e0b', marginLeft: 4 }}>{'★'.repeat(Math.floor(p.stars))}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function VisualMarketplace() {
  const items = [
    { label: 'Shampoo Pro', price: 'R$ 89', cat: 'Cabelos', color: '#f97316' },
    { label: 'Kit Elétrico', price: 'R$ 149', cat: 'Ferramentas', color: '#3b82f6' },
    { label: 'Gel UV 30ml', price: 'R$ 59', cat: 'Beleza', color: '#ec4899' },
    { label: 'Plano Treino', price: 'R$ 120', cat: 'Fitness', color: '#22c55e' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: 240 }}>
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          style={{
            background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '12px 10px',
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: 8, background: item.color + '20', border: `1px solid ${item.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'white', fontFamily: DISPLAY, lineHeight: 1.3 }}>{item.label}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: BODY, marginTop: 2 }}>{item.cat}</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: OG, fontFamily: DISPLAY, marginTop: 6 }}>{item.price}</div>
        </motion.div>
      ))}
    </div>
  );
}

function VisualCalendar() {
  const slots = ['09:00', '10:00', '11:00', '14:00', '15:00'];
  return (
    <div style={{ width: 230, background: '#0e0e0e', borderRadius: 18, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'white', fontFamily: DISPLAY }}>Maio 2025</span>
        <span style={{ fontSize: 10, color: OG, fontWeight: 700, fontFamily: DISPLAY }}>Hoje</span>
      </div>
      <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {slots.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: '7px 10px', borderRadius: 9,
              background: i === 2 ? 'rgba(255,122,0,0.12)' : 'rgba(255,255,255,0.03)',
              border: i === 2 ? '1px solid rgba(255,122,0,0.3)' : '1px solid transparent',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: i === 2 ? 700 : 400, color: i === 2 ? OG : 'rgba(255,255,255,0.4)', fontFamily: BODY }}>{s}</span>
            {i === 2 && <span style={{ fontSize: 9, fontWeight: 700, color: OG, fontFamily: DISPLAY, background: 'rgba(255,122,0,0.15)', padding: '2px 7px', borderRadius: 20 }}>✓ Confirmado</span>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function VisualSOS() {
  return (
    <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', borderRadius: '50%',
            border: '1.5px solid rgba(255,80,0,0.35)',
          }}
          animate={{ width: [80, 80 + (i + 1) * 42], height: [80, 80 + (i + 1) * 42], opacity: [0.7, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.55, ease: 'easeOut' }}
        />
      ))}
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,60,0,0.1)', border: '2px solid rgba(255,80,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={OG} strokeWidth="2.5" strokeLinecap="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
    </div>
  );
}

function VisualLogo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <motion.div
        style={{ width: 100, height: 100, borderRadius: 28, background: OG, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 80px rgba(255,122,0,0.5), 0 0 160px rgba(255,122,0,0.15)` }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </motion.div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: DISPLAY, letterSpacing: '-0.02em' }}>
          Facilita<span style={{ color: OG }}>Aí</span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: BODY, marginTop: 4, letterSpacing: '0.15em', textTransform: 'uppercase' }}>A plataforma que resolve</div>
      </div>
    </div>
  );
}

// ── Slides data ───────────────────────────────────────────────────────────────

interface SlideData {
  counter: string;
  headline: string;
  accent: string;
  Visual: () => React.ReactElement;
}

const SLIDES: SlideData[] = [
  { counter: '01', headline: 'Precisa de um serviço\ne não sabe por\nonde começar?', accent: 'rgba(255,122,0,0.06)', Visual: VisualQuestion },
  { counter: '02', headline: 'Encontre profissionais\nperto de você,\nagora mesmo.', accent: 'rgba(255,122,0,0.07)', Visual: VisualProfessionals },
  { counter: '03', headline: 'Compre produtos\nlocais com quem\nentende do assunto.', accent: 'rgba(255,122,0,0.05)', Visual: VisualMarketplace },
  { counter: '04', headline: 'Agende serviços\nem segundos.\nSem ligação.', accent: 'rgba(139,92,246,0.05)', Visual: VisualCalendar },
  { counter: '05', headline: 'Precisa urgente?\nResolva\nna hora.', accent: 'rgba(239,68,68,0.06)', Visual: VisualSOS },
  { counter: '06', headline: 'Tudo em\num só lugar.', accent: 'rgba(255,122,0,0.1)', Visual: VisualLogo },
];

// ── HeroSlider ────────────────────────────────────────────────────────────────

interface HeroSliderProps {
  onExplore?: () => void;
}

export function HeroSlider({ onExplore }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), []);
  const goTo = useCallback((i: number) => setCurrent(i), []);

  useEffect(() => {
    const t = setTimeout(next, SLIDE_DURATION);
    return () => clearTimeout(t);
  }, [current, next]);

  const slide = SLIDES[current];
  const Visual = slide.Visual;

  return (
    <section
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: '#050505' }}
    >
      {/* Ambient gradient — shifts per slide */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: 1 }}
        style={{
          background: `radial-gradient(ellipse 70% 50% at 20% 60%, ${slide.accent} 0%, transparent 70%)`,
          transition: 'background 1.2s ease',
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      {/* Top progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-10" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          key={current}
          className="h-full"
          style={{ background: OG }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
        />
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col justify-center pt-20 pb-16 px-6 max-w-6xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-10 lg:gap-16 w-full"
          >
            {/* Left: counter + headline */}
            <div className="flex-1 max-w-2xl w-full">
              {/* Counter */}
              <div
                className="inline-flex items-center gap-3 mb-8"
                style={{ fontFamily: BODY }}
              >
                <span style={{ fontSize: 11, fontWeight: 500, color: OG, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {slide.counter} / {String(SLIDES.length).padStart(2, '0')}
                </span>
                <div style={{ width: 32, height: 1, background: 'rgba(255,122,0,0.4)' }} />
                <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  FacilitaAí
                </span>
              </div>

              {/* Headline */}
              <h1
                className="text-white font-black leading-none"
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 'clamp(2.6rem, 6.5vw, 5.5rem)',
                  letterSpacing: '-0.03em',
                  whiteSpace: 'pre-line',
                }}
              >
                {slide.headline.split('\n').map((line, i, arr) => (
                  <span key={i} className="block">
                    {i === arr.length - 1 && arr.length > 1
                      ? <span style={{ color: OG }}>{line}</span>
                      : line}
                  </span>
                ))}
              </h1>

              {/* CTA - last slide */}
              {current === SLIDES.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-3 mt-10"
                >
                  <button
                    onClick={onExplore}
                    className="font-black uppercase text-sm tracking-widest text-white px-8 py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${OG}, #FF5500)`,
                      boxShadow: `0 0 50px rgba(255,122,0,0.3), 0 8px 32px rgba(0,0,0,0.4)`,
                      fontFamily: DISPLAY,
                    }}
                  >
                    Explorar o app
                  </button>
                  <button
                    onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                    className="font-medium text-sm px-8 py-4 rounded-2xl transition-all hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.35)', fontFamily: BODY, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                  >
                    Saiba mais ↓
                  </button>
                </motion.div>
              )}
            </div>

            {/* Right: visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center shrink-0"
            >
              <Visual />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom: dots + scroll hint */}
      <div className="relative flex items-center justify-between px-6 pb-10 max-w-6xl mx-auto w-full">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all rounded-full"
              style={{
                width: i === current ? 28 : 6,
                height: 6,
                background: i === current ? OG : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <motion.div
          className="hidden sm:flex items-center gap-2"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: BODY }}>scroll</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </motion.div>
      </div>
    </section>
  );
}
