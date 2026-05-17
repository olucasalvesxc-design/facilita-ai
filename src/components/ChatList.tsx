import React, { useState, useEffect } from 'react';
import {
  db, auth,
  collection, query, where, onSnapshot, orderBy
} from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { MessageSquare, ChevronRight, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatEntry {
  id: string;
  participants: string[];
  participantNames?: Record<string, string>;
  participantPhotos?: Record<string, string>;
  lastMessage?: string;
  lastTimestamp?: any;
  unreadCounts?: Record<string, number>;
}

export function ChatList({
  onSelectChat
}: {
  onSelectChat: (chatId: string, name: string, recipientId: string) => void;
}) {
  const [chats, setChats] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let chatUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, (user) => {
      if (chatUnsub) { chatUnsub(); chatUnsub = null; }
      if (!user) { setLoading(false); return; }

      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid)
      );

      chatUnsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatEntry));
        items.sort((a, b) => {
          const ta = a.lastTimestamp?.toMillis?.() ?? 0;
          const tb = b.lastTimestamp?.toMillis?.() ?? 0;
          return tb - ta;
        });
        setChats(items);
        setLoading(false);
      }, (err) => {
        console.error('ChatList error:', err);
        setLoading(false);
      });
    });

    return () => { authUnsub(); if (chatUnsub) chatUnsub(); };
  }, []);

  const uid = auth.currentUser?.uid || '';

  const filtered = chats.filter(chat => {
    if (!search.trim()) return true;
    const recipientId = chat.participants.find(p => p !== uid) || '';
    const name = chat.participantNames?.[recipientId] || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCounts?.[uid] || 0), 0);

  return (
    <div className="flex flex-col h-full bg-[#0d121f] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Mensagens</h3>
            <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-orange-500/80">
              {totalUnread > 0 ? `${totalUnread} não lida${totalUnread > 1 ? 's' : ''}` : `${chats.length} conversa${chats.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {totalUnread > 0 && (
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg shadow-orange-500/40 animate-pulse">
              {totalUnread > 99 ? '99+' : totalUnread}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar conversa..."
            className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-orange-500/30 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-grow overflow-y-auto no-scrollbar p-2">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 animate-pulse shrink-0" />
              <div className="flex-grow space-y-2">
                <div className="h-3 bg-white/5 rounded animate-pulse w-2/5" />
                <div className="h-2 bg-white/5 rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
              <MessageSquare size={28} className="text-gray-700" />
            </div>
            <p className="text-gray-500 font-bold text-sm">
              {search ? 'Nenhuma conversa encontrada.' : 'Nenhuma mensagem ainda.'}
            </p>
            {!search && (
              <p className="text-gray-700 text-xs mt-1 font-bold">Toque em um profissional e clique em "Mensagem".</p>
            )}
          </div>
        ) : (
          filtered.map((chat, index) => {
            const recipientId = chat.participants.find(p => p !== uid) || '';
            const name = chat.participantNames?.[recipientId] || 'Usuário';
            const photo = chat.participantPhotos?.[recipientId] || '';
            const unread = chat.unreadCounts?.[uid] || 0;
            const lastMsg = chat.lastMessage || '';
            const lastTime = chat.lastTimestamp?.toDate?.() as Date | undefined;
            const now = new Date();
            const timeStr = lastTime
              ? lastTime.toDateString() === now.toDateString()
                ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(lastTime)
                : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(lastTime)
              : '';

            return (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => onSelectChat(chat.id, name, recipientId)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all group ${
                  unread > 0 ? 'bg-orange-500/8 hover:bg-orange-500/12' : 'hover:bg-white/5'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {photo ? (
                    <img
                      src={photo}
                      alt={name}
                      referrerPolicy="no-referrer"
                      className={`w-12 h-12 rounded-2xl object-cover border-2 transition-all ${
                        unread > 0 ? 'border-orange-500 shadow-md shadow-orange-500/20 scale-105' : 'border-white/10'
                      }`}
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black border-2 transition-all ${
                      unread > 0 ? 'bg-orange-500 border-orange-500 text-white scale-105' : 'bg-white/10 border-white/10 text-gray-400'
                    }`}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {unread > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-orange-500 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg border-2 border-[#0d121f] px-1">
                      {unread > 9 ? '9+' : unread}
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`font-bold text-sm truncate transition-all ${unread > 0 ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                      {name}
                    </span>
                    {timeStr && (
                      <span className={`text-[9px] font-bold shrink-0 ml-2 ${unread > 0 ? 'text-orange-400' : 'text-gray-600'}`}>
                        {timeStr}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate transition-all ${unread > 0 ? 'text-orange-400 font-bold' : 'text-gray-600 group-hover:text-gray-500'}`}>
                    {lastMsg || 'Toque para iniciar a conversa'}
                  </p>
                </div>

                <ChevronRight
                  size={14}
                  className={`shrink-0 transition-all ${unread > 0 ? 'text-orange-500' : 'text-gray-800 group-hover:text-orange-500'}`}
                />
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
