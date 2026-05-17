import React from 'react';
import { motion } from 'motion/react';
import { Star, MessageSquare, Heart, ShieldCheck, MessageCircle } from 'lucide-react';
import { Professional } from '../types';

interface ProfessionalCardProps {
  pro: Professional;
  onSelect: (pro: Professional) => void;
  onChat: (pro: Professional) => void;
  onLike: (proId: string) => void;
  isLiked: boolean;
  delay?: number;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ pro, onSelect, onChat, onLike, isLiked, delay = 0 }) => {
  const openWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pro.whatsapp) {
      const number = pro.whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/${number}`, '_blank');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: delay
      }}
      whileHover={{ 
        y: -12, 
        scale: 1.02, 
        transition: { type: "spring", stiffness: 400, damping: 15 }
      }}
      onClick={() => onSelect(pro)}
      className="bg-[#121826]/40 backdrop-blur-3xl border border-white/5 rounded-[36px] overflow-hidden cursor-pointer group relative shadow-2xl hover:border-orange-500/20 active:scale-95 transition-all duration-500"
    >
      {/* Favorite Button */}
      <motion.button 
        whileTap={{ scale: 0.8 }}
        onClick={(e) => {
          e.stopPropagation();
          onLike(pro.id);
        }}
        className="absolute top-5 right-5 z-20 w-12 h-12 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 group-hover:bg-orange-500 transition-colors shadow-2xl"
      >
        <Heart size={20} className={isLiked ? "fill-white text-white" : "text-white"} />
      </motion.button>

      <div className="relative aspect-[4/3] sm:aspect-video overflow-hidden">
        <img 
          src={pro.photoURL} 
          alt={pro.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b13]/90 via-transparent to-transparent" />
        
        {/* Rating Badge */}
        <div className="absolute bottom-5 left-5 flex items-center gap-1.5 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
          <Star size={14} className="fill-orange-500 text-orange-500" />
          <span className="text-white text-sm font-black italic">{pro.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-white font-black text-base sm:text-xl uppercase tracking-tighter italic leading-none group-hover:text-orange-500 transition-colors truncate">
            {pro.name}
          </h3>
          {pro.isVerified && <ShieldCheck size={16} className="text-blue-500" />}
        </div>
        <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] mb-6 opacity-60 truncate">
          {pro.description || pro.category}
        </p>
        
        <div className="flex items-center justify-between border-t border-white/5 pt-5">
          <div className="flex flex-col">
            <span className="text-gray-600 text-[9px] font-black uppercase tracking-widest leading-none mb-1">A partir de</span>
            <div className="flex items-baseline gap-1">
              <span className="text-orange-500 text-xl sm:text-2xl font-black italic leading-none">R$ {pro.pricePerService}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {pro.whatsapp && (
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={openWhatsApp}
                className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center border border-green-500/20 hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/10"
                title="WhatsApp"
              >
                <MessageCircle size={18} />
              </motion.button>
            )}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onChat(pro);
              }}
              className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10 group-hover:bg-orange-500 group-hover:border-orange-500/20 shadow-xl transition-all"
              title="Chat"
            >
              <MessageSquare size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
