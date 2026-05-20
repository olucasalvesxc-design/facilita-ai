import { useEffect, useRef, ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  Search, ShoppingBag, CalendarDays, AlertTriangle, MapPin,
  MessageCircle, Star, TrendingUp, Shield, Zap, Users, ArrowRight,
  CheckCircle, Instagram, Phone,
} from 'lucide-react';

const OG = '#FF7A00';
const FONT = 'Syne, system-ui, sans-serif';

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add('landing-visible'); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`landing-reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full mb-4"
      style={{ color: OG, background: 'rgba(255,122,0,0.08)', border: '1px solid rgba(255,122,0,0.18)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      className="text-white font-black leading-none tracking-tighter"
      style={{ fontFamily: FONT, fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
    >
      {children}
    </h2>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    n: '01',
    icon: Search,
    title: 'Busque o que precisa',
    desc: 'Procure profissionais por categoria, nome ou localização. Filtre por avaliação e disponibilidade.',
    color: OG,
  },
  {
    n: '02',
    icon: MessageCircle,
    title: 'Contrate e agende',
    desc: 'Converse direto pelo chat, receba propostas e confirme o serviço em poucos segundos.',
    color: '#3b82f6',
  },
  {
    n: '03',
    icon: CheckCircle,
    title: 'Problema resolvido',
    desc: 'Acompanhe o andamento, avalie o profissional e construa um histórico de confiança.',
    color: '#22c55e',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 px-6 max-w-6xl mx-auto">
      <Reveal className="text-center mb-16">
        <SectionLabel>Como funciona</SectionLabel>
        <SectionTitle>
          Simples assim.<br />
          <span style={{ color: OG }}>3 passos</span> e resolvido.
        </SectionTitle>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-6">
        {HOW_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <Reveal key={i} delay={i * 120} className="relative">
              {/* Connector line (desktop) */}
              {i < HOW_STEPS.length - 1 && (
                <div
                  className="absolute top-10 -right-3 w-6 h-0.5 hidden md:block"
                  style={{ background: `linear-gradient(to right, rgba(255,122,0,0.3), transparent)` }}
                />
              )}
              <div
                className="landing-card h-full p-8 rounded-[32px] flex flex-col gap-5"
                style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* Step number */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg"
                    style={{ background: `${step.color}14`, border: `1px solid ${step.color}30`, color: step.color, fontFamily: FONT }}
                  >
                    {step.n}
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${step.color}12`, border: `1px solid ${step.color}25` }}
                  >
                    <Icon size={18} style={{ color: step.color }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-black text-xl mb-2 tracking-tight" style={{ fontFamily: FONT }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Search,
    title: 'Encontre profissionais',
    desc: 'Eletricistas, cabeleireiros, personal trainers e +50 categorias. Tudo perto de você.',
    size: 'md:col-span-2',
    accent: OG,
  },
  {
    icon: ShoppingBag,
    title: 'Marketplace local',
    desc: 'Profissionais vendem produtos diretamente. Compre com quem entende.',
    size: '',
    accent: '#3b82f6',
  },
  {
    icon: CalendarDays,
    title: 'Agendamento inteligente',
    desc: 'Horários em tempo real. Confirmação instantânea. Sem ligação, sem espera.',
    size: '',
    accent: '#a855f7',
  },
  {
    icon: AlertTriangle,
    title: 'Acesso SOS',
    desc: 'SAMU, Bombeiros, Polícia e emergências locais em um toque.',
    size: '',
    accent: '#ef4444',
  },
  {
    icon: MapPin,
    title: 'Por perto de você',
    desc: 'Geolocalização precisa. Veja o profissional no mapa e a distância em tempo real.',
    size: 'md:col-span-2',
    accent: '#22c55e',
  },
];

