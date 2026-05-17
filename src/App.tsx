import React, { useState, useEffect, useMemo } from 'react';
import { calculateDistance } from './lib/utils';
import { 
  Home, ShoppingBag, MessageSquare,
  Heart, Bell, User, Settings, Filter, MapPin, LayoutGrid, List,
  Flashlight, Droplet, Brush, Hammer,
  ChevronRight, Star, X, LogIn, LogOut, ShieldCheck, Clock, Calendar, Search as SearchIcon, Plus, Phone, Package, Siren,
  Compass, Trash2, CheckCircle, Camera, Instagram, Globe, MessageCircle, Share2, ClipboardList, CreditCard, Check,
  Lock, Minus, Users, History, CalendarCheck, ListOrdered, ChevronLeft, Map as MapIcon, MoreVertical, Send, Briefcase, Zap,
  Target, Info, HelpCircle, AlertTriangle, Crown, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { compressImage } from './lib/imageUtils';
import { 
  db, auth, signInWithGoogle, logout,
  collection, query, onSnapshot, where, getDocs, updateDoc, increment,
  addDoc, serverTimestamp, setDoc, doc, getDoc, deleteDoc, orderBy, limit, startAfter, writeBatch, Timestamp,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail,
  OperationType, handleFirestoreError, debugDuplicateKeys
} from './lib/firebase';
import { clearExampleData } from './lib/seed';
import { onAuthStateChanged } from 'firebase/auth';
import { getRedirectResult } from './lib/firebase';
import { requestPushPermission } from './lib/pushNotifications';
import { Professional, Order, Product } from './types';
import { Sidebar } from './components/Sidebar';
import { ProfessionalCard } from './components/ProfessionalCard';
import { ProductCard } from './components/ProductCard';
import { PlansModal } from './components/PlansModal';
import { ImageCropModal } from './components/ImageCropModal';
import { PROFESSIONS, POPULAR_CATEGORIES, PRO_PLAN_PRICE, VERIFICATION_BADGE_PRICE } from './constants';

import { Onboarding } from './components/Onboarding';
import { IntroAnimation } from './components/IntroAnimation';
import { HeroAnimation } from './components/HeroAnimation';
import {
  StatsSection, HowItWorks, Testimonials, QuickTips, FAQSection, Footer, FeaturedCarousel, BrandShield
} from './components/HomeInfoSections';

// Lazy-loaded: only downloaded when the user navigates to each section
const ProductManagement = React.lazy(() => import('./components/ProductManagement').then(m => ({ default: m.ProductManagement })));
const EmergencySection  = React.lazy(() => import('./components/EmergencySection').then(m => ({ default: m.EmergencySection })));
const MapComponent      = React.lazy(() => import('./components/MapComponent').then(m => ({ default: m.MapComponent })));
const ChatRoom          = React.lazy(() => import('./components/Chat').then(m => ({ default: m.ChatRoom })));
const ChatList          = React.lazy(() => import('./components/ChatList').then(m => ({ default: m.ChatList })));
const PortfolioManager  = React.lazy(() => import('./components/Portfolio').then(m => ({ default: m.PortfolioManager })));
const PortfolioGallery  = React.lazy(() => import('./components/Portfolio').then(m => ({ default: m.PortfolioGallery })));
const MapSearch         = React.lazy(() => import('./components/MapSearch').then(m => ({ default: m.MapSearch })));
const PWATutorial       = React.lazy(() => import('./components/PWATutorial').then(m => ({ default: m.PWATutorial })));
const ProfessionalOnboarding = React.lazy(() => import('./components/ProfessionalOnboarding').then(m => ({ default: m.ProfessionalOnboarding })));
const ServiceManagement = React.lazy(() => import('./components/ServiceManagement').then(m => ({ default: m.ServiceManagement })));
const BookingSystem     = React.lazy(() => import('./components/BookingSystem').then(m => ({ default: m.BookingSystem })));
const SmartBudgetModal  = React.lazy(() => import('./components/SmartBudgetModal').then(m => ({ default: m.SmartBudgetModal })));
const CompletionModal   = React.lazy(() => import('./components/CompletionModal').then(m => ({ default: m.CompletionModal })));

import { DemoBanner, AuthPromptModal, DemoTour, DemoCtaBanner } from './components/DemoOverlay';
import { MOCK_PROFESSIONALS, MOCK_PRODUCTS } from './data/mockData';

// --- Helper Components ---

class SectionErrorBoundary extends React.Component<{ children: React.ReactNode; label?: string }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
          <AlertTriangle size={40} className="text-orange-500" />
          <h3 className="text-white font-black uppercase text-lg">Erro ao carregar {this.props.label || 'seção'}</h3>
          <p className="text-gray-500 text-sm">Recarregue a página ou tente novamente mais tarde.</p>
          <button onClick={() => this.setState({ error: false })} className="mt-2 px-6 py-3 bg-orange-500 text-white font-black rounded-2xl text-sm active:scale-95 transition-all">
            Tentar novamente
          </button>
        </div>
      );
    }
    return (
      <React.Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        {this.props.children}
      </React.Suspense>
    );
  }
}

const Spinner = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    className={`inline-block ${className}`}
    style={{ width: size, height: size }}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="w-full h-full">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" fill="none" />
      <path className="opacity-100" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
    </svg>
  </motion.div>
);

const CategoryCard = ({ imageURL, title, count, active, onClick }: any) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    onClick={onClick}
    className={`relative h-48 sm:h-64 rounded-[32px] overflow-hidden cursor-pointer group transition-all border ${active ? 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]' : 'border-white/5'}`}
  >
    {/* Background Image with Zoom */}
    <motion.div 
      className="absolute inset-0 z-0"
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
    >
      <img 
        src={imageURL} 
        alt={title} 
        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b13] via-[#070b13]/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
    </motion.div>

    {/* Content */}
    <div className="absolute inset-0 z-10 p-5 sm:p-7 flex flex-col justify-end items-center text-center">
      <motion.h3 
        className="font-black text-sm sm:text-xl text-white uppercase italic tracking-tighter leading-none mb-1 group-hover:scale-110 transition-transform"
      >
        {title}
      </motion.h3>
      <p className="text-gray-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-80">
        {count} profissionais
      </p>
      
      {active && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute top-4 right-4 w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.8)]"
        />
      )}
    </div>
  </motion.div>
);

const STATUS_LABEL: Record<string, string> = {
  pending: 'Aguardando', confirmed: 'Confirmado', scheduled: 'Agendado',
  in_progress: 'Em andamento', completed: 'Concluído', cancelled: 'Cancelado',
};
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-blue-500/10 text-blue-400',
  confirmed: 'bg-orange-500/10 text-orange-400',
  scheduled: 'bg-orange-500/10 text-orange-400',
  in_progress: 'bg-yellow-500/10 text-yellow-400',
  completed: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

