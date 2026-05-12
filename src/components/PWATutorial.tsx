import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Apple, 
  ChevronRight, 
  Share, 
  MoreVertical, 
  Download,
  PlusSquare,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const PWATutorial = () => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');

  const androidSteps = [
    { text: 'Abra o Facilita Aí pelo Google Chrome.', icon: Smartphone },
    { text: 'Toque nos três pontinhos no canto superior direito.', icon: MoreVertical },
    { text: 'Toque em “Adicionar à tela inicial” ou “Instalar app”.', icon: Download },
    { text: 'Confirme em “Adicionar”.', icon: CheckCircle2 },
    { text: 'Pronto! O Facilita Aí aparecerá como um app no seu celular.', icon: Smartphone },
  ];

  const iosSteps = [
    { text: 'Abra o Facilita Aí pelo Safari.', icon: Smartphone },
    { text: 'Toque no botão de compartilhar.', icon: Share },
    { text: 'Role a tela e toque em “Adicionar à Tela de Início”.', icon: PlusSquare },
    { text: 'Confirme em “Adicionar”.', icon: CheckCircle2 },
    { text: 'Pronto! O Facilita Aí aparecerá como um app no seu iPhone.', icon: Smartphone },
  ];

  const currentSteps = activeTab === 'android' ? androidSteps : iosSteps;

  return (
    <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-24" id="install-app">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full text-orange-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-4"
          >
            <Smartphone size={14} /> Aplicativo Web
          </motion.div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-6">
            Instale o Facilita Aí <br className="hidden sm:block" /> no seu celular
          </h2>
          <p className="text-gray-500 text-sm sm:text-lg font-medium max-w-2xl mx-auto opacity-70">
            Tenha acesso rápido aos melhores profissionais sem precisar baixar nada na Play Store ou App Store.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-3 px-6 sm:px-10 py-4 rounded-2xl sm:rounded-3xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all ${activeTab === 'android' ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-white/5'}`}
          >
            <Smartphone size={18} /> Android
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-3 px-6 sm:px-10 py-4 rounded-2xl sm:rounded-3xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all ${activeTab === 'ios' ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-white/5'}`}
          >
            <Apple size={18} /> iPhone
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Instructions List */}
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-black text-white mb-6 uppercase italic tracking-tight">
              {activeTab === 'android' ? 'Como instalar no Android' : 'Como instalar no iPhone'}
            </h3>
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3"
                >
                  {currentSteps.map((step, i) => (
                    <motion.div
                      key={`step-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4 p-5 bg-[#121826] border border-white/5 rounded-2xl sm:rounded-3xl group hover:border-orange-500/30 transition-all"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-lg">
                        <step.icon size={20} className="sm:size-24" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-orange-500/60 uppercase tracking-widest block mb-1">Passo {i + 1}</span>
                        <p className="text-white text-sm sm:text-base font-bold leading-relaxed">{step.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="pt-8">
              <button className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl sm:rounded-3xl text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-2xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group">
                <Download size={20} className="group-hover:bounce" /> Instalar Agora
              </button>
            </div>
          </div>

          {/* Device Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute inset-0 bg-orange-500/20 blur-[120px] -z-10 rounded-full scale-75" />
            
            <motion.div
              initial={{ opacity: 0, y: 50, rotate: 5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              className="relative w-[280px] sm:w-[320px] aspect-[9/19] bg-black rounded-[48px] border-[8px] border-[#1e293b] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1e293b] rounded-b-2xl z-20" /> {/* Notch */}
              
              <div className="absolute inset-0 bg-[#070b13] flex flex-col p-4 pt-12">
                <div className="flex items-center gap-2 mb-8">
                   <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-xs font-black text-white">F</div>
                   <span className="text-white font-black text-xs uppercase tracking-tighter">Facilita Aí</span>
                </div>
                
                <div className="space-y-4">
                  <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                  <div className="h-2 w-full bg-white/10 rounded-full" />
                  <div className="h-32 w-full bg-white/5 rounded-3xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-white/5 rounded-2xl" />
                    <div className="h-20 bg-white/5 rounded-2xl" />
                  </div>
                </div>

                <div className="mt-auto pb-4">
                   <div className="grid grid-cols-4 gap-4">
                      {/* App Icon on Home Screen Representation */}
                        <div key="mockup-app-icon" className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/40 relative">
                             <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-black">1</div>
                             <Smartphone size={24} />
                          </div>
                          <span className="text-[8px] text-gray-500 font-bold">Facilita Aí</span>
                        </div>
                        <div key="mockup-placeholder-1" className="w-12 h-12 bg-white/5 rounded-2xl" />
                        <div key="mockup-placeholder-2" className="w-12 h-12 bg-white/5 rounded-2xl" />
                        <div key="mockup-placeholder-3" className="w-12 h-12 bg-white/5 rounded-2xl" />
                   </div>
                </div>
              </div>

              {/* Install Overlay (Simulated) */}
              <AnimatePresence>
                <motion.div 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute bottom-4 left-4 right-4 bg-[#121826]/95 backdrop-blur-xl border border-white/10 p-5 rounded-[24px] shadow-2xl z-20"
                >
                  <div className="flex gap-4 items-center mb-4">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">F</div>
                    <div>
                      <p className="text-white text-xs font-black tracking-tight uppercase">Deseja instalar?</p>
                      <p className="text-gray-500 text-[9px] font-medium">Adicione Facilita Aí à tela inicial</p>
                    </div>
                  </div>
                  <button className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                    Adicionar
                  </button>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Accent Elements */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-orange-500/20 blur-2xl rounded-full" />
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};
