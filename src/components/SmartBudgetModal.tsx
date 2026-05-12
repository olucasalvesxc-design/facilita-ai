import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Target, 
  Send, 
  Camera, 
  MapPin, 
  Calendar,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { db, auth, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType } from '../lib/firebase';

interface SmartBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SmartBudgetModal({ isOpen, onClose }: SmartBudgetModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'normal',
    location: '',
    budget: ''
  });

  const categories = ['Construção', 'Elétrica', 'Hidráulica', 'Limpeza', 'Mudança', 'Outros'];

  const handleSend = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        clientId: auth.currentUser.uid,
        clientName: auth.currentUser.displayName || 'Cliente',
        ...formData,
        status: 'pending',
        type: 'smart_budget',
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setLoading(false);
    }
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
        <div className="relative p-8">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {!success ? (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                    <Target size={20} strokeWidth={3} />
                  </div>
                  <div>
                    <h2 className="text-white font-black text-xl uppercase italic leading-none">Orçamento Inteligente</h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Passo {step} de 3</p>
                  </div>
                </div>
              </div>

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
                          {categories.map((cat, i) => (
                            <button
                              key={`cat-${cat}`}
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
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
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
          ) : (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-green-500/20 rounded-[40px] flex items-center justify-center text-green-500 mb-8">
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              <h2 className="text-white font-black text-3xl uppercase italic leading-none mb-4">Sucesso!</h2>
              <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xs mb-10">
                Seu pedido foi enviado para o nosso radar de profissionais. Fique atento às notificações!
              </p>
              <button 
                onClick={onClose}
                className="w-full bg-white text-[#070b13] py-5 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-xl"
              >
                Entendido
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
