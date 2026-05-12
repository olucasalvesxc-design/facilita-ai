import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Zap, 
  Target, 
  ListOrdered, 
  ShieldCheck, 
  ChevronRight, 
  X,
  Star
} from 'lucide-react';

interface OnboardingStep {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  image?: string;
}

const STEPS: OnboardingStep[] = [
  {
    title: "Bem-vindo ao Facilita Aí",
    subtitle: "Sua nova plataforma de serviços premium",
    description: "Conectamos você aos melhores profissionais da região com segurança, agilidade e transparência.",
    icon: Star,
    color: "bg-orange-500",
  },
  {
    title: "Modo SOS",
    subtitle: "Emergências não esperam",
    description: "Precisa de um eletricista ou encanador agora? Ative o Modo SOS para ver apenas quem está online e pronto para atender.",
    icon: Zap,
    color: "bg-orange-500",
  },
  {
    title: "Fila Digital",
    subtitle: "Diga adeus às esperas",
    description: "Entre em filas virtuais e acompanhe sua posição em tempo real. Nós te avisamos quando for sua vez.",
    icon: ListOrdered,
    color: "bg-blue-500",
  },
  {
    title: "Orçamento Inteligente",
    subtitle: "O melhor preço, rápido",
    description: "Descreva o que precisa e receba propostas personalizadas de profissionais verificados em minutos.",
    icon: Target,
    color: "bg-green-500",
  },
  {
    title: "Tudo Pronto!",
    subtitle: "Sua segurança é nossa prioridade",
    description: "Todos os profissionais passam por verificação rigorosa. Explore o mapa e facilite sua vida hoje.",
    icon: ShieldCheck,
    color: "bg-purple-500",
  }
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already seen onboarding
    const seen = localStorage.getItem('facilita_onboarding_seen');
    if (!seen) {
      setIsVisible(true);
    } else {
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('facilita_onboarding_seen', 'true');
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#070b13]/95 backdrop-blur-xl px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="w-full max-w-md bg-[#121826] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl"
      >
        {/* Progress Bar */}
        <div className="flex h-1 gap-1 px-8 pt-8">
          {STEPS.map((s, i) => (
            <div 
              key={`step-${i}`} 
              className={`h-full flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-orange-500' : 'bg-white/10'}`} 
            />
          ))}
        </div>

        <div className="p-8 pb-12 flex flex-col items-center text-center">
          <button 
            onClick={handleSkip}
            className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center"
            >
              <div className={`w-20 h-20 ${step.color} rounded-3xl flex items-center justify-center text-white mb-8 shadow-lg shadow-${step.color.split('-')[1]}-500/20`}>
                <Icon size={40} strokeWidth={2.5} />
              </div>

              <h2 className="text-white font-black text-xl uppercase italic leading-none mb-2 tracking-tighter">
                {step.title}
              </h2>
              <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.2em] mb-6">
                {step.subtitle}
              </p>
              <p className="text-gray-400 text-sm font-medium leading-relaxed px-4">
                {step.description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="w-full mt-12">
            <button 
              onClick={handleNext}
              className="w-full bg-white text-[#070b13] py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 group active:scale-95 transition-all shadow-xl"
            >
              {currentStep === STEPS.length - 1 ? 'Começar Agora' : 'Próximo'}
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleSkip}
              className="mt-4 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              Pular tutorial
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
