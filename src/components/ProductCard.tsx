import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, MessageCircle, MapPin, Store, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onBuy?: (product: Product) => void;
  onClick?: (product: Product) => void;
  distance?: number;
}

const PLAN_COLORS = {
  start: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  pro: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  ultra: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
};

const PLAN_LABELS = {
  start: 'Vendedor Start',
  pro: 'Vendedor Pro',
  ultra: 'Vendedor Ultra'
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onBuy, onClick, distance }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = encodeURIComponent(`Olá, vi o produto [${product.name}] no Facilita Aí e tenho interesse em comprar.`);
    // We would need the professional's phone number here. 
    // For now, if passed via onBuy, we trigger that.
    if (onBuy) {
      onBuy(product);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={() => onClick?.(product)}
      className={`group relative bg-[#0d121f] rounded-[24px] overflow-hidden border transition-all duration-500 cursor-pointer flex flex-col h-full shadow-2xl ${
        product.proSubscriptionPlan === 'ultra' 
          ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.1)]' 
          : product.proSubscriptionPlan === 'pro'
          ? 'border-orange-500/30 hover:border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.05)]'
          : 'border-white/5 hover:border-orange-500/50'
      }`}
    >
      {/* Product Image */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d121f] via-transparent to-transparent opacity-60" />
        
        {product.proSubscriptionPlan === 'ultra' && (
          <div className="absolute top-4 left-4 bg-yellow-500 text-[#0d121f] px-3 py-1 rounded-full flex items-center gap-2 shadow-lg shadow-yellow-500/20 z-10">
            <ShieldCheck size={12} className="fill-[#0d121f]/20" />
            <span className="text-[10px] font-black uppercase tracking-widest">Destaque Premium</span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
          <Tag size={12} className="text-orange-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">{product.category}</span>
        </div>

        {/* Distance Badge */}
        {distance !== undefined && (
          <div className="absolute top-4 right-4 bg-orange-500 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-orange-500/20">
            <MapPin size={10} className="text-white fill-white" />
            <span className="text-[10px] font-black text-white">{distance}km</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-5 flex flex-col flex-grow ${product.proSubscriptionPlan === 'ultra' ? 'bg-yellow-500/5' : ''}`}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <Store size={14} className="text-orange-500" />
            <span className="text-[11px] font-bold text-gray-400 truncate tracking-tight">{product.proName}</span>
            {product.proSubscriptionPlan === 'ultra' && (
              <ShieldCheck size={14} className="text-yellow-500 fill-yellow-500/20" />
            )}
          </div>

          {product.proSubscriptionPlan && (
            <div className={`px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-wider ${PLAN_COLORS[product.proSubscriptionPlan as keyof typeof PLAN_COLORS]}`}>
              {PLAN_LABELS[product.proSubscriptionPlan as keyof typeof PLAN_LABELS]}
            </div>
          )}
        </div>

        <h3 className="text-lg font-black text-white leading-tight mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
          {product.name}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-grow italic">
          {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="flex flex-col">
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-[10px] text-gray-500 line-through font-bold">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <span className="text-xl font-black text-white tracking-tighter italic">
              {formatPrice(product.price)}
            </span>
          </div>

          <button
            onClick={handleWhatsAppClick}
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2.5 rounded-xl transition-all shadow-xl shadow-[#25D366]/20 active:scale-95 group/btn overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
            <MessageCircle size={16} className="relative z-10" />
            <span className="text-[10px] font-black uppercase tracking-wider relative z-10">Comprar no WhatsApp</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
