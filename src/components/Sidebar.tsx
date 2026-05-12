import React from 'react';
import { 
  Home, Search, ShoppingBag, MessageSquare, 
  Heart, Bell, User, Settings, Hammer, Flashlight, ShieldCheck,
  ClipboardList, Package, Siren
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${active ? 'bg-orange-500/10 text-orange-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
  >
    <Icon size={20} className={active ? 'text-orange-500' : ''} />
    <span className="font-medium">{label}</span>
  </div>
);

export function Sidebar({ activeTab, onTabChange, onBecomePro, userRole }: { 
  activeTab: string, 
  onTabChange: (tab: string) => void,
  onBecomePro?: () => void,
  userRole?: string
}) {
  return (
    <aside className="hidden lg:flex w-64 bg-[#070b13] border-r border-white/5 flex-col p-6 sticky top-0 h-screen">
      <div onClick={() => onTabChange('home')} className="flex items-center gap-3 mb-12 cursor-pointer group">
        <div className="w-11 h-11 rounded-[18px] flex items-center justify-center group-active:scale-95 transition-all shrink-0" style={{ background: 'linear-gradient(135deg, #1a0e00, #2d1600)', boxShadow: '0 10px 20px rgba(255,122,0,0.35)', border: '1px solid rgba(255,122,0,0.25)' }}>
          <Hammer size={22} className="text-[#FF7A00]" />
        </div>
        <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">
          <span className="text-white">FACILITA</span>
          <span className="text-[#FF7A00] ml-1.5">AÍ</span>
        </h1>
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        <SidebarItem icon={Home} label="Início" active={activeTab === 'home'} onClick={() => onTabChange('home')} />
        <SidebarItem icon={ClipboardList} label="Serviços" active={activeTab === 'orders'} onClick={() => onTabChange('orders')} />
        <SidebarItem icon={Package} label="Produtos" active={activeTab === 'products'} onClick={() => onTabChange('products')} />
        <SidebarItem icon={MessageSquare} label="Mensagens" active={activeTab === 'chat_list'} onClick={() => onTabChange('chat_list')} />
        <SidebarItem icon={Heart} label="Favoritos" active={activeTab === 'favorites'} onClick={() => onTabChange('favorites')} />
        <SidebarItem icon={Bell} label="Notificações" active={activeTab === 'notifications'} onClick={() => onTabChange('notifications')} />
        <SidebarItem icon={User} label="Perfil" active={activeTab === 'profile'} onClick={() => onTabChange('profile')} />
        {userRole === 'admin' && (
          <SidebarItem icon={ShieldCheck} label="Administração" active={activeTab === 'admin_dashboard'} onClick={() => onTabChange('admin_dashboard')} />
        )}
        <SidebarItem icon={Settings} label="Configurações" active={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
      </nav>

      {userRole === 'admin' ? (
        <div
          onClick={() => onTabChange('admin_dashboard')}
          className="mt-8 p-6 rounded-3xl relative overflow-hidden group border cursor-pointer transition-all hover:opacity-90"
          style={{ background: 'rgba(255,200,0,0.07)', borderColor: 'rgba(255,200,0,0.2)' }}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl" style={{ background: 'rgba(255,200,0,0.08)' }} />
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <ShieldCheck size={16} style={{ color: '#FFD700' }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#FFD700' }}>Criador</span>
          </div>
          <h3 className="font-bold text-base mb-1 relative z-10 text-white">Painel Admin</h3>
          <p className="text-gray-500 text-xs relative z-10">Gerencie usuários, profissionais e assinaturas.</p>
        </div>
      ) : userRole === 'pro' ? (
        <div
          onClick={() => onTabChange('pro_dashboard')}
          className="mt-8 p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-3xl relative overflow-hidden group border border-green-500/20 cursor-pointer hover:border-green-500/40 transition-all"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
          <h3 className="font-bold text-lg mb-2 relative z-10 text-white">Painel Pro</h3>
          <p className="text-gray-400 text-xs mb-4 relative z-10">Você está online e visível para clientes.</p>
          <button
            onClick={(e) => { e.stopPropagation(); onTabChange('pro_dashboard'); }}
            className="w-full py-3 bg-green-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-green-500/20 active:scale-95"
          >
            Ver Ganhos
          </button>
        </div>
      ) : (
        <div className="mt-8 p-6 bg-gradient-to-br from-gray-800 to-[#121826] rounded-3xl relative overflow-hidden group border border-white/5">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-500" />
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center text-green-500">
              <Flashlight size={16} />
            </div>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Plano Pro</span>
          </div>
          <h3 className="font-bold text-lg mb-2 relative z-10 text-white">Seja um prestador!</h3>
          <p className="text-gray-400 text-xs mb-4 relative z-10">Destaque-se no ranking e conquiste 5x mais clientes.</p>
          <button onClick={onBecomePro} className="w-full py-3 bg-white text-[#070b13] hover:bg-gray-100 font-bold rounded-xl text-sm transition-all shadow-lg">
            Assinar Plano
          </button>
        </div>
      )}
    </aside>
  );
}
