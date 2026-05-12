import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Users, ArrowRight, Check, X, CalendarCheck, 
  ListOrdered, Info, AlertCircle, MapPin, ChevronRight, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, collection, query, where, onSnapshot, orderBy, 
  addDoc, serverTimestamp, getDocs, limit, doc, updateDoc,
  handleFirestoreError, OperationType, debugDuplicateKeys
} from '../lib/firebase';
import { Professional, Appointment, QueueEntry, UserProfile } from '../types';

interface BookingSystemProps {
  pro: Professional;
  user: UserProfile;
  onClose: () => void;
}

export function BookingSystem({ pro, user, onClose }: BookingSystemProps) {
  const [mode, setMode] = useState<'appointment' | 'queue' | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingQueueEntry, setExistingQueueEntry] = useState<QueueEntry | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [queueTotal, setQueueTotal] = useState(0);

  // Listen for existing queue entry
  useEffect(() => {
    if (!user?.id || !pro?.id) return;
    
    const q = query(
      collection(db, 'professionals', pro.id, 'queue'),
      where('clientId', '==', user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as QueueEntry))
        .filter(e => e.status !== 'completed' && e.status !== 'cancelled');
      
      if (entries.length > 0) {
        setExistingQueueEntry(entries[0]);
      } else {
        setExistingQueueEntry(null);
      }
    });

    return unsubscribe;
  }, [user.id, pro.id]);

  // Listen for queue position
  useEffect(() => {
    if (!pro?.id) return;

    const q = query(
      collection(db, 'professionals', pro.id, 'queue'),
      where('status', 'in', ['waiting', 'called', 'in_service']),
      orderBy('position', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setQueueTotal(snapshot.size);
      if (existingQueueEntry) {
        const idx = snapshot.docs.findIndex(doc => doc.id === existingQueueEntry.id);
        setQueuePosition(idx !== -1 ? idx + 1 : null);
      }
    });

    return unsubscribe;
  }, [pro.id, existingQueueEntry]);

  const handleBooking = async () => {
    if (!selectedTime) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        proId: pro.id,
        clientId: user.id,
        clientName: user.name,
        clientPhoto: user.photoURL,
        serviceTitle: pro.category,
        date: new Date(selectedDate),
        time: selectedTime,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setSuccess('Agendamento realizado com sucesso! Aguarde a confirmação do profissional.');
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, 'appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQueue = async () => {
    setLoading(true);
    try {
      const qSnap = await getDocs(query(collection(db, 'professionals', pro.id, 'queue'), orderBy('position', 'desc'), limit(1)));
      const lastPos = qSnap.empty ? 0 : (qSnap.docs[0].data().position || 0);
      
      await addDoc(collection(db, 'professionals', pro.id, 'queue'), {
        proId: pro.id,
        clientId: user.id,
        clientName: user.name,
        clientPhoto: user.photoURL,
        position: lastPos + 1,
        status: 'waiting',
        entryTime: serverTimestamp()
      });
      setSuccess('Você entrou na fila com sucesso!');
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, `professionals/${pro.id}/queue`);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!existingQueueEntry) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'professionals', pro.id, 'queue', existingQueueEntry.id), {
        status: 'cancelled'
      });
      setSuccess('Você saiu da fila.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `professionals/${pro.id}/queue/${existingQueueEntry.id}`);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    const start = 8; // 8 AM
    const end = 18; // 6 PM
    const duration = pro.slotDuration || 30;
    const interval = pro.appointmentInterval || 0;

    for (let hour = start; hour < end; hour++) {
      for (let min = 0; min < 60; min += (duration + interval)) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  if (success) {
    return (
      <div className="p-10 text-center space-y-6">
        <div className="w-20 h-20 bg-green-500 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-green-500/30">
          <Check size={40} />
        </div>
        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Pronto!</h3>
        <p className="text-gray-400 font-medium leading-relaxed">{success}</p>
        <button onClick={onClose} className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Fechar</button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Atendimento</h3>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
      </div>

      {!mode && !existingQueueEntry ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(pro.serviceMode === 'appointment' || pro.serviceMode === 'both') && (
            <button 
              onClick={() => setMode('appointment')}
              className="group p-8 bg-white/5 border border-white/5 rounded-[40px] flex flex-col items-center gap-4 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all text-center"
            >
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-lg shadow-orange-500/10">
                <CalendarCheck size={28} />
              </div>
              <h4 className="font-black text-white uppercase tracking-widest text-sm">Agendar Horário</h4>
              <p className="text-[10px] text-gray-500 font-medium">Escolha o melhor dia e hora para ser atendido.</p>
            </button>
          )}

          {(pro.serviceMode === 'queue' || pro.serviceMode === 'both') && (
            <button 
              onClick={() => setMode('queue')}
              className="group p-8 bg-white/5 border border-white/5 rounded-[40px] flex flex-col items-center gap-4 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-center"
            >
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-lg shadow-blue-500/10">
                <ListOrdered size={28} />
              </div>
              <h4 className="font-black text-white uppercase tracking-widest text-sm">Entrar na Fila</h4>
              <p className="text-[10px] text-gray-500 font-medium">Ordem de chegada digital. Veja seu lugar na fila.</p>
            </button>
          )}
        </div>
      ) : mode === 'appointment' ? (
        <div className="space-y-8">
           <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={() => setMode(null)} 
                className="p-2 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"
              >
                <ChevronRight className="rotate-180" size={16} />
              </button>
              <h4 className="font-black text-white uppercase tracking-widest text-xs italic">Agendamento</h4>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Escolha o Dia</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-[#121826] border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-orange-500/30 transition-all font-bold" 
              />
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Horários Disponíveis</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                 {(() => {
                   const slots = generateTimeSlots();
                   return slots.map((time, i) => (
                     <button 
                      key={`booking-slot-v16-${time}-${i}`}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedTime === time ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                     >
                       {time}
                     </button>
                   ));
                 })()}
              </div>
           </div>

           <button 
            onClick={handleBooking}
            disabled={!selectedTime || loading}
            className="w-full bg-orange-500 text-white py-5 rounded-[24px] font-black uppercase text-sm shadow-2xl shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
           >
             {loading ? 'Processando...' : 'Confirmar Reserva'} <ArrowRight size={18} />
           </button>
        </div>
      ) : mode === 'queue' || existingQueueEntry ? (
        <div className="space-y-8">
           <div className="flex items-center gap-4 mb-4">
              {!existingQueueEntry && (
                <button 
                  onClick={() => setMode(null)} 
                  className="p-2 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"
                >
                  <ChevronRight className="rotate-180" size={16} />
                </button>
              )}
              <h4 className="font-black text-white uppercase tracking-widest text-xs italic">Fila de Atendimento</h4>
           </div>

           {existingQueueEntry ? (
             <div className="space-y-8 text-center py-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-[48px] bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-500/30">
                    #{queuePosition || existingQueueEntry.position}
                  </div>
                  {existingQueueEntry.status === 'called' && (
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute -top-2 -right-2 bg-orange-500 text-white p-2 rounded-xl shadow-lg"
                    >
                      <Info size={20} />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">
                    {existingQueueEntry.status === 'called' ? 'Sua vez chegou!' : 'Você está na fila'}
                  </h4>
                  <p className="text-gray-400 text-sm max-w-xs mx-auto">
                    {existingQueueEntry.status === 'called' ? 'O profissional já está te aguardando. Dirija-se ao local agora!' : `Há ${queuePosition ? queuePosition - 1 : '?'} pessoas na sua frente.`}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 py-4">
                   <div className="flex flex-col items-center">
                      <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">Espera Estimada</span>
                      <span className="text-lg font-black text-white">{(queuePosition ? (queuePosition - 1) * 20 : 0)} min</span>
                   </div>
                   <div className="w-px h-8 bg-white/5" />
                   <div className="flex flex-col items-center">
                      <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">Status</span>
                      <span className={`text-lg font-black uppercase ${existingQueueEntry.status === 'called' ? 'text-orange-500' : 'text-blue-500'}`}>
                        {existingQueueEntry.status === 'called' ? 'Chamado' : 'Aguardando'}
                      </span>
                   </div>
                </div>

                <button 
                  onClick={handleLeaveQueue}
                  disabled={loading}
                  className="w-full bg-white/5 text-red-500 py-4 rounded-2xl font-black uppercase text-xs border border-white/5 hover:bg-red-500/10 transition-all active:scale-95"
                >
                  Sair da Fila
                </button>
             </div>
           ) : (
             <div className="space-y-8">
               <div className="bg-blue-500/5 border border-blue-500/20 p-8 rounded-[40px] text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/20">
                     <Users size={28} />
                  </div>
                  <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Entrar na Fila Agora</h4>
                  <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
                    A fila está ativa. Existem <strong>{queueTotal}</strong> pessoas aguardando.
                  </p>
               </div>

               <div className="flex items-start gap-4 p-5 bg-white/2 rounded-3xl border border-white/5">
                  <AlertCircle size={20} className="text-orange-500 shrink-0 mt-1" />
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic">
                    Ao entrar na fila, você receberá uma notificação quando estiver próximo da sua vez. Fique atento ao aplicativo.
                  </p>
               </div>

               <button 
                onClick={handleJoinQueue}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-5 rounded-[24px] font-black uppercase text-sm shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
               >
                 {loading ? 'Processando...' : 'Entrar na Fila Digital'} <Send size={18} />
               </button>
             </div>
           )}
        </div>
      ) : null}
    </div>
  );
}
