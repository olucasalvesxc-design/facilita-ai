import React, { useState, useEffect, useRef } from 'react';
import {
  db, auth,
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp,
  doc, updateDoc, increment, OperationType, handleFirestoreError, getDoc
} from '../lib/firebase';
import { sendPushNotification } from '../lib/pushNotifications';
import { Message } from '../types';
import { Send, User, CheckCheck, DollarSign, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ChatRoom({
  chatId,
  recipientName,
  recipientId,
  userRole,
}: {
  chatId: string;
  recipientName: string;
  recipientId?: string;
  userRole?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposal, setProposal] = useState({ value: '', deadline: '', description: '' });
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isPro = userRole === 'pro' || userRole === 'admin';

  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `chats/${chatId}/messages`);
    });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!chatId || !auth.currentUser) return;
    updateDoc(doc(db, 'chats', chatId), {
      [`unreadCounts.${auth.currentUser.uid}`]: 0,
    }).catch(() => {});
  }, [chatId]);

  const getActualRecipientId = () => {
    if (recipientId) return recipientId;
    const parts = chatId.split('_');
    return parts.length === 2 ? parts.find(id => id !== auth.currentUser?.uid) : null;
  };

  const notifyRecipient = async (text: string, actualRecipientId: string) => {
    await addDoc(collection(db, 'notifications'), {
      userId: actualRecipientId,
      title: 'Nova Mensagem',
      type: 'message',
      message: text.length > 50 ? text.slice(0, 50) + '...' : text,
      time: new Date().toISOString(),
      read: false,
      createdAt: serverTimestamp(),
      senderId: auth.currentUser!.uid,
      senderName: auth.currentUser!.displayName || recipientName || 'Usuário',
      chatId,
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser || sending) return;

    setSending(true);
    setSendError(false);
    const text = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        chatId,
        senderId: auth.currentUser.uid,
        content: text,
        type: 'text',
        timestamp: serverTimestamp(),
        read: false,
      });

      const actualRecipientId = getActualRecipientId();
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text.length > 60 ? text.slice(0, 60) + '...' : text,
        lastTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(actualRecipientId ? { [`unreadCounts.${actualRecipientId}`]: increment(1) } : {}),
      });

      if (actualRecipientId) {
        await notifyRecipient(text, actualRecipientId);
        sendPushNotification({
          recipientId: actualRecipientId,
          title: auth.currentUser!.displayName || 'Mensagem',
          body: text.length > 60 ? text.slice(0, 60) + '...' : text,
          data: { chatId, type: 'message' },
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chats/${chatId}/messages`);
      setNewMessage(text);
      setSendError(true);
    } finally {
      setSending(false);
    }
  };

  const handleSendProposal = async () => {
    if (!proposal.value || !proposal.deadline || !auth.currentUser || sending) return;
    setSending(true);
    setSendError(false);

    try {
      const previewText = `💰 Proposta: R$ ${proposal.value} · ${proposal.deadline}`;
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        chatId,
        senderId: auth.currentUser.uid,
        content: previewText,
        type: 'budget_proposal',
        proposal: {
          value: parseFloat(proposal.value),
          deadline: proposal.deadline,
          description: proposal.description,
          status: 'pending',
        },
        timestamp: serverTimestamp(),
        read: false,
      });

      const actualRecipientId = getActualRecipientId();
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: previewText,
        lastTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(actualRecipientId ? { [`unreadCounts.${actualRecipientId}`]: increment(1) } : {}),
      });

      if (actualRecipientId) {
        await notifyRecipient('📋 Você recebeu uma proposta de orçamento!', actualRecipientId);
        sendPushNotification({
          recipientId: actualRecipientId,
          title: '💰 Nova Proposta de Orçamento',
          body: `R$ ${proposal.value} · ${proposal.deadline}`,
          data: { chatId, type: 'proposal' },
        });
      }

      setProposal({ value: '', deadline: '', description: '' });
      setShowProposalForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chats/${chatId}/messages`);
      setSendError(true);
    } finally {
      setSending(false);
    }
  };

  const handleAcceptProposal = async (msg: Message) => {
    if (!auth.currentUser || !msg.proposal || acceptingId) return;
    setAcceptingId(msg.id);

    try {
      // Get chat participants to find the pro
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      const chatData = chatDoc.data();
      const proId = msg.senderId;
      const clientId = auth.currentUser.uid;

      // Create order
      const orderRef = await addDoc(collection(db, 'orders'), {
        clientId,
        clientName: auth.currentUser.displayName || 'Cliente',
        professionalId: proId,
        professionalName: recipientName,
        serviceTitle: msg.proposal.description || 'Serviço via chat',
        price: msg.proposal.value,
        deadline: msg.proposal.deadline,
        status: 'confirmed',
        type: 'chat_proposal',
        chatId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update message proposal status
      await updateDoc(doc(db, 'chats', chatId, 'messages', msg.id), {
        'proposal.status': 'accepted',
        'proposal.orderId': orderRef.id,
      });

      // Notify pro
      await addDoc(collection(db, 'notifications'), {
        userId: proId,
        title: '✅ Proposta Aceita!',
        type: 'proposal_accepted',
        message: `${auth.currentUser.displayName || 'Cliente'} aceitou sua proposta de R$ ${msg.proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
        time: new Date().toISOString(),
        read: false,
        createdAt: serverTimestamp(),
        senderId: clientId,
        chatId,
      });

      // Confirmation message in chat
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        chatId,
        senderId: clientId,
        content: `✅ Proposta aceita! Serviço confirmado por R$ ${msg.proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
        type: 'text',
        timestamp: serverTimestamp(),
        read: false,
      });

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: '✅ Proposta aceita!',
        lastTimestamp: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'orders');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectProposal = async (msg: Message) => {
    if (!auth.currentUser || !msg.proposal) return;
    try {
      await updateDoc(doc(db, 'chats', chatId, 'messages', msg.id), {
        'proposal.status': 'rejected',
      });
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        chatId,
        senderId: auth.currentUser.uid,
        content: '❌ Proposta recusada.',
        type: 'text',
        timestamp: serverTimestamp(),
        read: false,
      });
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: '❌ Proposta recusada.',
        lastTimestamp: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chats/${chatId}/messages`);
    }
  };

  const uniqueMsgs = Array.from(new Map(messages.map(m => [m.id, m])).values()) as Message[];

  return (
    <div className="flex flex-col h-full bg-[#0d121f] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-4 bg-[#121826] border-b border-white/5 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
          <User size={18} className="text-white" />
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="font-black text-white text-sm truncate uppercase tracking-tight">{recipientName}</h3>
          <p className="text-green-400 text-[9px] font-bold uppercase tracking-widest">Online agora</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3 no-scrollbar">
        {uniqueMsgs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-14 h-14 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
              <Send size={22} className="text-gray-700" />
            </div>
            <p className="text-gray-600 font-bold text-sm">Nenhuma mensagem ainda.</p>
            <p className="text-gray-700 text-xs mt-1">Diga olá para começar!</p>
          </div>
        )}
        {uniqueMsgs.map((msg) => {
          const isMe = msg.senderId === auth.currentUser?.uid;
          const time = msg.timestamp?.toDate?.()
            ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(msg.timestamp.toDate())
            : '';

          if (msg.type === 'budget_proposal' && msg.proposal) {
            const p = msg.proposal;
            const isPending = p.status === 'pending';
            const isAccepted = p.status === 'accepted';
            const isRejected = p.status === 'rejected';
            const canRespond = !isMe && isPending;

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl overflow-hidden border ${
                  isAccepted ? 'border-green-500/30 bg-green-500/5' :
                  isRejected ? 'border-white/5 bg-white/3 opacity-60' :
                  'border-orange-500/20 bg-[#1a1f2e]'
                }`}>
                  {/* Proposal header */}
                  <div className={`px-4 pt-3 pb-2 flex items-center gap-2 border-b ${
                    isAccepted ? 'border-green-500/20' : isRejected ? 'border-white/5' : 'border-orange-500/10'
                  }`}>
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      isAccepted ? 'bg-green-500/20 text-green-400' :
                      isRejected ? 'bg-white/5 text-gray-500' :
                      'bg-orange-500/15 text-orange-400'
                    }`}>
                      {isAccepted ? <CheckCircle2 size={14} /> : isRejected ? <XCircle size={14} /> : <DollarSign size={14} />}
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                        {isAccepted ? 'Proposta Aceita' : isRejected ? 'Proposta Recusada' : 'Proposta de Orçamento'}
                      </p>
                      <p className="text-[9px] text-gray-600">{isMe ? 'Você enviou' : recipientName + ' enviou'}</p>
                    </div>
                  </div>

                  {/* Proposal body */}
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-gray-500 text-xs">R$</span>
                      <span className={`text-2xl font-black ${isAccepted ? 'text-green-400' : isRejected ? 'text-gray-500' : 'text-white'}`}>
                        {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock size={11} />
                      <span className="text-xs">{p.deadline}</span>
                    </div>
                    {p.description && (
                      <p className="text-gray-400 text-xs leading-relaxed">{p.description}</p>
                    )}
                  </div>

                  {/* Action buttons — only for recipient when pending */}
                  {canRespond && (
                    <div className="px-4 pb-4 flex gap-2">
                      <button
                        onClick={() => handleAcceptProposal(msg)}
                        disabled={acceptingId === msg.id}
                        className="flex-1 bg-green-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                      >
                        {acceptingId === msg.id ? (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleRejectProposal(msg)}
                        className="flex-1 bg-white/5 border border-white/10 text-gray-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <XCircle size={13} />
                        Recusar
                      </button>
                    </div>
                  )}

                  {isAccepted && p.orderId && (
                    <div className="px-4 pb-3">
                      <p className="text-green-400 text-[10px] font-bold text-center">
                        ✅ Serviço criado · Acompanhe em "Serviços"
                      </p>
                    </div>
                  )}

                  <div className="px-4 pb-2 flex justify-end">
                    <p className="text-[9px] text-gray-700">{time}</p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-sm shadow-lg shadow-orange-500/15'
                    : 'bg-[#1e293b] text-gray-100 rounded-tl-sm border border-white/5'
                }`}
              >
                <p className="break-words">{msg.content}</p>
                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <p className="text-[9px] opacity-60">{time}</p>
                  {isMe && <CheckCheck size={10} className="opacity-60" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Budget proposal form (pro only) */}
      <AnimatePresence>
        {showProposalForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-3 pb-2 bg-[#0d1520] border-t border-orange-500/10 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Proposta de Orçamento</p>
                <button onClick={() => setShowProposalForm(false)} className="text-gray-600 hover:text-gray-400 transition-colors">
                  <ChevronDown size={14} />
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 ml-1">Valor (R$)</label>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={proposal.value}
                    onChange={e => setProposal(p => ({ ...p, value: e.target.value }))}
                    className="w-full mt-1 bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-700 outline-none focus:border-orange-500/40 transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 ml-1">Prazo</label>
                  <input
                    type="text"
                    placeholder="Ex: 3 dias"
                    value={proposal.deadline}
                    onChange={e => setProposal(p => ({ ...p, deadline: e.target.value }))}
                    className="w-full mt-1 bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-700 outline-none focus:border-orange-500/40 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 ml-1">Descrição do serviço</label>
                <input
                  type="text"
                  placeholder="O que está incluído na proposta..."
                  value={proposal.description}
                  onChange={e => setProposal(p => ({ ...p, description: e.target.value }))}
                  className="w-full mt-1 bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-700 outline-none focus:border-orange-500/40 transition-colors"
                />
              </div>
              <button
                onClick={handleSendProposal}
                disabled={!proposal.value || !proposal.deadline || sending}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
              >
                <Send size={13} />
                Enviar Proposta
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSend} className="px-4 pb-4 pt-3 bg-[#121826] border-t border-white/5 flex flex-col gap-2 shrink-0">
        {sendError && (
          <p className="text-red-400 text-[10px] font-bold text-center">Falha ao enviar. Verifique sua conexão.</p>
        )}
        <div className="flex gap-2">
          {/* Pro: toggle proposal button */}
          {isPro && (
            <button
              type="button"
              onClick={() => setShowProposalForm(v => !v)}
              title="Propor orçamento"
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                showProposalForm
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-white/5 border border-white/5 text-gray-500 hover:text-orange-400 hover:border-orange-500/20'
              }`}
            >
              {showProposalForm ? <ChevronDown size={18} /> : <DollarSign size={18} />}
            </button>
          )}
          <input
            type="text"
            value={newMessage}
            onChange={e => { setNewMessage(e.target.value); setSendError(false); }}
            placeholder="Digite uma mensagem..."
            disabled={sending}
            className="flex-grow bg-[#070b13] border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/40 transition-colors text-white placeholder:text-gray-700 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
