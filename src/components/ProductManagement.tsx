import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, Plus, Trash2, Edit2, Camera, X, Check, AlertTriangle, 
  Tag, Truck, Store, Info, Eye, EyeOff, Search, MessageCircle
} from 'lucide-react';
import { 
  db, collection, query, where, onSnapshot, addDoc, 
  updateDoc, deleteDoc, doc, serverTimestamp, OperationType, handleFirestoreError, debugDuplicateKeys 
} from '../lib/firebase';
import { Product, Professional } from '../types';
import { compressImage } from '../lib/imageUtils';
import { PRO_PLANS } from '../constants';

interface ProductManagementProps {
  professional: Professional;
}

export const ProductManagement = ({ professional }: ProductManagementProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    oldPrice: 0,
    imageUrl: '',
    category: '',
    stock: 0,
    deliveryMethod: 'retirada' as 'retirada' | 'entrega_local' | 'combinar',
    status: 'active' as 'active' | 'inactive'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'products'),
      where('proId', '==', professional.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [professional.id]);

  const currentPlan = PRO_PLANS.find(p => p.id === professional.subscriptionType) || null;
  const isExpired = professional.subscriptionStatus === 'expired';
  const canAddMore = !currentPlan || products.length < currentPlan.maxProducts;

  const handleAddNew = () => {
    if (isExpired) {
      alert('Seu plano expirou. Renove sua assinatura para cadastrar novos produtos.');
      return;
    }
    if (!canAddMore) {
      setIsUpgradeModalOpen(true);
      return;
    }
    resetForm(); 
    setIsModalOpen(true); 
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`Imagem muito grande! Máximo permitido: ${MAX_MB}MB. Seu arquivo: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      e.target.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Formato inválido. Envie uma imagem (JPG, PNG, WEBP).');
      e.target.value = '';
      return;
    }

    setUploadingImage(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const compressed = await compressImage(base64, 1024, 0.8);
      setFormData(prev => ({ ...prev, imageUrl: compressed }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao processar imagem. Tente novamente.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      const data = {
        ...formData,
        proId: professional.id,
        proName: professional.name,
        proSubscriptionPlan: professional.subscriptionType,
        coordinates: professional.coordinates || null,
        updatedAt: serverTimestamp()
      };

      if (editingProduct) {
        const productRef = doc(db, 'products', editingProduct.id);
        await updateDoc(productRef, data);
      } else {
        const productsRef = collection(db, 'products');
        await addDoc(productsRef, {
          ...data,
          createdAt: serverTimestamp(),
          viewCount: 0,
          clickCount: 0
        });
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
       handleFirestoreError(error, editingProduct ? OperationType.UPDATE : OperationType.CREATE, 'products');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice || 0,
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock,
      deliveryMethod: product.deliveryMethod,
      status: product.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'products');
    }
  };

  const toggleStatus = async (product: Product) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'products', product.id), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'products');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      oldPrice: 0,
      imageUrl: '',
      category: '',
      stock: 0,
      deliveryMethod: 'retirada',
      status: 'active'
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Meus Produtos</h2>
          <p className="text-gray-500 text-sm mt-1">Gerencie seu catálogo de vendas</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20"
        >
          <Plus size={18} />
          Cadastrar Produto
        </motion.button>
      </div>

      {/* Expired Warning */}
      {isExpired && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[32px] flex flex-col sm:flex-row items-center gap-6 justify-between animate-pulse">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <div>
              <h4 className="text-red-500 font-black uppercase tracking-widest text-[10px] mb-1">Atenção: Plano Expirado</h4>
              <p className="text-gray-400 text-xs italic">Seu plano expirou. Renove para reativar seus anúncios e cadastrar novos produtos.</p>
            </div>
          </div>
          <button className="bg-red-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 shrink-0">
            Renovar Agora
          </button>
        </div>
      )}

      {/* Plan Info Bar */}
      {currentPlan && (
        <div className="flex items-center justify-between px-6 py-4 bg-white/2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase ${currentPlan.color}`}>
              {currentPlan.name}
            </div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider italic">
              {currentPlan.maxProducts === Infinity 
                ? 'Produtos ilimitados' 
                : `${products.length} / ${currentPlan.maxProducts} produtos cadastrados`}
            </span>
          </div>
          {!canAddMore && (
            <button 
              onClick={() => setIsUpgradeModalOpen(true)}
              className="text-orange-500 text-[9px] font-black uppercase tracking-widest hover:underline"
            >
              Fazer Upgrade
            </button>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" size={18} />
        <input 
          type="text"
          placeholder="Buscar nos seus produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder-gray-500 outline-none focus:border-orange-500/50 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Carregando estoque...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white/5 rounded-3xl border border-dashed border-white/10 p-12 text-center">
          <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-orange-500" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
            Comece a cadastrar seus produtos para que seus clientes possam vê-los em seu perfil.
          </p>
          <button 
            onClick={handleAddNew}
            className="text-orange-500 font-black uppercase tracking-widest text-xs hover:underline"
          >
            Cadastrar meu primeiro produto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            const uniqueProducts = Array.from(new Map(filteredProducts.map(p => [p.id, p])).values()) as Product[];
            debugDuplicateKeys(uniqueProducts, (p) => p.id, "Lista Meus Produtos PRO");
            return uniqueProducts.map((product) => (
              <motion.div 
                layout
                key={product.id}
                className="bg-[#0d121f] rounded-2xl border border-white/5 p-4 flex gap-4 group hover:border-orange-500/50 transition-all"
              >
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-grow min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-white font-bold text-sm truncate">{product.name}</h4>
                  <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${product.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {product.status === 'active' ? 'Ativo' : 'Pausado'}
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 truncate mt-1 italic">{product.category}</p>
                
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-orange-500 font-black text-sm tracking-tighter">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold">Estoque: {product.stock}</span>
                </div>

                <div className="mt-auto flex items-center justify-end gap-2 pt-2">
                  <button onClick={() => toggleStatus(product)} className="p-2 text-gray-500 hover:text-white transition-colors" title={product.status === 'active' ? 'Pausar' : 'Ativar'}>
                    {product.status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button onClick={() => handleEdit(product)} className="p-2 text-gray-500 hover:text-orange-500 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
            ));
          })()}
        </div>
      )}

      {/* Modal Cadastro/Edição */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#070b13] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">Preencha os detalhes abaixo</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-8 space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Camera size={14} className="text-orange-500" />
                    Foto do Produto
                  </label>
                  <div className="flex gap-4">
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-white/5 border-2 border-dashed border-white/10 group">
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 group-hover:text-orange-500 transition-colors">
                          <Plus size={24} />
                        </div>
                      )}
                      
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex-grow py-2">
                      <p className="text-xs text-gray-500 mb-2 italic flex items-center gap-1">
                        <Info size={12} />
                        Use fotos reais e com boa iluminação para vender mais.
                      </p>
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className="text-red-500 text-[10px] font-bold uppercase tracking-widest bg-red-500/10 px-3 py-1.5 rounded-lg"
                      >
                        Remover Foto
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Package size={14} className="text-orange-500" />
                      Nome do Produto
                    </label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500/50"
                      placeholder="Ex: Shampoo Profissional 500ml"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Tag size={14} className="text-orange-500" />
                      Categoria
                    </label>
                    <input 
                      required
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500/50"
                      placeholder="Ex: Cabelos, Peças, Acessórios"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Descrição</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500/50 resize-none text-sm"
                    placeholder="Descreva as características e benefícios do produto..."
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Preço (R$)</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-[#555]">Preço De (R$)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={formData.oldPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, oldPrice: parseFloat(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Estoque</label>
                    <input 
                      required
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500/50"
                    >
                      <option value="active" className="bg-[#070b13]">Ativo</option>
                      <option value="inactive" className="bg-[#070b13]">Inativo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Truck size={14} className="text-orange-500" />
                    Forma de Entrega
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'retirada', label: 'Retirada no Local', icon: Store },
                      { id: 'entrega_local', label: 'Entrega Própria', icon: Truck },
                      { id: 'combinar', label: 'Combinar WhatsApp', icon: MessageCircle },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: method.id as any }))}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                          formData.deliveryMethod === method.id 
                            ? 'bg-orange-500/10 border-orange-500 text-white' 
                            : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                        }`}
                      >
                        <method.icon size={18} />
                        <span className="text-xs font-bold">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving || !formData.imageUrl || !formData.name}
                  className="bg-orange-500 disabled:opacity-50 disabled:grayscale text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-500/20 flex items-center gap-2"
                >
                  {isSaving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                  {isSaving ? 'Salvando...' : editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Upgrade Modal */}
      <AnimatePresence>
        {isUpgradeModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUpgradeModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-[#070b13] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col"
            >
              <div className="p-10 text-center border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none mb-4">Aumente suas Vendas</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">Você atingiu o limite de produtos do seu plano atual. Escolha um plano superior para continuar crescendo.</p>
                <button 
                  onClick={() => setIsUpgradeModalOpen(false)}
                  className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                {PRO_PLANS.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`relative p-8 rounded-[32px] border-2 transition-all hover:scale-[1.02] ${
                      professional.subscriptionType === plan.id 
                        ? 'bg-white/5 border-orange-500 shadow-2xl shadow-orange-500/10' 
                        : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                    }`}
                  >
                    {professional.subscriptionType === plan.id && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                        Plano Atual
                      </div>
                    )}

                    <h4 className={`text-xl font-black italic uppercase tracking-tighter mb-1 ${plan.color.split(' ')[1]}`}>{plan.name}</h4>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-2xl font-black text-white tracking-tighter">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                      <span className="text-gray-500 text-[10px] font-bold uppercase">/mês</span>
                    </div>

                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                          <span className="text-xs text-gray-400 leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                        professional.subscriptionType === plan.id
                          ? 'bg-white/5 text-gray-500 cursor-default'
                          : 'bg-white text-black hover:bg-orange-500 hover:text-white shadow-xl shadow-white/5'
                      }`}
                    >
                      {professional.subscriptionType === plan.id ? 'Plano Ativo' : 'Assinar Agora'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-black/40 border-t border-white/5 text-center">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest italic">Pagamento seguro via Mercado Pago ou PIX</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
