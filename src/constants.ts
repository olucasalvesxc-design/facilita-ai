import { 
  Flashlight, Droplet, Brush, Hammer, Car, Camera, Heart, 
  Scissors, ChefHat, Computer, GraduationCap, Briefcase,
  Music, Paintbrush, Plane, ShoppingBag, Terminal, User
} from 'lucide-react';

export const PROFESSIONS = [
  // Técnica & Reparos
  { id: 'prof-eletricista', title: 'Eletricista', category: 'Técnica' },
  { id: 'prof-encanador', title: 'Encanador', category: 'Técnica' },
  { id: 'prof-pintor', title: 'Pintor', category: 'Técnica' },
  { id: 'prof-marceneiro', title: 'Marceneiro', category: 'Técnica' },
  { id: 'prof-pedreiro', title: 'Pedreiro', category: 'Técnica' },
  { id: 'prof-montador', title: 'Montador de Móveis', category: 'Técnica' },
  { id: 'prof-chaveiro', title: 'Chaveiro', category: 'Técnica' },
  { id: 'prof-arcondicionado', title: 'Técnico de Ar-condicionado', category: 'Técnica' },
  { id: 'prof-geladeira', title: 'Técnico de Geladeira', category: 'Técnica' },
  { id: 'prof-lavar', title: 'Técnico de Máquina de Lavar', category: 'Técnica' },
  { id: 'prof-gesseiro', title: 'Gesseiro', category: 'Técnica' },
  { id: 'prof-vidraceiro', title: 'Vidraceiro', category: 'Técnica' },
  { id: 'prof-papelparede', title: 'Instalador de Papel de Parede', category: 'Técnica' },
  { id: 'prof-dedetizador', title: 'Dedetizador', category: 'Técnica' },
  
  // Limpeza & Conservação
  { id: 'prof-diarista', title: 'Diarista', category: 'Serviços Gerais' },
  { id: 'prof-piscina', title: 'Limpador de Piscina', category: 'Serviços Gerais' },
  { id: 'prof-jardineiro', title: 'Jardineiro', category: 'Serviços Gerais' },
  { id: 'prof-passadeira', title: 'Passadeira', category: 'Serviços Gerais' },
  { id: 'prof-estofados', title: 'Limpador de Estofados', category: 'Serviços Gerais' },
  { id: 'prof-vidros', title: 'Limpador de Vidros', category: 'Serviços Gerais' },
  
  // Saúde & Bem-estar
  { id: 'prof-fisioterapeuta', title: 'Fisioterapeuta', category: 'Saúde' },
  { id: 'prof-psicologo', title: 'Psicólogo', category: 'Saúde' },
  { id: 'prof-nutricionista', title: 'Nutricionista', category: 'Saúde' },
  { id: 'prof-personal', title: 'Personal Trainer', category: 'Saúde' },
  { id: 'prof-massoterapeuta', title: 'Massoterapeuta', category: 'Saúde' },
  { id: 'prof-enfermeiro', title: 'Enfermeiro Particular', category: 'Saúde' },
  { id: 'prof-cuidador', title: 'Cuidador de Idosos', category: 'Saúde' },
  
  // Beleza & Estética
  { id: 'prof-cabeleireiro', title: 'Cabeleireiro', category: 'Beleza' },
  { id: 'prof-barbeiro', title: 'Barbeiro', category: 'Beleza' },
  { id: 'prof-manicure', title: 'Manicure/Pedicure', category: 'Beleza' },
  { id: 'prof-maquiador', title: 'Maquiador', category: 'Beleza' },
  { id: 'prof-depilador', title: 'Depilador', category: 'Beleza' },
  { id: 'prof-esteticista', title: 'Esteticista', category: 'Beleza' },
  { id: 'prof-sobrancelha', title: 'Designer de Sobrancelhas', category: 'Beleza' },
  
  // Tecnologia & Digital
  { id: 'prof-webdev', title: 'Desenvolvedor Web', category: 'Tecnologia' },
  { id: 'prof-appdev', title: 'Desenvolvedor App', category: 'Tecnologia' },
  { id: 'prof-suporte', title: 'Suporte Técnico de Informática', category: 'Tecnologia' },
  { id: 'prof-social', title: 'Social Media', category: 'Tecnologia' },
  { id: 'prof-design', title: 'Designer Gráfico', category: 'Tecnologia' },
  { id: 'prof-video', title: 'Editor de Vídeo', category: 'Tecnologia' },
  { id: 'prof-trafego', title: 'Gestor de Tráfego', category: 'Tecnologia' },
  
  // Eventos & Gastronomia
  { id: 'prof-cozinheiro', title: 'Cozinheiro Particular', category: 'Gastronomia/Eventos' },
  { id: 'prof-confeiteiro', title: 'Confeiteiro', category: 'Gastronomia/Eventos' },
  { id: 'prof-fotografo', title: 'Fotógrafo', category: 'Gastronomia/Eventos' },
  { id: 'prof-cinegrafista', title: 'Cinegrafista', category: 'Gastronomia/Eventos' },
  { id: 'prof-dj', title: 'DJ', category: 'Gastronomia/Eventos' },
  { id: 'prof-garcom', title: 'Garçom/Garçonete', category: 'Gastronomia/Eventos' },
  { id: 'prof-eventos', title: 'Organizador de Eventos', category: 'Gastronomia/Eventos' },
  
  // Outros / Educação
  { id: 'prof-idiomas', title: 'Aulas de Idiomas', category: 'Educação' },
  { id: 'prof-reforco', title: 'Aulas de Reforço Escolar', category: 'Educação' },
  { id: 'prof-musica', title: 'Aulas de Música', category: 'Educação' },
  { id: 'prof-petwalker', title: 'Dog Walker/Pet Sitter', category: 'Pets' },
  { id: 'prof-adestrador', title: 'Adestrador de Cães', category: 'Pets' },
  { id: 'prof-motorista', title: 'Motorista Particular', category: 'Transporte' },
  { id: 'prof-outro', title: 'Outro / Sugerir Novo', category: 'Outros' }
];

