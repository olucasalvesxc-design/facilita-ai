import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, MapPin, Navigation, ExternalLink, Shield, 
  Activity, Flame, Siren, AlertCircle, Info, Search, X,
  Stethoscope, Pill, Building2, Truck, Eye
} from 'lucide-react';
import { 
  APIProvider, 
  Map, 
  useMap, 
  useMapsLibrary, 
  AdvancedMarker, 
  Pin,
  InfoWindow,
  useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';
import { db, collection, query, onSnapshot, orderBy, debugDuplicateKeys } from '../lib/firebase';

const API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface EmergencyNumber {
  label: string;
  number: string;
  icon: any;
  color: string;
  description: string;
}

const EMERGENCY_NUMBERS: EmergencyNumber[] = [
  { label: 'Polícia Militar', number: '190', icon: Shield, color: 'bg-blue-600', description: 'Ocorrências criminais em andamento e situações de risco.' },
  { label: 'SAMU', number: '192', icon: Activity, color: 'bg-red-600', description: 'Urgências e emergências médicas pré-hospitalares.' },
  { label: 'Bombeiros', number: '193', icon: Flame, color: 'bg-orange-600', description: 'Incêndios, salvamentos e acidentes com vítimas.' },
  { label: 'Polícia Civil', number: '197', icon: Siren, color: 'bg-gray-700', description: 'Denúncias e investigação de crimes já ocorridos.' },
  { label: 'Defesa Civil', number: '199', icon: AlertCircle, color: 'bg-amber-600', description: 'Desastres naturais, alagamentos e riscos estruturais.' },
  { label: 'Polícia Rodoviária', number: '191', icon: Truck, color: 'bg-blue-900', description: 'Emergências e acidentes em rodovias federais.' },
  { label: 'Mulher', number: '180', icon: Eye, color: 'bg-purple-600', description: 'Atendimento à mulher em situação de violência.' },
  { label: 'Disque Denúncia', number: '181', icon: Info, color: 'bg-yellow-600', description: 'Denúncias anônimas sobre crimes e foragidos.' },
];

const SEARCH_CATEGORIES = [
  { id: 'hospital', label: 'Hospitais', icon: Stethoscope, query: 'hospital' },
  { id: 'pharmacy', label: 'Farmácias 24h', icon: Pill, query: 'pharmacy 24 hours' },
  { id: 'police', label: 'Polícia', icon: Shield, query: 'police station' },
  { id: 'fire_station', label: 'Bombeiros', icon: Flame, query: 'fire station' },
];

interface PlaceResult {
  id: string;
  displayName: string;
  formattedAddress: string;
  location: google.maps.LatLngLiteral;
  rating?: number;
  openNow?: boolean;
}

const MapHandler = ({ center, onCenterChange }: { center: google.maps.LatLngLiteral, onCenterChange: (lat: number, lng: number) => void }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.setCenter(center);
    }
  }, [map, center]);

  return null;
};

