import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Users, History, Settings, Plus, X, Check, 
  User, Phone, MessageSquare, Trash2, AlertCircle, Play, Pause, Square, SkipForward,
  ChevronRight, CalendarCheck, ListOrdered, Send, Briefcase, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  db, collection, query, where, onSnapshot, orderBy,
  updateDoc, doc, addDoc, serverTimestamp, getDoc, deleteDoc,
  handleFirestoreError, OperationType, debugDuplicateKeys
} from '../lib/firebase';
import { Professional, Appointment, QueueEntry, ServiceCatalogItem } from '../types';

interface ServiceManagementProps {
  pro: Professional | null;
  onUpdatePro: (data: Partial<Professional>) => Promise<void>;
  embedded?: boolean;
}

const EMPTY_FORM = { title: '', description: '', price: '', duration: '', category: '' };

export function ServiceManagement({ pro, onUpdatePro, embedded = false }: ServiceManagementProps) {
  if (!pro) return null;
  const [activeTab, setActiveTab] = useState<'catalogo' | 'agenda' | 'fila' | 'clientes' | 'historico' | 'config'>('catalogo');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Catalog state
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>([]);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCatalogItem | null>(null);
  const [catalogForm, setCatalogForm] = useState(EMPTY_FORM);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    todayAppointments: 0,
    waitingInQueue: 0,
    completedTotal: 0
  });

  // Agenda modal state
  const [showAddAppt, setShowAddAppt] = useState(false);
  const [apptForm, setApptForm] = useState({ clientName: '', serviceTitle: '', date: '', time: '' });
  const [apptLoading, setApptLoading] = useState(false);

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
      const completed = unique.filter(a => a.status === 'completed').length;
      setStats(prev => ({ ...prev, todayAppointments: todayApps.length, completedTotal: completed }));
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

    // Listen to catalog
    const qCatalog = query(
      collection(db, 'professionals', pro.id, 'catalog'),
      orderBy('createdAt', 'desc')
    );
    const unsubCatalog = onSnapshot(qCatalog, snap => {
      setCatalog(snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceCatalogItem)));
    }, err => handleFirestoreError(err, OperationType.LIST, `professionals/${pro.id}/catalog`));

    return () => {
      unsubApp();
      unsubQueue();
      unsubCatalog();
    };
  }, [pro.id]);

  const openAddService = () => {
    setEditingService(null);
    setCatalogForm(EMPTY_FORM);
    setShowCatalogModal(true);
  };

  const openEditService = (item: ServiceCatalogItem) => {
    setEditingService(item);
    setCatalogForm({
      title: item.title,
      description: item.description || '',
      price: String(item.price),
      duration: item.duration ? String(item.duration) : '',
      category: item.category || '',
    });
    setShowCatalogModal(true);
  };

  const handleSaveService = async () => {
    if (!catalogForm.title.trim() || !catalogForm.price) return;
    setCatalogLoading(true);
    try {
      const data = {
        proId: pro.id,
        title: catalogForm.title.trim(),
        description: catalogForm.description.trim(),
        price: parseFloat(catalogForm.price),
        duration: catalogForm.duration ? parseInt(catalogForm.duration) : null,
        category: catalogForm.category.trim(),
        isActive: true,
        updatedAt: serverTimestamp(),
      };
      if (editingService) {
        await updateDoc(doc(db, 'professionals', pro.id, 'catalog', editingService.id), data);
      } else {
        await addDoc(collection(db, 'professionals', pro.id, 'catalog'), { ...data, createdAt: serverTimestamp() });
      }
      setShowCatalogModal(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'catalog');
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'professionals', pro.id, 'catalog', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `catalog/${id}`);
    }
  };

  const handleToggleService = async (item: ServiceCatalogItem) => {
    try {
      await updateDoc(doc(db, 'professionals', pro.id, 'catalog', item.id), { isActive: !item.isActive });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `catalog/${item.id}`);
    }
  };

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
        const entry = queue.find(q => q.id === entryId);
        await updateDoc(entryRef, { status: 'called', calledAt: serverTimestamp() });
        if (entry?.clientId && entry.clientId !== 'manual') {
          fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientId: entry.clientId,
              title: 'Sua vez chegou! 🎉',
              body: `${pro.name} está te chamando agora. Dirija-se ao atendimento.`,
            }),
          }).catch(() => {});
        }
      } else if (action === 'start') {
        await updateDoc(entryRef, { status: 'in_service' });
      } else if (action === 'complete') {
        await updateDoc(entryRef, { status: 'completed' });
      } else if (action === 'cancel') {
        await updateDoc(entryRef, { status: 'cancelled' });
      } else if (action === 'skip') {
        const entry = queue.find(q => q.id === entryId);
        if (!entry) return;
        // Move skipped entry to end of active queue
        const activeWaiting = queue.filter(q => (q.status === 'waiting' || q.status === 'called') && q.id !== entryId);
        const maxPosition = activeWaiting.length > 0 ? Math.max(...activeWaiting.map(q => q.position)) : entry.position;
        await updateDoc(entryRef, { position: maxPosition + 1, status: 'waiting' });
        // Compact positions of those before
        const toShift = activeWaiting.filter(q => q.position > entry.position);
        await Promise.all(toShift.map(q =>
          updateDoc(doc(db, 'professionals', pro.id, 'queue', q.id), { position: q.position - 1 })
        ));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `professionals/${pro.id}/queue/${entryId}`);
    }
  };

  const toggleQueue = async () => {
    await onUpdatePro({ isQueueActive: !pro.isQueueActive });
  };

  const handleAddAppointment = async () => {
    if (!apptForm.clientName.trim() || !apptForm.serviceTitle.trim() || !apptForm.date || !apptForm.time) return;
    setApptLoading(true);
    try {
      const { Timestamp } = await import('../lib/firebase');
      const [year, month, day] = apptForm.date.split('-').map(Number);
      await addDoc(collection(db, 'appointments'), {
        proId: pro.id,
        clientId: 'manual',
        clientName: apptForm.clientName.trim(),
        serviceTitle: apptForm.serviceTitle.trim(),
        date: Timestamp.fromDate(new Date(year, month - 1, day)),
        time: apptForm.time,
        status: 'confirmed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setApptForm({ clientName: '', serviceTitle: '', date: '', time: '' });
      setShowAddAppt(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'appointments');
    } finally {
      setApptLoading(false);
    }
  };

  const renderCatalogo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-white uppercase italic tracking-tighter text-xl">Meus Serviços</h3>
          <p className="text-gray-600 text-[10px] uppercase font-bold tracking-widest mt-1">{catalog.length} serviço{catalog.length !== 1 ? 's' : ''} cadastrado{catalog.length !== 1 ? 's' : ''}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openAddService}
          className="flex items-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={3} />
          Novo Serviço
        </motion.button>
      </div>

      {catalog.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-dashed border-white/10 rounded-[32px] p-16 text-center flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 bg-orange-500/10 rounded-3xl flex items-center justify-center">
            <Briefcase size={28} className="text-orange-500" />
          </div>
          <div>
            <p className="text-white font-black uppercase text-sm tracking-tight">Nenhum serviço cadastrado</p>
            <p className="text-gray-600 text-[10px] uppercase font-bold tracking-widest mt-1">Adicione os serviços que você oferece</p>
          </div>
          <button
            onClick={openAddService}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
          >
            <Plus size={14} /> Cadastrar Primeiro Serviço
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {catalog.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-white/5 border rounded-3xl p-5 flex items-center justify-between gap-4 transition-all ${item.isActive ? 'border-white/5 hover:border-orange-500/20' : 'border-white/5 opacity-50'}`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Briefcase size={20} className="text-orange-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-white text-sm uppercase tracking-tight leading-none truncate">{item.title}</h4>
                    {!item.isActive && <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">Inativo</span>}
                  </div>
                  {item.description && <p className="text-gray-500 text-[10px] mt-0.5 truncate">{item.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-orange-500 font-black text-sm">R$ {item.price.toFixed(2).replace('.', ',')}</span>
                    {item.duration && (
                      <span className="flex items-center gap-1 text-gray-600 text-[10px] font-bold">
                        <Clock size={10} /> {item.duration}min
                      </span>
                    )}
                    {item.category && (
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/5">{item.category}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleService(item)}
                  className={`p-2.5 rounded-xl transition-all ${item.isActive ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white' : 'bg-white/5 text-gray-600 hover:bg-white/10'}`}
                  title={item.isActive ? 'Desativar' : 'Ativar'}
                >
                  {item.isActive ? <Check size={14} /> : <Play size={14} />}
                </button>
                <button
                  onClick={() => openEditService(item)}
                  className="p-2.5 bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  title="Editar"
                >
                  <Settings size={14} />
                </button>
                <button
                  onClick={() => handleDeleteService(item.id)}
                  className="p-2.5 bg-white/5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCatalogModal = () => (
    <AnimatePresence>
      {showCatalogModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCatalogModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[201] p-0 sm:p-4"
          >
            <div className="bg-[#121826] border-t sm:border border-white/10 rounded-t-[40px] sm:rounded-[40px] w-full sm:max-w-md p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-white uppercase italic tracking-tighter text-lg">
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </h3>
                <button onClick={() => setShowCatalogModal(false)} className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white transition-all">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Nome do Serviço *</label>
                  <input
                    type="text"
                    value={catalogForm.title}
                    onChange={e => setCatalogForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Ex: Corte de Cabelo, Pintura de Parede..."
                    className="w-full bg-[#070b13] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Descrição</label>
                  <textarea
                    value={catalogForm.description}
                    onChange={e => setCatalogForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Descreva brevemente o serviço..."
                    rows={2}
                    className="w-full bg-[#070b13] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Preço (R$) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={catalogForm.price}
                      onChange={e => setCatalogForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="0,00"
                      className="w-full bg-[#070b13] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Duração (min)</label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={catalogForm.duration}
                      onChange={e => setCatalogForm(f => ({ ...f, duration: e.target.value }))}
                      placeholder="Ex: 60"
                      className="w-full bg-[#070b13] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Categoria</label>
                  <input
                    type="text"
                    value={catalogForm.category}
                    onChange={e => setCatalogForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="Ex: Cabelo, Elétrica, Pintura..."
                    className="w-full bg-[#070b13] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCatalogModal(false)}
                  className="flex-1 py-3.5 bg-white/5 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveService}
                  disabled={catalogLoading || !catalogForm.title.trim() || !catalogForm.price}
                  className="flex-1 py-3.5 bg-orange-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {catalogLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={14} strokeWidth={3} />}
                  {editingService ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const renderAgenda = () => (
    <div className="space-y-6">
      <AnimatePresence>
        {showAddAppt && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm" onClick={() => setShowAddAppt(false)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[201] p-0 sm:p-4">
              <div className="bg-[#121826] border-t sm:border border-white/10 rounded-t-[40px] sm:rounded-[40px] w-full sm:max-w-md p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-white uppercase italic tracking-tighter text-lg">Novo Agendamento</h3>
                  <button onClick={() => setShowAddAppt(false)} className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white transition-all"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Nome do Cliente *</label>
                    <input type="text" value={apptForm.clientName} onChange={e => setApptForm(f => ({ ...f, clientName: e.target.value }))}
                      placeholder="Ex: João Silva" className="w-full bg-[#070b13] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Serviço *</label>
                    <input type="text" value={apptForm.serviceTitle} onChange={e => setApptForm(f => ({ ...f, serviceTitle: e.target.value }))}
                      placeholder="Ex: Corte de Cabelo" className="w-full bg-[#070b13] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Data *</label>
                      <input type="date" value={apptForm.date} onChange={e => setApptForm(f => ({ ...f, date: e.target.value }))}
                        className="w-full bg-[#070b13] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Hora *</label>
                      <input type="time" value={apptForm.time} onChange={e => setApptForm(f => ({ ...f, time: e.target.value }))}
                        className="w-full bg-[#070b13] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowAddAppt(false)} className="flex-1 py-3.5 bg-white/5 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Cancelar</button>
                  <button onClick={handleAddAppointment} disabled={apptLoading || !apptForm.clientName || !apptForm.serviceTitle || !apptForm.date || !apptForm.time}
                    className="flex-1 py-3.5 bg-orange-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {apptLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={14} strokeWidth={3} />}
                    Agendar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h3 className="font-black text-white uppercase italic tracking-tighter text-xl">Próximos Agendamentos</h3>
        <button onClick={() => setShowAddAppt(true)} className="bg-orange-500/10 text-orange-500 p-2 rounded-xl border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all">
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
          <span className="text-3xl font-black text-white">
            {(() => {
              const waitingCount = queue.filter(q => q.status === 'waiting' || q.status === 'called').length;
              const totalMin = waitingCount * (pro.slotDuration || 30);
              if (totalMin === 0) return '0m';
              if (totalMin < 60) return `${totalMin}m`;
              const h = Math.floor(totalMin / 60);
              const m = totalMin % 60;
              return m > 0 ? `${h}h ${m}m` : `${h}h`;
            })()}
          </span>
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

  if (embedded) {
    return (
      <div className="space-y-4">
        {renderCatalogModal()}
        {renderCatalogo()}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {renderCatalogModal()}
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
           <div className="text-2xl font-black text-white">{stats.completedTotal}</div>
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
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
          {[
            { id: 'catalogo', label: 'Catálogo', icon: Briefcase },
            { id: 'agenda', label: 'Agenda', icon: Calendar },
            { id: 'fila', label: 'Fila Digital', icon: ListOrdered },
            { id: 'clientes', label: 'Clientes', icon: Users },
            { id: 'historico', label: 'Histórico', icon: History },
            { id: 'config', label: 'Ajustes', icon: Settings }
          ].map((tab, index) => (
            <button
              key={`mgmt-tab-btn-v16-${tab.id}-${index}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
          <div className="shrink-0 w-2" />
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
          {activeTab === 'catalogo' && renderCatalogo()}
          {activeTab === 'agenda' && renderAgenda()}
          {activeTab === 'fila' && renderFila()}
          {activeTab === 'config' && renderSettings()}
          {activeTab === 'clientes' && (() => {
            const clientMap = new Map<string, { name: string; services: string[]; lastDate: Date | null; count: number }>();
            appointments.forEach(a => {
              const key = a.clientId || a.clientName;
              const existing = clientMap.get(key);
              const date = a.date?.toDate ? a.date.toDate() : null;
              if (existing) {
                existing.count++;
                if (!existing.services.includes(a.serviceTitle)) existing.services.push(a.serviceTitle);
                if (date && (!existing.lastDate || date > existing.lastDate)) existing.lastDate = date;
              } else {
                clientMap.set(key, { name: a.clientName, services: [a.serviceTitle], lastDate: date, count: 1 });
              }
            });
            const clients = Array.from(clientMap.values()).sort((a, b) => b.count - a.count);
            if (clients.length === 0) return (
              <div className="bg-white/2 border border-white/5 rounded-3xl p-20 text-center">
                <Users size={40} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Nenhum cliente ainda</p>
              </div>
            );
            return (
              <div className="space-y-4">
                <h3 className="font-black text-white uppercase italic tracking-tighter text-xl">{clients.length} cliente{clients.length !== 1 ? 's' : ''}</h3>
                {clients.map((c, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-5 flex items-center gap-4 hover:border-orange-500/20 transition-all">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center shrink-0">
                      <User size={20} className="text-orange-500" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-white leading-none mb-1 truncate">{c.name}</h4>
                      <p className="text-[10px] text-gray-500 truncate">{c.services.slice(0, 2).join(', ')}{c.services.length > 2 ? ` +${c.services.length - 2}` : ''}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-orange-500 font-black text-lg">{c.count}</div>
                      <div className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">{c.count === 1 ? 'visita' : 'visitas'}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
          {activeTab === 'historico' && (() => {
            const completed = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled').slice(0, 50);
            if (completed.length === 0) return (
              <div className="bg-white/2 border border-white/5 rounded-3xl p-20 text-center">
                <History size={40} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Nenhum histórico ainda</p>
              </div>
            );
            return (
              <div className="space-y-4">
                <h3 className="font-black text-white uppercase italic tracking-tighter text-xl">Histórico</h3>
                {completed.map((a, i) => {
                  const date = a.date?.toDate ? a.date.toDate() : null;
                  return (
                    <div key={a.id || i} className="bg-white/5 border border-white/5 rounded-3xl p-5 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${a.status === 'completed' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        {a.status === 'completed' ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500" />}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-white leading-none mb-1 truncate">{a.clientName}</h4>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest truncate">{a.serviceTitle}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {date && <div className="text-[10px] text-gray-500 font-bold">{date.toLocaleDateString('pt-BR')}</div>}
                        <div className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${a.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>
                          {a.status === 'completed' ? 'Concluído' : 'Cancelado'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