export const POPULAR_CATEGORIES = [
  { 
    id: 'cat-eletrica',
    icon: Flashlight, 
    title: 'Elétrica', 
    glowClass: 'bg-orange-500/20 glow-orange',
    imageURL: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'cat-hidraulica',
    icon: Droplet, 
    title: 'Hidráulica', 
    glowClass: 'bg-blue-500/20 glow-blue',
    imageURL: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'cat-limpeza',
    icon: Brush, 
    title: 'Limpeza', 
    glowClass: 'bg-green-500/20 glow-green',
    imageURL: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'cat-montagem',
    icon: Hammer, 
    title: 'Montagem', 
    glowClass: 'bg-purple-500/20 glow-purple',
    imageURL: 'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'cat-saude',
    icon: Heart, 
    title: 'Saúde', 
    glowClass: 'bg-red-500/20 glow-red',
    imageURL: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'cat-beleza',
    icon: Scissors, 
    title: 'Beleza', 
    glowClass: 'bg-pink-500/20 glow-pink',
    imageURL: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'cat-ti',
    icon: Computer, 
    title: 'TI', 
    glowClass: 'bg-cyan-500/20 glow-cyan',
    imageURL: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'cat-eventos',
    icon: Camera, 
    title: 'Eventos', 
    glowClass: 'bg-yellow-500/20 glow-yellow',
    imageURL: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop'
  }
];

export const PRO_PLANS = [
  {
    id: 'start',
    name: 'Plano Start',
    price: 9.90,
    maxProducts: 4,
    features: [
      'Pode publicar produtos',
      'Pode vender pelo WhatsApp',
      'Até 4 posts totais',
      'Acesso básico ao marketplace'
    ],
    color: 'border-blue-500/50 text-blue-500'
  },
  {
    id: 'pro',
    name: 'Plano Pro',
    price: 27.90,
    maxProducts: 20,
    features: [
      'Tudo do plano Start',
      'Até 20 posts',
      'Destaque moderado nos produtos'
    ],
    color: 'border-orange-500/50 text-orange-500'
  },
  {
    id: 'ultra',
    name: 'Plano Ultra',
    price: 87.90,
    maxProducts: Infinity,
    features: [
      'Produtos ilimitados',
      'Destaque principal',
      'Selo verificado',
      'Prioridade nas buscas'
    ],
    color: 'border-yellow-500 text-yellow-500',
    verified: true
  }
];

export const KIRVANO_CHECKOUT_URL = (import.meta as any).env?.VITE_KIRVANO_CHECKOUT_URL || 'https://pay.kirvano.com/a9e4a8e1-a4c3-43de-933e-21cff8f3f8a3';
export const VERIFICATION_BADGE_PRICE = 9.90;
export const PRO_PLAN_PRICE = PRO_PLANS.find(p => p.id === 'pro')?.price ?? 27.90;
