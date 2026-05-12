import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, ArrowRight, ArrowLeft, CheckCircle, ShieldCheck, 
  MapPin, Phone, Briefcase, DollarSign, Clock, 
  Instagram, Globe, Check, Lock, Star, MessageSquare, Heart
} from 'lucide-react';
import { Professional, UserProfile } from '../types';
import { db, auth, doc, setDoc, serverTimestamp, OperationType, handleFirestoreError } from '../lib/firebase';
import { compressImage } from '../lib/imageUtils';

interface OnboardingProps {
  user: UserProfile;
  onComplete: (pro: Partial<Professional>) => void;
  onCancel: () => void;
}

const Spinner = ({ size = 20 }: { size?: number }) => (
  <div 
    className="animate-spin rounded-full border-2 border-white/20 border-t-white" 
    style={{ width: size, height: size }} 
  />
);

export const ProfessionalOnboarding = ({ user, onComplete, onCancel }: OnboardingProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Professional>>({
    name: user.name,
    photoURL: user.photoURL,
    category: '',
    description: '',
    whatsapp: user.whatsapp || '',
    location: user.location || '',
    pricePerService: 0,
    skills: [],
    cpfCnpj: '',
    serviceArea: '',
    bannerURL: '',
    documentUrl: '',
    workingHours: [
      { day: 'Segunda - Sexta', start: '08:00', end: '18:00', active: true },
    ]
  });

  const nextStep = () => {
    if (step < 3) setStep(s => s + 1);
    else handleFinish();
  };
  const prevStep = () => setStep(s => s - 1);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'photoURL' | 'bannerURL' | 'documentUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const compressed = await compressImage(base64, 800, 0.7);
      setFormData(prev => ({ ...prev, [field]: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (!auth.currentUser) return;
      
      const proData: Partial<Professional> = {
        ...formData,
        id: auth.currentUser.uid,
        userId: auth.currentUser.uid,
        rating: 5.0,
        reviewCount: 0,
        status: 'online',
        isActive: true,
        professionalStatus: 'active',
        onboardingCompleted: true,
        lastActiveAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'professionals', auth.currentUser.uid), proData, { merge: true });
      await setDoc(doc(db, 'users', auth.currentUser.uid), { role: 'pro' }, { merge: true });

      onComplete(proData);
      
      const checkoutUrl = (import.meta as any).env.VITE_KIRVANO_CHECKOUT_URL;
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `professionals/${user.id}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-10">
              <span className="text-[10px] bg-orange-500/10 text-orange-500 font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-orange-500/20">Passo 01/03</span>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mt-4">Perfil Profissional</h2>
              <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold">Como os clientes verão você</p>
            </div>

            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-[#121826] border-2 border-white/10 overflow-hidden shadow-2xl transition-all group-hover:border-orange-500/50">
                  {formData.photoURL ? (
                    <img src={formData.photoURL} className="w-full h-full object-cover" alt="Perfil" referrerPolicy="no-referrer" />
                  ) : (
                    <Camera size={40} className="text-orange-500/50" />
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={e => handleImageUpload(e, 'photoURL')}
                />
                <div className="absolute -bottom-2 -right-2 bg-orange-500 w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Camera size={18} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome Profissional ou Empresa</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: João Elétrica"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-orange-500/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Categoria de Serviço</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-orange-500/50 outline-none transition-all appearance-none cursor-pointer [&>option]:bg-[#070b13] [&>option]:text-white"
                >
                  <option value="" className="bg-[#070b13] text-white">Selecione uma categoria...</option>
                  <option value="Técnica/Elétrica" className="bg-[#070b13] text-white">Técnica/Elétrica</option>
                  <option value="Técnica/Encanador" className="bg-[#070b13] text-white">Técnica/Encanador</option>
                  <option value="Limpeza" className="bg-[#070b13] text-white">Limpeza</option>
                  <option value="Beleza/Estética" className="bg-[#070b13] text-white">Beleza/Estética</option>
                  <option value="Tecnologia" className="bg-[#070b13] text-white">Tecnologia</option>
                  <option value="Pintura/Reformas" className="bg-[#070b13] text-white">Pintura/Reformas</option>
                  <option value="Outros" className="bg-[#070b13] text-white">Outros</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">WhatsApp</label>
                <input 
                  type="text" 
                  value={formData.whatsapp} 
                  onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-orange-500/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Localização</label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="Cidade, UF"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-orange-500/50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Descrição</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Descreva suas habilidades e serviços..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-orange-500/50 outline-none transition-all h-32 resize-none"
              />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-10">
              <span className="text-[10px] bg-blue-500/10 text-blue-500 font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-blue-500/20">Passo 02/03</span>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mt-4">Documentação e Banner</h2>
              <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold">Segurança para você e para o cliente</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">CPF ou CNPJ</label>
                <input 
                  type="text" 
                  value={formData.cpfCnpj} 
                  onChange={e => setFormData({...formData, cpfCnpj: e.target.value.replace(/\D/g, '')})}
                  placeholder="Doc de identificação"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-orange-500/50 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Banner / Foto de Capa</label>
                <div className="relative">
                  <input type="file" className="hidden" id="banner-upload" accept="image/*" onChange={(e) => handleImageUpload(e, 'bannerURL')} />
                  <label htmlFor="banner-upload" className="w-full bg-[#121826] border border-white/10 rounded-2xl p-4 text-gray-400 text-sm cursor-pointer hover:border-orange-500 transition-all flex items-center justify-between">
                    <span>{formData.bannerURL ? 'Banner Selecionado ✅' : 'Subir Banner'}</span>
                    <Camera size={18} />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Comprovante Profissional (Opcional)</label>
              <div className="relative">
                <input type="file" className="hidden" id="doc-upload" accept="image/*,application/pdf" onChange={(e) => handleImageUpload(e, 'documentUrl')} />
                <label htmlFor="doc-upload" className="w-full border-dashed border-2 border-white/10 rounded-3xl p-8 text-center cursor-pointer hover:border-orange-500/50 transition-all flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {formData.documentUrl ? 'Documento anexado!' : 'Anexe uma foto do documento ou diploma'}
                  </div>
                  <p className="text-[10px] text-gray-600 font-medium italic">Isso acelera sua ativação de verificado.</p>
                </label>
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-10">
              <span className="text-[10px] bg-green-500/10 text-green-500 font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-green-500/20">Passo 03/03</span>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mt-4">Valores e Atendimento</h2>
              <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold">Defina como você trabalha</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Preço Sugerido (R$)</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input 
                    type="number" 
                    value={formData.pricePerService} 
                    onChange={e => setFormData(s => ({ ...s, pricePerService: Number(e.target.value) }))}
                    className="w-full bg-[#121826] border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm outline-none focus:border-orange-500 transition-all" 
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Área de Atuação (Km)</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input 
                    type="text" 
                    value={formData.serviceArea} 
                    onChange={e => setFormData(s => ({ ...s, serviceArea: e.target.value }))}
                    className="w-full bg-[#121826] border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm outline-none focus:border-orange-500 transition-all font-sans" 
                    placeholder="Ex: 15km"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 block">Horários de Atendimento</label>
              {formData.workingHours?.map((w, i) => (
                <div key={`working-hour-${i}`} className="grid grid-cols-3 gap-3">
                  <input type="text" value={w.day} className="bg-[#121826] border border-white/5 rounded-xl p-3 text-white text-[10px] font-bold uppercase tracking-tighter" readOnly />
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-600" />
                    <input type="time" value={w.start} onChange={e => {
                      const newHours = [...(formData.workingHours || [])];
                      newHours[i].start = e.target.value;
                      setFormData(s => ({ ...s, workingHours: newHours }));
                    }} className="bg-[#070b13] border border-white/10 rounded-xl p-2.5 text-white text-[10px] flex-grow outline-none focus:border-orange-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-600" />
                    <input type="time" value={w.end} onChange={e => {
                      const newHours = [...(formData.workingHours || [])];
                      newHours[i].end = e.target.value;
                      setFormData(s => ({ ...s, workingHours: newHours }));
                    }} className="bg-[#070b13] border border-white/10 rounded-xl p-2.5 text-white text-[10px] flex-grow outline-none focus:border-orange-500" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl flex items-start gap-4 mt-8">
              <ShieldCheck className="text-orange-500 shrink-0 mt-0.5" size={24} />
              <div>
                <h4 className="text-white font-bold text-sm italic uppercase tracking-tighter">Ativação de Conta</h4>
                <p className="text-gray-500 text-[10px] font-medium leading-relaxed mt-1">Ao finalizar, você será redirecionado para o checkout Kirvano para ativar sua assinatura e começar a receber pedidos.</p>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="relative w-full max-w-2xl bg-[#070b13] border border-white/10 rounded-[48px] overflow-hidden flex flex-col h-[90vh] shadow-[0_0_100px_rgba(249,115,22,0.1)]"
      >
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-white/5 flex">
          {[1,2,3].map(i => (
            <div 
              key={`progress-${i}`} 
              className={`flex-grow h-full transition-all duration-500 ${i <= step ? 'bg-orange-500' : 'bg-transparent'}`} 
            />
          ))}
        </div>

        <div className="flex-grow overflow-y-auto p-8 md:p-12 no-scrollbar">
          {renderStep()}
        </div>

        <div className="p-8 border-t border-white/5 bg-[#121826]/50 flex justify-between items-center bg-white/[0.02]">
          <button 
            onClick={step === 1 ? onCancel : prevStep}
            className="flex items-center gap-2 text-gray-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-colors font-sans"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <button 
            onClick={nextStep}
            disabled={loading}
            className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Spinner size={16} /> : (step === 3 ? 'Finalizar e Pagar' : 'Próximo')} 
            {!loading && <ArrowRight size={16} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
