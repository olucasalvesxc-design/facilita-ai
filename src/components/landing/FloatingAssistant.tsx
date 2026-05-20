import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const OG = '#FF7A00';
const DISPLAY = '"Bricolage Grotesque", system-ui, sans-serif';
const BODY = '"DM Sans", system-ui, sans-serif';

const MESSAGES = [
  {
    text: 'Quer saber como funciona?',
    cta: 'Ver como funciona',
    scroll: 'como-funciona',
  },
  {
    text: 'Veja os planos para profissionais',
    cta: 'Ver planos',
    scroll: 'planos',
  },
  {
    text: 'Explore o app em modo demo',
    cta: 'Explorar agora',
    scroll: null,
  },
];

interface FloatingAssistantProps {
  onExplore?: () => void;
}

export function FloatingAssistant({ onExplore }: FloatingAssistantProps) {
  const [open, setOpen] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 3500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setMsgIndex(i => (i + 1) % MESSAGES.length), 5000);
    return () => clearInterval(t);
  }, [open]);

  if (dismissed) return null;

  const msg = MESSAGES[msgIndex];

  const handleCta = () => {
    if (msg.scroll) {
      document.getElementById(msg.scroll)?.scrollIntoView({ behavior: 'smooth' });
      setOpen(false);
    } else {
      onExplore?.();
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
      {/* Bubble */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.92 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: 256,
              background: '#111',
              border: '1px solid rgba(255,122,0,0.22)',
              borderRadius: 20,
              padding: '18px 18px 14px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,122,0,0.05)',
              position: 'relative',
            }}
          >
            {/* Dismiss */}
            <button
              onClick={() => setDismissed(true)}
              style={{
                position: 'absolute', top: 10, right: 10,
                width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)', border: 'none',
                color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, lineHeight: 1,
              }}
            >✕</button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 9, background: OG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: OG, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: BODY }}>FacilitaAí</span>
            </div>

            {/* Message */}
            <AnimatePresence mode="wait">
              <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.22 }}
                style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, marginBottom: 14, paddingRight: 14, fontFamily: BODY }}
              >
                {msg.text}
              </motion.p>
            </AnimatePresence>

            {/* CTA */}
            <button
              onClick={handleCta}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 12,
                background: `linear-gradient(135deg, ${OG}, #FF5500)`,
                border: 'none', color: 'white',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer', fontFamily: DISPLAY,
                boxShadow: '0 4px 20px rgba(255,122,0,0.25)',
              }}
            >
              {msg.cta} →
            </button>

            {/* Dots */}
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 11 }}>
              {MESSAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMsgIndex(i)}
                  style={{
                    width: i === msgIndex ? 16 : 5, height: 5, borderRadius: 3,
                    border: 'none', cursor: 'pointer',
                    background: i === msgIndex ? OG : 'rgba(255,255,255,0.12)',
                    transition: 'all 0.3s ease', padding: 0,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        style={{
          width: 52, height: 52, borderRadius: '50%',
          background: `linear-gradient(135deg, ${OG}, #FF5500)`,
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(255,122,0,0.35)',
        }}
        animate={{ boxShadow: open ? '0 0 0 6px rgba(255,122,0,0.12), 0 4px 24px rgba(255,122,0,0.3)' : '0 4px 24px rgba(255,122,0,0.35)' }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }} style={{ color: 'white', fontSize: 18, lineHeight: 1 }}>✕</motion.span>
          ) : (
            <motion.svg key="icon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
