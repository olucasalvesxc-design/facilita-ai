import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Hammer, X, Send } from 'lucide-react';
import {
  db, auth, doc, updateDoc, serverTimestamp, addDoc, collection,
  getDoc, OperationType, handleFirestoreError
} from '../lib/firebase';

const OG = '#FF7A00';

interface CompletionModalProps {
  order: any;
  userRole?: string;
  onClose: () => void;
}

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  angle: (i / 20) * Math.PI * 2,
  dist: 60 + Math.random() * 60,
  size: i % 3 === 0 ? 7 : i % 3 === 1 ? 5 : 4,
  color: i % 4 === 0 ? OG : i % 4 === 1 ? '#ffc56a' : i % 4 === 2 ? '#ffffff' : '#ff4500',
  delay: 0.9 + i * 0.03,
}));

const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 1.2,
  duration: 1.5 + Math.random() * 1.5,
  size: 4 + Math.random() * 6,
  color: [OG, '#ffc56a', '#fff', '#ff4500', '#22c55e'][i % 5],
  rotate: Math.random() * 360,
}));

export function CompletionModal({ order, userRole, onClose }: CompletionModalProps) {
  const [phase, setPhase] = useState<'animation' | 'rating'>('animation');
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const isClient = !order.professionalId || auth.currentUser?.uid === order.clientId;
  const ratingTarget = isClient ? 'pro' : 'client';
  const targetName = isClient ? (order.professionalName || 'profissional') : (order.clientName || 'cliente');

  useEffect(() => {
    const t = setTimeout(() => setPhase('rating'), 2800);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async () => {
    if (!selected || !auth.currentUser) return;
    setSubmitting(true);
    try {
      const ratingField = isClient ? 'clientRating' : 'proRating';
      await updateDoc(doc(db, 'orders', order.id), {
        [`rating.${ratingField}`]: { score: selected, comment, ratedAt: serverTimestamp() },
        updatedAt: serverTimestamp(),
      });

      // Update professional's average rating
      if (isClient && order.professionalId) {
        const proRef = doc(db, 'professionals', order.professionalId);
        const proSnap = await getDoc(proRef);
        if (proSnap.exists()) {
          const data = proSnap.data();
          const prevRating = data.rating ?? 0;
          const prevCount = data.ratingsCount ?? 0;
          const newCount = prevCount + 1;
          const newRating = Math.round(((prevRating * prevCount + selected) / newCount) * 10) / 10;
          await updateDoc(proRef, { rating: newRating, ratingsCount: newCount });
        }
      }

      // Notify the other party
      const notifyId = isClient ? order.professionalId : order.clientId;
      if (notifyId) {
        await addDoc(collection(db, 'notifications'), {
          userId: notifyId,
          title: '⭐ Nova Avaliação',
          type: 'rating',
          message: `Você recebeu ${selected} estrela${selected > 1 ? 's' : ''} por "${order.serviceTitle || 'Serviço'}"`,
          time: new Date().toISOString(),
          read: false,
          createdAt: serverTimestamp(),
          senderId: auth.currentUser.uid,
        });
      }

      setDone(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'orders');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => onClose();

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#070b13]/95 backdrop-blur-md"
      />

      {/* Confetti */}
      <AnimatePresence>
        {phase === 'animation' && CONFETTI.map(c => (
          <motion.div
            key={c.id}
            className="absolute pointer-events-none rounded-sm"
            style={{
              width: c.size,
              height: c.size * 1.6,
              background: c.color,
              left: `${c.x}%`,
              top: '-20px',
              rotate: c.rotate,
            }}
            animate={{ y: '110vh', rotate: c.rotate + 720, opacity: [0, 1, 1, 0] }}
            transition={{ duration: c.duration, delay: c.delay, ease: 'easeIn' }}
          />
        ))}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-sm">
        <AnimatePresence mode="wait">
          {phase === 'animation' ? (
            <motion.div
              key="anim"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-5 text-center px-8 py-10"
            >
              {/* Glow */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{ width: 280, height: 280, background: `radial-gradient(circle, ${OG}18 0%, transparent 70%)` }}
                animate={{ scale: [0.8, 1.15, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Check */}
              <div className="relative">
                <svg viewBox="0 0 110 110" className="w-[110px] h-[110px]" fill="none">
                  <circle cx="55" cy="55" r="48" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                  <motion.circle
                    cx="55" cy="55" r="48"
                    stroke={OG} strokeWidth="4" strokeLinecap="round"
                    style={{ rotate: -90, transformOrigin: '55px 55px' }}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.circle
                    cx="55" cy="55" r="41"
                    fill={OG}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ transformOrigin: '55px 55px' }}
                    transition={{ duration: 0.4, delay: 0.75, type: 'spring', damping: 12 }}
                  />
                  <motion.path
                    d="M34 57 L48 71 L76 39"
                    stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
                  />
                </svg>

                {/* Burst particles */}
                {PARTICLES.map(p => (
                  <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{ width: p.size, height: p.size, background: p.color, top: '50%', left: '50%' }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{
                      x: Math.cos(p.angle) * p.dist,
                      y: Math.sin(p.angle) * p.dist,
                      scale: [0, 1.5, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{ duration: 0.7, delay: p.delay, ease: 'easeOut' }}
                  />
                ))}
              </div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, type: 'spring', damping: 14 }}
              >
                <p className="text-white font-black text-3xl uppercase italic tracking-tighter leading-none">
                  Serviço
                </p>
                <p className="font-black text-3xl uppercase italic tracking-tighter leading-none" style={{ color: OG }}>
                  Concluído!
                </p>
              </motion.div>

              {/* Stars burst */}
              <motion.div
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.45, type: 'spring', damping: 12 }}
              >
                {[0, 1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1.5 + i * 0.09, type: 'spring', damping: 10 }}
                  >
                    <Star size={22} fill={OG} stroke="none" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Logo */}
              <motion.div
                className="flex items-center gap-2 mt-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0 }}
              >
                <motion.div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: OG, boxShadow: `0 0 20px ${OG}60` }}
                  animate={{ boxShadow: [`0 0 20px ${OG}40`, `0 0 35px ${OG}80`, `0 0 20px ${OG}40`] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Hammer size={16} className="text-white -rotate-12" />
                </motion.div>
                <span className="text-lg font-black italic uppercase tracking-tighter">
                  <span className="text-white">FACILITA</span>
                  <span style={{ color: OG }}> AÍ</span>
                </span>
              </motion.div>

              <motion.p
                className="text-gray-600 text-[9px] uppercase tracking-[0.22em] font-bold mt-1"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3 }}
              >
                Problema resolvido
              </motion.p>
            </motion.div>

          ) : done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 text-center px-8 py-12"
            >
              <div className="w-16 h-16 rounded-[28px] bg-green-500/20 flex items-center justify-center text-green-400 text-3xl">
                ✓
              </div>
              <p className="text-white font-black text-xl uppercase italic">Avaliação enviada!</p>
              <p className="text-gray-500 text-sm">Obrigado pelo feedback.</p>
            </motion.div>

          ) : (
            <motion.div
              key="rating"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-[#121826] border border-white/10 rounded-[36px] overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 text-center border-b border-white/5">
                <button
                  onClick={handleSkip}
                  className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${OG}20` }}>
                  <Star size={22} fill={OG} stroke="none" />
                </div>
                <h3 className="text-white font-black text-lg uppercase italic tracking-tight">Avalie o serviço</h3>
                <p className="text-gray-500 text-[11px] font-bold mt-1">
                  Como foi sua experiência com <span className="text-white">{targetName}</span>?
                </p>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Stars */}
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.85 }}
                      whileHover={{ scale: 1.15 }}
                      onMouseEnter={() => setHovered(s)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setSelected(s)}
                      className="transition-all"
                    >
                      <Star
                        size={36}
                        fill={s <= (hovered || selected) ? OG : 'transparent'}
                        stroke={s <= (hovered || selected) ? OG : 'rgba(255,255,255,0.15)'}
                        strokeWidth={1.5}
                        style={{
                          filter: s <= (hovered || selected) ? `drop-shadow(0 0 8px ${OG}80)` : 'none',
                          transition: 'all 0.15s',
                        }}
                      />
                    </motion.button>
                  ))}
                </div>

                {/* Label */}
                <AnimatePresence mode="wait">
                  {(hovered || selected) > 0 && (
                    <motion.p
                      key={hovered || selected}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-[11px] font-black uppercase tracking-widest"
                      style={{ color: OG }}
                    >
                      {['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente!'][hovered || selected]}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Comment */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 ml-1">
                    Comentário (opcional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Conte mais sobre sua experiência..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-3.5 text-white text-sm placeholder:text-gray-700 outline-none focus:border-orange-500/40 transition-colors resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-4 bg-white/5 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Pular
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selected || submitting}
                    className="flex-[2] py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl disabled:opacity-40"
                    style={{ background: selected ? OG : 'rgba(255,255,255,0.05)', boxShadow: selected ? `0 8px 24px ${OG}30` : 'none' }}
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={13} />
                        Enviar Avaliação
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
