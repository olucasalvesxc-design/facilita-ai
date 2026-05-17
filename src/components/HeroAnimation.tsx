import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Hammer, Zap, Star } from 'lucide-react';

const OG = '#FF7A00';
const SCENE_MS = 3400;

// ─────────────────────────────────────────────────────────────────
// CENA 1 — Solicitando serviço
// ─────────────────────────────────────────────────────────────────
function Scene1() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 280, height: 280, background: `radial-gradient(circle, ${OG}14 0%, transparent 65%)` }}
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Card */}
      <motion.div
        className="relative w-60 rounded-[20px] overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
        initial={{ opacity: 0, y: 22, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 20, stiffness: 260 }}
      >
        {/* Shimmer scan line */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)' }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
        />

        <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-gray-600">Nova Solicitação</p>
            <motion.div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: `${OG}20`, border: `1px solid ${OG}35` }}
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <div className="w-1 h-1 rounded-full" style={{ background: OG }} />
              <span className="text-[7px] font-black uppercase tracking-wider" style={{ color: OG }}>Urgente</span>
            </motion.div>
          </div>
          <p className="text-white font-black text-sm leading-tight mb-0.5">Instalação Elétrica</p>
          <p className="text-gray-600 text-[9px]">São Paulo · Zona Sul</p>
        </div>

        <div className="px-4 py-3 flex items-center gap-1.5 flex-wrap">
          {['Elétrica', 'Residencial', 'Rápido'].map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.1, type: 'spring', damping: 14 }}
              className="px-2.5 py-1 rounded-xl text-[7px] font-black uppercase tracking-widest"
              style={{
                background: i === 0 ? `${OG}18` : 'rgba(255,255,255,0.05)',
                color: i === 0 ? OG : 'rgba(255,255,255,0.28)',
                border: `1px solid ${i === 0 ? OG + '28' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {tag}
            </motion.span>
          ))}
        </div>

        {/* Signal waves */}
        <div className="absolute top-4 right-4">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="absolute rounded-full border"
              style={{ borderColor: OG, inset: -i * 4 }}
              initial={{ opacity: 0.7, scale: 1 }}
              animate={{ opacity: 0, scale: 2.2 + i * 0.5 }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
            />
          ))}
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: OG, boxShadow: `0 0 10px ${OG}` }} />
        </div>
      </motion.div>

      {/* Button */}
      <motion.div
        className="relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-[11px] font-black uppercase tracking-wider"
        style={{ background: `linear-gradient(135deg, ${OG}, #e86500)`, boxShadow: `0 8px 28px ${OG}45` }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, type: 'spring', damping: 16 }}
      >
        <motion.div
          className="absolute top-0 bottom-0 w-16 -skew-x-12"
          style={{ background: 'rgba(255,255,255,0.14)' }}
          animate={{ x: ['-80px', '220px'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
        />
        <Zap size={13} />
        Solicitar Agora
      </motion.div>

      <p className="text-gray-700 text-[8px] uppercase tracking-[0.22em] font-bold">Precisou? Chamou.</p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CENA 2 — Conexão GPS / mapa
// ─────────────────────────────────────────────────────────────────
function Scene2() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Map grid background */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 260" fill="none">
        {/* "Streets" */}
        <line x1="0" y1="95" x2="400" y2="95" stroke="white" strokeWidth="6" opacity="0.025" />
        <line x1="0" y1="165" x2="400" y2="165" stroke="white" strokeWidth="10" opacity="0.02" />
        <line x1="130" y1="0" x2="130" y2="260" stroke="white" strokeWidth="6" opacity="0.025" />
        <line x1="270" y1="0" x2="270" y2="260" stroke="white" strokeWidth="6" opacity="0.025" />
        {/* Grid dots */}
        {[95, 165].flatMap(y => [130, 270].map(x => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="white" opacity="0.06" />
        )))}
        {/* District blobs */}
        <ellipse cx="90" cy="90" rx="52" ry="38" fill="white" opacity="0.012" />
        <ellipse cx="290" cy="155" rx="62" ry="42" fill={OG} opacity="0.035" />
      </svg>

      <svg viewBox="0 0 300 200" className="w-full max-w-[300px]" fill="none">
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={OG} stopOpacity="1" />
            <stop offset="100%" stopColor={OG} stopOpacity="0.45" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="pinGlow">
            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Route glow halo */}
        <motion.path
          d="M75 65 C118 96 178 122 228 142"
          stroke={OG} strokeWidth="10" strokeLinecap="round" fill="none"
          style={{ filter: `blur(8px)`, opacity: 0.18 }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.0, delay: 0.55, ease: 'easeInOut' }}
        />

        {/* Route dashed line */}
        <motion.path
          d="M75 65 C118 96 178 122 228 142"
          stroke="url(#routeGrad)" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="8 6" fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.0, delay: 0.55, ease: 'easeInOut' }}
        />

        {/* Moving dot with glow */}
        <motion.circle r="6" fill={OG} filter="url(#glow)"
          animate={{ cx: [75, 148, 228], cy: [65, 105, 142] }}
          transition={{ duration: 1.7, delay: 0.9, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.2 }}
        />
        <motion.circle r="3" fill="white"
          animate={{ cx: [75, 148, 228], cy: [65, 105, 142] }}
          transition={{ duration: 1.7, delay: 0.9, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.2 }}
        />

        {/* ── USER PIN ── */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ transformOrigin: '75px 65px' }}
          transition={{ delay: 0.1, type: 'spring', damping: 13, stiffness: 260 }}
        >
          {/* Shadow */}
          <ellipse cx="75" cy="103" rx="9" ry="2.5" fill="black" opacity="0.35" />
          {/* Pulse rings */}
          <motion.circle cx="75" cy="65" r="18" stroke={OG} strokeWidth="1.5" fill="none"
            initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 3.2, opacity: 0 }}
            style={{ transformOrigin: '75px 65px' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.circle cx="75" cy="65" r="18" stroke={OG} strokeWidth="1" fill="none"
            initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 3.2, opacity: 0 }}
            style={{ transformOrigin: '75px 65px' }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6, ease: 'easeOut' }}
          />
          {/* Pin body */}
          <circle cx="75" cy="65" r="14" fill={OG} filter="url(#pinGlow)" />
          <circle cx="75" cy="65" r="14" fill={OG} />
          <circle cx="75" cy="65" r="7" fill="white" opacity="0.25" />
          <circle cx="75" cy="65" r="5" fill="white" />
          {/* Needle */}
          <path d="M71 77 L75 91 L79 77" fill={OG} />
        </motion.g>

        {/* "Você" chip */}
        <motion.g initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <rect x="50" y="36" width="50" height="17" rx="8.5" fill="rgba(8,13,24,0.88)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <text x="75" y="48" fill="white" fontSize="8.5" fontFamily="system-ui" fontWeight="700" textAnchor="middle">Você</text>
        </motion.g>

        {/* ── PRO PIN ── */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ transformOrigin: '228px 142px' }}
          transition={{ delay: 1.5, type: 'spring', damping: 12, stiffness: 220 }}
        >
          {/* Shadow */}
          <ellipse cx="228" cy="180" rx="9" ry="2.5" fill="black" opacity="0.35" />
          {/* Pulse rings */}
          <motion.circle cx="228" cy="142" r="18" stroke="white" strokeWidth="1.5" fill="none"
            initial={{ scale: 1, opacity: 0.7 }} animate={{ scale: 3.2, opacity: 0 }}
            style={{ transformOrigin: '228px 142px' }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5, ease: 'easeOut' }}
          />
          {/* Pin body */}
          <circle cx="228" cy="142" r="14" fill="white" filter="url(#pinGlow)" opacity="0.9" />
          <circle cx="228" cy="142" r="14" fill="white" />
          <circle cx="228" cy="142" r="7" fill={OG} opacity="0.3" />
          <circle cx="228" cy="142" r="5" fill={OG} />
          {/* Needle */}
          <path d="M224 154 L228 168 L232 154" fill="white" />
        </motion.g>

        {/* "Pro" chip with orange */}
        <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7 }}>
          <rect x="205" y="112" width="46" height="17" rx="8.5" fill={OG} />
          <text x="228" y="124" fill="white" fontSize="8.5" fontFamily="system-ui" fontWeight="800" textAnchor="middle">Profissional</text>
        </motion.g>

        {/* Distance badge along route */}
        <motion.g
          initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
          style={{ transformOrigin: '152px 102px' }}
          transition={{ delay: 1.4, type: 'spring', damping: 16 }}
        >
          <rect x="118" y="90" width="68" height="24" rx="12" fill="rgba(8,13,24,0.9)" stroke={`${OG}45`} strokeWidth="1.5" />
          <text x="152" y="106" fill={OG} fontSize="10" fontFamily="system-ui" fontWeight="900" textAnchor="middle" letterSpacing="0.3">2.4 km</text>
        </motion.g>
      </svg>

      {/* Bottom label */}
      <motion.p
        className="absolute bottom-5 text-[9px] uppercase tracking-[0.22em] font-black"
        style={{ color: 'rgba(255,255,255,0.2)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
      >
        Conectamos você ao melhor
      </motion.p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CENA 3 — Profissional a caminho
// ─────────────────────────────────────────────────────────────────
function Scene3() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 px-5"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 220, height: 220, background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Pro card */}
      <motion.div
        className="w-full max-w-[248px] rounded-[18px] overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
        initial={{ opacity: 0, y: 20, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', damping: 18 }}
      >
        <div className="flex items-center gap-3 p-4">
          {/* Avatar */}
          <motion.div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 font-black text-white text-sm relative"
            style={{ background: `linear-gradient(135deg, ${OG}, #e86500)`, boxShadow: `0 8px 24px ${OG}50` }}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.25, type: 'spring', damping: 12 }}
          >
            CP
            <motion.div
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2"
              style={{ borderColor: '#080d18' }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </motion.div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-[11px] font-black leading-tight">Carlos Pereira</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-gray-500 text-[9px]">Eletricista</p>
              <span className="text-gray-700">·</span>
              <div className="flex items-center gap-0.5">
                <Star size={8} fill={OG} stroke="none" />
                <span className="text-[9px] font-bold" style={{ color: OG }}>4.9</span>
              </div>
            </div>
          </div>

          {/* ETA */}
          <div className="text-right shrink-0">
            <motion.p
              className="text-sm font-black leading-none"
              style={{ color: OG }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              5 min
            </motion.p>
            <p className="text-gray-700 text-[8px] font-bold mt-0.5">chegando</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: OG }} />
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${OG}, #ffc56a)` }}
                initial={{ width: '12%' }}
                animate={{ width: '70%' }}
                transition={{ delay: 0.6, duration: 2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <motion.div
              className="w-2 h-2 rounded-full border-2 shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}
              animate={{ borderColor: ['rgba(255,255,255,0.15)', `${OG}80`, 'rgba(255,255,255,0.15)'] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 1.5 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Status badge */}
      <motion.div
        className="flex items-center gap-2 rounded-2xl px-5 py-2.5"
        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <motion.div
          className="w-2 h-2 bg-green-400 rounded-full"
          animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
        <span className="text-green-400 text-[10px] font-black uppercase tracking-wider">
          A caminho · chega em 5 min
        </span>
      </motion.div>

      <p className="text-gray-700 text-[8px] uppercase tracking-[0.22em] font-bold">
        Profissional confirmado
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CENA 4 — Serviço concluído
// ─────────────────────────────────────────────────────────────────
function Scene4() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Glow behind check */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 180, height: 180, background: `radial-gradient(circle, ${OG}22 0%, transparent 70%)` }}
        animate={{ scale: [0.85, 1.2, 0.85] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Check circle */}
      <div className="relative">
        <svg viewBox="0 0 90 90" className="w-[84px] h-[84px]" fill="none">
          {/* Outer track */}
          <circle cx="45" cy="45" r="38" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          {/* Animated circle */}
          <motion.circle
            cx="45" cy="45" r="38"
            stroke={OG} strokeWidth="3" strokeLinecap="round"
            style={{ rotate: -90, transformOrigin: '45px 45px' }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Fill */}
          <motion.circle
            cx="45" cy="45" r="33"
            fill={OG}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ transformOrigin: '45px 45px' }}
            transition={{ duration: 0.35, delay: 0.65, type: 'spring', damping: 14 }}
          />
          {/* Check */}
          <motion.path
            d="M28 47 L39 58 L62 32"
            stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>

        {/* Burst particles */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
          const angle = (i / 8) * Math.PI * 2;
          const dist = 54;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: i % 2 === 0 ? 6 : 4,
                height: i % 2 === 0 ? 6 : 4,
                background: i % 3 === 0 ? OG : i % 3 === 1 ? '#ffc56a' : 'white',
                top: '50%', left: '50%',
              }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                scale: [0, 1.4, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 0.65, delay: 1.1 + i * 0.045, ease: 'easeOut' }}
            />
          );
        })}
      </div>

      <motion.p
        className="text-white font-black text-base uppercase tracking-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05 }}
      >
        Serviço Concluído!
      </motion.p>

      {/* Stars */}
      <motion.div
        className="flex items-center gap-1"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, type: 'spring', damping: 14 }}
      >
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.45 + i * 0.08, type: 'spring', damping: 12 }}
          >
            <Star size={16} fill={OG} stroke="none" />
          </motion.div>
        ))}
      </motion.div>

      {/* Logo */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.85 }}
      >
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: OG, boxShadow: `0 0 14px ${OG}60` }}>
          <Hammer size={13} className="text-white -rotate-12" />
        </div>
        <span className="text-sm font-black italic uppercase tracking-tight">
          <span className="text-white">Facilita</span>
          <span style={{ color: OG }}> Aí</span>
        </span>
      </motion.div>

      <p className="text-gray-700 text-[8px] uppercase tracking-[0.22em] font-bold">Problema resolvido</p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────
