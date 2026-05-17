import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Target,
  Send,
  MapPin,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Plus,
  Clock,
  ChevronDown
} from 'lucide-react';
import { db, auth, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType, query, where, getDocs, orderBy, limit } from '../lib/firebase';

interface SmartBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackRequest?: () => void;
}

interface ExistingRequest {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt?: any;
  urgency?: string;
}

export function SmartBudgetModal({ isOpen, onClose, onTrackRequest }: SmartBudgetModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [existingRequests, setExistingRequests] = useState<ExistingRequest[]>([]);
  const [showChoice, setShowChoice] = useState(false);
  const [showExistingList, setShowExistingList] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'normal',
    location: '',
    budget: ''
  });

  const categories = ['Construção', 'Elétrica', 'Hidráulica', 'Limpeza', 'Mudança', 'Outros'];

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setTimeout(() => {
        setStep(1);
        setSuccess(false);
        setShowChoice(false);
        setShowExistingList(false);
        setFormData({ title: '', description: '', category: '', urgency: 'normal', location: '', budget: '' });
      }, 300);
      return;
    }

    if (!auth.currentUser) {
      setCheckingExisting(false);
      return;
    }

    setCheckingExisting(true);
    // Check for existing pending requests from this user
    const q = query(
      collection(db, 'smartRequests'),
      where('clientId', '==', auth.currentUser.uid),
      where('status', '==', 'pending'),
      limit(5)
    );

    getDocs(q)
      .then(snap => {
        const items = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as ExistingRequest))
          .sort((a: any, b: any) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setExistingRequests(items);
        setShowChoice(items.length > 0);
        setCheckingExisting(false);
      })
      .catch(() => {
        setCheckingExisting(false);
        setShowChoice(false);
      });
  }, [isOpen]);

  const handleSend = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const payload = {
        clientId: auth.currentUser.uid,
        clientName: auth.currentUser.displayName || 'Cliente',
        ...formData,
        status: 'pending',
        type: 'smart_budget',
        createdAt: serverTimestamp(),
        date: serverTimestamp(),
      };
      await Promise.all([
        addDoc(collection(db, 'orders'), payload),
        addDoc(collection(db, 'smartRequests'), payload),
      ]);
      setSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = () => {
    onClose();
    onTrackRequest?.();
  };

  const handleNewRequest = () => {
    setShowChoice(false);
  };

  const urgencyLabel = (u: string) => {
    if (u === 'urgent') return 'Urgente';
    if (u === 'scheduled') return 'Planejado';
    return 'Normal';
  };

  const urgencyColor = (u: string) => {
    if (u === 'urgent') return 'text-red-400';
    if (u === 'scheduled') return 'text-blue-400';
    return 'text-gray-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#070b13]/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="relative w-full max-w-lg bg-[#121826] border-t sm:border border-white/10 rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="relative p-8 overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shrink-0">
              <Target size={20} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-white font-black text-xl uppercase italic leading-none">Orçamento Inteligente</h2>
              {!showChoice && !success && (
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Passo {step} de 3</p>
              )}
            </div>
          </div>

          {checkingExisting ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : success ? (
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-green-500/20 rounded-[40px] flex items-center justify-center text-green-500 mb-8">
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              <h2 className="text-white font-black text-3xl uppercase italic leading-none mb-4">Sucesso!</h2>
              <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xs mb-10">
                Seu pedido foi enviado para o nosso radar de profissionais. Fique atento às notificações!
              </p>
              <div className="w-full space-y-3">
                <button
                  onClick={handleTrack}
                  className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
                >
                  <ClipboardList size={16} />
                  Acompanhar Solicitação
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-white/5 text-gray-400 py-4 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : showChoice ? (
            <div className="space-y-6">
              {/* Existing requests preview */}
              <div className="space-y-3">
                <p className="text-gray-400 text-sm font-medium leading-relaxed">
                  Você tem <span className="text-white font-black">{existingRequests.length}</span> solicitação{existingRequests.length > 1 ? 'ões' : ''} em aberto.
                </p>

                {/* Show first request or list */}
                <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                  {existingRequests.slice(0, showExistingList ? existingRequests.length : 1).map((req, i) => (
                    <div key={req.id} className={`p-4 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate">{req.title}</p>
                          <p className="text-gray-500 text-[11px] mt-0.5">{req.category}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400">
                            Aguardando
                          </span>
                          <span className={`text-[9px] font-bold ${urgencyColor(req.urgency || 'normal')}`}>
                            {urgencyLabel(req.urgency || 'normal')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {existingRequests.length > 1 && !showExistingList && (
                    <button
                      onClick={() => setShowExistingList(true)}
                      className="w-full p-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-orange-400 flex items-center justify-center gap-1 border-t border-white/5 transition-colors"
                    >
                      <ChevronDown size={12} />
                      Ver mais {existingRequests.length - 1}
                    </button>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleTrack}
                  className="w-full bg-white text-[#070b13] py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
                >
                  <ClipboardList size={16} />
                  Acompanhar Solicitação
                </button>
                <button
                  onClick={handleNewRequest}
                  className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-white/8"
                >
                  <Plus size={16} />
                  Criar Novo Orçamento
                </button>
              </div>

              <div className="flex items-start gap-3 bg-white/2 rounded-2xl p-4 border border-white/5">
                <Clock size={14} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                  Profissionais verificados estão analisando sua solicitação. Você será notificado assim que receberem propostas.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="min-h-[300px]">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="text-white text-[10px] font-black uppercase tracking-widest ml-1">O que você precisa?</label>
                        <input
                          type="text"
                          placeholder="Ex: Reforma de banheiro, Troca de fiação..."
                          className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white placeholder:text-gray-600 focus:border-orange-500 outline-none transition-all"
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-white text-[10px] font-black uppercase tracking-widest ml-1">Categoria</label>
                        <div className="grid grid-cols-2 gap-2">
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setFormData({...formData, category: cat})}
                              className={`p-3 rounded-xl border text-[11px] font-black uppercase tracking-tight transition-all ${formData.category === cat ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'}`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="text-white text-[10px] font-black uppercase tracking-widest ml-1">Descreva os detalhes</label>
                        <textarea
                          placeholder="Dê o máximo de detalhes possível para orçamentos mais precisos..."
                          className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white placeholder:text-gray-600 focus:border-orange-500 outline-none transition-all h-32 resize-none"
                          value={formData.description}
                          onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-white text-[10px] font-black uppercase tracking-widest ml-1">Urgência</label>
                        <select
                          className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white outline-none"
                          value={formData.urgency}
                          onChange={e => setFormData({...formData, urgency: e.target.value})}
                        >
                          <option value="normal" className="bg-[#121826]">Normal</option>
                          <option value="urgent" className="bg-[#121826]">Urgente (Hoje)</option>
                          <option value="scheduled" className="bg-[#121826]">Planejado</option>
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="text-white text-[10px] font-black uppercase tracking-widest ml-1">Localização</label>
                        <div className="relative">
                          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
                          <input
                            type="text"
                            placeholder="Sua cidade ou bairro"
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 pl-12 text-white placeholder:text-gray-600 focus:border-orange-500 outline-none transition-all"
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-white text-[10px] font-black uppercase tracking-widest ml-1">Expectativa de Orçamento (Opcional)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-black">R$</span>
                          <input
                            type="number"
                            placeholder="0,00"
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 pl-12 text-white placeholder:text-gray-600 focus:border-orange-500 outline-none transition-all"
                            value={formData.budget}
                            onChange={e => setFormData({...formData, budget: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="bg-white/2 rounded-2xl p-4 border border-white/5 flex items-start gap-4">
                        <AlertCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                          Seu pedido será enviado para profissionais verificados. Você receberá notificações assim que as propostas chegarem.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 bg-white/5 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
                  >
                    Voltar
                  </button>
                )}
                <button
                  onClick={() => step < 3 ? setStep(step + 1) : handleSend()}
                  disabled={loading || (step === 1 && (!formData.title || !formData.category))}
                  className="flex-[2] bg-white text-[#070b13] py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : (step < 3 ? 'Próximo' : 'Solicitar Orçamentos')}
                  {step < 3 && <ChevronRight size={18} />}
                  {step === 3 && !loading && <Send size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
