import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HeroSlider } from '../components/landing/HeroSlider';
import { FloatingAssistant } from '../components/landing/FloatingAssistant';
import {
  HowItWorks,
  TrustSection,
  Features,
  MarketplaceSection,
  ForProfessionals,
  PlansSection,
  FAQSection,
  DemoSection,
  FinalCTA,
  LandingFooter,
} from '../components/landing/LandingSections';

interface LandingProps {
  onEnterApp: () => void;
}

const DISPLAY = '"Bricolage Grotesque", system-ui, sans-serif';
const BODY = '"DM Sans", system-ui, sans-serif';

function LandingNav({ onEnterApp }: { onEnterApp: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        background: scrolled ? 'rgba(5,5,5,0.85)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#FF7A00', boxShadow: '0 0 20px rgba(255,122,0,0.4)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <span className="font-black text-white text-lg tracking-tight" style={{ fontFamily: DISPLAY }}>
            Facilita<span style={{ color: '#FF7A00' }}>Aí</span>
          </span>
        </div>

        {/* Links (desktop) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          {[['Como funciona', '#como-funciona'], ['Funcionalidades', '#funcionalidades'], ['Profissionais', '#profissionais']].map(([label, href]) => (
            <button
              key={label}
              onClick={() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-white transition-colors"
            >{label}</button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onEnterApp}
          className="font-black uppercase text-xs tracking-widest text-white px-5 py-2.5 rounded-xl transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #FF7A00, #FF5500)',
            boxShadow: '0 0 20px rgba(255,122,0,0.2)',
            fontFamily: DISPLAY,
          }}
        >
          Acessar app
        </button>
      </div>
    </motion.nav>
  );
}

export function Landing({ onEnterApp }: LandingProps) {
  // Inject global landing styles
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'landing-styles';
    style.textContent = `
      .landing-reveal {
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .landing-visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
      .landing-card {
        transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
      }
      .landing-card:hover {
        border-color: rgba(255, 122, 0, 0.35) !important;
        box-shadow: 0 0 40px rgba(255, 122, 0, 0.07), 0 20px 40px rgba(0,0,0,0.25);
        transform: translateY(-3px);
      }
    `;
    if (!document.getElementById('landing-styles')) {
      document.head.appendChild(style);
    }
    return () => document.getElementById('landing-styles')?.remove();
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: '#050505', color: 'white', fontFamily: BODY }}
    >
      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[999]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.35,
        }}
      />

      <LandingNav onEnterApp={onEnterApp} />
      <HeroSlider onExplore={onEnterApp} />
      <HowItWorks />
      <TrustSection />
      <Features />
      <MarketplaceSection />
      <ForProfessionals onSignUp={onEnterApp} />
      <PlansSection />
      <FAQSection />
      <DemoSection onExplore={onEnterApp} />
      <FinalCTA onExplore={onEnterApp} onSignUp={onEnterApp} />
      <LandingFooter />
      <FloatingAssistant onExplore={onEnterApp} />
    </div>
  );
}
