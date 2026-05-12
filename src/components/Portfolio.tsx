import React, { useState, useEffect, useRef } from 'react';
import { 
  db, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc,
  doc,
  serverTimestamp,
  increment,
  getDoc,
  setDoc,
  OperationType,
  handleFirestoreError,
  debugDuplicateKeys
} from '../lib/firebase';
import { PortfolioItem, Comment, UserProfile } from '../types';
import { auth } from '../lib/firebase';
import { Plus, Trash2, Camera, X, Upload, Image as ImageIcon, Heart, MessageCircle, Share2, MoreVertical, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { compressImage } from '../lib/imageUtils';

interface PortfolioManagerProps {
  proId: string;
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

// Reusable component for comments
const PortfolioComments = ({ proId, itemId, showInput = true }: { proId: string, itemId: string, showInput?: boolean }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  useEffect(() => {
    const commentsRef = collection(db, 'professionals', proId, 'portfolio', itemId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
    });
    return unsub;
  }, [proId, itemId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !auth.currentUser) return;
    const commentRef = collection(db, 'professionals', proId, 'portfolio', itemId, 'comments');
    const itemRef = doc(db, 'professionals', proId, 'portfolio', itemId);
    try {
      await addDoc(commentRef, {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Usuário',
        userPhoto: auth.currentUser.photoURL,
        content: newComment,
        createdAt: serverTimestamp()
      });
      await setDoc(itemRef, { commentsCount: increment(1) }, { merge: true });
      setNewComment('');
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  return (
    <div className="space-y-3">
      {(comments || []).length > 0 && (
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
          {(() => {
            const uniqueComments = Array.from(new Map(comments.map(c => [c.id, c])).values()) as Comment[];
            debugDuplicateKeys(uniqueComments, (c) => c.id, "Comentários Portfolio Mini");
            return uniqueComments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-white/5 shrink-0 overflow-hidden">
                  {comment.userPhoto && <img src={comment.userPhoto} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-grow">
                  <p className="text-[11px] text-white">
                    <span className="font-bold mr-1">{comment.userName}</span>
                    {comment.content}
                  </p>
                  <p className="text-[9px] text-gray-600 font-bold">
                    {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString('pt-BR') : 'Agora'}
                  </p>
                </div>
              </div>
            ));
          })()}
        </div>
      )}
      {showInput && auth.currentUser && (
        <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
          <input 
            type="text" 
            placeholder="Comentar..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-grow bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[11px] text-white focus:border-orange-500 outline-none transition-all"
          />
          <button 
            type="submit"
            disabled={!newComment.trim()}
            className="text-orange-500 font-bold text-[10px] disabled:opacity-30 uppercase tracking-widest px-2"
          >
            Post
          </button>
        </form>
      )}
    </div>
  );
};

export const PortfolioManager = ({ proId, proPhoto }: { proId: string, proPhoto?: string }) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});
  const [showConfirm, setShowConfirm] = useState<{id: string, proId: string} | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!proId) return;
    const portfolioRef = collection(db, 'professionals', proId, 'portfolio');
    const q = query(portfolioRef, orderBy('createdAt', 'desc'));
    
    const unsub = onSnapshot(q, async (snap) => {
      const portfolioItems = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));
      setItems(portfolioItems);

      // Check current user's likes
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        portfolioItems.forEach(async (item) => {
          const likeRef = doc(db, 'professionals', proId, 'portfolio', item.id, 'likes', userId);
          const likeSnap = await getDoc(likeRef);
          setUserLiked(prev => ({ ...prev, [item.id]: likeSnap.exists() }));
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `professionals/${proId}/portfolio`);
    });

    return unsub;
  }, [proId]);

  const handleLike = async (itemId: string) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const likeRef = doc(db, 'professionals', proId, 'portfolio', itemId, 'likes', userId);
    const itemRef = doc(db, 'professionals', proId, 'portfolio', itemId);

    try {
      const isCurrentlyLiked = userLiked[itemId];
      // Optimistic update
      setUserLiked(prev => ({ ...prev, [itemId]: !isCurrentlyLiked }));
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, likesCount: (item.likesCount || 0) + (isCurrentlyLiked ? -1 : 1) }
          : item
      ));

      if (isCurrentlyLiked) {
        await deleteDoc(likeRef);
        await setDoc(itemRef, { likesCount: increment(-1) }, { merge: true });
      } else {
        await setDoc(likeRef, { userId, createdAt: serverTimestamp() });
        await setDoc(itemRef, { likesCount: increment(1) }, { merge: true });
      }
    } catch (error) {
      console.error('Error liking:', error);
      // Revert optimistic update on error
      // (Simplified: let onSnapshot fix it eventually)
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const compressed = await compressImage(base64, 800, 0.6);
          setPreviewUrl(compressed);
        } catch (error) {
          console.error('Error compressing image:', error);
          setPreviewUrl(base64); // Fallback
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !previewUrl) return;

    setLoading(true);
    try {
      const portfolioRef = collection(db, 'professionals', proId, 'portfolio');
      // In a real app, we would upload previewUrl (base64) to Firebase Storage
      await addDoc(portfolioRef, {
        proId,
        title: newTitle,
        description: newDesc,
        imageUrl: previewUrl,
        price: newPrice ? parseFloat(newPrice) : null,
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewTitle('');
      setNewDesc('');
      setNewPrice('');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `professionals/${proId}/portfolio`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string, itemProId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Set confirm state instead of window.confirm
    setShowConfirm({ id: itemId, proId: itemProId });
  };

  const confirmDelete = async () => {
    if (!showConfirm) return;
    const { id: itemId, proId: itemProId } = showConfirm;
    setShowConfirm(null);
    
    setIsDeletingId(itemId);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Sessão expirada.');
      
      const targetProId = itemProId || proId || currentUser.uid;
      const itemRef = doc(db, 'professionals', targetProId, 'portfolio', itemId);
      
      await deleteDoc(itemRef);
      showToast('Publicação removida com sucesso!');
    } catch (error: any) {
      console.error('[Portfolio] Error deleting:', error);
      showToast('Erro ao excluir: ' + (error.message || 'Erro desconhecido'), 'error');
      handleFirestoreError(error, OperationType.DELETE, `professionals/${proId}/portfolio/${itemId}`);
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Custom Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' ? 'bg-green-500 text-white border-green-400' : 'bg-red-500 text-white border-red-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-[#121826] border border-white/10 rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} className="text-red-500" />
              </div>
              <h4 className="text-xl font-black text-white mb-2 italic">EXCLUIR POST?</h4>
              <p className="text-gray-400 text-sm mb-8">Esta ação não pode ser desfeita. A publicação será removida permanentemente do seu feed.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowConfirm(null)}
                  className="py-4 rounded-2xl bg-white/5 text-white font-black text-xs hover:bg-white/10 transition-colors uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="py-4 rounded-2xl bg-red-500 text-white font-black text-xs shadow-lg shadow-red-500/20 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight italic">FEED DE TRABALHOS</h3>
          <p className="text-xs text-gray-500 font-medium">Gerencie suas publicações e resultados</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-full text-xs font-black shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus size={18} /> NOVA PUBLICAÇÃO
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#121826] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Criar Post</h4>
                <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Upload Area */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative ${previewUrl ? 'border-orange-500/50' : 'border-white/10 hover:border-white/20 bg-white/5'}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                  {previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <div className="bg-orange-500/10 p-4 rounded-full mb-3">
                        <Upload size={32} className="text-orange-500" />
                      </div>
                      <p className="text-sm font-bold text-white">Selecionar Foto</p>
                      <p className="text-[10px] text-gray-500 mt-1">Clique para procurar arquivos</p>
                    </>
                  )}
                </div>

                {/* Info Area */}
                <div className="flex flex-col space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Título do Job</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Reforma de Cozinha Moderna" 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-orange-500 outline-none transition-colors"
                      required
                    />
                  </div>
                  <div className="flex-grow">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Preço do Serviço (Opcional)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <input 
                        type="number" 
                        placeholder="0,00" 
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:border-orange-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Legenda / Detalhes</label>
                    <textarea 
                      placeholder="Conte um pouco sobre este trabalho..." 
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm h-full min-h-[120px] focus:border-orange-500 outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleAddItem}
                  disabled={loading || !previewUrl || !newTitle}
                  className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-12 py-4 rounded-2xl font-black text-sm shadow-xl shadow-orange-500/30 disabled:opacity-30 disabled:shadow-none hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Spinner size={14} /> : null}
                  {loading ? 'PUBLICANDO...' : 'PUBLICAR NO FEED'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {(() => {
            const uniqueItems = Array.from(new Map(items.map(item => [item.id, item])).values()) as PortfolioItem[];
            debugDuplicateKeys(uniqueItems, (item) => item.id, "Itens Portfolio Feed");
            return uniqueItems.map((item, index) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -50 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="group bg-[#121826] border border-white/5 rounded-3xl overflow-hidden shadow-xl h-fit hover:border-orange-500/20 transition-colors"
              >
            <div className="p-4 flex items-center justify-between relative z-10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 p-[1px]">
                  <div className="w-full h-full rounded-full bg-black border-2 border-black flex items-center justify-center overflow-hidden">
                    {proPhoto ? (
                      <img src={proPhoto} className="w-full h-full object-cover" alt="Profile" referrerPolicy="no-referrer" />
                    ) : (
                      <Camera size={14} className="text-white" />
                    )}
                  </div>
                </div>
                <span className="text-xs font-black text-white uppercase tracking-tight line-clamp-1 max-w-[120px]">{item.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={(e) => {
                    handleDeleteItem(item.id, item.proId, e);
                  }}
                  disabled={isDeletingId === item.id}
                  className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all disabled:opacity-50 cursor-pointer pointer-events-auto border border-red-500/20 shadow-lg relative z-50 group-hover:scale-110"
                  title="Excluir esta publicação"
                >
                  {isDeletingId === item.id ? <Spinner size={16} /> : <Trash2 size={18} />}
                </button>
              </div>
            </div>

            <div className="aspect-square bg-black overflow-hidden relative">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              {item.price && (
                <div className="absolute top-4 right-4 bg-orange-500 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-lg border border-white/20">
                  R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              )}
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleLike(item.id)}
                    className="flex items-center gap-1.5"
                  >
                    <Heart 
                      size={20} 
                      fill={userLiked[item.id] ? "#ef4444" : "none"}
                      className={`${userLiked[item.id] ? 'text-red-500' : 'text-white'} transition-colors cursor-pointer`} 
                    />
                    <span className="text-xs font-bold text-white">{item.likesCount || 0}</span>
                  </motion.button>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle size={20} className="text-white" />
                    <span className="text-xs font-bold text-white">{item.commentsCount || 0}</span>
                  </div>
                  <Share2 size={20} className="text-white cursor-pointer" />
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-white/90 leading-relaxed font-bold">{item.title}</p>
                <p className="text-xs text-white/70 leading-relaxed line-clamp-2">{item.description}</p>
                <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mt-1">
                  {item.createdAt?.toDate ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(item.createdAt.toDate()) : 'Recentemente'}
                </p>
              </div>

              {/* Comments Section */}
              <div className="border-t border-white/5 pt-4">
                <PortfolioComments proId={proId} itemId={item.id} />
              </div>
            </div>
          </motion.div>
            ));
          })()}
        </AnimatePresence>
      </div>

      {(items || []).length === 0 && !isAdding && (
        <div className="py-24 text-center">
          <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <ImageIcon size={32} className="text-gray-700" />
          </div>
          <h4 className="text-xl font-bold text-white mb-2">Seu feed está vazio</h4>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">Poste fotos dos seus trabalhos para atrair clientes.</p>
        </div>
      )}
    </div>
  );
};

