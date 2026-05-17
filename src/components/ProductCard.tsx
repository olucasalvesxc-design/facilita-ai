import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, MapPin, Tag, ShieldCheck, X, Truck, Store, Package, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onBuy?: (product: Product) => void;
  onClick?: (product: Product) => void;
  onViewSeller?: (proId: string) => void;
  distance?: number;
}

const PLAN_COLORS = {
  start: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  pro: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  ultra: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
};

const PLAN_LABELS = {
  start: 'Start',
  pro: 'Pro',
  ultra: 'Ultra'
};

const DELIVERY_LABELS: Record<string, string> = {
  retirada: 'Retirada no local',
  entrega_local: 'Entrega local',
  combinar: 'A combinar',
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}

function ProductModal({ product, onClose, onBuy, onViewSeller }: { product: Product; onClose: () => void; onBuy?: (p: Product) => void; onViewSeller?: (proId: string) => void }) {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Olá! Vi o produto *${product.name}* no Facilita Aí por ${formatPrice(product.price)} e tenho interesse!`);
    if (onBuy) { onBuy(product); return; }
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full sm:max-w-lg bg-[#0d121f] border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Image */}
        <div className="relative h-56 sm:h-72 shrink-0">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d121f] via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all">
            <X size={18} />
          </button>
          {product.proSubscriptionPlan && (
            <div className={`absolute top-4 left-4 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${PLAN_COLORS[product.proSubscriptionPlan as keyof typeof PLAN_COLORS]}`}>
              Vendedor {PLAN_LABELS[product.proSubscriptionPlan as keyof typeof PLAN_LABELS]}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <Tag size={12} className="text-orange-500 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">{product.category}</span>
          </div>

          <h2 className="text-2xl font-black text-white leading-tight mb-2">{product.name}</h2>

          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Store size={13} className="text-gray-500 shrink-0" />
              <span className="text-xs text-gray-500 font-bold">{product.proName}</span>
            </div>
            {onViewSeller && (
              <button
                onClick={() => { onClose(); onViewSeller(product.proId); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                <Store size={11} /> Ver Perfil
              </button>
            )}
          </div>

          <p className="text-sm text-gray-400 leading-relaxed mb-6">{product.description}</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-2">
              <Truck size={14} className="text-orange-500 shrink-0" />
              <span className="text-xs text-gray-300 font-medium">{DELIVERY_LABELS[product.deliveryMethod] || 'A combinar'}</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-2">
              <Package size={14} className="text-orange-500 shrink-0" />
              <span className="text-xs text-gray-300 font-medium">{product.stock > 0 ? `${product.stock} em estoque` : 'Sob encomenda'}</span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              {product.oldPrice > 0 && product.oldPrice > product.price && (
                <span className="text-xs text-gray-500 line-through block">{formatPrice(product.oldPrice)}</span>
              )}
              <span className="text-3xl font-black text-white tracking-tighter italic">{formatPrice(product.price)}</span>
            </div>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-3 rounded-2xl font-black text-sm transition-all shadow-xl shadow-[#25D366]/20 active:scale-95"
            >
              <MessageCircle size={18} />
              Comprar no WhatsApp
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onBuy, onClick, onViewSeller, distance }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className={`group relative bg-[#0d121f] rounded-[20px] overflow-hidden border transition-all duration-300 flex flex-col h-full ${
          product.proSubscriptionPlan === 'ultra'
            ? 'border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.08)]'
            : product.proSubscriptionPlan === 'pro'
            ? 'border-orange-500/20 hover:border-orange-500/40'
            : 'border-white/5 hover:border-white/10'
        }`}
      >
        {/* Image */}
        <div className="relative h-40 sm:h-44 overflow-hidden cursor-pointer" onClick={() => { onClick?.(product); setShowModal(true); }}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d121f] via-transparent to-transparent opacity-70" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Tag size={9} className="text-orange-500" />
              <span className="text-[9px] font-black uppercase tracking-wider text-white">{product.category}</span>
            </div>
          </div>

          {distance !== undefined && (
            <div className="absolute top-3 right-3 bg-orange-500 px-2 py-0.5 rounded-full flex items-center gap-1">
              <MapPin size={9} className="text-white fill-white" />
              <span className="text-[9px] font-black text-white">{distance}km</span>
            </div>
          )}

          {product.proSubscriptionPlan === 'ultra' && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-yellow-500/90 px-2 py-0.5 rounded-full">
              <ShieldCheck size={9} className="text-[#0d121f]" />
              <span className="text-[8px] font-black uppercase text-[#0d121f]">Premium</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[10px] text-gray-500 font-bold truncate">{product.proName}</span>
              {(product as any).proIsVerified && (
                <div className="shrink-0 w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center" title="Verificado">
                  <ShieldCheck size={8} className="text-white" strokeWidth={3} />
                </div>
              )}
            </div>
            {product.proSubscriptionPlan && (
              <span className={`shrink-0 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${PLAN_COLORS[product.proSubscriptionPlan as keyof typeof PLAN_COLORS]}`}>
                {PLAN_LABELS[product.proSubscriptionPlan as keyof typeof PLAN_LABELS]}
              </span>
            )}
          </div>

          <h3
            className="text-sm font-black text-white leading-snug mb-1 line-clamp-2 cursor-pointer hover:text-orange-500 transition-colors"
            onClick={() => { onClick?.(product); setShowModal(true); }}
          >
            {product.name}
          </h3>

          <p className="text-[11px] text-gray-600 line-clamp-1 mb-3 italic flex-grow">{product.description}</p>

          {/* Price + Buttons */}
          <div className="flex items-center justify-between gap-2 mt-auto">
            <div>
              {product.oldPrice > 0 && product.oldPrice > product.price && (
                <span className="text-[9px] text-gray-600 line-through block leading-none">{formatPrice(product.oldPrice)}</span>
              )}
              <span className="text-base font-black text-white tracking-tighter italic">{formatPrice(product.price)}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Ver anúncio */}
              <button
                onClick={() => { onClick?.(product); setShowModal(true); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/25 transition-all text-[9px] font-black uppercase tracking-wider"
              >
                <Eye size={12} />
                Ver
              </button>

              {/* WhatsApp */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                className="flex items-center gap-1 bg-[#25D366] hover:bg-[#20ba59] text-white px-2.5 py-1.5 rounded-xl transition-all shadow-lg shadow-[#25D366]/20 active:scale-95 text-[9px] font-black uppercase tracking-wider"
              >
                <MessageCircle size={12} />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <ProductModal
            product={product}
            onClose={() => setShowModal(false)}
            onBuy={onBuy}
            onViewSeller={onViewSeller}
          />
        )}
      </AnimatePresence>
    </>
  );
};