const MarkerWithInfoWindow: React.FC<{ 
  place: PlaceResult, 
  onOpenRota: (dest: string) => void,
  onOpenMaps: (lat: number, lng: number) => void
}> = ({ place, onOpenRota, onOpenMaps }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={place.location}
        onClick={() => setInfoWindowShown(true)}
      >
        <Pin background={"#f97316"} borderColor={"#ea580c"} glyphColor={"#fff"} />
      </AdvancedMarker>

      {infoWindowShown && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setInfoWindowShown(false)}
          headerDisabled
        >
          <div className="p-2 min-w-[200px]">
            <h4 className="text-black font-black text-sm mb-1">{place.displayName}</h4>
            <p className="text-gray-600 text-xs mb-3">{place.formattedAddress}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => onOpenRota(place.formattedAddress)}
                className="flex-grow bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest py-1.5 rounded-lg flex items-center justify-center gap-1"
              >
                <Navigation size={10} />
                Rota
              </button>
              <button 
                onClick={() => onOpenMaps(place.location.lat, place.location.lng)}
                className="flex-grow border border-orange-500 text-orange-500 text-[10px] font-black uppercase tracking-widest py-1.5 rounded-lg flex items-center justify-center gap-1"
              >
                <ExternalLink size={10} />
                Maps
              </button>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const EmergencySection = () => {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(SEARCH_CATEGORIES[0].id);
  const [searchQuery, setSearchQuery] = useState(SEARCH_CATEGORIES[0].query);
  const [localNumbers, setLocalNumbers] = useState<{ id: string, label: string, number: string, category: string }[]>([]);

  const placesLib = useMapsLibrary('places');

  // Fetch City Specific Numbers
  useEffect(() => {
    const q = query(
      collection(db, 'emergency_numbers'),
      orderBy('label', 'asc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setLocalNumbers(items);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to São Paulo if blocked
          setUserLocation({ lat: -23.5505, lng: -46.6333 });
        }
      );
    }
  }, []);

  const searchPlaces = useCallback(async () => {
    if (!placesLib || !userLocation) return;
    setLoadingPlaces(true);

    try {
      // Use searchByText as per skill guidelines
      const { places: results } = await placesLib.Place.searchByText({
        textQuery: searchQuery,
        fields: ['id', 'displayName', 'formattedAddress', 'location', 'rating', 'regularOpeningHours'],
        locationBias: {
          lat: userLocation.lat,
          lng: userLocation.lng,
        },
        maxResultCount: 10,
      });

      const formattedResults: PlaceResult[] = (results || []).map(p => ({
        id: p.id!,
        displayName: (p as any).displayName || '',
        formattedAddress: p.formattedAddress || '',
        location: p.location!.toJSON(),
        rating: p.rating,
        openNow: (p as any).regularOpeningHours?.openNow
      }));

      setPlaces(formattedResults);
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setLoadingPlaces(false);
    }
  }, [placesLib, userLocation, searchQuery]);

  useEffect(() => {
    searchPlaces();
  }, [searchPlaces]);

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const openInGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const openRoute = (destination: string) => {
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${encodeURIComponent(destination)}&travelmode=driving`, '_blank');
  };

  if (!hasValidKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#070b13] rounded-[48px] border border-white/5 mx-4 my-8">
        <div className="w-20 h-20 bg-orange-500/10 rounded-[32px] flex items-center justify-center mb-6">
          <AlertCircle size={40} className="text-orange-500" />
        </div>
        <h2 className="text-white font-black uppercase italic tracking-tighter text-xl mb-4">API Key Necessária</h2>
        <p className="text-gray-500 text-sm max-w-md mb-8">
          Para utilizar o mapa de emergência e localizar hospitais próximos, você precisa configurar sua chave do Google Maps.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left w-full max-w-lg space-y-4">
          <p className="text-white text-sm font-bold">Instruções de configuração:</p>
          <ol className="text-gray-400 text-xs space-y-3 list-decimal pl-4">
            <li>Obtenha uma chave em: <a href="https://console.cloud.google.com/google/maps-apis/start" target="_blank" className="text-orange-500 underline">Google Cloud Console</a></li>
            <li>No AI Studio, vá em <strong>Settings</strong> (ícone de engrenagem) → <strong>Secrets</strong></li>
            <li>Adicione <code>GOOGLE_MAPS_PLATFORM_KEY</code> e cole sua chave.</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-8 max-w-7xl mx-auto w-full space-y-12 mb-32">
      {/* Header & Warning */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic leading-none flex items-center gap-4">
             <span className="text-red-600 animate-pulse">●</span> SOS <span className="text-orange-500">Emergência</span>
          </h2>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-3">
            Central de atendimento rápido e utilidade pública
          </p>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-3xl flex items-start gap-4">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-500 text-xs font-black uppercase tracking-widest leading-relaxed">
            AVISO: Em caso de risco imediato à vida ou segurança, ligue diretamente para o número oficial de emergência.
          </p>
        </div>
      </div>

      {/* Emergency Quick Dial */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(() => {
          const uniqueNumbers = Array.from(new Map(EMERGENCY_NUMBERS.map(item => [item.number, item])).values()) as EmergencyNumber[];
          debugDuplicateKeys(uniqueNumbers, (item) => item.number, "Números Emergência Fixos");
          return uniqueNumbers.map((item, idx) => (
            <motion.button
              key={item.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleCall(item.number)}
              className="group relative bg-[#121826] border border-white/5 rounded-[32px] p-6 hover:border-red-500/50 transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
            >
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-xl shadow-black/40`}>
                <item.icon size={24} className="text-white" />
              </div>
              <h3 className="text-white font-black uppercase tracking-tighter text-xl leading-none mb-1">{item.number}</h3>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{item.label}</span>
              <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ));
        })()}
      </div>

      {/* Local City Numbers Section */}
      {localNumbers.length > 0 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Contatos Locais</h3>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2 italic">Números úteis da sua cidade</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              const uniqueLocal = Array.from(new Map(localNumbers.map(item => [item.id, item])).values()) as any[];
              debugDuplicateKeys(uniqueLocal, (item) => item.id, "Números Emergência Locais");
              return uniqueLocal.map(item => (
                <div key={item.id} className="bg-[#121826] border border-white/5 rounded-3xl p-5 flex items-center justify-between group hover:border-orange-500/30 transition-all">
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">{item.label}</h4>
                    <p className="text-orange-500 font-black text-xs tracking-widest">{item.number}</p>
                  </div>
                  <button 
                    onClick={() => handleCall(item.number)}
                    className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-lg"
                  >
                    <Phone size={18} />
                  </button>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Map Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Locais de Apoio</h3>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2 italic">Encontre ajuda especializada perto de você</p>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
            {SEARCH_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setSearchQuery(cat.query); }}
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                }`}
              >
                <cat.icon size={14} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2 h-[400px] sm:h-[500px] rounded-[48px] overflow-hidden border border-white/5 relative bg-white/5">
            {!userLocation ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <Spinner size={32} className="text-orange-500" />
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Buscando localização...</span>
              </div>
            ) : (
              <APIProvider apiKey={API_KEY} version="weekly">
                <Map
                  defaultCenter={userLocation}
                  defaultZoom={13}
                  mapId="FACILITA_EMERGENCIA_MAP"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  className="w-full h-full"
                  gestureHandling={'greedy'}
                  disableDefaultUI={true}
                >
                  <MapHandler center={userLocation} onCenterChange={() => {}} />
                  
                  {/* User Location */}
                  <AdvancedMarker position={userLocation} title="Você está aqui">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
                      <div className="relative w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                  </AdvancedMarker>

                  {(() => {
                    const uniqueMarkers = Array.from(new Map(places.map(p => [p.id, p])).values()) as PlaceResult[];
                    debugDuplicateKeys(uniqueMarkers, (p) => p.id, "Markers Mapa Emergência");
                    return uniqueMarkers.map((place, idx) => (
                      <MarkerWithInfoWindow 
                        key={place.id} 
                        place={place} 
                        onOpenRota={openRoute}
                        onOpenMaps={openInGoogleMaps}
                      />
                    ));
                  })()}
                </Map>
              </APIProvider>
            )}
          </div>

          {/* Places List */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {loadingPlaces ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`emergency-skeleton-v16-${i}`} className="bg-white/5 p-4 rounded-3xl border border-white/5 animate-pulse h-24" />
              ))
            ) : places.length === 0 ? (
              <div className="text-center py-12 bg-white/2 rounded-3xl border border-dashed border-white/5">
                <Search size={24} className="mx-auto text-gray-700 mb-2" />
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">Nenhum local encontrado nesta área.</p>
              </div>
            ) : (
              (() => {
                const uniqueResults = Array.from(new Map(places.map(p => [p.id, p])).values()) as PlaceResult[];
                debugDuplicateKeys(uniqueResults, (p) => p.id, "Lista Resultados Emergência");
                return uniqueResults.map((place, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={place.id}
                    className="group bg-[#121826] border border-white/5 rounded-[32px] p-5 hover:border-orange-500/30 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h4 className="text-white font-bold text-sm leading-tight group-hover:text-orange-500 transition-colors">{place.displayName}</h4>
                      {place.openNow !== undefined && (
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${place.openNow ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {place.openNow ? 'Aberto' : 'Fechado'}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-[10px] mb-4 line-clamp-1 italic">{place.formattedAddress}</p>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openRoute(place.formattedAddress)}
                        className="flex-grow bg-white/5 hover:bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Navigation size={12} />
                        Ver Rota
                      </button>
                      <button 
                        onClick={() => openInGoogleMaps(place.location.lat, place.location.lng)}
                        className="flex-grow bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[9px] font-black uppercase tracking-widest py-2 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={12} />
                        Google Maps
                      </button>
                    </div>
                  </motion.div>
                ));
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Spinner = ({ size = 20, className = "" }) => (
  <div 
    className={`border-2 border-current border-t-transparent rounded-full animate-spin ${className}`} 
    style={{ width: size, height: size }}
  />
);
