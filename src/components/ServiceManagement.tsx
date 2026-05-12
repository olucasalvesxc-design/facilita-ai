import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Users, History, Settings, Plus, X, Check, 
  User, Phone, MessageSquare, Trash2, AlertCircle, Play, Pause, Square, SkipForward,
  ChevronRight, CalendarCheck, ListOrdered, Send, Briefcase, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, collection, query, where, onSnapshot, orderBy, 
  updateDoc, doc, addDoc, serverTimestamp, getDoc,
  handleFirestoreError, OperationType, debugDuplicateKeys
} from '../lib/firebase';
import { Professional, Appointment, QueueEntry } from '../types';

interface ServiceManagementProps {
  pro: Professional;
  onUpdatePro: (data: Partial<Professional>) => Promise<void>;
}

export function ServiceManagement({ pro, onUpdatePro }: ServiceManagementProps) {
  const [activeTab, setActiveTab] = useState<'agenda' | 'fila' | 'clientes' | 'historico' | 'config'>('agenda');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    todayAppointments: 0,
    waitingInQueue: 0,
    completedToday: 0
  });

  useEffect(() => {
    if (!pro?.id) return;

    setLoading(true);

    // Listen to appointments
    const qApp = query(
      collection(db, 'appointments'),
      where('proId', '==', pro.id),
      orderBy('date', 'desc'),
      orderBy('time', 'asc')
    );

    const unsubApp = onSnapshot(qApp, (snapshot) => {
      const appData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      // Remove duplicates by ID
      const unique = Array.from(new Map(appData.map(a => [a.id, a])).values());
      setAppointments(unique);
      
      const today = new Date().toISOString().split('T')[0];
      const todayApps = unique.filter(a => {
          const aDate = a.date?.toDate ? a.date.toDate().toISOString().split('T')[0] : '';
          return aDate === today && a.status !== 'cancelled';
      });
      setStats(prev => ({ ...prev, todayAppointments: todayApps.length }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });

    // Listen to queue
    const qQueue = query(
      collection(db, 'professionals', pro.id, 'queue'),
      orderBy('position', 'asc')
    );

    const unsubQueue = onSnapshot(qQueue, (snapshot) => {
      const queueItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QueueEntry));
      // Remove duplicates by ID
      const unique = Array.from(new Map(queueItems.map(q => [q.id, q])).values());
      setQueue(unique);
      setStats(prev => ({ ...prev, waitingInQueue: unique.filter(q => q.status === 'waiting').length }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `professionals/${pro.id}/queue`);
      setLoading(false);
    });

    return () => {
      unsubApp();
      unsubQueue();
    };
  }, [pro.id]);

  const handleUpdateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { 
        status, 
        updatedAt: serverTimestamp() 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const handleQueueAction = async (entryId: string, action: 'call' | 'start' | 'complete' | 'cancel' | 'skip') => {
    try {
      const entryRef = doc(db, 'professionals', pro.id, 'queue', entryId);
      
      if (action === 'call') {
        await updateDoc(entryRef, { status: 'called', calledAt: serverTimestamp() });
        // In a real app, send push notification to user here
      } else if (action === 'start') {
        await updateDoc(entryRef, { status: 'in_service' });
      } else if (action === 'complete') {
        await updateDoc(entryRef, { status: 'completed' });
        // Reposition others? No, keep history.
      } else if (action === 'cancel') {
        await updateDoc(entryRef, { status: 'cancelled' });
      } else if (action === 'skip') {
        // Find next in line and swap? Or just mark as skipped/cancelled
        await updateDoc(entryRef, { status: 'cancelled' }); 
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `professionals/${pro.id}/queue/${entryId}`);
    }
  };

  const toggleQueue = async () => {
    await onUpdatePro({ isQueueActive: !pro.isQueueActive });
  };

  const renderAgenda = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-white uppercase italic tracking-tighter text-xl">Próximos Agendamentos</h3>
        <button className="bg-orange-500/10 text-orange-500 p-2 rounded-xl border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all">
          <Plus size={20} />
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white/2 border border-white/5 rounded-3xl p-12 text-center">
          <Calendar size={40} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(() => {
            const pendingApps = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
            const uniqueApps = Array.from(new Map(pendingApps.map(a => [a.id, a])).values()) as Appointment[];
            debugDuplicateKeys(uniqueApps, (a) => a.id, "Agendamentos Pro");
            return uniqueApps.map((app, index) => (
              <motion.div 
                layout
                key={app.id} 
                className="bg-white/5 border border-white/5 rounded-3xl p-5 flex items-center justify-between group hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex flex-col items-center justify-center text-orange-500 font-black">
                    <span className="text-[10px] leading-none uppercase">{app.time.split(':')[0]}</span>
                    <span className="text-sm leading-none">{app.time.split(':')[1]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white leading-none mb-1">{app.clientName}</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{app.serviceTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => handleUpdateAppointmentStatus(app.id, 'cancelled')}
                    className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                   >
                     <X size={18} />
                   </button>
                   <button 
                    onClick={() => handleUpdateAppointmentStatus(app.id, 'confirmed')}
                    disabled={app.status === 'confirmed'}
                    className={`p-3 rounded-xl transition-all ${app.status === 'confirmed' ? 'text-green-500 bg-green-500/10' : 'text-gray-500 hover:text-green-500 hover:bg-green-500/10'}`}
                   >
                     <Check size={18} />
                   </button>
                </div>
              </motion.div>
            ));
          })()}
        </div>
      )}
    </div>
  );

  const renderFila = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-white uppercase italic tracking-tighter text-xl">Fila em Tempo Real</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Status: {pro.isQueueActive ? <span className="text-green-500">Aberta</span> : <span className="text-red-500">Fechada</span>}
          </p>
        </div>
        <button 
          onClick={toggleQueue}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-95 ${pro.isQueueActive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500 text-white shadow-green-500/20'}`}
        >
          {pro.isQueueActive ? <><Pause size={14} /> Pausar Fila</> : <><Play size={14} /> Abrir Fila</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-1">Aguardando</span>
          <span className="text-3xl font-black text-orange-500">{queue.filter(q => q.status === 'waiting' || q.status === 'called').length}</span>
        </div>
        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-1">Em Atendimento</span>
          <span className="text-3xl font-black text-blue-500">{queue.filter(q => q.status === 'in_service').length}</span>
        </div>
        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-1">Média de Espera</span>
          <span className="text-3xl font-black text-white">22m</span>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="bg-white/2 border border-white/5 rounded-3xl p-12 text-center">
          <Users size={40} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Fila vazia no momento</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(() => {
            const activeQueue = queue.filter(q => q.status !== 'completed' && q.status !== 'cancelled');
            const uniqueQueue = Array.from(new Map(activeQueue.map(q => [q.id, q])).values()) as QueueEntry[];
            debugDuplicateKeys(uniqueQueue, (q) => q.id, "Fila de Espera Pro");
            return uniqueQueue.map((entry, idx) => (
              <motion.div 
                layout
                key={entry.id} 
                className={`bg-white/5 border border-white/5 rounded-3xl p-5 flex items-center justify-between group transition-all ${entry.status === 'in_service' ? 'border-blue-500/30 bg-blue-500/5' : ''} ${entry.status === 'called' ? 'border-orange-500/30 bg-orange-500/5' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${entry.status === 'in_service' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-gray-400'}`}>
                     #{entry.position}
                  </div>
                  <div>
                     <h4 className="font-bold text-white leading-none mb-1">{entry.clientName}</h4>
                     <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                          entry.status === 'waiting' ? 'bg-gray-500/10 text-gray-500' :
                          entry.status === 'called' ? 'bg-orange-500/10 text-orange-500 animate-pulse' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                           {entry.status === 'waiting' ? 'Aguardando' : entry.status === 'called' ? 'Chamado' : 'Em atendimento'}
                        </span>
                        <span className="text-[9px] text-gray-600">Chegou às {entry.entryTime?.toDate ? entry.entryTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}</span>
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {entry.status === 'waiting' && (
                    <button 
                      onClick={() => handleQueueAction(entry.id, 'call')}
                      className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-500/20 hover:scale-105 transition-all"
                    >
                      <Send size={14} /> Chamar
                    </button>
                  )}
                  {entry.status === 'called' && (
                    <button 
                      onClick={() => handleQueueAction(entry.id, 'start')}
                      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                    >
                      <Play size={14} /> Iniciar
                    </button>
                  )}
                  {entry.status === 'in_service' && (
                    <button 
                      onClick={() => handleQueueAction(entry.id, 'complete')}
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-green-500/20 hover:scale-105 transition-all"
                    >
                      <Check size={14} /> Finalizar
                    </button>
                  )}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                     <button onClick={() => handleQueueAction(entry.id, 'cancel')} className="p-2 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              </motion.div>
            ));
          })()}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <div className="bg-orange-500/5 p-8 rounded-[40px] border border-orange-500/10">
        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-6">Configurações de Atendimento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Modo de Serviço</label>
              <div className="grid grid-cols-2 gap-3">
                 {[
                   { id: 'appointment', label: 'Agenda', icon: Calendar },
                   { id: 'queue', label: 'Fila', icon: ListOrdered },
                   { id: 'both', label: 'Híbrido', icon: Briefcase },
                   { id: 'none', label: 'Desativado', icon: X }
                 ].map((mode, index) => (
                   <button 
                    key={`service-mode-btn-v16-${mode.id}-${index}`}
                    onClick={() => onUpdatePro({ serviceMode: mode.id as any })}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 ${pro.serviceMode === mode.id ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'}`}
                   >
                     <mode.icon size={20} />
                     <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tempo Médio por Atendimento (minutos)</label>
                <div className="flex items-center gap-4">
                   <input 
                    type="range" min="5" max="120" step="5" 
                    value={pro.slotDuration || 30} 
                    onChange={e => onUpdatePro({ slotDuration: parseInt(e.target.value) })}
                    className="flex-grow accent-orange-500" 
                   />
                   <span className="bg-white/10 px-4 py-2 rounded-xl text-white font-black text-sm w-16 text-center">{pro.slotDuration || 30}m</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Intervalo entre Clientes (minutos)</label>
                <div className="flex items-center gap-4">
                   <input 
                    type="range" min="0" max="30" step="5" 
                    value={pro.appointmentInterval || 0} 
                    onChange={e => onUpdatePro({ appointmentInterval: parseInt(e.target.value) })}
                    className="flex-grow accent-orange-500" 
                   />
                   <span className="bg-white/10 px-4 py-2 rounded-xl text-white font-black text-sm w-16 text-center">{pro.appointmentInterval || 0}m</span>
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white/5 p-8 rounded-[40px] border border-white/5">
        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-6">Horários de Funcionamento</h3>
        <div className="space-y-3">
          {(pro.workingHours || []).map((day, i) => (
            <div key={`working-day-entry-v16-${day.day}-${i}`} className="flex items-center justify-between p-4 bg-[#070b13] rounded-2xl hover:border-orange-500/20 border border-white/2 transition-colors">
              <div className="flex items-center gap-4">
                 <button 
                  onClick={() => {
                    const newHours = [...(pro.workingHours || [])];
                    newHours[i].active = !newHours[i].active;
                    onUpdatePro({ workingHours: newHours });
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${day.active ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-600'}`}
                 >
                   <Check size={18} />
                 </button>
                 <span className="font-bold text-white w-24">{day.day}</span>
              </div>
              <div className="flex items-center gap-3">
                 <input 
                  type="time" 
                  value={day.start} 
                  disabled={!day.active}
                  onChange={e => {
                    const newHours = [...(pro.workingHours || [])];
                    newHours[i].start = e.target.value;
                    onUpdatePro({ workingHours: newHours });
                  }}
                  className="bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500/30 disabled:opacity-30" 
                 />
                 <span className="text-gray-700">até</span>
                 <input 
                  type="time" 
                  value={day.end} 
                  disabled={!day.active}
                  onChange={e => {
                    const newHours = [...(pro.workingHours || [])];
                    newHours[i].end = e.target.value;
                    onUpdatePro({ workingHours: newHours });
                  }}
                  className="bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500/30 disabled:opacity-30" 
                 />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#121826] p-6 rounded-3xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-2 text-orange-500">
             <Calendar size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Agenda Hoje</span>
           </div>
           <div className="text-2xl font-black text-white">{stats.todayAppointments}</div>
        </div>
        <div className="bg-[#121826] p-6 rounded-3xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-2 text-blue-500">
             <Users size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Fila Espera</span>
           </div>
           <div className="text-2xl font-black text-white">{stats.waitingInQueue}</div>
        </div>
        <div className="bg-[#121826] p-6 rounded-3xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-2 text-green-500">
             <Check size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Concluídos</span>
           </div>
           <div className="text-2xl font-black text-white">12</div>
        </div>
        <div className="bg-[#121826] p-6 rounded-3xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-2 text-yellow-500">
             <Star size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Avaliação</span>
           </div>
           <div className="text-2xl font-black text-white">{pro.rating?.toFixed(1) || '5.0'}</div>
        </div>
      </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
          {[
            { id: 'agenda', label: 'Agenda', icon: Calendar },
            { id: 'fila', label: 'Fila Digital', icon: ListOrdered },
            { id: 'clientes', label: 'Clientes', icon: Users },
            { id: 'historico', label: 'Histórico', icon: History },
            { id: 'config', label: 'Ajustes', icon: Settings }
          ].map((tab, index) => (
            <button 
              key={`mgmt-tab-btn-v16-${tab.id}-${index}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}
            >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
        >
          {activeTab === 'agenda' && renderAgenda()}
          {activeTab === 'fila' && renderFila()}
          {activeTab === 'config' && renderSettings()}
          {(activeTab === 'clientes' || activeTab === 'historico') && (
            <div className="bg-white/2 border border-white/5 rounded-3xl p-20 text-center">
               <div className="w-20 h-20 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto mb-6">
                  {activeTab === 'clientes' ? <Users size={32} className="text-gray-700" /> : <History size={32} className="text-gray-700" />}
               </div>
               <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Em breve mais detalhes aqui</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