export function Features() {
  return (
    <section id="funcionalidades" className="py-24 px-6 max-w-6xl mx-auto">
      <Reveal className="text-center mb-16">
        <SectionLabel>Funcionalidades</SectionLabel>
        <SectionTitle>
          Tudo que você precisa,<br />
          <span style={{ color: OG }}>em um só lugar.</span>
        </SectionTitle>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <Reveal key={i} delay={i * 80} className={f.size}>
              <div
                className="landing-card group h-full p-7 rounded-[28px] cursor-default flex flex-col gap-4"
                style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ background: `${f.accent}14`, border: `1px solid ${f.accent}28` }}
                >
                  <Icon size={22} style={{ color: f.accent }} />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg mb-1.5 tracking-tight" style={{ fontFamily: FONT }}>
                    {f.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
                <div className="mt-auto flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all" style={{ color: f.accent }}>
                  Explorar <ArrowRight size={12} />
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ── Marketplace ───────────────────────────────────────────────────────────────

const PRODUCTS = [
  { name: 'Shampoo Profissional 1L', seller: 'Fernanda Costa', price: 89.90, old: 119.90, badge: 'Pro', cat: 'Cabelos', img: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop&auto=format' },
  { name: 'Kit Ferramentas Elétricas', seller: 'Lucas Mendes', price: 149.90, badge: 'Ultra', cat: 'Ferramentas', img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop&auto=format' },
  { name: 'Gel UV Profissional 30ml', seller: 'Juliana Lima', price: 59.90, old: 79.90, badge: 'Ultra', cat: 'Beleza', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop&auto=format' },
  { name: 'Plano de Treino 3 meses', seller: 'Ana Rodrigues', price: 120.00, badge: 'Ultra', cat: 'Fitness', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&auto=format' },
];

export function MarketplaceSection() {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <Reveal className="text-center mb-16">
        <SectionLabel>Marketplace</SectionLabel>
        <SectionTitle>
          Produtos locais,<br />
          <span style={{ color: OG }}>qualidade garantida.</span>
        </SectionTitle>
        <p className="text-gray-500 text-sm mt-4 max-w-md mx-auto leading-relaxed">
          Profissionais verificados vendem seus produtos diretamente. Sem intermediários.
        </p>
      </Reveal>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {PRODUCTS.map((p, i) => (
          <Reveal key={i} delay={i * 80}>
            <div className="landing-card group rounded-[24px] overflow-hidden" style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Image */}
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
                {/* Badge */}
                <div
                  className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg"
                  style={{ background: OG, color: 'white', fontFamily: FONT }}
                >{p.badge}</div>
                {/* Category */}
                <div className="absolute bottom-3 left-3 right-3 text-[10px] text-gray-300 font-bold uppercase tracking-wider">{p.cat}</div>
              </div>
              {/* Info */}
              <div className="p-4">
                <h4 className="text-white text-sm font-black tracking-tight mb-0.5 line-clamp-2" style={{ fontFamily: FONT }}>{p.name}</h4>
                <p className="text-gray-600 text-[11px] mb-3">por {p.seller}</p>
                <div className="flex items-baseline gap-2">
                  {p.old && <span className="text-gray-600 text-[10px] line-through">R$ {p.old.toFixed(2).replace('.', ',')}</span>}
                  <span className="font-black text-base" style={{ color: OG, fontFamily: FONT }}>R$ {p.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <button
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-white transition-all active:scale-95"
                  style={{ background: '#25D366', boxShadow: '0 4px 16px rgba(37,211,102,0.2)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  Ver no WhatsApp
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

const PRO_BENEFITS = [
  { icon: TrendingUp, text: 'Receba novos clientes todo dia' },
  { icon: Users, text: 'Gerencie sua fila de atendimento' },
  { icon: Star, text: 'Construa sua reputação com avaliações' },
  { icon: ShoppingBag, text: 'Venda produtos direto pela plataforma' },
  { icon: Shield, text: 'Perfil verificado com selo de confiança' },
  { icon: Zap, text: 'Destaque nas buscas com plano Ultra' },
];

export function ForProfessionals({ onSignUp }: { onSignUp?: () => void }) {
  return (
    <section id="profissionais" className="py-24 px-6 relative overflow-hidden">
      {/* Dark accent bg */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #080400 0%, #050505 60%, #0a0500 100%)' }}
      />
      <div
        className="absolute left-0 top-0 bottom-0 w-px"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,122,0,0.3), transparent)' }}
      />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,122,0,0.15), transparent)' }} />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <Reveal>
            <SectionLabel>Para profissionais</SectionLabel>
            <SectionTitle>
              Você presta serviço<br />
              e quer <span style={{ color: OG }}>mais clientes?</span>
            </SectionTitle>
            <p className="text-gray-500 text-sm leading-relaxed mt-6 mb-8 max-w-sm">
              Cadastre seu perfil, escolha seu plano e comece a receber pedidos hoje mesmo.
              Mais de 50 categorias de serviços disponíveis.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onSignUp}
                className="font-black uppercase text-sm tracking-widest text-white px-7 py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #FF7A00, #FF5500)',
                  boxShadow: '0 0 40px rgba(255,122,0,0.25)',
                  fontFamily: FONT,
                }}
              >
                Quero ser profissional <ArrowRight size={16} />
              </button>
              <button
                className="font-bold text-sm text-gray-400 px-7 py-4 rounded-2xl border transition-all hover:border-orange-500/30 hover:text-white"
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
              >
                Ver os planos
              </button>
            </div>
          </Reveal>

          {/* Right: benefits grid */}
          <div className="grid grid-cols-2 gap-3">
            {PRO_BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <Reveal key={i} delay={i * 70}>
                  <div
                    className="landing-card p-5 rounded-2xl flex items-start gap-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'rgba(255,122,0,0.1)', border: '1px solid rgba(255,122,0,0.2)' }}
                    >
                      <Icon size={14} style={{ color: OG }} />
                    </div>
                    <span className="text-gray-400 text-xs font-medium leading-relaxed">{b.text}</span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Demo Section ──────────────────────────────────────────────────────────────

export function DemoSection({ onExplore }: { onExplore?: () => void }) {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <Reveal>
        <div
          className="rounded-[40px] p-10 sm:p-16 text-center relative overflow-hidden"
          style={{ background: '#0c0c0c', border: '1px solid rgba(255,122,0,0.12)' }}
        >
          {/* Glow bg */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,122,0,0.06) 0%, transparent 70%)' }}
          />
          <div className="relative">
            <SectionLabel>Demo gratuita</SectionLabel>
            <h2
              className="text-white font-black leading-none tracking-tighter mb-4"
              style={{ fontFamily: FONT, fontSize: 'clamp(2rem, 5vw, 3rem)' }}
            >
              Explore o app<br />
              <span style={{ color: OG }}>sem criar conta.</span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto mb-8">
              Navegue pelos profissionais, produtos e funcionalidades antes de se cadastrar.
            </p>
            <button
              onClick={onExplore}
              className="font-black uppercase text-sm tracking-widest text-white px-10 py-4 rounded-2xl transition-all active:scale-95 inline-flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #FF7A00, #FF5500)',
                boxShadow: '0 0 60px rgba(255,122,0,0.3), 0 10px 40px rgba(0,0,0,0.3)',
                fontFamily: FONT,
              }}
            >
              <Zap size={18} />
              Explorar o app agora
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

export function FinalCTA({ onExplore }: { onExplore?: () => void }) {
  return (
    <section className="py-32 px-6 text-center relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,122,0,0.07) 0%, transparent 70%)' }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,122,0,0.2), transparent)' }}
      />
      <Reveal className="relative max-w-3xl mx-auto">
        <motion.div
          animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-20 h-20 rounded-[26px] mx-auto mb-8 flex items-center justify-center"
          style={{ background: OG, boxShadow: `0 0 80px rgba(255,122,0,0.4)` }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </motion.div>

        <h2
          className="font-black leading-none tracking-tighter mb-4"
          style={{ fontFamily: FONT, fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: 'white' }}
        >
          Comece a aparecer<br />
          <span style={{ color: OG }}>hoje.</span>
        </h2>
        <p className="text-gray-500 leading-relaxed max-w-md mx-auto mb-10">
          Milhares de pessoas procurando serviços perto delas. Esteja visível para elas agora.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onExplore}
            className="w-full sm:w-auto font-black uppercase text-sm tracking-widest text-white px-10 py-4 rounded-2xl transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #FF7A00, #FF5500)',
              boxShadow: '0 0 60px rgba(255,122,0,0.35), 0 10px 30px rgba(0,0,0,0.3)',
              fontFamily: FONT,
            }}
          >
            Entrar no Facilita Aí
          </button>
          <button
            className="w-full sm:w-auto font-bold text-sm text-gray-400 px-10 py-4 rounded-2xl border transition-all hover:border-orange-500/30 hover:text-white"
            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
            onClick={() => document.getElementById('profissionais')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Sou profissional
          </button>
        </div>
      </Reveal>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

export function LandingFooter() {
  return (
    <footer
      className="border-t px-6 py-12"
      style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#030303' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[14px] flex items-center justify-center"
              style={{ background: OG, boxShadow: `0 0 20px rgba(255,122,0,0.35)` }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div>
              <div className="font-black text-white text-lg tracking-tight" style={{ fontFamily: FONT }}>
                Facilita<span style={{ color: OG }}>Aí</span>
              </div>
              <div className="text-gray-600 text-[10px] uppercase tracking-widest">A plataforma que resolve</div>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            {['Termos de uso', 'Privacidade', 'Suporte'].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Instagram size={16} />
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Phone size={16} />
            </a>
          </div>
        </div>

        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-700"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span>© {new Date().getFullYear()} Facilita Aí. Todos os direitos reservados.</span>
          <span className="flex items-center gap-1.5">
            Feito com <span style={{ color: OG }}>♥</span> no Brasil
          </span>
        </div>
      </div>
    </footer>
  );
}
