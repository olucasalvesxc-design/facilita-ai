import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, 
  MapPin, 
  Star, 
  Navigation, 
  ShieldCheck,
  Send,
  MessageCircle,
  X,
  User,
  Info,
  Zap,
  Target,
  Maximize,
  LocateFixed,
  Map as MapIcon,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Professional } from '../types';
import { renderToStaticMarkup } from 'react-dom/server';
import { calculateDistance } from '../lib/utils';
import { debugDuplicateKeys } from '../lib/firebase';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const orangeIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="bg-orange-500 p-2 rounded-lg shadow-lg border-2 border-white flex items-center justify-center">
      <MapPin size={16} className="text-white fill-white" />
    </div>
  ),
  className: 'custom-div-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const targetIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping scale-150" />
      <div className="bg-black/80 p-2.5 rounded-full shadow-2xl border-2 border-orange-500 flex items-center justify-center relative z-10">
        <Target size={20} className="text-orange-500" />
      </div>
    </div>
  ),
  className: 'custom-div-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface MapSearchProps {
  searchTerm: string;
  professionals: Professional[];
  onSelectPro: (pro: Professional) => void;
}

const BoundsHandler: React.FC<{ professionals: Professional[] }> = ({ professionals }) => {
  const map = useMap();
  useEffect(() => {
    if (professionals.length > 0) {
      const coords = professionals
        .filter(p => p.coordinates)
        .map(p => [p.coordinates!.lat, p.coordinates!.lng] as [number, number]);
      if (coords.length > 0) {
        // Only fit bounds if we have many pros and haven't manually moved much
        // map.fitBounds(L.latLngBounds(coords), { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [professionals, map]);
  return null;
};

const MapEvents: React.FC<{ 
  onMapClick: (lat: number, lng: number) => void,
  searchCenter: [number, number] | null,
  onMapMove: (lat: number, lng: number) => void
}> = ({ onMapClick, searchCenter, onMapMove }) => {
  const map = useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
    moveend() {
      const center = map.getCenter();
      onMapMove(center.lat, center.lng);
    }
  });

  useEffect(() => {
    if (searchCenter) {
      map.panTo(searchCenter, { animate: true });
    }
  }, [searchCenter, map]);

  return null;
};

export const MapSearch: React.FC<MapSearchProps> = ({ searchTerm, professionals, onSelectPro }) => {
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);
  const [searchRadius, setSearchRadius] = useState(15); // km
  const [sosMode, setSosMode] = useState(false);
  const [isManualLocationMode, setIsManualLocationMode] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [mapCurrentCenter, setMapCurrentCenter] = useState<[number, number] | null>(null);

  const showSearchHereButton = useMemo(() => {
    if (!mapCurrentCenter || !searchCenter) return false;
    const dist = calculateDistance(mapCurrentCenter[0], mapCurrentCenter[1], searchCenter[0], searchCenter[1]);
    return dist > 1; // Show if moved more than 1km
  }, [mapCurrentCenter, searchCenter]);

  const filteredPros = professionals.filter(pro => {
    // SOS Mode Filter: Only online and highly rated
    if (sosMode && pro.status !== 'online') return false;

    // Filter by Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesText = (
        pro.name.toLowerCase().includes(term) ||
        pro.category.toLowerCase().includes(term) ||
        pro.description?.toLowerCase().includes(term) ||
        pro.skills?.some(s => s.toLowerCase().includes(term))
      );
      if (!matchesText) return false;
    }

    // Filter by Area/Distance
    const center = searchCenter || userLocation;
    if (center && pro.coordinates) {
      const dist = calculateDistance(center[0], center[1], pro.coordinates.lat, pro.coordinates.lng);
      if (dist > searchRadius) return false;
    }

    return true;
  });

  const updateLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          if (!searchCenter || !isManualLocationMode) {
            setSearchCenter(loc);
          }
        },
        (error) => console.error("Erro ao obter localização:", error),
        { enableHighAccuracy: true }
      );
    }
  }, [searchCenter, isManualLocationMode]);

  useEffect(() => {
    updateLocation();
  }, []);

  const handleSearchLocation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!locationInput.trim()) return;

    setIsSearchingLocation(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}`);
      const data = await response.json();
      setLocationResults(data);
    } catch (error) {
      console.error("Erro ao buscar localidade:", error);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const selectLocationResult = (result: any) => {
    const loc: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)];
    setSearchCenter(loc);
    setIsManualLocationMode(true);
    setLocationResults([]);
    setLocationInput(result.display_name);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Search Header Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="flex-grow max-w-xl relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MapPin size={18} className="text-orange-500" />
            </div>
            <form onSubmit={handleSearchLocation}>
              <input 
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Onde você busca o serviço? (Ex: Bairro, Cidade...)"
                className="w-full bg-[#121826] border border-white/5 rounded-2xl py-4 pl-12 pr-16 text-white text-sm shadow-xl focus:border-orange-500/30 outline-none transition-all placeholder:text-gray-700 font-medium"
              />
              <button 
                type="submit"
                disabled={isSearchingLocation}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white hover:bg-orange-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isSearchingLocation ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search size={18} />
                )}
              </button>
            </form>

            <AnimatePresence>
              {locationResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#070b13] border border-white/10 rounded-2xl shadow-2xl z-[2000] overflow-hidden backdrop-blur-3xl"
                >
                  <div className="max-h-64 overflow-y-auto no-scrollbar">
                    {(() => {
                      const uniqueLocs = Array.from(new Map(locationResults.map((res: any, i) => [res.place_id || `${res.display_name}-${i}`, res])).values()) as any[];
                      debugDuplicateKeys(uniqueLocs, (res: any) => res.place_id || `${res.display_name}-${res.osm_id}`, "Resultados Localidade Mapa");
                      return uniqueLocs.map((res, i) => (
                        <button 
                          key={res.place_id || `loc-res-${i}`}
                          onClick={() => selectLocationResult(res)}
                          className="w-full p-4 text-left border-b border-white/5 hover:bg-white/5 transition-colors flex items-start gap-4"
                        >
                          <MapPin size={16} className="text-gray-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white text-xs font-bold leading-tight">{res.display_name}</p>
                            <p className="text-gray-600 text-[10px] mt-1 font-medium">{res.type}</p>
                          </div>
                        </button>
                      ));
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1 pr-4 border-r border-white/5">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 ml-1">Raio de Busca</span>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={searchRadius} 
                  onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                  className="w-32 lg:w-48 appearance-none bg-white/5 h-1.5 rounded-full outline-none focus:ring-0 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg active:[&::-webkit-slider-thumb]:scale-125 transition-all"
                />
                <span className="text-orange-500 font-black text-xs min-w-[40px]">{searchRadius}km</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setSosMode(!sosMode);
              }}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all ${sosMode ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}
            >
              <Zap size={16} className={sosMode ? 'fill-white' : ''} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Modo SOS</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px] min-h-[600px]">
        <div className="space-y-4 overflow-y-auto pr-2 no-scrollbar">
          {/* Header info */}
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                {filteredPros.length} Profissionais na área
              </span>
            </div>
            {isManualLocationMode && (
              <button 
                onClick={() => {
                  setIsManualLocationMode(false);
                  updateLocation();
                  setLocationInput('');
                }}
                className="text-[10px] font-black uppercase text-orange-500 hover:underline"
              >
                Usar minha localização
              </button>
            )}
          </div>

          {filteredPros.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 bg-[#121826] border border-white/5 rounded-3xl text-center p-8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-700 mb-2">
                <Search size={32} />
              </div>
              <p className="text-white font-bold uppercase tracking-tighter">Nenhum profissional na área</p>
              <p className="text-gray-500 text-xs font-medium">Aumente o raio de busca ou mude a localidade no mapa.</p>
            </div>
          ) : (
            (() => {
              const uniqueProsMapSide = Array.from(new Map(filteredPros.map(p => [p.id, p])).values()) as Professional[];
              debugDuplicateKeys(uniqueProsMapSide, (p) => p.id, "Lista de Profissionais Mapa Side");
              return uniqueProsMapSide.map((pro, index) => {
                const distance = (searchCenter && pro.coordinates) 
                  ? calculateDistance(searchCenter[0], searchCenter[1], pro.coordinates.lat, pro.coordinates.lng)
                  : null;

                return (
                  <motion.div
                    key={pro.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      setSelectedPro(pro);
                      if (pro.coordinates) {
                        // Pan directly to pro if not too far from center
                        // setSearchCenter([pro.coordinates.lat, pro.coordinates.lng]);
                      }
                    }}
                    className={`group p-5 bg-[#121826] border rounded-3xl cursor-pointer transition-all hover:shadow-2xl hover:shadow-orange-500/10 ${selectedPro?.id === pro.id ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-white/5'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-4">
                        <div className="relative">
                          <img src={pro.photoURL} className="w-12 h-12 rounded-xl object-cover border border-white/10" referrerPolicy="no-referrer" />
                          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#121826] ${pro.status === 'online' ? 'bg-green-500' : 'bg-gray-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] bg-orange-500/10 text-orange-500 font-black uppercase tracking-widest px-2 py-1 rounded-md">Profissional</span>
                            {pro.isVerified && <ShieldCheck size={14} className="text-blue-500" />}
                          </div>
                          <h3 className="text-white font-black uppercase italic tracking-tighter leading-tight">{pro.name}</h3>
                          <div className="flex items-center gap-2">
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{pro.category}</p>
                            {distance !== null && (
                              <span className="text-orange-500 text-[10px] font-black italic">
                                • {distance.toFixed(1)} km
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                          <Star size={12} className="text-orange-500 fill-orange-500" />
                          <span className="text-white font-black text-xs">{pro.rating || '5.0'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPro(pro);
                        }}
                        className="flex-grow flex items-center justify-center gap-2 bg-white/5 hover:bg-orange-500/20 border border-white/5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all shadow-md active:scale-95"
                      >
                        <User size={12} className="text-orange-500" />
                        Perfil
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (pro.whatsapp) {
                            const number = pro.whatsapp.replace(/\D/g, '');
                            window.open(`https://wa.me/${number}`, '_blank');
                          }
                        }}
                        className="flex-grow flex items-center justify-center gap-2 bg-white/5 hover:bg-orange-500/20 border border-white/5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all shadow-md active:scale-95"
                      >
                        <MessageCircle size={12} className="text-orange-500" />
                        WhatsApp
                      </button>
                    </div>
                  </motion.div>
                );
              });
            })()
          )}
        </div>

        <div className="rounded-[40px] overflow-hidden border border-white/10 relative shadow-2xl bg-black z-0">
          <MapContainer 
            center={[-23.5505, -46.6333]} 
            zoom={12} 
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapEvents 
              searchCenter={searchCenter} 
              onMapMove={(lat, lng) => setMapCurrentCenter([lat, lng])}
              onMapClick={(lat, lng) => {
                setSearchCenter([lat, lng]);
                setIsManualLocationMode(true);
                setSelectedPro(null);
                setLocationInput(`Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                setMapCurrentCenter([lat, lng]);
              }} 
            />

            <BoundsHandler professionals={filteredPros} />
            
            {/* Search Radius Visualization */}
            {searchCenter && (
              <>
                <Circle 
                  center={searchCenter}
                  radius={searchRadius * 1000}
                  pathOptions={{
                    color: '#f97316',
                    fillColor: '#f97316',
                    fillOpacity: 0.1,
                    weight: 1,
                    dashArray: '5, 10'
                  }}
                />
                <Marker position={searchCenter} icon={targetIcon} />
              </>
            )}

            {/* Professionals Markers */}
            {(() => {
              const uniqueProsMarkers = Array.from(new Map(filteredPros.filter(p => p.coordinates).map(p => [p.id, p])).values()) as Professional[];
              debugDuplicateKeys(uniqueProsMarkers, (p) => p.id, "Markers Profissionais Mapa");
              return uniqueProsMarkers.map((pro, idx) => (
                <Marker 
                  key={pro.id || `marker-${idx}`} 
                  position={[pro.coordinates!.lat, pro.coordinates!.lng]}
                  icon={orangeIcon}
                  eventHandlers={{
                    click: () => setSelectedPro(pro),
                  }}
                />
              ));
            })()}

            {/* User Real Location Marker (if different from search center) */}
            {userLocation && (!searchCenter || searchCenter[0] !== userLocation[0] || searchCenter[1] !== userLocation[1]) && (
              <Marker position={userLocation} opacity={0.6}>
                <Popup>Sua localização real</Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Floating Instruction overlay */}
          <AnimatePresence>
            {showSearchHereButton && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]"
              >
                <button 
                  id="search-here-btn"
                  onClick={() => {
                    if (mapCurrentCenter) {
                      setSearchCenter(mapCurrentCenter);
                      setIsManualLocationMode(true);
                    }
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl shadow-orange-500/40 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  <RefreshCcw size={16} />
                  Buscar nesta área
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] px-4 pointer-events-none">
            <div className="bg-[#070b13]/80 backdrop-blur-3xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap">
                Toque no mapa para buscar em outra região
              </span>
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <button 
              onClick={() => {
                setIsManualLocationMode(false);
                updateLocation();
                setLocationInput('');
              }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-2xl backdrop-blur-xl group border ${!isManualLocationMode ? 'bg-orange-500 border-orange-500 text-white' : 'bg-[#070b13] border-white/10 text-gray-400 hover:text-orange-500'}`}
              title="Voltar para minha localização"
            >
              <LocateFixed size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
          
          <AnimatePresence>
            {selectedPro && (
              <motion.div 
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                className="absolute bottom-6 left-6 right-6 bg-[#070b13]/95 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[1000]"
              >
                <div className="flex justify-between items-start mb-6">
                   <div className="flex gap-5">
                      <img src={selectedPro.photoURL} className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-2xl" referrerPolicy="no-referrer" />
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1.5 ">
                          <span className="text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500 border border-orange-500/20">
                            Profissional Verificado
                          </span>
                        </div>
                        <h3 className="text-white font-black text-xl uppercase italic tracking-tighter leading-tight drop-shadow-sm">
                          {selectedPro.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-orange-500 text-[11px] font-black uppercase tracking-widest">{selectedPro.category}</p>
                          <div className="w-1 h-1 rounded-full bg-white/20" />
                          <p className="text-gray-500 text-[10px] font-bold mt-0.5 flex items-center gap-1.5">
                            <MapPin size={10} className="text-gray-600" />
                            {selectedPro.location}
                          </p>
                        </div>
                      </div>
                   </div>
                   <button 
                     onClick={() => setSelectedPro(null)}
                     className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white transition-all hover:bg-white/10"
                   >
                     <X size={20} />
                   </button>
                </div>

                {selectedPro.description && (
                  <p className="text-gray-400 text-xs font-medium leading-relaxed mb-6 line-clamp-2">
                    {selectedPro.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => onSelectPro(selectedPro)}
                    className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:border-orange-500/40 transition-all shadow-xl group"
                  >
                    <div className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                      <User size={16} />
                    </div>
                    Ver Perfil Completo
                  </button>
                  <button 
                    onClick={() => {
                      if (selectedPro.whatsapp) {
                        const number = selectedPro.whatsapp.replace(/\D/g, '');
                        window.open(`https://wa.me/${number}`, '_blank');
                      }
                    }}
                    className="flex items-center justify-center gap-3 bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-orange-500/20 group"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <MessageCircle size={16} />
                    </div>
                    Contatar Profissional
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

