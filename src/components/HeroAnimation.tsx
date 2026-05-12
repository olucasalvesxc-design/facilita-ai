import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Hammer } from 'lucide-react';

const OG = '#FF7A00';
const SCENE_MS = 3200;

// ─────────────────────────────────────────────────────────────────
// CENA 1 — Solicitando serviço
// ─────────────────────────────────────────────────────────────────
function Scene1() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-5"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Radial glow de fundo */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 220, height: 220,
          background: `radial-gradient(circle, rgba(255,122,0,0.14) 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Card de solicitação estilo app */}
      <motion.div
        className="relative w-56 rounded-2xl p-4 border"
        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', damping: 18 }}
      >
        <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold mb-2">Nova solicitação</p>
        <p className="text-white text-sm font-bold leading-snug mb-1">Instalação elétrica</p>
        <p className="text-gray-500 text-[10px]">São Paulo · Urgente</p>

        {/* Ondas de sinal no canto */}
        <div className="absolute top-3 right-3">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full border"
              style={{ borderColor: OG, width: 8, height: 8, top: 0, right: 0 }}
              initial={{ scale: 1, opacity: 0.9 }}
              animate={{ scale: 3.5 + i * 1.2, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
            />
          ))}
          <div className="w-2 h-2 rounded-full" style={{ background: OG }} />
        </div>
      </motion.div>

      {/* Botão pulsando */}
      <motion.div
        className="relative z-10 px-5 py-2.5 rounded-2xl text-white text-[11px] font-black uppercase tracking-wider"
        style={{ background: OG }}
        animate={{
          boxShadow: [
            `0 0 0px ${OG}00`,
            `0 0 22px ${OG}80`,
            `0 0 0px ${OG}00`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Solicitar Serviço
      </motion.div>

      <p className="text-gray-600 text-[9px] uppercase tracking-widest font-bold">
        Precisou? Chamou.
      </p>
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
      transition={{ duration: 0.35 }}
    >
      {/* Grid sutil */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 260" fill="none" style={{ opacity: 0.04 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 44} y1="0" x2={i * 44} y2="260" stroke="white" strokeWidth="1" />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 43} x2="400" y2={i * 43} stroke="white" strokeWidth="1" />
        ))}
      </svg>

      <svg viewBox="0 0 300 200" className="w-full max-w-[300px]" fill="none">
        {/* ── Pin do usuário (topo-esquerdo) ── */}
        <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 14 }}>
          <circle cx="70" cy="60" r="18" fill={OG} />
          <circle cx="70" cy="60" r="10" fill="white" />
          <circle cx="70" cy="60" r="5" fill={OG} />
          <path d="M70 78 L70 92" stroke={OG} strokeWidth="4" strokeLinecap="round" />
          {/* Pulse */}
          <motion.circle cx="70" cy="60" r="18" stroke={OG} strokeWidth="2" fill="none"
            initial={{ scale: 1, opacity: 0.9 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
        </motion.g>
        <text x="52" y="48" fill="rgba(255,255,255,0.45)" fontSize="8" fontFamily="system-ui">Você</text>

        {/* ── Linha animada entre os pins ── */}
        <motion.path
          d="M78 78 C110 100 180 118 222 130"
          stroke={OG} strokeWidth="2" strokeLinecap="round"
          strokeDasharray="6 5" fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.0, delay: 0.5, ease: 'easeInOut' }}
        />

        {/* ── Ponto móvel ao longo da rota ── */}
        <motion.circle r="5" fill={OG}
          animate={{ cx: [78, 222], cy: [78, 130] }}
          transition={{ duration: 1.4, delay: 0.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.4 }}
        />

        {/* ── Pin do profissional (baixo-direito) ── */}
        <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5, type: 'spring', damping: 12 }}>
          <circle cx="232" cy="138" r="18" fill="white" />
          <circle cx="232" cy="138" r="10" fill={OG} />
          <circle cx="232" cy="138" r="5" fill="white" />
          <path d="M232 156 L232 170" stroke="white" strokeWidth="4" strokeLinecap="round" />
          <motion.circle cx="232" cy="138" r="18" stroke="white" strokeWidth="2" fill="none"
            initial={{ scale: 1, opacity: 0.9 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, delay: 0.6, ease: 'easeOut' }}
          />
        </motion.g>
        <text x="248" y="130" fill="rgba(255,255,255,0.45)" fontSize="8" fontFamily="system-ui">Pro</text>
      </svg>

      <p className="absolute bottom-4 text-gray-600 text-[9px] uppercase tracking-widest font-bold">
        Conectamos você ao melhor
      </p>
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
      transition={{ duration: 0.35 }}
    >
      {/* Card do profissional */}
      <motion.div
        className="w-full max-w-[240px] rounded-2xl p-3.5 flex items-center gap-3 border"
        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: 'spring', damping: 18 }}
      >
        {/* Avatar */}
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-white text-sm"
          style={{ background: OG, boxShadow: `0 0 16px ${OG}60` }}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.25, type: 'spring', damping: 12 }}
        >
          CP
        </motion.div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold leading-tight">Carlos Pereira</p>
          <p className="text-gray-500 text-[10px] mt-0.5">Eletricista · ⭐ 4.9</p>
        </div>

        {/* ETA */}
        <div className="text-right shrink-0">
          <motion.p
            className="text-xs font-black"
            style={{ color: OG }}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            5 min
          </motion.p>
          <p className="text-gray-600 text-[9px]">chegando</p>
        </div>
      </motion.div>

      {/* Linha de progresso */}
      <motion.div
        className="w-full max-w-[240px] flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: OG }} />
        <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(to right, ${OG}, #ffd080)` }}
            initial={{ width: '15%' }}
            animate={{ width: '68%' }}
            transition={{ delay: 0.55, duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }} />
      </motion.div>

      {/* Badge status */}
      <motion.div
        className="flex items-center gap-2 rounded-2xl px-4 py-2 border"
        style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.22)' }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <motion.div
          className="w-2 h-2 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.7, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
        <span className="text-green-400 text-[10px] font-black uppercase tracking-wider">
          A caminho · 5 min
        </span>
      </motion.div>

      <p className="text-gray-700 text-[9px] uppercase tracking-widest font-bold">
        Profissional a caminho
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
      transition={{ duration: 0.35 }}
    >
      {/* Glow laranja */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 160, height: 160,
          background: `radial-gradient(circle, rgba(255,122,0,0.16) 0%, transparent 70%)`,
        }}
        animate={{ scale: [0.9, 1.15, 0.9] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Check animado */}
      <div className="relative">
        <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
          {/* Círculo desenhando */}
          <motion.circle
            cx="40" cy="40" r="34"
            stroke={OG} strokeWidth="3"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
          {/* Check desenhando */}
          <motion.path
            d="M22 42 L34 55 L58 26"
            stroke={OG} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.55, delay: 0.65, ease: 'easeOut' }}
          />
        </svg>

        {/* Partículas ao redor */}
        {[0, 1, 2, 3, 4, 5].map(i => {
          const angle = (i / 6) * Math.PI * 2;
          const r = 46;
          return (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: OG,
                top: `calc(50% + ${Math.sin(angle) * r}%)`,
                left: `calc(50% + ${Math.cos(angle) * r}%)`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.8, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.7, delay: 1.15 + i * 0.08, ease: 'easeOut' }}
            />
          );
        })}
      </div>

      {/* Texto concluído */}
      <motion.p
        className="text-white font-black text-base uppercase tracking-tight"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        Serviço Concluído!
      </motion.p>

      {/* Logo */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(255,122,0,0.5)]"
          style={{ background: OG }}
        >
          <Hammer size={13} className="text-white -rotate-12" />
        </div>
        <span className="text-sm font-black italic uppercase tracking-tight">
          <span className="text-white">Facilita</span>
          <span style={{ color: OG }}> Aí</span>
        </span>
      </motion.div>

      <p className="text-gray-600 text-[9px] uppercase tracking-widest font-bold">
        Problema resolvido
      </p>
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
      {/* Container principal */}
      <div
        className="relative h-64 sm:h-72 rounded-3xl overflow-hidden border border-white/5"
        style={{ background: '#080d18' }}
      >
        {/* Noise texture sutil */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E")', opacity: 0.4 }}
        />

        {/* Tag do app */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: OG }} />
          <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Facilita Aí</span>
        </div>

        {/* Número da cena */}
        <div className="absolute top-3 right-3 z-10 text-[9px] text-gray-700 font-bold tabular-nums">
          0{scene + 1} / 04
        </div>

        {/* Cenas */}
        <AnimatePresence mode="wait">
          {scene === 0 && <Scene1 key="s1" />}
          {scene === 1 && <Scene2 key="s2" />}
          {scene === 2 && <Scene3 key="s3" />}
          {scene === 3 && <Scene4 key="s4" />}
        </AnimatePresence>

        {/* Barra de progresso na base */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
          <motion.div
            className="h-full"
            style={{ background: OG }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            key={scene}
            transition={{ duration: SCENE_MS / 1000, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Indicadores de cena */}
      <div className="flex items-center justify-center gap-4 mt-3">
        {LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => setScene(i)}
            className="flex flex-col items-center gap-1 group"
          >
            <div
              className="h-0.5 rounded-full transition-all duration-300"
              style={{
                width: i === scene ? 24 : 8,
                background: i === scene ? OG : 'rgba(255,255,255,0.1)',
              }}
            />
            <span
              className="text-[8px] uppercase tracking-widest font-bold transition-colors duration-200"
              style={{ color: i === scene ? OG : 'rgba(255,255,255,0.2)' }}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
