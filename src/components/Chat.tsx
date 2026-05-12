import React, { useState, useEffect, useRef } from 'react';
import { 
  db, auth, 
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where,
  doc, getDoc, setDoc, OperationType, handleFirestoreError, debugDuplicateKeys
} from '../lib/firebase';
import { Message } from '../types';
import { Send, User } from 'lucide-react';

export function ChatRoom({ chatId, recipientName }: { chatId: string, recipientName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `chats/${chatId}/messages`);
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    try {
      const msgPath = `chats/${chatId}/messages`;
      await addDoc(collection(db, msgPath), {
        chatId,
        senderId: auth.currentUser.uid,
        content: newMessage,
        timestamp: serverTimestamp(),
        read: false
      });

      // Send notification to the recipient
      // We derive recipientId from chatId (currentUserUid_otherUserUid)
      const participants = chatId.split('_');
      const recipientId = participants.find(id => id !== auth.currentUser?.uid);

      if (recipientId) {
        const notifPath = 'notifications';
        await addDoc(collection(db, notifPath), {
          userId: recipientId,
          title: 'Nova Mensagem',
          type: 'message',
          message: newMessage.substring(0, 50) + (newMessage.length > 50 ? '...' : ''),
          time: new Date().toISOString(),
          read: false,
          createdAt: serverTimestamp(),
          senderId: auth.currentUser.uid
        });
      }

      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chats/${chatId}/messages`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#070b13] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-[#121826] border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white">{recipientName}</h3>
          <p className="text-green-500 text-[10px] font-bold uppercase tracking-wider">Online agora</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar">
        {(() => {
          const uniqueMsgs = Array.from(new Map(messages.map(msg => [msg.id, msg])).values()) as Message[];
          debugDuplicateKeys(uniqueMsgs, (msg) => msg.id, "Mensagens do Chat");
          return uniqueMsgs.map((msg) => {
            const isMe = msg.senderId === auth.currentUser?.uid;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-[#1e293b] text-gray-200 rounded-tl-none'}`}>
                  <p>{msg.content}</p>
                  <p className={`text-[9px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          });
        })()}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-[#121826] border-t border-white/5 flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..." 
          className="flex-grow bg-[#070b13] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors text-white"
        />
        <button type="submit" className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-500/90 transition-colors shadow-lg shadow-orange-500/20">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
