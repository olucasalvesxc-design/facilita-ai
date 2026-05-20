import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Instagram } from 'lucide-react';
import { PLAN_CHECKOUT_URLS } from '../../constants';

const OG = '#FF7A00';
const GOLD = '#F59E0B';
const DISPLAY = '"Bricolage Grotesque", system-ui, sans-serif';
const BODY = '"DM Sans", system-ui, sans-serif';

// ── Reveal ────────────────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = '', style = {} }: { children: ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.classList.add('landing-visible');
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`landing-reveal ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
      color: OG, fontFamily: BODY,
      background: 'rgba(255,122,0,0.08)', border: '1px solid rgba(255,122,0,0.18)',
      borderRadius: 100, padding: '5px 14px', marginBottom: 20,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: OG, display: 'inline-block' }} />
      {children}
    </span>
  );
}

function H2({ children, style = {} }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{
      fontFamily: DISPLAY, fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
      fontWeight: 800, color: 'white', lineHeight: 1.05, letterSpacing: '-0.03em',
      ...style,
    }}>{children}</h2>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '01', color: OG,
    title: 'Busque o que precisa',
    desc: 'Procure profissionais por categoria, nome ou localização. Filtre por avaliação e disponibilidade.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    n: '02', color: '#3b82f6',
    title: 'Contrate e agende',
    desc: 'Converse direto pelo chat, receba propostas e confirme o serviço em segundos. Sem ligação.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    n: '03', color: '#22c55e',
    title: 'Problema resolvido',
    desc: 'Acompanhe o andamento, avalie o profissional e construa um histórico de confiança.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <Reveal style={{ marginBottom: 64 }}>
        <Tag>Como funciona</Tag>
        <H2>
          Simples assim.<br />
          <span style={{ color: OG }}>3 passos</span> e pronto.
        </H2>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {STEPS.map((s, i) => (
          <Reveal key={i} delay={i * 100}>
            <div
              className="landing-card"
              style={{
                background: '#0b0b0b', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 24, padding: '36px 32px', height: '100%',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Large step number as watermark */}
              <div style={{
                position: 'absolute', top: -10, right: 16,
                fontSize: 96, fontWeight: 900, color: s.color,
                opacity: 0.04, fontFamily: DISPLAY, lineHeight: 1, userSelect: 'none',
              }}>{s.n}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: s.color + '14', border: `1px solid ${s.color}25`,
                  color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{s.icon}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: BODY }}>Passo {s.n}</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 10, letterSpacing: '-0.02em', fontFamily: DISPLAY }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', lineHeight: 1.7, fontFamily: BODY }}>{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Features — Bento Grid ─────────────────────────────────────────────────────

const FEATURES = [
  {
    col: 'md:col-span-2', accent: OG,
    title: 'Encontre profissionais',
    desc: '+50 categorias. Eletricistas, cabeleireiros, personal trainers e muito mais — tudo perto de você.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    extra: (
      <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
        {['Eletricista', 'Pintor', 'Cabeleireira', 'Personal', '+47'].map(c => (
          <span key={c} style={{ fontSize: 10, fontWeight: 600, color: OG, background: 'rgba(255,122,0,0.1)', border: '1px solid rgba(255,122,0,0.2)', borderRadius: 100, padding: '3px 10px', fontFamily: BODY }}>{c}</span>
        ))}
      </div>
    ),
  },
  {
    col: '', accent: '#3b82f6',
    title: 'Marketplace local',
    desc: 'Profissionais vendem produtos diretamente. Compre com quem entende.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
  },
  {
    col: '', accent: '#a855f7',
    title: 'Agendamento inteligente',
    desc: 'Horários em tempo real. Confirmação instantânea.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  },
  {
    col: '', accent: '#ef4444',
    title: 'SOS Emergência',
    desc: 'SAMU, Bombeiros, Polícia — serviços de emergência em um toque.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  },
  {
    col: 'md:col-span-2', accent: '#22c55e',
    title: 'Por perto de você',
    desc: 'Geolocalização precisa. Veja o profissional no mapa e a distância em tempo real.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    extra: (
      <div style={{ marginTop: 16, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: BODY }}>Profissional a <span style={{ color: '#22c55e', fontWeight: 700 }}>0,3 km</span> de distância</span>
      </div>
    ),
  },
];

export function Features() {
  return (
    <section id="funcionalidades" style={{ padding: '0 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
      <Reveal style={{ marginBottom: 64 }}>
        <Tag>Funcionalidades</Tag>
        <H2>
          Tudo que você precisa,<br />
          <span style={{ color: OG }}>em um só lugar.</span>
        </H2>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <Reveal key={i} delay={i * 70} className={f.col}>
            <div
              className="landing-card group h-full"
              style={{
                background: '#0b0b0b', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 22, padding: '28px 26px', cursor: 'default',
              }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 14,
                background: f.accent + '12', border: `1px solid ${f.accent}22`,
                color: f.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18, transition: 'transform 0.25s ease',
              }} className="group-hover:scale-110">{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: '-0.02em', fontFamily: DISPLAY }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.38)', lineHeight: 1.65, fontFamily: BODY }}>{f.desc}</p>
              {f.extra}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Marketplace ───────────────────────────────────────────────────────────────

const PRODUCTS = [
  { name: 'Shampoo Profissional 1L', seller: 'Fernanda Costa', price: 89.90, old: 119.90, cat: 'Cabelos', img: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop&auto=format' },
  { name: 'Kit Ferramentas Elétricas', seller: 'Lucas Mendes', price: 149.90, cat: 'Ferramentas', img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop&auto=format' },
  { name: 'Gel UV Profissional 30ml', seller: 'Juliana Lima', price: 59.90, old: 79.90, cat: 'Beleza', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop&auto=format' },
  { name: 'Plano de Treino 3 meses', seller: 'Ana Rodrigues', price: 120.00, cat: 'Fitness', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&auto=format' },
];

export function MarketplaceSection() {
  return (
    <section style={{ padding: '0 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
      <Reveal style={{ marginBottom: 64 }}>
        <Tag>Marketplace</Tag>
        <H2>
          Produtos locais,<br />
          <span style={{ color: OG }}>qualidade garantida.</span>
        </H2>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15, marginTop: 12, maxWidth: 420, lineHeight: 1.6, fontFamily: BODY }}>
          Profissionais verificados vendem seus produtos diretamente. Sem intermediários.
        </p>
      </Reveal>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {PRODUCTS.map((p, i) => (
          <Reveal key={i} delay={i * 80}>
            <div className="landing-card group rounded-[20px] overflow-hidden" style={{ background: '#0b0b0b', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1' }}>
                <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%)' }} />
                <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: BODY }}>{p.cat}</span>
                </div>
              </div>
              <div style={{ padding: '14px 14px 16px' }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: 'white', marginBottom: 2, letterSpacing: '-0.01em', lineHeight: 1.3, fontFamily: DISPLAY }}>{p.name}</h4>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 10, fontFamily: BODY }}>por {p.seller}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  {p.old && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through', fontFamily: BODY }}>R$ {p.old.toFixed(2).replace('.', ',')}</span>}
                  <span style={{ fontSize: 15, fontWeight: 800, color: OG, fontFamily: DISPLAY }}>R$ {p.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <button
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-white transition-all active:scale-95"
                  style={{ background: '#25D366', fontFamily: DISPLAY, boxShadow: '0 4px 16px rgba(37,211,102,0.15)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                  WhatsApp
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── For Professionals ─────────────────────────────────────────────────────────

const PRO_PERKS = [
  'Receba novos clientes todo dia',
  'Gerencie sua fila de atendimento',
  'Construa reputação com avaliações',
  'Venda produtos pela plataforma',
  'Perfil verificado com selo de confiança',
  'Destaque nas buscas com plano Ultra',
];

export function ForProfessionals({ onSignUp }: { onSignUp?: () => void }) {
  return (
    <section
      id="profissionais"
      style={{ position: 'relative', overflow: 'hidden', padding: '100px 24px' }}
    >
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #080400 0%, #050505 50%, #090400 100%)' }} />
      <div style={{ position: 'absolute', left: 0, top: '10%', bottom: '10%', width: 2, background: 'linear-gradient(to bottom, transparent, rgba(255,122,0,0.25), transparent)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,122,0,0.12), transparent)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 0% 50%, rgba(255,122,0,0.04) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto' }}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <Tag>Para profissionais</Tag>
            <H2>
              Você presta serviço<br />
              e quer <span style={{ color: OG }}>mais clientes?</span>
            </H2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, marginTop: 20, marginBottom: 36, maxWidth: 380, fontFamily: BODY }}>
              Cadastre seu perfil, escolha seu plano e comece a receber pedidos hoje mesmo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onSignUp}
                className="font-black uppercase text-sm tracking-widest text-white px-7 py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${OG}, #FF5500)`, boxShadow: `0 0 50px rgba(255,122,0,0.2)`, fontFamily: DISPLAY }}
              >
                Quero ser profissional <ArrowRight size={15} />
              </button>
              <button
                className="font-medium text-sm px-7 py-4 rounded-2xl transition-all hover:text-white"
                style={{ color: 'rgba(255,255,255,0.3)', fontFamily: BODY, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
              >
                Ver os planos
              </button>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-3">
            {PRO_PERKS.map((perk, i) => (
              <Reveal key={i} delay={i * 65}>
                <div
                  className="landing-card flex items-start gap-3 p-5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(255,122,0,0.1)', border: '1px solid rgba(255,122,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={OG} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, fontFamily: BODY }}>{perk}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Demo Section ──────────────────────────────────────────────────────────────

export function DemoSection({ onExplore }: { onExplore?: () => void }) {
  return (
    <section style={{ padding: '0 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
      <Reveal>
        <div
          className="rounded-[32px] p-10 sm:p-16 text-center relative overflow-hidden"
          style={{ background: '#0b0b0b', border: '1px solid rgba(255,122,0,0.1)' }}
        >
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 70% at 50% 110%, rgba(255,122,0,0.06) 0%, transparent 70%)' }} />
          <div style={{ position: 'relative' }}>
            <Tag>Demo gratuita</Tag>
            <H2 style={{ marginBottom: 14 }}>
              Explore o app<br />
              <span style={{ color: OG }}>sem criar conta.</span>
            </H2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', lineHeight: 1.65, maxWidth: 380, margin: '0 auto 36px', fontFamily: BODY }}>
              Navegue pelos profissionais, produtos e funcionalidades antes de se cadastrar.
            </p>
            <button
              onClick={onExplore}
              className="font-black uppercase text-sm tracking-widest text-white px-10 py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 inline-flex items-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${OG}, #FF5500)`,
                boxShadow: '0 0 60px rgba(255,122,0,0.25), 0 8px 40px rgba(0,0,0,0.3)',
                fontFamily: DISPLAY,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              Explorar o app agora
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── Trust / Proof ─────────────────────────────────────────────────────────────

const STATS = [
  { value: '500+', label: 'Profissionais verificados' },
  { value: '4.8★', label: 'Avaliação média' },
  { value: 'WhatsApp', label: 'Contato direto' },
  { value: 'GPS', label: 'Próximos a você' },
];

const TESTIMONIALS = [
  {
    name: 'Fernanda Costa', role: 'Cabeleireira',
    text: 'Comecei a receber clientes em menos de uma semana. O agendamento online mudou minha rotina completamente.',
    stars: 5,
  },
  {
    name: 'Lucas Mendes', role: 'Eletricista',
    text: 'A visibilidade que o Ultra me deu é incrível. Minha agenda está sempre cheia e ainda vendo produtos pelo app.',
    stars: 5,
  },
  {
    name: 'Ana Rodrigues', role: 'Personal Trainer',
    text: 'Vendo planos de treino e consigo novos alunos pelo marketplace. Melhor investimento que fiz no meu negócio.',
    stars: 5,
  },
];

export function TrustSection() {
  return (
    <section style={{ padding: '0 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Stats */}
      <Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: 56 }}>
          {STATS.map((s, i) => (
            <div
              key={i}
              className="landing-card"
              style={{ background: '#0b0b0b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px 20px', textAlign: 'center' }}
            >
              <div style={{ fontSize: 26, fontWeight: 900, color: OG, fontFamily: DISPLAY, marginBottom: 6, letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: BODY, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Testimonials */}
      <div className="grid md:grid-cols-3 gap-4">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={i} delay={i * 80}>
            <div
              className="landing-card"
              style={{ background: '#0b0b0b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 22, padding: '26px 24px', height: '100%' }}
            >
              <div style={{ fontSize: 14, color: GOLD, marginBottom: 14, letterSpacing: 2 }}>{'★'.repeat(t.stars)}</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 20, fontFamily: BODY }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,122,0,0.12)', border: '1px solid rgba(255,122,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: OG, fontFamily: DISPLAY }}>{t.name[0]}</span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: DISPLAY }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: BODY }}>{t.role}</div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Plans ─────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'start', name: 'Start', price: '9,90', color: '#9ca3af',
    desc: 'Para começar sua presença digital',
    features: ['Perfil profissional', 'Até 4 posts', 'Produtos no marketplace', 'WhatsApp no perfil'],
    cta: 'Começar agora',
    url: PLAN_CHECKOUT_URLS.start,
  },
  {
    id: 'pro', name: 'Pro', price: '27,90', color: OG,
    badge: 'Mais popular', highlight: true,
    desc: 'Para profissionais que querem crescer',
    features: ['Até 20 posts', 'Agenda online', 'Link público de agendamento', 'Mais visibilidade nas buscas'],
    cta: 'Escolher Pro',
    url: PLAN_CHECKOUT_URLS.pro,
  },
  {
    id: 'ultra', name: 'Ultra', price: '87,90', color: GOLD,
    badge: 'Premium', premium: true,
    desc: 'Para quem quer ser referência',
    features: ['Posts ilimitados', 'Perfil verificado ✓', 'Destaque na home', 'Prioridade nas buscas'],
    cta: 'Ser Ultra',
    url: PLAN_CHECKOUT_URLS.ultra,
  },
] as const;

export function PlansSection() {
  return (
    <section id="planos" style={{ padding: '0 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
      <Reveal style={{ textAlign: 'center', marginBottom: 56 }}>
        <Tag>Planos</Tag>
        <H2>
          Escolha como quer<br />
          <span style={{ color: OG }}>crescer.</span>
        </H2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', marginTop: 12, fontFamily: BODY }}>
          Comece com 7 dias grátis. Sem cartão de crédito.
        </p>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-5 items-end">
        {PLANS.map((plan, i) => {
          const isHighlight = 'highlight' in plan && plan.highlight;
          const isPremium = 'premium' in plan && plan.premium;
          const badge = 'badge' in plan ? plan.badge : undefined;

          return (
            <Reveal key={plan.id} delay={i * 100}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: isHighlight
                    ? 'rgba(255,122,0,0.05)'
                    : isPremium ? 'rgba(245,158,11,0.04)' : '#0b0b0b',
                  border: `1px solid ${isHighlight ? 'rgba(255,122,0,0.35)' : isPremium ? 'rgba(245,158,11,0.28)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 24,
                  padding: isHighlight ? '36px 28px' : '28px 24px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isHighlight
                    ? '0 0 80px rgba(255,122,0,0.07)'
                    : isPremium ? '0 0 80px rgba(245,158,11,0.05)' : 'none',
                }}
              >
                {/* Glow top line */}
                {(isHighlight || isPremium) && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right, transparent, ${plan.color}, transparent)`, opacity: 0.6 }} />
                )}

                {/* Badge */}
                {badge && (
                  <div style={{
                    position: 'absolute', top: isHighlight ? 18 : 14, right: 18,
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', padding: '4px 10px', borderRadius: 100,
                    background: `${plan.color}15`, color: plan.color,
                    border: `1px solid ${plan.color}30`, fontFamily: BODY,
                  }}>{badge}</div>
                )}

                {/* Name */}
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: plan.color, fontFamily: DISPLAY, letterSpacing: '-0.02em', marginBottom: 4 }}>{plan.name}</h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: BODY }}>{plan.desc}</p>
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 28 }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: BODY }}>R$</span>
                  <span style={{ fontSize: 42, fontWeight: 900, color: 'white', fontFamily: DISPLAY, letterSpacing: '-0.04em', lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: BODY }}>/mês</span>
                </div>

                {/* Features */}
                <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${plan.color}14`, border: `1px solid ${plan.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: BODY }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <motion.a
                  href={plan.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '13px 0', borderRadius: 14,
                    background: isHighlight
                      ? `linear-gradient(135deg, ${OG}, #FF5500)`
                      : isPremium
                        ? `linear-gradient(135deg, ${GOLD}, #D97706)`
                        : 'transparent',
                    border: isHighlight || isPremium ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    color: 'white', fontSize: 12, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    textDecoration: 'none', fontFamily: DISPLAY,
                    boxShadow: isHighlight
                      ? '0 0 30px rgba(255,122,0,0.18)'
                      : isPremium ? '0 0 30px rgba(245,158,11,0.12)' : 'none',
                  }}
                >
                  {plan.cta}
                </motion.a>
              </motion.div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'O Facilita Aí é gratuito para usuários?',
    a: 'Sim! Para quem busca serviços, o app é 100% gratuito. Você cria sua conta, explora profissionais, agenda e compra sem pagar nada.',
  },
  {
    q: 'Como me torno profissional?',
    a: 'Basta criar uma conta, completar seu perfil profissional e escolher um plano. Em minutos você já está visível para clientes na sua região.',
  },
  {
    q: 'Posso vender produtos pelo app?',
    a: 'Sim! Nos planos Start, Pro e Ultra você pode listar produtos no marketplace e vender diretamente, com contato via WhatsApp integrado.',
  },
  {
    q: 'Como funciona o agendamento?',
    a: 'Nos planos Pro e Ultra você tem uma agenda online com horários em tempo real. Clientes agendam direto pelo app e você recebe notificação instantânea.',
  },
  {
    q: 'Como funciona o SOS?',
    a: 'A seção SOS conecta você rapidamente com serviços de emergência (SAMU, Bombeiros, Polícia) e profissionais disponíveis urgentemente na sua região.',
  },
  {
    q: 'Preciso baixar um aplicativo?',
    a: 'Não! O Facilita Aí é um PWA — funciona direto no navegador do celular ou computador. Você pode instalar na tela inicial sem precisar da App Store ou Play Store.',
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section style={{ padding: '0 24px 100px', maxWidth: 780, margin: '0 auto' }}>
      <Reveal style={{ textAlign: 'center', marginBottom: 56 }}>
        <Tag>Dúvidas frequentes</Tag>
        <H2>Perguntas <span style={{ color: OG }}>frequentes</span></H2>
      </Reveal>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {FAQ_ITEMS.map((item, i) => (
          <Reveal key={i} delay={i * 45}>
            <div
              style={{
                background: '#0b0b0b',
                border: `1px solid ${open === i ? 'rgba(255,122,0,0.22)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 16, overflow: 'hidden',
                transition: 'border-color 0.3s ease',
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', padding: '18px 22px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{
                  fontSize: 14, fontWeight: 700,
                  color: open === i ? OG : 'white',
                  fontFamily: DISPLAY, letterSpacing: '-0.01em',
                  transition: 'color 0.3s', paddingRight: 16,
                }}>
                  {item.q}
                </span>
                <motion.span
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ color: open === i ? OG : 'rgba(255,255,255,0.25)', flexShrink: 0, fontSize: 16 }}
                >↓</motion.span>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ padding: '0 22px 20px', fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, fontFamily: BODY }}>
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

export function FinalCTA({ onExplore, onSignUp }: { onExplore?: () => void; onSignUp?: () => void }) {
  return (
    <section style={{ padding: '80px 24px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,122,0,0.06) 0%, transparent 65%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,122,0,0.15), transparent)' }} />

      <Reveal style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
        <motion.div
          style={{ width: 72, height: 72, borderRadius: 22, background: OG, margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 80px rgba(255,122,0,0.35)' }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </motion.div>

        <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.4rem, 6.5vw, 4.5rem)', fontWeight: 800, color: 'white', lineHeight: 1.05, letterSpacing: '-0.035em', marginBottom: 16 }}>
          Comece a aparecer para quem<br />
          está <span style={{ color: OG }}>perto de você.</span>
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', lineHeight: 1.65, maxWidth: 400, margin: '0 auto 40px', fontFamily: BODY }}>
          Milhares de pessoas procurando serviços na sua região agora mesmo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.button
            onClick={onSignUp}
            whileHover={{ scale: 1.03, boxShadow: '0 0 80px rgba(255,122,0,0.4), 0 8px 30px rgba(0,0,0,0.3)' }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto font-black uppercase text-sm tracking-widest text-white px-9 py-4 rounded-2xl"
            style={{ background: `linear-gradient(135deg, ${OG}, #FF5500)`, boxShadow: '0 0 50px rgba(255,122,0,0.25)', fontFamily: DISPLAY, border: 'none', cursor: 'pointer' }}
          >
            Criar conta
          </motion.button>
          <motion.button
            onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}
            whileHover={{ borderColor: 'rgba(255,122,0,0.35)', color: 'white' }}
            className="w-full sm:w-auto font-medium text-sm px-9 py-4 rounded-2xl"
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: BODY, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer', transition: 'all 0.25s' }}
          >
            Ver planos
          </motion.button>
          <motion.button
            onClick={onExplore}
            whileHover={{ borderColor: 'rgba(255,122,0,0.35)', color: 'white' }}
            className="w-full sm:w-auto font-medium text-sm px-9 py-4 rounded-2xl"
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: BODY, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer', transition: 'all 0.25s' }}
          >
            Explorar demo
          </motion.button>
        </div>
      </Reveal>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

export function LandingFooter() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#030303', padding: '48px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: OG, boxShadow: '0 0 20px rgba(255,122,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', fontFamily: DISPLAY }}>
                Facilita<span style={{ color: OG }}>Aí</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: BODY }}>A plataforma que resolve</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6" style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: BODY }}>
            {['Termos de uso', 'Privacidade', 'Suporte'].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <a
              href="https://instagram.com/facilitaai.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-all hover:scale-110"
              style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Instagram size={15} />
            </a>
          </div>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', justifyContent: 'space-between' }}
          className="sm:flex-row"
        >
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: BODY }}>© {new Date().getFullYear()} Facilita Aí. Todos os direitos reservados.</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: BODY }}>Feito com <span style={{ color: OG }}>♥</span> no Brasil</span>
        </div>
      </div>
    </footer>
  );
}