const OrderItem = ({ order, onRebuy, onCancel, onDelete, onAdvanceStatus, onComplete, isCancelling, isDeleting, isAdvancing }: any) => {
  const uid = auth.currentUser?.uid;
  const isClient = uid === order.clientId;
  const isPro = uid === order.professionalId;
  const isSmartBudgetPending = order.type === 'smart_budget' && !order.professionalId;
  const canAdvance = !isSmartBudgetPending && (isClient || isPro) && (order.status === 'confirmed' || order.status === 'pending' || order.status === 'in_progress' || order.status === 'scheduled');
  const nextStatus = (order.status === 'confirmed' || order.status === 'pending' || order.status === 'scheduled') ? 'in_progress' : 'completed';
  const nextLabel = nextStatus === 'in_progress' ? 'Iniciar Serviço' : 'Marcar Concluído';
  const alreadyRated = order.rating && (isClient ? order.rating.clientRating : order.rating.proRating);

  return (
    <div className="flex flex-col py-4 border-b border-white/5 last:border-0 group gap-3">
      <div className="flex items-center justify-between cursor-pointer hover:bg-white/5 px-2 rounded-lg transition-colors">
        <div className="flex flex-col gap-0.5">
          <h4 className="font-bold text-sm text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight">
            {order.serviceTitle || order.title}
          </h4>
          <p className="text-gray-500 text-[10px]">
            {order.type === 'smart_budget' ? (order.category || 'Orçamento Inteligente') : (order.professionalName || order.clientName)}
          </p>
          {order.price && (
            <p className="text-orange-400 text-[10px] font-black">
              R$ {Number(order.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          )}
          {isSmartBudgetPending && (
            <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mt-0.5">
              Aguardando propostas de profissionais
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-lg text-[9px] font-bold ${STATUS_COLOR[order.status] ?? 'bg-white/5 text-gray-500'}`}>
            {STATUS_LABEL[order.status] ?? order.status}
          </div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(order.id); }}
            disabled={isDeleting}
            className="relative z-30 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center min-w-[36px] min-h-[36px]"
            title="Excluir pedido"
          >
            {isDeleting ? <Spinner size={14} /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 ml-2 flex-wrap">
        {/* Advance status */}
        {canAdvance && (
          <button
            onClick={() => nextStatus === 'completed' ? onComplete(order) : onAdvanceStatus(order.id, nextStatus)}
            disabled={isAdvancing}
            className={`text-[10px] font-black uppercase tracking-widest text-white px-4 py-2 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
              nextStatus === 'completed'
                ? 'bg-green-500 shadow-green-500/20 hover:bg-green-600'
                : 'bg-orange-500 shadow-orange-500/20 hover:bg-orange-600'
            }`}
          >
            {isAdvancing ? <Spinner size={12} /> : <Check size={13} strokeWidth={3} />}
            {isAdvancing ? 'Atualizando...' : nextLabel}
          </button>
        )}

        {/* Rate (if completed and not yet rated) */}
        {order.status === 'completed' && !alreadyRated && onComplete && (
          <button
            onClick={() => onComplete(order)}
            className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl hover:bg-orange-500/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Star size={13} fill="currentColor" />
            Avaliar
          </button>
        )}

        {/* Rebuy */}
        {order.status === 'completed' && (
          <button
            onClick={() => onRebuy(order)}
            className="text-[10px] font-black uppercase tracking-widest text-white bg-white/5 border border-white/5 px-4 py-2 rounded-xl hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2"
          >
            <Zap size={13} />
            Pedir Novamente
          </button>
        )}

        {/* Cancel */}
        {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'in_progress' || order.status === 'scheduled') && (
          <button
            onClick={(e) => { e.stopPropagation(); onCancel(order.id); }}
            disabled={isCancelling}
            className="text-[10px] font-bold text-gray-500 hover:text-red-400 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            {isCancelling ? <Spinner size={12} /> : <X size={13} />}
            {isCancelling ? 'Cancelando...' : 'Cancelar'}
          </button>
        )}
      </div>
    </div>
  );
};

const InfiniteScrollTrigger = ({ onClick, loading, hasMore }: any) => {
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading) return;
    
    let observer: IntersectionObserver | null = null;
    try {
      if (typeof window !== 'undefined' && 'IntersectionObserver' in window && typeof window.IntersectionObserver === 'function') {
        observer = new window.IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            onClick();
          }
        }, { threshold: 0.1 });

        if (ref.current && observer) {
          observer.observe(ref.current);
        }
      }
    } catch (e) {
      console.warn('IntersectionObserver failed to initialize:', e);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [hasMore, loading, onClick]);

  if (!hasMore) return null;

  return (
    <div ref={ref} className="pt-8 pb-4 flex justify-center items-center gap-3">
      <Spinner size={16} className="text-orange-500" />
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">
        Carregando mais...
      </span>
    </div>
  );
};

const BottomNav = ({ activeTab, onTabChange, userRole, onPublishService, onPublishProduct }: {
  activeTab: string,
  onTabChange: (tab: string) => void,
  userRole?: string,
  onPublishService?: () => void,
  onPublishProduct?: () => void
}) => {
  const [showPublishMenu, setShowPublishMenu] = React.useState(false);

  return (
    <>
      <AnimatePresence>
        {showPublishMenu && (
          <motion.div
            key="publish-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[98] bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setShowPublishMenu(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPublishMenu && (
          <motion.div
            key="publish-menu"
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-[99] w-72 bg-[#121826] border border-white/10 rounded-3xl p-5 shadow-2xl lg:hidden"
          >
            <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] text-center mb-4">O que deseja publicar?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setShowPublishMenu(false); onPublishService?.(); }}
                className="flex flex-col items-center gap-3 p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 active:scale-95 transition-all"
              >
                <Briefcase size={26} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-tight text-center">Publicar Serviço</span>
              </button>
              <button
                onClick={() => { setShowPublishMenu(false); onPublishProduct?.(); }}
                className="flex flex-col items-center gap-3 p-5 bg-white/5 border border-white/10 rounded-2xl text-white active:scale-95 transition-all"
              >
                <Package size={26} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-tight text-center">Publicar Produto</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 w-full bg-[#070b13]/90 backdrop-blur-3xl border-t border-white/5 px-4 flex items-center justify-between z-[100] h-20 pb-[env(safe-area-inset-bottom,0px)] lg:hidden">
        <button onClick={() => onTabChange('home')} className={`flex flex-col items-center justify-center gap-1.5 transition-all w-16 ${activeTab === 'home' ? 'text-orange-500' : 'text-gray-500'}`}>
          <Compass size={22} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-widest">Explorar</span>
        </button>

        <button onClick={() => onTabChange('orders')} className={`flex flex-col items-center justify-center gap-1.5 transition-all w-16 ${activeTab === 'orders' ? 'text-orange-500' : 'text-gray-500'}`}>
          <ClipboardList size={22} strokeWidth={activeTab === 'orders' ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-widest">Serviços</span>
        </button>

        <div className="relative h-full flex items-center justify-center w-20">
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPublishMenu(prev => !prev)}
            className={`w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-[0_10px_30px_rgba(249,115,22,0.4)] border-4 border-[#070b13] z-10 transition-transform duration-200 ${showPublishMenu ? 'rotate-45' : ''}`}
          >
            <Plus size={28} strokeWidth={3} />
          </motion.button>
        </div>

        <button onClick={() => onTabChange('products')} className={`flex flex-col items-center justify-center gap-1.5 transition-all w-16 ${activeTab === 'products' ? 'text-orange-500' : 'text-gray-500'}`}>
          <ShoppingBag size={22} strokeWidth={activeTab === 'products' ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-widest">Produtos</span>
        </button>

        <button onClick={() => onTabChange('profile')} className={`flex flex-col items-center justify-center gap-1.5 transition-all w-16 ${activeTab === 'profile' ? 'text-orange-500' : 'text-gray-500'}`}>
          <User size={22} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-widest">Perfil</span>
        </button>
      </nav>
    </>
  );
};

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const orangeIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="bg-orange-500 p-2 rounded-lg shadow-lg border-2 border-white flex items-center justify-center">
      <MapPin size={16} className="text-white fill-white" />
    </div>
  ),
  className: 'custom-div-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Helper para detectar chaves duplicadas (Removido daqui pois agora vem de lib/firebase)
export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeToast, setActiveToast] = useState<any>(null);
  const prevNotifsRef = React.useRef<any[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loadingPros, setLoadingPros] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const adminRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.price || 0), 0);
  }, [orders]);
  const [proOrders, setProOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetDate, setBudgetDate] = useState('');
  const [budgetTime, setBudgetTime] = useState('');
  const [budgetDescription, setBudgetDescription] = useState('');
  const [budgetPro, setBudgetPro] = useState<Professional | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState<string>('');
  const [activeChatRecipientId, setActiveChatRecipientId] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(() => !!new URLSearchParams(window.location.search).get('ref') || !!sessionStorage.getItem('inviteRef'));
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authCpf, setAuthCpf] = useState('');
  const [authWhatsApp, setAuthWhatsApp] = useState('');
  const [authLocation, setAuthLocation] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authResetMessage, setAuthResetMessage] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('intro_shown'));
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDemoTour, setShowDemoTour] = useState(false);
  const [showAuthPromptDemo, setShowAuthPromptDemo] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState('');
  const [isActionLoading, setIsActionLoading] = useState<Record<string, boolean>>({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [cropModal, setCropModal] = useState<{ src: string; type: 'photo' | 'banner' } | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    whatsapp: '',
    bio: '',
    location: '',
    photoURL: '',
    bannerURL: '',
    skills: '',
    priceRange: '',
    experience: '',
    availability: '',
    instagram: '',
    website: '',
    coordinates: null as {lat: number, lng: number} | null
  });
  const [isProOnboardingOpen, setIsProOnboardingOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [currentProfessional, setCurrentProfessional] = useState<Professional | null>(null);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isProCheckoutOpen, setIsProCheckoutOpen] = useState(false);
  const [proForm, setProForm] = useState({
    category: 'Elétrica',
    description: '',
    skills: '',
    pricePerService: 50,
    location: ''
  });
  const [orderViewTab, setOrderViewTab] = useState<'active' | 'history'>('active');
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const showConfirm = (message: string, onConfirm: () => void) => setConfirmModal({ message, onConfirm });
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [sortBy, setSortBy] = useState<'smart' | 'rating' | 'distance' | 'price' | 'responseTime'>('smart');
  const [filterOptions, setFilterOptions] = useState({
    price: 150,
    rating: 0,
    distance: 20
  });
  const [searchViewMode, setSearchViewMode] = useState<'grid' | 'alphabetical'>('grid');
  const [searchTab, setSearchTab] = useState<'app' | 'map'>('app');
  const [proDashboardTab, setProDashboardTab] = useState<'services' | 'products' | 'requests'>('services');
  const [openBudgetRequests, setOpenBudgetRequests] = useState<any[]>([]);
  const [loadingBudgetRequests, setLoadingBudgetRequests] = useState(false);
  const [publicProTab, setPublicProTab] = useState<'portfolio' | 'products'>('portfolio');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSmartBudgetModalOpen, setIsSmartBudgetModalOpen] = useState(false);
  const [completingOrder, setCompletingOrder] = useState<any>(null);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [pendingInviteRef] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) sessionStorage.setItem('inviteRef', ref);
    return ref || sessionStorage.getItem('inviteRef');
  });
  const [invitedPros, setInvitedPros] = useState<Professional[]>([]);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [showActiveProsModal, setShowActiveProsModal] = useState(false);

  const [isProPlanActive, setIsProPlanActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [prosAwaitingVerification, setProsAwaitingVerification] = useState<Professional[]>([]);
  const [adminRecentPayments, setAdminRecentPayments] = useState<Professional[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
  const [userLikedPros, setUserLikedPros] = useState<Record<string, boolean>>({});
  const [ordersLimit, setOrdersLimit] = useState(8);
  const [proOrdersLimit, setProOrdersLimit] = useState(8);
  const [productsLimit, setProductsLimit] = useState(12);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  const [hasMoreProOrders, setHasMoreProOrders] = useState(true);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProOrders, setLoadingProOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const ORDERS_PER_PAGE = 8;
  const PRODUCTS_PER_PAGE = 12;

  // Admin Check
  useEffect(() => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }

    const ADMIN_EMAIL = 'olucasalveszx@gmail.com';
    const isEmailAdmin = currentUser.email?.toLowerCase() === ADMIN_EMAIL;

    if (isEmailAdmin) {
      setIsAdmin(true);
      const userRef = doc(db, 'users', currentUser.uid);
      updateDoc(userRef, { role: 'admin', isVerified: true }).catch(console.error);
      // Adiciona à coleção admins para as regras do Firestore reconhecerem
      setDoc(doc(db, 'admins', currentUser.uid), { email: currentUser.email }, { merge: true }).catch(console.error);
    }

    const adminRef = doc(db, 'admins', currentUser.uid);
    const unsub = onSnapshot(adminRef, (snap) => {
      // Never let Firestore override email-based admin
      if (!isEmailAdmin) setIsAdmin(snap.exists());
    }, (error) => {
      console.error('Admin check error:', error);
    });

    return unsub;
  }, [currentUser]);

  // Invited pros listener
  useEffect(() => {
    if (!currentUser) { setInvitedPros([]); return; }
    const q = query(collection(db, 'professionals'), where('invitedBy', '==', currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      setInvitedPros(snap.docs.map(d => ({ id: d.id, ...d.data() } as Professional)));
    }, console.error);
    return unsub;
  }, [currentUser]);

  // Awaiting Verification Listener
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'professionals'), where('verificationStatus', '==', 'pending'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Professional));
      const unique = Array.from(new Map(items.map(p => [p.id, p])).values());
      setProsAwaitingVerification(unique);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'professionals');
    });
    return unsub;
  }, [isAdmin]);

  // Admin: Recent Payments (pros with active subscription, ordered by activation date)
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(
      collection(db, 'professionals'),
      where('subscriptionStatus', '==', 'active'),
      orderBy('lastActiveAt', 'desc'),
      limit(8)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as Professional));
      setAdminRecentPayments(Array.from(new Map(items.map((p: Professional) => [p.id, p])).values()));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'professionals(payments)');
    });
    return unsub;
  }, [isAdmin]);

  // Admin: Real Users list
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'users'), limit(500));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      const sorted = items.sort((a: any, b: any) => (a.name || a.email || '').localeCompare(b.name || b.email || ''));
      setAdminUsers(Array.from(new Map(sorted.map((u: any) => [u.id, u])).values()));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return unsub;
  }, [isAdmin]);

  // Liked Professionals Listener
  useEffect(() => {
    if (!currentUser) {
      setUserLikedPros({});
      return;
    }
    const q = query(collection(db, 'users', currentUser.uid, 'likedPros'));
    const unsub = onSnapshot(q, (snapshot) => {
      const liked: Record<string, boolean> = {};
      snapshot.docs.forEach(doc => {
        liked[doc.id] = true;
      });
      setUserLikedPros(liked);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${currentUser.uid}/likedPros`);
    });
    return unsub;
  }, [currentUser]);

  // Clear mock data once on load when user is authenticated
  useEffect(() => {
    if (currentUser) {
      clearExampleData();
    }
  }, [currentUser]);

  // Sync profileData to proForm location when modal opens
  useEffect(() => {
    if (isProModalOpen && profileData?.location) {
      setProForm(prev => ({ ...prev, location: profileData.location }));
    }
  }, [isProModalOpen, profileData]);

  // Auth Listener
  useEffect(() => {
    let profileUnsub: () => void = () => {};

    // Captura resultado do signInWithRedirect (mobile Google login)
    getRedirectResult(auth).catch((error: any) => {
      const code = error?.code || '';
      if (code && code !== 'auth/null-user') {
        const msgs: Record<string, string> = {
          'auth/popup-closed-by-user': 'Login cancelado.',
          'auth/unauthorized-domain': 'Domínio não autorizado.',
          'auth/account-exists-with-different-credential': 'E-mail já cadastrado com outro método.',
        };
        setAuthError(msgs[code] || 'Erro ao entrar com Google.');
      }
    });

    const authUnsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userRef = doc(db, 'users', user.uid);
        const proRef = doc(db, 'professionals', user.uid);
        
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const newData = {
            id: user.uid,
            name: user.displayName || 'Usuário',
            email: user.email,
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=f97316&color=fff`,
            role: 'client',
            whatsapp: '',
            cpf: '',
            bio: 'Cliente Facilita Aí',
            location: 'São Paulo, SP',
            skills: [],
            isVerified: false,
            createdAt: serverTimestamp(),
            emailNotifications: true,
            publicProfile: true,
            whatsappVisible: false
          };
          await setDoc(userRef, newData);
        }

        // Request push notification permission (silent if denied/unsupported)
        setTimeout(() => requestPushPermission(), 3000);

        profileUnsub = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setProfileData(data);

            // Sync with currentProfessional (pro ou admin podem ter perfil profissional)
            if (data.role === 'pro' || data.role === 'admin' || user.email?.toLowerCase() === 'olucasalveszx@gmail.com') {
              onSnapshot(proRef, (proSnap) => {
                if (proSnap.exists()) {
                  setCurrentProfessional({ id: proSnap.id, ...proSnap.data() } as Professional);
                } else {
                  setCurrentProfessional(null);
                }
              });
            }

            // Auto-abre onboarding se veio por convite e ainda não é pro
            const ref = sessionStorage.getItem('inviteRef');
            if (ref && data.role === 'client') {
              setIsProOnboardingOpen(true);
            }
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        });
      } else {
        setCurrentUser(null);
        setProfileData(null);
        setCurrentProfessional(null);
        if (profileUnsub) profileUnsub();
      }
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  // Demo mode: inject mock data
  useEffect(() => {
    if (isDemoMode) {
      setProfessionals(MOCK_PROFESSIONALS as any);
      setProducts(MOCK_PRODUCTS as any);
      setLoadingPros(false);
      setLoadingProducts(false);
      setProfileData({
        name: 'Visitante Demo',
        email: 'demo@facilitai.online',
        role: 'client',
        bio: 'Explorando o Facilita Aí — marketplace de profissionais e serviços locais.',
        location: 'São Paulo, SP',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=faces&auto=format&q=80',
        bannerURL: '',
        whatsapp: '',
        instagram: '',
        website: '',
        skills: [],
        emailNotifications: true,
        publicProfile: true,
        whatsappVisible: false,
      });
    } else {
      setProfileData(null);
    }
  }, [isDemoMode]);

  // Professionals Listener
  useEffect(() => {
    if (isDemoMode) return;
    setLoadingPros(true);
    const q = query(collection(db, 'professionals'));
    const unsub = onSnapshot(q, (snapshot) => {
      // Filter out professionals who look like mock data (ID starts with 'pro')
      // Also filtering by explicit isMock flag if present
      const filtered = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Professional))
        .filter(pro => {
          // If it's the current user, always show their own profile
          if (currentUser && pro.id === currentUser.uid) return true;
          
          // Filter out mock data and test profiles
          const isMockId = pro.id.startsWith('pro') || pro.id.startsWith('mock') || pro.id.length < 10;
          const proNameLower = (pro.name || '').toLowerCase();
          const isMockName = proNameLower.includes('teste') || 
                            proNameLower.includes('mock') ||
                            proNameLower.includes('joão do gás') || 
                            proNameLower.includes('maria das dores') ||
                            proNameLower.includes('demonstração');
          
          // Specific cleanup for known mock strings requested previously
          const isTargetToRemove = proNameLower.includes('lucas') && proNameLower.includes('alves');
          
          // Ensure we only show professionals that are ACTIVE and have an ACTIVE SUBSCRIPTION
          // This fulfills the "realmente ativos" request by hiding users who haven't completed onboarding/payment
          const isActive = pro.professionalStatus === 'active' && pro.subscriptionStatus === 'active';
          
          return isActive && !isMockId && !isMockName && !isTargetToRemove && (pro as any).isMock !== true;
        });

      // Remove duplicates by ID
      const unique = Array.from(new Map(filtered.map(p => [p.id, p])).values());
      
      setProfessionals(unique);
      setLoadingPros(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'professionals');
    });
    return unsub;
  }, []);

  // Orders Listener (with real-time pagination)
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      setProOrders([]);
      return;
    }

    const sortOrders = (items: Order[]) =>
      items.sort((a: any, b: any) => {
        const ta = a.date?.seconds ?? a.createdAt?.seconds ?? 0;
        const tb = b.date?.seconds ?? b.createdAt?.seconds ?? 0;
        return tb - ta;
      });

    setLoadingOrders(true);
    const qClient = query(
      collection(db, 'orders'),
      where('clientId', '==', currentUser.uid),
      limit(ordersLimit)
    );
    const unsubClient = onSnapshot(qClient, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      const unique = Array.from(new Map(items.map(o => [o.id, o])).values());
      setOrders(sortOrders(unique));
      setHasMoreOrders(snapshot.docs.length === ordersLimit);
      setLoadingOrders(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoadingOrders(false);
    });

    setLoadingProOrders(true);
    const qPro = query(
      collection(db, 'orders'),
      where('professionalId', '==', currentUser.uid),
      limit(proOrdersLimit)
    );
    const unsubPro = onSnapshot(qPro, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      const unique = Array.from(new Map(items.map(o => [o.id, o])).values());
      setProOrders(sortOrders(unique));
      setHasMoreProOrders(snapshot.docs.length === proOrdersLimit);
      setLoadingProOrders(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoadingProOrders(false);
    });

    return () => {
      unsubClient();
      unsubPro();
    };
  }, [currentUser, ordersLimit, proOrdersLimit]);

  // Products Listener
  useEffect(() => {
    setLoadingProducts(true);
    // sem orderBy para não exigir índice composto — ordenamos client-side
    const q = query(
      collection(db, 'products'),
      where('status', '==', 'active'),
      limit(productsLimit)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      const unique = Array.from(new Map(items.map(p => [p.id, p])).values());
      // ordenar por createdAt desc client-side
      unique.sort((a: any, b: any) => {
        const ta = a.createdAt?.seconds ?? 0;
        const tb = b.createdAt?.seconds ?? 0;
        return tb - ta;
      });
      setProducts(unique);
      setHasMoreProducts(snapshot.docs.length === productsLimit);
      setLoadingProducts(false);
    }, (error) => {
      console.error('Products listener error:', error);
      setLoadingProducts(false);
    });
    return unsub;
  }, [productsLimit]);

  const [proProductsLoading, setProProductsLoading] = useState(false);

  // Fetch active pro products when selected
  useEffect(() => {
    if (!selectedPro) return;
    setProProductsLoading(true);
    const q = query(
      collection(db, 'products'),
      where('proId', '==', selectedPro.id),
      where('status', '==', 'active')
    );
    getDocs(q)
      .then(snap => {
        const proProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(prev => {
          const combined = [...prev];
          proProducts.forEach(p => {
            if (!combined.find(c => c.id === p.id)) combined.push(p);
          });
          return combined;
        });
      })
      .catch(err => console.error('Error fetching pro products:', err))
      .finally(() => setProProductsLoading(false));
  }, [selectedPro?.id]);

  // Open budget requests feed — reads from smartRequests (open collection, no index needed)
  useEffect(() => {
    if (!currentUser) return;
    const ADMIN_EMAIL = 'olucasalveszx@gmail.com';
    const adminBypass = currentUser.email?.toLowerCase() === ADMIN_EMAIL || isAdmin;
    if (!adminBypass && (!currentProfessional || currentProfessional.professionalStatus !== 'active')) return;
    setLoadingBudgetRequests(true);
    const q = query(
      collection(db, 'smartRequests'),
      where('status', '==', 'pending'),
      limit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setOpenBudgetRequests(items);
      setLoadingBudgetRequests(false);
    }, (err) => {
      console.error('Error fetching budget requests:', err);
      setLoadingBudgetRequests(false);
    });
    return () => unsub();
  }, [currentProfessional?.id, currentProfessional?.professionalStatus, isAdmin]);

  // Notifications Listener (Only messages)
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as any);

      // Filter messages client-side to avoid composite index requirement
      const uniqueNotifs = Array.from(new Map(
        notifs.filter((n: any) => n.type === 'message').map((n: any) => [n.id, n])
      ).values());

      const newNotifs = uniqueNotifs.filter((n: any) => !n.read && !prevNotifsRef.current.find(prev => prev.id === n.id));
      if (newNotifs.length > 0 && activeTab !== 'chat') {
        setActiveToast(newNotifs[0]);
        setTimeout(() => setActiveToast(null), 5000);
      }

      setNotifications(uniqueNotifs);
      prevNotifsRef.current = uniqueNotifs;
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    return () => unsubscribe();
  }, [currentUser, activeTab]);

  // Location tracking
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => console.error('Error tracking location:', error),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Boa madrugada';
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const professionalsWithDistance = useMemo(() => {
    return professionals.filter(pro => (pro as any).publicProfile !== false).map(pro => {
      let distance = pro.distance || 0;
      if (userCoords && pro.coordinates) {
        distance = calculateDistance(userCoords.lat, userCoords.lng, pro.coordinates.lat, pro.coordinates.lng);
      }

      const nRating = pro.rating / 5;
      const nDistance = Math.max(0, 1 - (distance / 50));
      const resMinutes = parseInt(pro.responseTime || '60');
      const nResponse = Math.max(0, 1 - (resMinutes / 120));
      const nConversion = pro.conversionRate || 0.5;
      const nActivity = pro.status === 'online' ? 1 : 0.5;
      const nBoost = pro.isBoosted ? 1 : 0;

      const smartScore = (
        (nRating * 0.30) + 
        (nDistance * 0.25) + 
        (nResponse * 0.15) + 
        (nConversion * 0.10) + 
        (nActivity * 0.10) + 
        (nBoost * 0.10)
      );

      return { ...pro, distance: parseFloat(distance.toFixed(1)), smartScore };
    });
  }, [professionals, userCoords]);

  const productsWithDistance = useMemo(() => {
    return products.map(product => {
      let distance = 0;
      if (userCoords && product.coordinates) {
        distance = calculateDistance(userCoords.lat, userCoords.lng, product.coordinates.lat, product.coordinates.lng);
      }
      return { ...product, distance: parseFloat(distance.toFixed(1)) };
    });
  }, [products, userCoords]);

  const filteredProducts = useMemo(() => {
    return productsWithDistance.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || p.category === selectedCategory || p.name.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [productsWithDistance, searchTerm, selectedCategory]);

  const filteredPros = useMemo(() => {
    let result = professionalsWithDistance.filter(pro => {
      const matchesSearch = pro.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           pro.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !locationTerm || pro.location.toLowerCase().includes(locationTerm.toLowerCase());
      const matchesCategory = !selectedCategory || pro.category === selectedCategory;
      const matchesPrice = pro.pricePerService <= filterOptions.price;
      const matchesRating = pro.rating >= filterOptions.rating;
      const matchesDistance = (pro.distance || 0) <= filterOptions.distance;
      return matchesSearch && matchesLocation && matchesCategory && matchesPrice && matchesRating && matchesDistance;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'smart') return ((b as any).smartScore || 0) - ((a as any).smartScore || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'distance') return (a.distance || 0) - (b.distance || 0);
      if (sortBy === 'price') return (a.pricePerService || 0) - (b.pricePerService || 0);
      if (sortBy === 'responseTime') return parseInt(a.responseTime || '999') - parseInt(b.responseTime || '999');
      return 0;
    });

    return result;
  }, [professionalsWithDistance, searchTerm, locationTerm, selectedCategory, filterOptions, sortBy]);

  const alphabeticalProfessions = useMemo(() => {
    const groups: Record<string, typeof PROFESSIONS> = {};
    PROFESSIONS.slice().sort((a, b) => a.title.localeCompare(b.title)).forEach(prof => {
      const letter = prof.title[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(prof);
    });
    return Object.keys(groups).sort().map(letter => ({
      letter,
      items: groups[letter]
    }));
  }, []);

  const MapPicker = ({ lat, lng, onChange }: { lat?: number, lng?: number, onChange: (lat: number, lng: number) => void }) => {
    const [marker, setMarker] = useState<[number, number] | null>(lat && lng ? [lat, lng] : null);
    
    return (
      <div className="h-64 rounded-2xl overflow-hidden border border-white/10 relative z-0">
        <MapContainer 
          center={marker || [-23.5505, -46.6333]} 
          zoom={13} 
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler onLocationSelect={(newLat, newLng) => {
            setMarker([newLat, newLng]);
            onChange(newLat, newLng);
          }} />
          {marker && <Marker position={marker} icon={orangeIcon} />}
        </MapContainer>
        <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase z-[1000] shadow-lg">
          Clique no mapa para marcar
        </div>
      </div>
    );
  };

  const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
      click(e) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  const handleToggleSetting = async (field: string, currentValue: boolean) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        [field]: !currentValue,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
    }
  };

  const handleUpdateProfile = async (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isDemoMode) {
      const skillsArray = editForm.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      setProfileData((prev: any) => ({ ...prev, ...editForm, skills: skillsArray }));
      setIsEditingProfile(false);
      setActiveToast({ title: 'Perfil atualizado!', message: 'Suas alterações foram salvas com sucesso.' } as any);
      return;
    }
    if (!currentUser) return;
    setAuthLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const skillsArray = editForm.skills.split(',').map(s => s.trim()).filter(s => s);

      const updatedData: any = {
        name: editForm.name,
        whatsapp: editForm.whatsapp,
        bio: editForm.bio,
        location: editForm.location,
        photoURL: editForm.photoURL,
        bannerURL: editForm.bannerURL,
        skills: skillsArray,
        priceRange: editForm.priceRange,
        experience: editForm.experience,
        availability: editForm.availability,
        instagram: editForm.instagram,
        website: editForm.website,
        updatedAt: serverTimestamp()
      };
      if (editForm.coordinates) updatedData.coordinates = editForm.coordinates;

      console.log('[profile] step 1 — updating users/', currentUser.uid);
      try {
        await updateDoc(userRef, updatedData);
        console.log('[profile] step 1 — OK');
      } catch (e: any) {
        const s = e?.message || e?.code || String(e);
        console.error('[profile] step 1 FAILED:', s, e);
        throw new Error(`[users] ${s}`);
      }

      // If pro, update their professional record too
      if (profileData?.role === 'pro') {
        console.log('[profile] step 2 — updating professionals/', currentUser.uid);
        try {
          const proRef = doc(db, 'professionals', currentUser.uid);
          const proUpdate: any = {
            userId: currentUser.uid,
            name: editForm.name,
            whatsapp: editForm.whatsapp,
            description: editForm.bio,
            location: editForm.location,
            photoURL: editForm.photoURL,
            bannerURL: editForm.bannerURL,
            skills: skillsArray,
            priceRange: editForm.priceRange,
            experience: editForm.experience,
            availability: editForm.availability,
            instagram: editForm.instagram,
            website: editForm.website,
            updatedAt: serverTimestamp()
          };
          await setDoc(proRef, proUpdate, { merge: true });
          console.log('[profile] step 2 — OK');
        } catch (e: any) {
          const s = e?.message || e?.code || String(e);
          console.error('[profile] step 2 FAILED:', s, e);
          throw new Error(`[professionals] ${s}`);
        }
      }

      // Firebase Auth only accepts http/https URLs for photoURL — skip base64
      console.log('[profile] step 3 — updating Firebase Auth displayName');
      try {
        const isUrl = editForm.photoURL?.startsWith('http');
        await updateProfile(currentUser, {
          displayName: editForm.name,
          ...(isUrl ? { photoURL: editForm.photoURL } : {})
        });
        console.log('[profile] step 3 — OK');
      } catch (e: any) {
        const s = e?.message || e?.code || String(e);
        console.error('[profile] step 3 FAILED:', s, e);
        throw new Error(`[auth] ${s}`);
      }

      setIsEditingProfile(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error: any) {
      const msg = error?.message || error?.code || String(error) || 'Erro desconhecido';
      console.error('[profile] CATCH — msg:', msg, 'full:', error);
      alert(`Erro ao salvar: ${msg}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'banner' = 'photo') => {
    const file = e.target.files?.[0];
    // Reset input so same file can be selected again
    e.target.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('A imagem é muito grande. Escolha uma de até 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCropModal({ src: base64, type });
    };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async (croppedBase64: string) => {
    if (!cropModal) return;
    const type = cropModal.type;
    setCropModal(null);
    try {
      const maxW = type === 'banner' ? 1200 : 800;
      const compressed = await compressImage(croppedBase64, maxW, 0.82);
      if (type === 'banner') {
        setEditForm(prev => ({ ...prev, bannerURL: compressed }));
      } else {
        setEditForm(prev => ({ ...prev, photoURL: compressed }));
      }
    } catch {
      if (type === 'banner') {
        setEditForm(prev => ({ ...prev, bannerURL: croppedBase64 }));
      } else {
        setEditForm(prev => ({ ...prev, photoURL: croppedBase64 }));
      }
    }
  };

  const handleBecomePro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsProCheckoutOpen(true);
  };

  const handleConfirmProSubscription = async () => {
    if (!currentUser) return;
    setAuthLoading(true);
    try {
      const proRef = doc(db, 'professionals', currentUser.uid);
      const newPro: Professional = {
        id: currentUser.uid,
        userId: currentUser.uid,
        name: profileData?.name || currentUser.displayName || 'Profissional',
        photoURL: profileData?.photoURL || currentUser.photoURL || '',
        category: proForm.category,
        skills: proForm.skills.split(',').map(s => s.trim()).filter(s => s),
        description: proForm.description,
        pricePerService: Number(proForm.pricePerService),
        location: proForm.location || profileData?.location || 'Brasil',
        rating: 5.0,
        reviewCount: 0,
        status: 'online',
        professionalStatus: 'pending',
        lastActiveAt: serverTimestamp(),
        emailNotifications: profileData?.emailNotifications ?? true,
        publicProfile: profileData?.publicProfile ?? true,
        whatsappVisible: profileData?.whatsappVisible ?? false,
        whatsapp: profileData?.whatsapp || '',
        subscriptionStatus: 'pending_payment',
        subscriptionType: 'monthly_pro',
        serviceMode: 'none',
        isQueueActive: false
      };
      
      await setDoc(proRef, newPro);
      
      // Redirect to Kirvano
      const checkoutBaseUrl = import.meta.env.VITE_KIRVANO_CHECKOUT_URL || 'https://pay.kirvano.com/a9e4a8e1-a4c3-43de-933e-21cff8f3f8a3';
      const checkoutUrl = `${checkoutBaseUrl}?external_id=${currentUser.uid}&email=${encodeURIComponent(currentUser.email || '')}`;
      window.location.href = checkoutUrl;
      
      setIsProCheckoutOpen(false);
      setIsProModalOpen(false);
    } catch (error) {
      console.error('Error initiating pro subscription:', error);
      handleFirestoreError(error, OperationType.WRITE, `professionals/${currentUser.uid}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLikePro = async (proId: string) => {
    if (!currentUser) return alert('Faça login para curtir profissionais.');
    
    const isLiked = userLikedPros[proId];
    const userLikeRef = doc(db, 'users', currentUser.uid, 'likedPros', proId);
    const proRef = doc(db, 'professionals', proId);

    try {
      if (isLiked) {
        await deleteDoc(userLikeRef);
        await updateDoc(proRef, { likesCount: increment(-1) });
      } else {
        await setDoc(userLikeRef, { createdAt: serverTimestamp() });
        await updateDoc(proRef, { likesCount: increment(1) });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const demoGuard = (msg?: string): boolean => {
    if (!isDemoMode) return false;
    setAuthPromptMessage(msg || '');
    setShowAuthPromptDemo(true);
    return true;
  };

  const handleRequestBudget = (pro: Professional) => {
    if (demoGuard('Crie sua conta para solicitar orçamentos e contratar profissionais.')) return;
    if (!currentUser) return alert('Faça login primeiro.');
    setBudgetPro(pro);
    setShowBudgetModal(true);
  };

  const confirmBudgetRequest = async () => {
    if (!budgetPro || !currentUser) return;
    if (!budgetDate || !budgetTime) return alert('Selecione data e hora.');
    setIsActionLoading(prev => ({ ...prev, confirmBudget: true }));
    try {
      const scheduledAt = new Date(`${budgetDate}T${budgetTime}`);
      await addDoc(collection(db, 'orders'), {
        clientId: currentUser.uid,
        clientName: profileData?.name || currentUser.displayName,
        professionalId: budgetPro.id,
        professionalName: budgetPro.name,
        serviceTitle: `Orçamento: ${budgetPro.category}`,
        description: budgetDescription,
        status: 'pending',
        date: serverTimestamp(),
        scheduledAt: Timestamp.fromDate(scheduledAt),
        price: budgetPro.pricePerService,
        updatedAt: serverTimestamp()
      });
      alert('Solicitação enviada!');
      setShowBudgetModal(false);
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar.');
    } finally {
      setIsActionLoading(prev => ({ ...prev, confirmBudget: false }));
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsActionLoading(prev => ({ ...prev, [`order_${orderId}`]: true }));
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status: newStatus, 
        updatedAt: serverTimestamp() 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    } finally {
      setIsActionLoading(prev => ({ ...prev, [`order_${orderId}`]: false }));
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await handleUpdateOrderStatus(orderId, 'cancelled');
      alert('Pedido cancelado com sucesso.');
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      alert('Erro ao cancelar pedido.');
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
  };

  const handleAdvanceStatus = async (orderId: string, newStatus: string) => {
    setIsActionLoading(prev => ({ ...prev, [`advance_${orderId}`]: true }));
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus, updatedAt: serverTimestamp() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'orders');
    } finally {
      setIsActionLoading(prev => ({ ...prev, [`advance_${orderId}`]: false }));
    }
  };

  const handleCompleteOrder = async (order: any) => {
    setIsActionLoading(prev => ({ ...prev, [`advance_${order.id}`]: true }));
    try {
      await updateDoc(doc(db, 'orders', order.id), { status: 'completed', updatedAt: serverTimestamp() });
      setCompletingOrder({ ...order, status: 'completed' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'orders');
    } finally {
      setIsActionLoading(prev => ({ ...prev, [`advance_${order.id}`]: false }));
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    const orderId = orderToDelete;
    setIsActionLoading(prev => ({ ...prev, [`order_${orderId}`]: true }));
    setOrderToDelete(null);
    
    try {
      if (!currentUser) throw new Error('Usuário não autenticado');
      
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);
      console.log('Pedido excluído com sucesso');
    } catch (error: any) {
      handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
    } finally {
      setIsActionLoading(prev => ({ ...prev, [`order_${orderId}`]: false }));
    }
  };

  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const handleRequestVerification = () => {
    if (!currentUser || profileData?.role !== 'pro') return;
    setIsVerificationModalOpen(true);
  };

  const handleSubscribePlan = async (plan: 'start' | 'pro' | 'ultra') => {
    if (!currentUser) return;
    const urls = {
      start: import.meta.env.VITE_KIRVANO_START_URL || 'https://pay.kirvano.com/91a2f328-df8f-440b-a861-75b12d403555',
      pro: import.meta.env.VITE_KIRVANO_CHECKOUT_URL || 'https://pay.kirvano.com/a9e4a8e1-a4c3-43de-933e-21cff8f3f8a3',
      ultra: import.meta.env.VITE_KIRVANO_ULTRA_URL || 'https://pay.kirvano.com/e4542ed3-1b2c-48b8-88ce-09adbce42d15',
    };
    try {
      await setDoc(doc(db, 'professionals', currentUser.uid), {
        id: currentUser.uid,
        userId: currentUser.uid,
        name: profileData?.name || currentUser.displayName || 'Profissional',
        photoURL: profileData?.photoURL || currentUser.photoURL || '',
        category: '',
        description: '',
        location: profileData?.location || 'Brasil',
        whatsapp: profileData?.whatsapp || '',
        rating: 5.0,
        reviewCount: 0,
        status: 'online',
        professionalStatus: 'pending',
        subscriptionStatus: 'pending_payment',
        subscriptionType: plan === 'ultra' ? 'ultra' : plan === 'start' ? 'start' : 'monthly_pro',
        serviceMode: 'none',
        isQueueActive: false,
        pricePerService: 0,
        lastActiveAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('Erro ao preparar perfil:', err);
    }
    setIsPlansModalOpen(false);
    window.location.href = `${urls[plan]}?external_id=${currentUser.uid}&email=${encodeURIComponent(currentUser.email || '')}`;
  };

  const handleConfirmVerificationPayment = async () => {
    if (!currentUser || profileData?.role !== 'pro') return;
    setAuthLoading(true);
    try {
      // Redirect to Kirvano Verification Checkout
      const checkoutBaseUrl = import.meta.env.VITE_KIRVANO_VERIFIED_CHECKOUT_URL || 'https://pay.kirvano.com/b76e028d-396a-4393-87fb-6c77c0dd71a1';
      const checkoutUrl = `${checkoutBaseUrl}?external_id=${currentUser.uid}&email=${encodeURIComponent(currentUser.email || '')}`;
      window.location.href = checkoutUrl;
      setIsVerificationModalOpen(false);
    } catch (error) {
      console.error('Error initiating verification payment:', error);
      alert('Erro ao iniciar processo de pagamento.');
    } finally {
      setAuthLoading(false);
    }
  };

  const callAdminAction = async (action: string, proId: string) => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch('/api/admin-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ action, proId }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Erro servidor');
    return res.json();
  };

  const handleApprovePro = async (proId: string) => {
    if (!isAdmin) return;
    try {
      await callAdminAction('approve', proId);
      alert('Profissional aprovado com sucesso!');
    } catch (error: any) {
      console.error(error);
      alert('Erro ao aprovar: ' + error.message);
    }
  };

  const handleRejectPro = (proId: string) => {
    if (!isAdmin) return;
    showConfirm('Rejeitar este profissional?', async () => {
      try {
        await callAdminAction('reject', proId);
        alert('Profissional rejeitado.');
      } catch (error: any) {
        console.error(error);
        alert('Erro ao rejeitar: ' + error.message);
      }
    });
  };

  const handleDeleteSmartRequest = (reqId: string) => {
    showConfirm('Apagar esta solicitação permanentemente?', async () => {
      try {
        await deleteDoc(doc(db, 'smartRequests', reqId));
      } catch (error: any) {
        console.error(error);
      }
    });
  };

  const handleDeleteProRequest = (proId: string) => {
    if (!isAdmin) return;
    showConfirm('Tem certeza que deseja excluir esta solicitação permanentemente?', async () => {
      try {
        await callAdminAction('delete_pro', proId);
        alert('Solicitação excluída com sucesso!');
      } catch (error: any) {
        console.error(error);
        alert('Erro ao excluir solicitação: ' + error.message);
      }
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (!isAdmin) return;
    showConfirm(`Excluir a conta de "${userName}" permanentemente? Isso remove o usuário do Firestore e do Auth.`, async () => {
      try {
        await callAdminAction('delete_user', userId);
        alert('Conta excluída com sucesso!');
      } catch (error: any) {
        console.error(error);
        alert('Erro ao excluir conta: ' + error.message);
      }
    });
  };

  const handleUpdatePro = async (data: Partial<Professional>) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'professionals', currentUser.uid), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      handleFirestoreError(error, OperationType.UPDATE, `professionals/${currentUser.uid}`);
    }
  };

  const openChat = async (pro: Professional) => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const proUid = pro.userId;
    const chatId = uid < proUid ? `${uid}_${proUid}` : `${proUid}_${uid}`;

    try {
      await setDoc(doc(db, 'chats', chatId), {
        participants: [uid, proUid],
        participantNames: {
          [uid]: profileData?.name || currentUser.displayName || 'Usuário',
          [proUid]: pro.name,
        },
        participantPhotos: {
          [uid]: profileData?.photoURL || currentUser.photoURL || '',
          [proUid]: pro.photoURL || '',
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Reset current user's unread on open
      await updateDoc(doc(db, 'chats', chatId), {
        [`unreadCounts.${uid}`]: 0,
      });
    } catch (error) {
      console.error('Error creating chat:', error);
    }

    setActiveChatId(chatId);
    setActiveChatName(pro.name);
    setActiveChatRecipientId(proUid);
    setActiveTab('chat');
  };

  const openProProfile = async (proId: string) => {
    // Try local cache first (only contains active+subscribed pros)
    const local = professionals.find(p => p.id === proId);
    if (local) {
      setSelectedPro(local);
      return;
    }
    // Fallback: fetch directly from Firestore (covers sellers with any status)
    try {
      const snap = await getDoc(doc(db, 'professionals', proId));
      if (snap.exists()) {
        setSelectedPro({ id: snap.id, ...snap.data() } as Professional);
      }
    } catch (err) {
      console.error('Erro ao buscar perfil do profissional:', err);
    }
  };

  const handleRespondToRequest = async (request: any) => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const clientId = request.clientId as string;
    const clientName = request.clientName || 'Cliente';
    const chatId = uid < clientId ? `${uid}_${clientId}` : `${clientId}_${uid}`;

    try {
      await setDoc(doc(db, 'chats', chatId), {
        participants: [uid, clientId],
        participantNames: {
          [uid]: profileData?.name || currentUser.displayName || 'Profissional',
          [clientId]: clientName,
        },
        participantPhotos: {
          [uid]: profileData?.photoURL || currentUser.photoURL || '',
          [clientId]: '',
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Notify client that a pro is interested
      await addDoc(collection(db, 'notifications'), {
        userId: clientId,
        title: 'Profissional Interessado!',
        type: 'message',
        message: `${profileData?.name || 'Um profissional'} quer conversar sobre sua solicitação de "${request.title}".`,
        time: new Date().toISOString(),
        read: false,
        createdAt: serverTimestamp(),
        senderId: uid,
        senderName: profileData?.name || currentUser.displayName || 'Profissional',
        chatId,
      });

      // Delete the smart request so it stops appearing to other pros
      if (request.id) {
        await deleteDoc(doc(db, 'smartRequests', request.id)).catch(() => {});
      }
    } catch (err) {
      console.error('Error responding to request:', err);
    }

    setActiveChatId(chatId);
    setActiveChatName(clientName);
    setActiveChatRecipientId(clientId);
    setActiveTab('chat');
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      const code = error?.code || '';
      const googleErrors: Record<string, string> = {
        'auth/popup-closed-by-user': 'Login cancelado. Tente novamente.',
        'auth/popup-blocked': 'Popup bloqueado pelo navegador. Permita popups para este site.',
        'auth/cancelled-popup-request': 'Login cancelado.',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
        'auth/unauthorized-domain': 'Domínio não autorizado. Contate o suporte.',
        'auth/account-exists-with-different-credential': 'Este e-mail já está cadastrado com outro método de login.',
      };
      setAuthError(googleErrors[code] || 'Erro ao entrar com Google. Tente novamente.');
      console.error('Google login error:', code, error);
    } finally {
      setAuthLoading(false);
    }
  };

  const startEditing = () => {
    setEditForm({
      name: profileData?.name || '',
      whatsapp: profileData?.whatsapp || '',
      bio: profileData?.bio || '',
      location: profileData?.location || '',
      photoURL: profileData?.photoURL || currentUser?.photoURL || '',
      bannerURL: profileData?.bannerURL || '',
      skills: profileData?.skills?.join(', ') || '',
      priceRange: profileData?.priceRange || '',
      experience: profileData?.experience || '',
      availability: profileData?.availability || '',
      instagram: profileData?.instagram || '',
      website: profileData?.website || '',
      coordinates: profileData?.coordinates || null
    });
    setIsEditingProfile(true);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isSignUpMode) {
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        await updateProfile(userCredential.user, { displayName: authName });
        // Force token refresh so Firestore security rules recognize the new user
        await userCredential.user.getIdToken(true);
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            id: userCredential.user.uid,
            name: authName,
            email: authEmail,
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(authName)}&background=f97316&color=fff`,
            role: 'client',
            whatsapp: authWhatsApp || '',
            bio: 'Novo cliente Facilita Aí',
            location: authLocation || 'Brasil',
            createdAt: serverTimestamp()
          });
        } catch {
          // Firestore write failed but user was created — profile will be set up on first load
        }
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (error: any) {
      const code = error?.code || '';
      const friendlyErrors: Record<string, string> = {
        'auth/email-already-in-use': 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.',
        'auth/user-not-found': 'E-mail não encontrado. Verifique ou crie uma conta.',
        'auth/wrong-password': 'Senha incorreta. Tente novamente.',
        'auth/invalid-email': 'E-mail inválido.',
        'auth/weak-password': 'Senha fraca. Use pelo menos 6 caracteres.',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/network-request-failed': 'Sem conexão. Verifique sua internet e tente novamente.',
      };
      setAuthError(friendlyErrors[code] || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (showIntro) {
    return (
      <IntroAnimation onComplete={() => { sessionStorage.setItem('intro_shown', '1'); setShowIntro(false); }} />
    );
  }

  if (!currentUser && !isDemoMode) {
    return (
      <>
        <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#121826] border border-white/5 px-5 py-6 sm:px-7 sm:py-8 rounded-[32px] shadow-2xl w-full max-w-xs sm:max-w-sm text-center"
          >
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(249,115,22,0.4)] mx-auto mb-5">
              <Hammer size={26} className="text-white transform -rotate-12" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter italic leading-none mb-2">
              <span className="text-white">Facilita</span> <span className="text-orange-500">Aí</span>
            </h1>
            {pendingInviteRef ? (
              <div className="mb-4 px-4 py-3 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-left">
                <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Você foi convidado!</p>
                <p className="text-white text-xs font-bold leading-snug">Crie sua conta e comece a atender <span className="text-orange-400">gratuitamente</span> na plataforma.</p>
              </div>
            ) : (
              <p className="text-gray-400 text-xs mb-5">
                {isSignUpMode ? 'Crie sua conta gratuitamente.' : 'A plataforma que resolve seus problemas.'}
              </p>
            )}
            <form onSubmit={handleEmailAuth} className="space-y-3 mb-4">
              {isSignUpMode && (
                <>
                  <input type="text" required placeholder="Nome completo" value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="tel" placeholder="WhatsApp (opcional)" value={authWhatsApp} onChange={(e) => setAuthWhatsApp(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50" />
                    <input type="text" required placeholder="Cidade" value={authLocation} onChange={(e) => setAuthLocation(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50" />
                  </div>
                </>
              )}
              <input type="email" required placeholder="E-mail" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50" />
              <input type="password" required placeholder="Senha" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-[#070b13] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-orange-500/50" />
              {authError && <p className="text-red-400 text-xs text-left">{authError}</p>}
              <button type="submit" disabled={authLoading} className="w-full bg-orange-500 text-white font-bold py-3 rounded-2xl disabled:opacity-50 text-sm active:scale-95 transition-transform">
                {authLoading ? 'Processando...' : isSignUpMode ? 'Criar Conta' : 'Entrar'}
              </button>
            </form>
            <button onClick={() => { setIsSignUpMode(!isSignUpMode); setAuthError(null); }} className="text-xs text-orange-500 font-bold mb-4">
              {isSignUpMode ? 'Já tem conta? Entre' : 'Não tem conta? Cadastre-se'}
            </button>
            <div className="border-t border-white/5 pt-4">
              <button
                onClick={() => { setIsDemoMode(true); setShowDemoTour(true); }}
                className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-gray-400 font-bold py-3 rounded-2xl text-sm active:scale-95 transition-all hover:bg-white/10 hover:text-white"
              >
                <Eye size={16} className="text-orange-400" />
                Explorar como visitante
              </button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
      <div className="min-h-screen bg-[#070b13] text-white flex overflow-x-hidden relative">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onBecomePro={() => setIsProModalOpen(true)} userRole={isAdmin ? 'admin' : profileData?.role} />
      <main className="flex-grow flex flex-col min-w-0 overflow-x-hidden pb-24 lg:pb-0">
        <header className={`px-5 py-6 sm:px-8 lg:px-12 flex items-center justify-between sticky top-0 bg-[#070b13]/90 backdrop-blur-3xl z-[90] shrink-0 ${isDemoMode ? 'pt-14' : ''}`}>
          <div onClick={() => setActiveTab('home')} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-11 h-11 rounded-[18px] flex items-center justify-center group-active:scale-95 transition-all shrink-0" style={{ background: 'linear-gradient(135deg, #1a0e00, #2d1600)', boxShadow: '0 10px 20px rgba(255,122,0,0.35)', border: '1px solid rgba(255,122,0,0.25)' }}>
              <Hammer size={22} className="text-[#FF7A00]" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black italic uppercase tracking-tighter leading-none">
              <span className="text-white">FACILITA</span>
              <span className="text-[#FF7A00] ml-1.5">AÍ</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('search')} className="w-11 h-11 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">
              <SearchIcon size={20} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(p => !p)}
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all relative ${showNotifications ? 'bg-orange-500/15 border-orange-500/30 text-orange-500' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`}
              >
                <Bell size={20} />
                {notifications.some(n => !n.read) && (
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#070b13]" />
                )}
              </button>
              {/* Notification dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <motion.div
                      className="fixed inset-0 z-[109]"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setShowNotifications(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ type: 'spring', damping: 22, stiffness: 320 }}
                      className="absolute right-0 top-14 z-[110] w-80 rounded-3xl overflow-hidden shadow-2xl"
                      style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
                        <p className="text-white font-black text-sm uppercase tracking-tight">Notificações</p>
                        {notifications.some(n => !n.read) && (
                          <button
                            onClick={async () => {
                              if (!currentUser) return;
                              const unread = notifications.filter(n => !n.read);
                              for (const n of unread) {
                                updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {});
                              }
                            }}
                            className="text-[9px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400"
                          >
                            Marcar todas lidas
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto no-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="py-12 text-center">
                            <Bell size={28} className="mx-auto text-gray-700 mb-3" />
                            <p className="text-gray-600 text-xs font-bold">Sem notificações</p>
                          </div>
                        ) : (
                          notifications.slice(0, 15).map(n => {
                            const isMsg = n.type === 'message';
                            const chatId = n.chatId || ((isMsg && n.senderId && currentUser)
                              ? (currentUser.uid < n.senderId ? `${currentUser.uid}_${n.senderId}` : `${n.senderId}_${currentUser.uid}`)
                              : null);
                            return (
                              <motion.div
                                key={n.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={async () => {
                                  updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {});
                                  if (isMsg && chatId) {
                                    setActiveChatId(chatId);
                                    setActiveChatName(n.senderName || n.title || 'Mensagem');
                                    setActiveChatRecipientId(n.senderId || '');
                                    setActiveTab('chat');
                                    updateDoc(doc(db, 'chats', chatId), { [`unreadCounts.${currentUser?.uid}`]: 0 }).catch(() => {});
                                  }
                                  setShowNotifications(false);
                                }}
                                className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-white/4 last:border-0 ${!n.read ? 'bg-orange-500/5 hover:bg-orange-500/8' : 'hover:bg-white/3'}`}
                              >
                                <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 ${isMsg ? 'bg-orange-500/15' : 'bg-white/5'}`}>
                                  {isMsg ? <MessageSquare size={15} className="text-orange-500" /> : <Bell size={15} className="text-gray-500" />}
                                </div>
                                <div className="flex-grow min-w-0">
                                  <p className={`text-xs font-black leading-tight ${!n.read ? 'text-white' : 'text-gray-300'}`}>
                                    {n.title || 'Notificação'}
                                  </p>
                                  <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message || n.text}</p>
                                  {isMsg && chatId && (
                                    <p className="text-[9px] font-black text-orange-500 mt-1 uppercase tracking-widest">Toque para responder →</p>
                                  )}
                                </div>
                                {!n.read && <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1" />}
                              </motion.div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <button
                onClick={() => { setActiveChatId(null); setActiveTab('chat_list'); }}
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all ${(activeTab === 'chat' || activeTab === 'chat_list') ? 'bg-orange-500/15 border-orange-500/30 text-orange-500' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`}
              >
                <MessageSquare size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Toast notification */}
        <AnimatePresence>
          {activeToast && (
            <motion.div
              key="toast"
              initial={{ opacity: 0, y: -16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.94 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className="fixed top-20 right-4 z-[120] max-w-[300px] rounded-2xl p-3 flex items-start gap-3 shadow-2xl cursor-pointer"
              style={{ background: '#111827', border: '1px solid rgba(255,122,0,0.25)' }}
              onClick={() => {
                const chatId = activeToast.chatId || (activeToast.senderId && currentUser
                  ? (currentUser.uid < activeToast.senderId ? `${currentUser.uid}_${activeToast.senderId}` : `${activeToast.senderId}_${currentUser.uid}`)
                  : null);
                if (chatId) {
                  setActiveChatId(chatId);
                  setActiveChatName(activeToast.senderName || activeToast.title || 'Mensagem');
                  setActiveChatRecipientId(activeToast.senderId || '');
                  setActiveTab('chat');
                  updateDoc(doc(db, 'chats', chatId), { [`unreadCounts.${currentUser?.uid}`]: 0 }).catch(() => {});
                }
                setActiveToast(null);
              }}
            >
              <div className="w-9 h-9 rounded-[12px] bg-orange-500/15 flex items-center justify-center shrink-0">
                <MessageSquare size={16} className="text-orange-500" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-white text-xs font-black leading-tight">{activeToast.title || 'Nova Mensagem'}</p>
                <p className="text-gray-400 text-[10px] mt-0.5 line-clamp-2">{activeToast.message || activeToast.text}</p>
                <p className="text-[9px] font-black text-orange-500 mt-1 uppercase tracking-widest">Toque para responder →</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setActiveToast(null); }}
                className="text-gray-600 hover:text-gray-300 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isProOnboardingOpen && profileData && (
            <ProfessionalOnboarding
              key="modal-pro-onboarding"
              user={profileData}
              inviterCode={pendingInviteRef || undefined}
              onCancel={() => setIsProOnboardingOpen(false)}
              onComplete={async (pro) => {
                if (!currentUser) return;
                try {
                  setIsProOnboardingOpen(false);
                  // Se veio por convite, o onboarding já salvou e ativou — só limpa o ref
                  if (pendingInviteRef) {
                    sessionStorage.removeItem('inviteRef');
                  }
                } catch (error) {
                  console.error('Erro ao finalizar onboarding:', error);
                }
              }}
            />
          )}

          {isPremiumModalOpen && (
            <div key="modal-premium" className="fixed inset-0 z-[500] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPremiumModalOpen(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              />
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-[#070b13] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl p-10 text-center"
              >
                <div className="w-24 h-24 bg-orange-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
                  <Package size={40} className="text-orange-500" />
                </div>

                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter uppercase leading-none mb-4">Área Exclusiva</h3>
                <p className="text-gray-400 text-sm mb-10 leading-relaxed">
                  Torne-se um profissional para anunciar produtos e peças no marketplace do Facilita Aí.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => { setIsPremiumModalOpen(false); setIsPlansModalOpen(true); }}
                    className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all"
                  >
                    🚀 Ver Planos
                  </button>
                  <button 
                    onClick={() => setIsPremiumModalOpen(false)}
                    className="w-full bg-white/5 text-gray-500 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all"
                  >
                    Voltar
                  </button>
                </div>

                <button 
                  onClick={() => setIsPremiumModalOpen(false)}
                  className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isPlansModalOpen && (
            <PlansModal
              key="modal-plans"
              onClose={() => setIsPlansModalOpen(false)}
              currentUser={currentUser}
              profileData={profileData}
              onSubscribe={handleSubscribePlan}
            />
          )}
        </AnimatePresence>

        {activeTab === 'home' && (
          <div className="space-y-0 pb-32 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-80px)] scroll-smooth no-scrollbar bg-[#070b13]">
            {/* Top Info Section */}
            <section className="px-5 pt-4 pb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsLocationModalOpen(true)}>
                  <MapPin size={16} className="text-orange-500 animate-bounce" />
                  <span className="text-white font-black text-sm uppercase tracking-tight">{locationTerm || profileData?.location || 'Definir Localização'}</span>
                  <ChevronRight size={14} className="text-orange-500 rotate-90" />
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowActiveProsModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20 hover:bg-green-500/20 transition-all active:scale-95"
                  >
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-500 text-[9px] font-black uppercase tracking-tight">
                      {professionals.filter(p => p.professionalStatus === 'active' && p.subscriptionStatus === 'active').length} Ativos Agora
                    </span>
                  </button>
                </div>
              </div>

              {/* Enhanced Search Bar with Location */}
              <div className="flex flex-col gap-3 mb-10">
                <div className="relative group">
                  <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="O que você precisa hoje?" 
                    className="w-full bg-[#121826] border border-white/5 rounded-3xl py-5 pl-16 pr-6 text-white text-base outline-none placeholder:text-gray-700 font-bold shadow-2xl focus:border-orange-500/20 transition-all" 
                  />
                </div>
                <div className="flex gap-3">
                  <div className="relative flex-grow group">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" size={20} />
                    <input 
                      type="text" 
                      value={locationTerm} 
                      onChange={(e) => setLocationTerm(e.target.value)} 
                      placeholder="Em qual cidade?" 
                      className="w-full bg-[#121826] border border-white/5 rounded-3xl py-5 pl-16 pr-6 text-white text-base outline-none placeholder:text-gray-700 font-bold shadow-2xl focus:border-orange-500/20 transition-all" 
                    />
                  </div>
                  <button onClick={() => setActiveTab('search')} className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all">
                    <SearchIcon size={24} strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* Hero Animation */}
              <div className="mb-8">
                <HeroAnimation />
              </div>

              {/* Horizontal Categories */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5">
                {(() => {
                  const uniqueCats = Array.from(new Map(POPULAR_CATEGORIES.map(cat => [cat.id, cat])).values()) as any[];
                  debugDuplicateKeys(uniqueCats, (cat) => cat.id, "Categorias Horizontais");
                  return uniqueCats.map((cat) => (
                    <motion.div
                      key={cat.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedCategory(cat.title);
                        setActiveTab('search');
                      }}
                      className="flex flex-col items-center gap-3 shrink-0 min-w-[80px]"
                    >
                      <div className="w-20 h-20 rounded-[28px] overflow-hidden border border-white/10 shadow-xl relative group">
                        <img src={cat.imageURL} alt={cat.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                      </div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">{cat.title}</span>
                    </motion.div>
                  ));
                })()}
                <motion.div
                  key="popular-cat-more"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setSelectedCategory(null);
                    setActiveTab('search');
                  }}
                  className="flex flex-col items-center gap-3 shrink-0 min-w-[80px]"
                >
                  <div className="w-20 h-20 rounded-[28px] border border-white/5 bg-[#121826] flex items-center justify-center shadow-xl group">
                    <LayoutGrid size={26} className="text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Mais</span>
                </motion.div>
              </div>

              {/* SOS Facilita Quick Access */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap size={18} className="text-orange-500 fill-orange-500" />
                    <h3 className="text-white font-black text-sm uppercase italic">SOS Facilita</h3>
                  </div>
                  <span className="bg-orange-500/20 text-orange-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Emergência</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <motion.div 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSearchTerm('Eletricista'); setActiveTab('search'); }}
                    className="bg-gradient-to-br from-orange-500/20 to-[#121826] border border-orange-500/20 rounded-2xl p-4 flex flex-col gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                      <Zap size={18} />
                    </div>
                    <div>
                      <p className="text-white font-black text-[11px] uppercase italic">Curto-Circuito</p>
                      <p className="text-gray-500 text-[9px] font-bold uppercase tracking-tight">Eletricistas Online</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSearchTerm('Encanador'); setActiveTab('search'); }}
                    className="bg-gradient-to-br from-blue-500/20 to-[#121826] border border-blue-500/20 rounded-2xl p-4 flex flex-col gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                      <Droplet size={18} />
                    </div>
                    <div>
                      <p className="text-white font-black text-[11px] uppercase italic">Vazamento</p>
                      <p className="text-gray-500 text-[9px] font-bold uppercase tracking-tight">Encanadores Online</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Featured Section */}
            <section className="px-5 mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Serviços em destaque</h2>
                <button onClick={() => setActiveTab('search')} className="text-orange-500 font-black text-xs uppercase tracking-widest">Ver todos</button>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-5 px-5">
                {(() => {
                  const items = professionals.filter(p => (p.rating || 0) >= 4.8).slice(0, 4);
                  const uniquePros = Array.from(new Map(items.map(p => [p.id, p])).values()) as Professional[];
                  debugDuplicateKeys(uniquePros, (pro) => pro.id, "Destaques Home");
                  return uniquePros.map((pro, index) => (
                    <div key={pro.id} className="min-w-[280px]">
                      <ProfessionalCard 
                        pro={pro} 
                        onSelect={setSelectedPro}
                        onChat={openChat}
                        onLike={handleLikePro}
                        isLiked={profileData?.likedProfessionals?.includes(pro.id)}
                        delay={index * 0.1}
                      />
                    </div>
                  ));
                })()}
              </div>
            </section>

            {/* Marketplace Feed Section */}
            {products.length > 0 && (
              <section className="px-5 mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={20} className="text-orange-500" />
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Marketplace</h2>
                  </div>
                  <button onClick={() => setActiveTab('products')} className="text-orange-500 font-black text-xs uppercase tracking-widest">Ver Loja</button>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 pb-4">
                  {(() => {
                    const activeProducts = products.filter(p => p.status === 'active').slice(0, 8);
                    const uniqueHomeProducts = Array.from(new Map(activeProducts.map(p => [p.id, p])).values()) as Product[];
                    return uniqueHomeProducts.map((product) => {
                      const pro = professionals.find(p => p.id === product.proId);
                      const distance = (userCoords && product.coordinates)
                        ? Math.round(calculateDistance(userCoords.lat, userCoords.lng, product.coordinates.lat, product.coordinates.lng))
                        : undefined;
                      
                      return (
                        <div key={`home-prod-${product.id}`} className="min-w-[240px] sm:min-w-[280px]">
                          <ProductCard
                            product={product}
                            distance={distance}
                            onBuy={(p) => {
                              if (demoGuard('Crie sua conta para comprar produtos e falar com vendedores.')) return;
                              const whatsapp = pro?.whatsapp || profileData?.whatsapp || '';
                              const text = `Olá ${p.proName}, vi o produto [${p.name}] no Facilita Aí e tenho interesse em comprar.`;
                              window.open(`https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            onClick={(p) => openProProfile(p.proId)}
                            onViewSeller={(proId) => openProProfile(proId)}
                          />
                        </div>
                      );
                    });
                  })()}
                </div>
              </section>
            )}

            {/* How It Works Premium */}
            <section className="px-5 mb-10">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-[32px] p-8 mb-10 shadow-2xl shadow-orange-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <h3 className="text-white font-black text-2xl uppercase italic tracking-tighter leading-none mb-2">Orçamento Inteligente</h3>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-6">Receba até 5 propostas em 15 minutos</p>
                  <button 
                    onClick={() => setIsSmartBudgetModalOpen(true)}
                    className="bg-white text-orange-500 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
                  >
                    Solicitar Agora
                  </button>
                </div>
                <div className="absolute bottom-4 right-8 text-white/20">
                  <Target size={80} strokeWidth={3} />
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Como funciona?</h2>
                <button className="text-orange-500 font-black text-xs uppercase tracking-widest">Ver mais</button>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-5 px-5">
                 {[
                   { id: 'instr-1', icon: Compass, title: '1. Encontre', desc: 'O serviço ideal' },
                   { id: 'instr-2', icon: ClipboardList, title: '2. Solicite', desc: 'Com facilidade' },
                   { id: 'instr-3', icon: CheckCircle, title: '3. Resolvido!', desc: 'Avalie e pronto' }
                 ].map((step) => (
                   <div key={step.id} className="min-w-[140px] bg-[#121826]/40 border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center">
                     <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mb-4 border border-orange-500/10">
                       <step.icon size={24} />
                     </div>
                     <span className="text-white font-black text-[11px] uppercase italic mb-1">{step.title}</span>
                     <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest leading-tight">{step.desc}</p>
                   </div>
                 ))}
              </div>
            </section>

            {/* Plans CTA — oculto para quem já é profissional */}
            {!currentProfessional && profileData?.role !== 'pro' && !isAdmin && <section className="px-5 py-6">
              <div className="relative rounded-[32px] overflow-hidden bg-[#0d121f] border border-orange-500/20 p-8 shadow-2xl shadow-orange-500/10">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                      <Crown size={16} className="text-white" />
                    </div>
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Para Profissionais</span>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">Torne-se Pro</h3>
                  <p className="text-gray-400 text-xs font-bold mb-6 leading-relaxed">Apareça para centenas de clientes, gerencie sua agenda e venda no marketplace.</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlansModalOpen(true)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                    >
                      Ver Planos
                    </button>
                    <div className="flex flex-col">
                      <span className="text-white font-black text-sm">A partir de</span>
                      <span className="text-orange-500 font-black text-lg tracking-tighter">R$ 14,90<span className="text-gray-500 text-xs font-bold">/mês</span></span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 right-6 flex gap-1.5">
                  {['Start', 'Pro', 'Ultra'].map((p, i) => (
                    <span key={p} className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                      i === 0 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      i === 1 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>{p}</span>
                  ))}
                </div>
              </div>
            </section>}

            {/* Testimonials */}
            <Testimonials />

            {/* Quick Tips */}
            <QuickTips />

            {/* Brand Shield */}
            <BrandShield />

            {/* FAQ */}
            <FAQSection />

            {/* PWA Tutorial */}
            <PWATutorial />

            {/* Footer */}
            <Footer />
          </div>
        )}

          {activeTab === 'search' && (
            <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
              <div className="flex flex-col gap-4 mb-6 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tighter italic">Explorar</h2>
                
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
                  {/* Tab Selector */}
                  <div className="flex bg-[#121826] p-1 rounded-xl border border-white/5 shadow-inner shrink-0">
                    <button 
                      onClick={() => setSearchTab('app')}
                      className={`px-3 py-1.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${searchTab === 'app' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                      Profissionais
                    </button>
                    <button 
                      onClick={() => setSearchTab('map')}
                      className={`px-3 py-1.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${searchTab === 'map' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                      Mapa
                    </button>
                  </div>

                  {searchTab === 'app' && (
                    <div className="flex bg-[#121826] p-1 rounded-xl border border-white/5 shadow-inner">
                      <button 
                        onClick={() => setSearchViewMode('grid')}
                        className={`p-1.5 sm:p-2 rounded-lg transition-all ${searchViewMode === 'grid' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
                      >
                        <LayoutGrid size={16} />
                      </button>
                      <button 
                        onClick={() => setSearchViewMode('alphabetical')}
                        className={`p-1.5 sm:p-2 rounded-lg transition-all ${searchViewMode === 'alphabetical' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
                      >
                        <List size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
                <div className="relative flex-grow group">
                  <SearchIcon className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder={searchTab === 'map' ? "O que você busca? Ex: Mecânico, Pizza..." : "Profissional ou serviço..."} 
                    className="w-full bg-[#121826] border border-white/5 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-14 pr-6 text-white text-sm sm:text-base shadow-xl focus:border-orange-500/30 outline-none transition-all placeholder:text-gray-700 font-medium" 
                  />
                </div>
                {searchTab === 'app' && (
                  <div className="relative sm:w-1/3 group">
                    <MapPin className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={locationTerm} 
                      onChange={(e) => setLocationTerm(e.target.value)} 
                      placeholder="Localidade..." 
                      className="w-full bg-[#121826] border border-white/5 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-14 pr-6 text-white text-sm sm:text-base shadow-xl focus:border-orange-500/30 outline-none transition-all placeholder:text-gray-700 font-medium" 
                    />
                  </div>
                )}
              </div>

              {searchTab === 'map' ? (
                <div className="pb-32">
                  <MapSearch 
                    searchTerm={searchTerm} 
                    professionals={professionals}
                    onSelectPro={setSelectedPro}
                  />
                </div>
              ) : searchViewMode === 'grid' ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-12">
                    {(() => {
                      const uniqueCats = Array.from(new Map(POPULAR_CATEGORIES.map(cat => [cat.id, cat])).values()) as any[];
                      debugDuplicateKeys(uniqueCats, (cat) => cat.id, "Categorias Busca Grid");
                      return uniqueCats.map((cat) => (
                        <CategoryCard key={cat.id} {...cat} count={professionals.filter(p => p.category === cat.title).length} active={selectedCategory === cat.title} onClick={() => setSelectedCategory(selectedCategory === cat.title ? null : cat.title)} />
                      ));
                    })()}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {(() => {
                    const uniquePros = Array.from(new Map(filteredPros.map(p => [p.id, p])).values()) as Professional[];
                    debugDuplicateKeys(uniquePros, (p) => p.id, "Profissionais Busca Grid");
                    return uniquePros.map((pro, index) => (
                      <ProfessionalCard 
                        key={pro.id} 
                        pro={pro} 
                        onSelect={setSelectedPro} 
                        onChat={openChat} 
                        onLike={handleLikePro}
                        isLiked={profileData?.likedProfessionals?.includes(pro.id) || !!userLikedPros[pro.id]}
                        delay={index * 0.05} 
                      />
                    ));
                  })()}
                </div>
              </>
            ) : (
              <div className="space-y-8 sm:space-y-12 pb-20">
                {alphabeticalProfessions.map((group: any, groupIdx: number) => {
                  debugDuplicateKeys(alphabeticalProfessions, (g: any) => g.letter, "Grupos Alfabéticos");
                  const filteredItems = group.items.filter(item => 
                    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.category.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  
                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={`v16-alphabetical-group-${group.letter}-${groupIdx}`} className="space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg shadow-orange-500/20">
                          {group.letter}
                        </div>
                        <div className="h-px flex-grow bg-white/5" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        {(() => {
                          const uniqueItems = Array.from(new Map(filteredItems.map((item, idx) => [item.id || `${item.title}-${groupIdx}-${idx}`, item])).values()) as any[];
                          debugDuplicateKeys(uniqueItems, (item) => item.id || `fallback-${item.title}`, `Itens Grupo ${group.letter}`);
                          return uniqueItems.map((item, idx) => (
                            <motion.div 
                              key={item.id || `v16-alpha-item-${item.title}-${groupIdx}-${idx}`}
                              whileHover={{ x: 4 }}
                              onClick={() => {
                                setSelectedCategory(item.title);
                                setSearchViewMode('grid');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="flex items-center justify-between p-4 sm:p-5 bg-[#121826] border border-white/5 rounded-xl sm:rounded-2xl cursor-pointer hover:border-orange-500/30 group transition-all"
                            >
                              <div>
                                <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-orange-500 transition-colors">{item.title}</h4>
                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-0.5">{item.category}</p>
                              </div>
                              <ChevronRight size={14} className="text-gray-700 group-hover:text-orange-500 transition-colors" />
                            </motion.div>
                          ));
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-7xl mx-auto w-full mb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12">
              <div>
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic leading-none">
                  Marketplace <span className="text-orange-500">Aí</span>
                </h2>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
                  Produtos de profissionais perto de você
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const isPro = isAdmin || profileData?.role === 'pro';
                    const hasActiveSub = isAdmin || currentProfessional?.subscriptionStatus === 'active';

                    if (isPro && hasActiveSub) {
                      setActiveTab('pro_dashboard');
                      setProDashboardTab('products');
                    } else if (isPro && !hasActiveSub) {
                       setActiveTab('pro_dashboard');
                       setProDashboardTab('products');
                    } else {
                      setIsPremiumModalOpen(true);
                    }
                  }}
                  className="bg-orange-500/10 border border-orange-500/20 text-orange-500 px-6 py-3 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-all shadow-xl shadow-orange-500/5 order-last sm:order-first shrink-0 whitespace-nowrap"
                >
                  <Plus size={14} />
                  Anunciar Produto
                </motion.button>

                {/* Quick Categories Filter for Products */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                  {['Tudo', 'Cabelo', 'Peças', 'Acessórios', 'Ferramentas'].map((cat, idx) => (
                    <button
                      key={`prod-cat-v16-${cat}-${idx}`}
                      onClick={() => setSelectedCategory(cat === 'Tudo' ? '' : cat)}
                      className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
                        (cat === 'Tudo' && !selectedCategory) || selectedCategory === cat
                          ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                          : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loadingProducts && products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Spinner size={40} className="text-orange-500" />
                <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest animate-pulse">Abastecendo as prateleiras...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-32 bg-[#121826] rounded-[48px] border border-white/5">
                <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag size={40} className="text-gray-700" />
                </div>
                <h3 className="text-white font-black uppercase italic tracking-tighter text-lg mb-2">Sem produtos nesta busca</h3>
                <p className="text-gray-500 font-medium text-xs">Tente limpar os filtros ou buscar por outro termo.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
                  className="mt-8 text-orange-500 font-black uppercase text-[10px] tracking-widest hover:underline"
                >
                  Limpar tudo
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                  {(() => {
                    const uniqueProducts = Array.from(new Map(filteredProducts.map(p => [p.id, p])).values()) as Product[];
                    debugDuplicateKeys(uniqueProducts, (p) => p.id, "Produtos Marketplace");
                    return uniqueProducts.map((product, idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={product.id}
                      >
                        <ProductCard
                          product={product}
                          onViewSeller={(proId) => openProProfile(proId)}
                        />
                      </motion.div>
                    ));
                  })()}
                </div>

                <InfiniteScrollTrigger 
                  onClick={() => setProductsLimit(prev => prev + PRODUCTS_PER_PAGE)}
                  loading={loadingProducts}
                  hasMore={hasMoreProducts}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'emergency' && (
          <SectionErrorBoundary label="SOS / Emergência">
            <EmergencySection />
          </SectionErrorBoundary>
        )}

        {activeTab === 'orders' && (
          <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-4xl mx-auto w-full">
            <div className="flex flex-col gap-4 mb-6 sm:mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">Meus Pedidos</h2>
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                  <button
                    onClick={() => setOrderViewTab('active')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orderViewTab === 'active' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
                  >
                    Acompanhamento
                  </button>
                  <button
                    onClick={() => setOrderViewTab('history')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orderViewTab === 'history' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
                  >
                    Histórico
                  </button>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsSmartBudgetModalOpen(true)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
              >
                <Plus size={20} strokeWidth={3} />
                Solicitar Novo Serviço
              </motion.button>
            </div>
            
            <div className="bg-[#121826] rounded-3xl border border-white/5 p-4 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              {(() => {
                const filteredOrders = (orders || []).filter(order => {
                  const isHistory = order.status === 'completed' || order.status === 'cancelled';
                  return orderViewTab === 'history' ? isHistory : !isHistory;
                });

                if (filteredOrders.length === 0) {
                  return (
                    <div className="text-center py-16 flex flex-col items-center gap-5">
                      <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center">
                        <ShoppingBag size={32} className="text-gray-700" />
                      </div>
                      <div>
                        <p className="text-white font-black uppercase text-sm tracking-tight mb-1">
                          {orderViewTab === 'history' ? 'Nenhum histórico ainda' : 'Nenhum serviço em andamento'}
                        </p>
                        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                          {orderViewTab === 'history' ? 'Seus serviços concluídos aparecerão aqui' : 'Solicite um serviço e acompanhe aqui'}
                        </p>
                      </div>
                      {orderViewTab === 'active' && (
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setIsSmartBudgetModalOpen(true)}
                          className="flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                        >
                          <Plus size={16} strokeWidth={3} />
                          Solicitar Serviço Agora
                        </motion.button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {(() => {
                      const uniqueOrders = Array.from(new Map(filteredOrders.map(o => [o.id, o])).values()) as Order[];
                      debugDuplicateKeys(uniqueOrders, (o) => o.id, "Meus Pedidos/Ordens");
                      return uniqueOrders.map((order, index) => (
                        <OrderItem
                          key={order.id}
                          order={order}
                          onCancel={handleCancelOrder}
                          onDelete={handleDeleteOrder}
                          onAdvanceStatus={handleAdvanceStatus}
                          onComplete={handleCompleteOrder}
                          isCancelling={isActionLoading[`order_${order.id}`]}
                          isDeleting={isActionLoading[`order_${order.id}`]}
                          isAdvancing={isActionLoading[`advance_${order.id}`]}
                          onRebuy={(o: any) => {
                            const pro = professionals.find(p => p.id === o.professionalId);
                            if (pro) handleRequestBudget(pro);
                          }}
                        />
                      ));
                    })()}
                    <InfiniteScrollTrigger 
                      onClick={() => setOrdersLimit(prev => prev + ORDERS_PER_PAGE)}
                      loading={loadingOrders}
                      hasMore={hasMoreOrders}
                    />
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'chat_list' && (
          <div className="flex-grow p-4 lg:p-12 overflow-hidden h-[calc(100vh-140px)]">
            <div className="h-full">
              <ChatList
                onSelectChat={(id, name, recipientId) => {
                  setActiveChatId(id);
                  setActiveChatName(name);
                  setActiveChatRecipientId(recipientId);
                  setActiveTab('chat');
                  if (currentUser) {
                    updateDoc(doc(db, 'chats', id), {
                      [`unreadCounts.${currentUser.uid}`]: 0,
                    }).catch(() => {});
                  }
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'chat' && activeChatId && (
          <div className="flex-grow p-4 lg:p-12 overflow-hidden h-[calc(100vh-140px)]">
            <div className="h-full flex flex-col">
              <button
                onClick={() => { setActiveChatId(null); setActiveTab('chat_list'); }}
                className="mb-3 flex items-center gap-1.5 text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors w-fit"
              >
                ← Voltar às mensagens
              </button>
              <div className="flex-grow overflow-hidden rounded-3xl">
                <ChatRoom
                  chatId={activeChatId}
                  recipientName={activeChatName}
                  recipientId={activeChatRecipientId}
                  userRole={profileData?.role}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-4xl mx-auto w-full mb-32">
            <div className="bg-[#121826] rounded-[40px] overflow-hidden border border-white/5 shadow-2xl">

              {/* ── Banner ── */}
              <div className="h-44 sm:h-56 relative overflow-hidden">
                {(isEditingProfile ? editForm.bannerURL : profileData?.bannerURL) ? (
                  <img src={isEditingProfile ? editForm.bannerURL : profileData?.bannerURL} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 relative">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#121826]/60 to-transparent" />
                  </div>
                )}
                {isEditingProfile && (
                  <label htmlFor="bannerIn" className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 cursor-pointer">
                    <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-2 backdrop-blur-sm">
                      <Camera size={20} className="text-white" />
                      <span className="text-white text-[10px] font-black uppercase tracking-widest">Alterar Capa</span>
                    </div>
                  </label>
                )}
                <input id="bannerIn" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'banner')} />
              </div>

              {/* ── Foto + Info Header ── */}
              <div className="px-5 sm:px-8 pb-8">
                <div className="flex items-end gap-4 -mt-14 sm:-mt-16 mb-5">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={isEditingProfile ? editForm.photoURL : profileData?.photoURL}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] border-4 border-[#121826] object-cover bg-[#070b13] shadow-xl"
                    />
                    {isEditingProfile && (
                      <label htmlFor="fileIn" className="absolute inset-0 bg-black/50 rounded-[28px] flex items-center justify-center cursor-pointer">
                        <Camera size={20} className="text-white" />
                      </label>
                    )}
                    <input id="fileIn" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'photo')} />
                    {/* Online indicator */}
                    {userCoords && <div className="absolute bottom-2 right-2 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#121826] shadow-md" />}
                  </div>

                  {/* Edit buttons — right side */}
                  <div className="ml-auto pb-1">
                    {!isEditingProfile ? (
                      <button onClick={startEditing} className="bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all hover:border-orange-500/30">
                        Editar Perfil
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => setIsEditingProfile(false)} disabled={authLoading} className="bg-white/5 text-white px-4 py-2.5 rounded-2xl font-black uppercase text-[10px] active:scale-95 transition-all disabled:opacity-50">Cancelar</button>
                        <button onClick={handleUpdateProfile} disabled={authLoading} className="bg-orange-500 text-white px-5 py-2.5 rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50">
                          {authLoading ? <Spinner size={12} /> : <Check size={12} strokeWidth={3} />}
                          {authLoading ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name + Badge */}
                <div className="flex items-center gap-2 mb-1 flex-nowrap overflow-hidden">
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight truncate leading-none">
                    {profileData?.name}
                  </h2>
                  {(profileData?.role === 'admin' || isAdmin) && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest overflow-hidden shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #7c5200 0%, #FFD700 40%, #ffe566 60%, #b8860b 100%)',
                        boxShadow: '0 0 10px rgba(255,215,0,0.4)',
                        color: '#1a0e00',
                      }}
                    >
                      <span className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2.5s infinite' }} />
                      <ShieldCheck size={9} strokeWidth={3} className="relative z-10" />
                      <span className="relative z-10">Criador</span>
                    </motion.span>
                  )}
                  {profileData?.isVerified && !(profileData?.role === 'admin' || isAdmin) && (
                    <ShieldCheck size={16} className="text-blue-500 shrink-0" />
                  )}
                </div>

                {/* Location + Status */}
                <div className="flex items-center gap-3 flex-wrap mb-5">
                  <span className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                    <MapPin size={12} className="text-orange-500" />
                    {profileData?.location || 'Sem localização'}
                  </span>
                  {userCoords && (
                    <span className="flex items-center gap-1 text-[9px] bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-green-500/20">
                      <Compass size={9} className="animate-pulse" /> Local Ativo
                    </span>
                  )}
                  {profileData?.role === 'pro' && (
                    <span className="flex items-center gap-1 text-[9px] bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-orange-500/20">
                      <Briefcase size={9} /> Profissional
                    </span>
                  )}
                </div>

                {/* Bio */}
                {profileData?.bio && !isEditingProfile && (
                  <div className="mb-6 pl-4 border-l-2 border-orange-500/60">
                    <p className="text-[10px] font-black text-orange-500/70 uppercase tracking-[0.2em] mb-1">Sobre mim</p>
                    <p className="text-white text-sm font-bold leading-relaxed line-clamp-3">
                      {profileData.bio}
                    </p>
                  </div>
                )}

                {isEditingProfile ? (
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome Completo</label>
                      <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Nome" className="w-full bg-[#070b13] p-4 rounded-xl text-white border border-white/5 focus:border-orange-500 outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">WhatsApp</label>
                      <input type="tel" value={editForm.whatsapp} onChange={e => setEditForm({...editForm, whatsapp: e.target.value})} placeholder="WhatsApp" className="w-full bg-[#070b13] p-4 rounded-xl text-white border border-white/5 focus:border-orange-500 outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cidade / Região</label>
                      <input type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} placeholder="Ex: São Paulo, SP" className="w-full bg-[#070b13] p-4 rounded-xl text-white border border-white/5 focus:border-orange-500 outline-none transition-colors" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Marcar Localização no Mapa</label>
                      <MapPicker 
                        lat={editForm.coordinates?.lat} 
                        lng={editForm.coordinates?.lng} 
                        onChange={(lat, lng) => setEditForm(prev => ({ ...prev, coordinates: { lat, lng } }))} 
                      />
                      <p className="text-[9px] text-gray-500 font-medium italic mt-1">* Seus clientes poderão ver sua distância aproximada se você marcar sua localização.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Habilidades (separadas por vírgula)</label>
                      <input type="text" value={editForm.skills} onChange={e => setEditForm({...editForm, skills: e.target.value})} placeholder="Ex: Pintura, Elétrica, Marcenaria" className="w-full bg-[#070b13] p-4 rounded-xl text-white border border-white/5 focus:border-orange-500 outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Faixa de Preço</label>
                      <input type="text" value={editForm.priceRange} onChange={e => setEditForm({...editForm, priceRange: e.target.value})} placeholder="Ex: R$ 80 - 250" className="w-full bg-[#070b13] p-4 rounded-xl text-white border border-white/5 focus:border-orange-500 outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Anos de Experiência</label>
                      <input type="text" value={editForm.experience} onChange={e => setEditForm({...editForm, experience: e.target.value})} placeholder="Ex: 5 anos" className="w-full bg-[#070b13] p-4 rounded-xl text-white border border-white/5 focus:border-orange-500 outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Instagram URL</label>
                      <input type="text" value={editForm.instagram} onChange={e => setEditForm({...editForm, instagram: e.target.value})} placeholder="https://instagram.com/seuusuario" className="w-full bg-[#070b13] p-4 rounded-xl text-white border border-white/5 focus:border-orange-500 outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Website</label>
                      <input type="text" value={editForm.website} onChange={e => setEditForm({...editForm, website: e.target.value})} placeholder="https://..." className="w-full bg-[#070b13] p-4 rounded-xl text-white border border-white/5 focus:border-orange-500 outline-none transition-colors" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Bio / Apresentação</label>
                      <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} placeholder="Escreva um pouco sobre você e seus serviços..." className="w-full bg-[#070b13] p-4 rounded-xl text-white border border-white/5 focus:border-orange-500 outline-none transition-colors resize-none h-32" />
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Pro Specific Info */}
                    {profileData?.role === 'pro' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                          <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Informações Profissionais</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-gray-500">Membro desde</span>
                              <span className="text-white font-bold">{profileData?.createdAt?.toDate ? profileData.createdAt.toDate().toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-gray-500">Experiência</span>
                              <span className="text-white font-bold">{profileData?.experience || 'Não informado'}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-gray-500">Preço Médio</span>
                              <span className="text-white font-bold">{profileData?.priceRange || 'Sob consulta'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                          <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Especialidades</h4>
                          <div className="flex flex-wrap gap-2">
                             {profileData?.skills && profileData.skills.length > 0 ? (
                              (() => {
                                const uniqueSkills = Array.from(new Set(profileData.skills));
                                return uniqueSkills.map((skill: string, i: number) => (
                                  <span key={skill} className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-bold border border-orange-500/20">
                                    {skill}
                                  </span>
                                ));
                              })()
                            ) : <p className="text-gray-600 italic">Nenhuma definida.</p>}
                          </div>
                        </div>

                        {/* Social & Contact */}
                        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                           {profileData?.whatsapp && (
                             <a 
                               href={`https://wa.me/${profileData.whatsapp.replace(/\D/g, '')}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="bg-green-500/5 p-4 rounded-2xl border border-green-500/10 flex flex-col items-center gap-2 hover:bg-green-500/10 transition-all cursor-pointer"
                             >
                               <MessageCircle size={20} className="text-green-500" />
                               <span className="text-[10px] font-black uppercase text-green-500">WhatsApp</span>
                             </a>
                           )}
                           {profileData?.instagram && (
                             <a 
                               href={profileData.instagram.startsWith('http') ? profileData.instagram : `https://instagram.com/${profileData.instagram.replace('@', '')}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="bg-pink-500/5 p-4 rounded-2xl border border-pink-500/10 flex flex-col items-center gap-2 hover:bg-pink-500/10 transition-all cursor-pointer"
                             >
                               <Instagram size={20} className="text-pink-500" />
                               <span className="text-[10px] font-black uppercase text-pink-500">Instagram</span>
                             </a>
                           )}
                           {profileData?.website && (
                             <a 
                               href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 flex flex-col items-center gap-2 hover:bg-blue-500/10 transition-all cursor-pointer"
                             >
                               <Globe size={20} className="text-blue-500" />
                               <span className="text-[10px] font-black uppercase text-blue-500">Website</span>
                             </a>
                           )}
                           <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center gap-2">
                             <Share2 size={20} className="text-gray-400" />
                             <span className="text-[10px] font-black uppercase text-gray-400">Compartilhar</span>
                           </div>
                           <button
                             onClick={async () => {
                               const steps: string[] = [];
                               try {
                                 steps.push(`Suporte: ${'Notification' in window ? 'sim' : 'NÃO'}`);
                                 steps.push(`SW: ${'serviceWorker' in navigator ? 'sim' : 'NÃO'}`);
                                 steps.push(`Permissão atual: ${('Notification' in window ? Notification.permission : 'N/A')}`);
                                 const token = await requestPushPermission();
                                 steps.push(`Token: ${token ? token.slice(0, 20) + '...' : 'FALHOU'}`);
                                 if (token) {
                                   const res = await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientId: currentUser?.uid, title: '🔔 Teste', body: 'Notificação de teste do Facilita Aí!' }) });
                                   const json = await res.json();
                                   steps.push(`API: ${JSON.stringify(json)}`);
                                   setActiveToast({ title: '🔔 Notificações ativadas!', message: 'Você receberá alertas de novas mensagens.' } as any);
                                 }
                               } catch (e: any) {
                                 steps.push(`Erro: ${e?.message}`);
                               }
                               alert(steps.join('\n'));
                             }}
                             className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${'Notification' in window && Notification.permission === 'granted' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                           >
                             <Bell size={20} className={'Notification' in window && Notification.permission === 'granted' ? 'text-orange-500' : 'text-gray-400'} />
                             <span className={`text-[10px] font-black uppercase ${'Notification' in window && Notification.permission === 'granted' ? 'text-orange-500' : 'text-gray-400'}`}>Alertas</span>
                           </button>
                        </div>
                      </div>
                    )}

                    {/* Verification Status — só aparece se ainda não verificado */}
                    {profileData?.role === 'pro' && !isAdmin && !profileData?.isVerified && (
                      <div className="p-8 rounded-[32px] border bg-white/5 border-white/5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="flex gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-orange-500/20 text-orange-500">
                              <ShieldCheck size={28} />
                            </div>
                            <div>
                              <h4 className="font-black text-white text-lg mb-1">Selo de Confiança</h4>
                              <p className="text-xs text-gray-500 leading-relaxed max-w-md">
                                {profileData.verificationStatus === 'pending'
                                  ? 'Sua solicitação está em análise. Em breve o selo será liberado!'
                                  : `Aumente sua visibilidade e transmita mais confiança para os clientes por apenas R$ ${VERIFICATION_BADGE_PRICE.toFixed(2).replace('.', ',')}.`}
                              </p>
                            </div>
                          </div>
                          {profileData.verificationStatus !== 'pending' && (
                            <button
                              onClick={handleRequestVerification}
                              className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-xl shadow-orange-500/20 active:scale-95 transition-all whitespace-nowrap"
                            >
                              Verificar Agora
                            </button>
                          )}
                          {profileData.verificationStatus === 'pending' && (
                            <div className="bg-white/5 text-orange-500 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                              Em Análise
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {profileData?.role !== 'pro' && profileData?.role !== 'admin' && !isAdmin && (
                      <button
                        onClick={() => setIsPlansModalOpen(true)}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 py-6 rounded-[32px] font-black uppercase text-sm shadow-2xl shadow-orange-500/20 active:scale-[0.98] transition-all"
                      >
                        🚀 Quero me tornar um Profissional
                      </button>
                    )}

                    {/* Meus Produtos Shortcut */}
                    {profileData?.role === 'pro' && (
                      <div className="bg-white/5 p-8 rounded-[32px] border border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Marketplace</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase italic">Venda seus produtos e peças</p>
                          </div>
                          <button 
                            onClick={() => { setActiveTab('pro_dashboard'); setProDashboardTab('products'); }}
                            className="bg-orange-500 text-white px-6 py-2 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-orange-500/20 hover:scale-105 transition-all"
                          >
                            Gerenciar Catálogo
                          </button>
                        </div>
                        <div className="bg-black/20 p-6 rounded-2xl border border-dashed border-white/10 text-center group cursor-pointer hover:border-orange-500/30 transition-all" onClick={() => { setActiveTab('pro_dashboard'); setProDashboardTab('products'); }}>
                          <Package size={32} className="mx-auto text-gray-700 group-hover:text-orange-500 transition-colors mb-2" />
                          <p className="text-xs text-gray-500 font-medium">Cadastre peças, acessórios ou produtos que você vende para aumentar seus ganhos.</p>
                        </div>
                      </div>
                    )}

                    {currentProfessional && currentProfessional.professionalStatus === 'expired' && (
                      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[32px] space-y-4">
                        <div className="flex items-center gap-4 text-red-500">
                          <Clock size={24} />
                          <h4 className="font-black uppercase tracking-widest">Sua assinatura venceu</h4>
                        </div>
                        <p className="text-xs text-gray-400 italic">Seu perfil está oculto do feed. Renove agora para continuar recebendo pedidos.</p>
                        <button 
                          onClick={() => setIsProOnboardingOpen(true)}
                          className="w-full bg-red-500 py-4 rounded-2xl font-black uppercase text-xs text-white shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                        >
                          {`Renovar Assinatura (R$ ${PRO_PLAN_PRICE.toFixed(2).replace('.', ',')})`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* ── Área Pro: Serviços, Produtos e Solicitações ── */}
                {(profileData?.role === 'pro' || profileData?.role === 'admin' || isAdmin) && (isAdmin || currentProfessional?.professionalStatus === 'active') && (
                  <div className="space-y-6 mt-4">
                    <div className="h-px bg-white/5" />
                    <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 w-full gap-1">
                      <button
                        onClick={() => setProDashboardTab('services')}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${proDashboardTab === 'services' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
                      >Serviços</button>
                      <button
                        onClick={() => setProDashboardTab('products')}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${proDashboardTab === 'products' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
                      >Produtos</button>
                      <button
                        onClick={() => setProDashboardTab('requests')}
                        className={`relative flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${proDashboardTab === 'requests' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
                      >
                        Pedidos
                        {openBudgetRequests.length > 0 && (
                          <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center border border-[#0d121f] ${proDashboardTab === 'requests' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'}`}>
                            {openBudgetRequests.length > 9 ? '9+' : openBudgetRequests.length}
                          </span>
                        )}
                      </button>
                    </div>
                    {proDashboardTab === 'services' && (
                      <ServiceManagement pro={currentProfessional} onUpdatePro={handleUpdatePro} embedded />
                    )}
                    {proDashboardTab === 'products' && (
                      <ProductManagement professional={currentProfessional} onPublish={() => setActiveTab('products')} />
                    )}
                    {proDashboardTab === 'requests' && (
                      <button
                        onClick={() => setActiveTab('pro_dashboard')}
                        className="w-full py-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <ClipboardList size={14} />
                        Ver todas as solicitações ({openBudgetRequests.length})
                      </button>
                    )}
                  </div>
                )}

                {/* ── Atalho Admin ── */}
                {(profileData?.role === 'admin' || isAdmin) && (
                  <button
                    onClick={() => setActiveTab('admin_dashboard')}
                    className="mt-6 w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border flex items-center justify-center gap-2 transition-all hover:opacity-80"
                    style={{ background: 'rgba(255,200,0,0.08)', borderColor: 'rgba(255,200,0,0.25)', color: '#FFD700' }}
                  >
                    <ShieldCheck size={14} /> Painel de Administração
                  </button>
                )}

                {/* ── Painel de Convites — exclusivo do criador ── */}
                {currentUser && isAdmin && (
                  <div className="mt-6 space-y-4">
                    <div className="h-px bg-white/5" />
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Users size={12} className="text-orange-500" /> Indicações
                      </h4>
                      <div className="bg-white/5 rounded-3xl border border-white/5 p-5 space-y-3">
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Convide profissionais pelo link abaixo. Quem se cadastrar pelo seu link ficará <span className="text-orange-400 font-black">ativo gratuitamente</span>.
                        </p>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-black/30 border border-white/10 rounded-2xl px-3 py-2.5 text-[10px] text-gray-400 font-mono truncate select-all">
                            {`${window.location.origin}?ref=${currentUser.uid}`}
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={async () => {
                              await navigator.clipboard.writeText(`${window.location.origin}?ref=${currentUser.uid}`);
                              setInviteLinkCopied(true);
                              setTimeout(() => setInviteLinkCopied(false), 2500);
                            }}
                            className={`shrink-0 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${inviteLinkCopied ? 'bg-green-500 text-white' : 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'}`}
                          >
                            {inviteLinkCopied ? <Check size={14} /> : 'Copiar'}
                          </motion.button>
                        </div>
                      </div>

                      {invitedPros.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{invitedPros.length} convidado{invitedPros.length > 1 ? 's' : ''}</p>
                          {invitedPros.map(pro => (
                            <div key={pro.id} className="flex items-center gap-3 bg-white/3 border border-white/5 rounded-2xl px-4 py-3">
                              <img src={pro.photoURL} alt={pro.name} className="w-9 h-9 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                              <div className="min-w-0 flex-1">
                                <p className="text-white text-xs font-black truncate">{pro.name}</p>
                                <p className="text-gray-500 text-[10px] font-bold">{pro.category}</p>
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                                pro.professionalStatus === 'active'
                                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                  : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                              }`}>
                                {pro.professionalStatus === 'active' ? 'Ativo' : 'Pendente'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {invitedPros.length === 0 && (
                        <div className="py-6 text-center bg-white/2 rounded-2xl border border-dashed border-white/5">
                          <Users size={24} className="mx-auto text-gray-700 mb-2" />
                          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Nenhum convidado ainda</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button onClick={logout} className="mt-4 w-full py-5 bg-red-500/5 text-red-500 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl border border-red-500/10 hover:bg-red-500 hover:text-white transition-all">
                  Sair da Conta
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin_dashboard' && (profileData?.role === 'admin' || isAdmin) && (
          <div className="px-6 lg:px-12 py-8 max-w-5xl mx-auto w-full mb-32 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Painel de Controle</h3>
               <div className="flex gap-3 flex-wrap">
                  {/* Botão revogar Pros sem pagamento */}
                  <button
                    onClick={() => showConfirm('Revogar todos os Pros sem assinatura ativa paga? Esta ação não pode ser desfeita.', async () => {
                      try {
                        const result = await callAdminAction('revoke_unpaid', '');
                        alert(`${result.count} conta(s) Pro sem assinatura paga foram desativadas.`);
                      } catch (e: any) { console.error(e); alert('Erro ao revogar: ' + e.message); }
                    })}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-red-500/20 transition-all"
                  >
                    Revogar Pros sem pagamento
                  </button>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-3xl flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Market</span>
                    <span className="text-xl font-black text-orange-500">{products.length}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-3xl flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Faturamento</span>
                    <span className="text-xl font-black text-green-500">R$ {adminRevenue.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-3xl flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ativos</span>
                    <span className="text-xl font-black text-blue-500">{professionals.length}</span>
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#121826] rounded-[40px] border border-white/5 p-8 shadow-2xl">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                  <ShoppingBag className="text-orange-500" /> Marketplace
                </h3>
                <div className="space-y-4">
                  {(() => {
                    const topProducts = Array.from(new Map(products.slice(0, 8).map(p => [p.id, p])).values()) as Product[];
                    debugDuplicateKeys(topProducts, (p) => p.id, "Marketplace Admin Central");
                    return topProducts.map((p, idx) => (
                      <div key={`admin-market-v16-p-${p.id}-${idx}`} className="group p-4 bg-white/2 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4">
                          <img src={p.imageUrl} className="w-10 h-10 rounded-lg object-cover" alt={p.name} />
                          <div>
                            <p className="font-bold text-white text-xs">{p.name}</p>
                            <p className="text-[9px] text-gray-500 uppercase font-black">{p.proName}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => showConfirm('Deseja realmente remover este produto?', async () => {
                            try {
                              await deleteDoc(doc(db, 'products', p.id));
                            } catch (err) { console.error(err); }
                          })}
                          className="p-2 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ));
                  })()}
                  {products.length === 0 && <p className="text-[10px] text-gray-600 text-center py-8">Nenhum produto cadastrado</p>}
                </div>
              </div>
              <div className="bg-[#121826] rounded-[40px] border border-white/5 p-8 shadow-2xl">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                  <ShieldCheck className="text-orange-500" /> Aprovar Profissionais
                </h3>
                {(prosAwaitingVerification || []).length === 0 ? (
                  <div className="py-20 text-center bg-white/2 rounded-3xl border border-white/5">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest italic leading-none">Nenhuma solicitação pendente.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      const uniqueAdmins = Array.from(new Map(prosAwaitingVerification.map(p => [p.id, p])).values()) as Professional[];
                      return uniqueAdmins.map((pro) => (
                        <div key={pro.id} className="group p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between transition-all hover:bg-white/[0.08]">
                          <div className="flex items-center gap-4">
                            <img src={pro.photoURL} alt={pro.name} className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                              <p className="font-bold text-white leading-none mb-1">{pro.name}</p>
                              <p className="text-[10px] text-orange-500 uppercase font-black tracking-widest">{pro.category}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRejectPro(pro.id)}
                              className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                              title="Rejeitar"
                            >
                              <X size={16} />
                            </button>
                            <button
                              onClick={() => handleApprovePro(pro.id)}
                              className="p-3 bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/20 hover:scale-105 transition-all"
                              title="Aprovar"
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>

              <div className="bg-[#121826] rounded-[40px] border border-white/5 p-8 shadow-2xl">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                  <CreditCard className="text-blue-500" /> Assinaturas Ativas
                </h3>
                <div className="space-y-4">
                  {adminRecentPayments.length === 0 ? (
                    <p className="text-[10px] text-gray-600 text-center py-8">Nenhuma assinatura ativa</p>
                  ) : adminRecentPayments.map((p) => (
                    <div key={`admin-pay-${p.id}`} className="p-4 bg-white/2 rounded-2xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={p.photoURL} alt={p.name} className="w-8 h-8 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{p.name}</span>
                          <span className="text-[10px] text-gray-500 uppercase font-black">{p.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{p.subscriptionType || 'pro'}</span>
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#121826] rounded-[40px] border border-white/5 p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                  Todas as Contas <span className="text-orange-500">({adminUsers.length})</span>
                </h3>
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  id="adminUserSearch"
                  className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 w-64"
                  onChange={e => {
                    const val = e.target.value.toLowerCase();
                    document.querySelectorAll('[data-admin-user]').forEach((el: any) => {
                      const name = el.dataset.adminUser.toLowerCase();
                      el.style.display = name.includes(val) ? '' : 'none';
                    });
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminUsers.length === 0 ? (
                  <p className="text-[10px] text-gray-600 col-span-3 text-center py-8">Nenhum usuário encontrado</p>
                ) : adminUsers.map((u: any) => (
                  <div key={`admin-user-${u.id}`} data-admin-user={`${u.name} ${u.email}`} className="p-4 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {u.photoURL
                        ? <img src={u.photoURL} alt={u.name} className="w-10 h-10 rounded-xl object-cover shrink-0" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                        : <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0 text-orange-500 font-black text-sm">{u.name?.[0]?.toUpperCase()}</div>
                      }
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{u.name}</p>
                        <p className="text-[10px] text-gray-600 truncate">{u.email}</p>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'text-yellow-500' : u.role === 'pro' ? 'text-green-500' : 'text-gray-500'}`}>
                          {u.role || 'client'}{u.blocked ? ' · bloqueado' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {u.role !== 'admin' && u.role !== 'pro' && (
                        <button
                          onClick={() => showConfirm(`Tornar ${u.name || u.email} um profissional?`, async () => {
                            try {
                              const tok = await currentUser?.getIdToken();
                              await fetch('/api/admin-action', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` }, body: JSON.stringify({ action: 'set_pro', proId: u.id }) });
                            } catch (err) { console.error(err); }
                          })}
                          className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                          title="Tornar profissional"
                        >
                          Pro
                        </button>
                      )}
                      {u.role === 'pro' && (
                        <button
                          onClick={() => showConfirm(`Remover plano pro de ${u.name || u.email}?`, async () => {
                            try {
                              const tok = await currentUser?.getIdToken();
                              await fetch('/api/admin-action', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` }, body: JSON.stringify({ action: 'set_client', proId: u.id }) });
                            } catch (err) { console.error(err); }
                          })}
                          className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-all"
                          title="Remover pro"
                        >
                          -Pro
                        </button>
                      )}
                      <button
                        onClick={() => showConfirm(`${u.blocked ? 'Desbloquear' : 'Bloquear'} ${u.name}?`, async () => {
                          try { await updateDoc(doc(db, 'users', u.id), { blocked: !u.blocked }); }
                          catch (err) { console.error(err); }
                        })}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${u.blocked ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                      >
                        {u.blocked ? 'Desbloq.' : 'Bloquear'}
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name || u.email)}
                          className="p-1.5 rounded-xl text-[9px] bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                          title="Excluir conta"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pro_dashboard' && (isAdmin || profileData?.role === 'pro' || currentProfessional) && (
          <div className="px-6 lg:px-12 py-8 max-w-6xl mx-auto w-full mb-32 space-y-12">
            {(!isAdmin && (!currentProfessional || currentProfessional.professionalStatus !== 'active')) ? (
              <div className="bg-orange-500/10 border border-orange-500/20 p-12 rounded-[48px] text-center space-y-6">
                 <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-orange-500/40">
                    <Lock size={40} />
                 </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white italic uppercase tracking-tighter">Acesso Restrito</h2>
                 <p className="text-gray-400 max-w-md mx-auto font-medium">Você precisa ativar sua assinatura profissional para liberar o painel completo, receber pedidos e aparecer no feed.</p>
                 <button
                  onClick={() => setIsProOnboardingOpen(true)}
                  className="bg-orange-500 text-white px-12 py-5 rounded-[24px] font-black uppercase text-sm tracking-widest shadow-2xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
                 >
                   {`Ativar Minha Conta (R$ ${PRO_PLAN_PRICE.toFixed(2).replace('.', ',')})`}
                 </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Tabs */}
                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 w-full gap-1">
                  <button
                    onClick={() => setProDashboardTab('services')}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${proDashboardTab === 'services' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
                  >
                    Serviços
                  </button>
                  <button
                    onClick={() => setProDashboardTab('products')}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${proDashboardTab === 'products' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
                  >
                    Produtos
                  </button>
                  <button
                    onClick={() => setProDashboardTab('requests')}
                    className={`relative flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${proDashboardTab === 'requests' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
                  >
                    Pedidos
                    {openBudgetRequests.length > 0 && (
                      <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center border border-[#0d121f] ${proDashboardTab === 'requests' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'}`}>
                        {openBudgetRequests.length > 9 ? '9+' : openBudgetRequests.length}
                      </span>
                    )}
                  </button>
                </div>

                {proDashboardTab === 'services' && (
                  <ServiceManagement pro={currentProfessional} onUpdatePro={handleUpdatePro} />
                )}
                {proDashboardTab === 'products' && (
                  <ProductManagement professional={currentProfessional} onPublish={() => setActiveTab('products')} />
                )}
                {proDashboardTab === 'requests' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-black text-lg uppercase tracking-tight">Solicitações Abertas</h3>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Clientes buscando profissionais como você</p>
                      </div>
                      {openBudgetRequests.length > 0 && (
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-xl text-[9px] font-black uppercase border border-orange-500/20">
                          {openBudgetRequests.length} abertas
                        </span>
                      )}
                    </div>

                    {loadingBudgetRequests ? (
                      <div className="space-y-3">
                        {[1,2,3].map(i => (
                          <div key={i} className="h-28 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
                        ))}
                      </div>
                    ) : openBudgetRequests.length === 0 ? (
                      <div className="py-16 text-center bg-white/2 rounded-3xl border border-dashed border-white/10">
                        <ClipboardList size={40} className="mx-auto text-gray-700 mb-3" />
                        <p className="text-gray-500 font-bold text-sm">Nenhuma solicitação aberta no momento.</p>
                        <p className="text-gray-700 text-xs mt-1">Novas solicitações aparecerão aqui em tempo real.</p>
                      </div>
                    ) : (
                      openBudgetRequests.map((req) => {
                        const urgencyMap: Record<string, { label: string; color: string }> = {
                          urgent: { label: 'Urgente', color: 'bg-red-500/20 text-red-400 border-red-500/20' },
                          normal: { label: 'Normal', color: 'bg-gray-500/20 text-gray-400 border-gray-500/20' },
                          scheduled: { label: 'Planejado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
                        };
                        const urgency = urgencyMap[req.urgency] || urgencyMap.normal;
                        const timeAgo = req.createdAt?.toDate ? (() => {
                          const diff = Date.now() - req.createdAt.toDate().getTime();
                          const mins = Math.floor(diff / 60000);
                          if (mins < 60) return `${mins}min atrás`;
                          const hrs = Math.floor(mins / 60);
                          if (hrs < 24) return `${hrs}h atrás`;
                          return `${Math.floor(hrs / 24)}d atrás`;
                        })() : '';

                        return (
                          <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#0d121f] border border-white/8 rounded-3xl p-5 space-y-3 hover:border-orange-500/20 transition-all"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-grow">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${urgency.color}`}>
                                    {urgency.label}
                                  </span>
                                  {req.category && (
                                    <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-gray-400">
                                      {req.category}
                                    </span>
                                  )}
                                  <span className="text-[9px] text-gray-600 font-bold">{timeAgo}</span>
                                </div>
                                <h4 className="text-white font-black text-sm leading-tight">{req.title}</h4>
                                {req.description && (
                                  <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">{req.description}</p>
                                )}
                              </div>
                              {req.budget && (
                                <div className="shrink-0 text-right">
                                  <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Orçamento</p>
                                  <p className="text-orange-500 font-black text-sm">R$ {req.budget}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
                              <div className="flex items-center gap-3 min-w-0">
                                {req.location && (
                                  <span className="flex items-center gap-1 text-[9px] text-gray-500 font-bold truncate">
                                    <MapPin size={10} className="text-orange-500 shrink-0" />
                                    {req.location}
                                  </span>
                                )}
                                <span className="text-[9px] text-gray-600 font-bold truncate">por {req.clientName || 'Cliente'}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {isAdmin && (
                                  <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDeleteSmartRequest(req.id)}
                                    className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 active:scale-95 transition-all"
                                    title="Apagar solicitação"
                                  >
                                    <Trash2 size={13} />
                                  </motion.button>
                                )}
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleRespondToRequest(req)}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                                >
                                  <MessageSquare size={11} />
                                  Responder
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="px-6 lg:px-12 py-8 max-w-4xl mx-auto w-full">
            <h2 className="text-3xl font-bold mb-8">Favoritos</h2>
            <div className="bg-[#121826] rounded-3xl border border-white/5 p-12 text-center">
              <Heart size={48} className="mx-auto text-gray-700 mb-4" />
              <p className="text-gray-500">Recurso em desenvolvimento. Em breve você poderá salvar seus profissionais favoritos aqui!</p>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="px-6 lg:px-12 py-8 max-w-2xl mx-auto w-full">
            <h2 className="text-3xl font-bold mb-8">Notificações</h2>
            <div className="space-y-4">
              {(notifications || []).length === 0 ? (
                <div className="bg-[#121826] rounded-3xl p-12 text-center border border-white/5">
                  <Bell size={48} className="mx-auto text-gray-700 mb-4" />
                  <p className="text-gray-500">Nenhuma notificação por enquanto.</p>
                </div>
              ) : (
                (() => {
                  const uniqueNotifs = Array.from(new Map(notifications.map(n => [n.id, n])).values()) as any[];
                  debugDuplicateKeys(uniqueNotifs, (n) => n.id, "Notificações");
                  return uniqueNotifs.map((n, i) => (
                    <div key={n.id} className={`p-4 bg-[#121826] border border-white/5 rounded-2xl flex items-start gap-4 ${!n.read ? 'border-orange-500/30' : ''}`}>
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                      {n.type === 'message' ? <MessageSquare size={18} /> : <Bell size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{n.title || (n.type === 'message' ? 'Nova Mensagem' : 'Notificação')}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.text || n.message}</p>
                      <p className="text-[10px] text-gray-600 mt-2">{n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : 'Recentemente'}</p>
                    </div>
                  </div>
                  ));
                })()
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="px-6 lg:px-12 py-8 max-w-2xl mx-auto w-full mb-32">
            <h2 className="text-3xl font-bold mb-8">Configurações</h2>
            <div className="bg-[#121826] rounded-3xl border border-white/5 overflow-hidden">
                <div 
                  className="p-6 border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => handleToggleSetting('emailNotifications', profileData?.emailNotifications)}
                >
                  <div><p className="font-bold text-white">Notificações por E-mail</p><p className="text-xs text-gray-500">Receba alertas de novos pedidos.</p></div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${profileData?.emailNotifications ? 'bg-orange-500' : 'bg-gray-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${profileData?.emailNotifications ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
                <div 
                  className="p-6 border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => handleToggleSetting('publicProfile', profileData?.publicProfile)}
                >
                  <div><p className="font-bold text-white">Perfil Público</p><p className="text-xs text-gray-500">Permitir que outros vejam seu perfil.</p></div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${profileData?.publicProfile ? 'bg-orange-500' : 'bg-gray-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${profileData?.publicProfile ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
                <div 
                  className="p-6 border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => handleToggleSetting('whatsappVisible', profileData?.whatsappVisible)}
                >
                  <div><p className="font-bold text-white">WhatsApp Visível</p><p className="text-xs text-gray-500">Mostrar seu número para clientes.</p></div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${profileData?.whatsappVisible ? 'bg-orange-500' : 'bg-gray-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${profileData?.whatsappVisible ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
                <div className="p-6 border-b border-white/5">
                  <button
                    onClick={async () => {
                      const token = await requestPushPermission();
                      if (token) {
                        setActiveToast({ title: '🔔 Notificações ativadas!', message: 'Você receberá alertas de novas mensagens.' } as any);
                      } else {
                        const perm = 'Notification' in window ? Notification.permission : 'unsupported';
                        if (perm === 'denied') {
                          alert('Notificações bloqueadas. Vá em Configurações do navegador → Notificações → facilitai.online → Permitir.');
                        } else if (perm === 'unsupported') {
                          alert('Seu navegador não suporta notificações push.');
                        } else {
                          alert('Não foi possível ativar. Tente novamente.');
                        }
                      }
                    }}
                    className="w-full py-4 text-orange-500 font-bold bg-orange-500/5 hover:bg-orange-500/10 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <Bell size={18} />
                    {'Notification' in window && Notification.permission === 'granted' ? 'Notificações Push Ativas ✓' : 'Ativar Notificações Push'}
                  </button>
                </div>
                <div className="p-6">
                  <button
                    onClick={() => showConfirm('Tem certeza que deseja encerrar a sessão?', logout)}
                    className="w-full py-4 text-red-500 font-bold bg-red-500/5 hover:bg-red-500/10 rounded-2xl transition-all"
                  >
                    Encerrar Sessão
                  </button>
                </div>
            </div>
          </div>
        )}
      </main>
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={isAdmin ? 'admin' : profileData?.role}
        onPublishService={() => {
          const isPro = profileData?.role === 'pro';
          if (isPro) {
            setActiveTab('pro_dashboard');
            setProDashboardTab('services');
          } else {
            setIsSmartBudgetModalOpen(true);
          }
        }}
        onPublishProduct={() => {
          const isPro = profileData?.role === 'pro';
          if (isPro) {
            setActiveTab('pro_dashboard');
            setProDashboardTab('products');
          } else {
            setIsPremiumModalOpen(true);
          }
        }}
      />

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal && (
          <div key="modal-confirm" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmModal(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-[#121826] border border-white/10 rounded-[32px] w-full max-w-sm p-8 flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertTriangle size={28} />
              </div>
              <p className="text-white font-bold text-base leading-relaxed">{confirmModal.message}</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 rounded-2xl bg-white/5 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                  Cancelar
                </button>
                <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals and Overlays */}
      <AnimatePresence>
        {isProModalOpen && (
          <div key="modal-pro" className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProModalOpen(false)} className="absolute inset-0 bg-[#070b13]/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="relative bg-[#121826] border border-white/10 rounded-[40px] w-full max-w-lg flex flex-col max-h-[90vh]">
              <div className="p-8 pb-4 shrink-0 flex justify-between items-start">
                <div><h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic">Seja Profissional</h2><p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Sua jornada começa agora</p></div>
                <button onClick={() => setIsProModalOpen(false)} className="bg-white/5 p-3 rounded-2xl text-gray-400 hover:text-white transition-all"><X size={20} /></button>
              </div>
              <div className="p-8 pt-4 overflow-y-auto no-scrollbar space-y-6">
                <form onSubmit={handleBecomePro} className="space-y-6">
                  <div className="space-y-4">
                    <input type="text" placeholder="Especialidade" className="w-full bg-[#070b13] border border-white/10 rounded-2xl py-4 px-4 text-white" value={proForm.category} onChange={e => setProForm({...proForm, category: e.target.value})} />
                    <input type="text" placeholder="Habilidades (ex: Pintura, Elétrica)" className="w-full bg-[#070b13] border border-white/10 rounded-2xl py-4 px-4 text-white" value={proForm.skills} onChange={e => setProForm({...proForm, skills: e.target.value})} />
                    <textarea placeholder="Descrição" className="w-full bg-[#070b13] border border-white/10 rounded-2xl py-4 px-4 text-white min-h-[140px]" value={proForm.description} onChange={e => setProForm({...proForm, description: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" placeholder="Preço" className="bg-[#070b13] border border-white/10 rounded-2xl py-4 px-4 text-white" value={proForm.pricePerService} onChange={e => setProForm({...proForm, pricePerService: Number(e.target.value)})} />
                      <input type="text" placeholder="Localização" className="bg-[#070b13] border border-white/10 rounded-2xl py-4 px-4 text-white" value={proForm.location} onChange={e => setProForm({...proForm, location: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" disabled={authLoading} className="w-full py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 uppercase text-sm">
                    {authLoading ? 'Processando...' : 'Assinar com Kirvano'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {isProCheckoutOpen && (
          <div key="modal-pro-checkout" className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsProCheckoutOpen(false)} 
              className="absolute inset-0 bg-[#070b13]/95 backdrop-blur-2xl" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative bg-[#121826] border border-white/10 rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-8 text-center border-b border-white/5">
                <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20">
                  <CreditCard size={40} className="text-white" />
                </div>
                <h2 className="text-xl font-black text-white uppercase italic leading-none mb-2">Assinatura Pro</h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Habilite seu perfil profissional</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-[#070b13] border border-orange-500/30 rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Plano Mensal</span>
                    <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">Popular</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-white text-4xl font-black italic">R$ 23</span>
                    <span className="text-gray-500 text-lg font-bold">,90/mês</span>
                  </div>
                 <ul className="space-y-3">
                    {(() => {
                      const features = [
                        'Destaque na busca',
                        'Selos exclusivos',
                        'Portfólio ilimitado',
                        'Suporte prioritário',
                        'Taxa zero por serviço'
                      ];
                      return features.map((feature, i) => (
                        <li key={`pro-feature-v16-${i}`} className="flex items-center gap-3 text-sm text-gray-300">
                          <CheckCircle size={16} className="text-orange-500" />
                          {feature}
                        </li>
                      ));
                    })()}
                  </ul>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleConfirmProSubscription}
                    disabled={authLoading}
                    className="w-full py-5 bg-white text-black font-black rounded-2xl shadow-xl uppercase text-xs tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    {authLoading ? <Spinner size={16} /> : 'Assinar Agora'}
                  </button>
                  <button 
                    onClick={() => setIsProCheckoutOpen(false)}
                    className="w-full py-4 text-gray-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-all"
                  >
                    Cancelar
                  </button>
                </div>

                <p className="text-[9px] text-gray-600 text-center leading-relaxed px-4">
                  Ao assinar, você concorda com nossos termos de uso profissional. O cancelamento pode ser feito a qualquer momento.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {showActiveProsModal && (
          <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowActiveProsModal(false)} className="absolute inset-0 bg-[#070b13]/90 backdrop-blur-md" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[#070b13] sm:rounded-[40px] sm:border sm:border-white/10 rounded-t-[40px] h-[80vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 shrink-0 sm:hidden" />
              <div className="flex items-center justify-between px-6 py-5 shrink-0 border-b border-white/5">
                <div>
                  <h3 className="text-white font-black uppercase italic tracking-tighter text-lg">Ativos Agora</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                    {professionals.filter(p => p.professionalStatus === 'active' && p.subscriptionStatus === 'active').length} profissional(is) ativo(s)
                  </p>
                </div>
                <button onClick={() => setShowActiveProsModal(false)} className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white transition-all"><X size={18} /></button>
              </div>
              <div className="overflow-y-auto no-scrollbar flex-grow p-4 space-y-3">
                {professionals
                  .filter(p => p.professionalStatus === 'active' && p.subscriptionStatus === 'active')
                  .map(p => (
                    <motion.div key={p.id} whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowActiveProsModal(false); setSelectedPro(p); }}
                      className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl px-4 py-3 cursor-pointer hover:border-orange-500/30 transition-all">
                      <img src={p.photoURL} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-black truncate">{p.name}</p>
                        <p className="text-gray-500 text-[10px] font-bold">{p.category}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span className="text-[9px] text-green-400 font-black uppercase">Ativo</span>
                      </div>
                    </motion.div>
                  ))
                }
              </div>
            </motion.div>
          </div>
        )}

        {selectedPro && (
          <div key="modal-selected-pro" className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPro(null)} className="absolute inset-0 bg-[#070b13]/90 backdrop-blur-md" />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[#070b13] sm:rounded-[40px] sm:border sm:border-white/10 h-[92vh] sm:h-auto sm:max-h-[85vh] overflow-hidden flex flex-col rounded-t-[40px] shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 shrink-0 sm:hidden" />
              <div className="relative h-64 shrink-0 mt-2 sm:mt-0">
                {/* Banner or photo as background */}
                <img
                  src={selectedPro.bannerURL || selectedPro.photoURL}
                  className="w-full h-full object-cover"
                  alt={selectedPro.name}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b13] via-[#070b13]/30 to-transparent" />
                <button onClick={() => setSelectedPro(null)} className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-3 rounded-2xl text-white"><X size={20} /></button>
                {/* Avatar over banner */}
                {selectedPro.bannerURL && (
                  <div className="absolute bottom-4 left-6">
                    <img
                      src={selectedPro.photoURL}
                      alt={selectedPro.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-xl shadow-orange-500/20"
                    />
                  </div>
                )}
                <div className={`absolute bottom-6 right-8 flex items-end justify-between ${selectedPro.bannerURL ? 'left-28' : 'left-8'}`}>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-3xl font-black text-white leading-none mb-1 truncate">{selectedPro.name}</h2>
                    <p className="text-orange-500 font-bold uppercase tracking-widest text-xs">{selectedPro.category}</p>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLikePro(selectedPro.id)}
                    className="flex flex-col items-center gap-1 bg-black/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/5"
                  >
                    <Heart size={20} className={userLikedPros[selectedPro.id] ? 'fill-red-500 text-red-500' : 'text-white'} />
                    <span className="font-black text-[10px] text-white leading-none">{selectedPro.likesCount || 0}</span>
                  </motion.button>
                </div>
              </div>
              <div className="p-4 sm:p-8 space-y-6 overflow-y-auto no-scrollbar flex-grow pb-32 sm:pb-8">
                 <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1.5 text-center">Preço/h</p>
                      <p className="text-lg sm:text-xl font-black text-white text-center">R$ {selectedPro.pricePerService}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1.5 text-center">Avaliação</p>
                      <p className="text-lg sm:text-xl font-black text-yellow-500 text-center flex items-center justify-center gap-1">
                        <Star size={16} className="fill-yellow-500" /> {selectedPro.rating}
                      </p>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sobre o Profissional</h4>
                   <p className="text-gray-400 text-sm leading-relaxed italic">"{selectedPro.description}"</p>
                 </div>
                 
                 <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 w-full mb-6">
                    <button
                      onClick={() => setPublicProTab('portfolio')}
                      className={`flex-grow py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${publicProTab === 'portfolio' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
                    >
                      Portfólio
                    </button>
                    <button
                      onClick={() => setPublicProTab('products')}
                      className={`flex-grow py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${publicProTab === 'products' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
                    >
                      Produtos
                    </button>
                 </div>

                 {publicProTab === 'portfolio' ? (
                   <PortfolioGallery
                     proId={selectedPro.id}
                     proPhoto={selectedPro.photoURL}
                     proName={selectedPro.name}
                   />
                 ) : (
                   <div className="space-y-4 pb-10">
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Produtos Disponíveis</p>
                     {proProductsLoading ? (
                       <div className="grid grid-cols-1 gap-3">
                         {[1, 2, 3].map(i => (
                           <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
                         ))}
                       </div>
                     ) : (() => {
                       const proItems = products.filter(p => p.proId === selectedPro.id && p.status === 'active');
                       return proItems.length === 0 ? (
                         <div className="py-12 text-center bg-white/2 rounded-3xl border border-dashed border-white/5">
                           <Package size={32} className="mx-auto text-gray-700 mb-2" />
                           <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Nenhum produto no momento.</p>
                         </div>
                       ) : (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {proItems.map((product, idx) => (
                             <ProductCard
                               key={product.id || `pro-prod-${idx}`}
                               product={product}
                               onViewSeller={(proId) => openProProfile(proId)}
                             />
                           ))}
                         </div>
                       );
                     })()}
                   </div>
                 )}
              </div>

              {/* Bottom Actions */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#070b13] via-[#070b13]/95 to-transparent pt-10 pb-[max(env(safe-area-inset-bottom,16px),16px)] px-5 backdrop-blur-sm">
                <div className={`grid gap-2 ${
                  selectedPro.serviceMode && selectedPro.serviceMode !== 'none'
                    ? 'grid-cols-3'
                    : 'grid-cols-2'
                }`}>
                  {/* WhatsApp / Solicitar */}
                  {selectedPro.whatsapp && selectedPro.whatsappVisible ? (
                    <motion.a
                      whileTap={{ scale: 0.95 }}
                      href={isDemoMode ? '#' : `https://wa.me/55${selectedPro.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${selectedPro.name}! Vi seu perfil no Facilita Aí e gostaria de solicitar um serviço.`)}`}
                      target={isDemoMode ? '_self' : '_blank'}
                      rel="noopener noreferrer"
                      onClick={(e) => { if (demoGuard('Crie sua conta para falar direto com o profissional pelo WhatsApp.')) e.preventDefault(); }}
                      className="flex flex-col items-center justify-center gap-1 h-14 bg-[#25D366] rounded-2xl text-white shadow-lg shadow-[#25D366]/20 active:scale-95 transition-all"
                    >
                      <MessageCircle size={18} strokeWidth={2.5} />
                      <span className="text-[8px] font-black uppercase tracking-wider">WhatsApp</span>
                    </motion.a>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedPro(null); setBudgetPro(selectedPro); setIsSmartBudgetModalOpen(true); }}
                      className="flex flex-col items-center justify-center gap-1 h-14 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                    >
                      <ClipboardList size={18} strokeWidth={2.5} />
                      <span className="text-[8px] font-black uppercase tracking-wider">Solicitar</span>
                    </motion.button>
                  )}

                  {/* Agendar / Fila — só aparece se o pro tem serviceMode ativo */}
                  {selectedPro.serviceMode && selectedPro.serviceMode !== 'none' && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowBookingModal(true)}
                      className="flex flex-col items-center justify-center gap-1 h-14 bg-white/10 border border-white/10 rounded-2xl text-white hover:bg-white/15 active:scale-95 transition-all"
                    >
                      {selectedPro.serviceMode === 'queue'
                        ? <ListOrdered size={18} strokeWidth={2.5} />
                        : <CalendarCheck size={18} strokeWidth={2.5} />
                      }
                      <span className="text-[8px] font-black uppercase tracking-wider">
                        {selectedPro.serviceMode === 'queue' ? 'Fila' : selectedPro.serviceMode === 'both' ? 'Agendar/Fila' : 'Agendar'}
                      </span>
                    </motion.button>
                  )}

                  {/* Mensagem */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedPro(null); openChat(selectedPro); }}
                    className="flex flex-col items-center justify-center gap-1 h-14 bg-white/10 border border-white/10 rounded-2xl text-white hover:bg-white/15 active:scale-95 transition-all"
                  >
                    <MessageSquare size={18} strokeWidth={2.5} />
                    <span className="text-[8px] font-black uppercase tracking-wider">Mensagem</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showBookingModal && selectedPro && profileData && (
          <div key="modal-booking" className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBookingModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div 
               initial={{ y: "100%", opacity: 0 }} 
               animate={{ y: 0, opacity: 1 }} 
               exit={{ y: "100%", opacity: 0 }} 
               className="relative w-full max-w-lg bg-[#070b13] border-t sm:border border-white/10 rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl pb-[env(safe-area-inset-bottom,0px)] max-h-[95vh] overflow-y-auto no-scrollbar"
            >
              <React.Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
                <BookingSystem pro={selectedPro} user={profileData} onClose={() => setShowBookingModal(false)} />
              </React.Suspense>
            </motion.div>
          </div>
        )}

        {showBudgetModal && budgetPro && (
          <div key="modal-budget" className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBudgetModal(false)} className="absolute inset-0 bg-[#070b13]/90 backdrop-blur-md dark" />
            <motion.div 
              initial={{ y: "100%", opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: "100%", opacity: 0 }} 
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#121826] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[40px] overflow-hidden shadow-2xl pb-[env(safe-area-inset-bottom,32px)]"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 sm:hidden" />
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                       <Hammer size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase text-white leading-none mb-1">Agendar Serviço</h3>
                      <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest leading-none">{budgetPro.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowBudgetModal(false)} className="p-3 text-gray-500 hover:text-white bg-white/5 rounded-2xl transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">Detalhes do Pedido</label>
                    <textarea 
                      placeholder="Descreva o que você precisa com detalhes..." 
                      value={budgetDescription} 
                      onChange={e => setBudgetDescription(e.target.value)} 
                      className="w-full bg-[#070b13] border border-white/10 rounded-2xl p-4 text-white h-28 resize-none focus:border-orange-500 transition-colors outline-none text-sm leading-relaxed" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">Data</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                        <input 
                          type="date" 
                          value={budgetDate} 
                          onChange={e => setBudgetDate(e.target.value)} 
                          className="w-full bg-[#070b13] border border-white/10 rounded-2xl p-3.5 pl-12 text-white text-xs outline-none focus:border-orange-500 transition-colors" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">Hora</label>
                      <div className="relative">
                        <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                        <input 
                          type="time" 
                          value={budgetTime} 
                          onChange={e => setBudgetTime(e.target.value)} 
                          className="w-full bg-[#070b13] border border-white/10 rounded-2xl p-3.5 pl-12 text-white text-xs outline-none focus:border-orange-500 transition-colors" 
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={confirmBudgetRequest} 
                    disabled={isActionLoading.confirmBudget}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    {isActionLoading.confirmBudget ? <Spinner size={16} /> : null}
                    {isActionLoading.confirmBudget ? 'Processando...' : 'Confirmar Agendamento'}
                  </button>
                  <p className="text-[10px] text-gray-600 text-center font-bold tracking-tight">O profissional receberá uma notificação instantânea.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {selectedOrderForReview && (
          <div key="modal-order-review" className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrderForReview(null)} className="absolute inset-0 bg-[#070b13]/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-[#121826] border border-white/10 rounded-[32px] p-8 shadow-2xl">
              <h3 className="text-xl font-black uppercase mb-6">Revisar Agendamento</h3>
              
              <div className="space-y-6">
                <div className="bg-[#070b13] p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Cliente</p>
                  <p className="text-white font-bold">{selectedOrderForReview.clientName}</p>
                </div>

                <div className="bg-[#070b13] p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Serviço</p>
                  <p className="text-white font-bold">{selectedOrderForReview.serviceTitle}</p>
                  <p className="text-xs text-gray-400 mt-2 italic">"{selectedOrderForReview.description}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#070b13] p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Data</p>
                    <p className="text-xs text-white">
                      {selectedOrderForReview.scheduledAt?.toDate 
                        ? selectedOrderForReview.scheduledAt.toDate().toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-[#070b13] p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Hora</p>
                    <p className="text-xs text-white">
                      {selectedOrderForReview.scheduledAt?.toDate 
                        ? selectedOrderForReview.scheduledAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => {
                      handleUpdateOrderStatus(selectedOrderForReview.id, 'cancelled');
                      setSelectedOrderForReview(null);
                    }}
                    disabled={isActionLoading[`order_${selectedOrderForReview.id}`]}
                    className="flex-grow bg-red-500/10 text-red-500 py-4 rounded-2xl font-black uppercase text-xs hover:bg-red-500 hover:text-white transition-all underline decoration-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isActionLoading[`order_${selectedOrderForReview.id}`] ? <Spinner size={12} /> : null}
                    Recusar
                  </button>
                  <button 
                    onClick={() => {
                      handleUpdateOrderStatus(selectedOrderForReview.id, 'in_progress');
                      setSelectedOrderForReview(null);
                    }}
                    disabled={isActionLoading[`order_${selectedOrderForReview.id}`]}
                    className="flex-grow bg-green-500 py-4 rounded-2xl font-black uppercase text-xs shadow-xl shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isActionLoading[`order_${selectedOrderForReview.id}`] ? <Spinner size={12} /> : null}
                    Aceitar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {/* Verification Checkout Modal */}
        <AnimatePresence>
          {isVerificationModalOpen && (
            <div key="modal-verification" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsVerificationModalOpen(false)}
                className="absolute inset-0 bg-[#070b13]/90 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                className="relative bg-[#0d111b] border border-white/10 rounded-[48px] w-full max-w-md overflow-hidden shadow-2xl p-8"
              >
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-blue-500/20 text-blue-500 rounded-[32px] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                    <ShieldCheck size={40} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Selo de Verificado</h3>
                    <p className="text-gray-400 text-sm">Transmita confiança absoluta e receba mais solicitações de orçamento.</p>
                  </div>

                  <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/20 text-blue-500 p-2 rounded-xl"><ShieldCheck size={18} /></div>
                      <span className="text-xs font-bold text-gray-300">Selo oficial de confiança</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500/20 text-orange-500 p-2 rounded-xl"><SearchIcon size={18} /></div>
                      <span className="text-xs font-bold text-gray-300">Destaque prioritário nas buscas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/20 text-green-500 p-2 rounded-xl"><Star size={18} /></div>
                      <span className="text-xs font-bold text-gray-300">Aumento de até 3x nos contatos</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-lg font-bold text-gray-500">R$</span>
                      <span className="text-4xl font-black text-white">{VERIFICATION_BADGE_PRICE.toFixed(2).replace('.', ',')}</span>
                      <span className="text-sm font-bold text-gray-500">único</span>
                    </div>

                    <button 
                      onClick={handleConfirmVerificationPayment}
                      disabled={authLoading}
                      className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:bg-orange-500 active:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {authLoading ? <Spinner size={14} className="text-black" /> : <ShieldCheck size={18} />}
                      {authLoading ? 'Redirecionando...' : 'Obter Verificação via Kirvano'}
                    </button>
                    
                    <button 
                      onClick={() => setIsVerificationModalOpen(false)}
                      className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Depois eu vejo isso
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
          {isLocationModalOpen && (
            <div key="modal-location" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLocationModalOpen(false)}
                className="absolute inset-0 bg-[#070b13]/90 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                className="relative bg-[#121826] border border-white/10 rounded-[48px] w-full max-w-md overflow-hidden shadow-2xl p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black uppercase italic tracking-tighter">Onde você está?</h3>
                  <button onClick={() => setIsLocationModalOpen(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <MapPin size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      autoFocus
                      type="text" 
                      value={locationTerm}
                      onChange={(e) => setLocationTerm(e.target.value)}
                      placeholder="Cidade, CEP ou Bairro..."
                      className="w-full bg-[#070b13] border border-white/5 rounded-3xl py-4 pl-14 pr-6 text-white font-bold outline-none border-white/10 focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4">Cidades Populares</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Curitiba, PR', 'Porto Alegre, RS', 'Brasília, DF'].map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setLocationTerm(city);
                            setIsLocationModalOpen(false);
                          }}
                          className={`p-4 rounded-2xl text-[11px] font-bold uppercase tracking-tight transition-all text-left ${locationTerm === city ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsLocationModalOpen(false)}
                    className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-orange-500/20 active:scale-95 transition-all mt-4"
                  >
                    Confirmar Localização
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {orderToDelete && (
            <div key="modal-order-delete" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOrderToDelete(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-[#121826] border border-white/10 p-8 rounded-[40px] shadow-2xl max-w-sm w-full overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Trash2 size={120} className="text-red-500" />
                </div>
                
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
                    <Trash2 size={32} />
                  </div>
                  
                  <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">Excluir Pedido?</h3>
                  <p className="text-gray-400 text-xs font-medium leading-relaxed mb-8">
                    Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.
                  </p>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setOrderToDelete(null)}
                      className="flex-grow py-4 rounded-2xl bg-white/5 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={confirmDeleteOrder}
                      className="flex-grow py-4 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <React.Suspense fallback={null}>
          <SmartBudgetModal
            isOpen={isSmartBudgetModalOpen}
            onClose={() => setIsSmartBudgetModalOpen(false)}
            onTrackRequest={() => { setIsSmartBudgetModalOpen(false); setActiveTab('orders'); }}
          />
        </React.Suspense>

        <AnimatePresence>
          {completingOrder && (
            <React.Suspense fallback={null}>
              <CompletionModal
                order={completingOrder}
                userRole={profileData?.role}
                onClose={() => setCompletingOrder(null)}
              />
            </React.Suspense>
          )}
        </AnimatePresence>
        
        {showOnboarding && (
          <Onboarding
            onComplete={() => setShowOnboarding(false)}
          />
        )}

        {cropModal && (
          <ImageCropModal
            imageSrc={cropModal.src}
            aspect={cropModal.type === 'banner' ? 16 / 5 : 1}
            onConfirm={handleCropConfirm}
            onCancel={() => setCropModal(null)}
          />
        )}

        {/* SOS Floating Button */}
        <AnimatePresence>
          {activeTab !== 'emergency' && (
              <motion.button
                key="sos-floating-button-v15"
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: 20 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab('emergency')}
                className="fixed right-6 bottom-24 lg:bottom-10 z-[110] w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-[0_15px_40px_rgba(220,38,38,0.5)] border-2 border-white/20 group transition-all"
              >
                {/* Efeito de pulso discreto */}
                <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse opacity-20 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <Siren className="w-6 h-6 group-hover:animate-shake" />
                </div>

                <div className="absolute -top-1 -right-1 bg-white text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md z-20 border border-red-100">SOS</div>
                
                {/* Tooltip ao passar o mouse */}
                <div className="absolute right-full mr-3 bg-red-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap shadow-xl">
                  Emergência
                </div>
              </motion.button>
          )}
        </AnimatePresence>
      </AnimatePresence>

      {/* Demo Mode Overlays */}
      {isDemoMode && (
        <DemoBanner
          onExit={() => { setIsDemoMode(false); setProfessionals([]); setProducts([]); }}
          onSignUp={() => { setIsDemoMode(false); setIsSignUpMode(true); }}
        />
      )}
      {isDemoMode && showDemoTour && <DemoTour onDone={() => setShowDemoTour(false)} />}
      <AuthPromptModal
        open={showAuthPromptDemo}
        onClose={() => setShowAuthPromptDemo(false)}
        onSignUp={() => { setIsDemoMode(false); setShowAuthPromptDemo(false); setIsSignUpMode(true); }}
        onLogin={() => { setIsDemoMode(false); setShowAuthPromptDemo(false); setIsSignUpMode(false); }}
        message={authPromptMessage}
      />
      {isDemoMode && <DemoCtaBanner onSignUp={() => { setIsDemoMode(false); setIsSignUpMode(true); }} onLogin={() => { setIsDemoMode(false); setIsSignUpMode(false); }} />}
    </div>
  );
}
