import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Phone, MapPin, Navigation, ExternalLink, Shield,
  Activity, Flame, Siren, AlertCircle, Info, Search,
  Stethoscope, Pill, Truck, Eye, X
} from 'lucide-react';
import { db, collection, query, onSnapshot, orderBy } from '../lib/firebase';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const placeIcon = L.divIcon({
  html: `<div style="background:#f97316;border-radius:50%;width:14px;height:14px;border:3px solid white;box-shadow:0 2px 8px rgba(249,115,22,0.7)"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

const userIcon = L.divIcon({
  html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px"><div style="position:absolute;inset:0;background:rgba(59,130,246,0.25);border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div><div style="background:#3b82f6;border-radius:50%;width:14px;height:14px;border:3px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.6);position:relative;z-index:1"></div></div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface PlaceResult {
  id: string;
  displayName: string;
  formattedAddress: string;
  location: { lat: number; lng: number };
}

const SEARCH_CATEGORIES = [
  { id: 'hospital', label: 'Hospitais', icon: Stethoscope, amenity: 'hospital' },
  { id: 'pharmacy', label: 'Farmácias', icon: Pill, amenity: 'pharmacy' },
  { id: 'police', label: 'Polícia', icon: Shield, amenity: 'police' },
  { id: 'fire_station', label: 'Bombeiros', icon: Flame, amenity: 'fire_station' },
];

const EMERGENCY_NUMBERS = [
  { label: 'Polícia Militar', number: '190', icon: Shield, color: 'bg-blue-600' },
  { label: 'SAMU', number: '192', icon: Activity, color: 'bg-red-600' },
  { label: 'Bombeiros', number: '193', icon: Flame, color: 'bg-orange-600' },
  { label: 'Polícia Civil', number: '197', icon: Siren, color: 'bg-gray-700' },
  { label: 'Defesa Civil', number: '199', icon: AlertCircle, color: 'bg-amber-600' },
  { label: 'Pol. Rodoviária', number: '191', icon: Truck, color: 'bg-blue-900' },
  { label: 'Mulher', number: '180', icon: Eye, color: 'bg-purple-600' },
  { label: 'Denúncia', number: '181', icon: Info, color: 'bg-yellow-600' },
];

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

function buildQuery(amenity: string, lat: number, lng: number, radius: number) {
  return `[out:json][timeout:25];(node["amenity"="${amenity}"](around:${radius},${lat},${lng});way["amenity"="${amenity}"](around:${radius},${lat},${lng});relation["amenity"="${amenity}"](around:${radius},${lat},${lng}););out body center 20;`;
}

function parseElements(elements: any[]): PlaceResult[] {
  return elements
    .map((el) => ({
      id: String(el.id),
      displayName:
        el.tags?.name ||
        el.tags?.['name:pt'] ||
        el.tags?.['official_name'] ||
        'Sem nome',
      formattedAddress: [
        el.tags?.['addr:street'],
        el.tags?.['addr:housenumber'],
        el.tags?.['addr:city'] ||
          el.tags?.['addr:municipality'] ||
          el.tags?.['addr:suburb'],
      ]
        .filter(Boolean)
        .join(', ') || 'Endereço não disponível',
      location: {
        lat: el.lat ?? el.center?.lat,
        lng: el.lon ?? el.center?.lon,
      },
    }))
    .filter((p) => p.location.lat != null && p.location.lng != null)
    .slice(0, 15);
}

async function tryEndpoint(endpoint: string, query: string): Promise<PlaceResult[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 28000);
  try {
    const res = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return parseElements(data.elements as any[]);
  } finally {
    clearTimeout(timer);
  }
}

async function searchNearby(
  amenity: string,
  lat: number,
  lng: number,
  radius = 10000
): Promise<PlaceResult[]> {
  const q = buildQuery(amenity, lat, lng, radius);
  const errors: string[] = [];
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      return await tryEndpoint(endpoint, q);
    } catch (err: any) {
      errors.push(`${endpoint}: ${err.message}`);
    }
  }
  throw new Error(`Todos endpoints falharam: ${errors.join(' | ')}`);
}

const Spinner = ({ size = 20 }: { size?: number }) => (
  <div className="border-2 border-orange-500 border-t-transparent rounded-full animate-spin" style={{ width: size, height: size }} />
);

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center[0], center[1]]);
  return null;
}

export const EmergencySection = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [placeError, setPlaceError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(SEARCH_CATEGORIES[0].id);
  const [localNumbers, setLocalNumbers] = useState<any[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [searchRadius, setSearchRadius] = useState(10000);
  const [routeTarget, setRouteTarget] = useState<PlaceResult | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'emergency_numbers'), orderBy('label', 'asc'));
    return onSnapshot(q, snap => setLocalNumbers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  useEffect(() => {
    const fallback = { lat: -23.5505, lng: -46.6333 };
    if (!navigator.geolocation) { setUserLocation(fallback); return; }
    const timer = setTimeout(() => setUserLocation(prev => prev ?? fallback), 6000);
    navigator.geolocation.getCurrentPosition(
      pos => { clearTimeout(timer); setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
      () => { clearTimeout(timer); setUserLocation(fallback); },
      { timeout: 8000, maximumAge: 60000 }
    );
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    const cat = SEARCH_CATEGORIES.find(c => c.id === selectedCategory);
    if (!cat) return;
    setPlaces([]);
    setPlaceError(false);
    setLoadingPlaces(true);
    searchNearby(cat.amenity, userLocation.lat, userLocation.lng, searchRadius)
      .then(setPlaces)
      .catch(() => setPlaceError(true))
      .finally(() => setLoadingPlaces(false));
  }, [userLocation, selectedCategory, retryCount, searchRadius]);

  const handleCall = (number: string) => { window.location.href = `tel:${number}`; };
  const openWithWaze = (place: PlaceResult) =>
    window.open(`https://waze.com/ul?ll=${place.location.lat},${place.location.lng}&navigate=yes`, '_blank');
  const openWithMaps = (place: PlaceResult) =>
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`, '_blank');

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-6xl mx-auto w-full space-y-8 sm:space-y-10">
      {/* Aviso */}
      <div className="flex gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-3xl">
        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
        <p className="text-red-500 text-xs font-black uppercase tracking-widest leading-relaxed">
          Em caso de risco imediato à vida, ligue diretamente para o número de emergência.
        </p>
      </div>

      {/* Números de emergência */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {EMERGENCY_NUMBERS.map((item, idx) => (
          <motion.button
            key={item.number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => handleCall(item.number)}
            className="group relative bg-[#121826] border border-white/5 rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 hover:border-red-500/50 transition-all flex flex-col items-center text-center overflow-hidden active:scale-95"
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 ${item.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-transform group-hover:scale-110 shadow-xl shadow-black/40`}>
              <item.icon size={22} className="text-white" />
            </div>
            <h3 className="text-white font-black uppercase tracking-tighter text-lg sm:text-xl leading-none mb-1">{item.number}</h3>
            <span className="text-[9px] sm:text-[10px] text-gray-500 font-black uppercase tracking-widest">{item.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Números locais */}
      {localNumbers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl sm:text-2xl font-black text-white italic tracking-tighter uppercase">Contatos Locais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {localNumbers.map(item => (
              <div key={item.id} className="bg-[#121826] border border-white/5 rounded-3xl p-4 sm:p-5 flex items-center justify-between group hover:border-orange-500/30 transition-all">
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">{item.label}</h4>
                  <p className="text-orange-500 font-black text-xs tracking-widest">{item.number}</p>
                </div>
                <button onClick={() => handleCall(item.number)} className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 group-hover:bg-orange-500 group-hover:text-white transition-all active:scale-95">
                  <Phone size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locais de Apoio */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xl sm:text-2xl font-black text-white italic tracking-tighter uppercase">Locais de Apoio</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {SEARCH_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all flex items-center gap-2 active:scale-95 ${selectedCategory === cat.id ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}
              >
                <cat.icon size={12} />{cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mapa + Lista — stacked on mobile, side-by-side on lg */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Mapa */}
          <div className="lg:col-span-2 h-[280px] sm:h-[380px] lg:h-[500px] rounded-[32px] sm:rounded-[48px] overflow-hidden border border-white/5 relative bg-[#0d1117]">
            {!userLocation ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <Spinner size={32} />
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Buscando localização...</span>
              </div>
            ) : (
              <>
                <MapContainer
                  center={[userLocation.lat, userLocation.lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapRecenter center={[userLocation.lat, userLocation.lng]} />
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                    <Popup><strong>Você está aqui</strong></Popup>
                  </Marker>
                  {places.map(place => (
                    <Marker key={place.id} position={[place.location.lat, place.location.lng]} icon={placeIcon}>
                      <Popup>
                        <div style={{ minWidth: 180, padding: 4 }}>
                          <strong style={{ fontSize: 13 }}>{place.displayName}</strong>
                          <p style={{ fontSize: 11, color: '#666', margin: '4px 0 8px' }}>{place.formattedAddress}</p>
                          <button
                            onClick={() => setRouteTarget(place)}
                            style={{ width: '100%', background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 4px', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                          >
                            <Navigation size={11} /> Ver Rota
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
                {/* Radar badge */}
                <div className="absolute top-3 left-3 z-[400] bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  {loadingPlaces ? 'Buscando...' : `${places.length} local${places.length !== 1 ? 'is' : ''} • ${searchRadius / 1000}km`}
                </div>
              </>
            )}
          </div>

          {/* Lista de locais */}
          <div className="space-y-3 max-h-[400px] lg:max-h-[500px] overflow-y-auto no-scrollbar">
            {loadingPlaces ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-3xl border border-white/5 animate-pulse h-24" />
              ))
            ) : placeError ? (
              <div className="text-center py-10 border border-dashed border-white/5 rounded-3xl flex flex-col items-center gap-3">
                <AlertCircle size={24} className="text-red-500" />
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Erro ao buscar locais.<br/>Verifique sua conexão.</p>
                <button
                  onClick={() => { setPlaceError(false); setRetryCount(c => c + 1); }}
                  className="mt-1 px-5 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all"
                >
                  Tentar novamente
                </button>
              </div>
            ) : places.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-white/5 rounded-3xl flex flex-col items-center gap-3">
                <Search size={24} className="text-gray-700" />
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Nenhum local encontrado</p>
                  <p className="text-gray-700 text-[9px] uppercase tracking-widest mt-1">em {searchRadius / 1000}km ao redor</p>
                </div>
                {searchRadius < 30000 && (
                  <button
                    onClick={() => setSearchRadius(r => r + 10000)}
                    className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[9px] font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all"
                  >
                    Ampliar para {(searchRadius + 10000) / 1000}km
                  </button>
                )}
              </div>
            ) : places.map((place, idx) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-[#121826] border border-white/5 rounded-[28px] p-4 sm:p-5 hover:border-orange-500/30 transition-all"
              >
                <h4 className="text-white font-bold text-sm leading-tight mb-1 group-hover:text-orange-500 transition-colors">{place.displayName}</h4>
                <p className="text-gray-500 text-[10px] mb-3 line-clamp-1 italic">{place.formattedAddress}</p>
                <button
                  onClick={() => setRouteTarget(place)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[9px] font-black uppercase py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-orange-500/20"
                >
                  <Navigation size={11} /> Ver Rota
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: escolher app de navegação */}
      <AnimatePresence>
        {routeTarget && (
          <div className="fixed inset-0 z-[2000] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRouteTarget(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-sm bg-[#121826] rounded-t-[36px] p-6 pb-10 border-t border-white/10 shadow-2xl"
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center mb-1">Abrir rota para</p>
              <h3 className="text-white font-black text-base uppercase italic tracking-tighter text-center mb-6 leading-tight line-clamp-1">
                {routeTarget.displayName}
              </h3>

              <div className="space-y-3">
                {/* Waze */}
                <button
                  onClick={() => { openWithWaze(routeTarget); setRouteTarget(null); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-95 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #05c8f7, #0288d1)' }}
                >
                  <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    {/* Waze logo SVG */}
                    <svg width="24" height="24" viewBox="0 0 50 50" fill="white">
                      <path d="M25 3C13 3 3 13 3 25c0 6.4 2.7 12.2 7 16.3L8 45l4.2-1.3C15.2 45.5 20 47 25 47c12 0 22-10 22-22S37 3 25 3zm0 38c-4.3 0-8.3-1.4-11.5-3.8l-2.4.8 1-2.3C9.8 32.8 8 29 8 25c0-9.4 7.6-17 17-17s17 7.6 17 17-7.6 16-17 16z"/>
                      <circle cx="20" cy="22" r="2.5" fill="white"/>
                      <circle cx="30" cy="22" r="2.5" fill="white"/>
                      <path d="M19 29s2 3 6 3 6-3 6-3" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-black text-sm uppercase tracking-tight">Waze</p>
                    <p className="text-white/70 text-[10px]">Navegação em tempo real</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-white/60" />
                </button>

                {/* Google Maps */}
                <button
                  onClick={() => { openWithMaps(routeTarget); setRouteTarget(null); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-95 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #34a853, #1a6e30)' }}
                >
                  <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={22} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-black text-sm uppercase tracking-tight">Google Maps</p>
                    <p className="text-white/70 text-[10px]">Rotas e tráfego</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-white/60" />
                </button>
              </div>

              <button
                onClick={() => setRouteTarget(null)}
                className="w-full mt-4 py-3 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <X size={12} /> Cancelar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
