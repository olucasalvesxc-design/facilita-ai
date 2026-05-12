export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  bannerURL?: string;
  role: 'client' | 'admin' | 'pro';
  whatsapp?: string;
  emailNotifications?: boolean;
  publicProfile?: boolean;
  whatsappVisible?: boolean;
  isVerified?: boolean;
  bio?: string;
  skills?: string[];
  priceRange?: string;
  experience?: string;
  availability?: string;
  instagram?: string;
  website?: string;
  location?: string;
  hasActiveSubscription?: boolean;
  subscriptionPlan?: 'free' | 'start' | 'pro' | 'ultra' | 'pro_monthly' | 'pro_annual';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Professional {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  pricePerService: number;
  status: 'online' | 'offline';
  professionalStatus: 'active' | 'pending' | 'expired' | 'blocked';
  photoURL: string;
  bannerURL?: string;
  description: string;
  location: string;
  userId: string;
  distance?: number;
  responseTime?: string;
  isTopPro?: boolean;
  isVerified?: boolean;
  verificationStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  coordinates?: {
    lat: number;
    lng: number;
  };
  conversionRate?: number; // 0 to 1
  isBoosted?: boolean;
  lastActiveAt?: any; // Timestamp
  completedOrdersCount?: number;
  likesCount?: number;
  whatsapp?: string;
  cpfCnpj?: string;
  documentUrl?: string;
  workingHours?: { day: string, start: string, end: string, active: boolean }[];
  serviceArea?: string;
  onboardingStep?: number;
  subscriptionExpiresAt?: any; // Timestamp
  emailNotifications?: boolean;
  publicProfile?: boolean;
  whatsappVisible?: boolean;
  skills?: string[];
  priceRange?: string;
  experience?: string;
  availability?: string;
  instagram?: string;
  website?: string;
  subscriptionStatus?: 'active' | 'expired' | 'canceled' | 'none' | 'pending_payment';
  subscriptionType?: 'start' | 'pro' | 'ultra' | 'monthly_pro' | 'annual_pro' | 'none';
  // New service management fields
  serviceMode: 'appointment' | 'queue' | 'both' | 'none';
  slotDuration?: number; // minutes
  appointmentInterval?: number; // minutes
  isQueueActive?: boolean;
}

export interface Appointment {
  id: string;
  proId: string;
  clientId: string;
  clientName: string;
  clientPhoto?: string;
  serviceTitle: string;
  date: any; // Date timestamp
  time: string; // HH:mm
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  price?: number;
  createdAt: any;
  updatedAt: any;
}

export interface QueueEntry {
  id: string;
  proId: string;
  clientId: string;
  clientName: string;
  clientPhoto?: string;
  position: number;
  status: 'waiting' | 'called' | 'in_service' | 'completed' | 'cancelled';
  entryTime: any;
  estimatedStartTime?: any;
  calledAt?: any;
}

export interface Order {
  id: string;
  clientId: string;
  professionalId: string;
  professionalName: string;
  clientName?: string;
  serviceTitle: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'scheduled';
  date: any; // Created At Timestamp
  scheduledAt?: any; // Scheduled Date & Time Timestamp
  price: number;
  updatedAt: any; // Timestamp
  location?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: any; // Timestamp
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastTimestamp?: any;
}

export interface PortfolioItem {
  id: string;
  proId: string;
  title: string;
  description: string;
  imageUrl: string;
  price?: number;
  likesCount?: number;
  commentsCount?: number;
  createdAt: any; // Timestamp
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  createdAt: any;
}

export interface Product {
  id: string;
  proId: string;
  proName: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  stock: number;
  category: string;
  deliveryMethod: 'retirada' | 'entrega_local' | 'combinar';
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
  viewCount?: number;
  clickCount?: number;
  proSubscriptionPlan?: 'start' | 'pro' | 'ultra';
  coordinates?: {
    lat: number;
    lng: number;
  };
}