interface PortfolioItemViewProps {
  item: PortfolioItem;
  onLike: (e: React.MouseEvent) => void | Promise<void>;
  onClick: () => void;
  isLiked: boolean;
}
 
export const PortfolioItemView: React.FC<PortfolioItemViewProps> = ({ 
  item, 
  onLike, 
  onClick, 
  isLiked 
}) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, x: 50 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="cursor-pointer relative aspect-square group overflow-hidden bg-white/5 rounded-xl md:rounded-2xl shadow-lg border border-white/5"
    >
      <img 
        src={item.imageUrl} 
        alt={item.title} 
        className="w-full h-full object-cover transition-all duration-500" 
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
        <span className="text-white text-xs font-black uppercase mb-1 line-clamp-1">{item.title}</span>
        <div className="flex items-center gap-6 text-white" onClick={e => e.stopPropagation()}>
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={onLike}
            className="flex items-center gap-1.5 hover:scale-110 transition-transform"
          >
            <Heart 
              size={18} 
              fill={isLiked ? "#ef4444" : "none"} 
              strokeWidth={2.5}
              className={isLiked ? "text-red-500" : "text-white"} 
            /> 
            <span className="text-xs font-black">{item.likesCount || 0}</span>
          </motion.button>
          <button className="flex items-center gap-1.5 hover:scale-110 transition-transform">
            <MessageCircle size={18} strokeWidth={2.5} className="text-white" /> 
            <span className="text-xs font-black">{item.commentsCount || 0}</span>
          </button>
        </div>
        {item.price && (
          <div className="mt-3 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-white/20">
            R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const PortfolioGallery = ({ proId, proPhoto, proName }: { proId: string, proPhoto?: string, proName?: string }) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiking, setIsLiking] = useState<Record<string, boolean>>({});
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!proId) return;
    const portfolioRef = collection(db, 'professionals', proId, 'portfolio');
    const q = query(portfolioRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, async (snap) => {
      const portfolioItems = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));
      setItems(portfolioItems);

      // Check likes status for each item if user is logged in
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        portfolioItems.forEach(async (item) => {
          const likeRef = doc(db, 'professionals', proId, 'portfolio', item.id, 'likes', userId);
          const likeSnap = await getDoc(likeRef);
          setUserLiked(prev => ({ ...prev, [item.id]: likeSnap.exists() }));
        });
      }
    });
    return unsub;
  }, [proId]);

  useEffect(() => {
    if (!selectedItem || !auth.currentUser || !proId) return;
    const likeRef = doc(db, 'professionals', proId, 'portfolio', selectedItem.id, 'likes', auth.currentUser.uid);
    getDoc(likeRef).then(snap => {
      setUserLiked(prev => ({ ...prev, [selectedItem.id]: snap.exists() }));
    });
  }, [selectedItem, proId]);

  useEffect(() => {
    if (!selectedItem) {
      setComments([]);
      return;
    }
    const commentsRef = collection(db, 'professionals', proId, 'portfolio', selectedItem.id, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
    });
    return unsub;
  }, [selectedItem, proId]);

  const handleLike = async (itemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const likeRef = doc(db, 'professionals', proId, 'portfolio', itemId, 'likes', userId);
    const itemRef = doc(db, 'professionals', proId, 'portfolio', itemId);

    try {
      const isCurrentlyLiked = userLiked[itemId];
      
      // Optimistic update
      setUserLiked(prev => ({ ...prev, [itemId]: !isCurrentlyLiked }));
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, likesCount: (item.likesCount || 0) + (isCurrentlyLiked ? -1 : 1) }
          : item
      ));
      if (selectedItem?.id === itemId) {
        setSelectedItem(prev => prev ? ({ ...prev, likesCount: (prev.likesCount || 0) + (isCurrentlyLiked ? -1 : 1) }) : null);
      }

      if (isCurrentlyLiked) {
        await deleteDoc(likeRef);
        await setDoc(itemRef, { likesCount: increment(-1) }, { merge: true });
      } else {
        await setDoc(likeRef, { userId, createdAt: serverTimestamp() });
        await setDoc(itemRef, { likesCount: increment(1) }, { merge: true });
      }
    } catch (error) {
      console.error('Error liking:', error);
    }
  };

  // --- Toasts & Modals ---
  const [showConfirm, setShowConfirm] = useState<{id: string, proId: string} | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteItem = async (itemId: string, itemProId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowConfirm({ id: itemId, proId: itemProId });
  };

  const confirmDelete = async () => {
    if (!showConfirm) return;
    const { id: itemId, proId: itemProId } = showConfirm;
    setShowConfirm(null);
    
    setIsDeletingId(itemId);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Usuário não autenticado');
      
      const targetProId = itemProId || proId || currentUser.uid;
      const docRef = doc(db, 'professionals', targetProId, 'portfolio', itemId);
      
      await deleteDoc(docRef);
      showToast('Publicação removida!');
      setSelectedItem(null);
    } catch (error: any) {
      console.error('[PortfolioGallery] Error:', error);
      showToast('Erro ao excluir: ' + (error.message || 'Erro inesperado'), 'error');
      handleFirestoreError(error, OperationType.DELETE, `professionals/${proId}/portfolio/${itemId}`);
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !newComment.trim() || !auth.currentUser) return;

    const commentRef = collection(db, 'professionals', proId, 'portfolio', selectedItem.id, 'comments');
    const itemRef = doc(db, 'professionals', proId, 'portfolio', selectedItem.id);

    try {
      await addDoc(commentRef, {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Usuário',
        userPhoto: auth.currentUser.photoURL,
        content: newComment,
        createdAt: serverTimestamp()
      });
      await setDoc(itemRef, { commentsCount: increment(1) }, { merge: true });
      setNewComment('');
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  if ((items || []).length === 0) return null;

  return (
    <div className="space-y-6 pt-12 relative">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[2000] px-6 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' ? 'bg-green-500 text-white border-green-400' : 'bg-red-500 text-white border-red-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-[#121826] border border-white/10 rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} className="text-red-500" />
              </div>
              <h4 className="text-xl font-black text-white mb-2 italic">EXCLUIR PUBLICAÇÃO?</h4>
              <p className="text-gray-400 text-sm mb-8">Confirmar exclusão desta publicação? Esta ação é permanente.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowConfirm(null)}
                  className="py-4 rounded-2xl bg-white/5 text-white font-black text-xs hover:bg-white/10 transition-colors uppercase tracking-widest"
                >
                  Voltar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="py-4 rounded-2xl bg-red-500 text-white font-black text-xs shadow-lg shadow-red-500/20 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="h-px bg-white/10 flex-grow" />
        <div className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10">
          <ImageIcon size={14} className="text-orange-500" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Publicações</span>
        </div>
        <div className="h-px bg-white/10 flex-grow" />
      </div>
      
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        <AnimatePresence mode="popLayout">
          {(() => {
            const uniqueGalleryItems = Array.from(new Map(items.map(item => [item.id, item])).values()) as PortfolioItem[];
            debugDuplicateKeys(uniqueGalleryItems, (item) => item.id, "Itens Portfolio Galeria");
            return uniqueGalleryItems.map((item, index) => (
              <PortfolioItemView
                key={item.id}
                item={item}
                isLiked={!!userLiked[item.id]}
                onLike={(e) => handleLike(item.id, e)}
                onClick={() => setSelectedItem(item)}
              />
            ));
          })()}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-6xl bg-[#0d1117] overflow-hidden md:rounded-xl shadow-2xl flex flex-col md:flex-row h-full md:h-[90vh]"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-50 bg-black/60 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-black transition-colors border border-white/10"
              >
                <X size={20} />
              </button>
              
              <div className="shrink-0 h-[45vh] md:h-full md:flex-grow bg-black flex items-center justify-center overflow-hidden">
                <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>

              <div className="flex-grow md:w-[400px] flex flex-col bg-[#0d1117] border-l border-white/10 overflow-hidden pb-[env(safe-area-inset-bottom,0px)]">
                <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500 p-[1px]">
                       <div className="w-full h-full rounded-full bg-black border-2 border-black flex items-center justify-center overflow-hidden">
                          {proPhoto ? (
                            <img src={proPhoto} className="w-full h-full object-cover" alt={proName} referrerPolicy="no-referrer" />
                          ) : (
                            <Camera size={16} className="text-white" />
                          )}
                       </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white uppercase tracking-tight leading-none">{proName || 'Profissional'}</p>
                      <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mt-1">Status: Online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 relative z-20">
                    {(auth.currentUser?.uid === proId || auth.currentUser?.uid === selectedItem.proId) && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          handleDeleteItem(selectedItem.id, selectedItem.proId, e);
                        }}
                        disabled={!!isDeletingId}
                        className="w-12 h-12 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer pointer-events-auto border-2 border-red-500/20 shadow-xl relative z-50"
                        title="Excluir publicação"
                      >
                        {isDeletingId === selectedItem.id ? <Spinner size={20} /> : <Trash2 size={24} />}
                      </button>
                    )}
                    <MoreVertical size={20} className="text-gray-500" />
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-6">
                   <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-full bg-white/10 shrink-0 overflow-hidden">
                        {proPhoto ? <img src={proPhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : null}
                      </div>
                      <div className="space-y-1">
                         <div className="text-sm text-white">
                            <span className="font-bold mr-2">{proName || 'Profissional'}</span>
                            {selectedItem.description}
                         </div>
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            {selectedItem.createdAt?.toDate ? selectedItem.createdAt.toDate().toLocaleDateString('pt-BR', { dateStyle: 'long' }) : 'Recentemente'}
                         </p>
                      </div>
                   </div>

                   {/* Comments List */}
                   <div className="space-y-4 pt-4 border-t border-white/5">
                      <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Comentários ({(comments || []).length})</h5>
                      {(() => {
                        const uniqueGalleryComments = Array.from(new Map(comments.map(c => [c.id, c])).values()) as Comment[];
                        debugDuplicateKeys(uniqueGalleryComments, (c) => c.id, "Comentários Portfolio Modal");
                        return uniqueGalleryComments.map((comment) => (
                          <div key={comment.id} className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/5 shrink-0 overflow-hidden">
                              {comment.userPhoto && <img src={comment.userPhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs text-white">
                                <span className="font-bold mr-2">{comment.userName}</span>
                                {comment.content}
                              </p>
                              <p className="text-[9px] text-gray-600 font-bold">
                                 {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString() : 'Agora'}
                              </p>
                            </div>
                          </div>
                        ));
                      })()}
                      {(comments || []).length === 0 && (
                        <p className="text-xs text-gray-600 italic">Nenhum comentário ainda. Seja o primeiro!</p>
                      )}
                   </div>
                </div>

                <div className="p-4 border-t border-white/10 mt-auto bg-black/20">
                   <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <motion.button 
                          whileTap={{ scale: 0.8 }}
                          onClick={() => handleLike(selectedItem.id)}
                        >
                          <Heart 
                            size={24} 
                            className={`${userLiked[selectedItem.id] ? 'text-red-500 fill-red-500' : 'text-white'} transition-colors cursor-pointer`} 
                          />
                        </motion.button>
                        <MessageCircle size={24} className="text-white cursor-pointer" />
                        <Share2 size={24} className="text-white cursor-pointer" />
                      </div>
                      {selectedItem.price && (
                        <div className="text-orange-500 font-black text-lg">
                          R$ {selectedItem.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                   </div>
                   <p className="text-sm font-bold text-white mb-3">{selectedItem.likesCount || 0} curtidas</p>
                   
                   <form onSubmit={handleAddComment} className="flex gap-2">
                     <input 
                        type="text" 
                        placeholder="Adicione um comentário..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-grow bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:border-orange-500 outline-none"
                     />
                     <button 
                        disabled={!newComment.trim()}
                        className="text-orange-500 font-bold text-xs disabled:opacity-30 uppercase tracking-widest"
                     >
                       Publicar
                     </button>
                   </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};