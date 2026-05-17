import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Zap, Star, Users, Briefcase, CheckCircle, 
  ChevronRight, ChevronLeft, MessageSquare, HelpCircle, 
  Mail, MapPin, Phone, Instagram, Globe, HelpCircle as FaqIcon,
  Wrench, Hammer, Droplet, Flashlight, Target, LayoutGrid, Search
} from 'lucide-react';

// --- STATS SECTION ---
export const StatsSection = () => {
  const stats = [
    { id: 'stat-services', label: 'Serviços Realizados', value: '12k+', icon: Zap, color: 'text-orange-500' },
    { id: 'stat-pros', label: 'Profissionais Ativos', value: '450+', icon: Briefcase, color: 'text-blue-500' },
    { id: 'stat-clients', label: 'Clientes Satisfeitos', value: '8k+', icon: Users, color: 'text-green-500' },
    { id: 'stat-rating', label: 'Avaliação Média', value: '4.9/5', icon: Star, color: 'text-yellow-500' },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-12 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#121826] border border-white/5 p-4 sm:p-8 rounded-3xl hover:border-orange-500/30 transition-all group"
          >
            <div className={`p-2 sm:p-3 bg-white/5 rounded-2xl w-fit mb-3 sm:mb-6 group-hover:scale-110 transition-transform ${stat.color}`}>
              <stat.icon size={20} className="sm:size-32" />
            </div>
            <h4 className="text-xl sm:text-4xl font-black text-white leading-none">{stat.value}</h4>
            <p className="text-gray-500 text-[8px] sm:text-xs font-black uppercase tracking-[0.2em] mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// --- HOW IT WORKS ---
export const HowItWorks = () => {
  const steps = [
    { id: 'step-1', title: 'Encontre o Pro', desc: 'Busque por categoria e compare perfis, fotos e avaliações reais.', icon: Wrench },
    { id: 'step-2', title: 'Solicite Orçamento', desc: 'Descreva o serviço e receba propostas personalizadas via chat.', icon: MessageSquare },
    { id: 'step-3', title: 'Contrate e Relaxe', desc: 'Agende o serviço e pague com segurança após a conclusão.', icon: CheckCircle },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-12 py-16 bg-gradient-to-b from-transparent to-orange-500/[0.02]">
      <div className="text-center mb-12 sm:mb-20">
        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-3">Como Funciona</h2>
        <p className="text-gray-500 text-xs sm:text-lg font-medium opacity-60">Sua manutenção resolvida em 3 passos simples</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-12 relative">
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-white/5 -z-10" />
        {steps.map((step, i) => (
          <motion.div 
            key={step.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center p-6 sm:p-12 bg-[#121826] border border-white/5 rounded-[32px] sm:rounded-[48px] relative hover:border-orange-500/20 hover:shadow-2xl transition-all group"
          >
            <div className="absolute -top-3 -left-3 sm:-top-5 sm:-left-5 w-10 h-10 sm:w-14 sm:h-14 bg-orange-500 rounded-2xl sm:rounded-3xl flex items-center justify-center font-black text-white text-base sm:text-xl shadow-xl shadow-orange-500/20 z-10 group-hover:scale-110 transition-transform">
              {i + 1}
            </div>
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/5 rounded-[24px] sm:rounded-[32px] flex items-center justify-center mb-6 sm:mb-8 text-orange-500 group-hover:rotate-6 transition-transform">
              <step.icon size={32} className="sm:size-48" />
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white mb-3 sm:mb-4 uppercase tracking-tight">{step.title}</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-[240px]">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// --- TESTIMONIALS ---
export const Testimonials = () => {
  const list = [
    { id: 'test-1', name: 'Ricardo Silva', role: 'Cliente', content: 'Consegui um eletricista em menos de 10 minutos. O serviço foi impecável!', photo: 'https://i.pravatar.cc/150?u=1' },
    { id: 'test-2', name: 'Ana Oliveira', role: 'Profissional', content: 'A plataforma triplicou minha agenda de serviços. Indispensável para pros!', photo: 'https://i.pravatar.cc/150?u=2' },
    { id: 'test-3', name: 'Marcos Souza', role: 'Cliente', content: 'Segurança e agilidade que eu não encontrava em lugar nenhum. Nota 10.', photo: 'https://i.pravatar.cc/150?u=3' },
  ];

  return (
    <section className="px-4 py-20 bg-orange-500/[0.03]">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-2">Comunidade Viva</h2>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">O que dizem sobre nós</p>
      </div>
      <div className="flex overflow-x-auto gap-4 pb-8 no-scrollbar snap-x px-4 -mx-4 h-full">
          {list.map((t, i) => (
            <motion.div 
              key={t.id}
              whileHover={{ y: -5 }}
              className="shrink-0 w-[280px] sm:w-[350px] snap-center p-6 sm:p-10 bg-[#121826] border border-white/5 rounded-[32px] sm:rounded-[48px] flex flex-col gap-6 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={t.photo} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/5" alt={t.name} referrerPolicy="no-referrer" />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-[#121826]" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm tracking-tight">{t.name}</h4>
                  <p className="text-orange-500 text-[9px] font-black uppercase tracking-widest leading-none mt-1.5">{t.role}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => <Star key={`star-${s}`} size={10} className="fill-yellow-500 text-yellow-500" />)}
              </div>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed italic opacity-80">"{t.content}"</p>
            </motion.div>
          ))}
      </div>
    </section>
  );
};

// --- QUICK TIPS / BLOG ---
export const QuickTips = () => {
  const tips = [
    { id: 'tip-energy', title: 'Economize energia no verão', category: 'Dicas', icon: Flashlight, color: 'text-yellow-500' },
    { id: 'tip-leaks', title: 'Detectando vazamentos ocultos', category: 'Hidráulica', icon: Droplet, color: 'text-blue-500' },
  ];

  return (
    <section className="px-4 py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Dicas Facilita</h2>
          <p className="text-gray-500 text-xs mt-1">Cuidando da sua casa</p>
        </div>
        <button className="text-orange-500 font-black text-[10px] uppercase tracking-widest">Ver Todas</button>
      </div>
      <div className="space-y-4">
        {tips.map((tip, i) => (
          <motion.div 
            key={tip.id}
            className="flex items-center gap-4 p-5 bg-[#121826] border border-white/5 rounded-3xl"
          >
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
              <tip.icon size={24} className={tip.color} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">{tip.category}</span>
              <h3 className="text-sm font-bold text-white mt-0.5">{tip.title}</h3>
              <p className="text-gray-600 text-[10px] mt-1 line-clamp-1">Passos simples para manter tudo em ordem.</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// --- FAQ SECTION ---
export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { id: 'faq-pay', q: 'Como faço para pagar o serviço?', a: 'O pagamento é negociado diretamente com o profissional via chat. Recomendamos utilizar métodos seguros e só pagar após a conclusão do serviço.' },
    { id: 'faq-verify', q: 'Os profissionais são verificados?', a: 'Sim, incentivamos a verificação de identidade. Verifique o selo de "Verificado" no perfil do profissional para maior segurança.' },
    { id: 'faq-quality', q: 'E se o serviço não for bem feito?', a: 'Você pode avaliar o profissional e entrar em contato conosco. Nossa equipe mediará conflitos para garantir a melhor experiência possível.' },
    { id: 'faq-register', q: 'Como me cadastrar como profissional?', a: 'Vá no seu perfil e clique em "Quero ser um Profissional". Preencha seus dados e pronto!' },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-12 py-16 bg-[#121826]/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <FaqIcon size={32} className="text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Dúvidas Frequentes</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={faq.id} className="border border-white/5 rounded-2xl overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left p-6 flex items-center justify-between hover:bg-white/5 transition-all"
              >
                <span className="font-bold text-white tracking-tight">{faq.q}</span>
                <ChevronRight size={18} className={`text-orange-500 transition-transform ${openIndex === i ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-white/[0.02]"
                  >
                    <div className="p-6 pt-0 text-gray-500 text-sm leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- FOOTER ---
export const BrandShield = () => {
  const cards = [
    { id: 'shield-security', icon: ShieldCheck, title: 'Segurança Total', desc: 'Profissionais verificados e monitorados constante.' },
    { id: 'shield-quality', icon: Star, title: 'Qualidade Facilita', desc: 'Garantimos o padrão de atendimento em todos os serviços.' },
    { id: 'shield-price', icon: Target, title: 'Preço Justo', desc: 'Orçamentos transparentes sem taxas escondidas.' }
  ];
  
  return (
    <section className="px-5 mb-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <div key={card.id} className="bg-[#121826] border border-white/5 rounded-3xl p-6 flex items-start gap-4 hover:border-orange-500/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all">
              <card.icon size={24} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase italic mb-1">{card.title}</h4>
              <p className="text-gray-500 text-[10px] font-medium leading-relaxed">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-[#070b13] border-t border-white/5 pt-20 pb-12 px-4 sm:px-6 lg:px-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/20">F</div>
            <span className="text-xl font-black text-white uppercase tracking-tighter">Facilita Aí</span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">A plataforma que conecta você aos melhores profissionais da sua região com agilidade e confiança.</p>
          <div className="flex items-center gap-4">
          {[
            { icon: Instagram, id: 'instagram', href: 'https://www.instagram.com/facilitaai.app' },
            { icon: Globe, id: 'globe', href: '#' },
            { icon: Mail, id: 'mail', href: '#' }
          ].map(({ icon: Icon, id, href }) => (
              <a key={id} href={href} target={href !== '#' ? '_blank' : undefined} rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-orange-500/10 transition-all border border-white/5">
                <Icon size={18} />
              </a>
          ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-6">Plataforma</h4>
          <ul className="space-y-4 text-gray-500 text-sm font-medium">
            <li className="hover:text-orange-500 cursor-pointer transition-colors">Como Funciona</li>
            <li className="hover:text-orange-500 cursor-pointer transition-colors">Buscar Profissionais</li>
            <li className="hover:text-orange-500 cursor-pointer transition-colors">Seja um Parceiro</li>
            <li className="hover:text-orange-500 cursor-pointer transition-colors">Área do Cliente</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-6">Suporte</h4>
          <ul className="space-y-4 text-gray-500 text-sm font-medium">
            <li className="hover:text-orange-500 cursor-pointer transition-colors">Central de Ajuda</li>
            <li className="hover:text-orange-500 cursor-pointer transition-colors">Segurança</li>
            <li className="hover:text-orange-500 cursor-pointer transition-colors">Termos de Uso</li>
            <li className="hover:text-orange-500 cursor-pointer transition-colors">Privacidade</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-6">Newsletter</h4>
          <p className="text-gray-500 text-sm mb-4">Receba dicas e ofertas no seu e-mail.</p>
          <form className="relative">
            <input 
              type="email" 
              placeholder="Seu e-mail" 
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-orange-500 transition-all"
            />
            <button className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-orange-500 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all">OK</button>
          </form>
        </div>
      </div>
      
      <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">© 2026 Facilita Aí — Todos os direitos reservados.</p>
        <div className="flex items-center gap-6 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
          <span className="hover:text-white cursor-pointer">Segurança</span>
          <span className="hover:text-white cursor-pointer">SLA</span>
          <span className="hover:text-white cursor-pointer">Cookies</span>
        </div>
      </div>
    </footer>
  );
};

// --- FEATURED SECTION ---
export const FeaturedCarousel = ({ professionals, onSelect, onChat }: any) => {
  const featured = professionals.filter((p: any) => p.rating >= 4.8).slice(0, 5);
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % featured.length);
  const prev = () => setIndex((prev) => (prev - 1 + featured.length) % featured.length);

  if (featured.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="flex items-end justify-between mb-4 sm:mb-10">
        <div>
          <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight">Destaque</h2>
          <p className="text-gray-500 text-[9px] sm:text-xs font-bold uppercase tracking-widest mt-1">Os melhores profissionais da semana</p>
        </div>
        <div className="flex gap-2 items-center">
          {featured.map((f: any) => (
            <div 
              key={`dot-${f.id}`} 
              className={`h-1 sm:h-1.5 rounded-full transition-all duration-500 ${featured[index].id === f.id ? 'w-4 sm:w-8 bg-orange-500' : 'w-1 sm:w-2 bg-white/10'}`} 
            />
          ))}
          <button onClick={prev} className="p-3 rounded-2xl bg-white/5 hover:bg-orange-500/10 text-white transition-all hidden sm:flex"><ChevronLeft size={20} /></button>
          <button onClick={next} className="p-3 rounded-2xl bg-white/5 hover:bg-orange-500/10 text-white transition-all hidden sm:flex"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="relative group overflow-hidden rounded-[40px] sm:rounded-[48px] bg-[#121826] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={featured[index].id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[320px] sm:h-[450px] lg:h-[520px] cursor-pointer"
            onClick={() => onSelect(featured[index])}
          >
            <img 
              src={featured[index].photoURL} 
              className="w-full h-full object-cover rounded-[40px] sm:rounded-[48px] opacity-40 group-hover:opacity-60 lg:opacity-70 transition-all duration-1000 scale-105 group-hover:scale-100" 
              alt={featured[index].name} 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b13] via-[#070b13]/20 text-white to-transparent" />
            
            <div className="absolute top-4 left-4 sm:top-10 sm:left-10 flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-1.5 text-yellow-500 bg-black/40 backdrop-blur-xl px-2.5 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl border border-white/10">
                <Star className="w-3 h-3 sm:w-5 sm:h-5 fill-yellow-500" />
                <span className="text-xs sm:text-xl font-black">{featured[index].rating}</span>
              </div>
              <span className="bg-orange-500 text-white px-2.5 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl text-[8px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20">Elite Service</span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 sm:bottom-12 sm:left-12 sm:right-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h3 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white leading-tight uppercase tracking-tighter mb-1 sm:mb-4">{featured[index].name}</h3>
                <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                  <p className="text-orange-500 text-[10px] sm:text-lg font-black tracking-[0.1em] uppercase">{featured[index].category}</p>
                  <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <MapPin className="w-3 h-3 sm:w-5 sm:h-5 text-orange-500/60" />
                    <span className="text-[10px] sm:text-base font-bold truncate max-w-[120px] sm:max-w-none">{featured[index].location}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
                  <span className="text-white text-xs sm:text-xl font-black">R$ {featured[index].pricePerService}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-black h-10 w-10 sm:h-14 sm:w-14 rounded-2xl sm:rounded-[20px] flex items-center justify-center shadow-lg active:bg-orange-500 active:text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={3} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mobile Swipe Indicators */}
        <div className="sm:hidden absolute inset-y-0 left-0 w-8 flex items-center justify-center pointer-events-none opacity-20">
          <ChevronLeft size={20} className="text-white" />
        </div>
        <div className="sm:hidden absolute inset-y-0 right-0 w-8 flex items-center justify-center pointer-events-none opacity-20">
          <ChevronRight size={20} className="text-white" />
        </div>

        {/* Mobile Pagination (Invisible Tap Zones) */}
        <div className="sm:hidden absolute inset-0 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={(e) => { e.stopPropagation(); prev(); }} />
          <div className="w-1/3 h-full cursor-pointer" onClick={() => onSelect(featured[index])} />
          <div className="w-1/3 h-full cursor-pointer" onClick={(e) => { e.stopPropagation(); next(); }} />
        </div>
      </div>
    </section>
  );
};