const LABELS = ['Solicitar', 'Conectar', 'A caminho', 'Concluído'];

export function HeroAnimation() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setScene(s => (s + 1) % 4), SCENE_MS);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto select-none">
      {/* Container */}
      <div
        className="relative h-64 sm:h-72 rounded-[28px] overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0c1220 0%, #080d18 60%, #0a0f1c 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Top gradient shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />

        {/* Corner glow */}
        <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${OG}10 0%, transparent 65%)` }} />

        {/* Tag */}
        <div className="absolute top-3.5 left-4 z-10 flex items-center gap-1.5">
          <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: OG }}
            animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span className="text-[8px] text-gray-600 font-black uppercase tracking-[0.15em]">Facilita Aí</span>
        </div>

        {/* Scene counter */}
        <div className="absolute top-3.5 right-4 z-10 text-[9px] font-black tabular-nums" style={{ color: 'rgba(255,255,255,0.15)' }}>
          0{scene + 1} / 04
        </div>

        {/* Scenes */}
        <AnimatePresence mode="wait">
          {scene === 0 && <Scene1 key="s1" />}
          {scene === 1 && <Scene2 key="s2" />}
          {scene === 2 && <Scene3 key="s3" />}
          {scene === 3 && <Scene4 key="s4" />}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <motion.div
            className="h-full"
            style={{ background: `linear-gradient(90deg, ${OG}, #ffc56a)` }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            key={scene}
            transition={{ duration: SCENE_MS / 1000, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-5 mt-4">
        {LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => setScene(i)}
            className="flex flex-col items-center gap-1.5 group"
          >
            <motion.div
              className="rounded-full transition-all duration-300"
              style={{
                width: i === scene ? 28 : 6,
                height: 3,
                background: i === scene ? OG : 'rgba(255,255,255,0.1)',
                boxShadow: i === scene ? `0 0 10px ${OG}70` : 'none',
              }}
              layout
              transition={{ duration: 0.3 }}
            />
            <span
              className="text-[8px] uppercase tracking-widest font-black transition-all duration-300"
              style={{ color: i === scene ? OG : 'rgba(255,255,255,0.18)' }}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
