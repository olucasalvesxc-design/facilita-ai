import React, { useState, useEffect } from 'react';
import { 
  db, auth,
  collection, query, where, onSnapshot, orderBy, debugDuplicateKeys 
} from '../lib/firebase';
import { Chat, Professional } from '../types';
import { MessageSquare, User, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function ChatList({ onSelectChat, notifications = [] }: { onSelectChat: (chatId: string, name: string) => void, notifications?: any[] }) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Show professionals as potential chat partners
    const q = query(collection(db, 'professionals'));
    const unsub = onSnapshot(q, (snapshot) => {
      const filtered = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Professional))
        .filter(pro => !pro.id.startsWith('pro') && pro.name?.toLowerCase() !== 'lucas alves');
      setProfessionals(filtered);
    });

    return () => unsub();
  }, []);

  const getUnreadCount = (proUserId: string) => {
    return notifications.filter(n => n.senderId === proUserId && !n.read).length;
  };

  return (
    <div className="flex flex-col h-full bg-[#121826] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-white/5">
        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Conversas</h3>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1 text-orange-500/80">Mensagens em tempo real</p>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar p-2">
        {(() => {
          const uniquePros = Array.from(new Map(professionals.map(pro => [pro.id, pro])).values()) as Professional[];
          debugDuplicateKeys(uniquePros, (pro) => pro.id, "Lista de Chats");
          return uniquePros.map((pro, index) => {
            const unreadCount = getUnreadCount(pro.userId);
            return (
              <motion.div 
                key={pro.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectChat(`${auth.currentUser?.uid}_${pro.userId}`, pro.name)}
                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer hover:bg-white/5 transition-all group relative ${unreadCount > 0 ? 'bg-orange-500/5' : ''}`}
              >
                <div className="relative">
                  <img src={pro.photoURL || undefined} alt={pro.name} className={`w-12 h-12 rounded-2xl object-cover border-2 transition-all ${unreadCount > 0 ? 'border-orange-500 shadow-lg shadow-orange-500/20 scale-110' : 'border-white/10'}`} referrerPolicy="no-referrer" />
                  {pro.status === 'online' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#121826] shadow-lg shadow-green-500/40" />
                  )}
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`font-bold transition-all truncate ${unreadCount > 0 ? 'text-white text-base' : 'text-gray-300 text-sm group-hover:text-white'}`}>{pro.name}</h4>
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Budget Pro</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${unreadCount > 0 ? 'text-orange-500 font-bold' : 'text-gray-500 group-hover:text-gray-400'}`}>
                      {unreadCount > 0 ? 'Nova mensagem pendente...' : 'Consultar disponibilidade'}
                    </p>
                    {unreadCount > 0 && (
                      <div className="bg-orange-500 text-white min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-black px-1.5 shadow-lg shadow-orange-500/40 animate-bounce">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight size={18} className={`transition-all ${unreadCount > 0 ? 'text-orange-500 translate-x-1' : 'text-gray-800 group-hover:text-orange-500'}`} />
              </motion.div>
            );
          });
        })()}

        {professionals.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <MessageSquare size={48} className="text-gray-800 mb-4" />
            <p className="text-gray-500">Nenhuma conversa iniciada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
