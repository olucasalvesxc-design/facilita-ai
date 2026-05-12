import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Professional } from '../types';
import { Star, MapPin, Hammer, Clock } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Custom Marker Icon (Hammer in Orange Box)
const hammerIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="bg-orange-500 p-2 rounded-lg shadow-lg border-2 border-white transform -rotate-12 flex items-center justify-center">
      <Hammer size={16} className="text-white fill-white" />
    </div>
  ),
  className: 'custom-div-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Component to handle map bounds
const BoundsHandler: React.FC<{ professionals: Professional[] }> = ({ professionals }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (professionals.length > 0) {
      const coords = professionals
        .filter(p => p.coordinates)
        .map(p => [p.coordinates!.lat, p.coordinates!.lng] as [number, number]);
      
      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [professionals, map]);

  return null;
};

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapComponentProps {
  professionals: Professional[];
  onSelectPro: (pro: Professional) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({ professionals, onSelectPro }) => {
  const defaultCenter: [number, number] = [-23.5505, -46.6333]; // São Paulo center
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Custom Marker Icon (Hammer in Orange Box)
  const hammerIcon = React.useMemo(() => {
    if (typeof L === 'undefined') return null;
    return L.divIcon({
      html: renderToStaticMarkup(
        <div className="bg-orange-500 p-2 rounded-lg shadow-lg border-2 border-white transform -rotate-12 flex items-center justify-center">
          <Hammer size={16} className="text-white fill-white" />
        </div>
      ),
      className: 'custom-div-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  }, []);

  if (!hammerIcon) return <div className="h-[450px] w-full bg-white/5 animate-pulse rounded-[32px]" />;

  return (
    <div className="h-[450px] md:h-[600px] w-full rounded-[32px] overflow-hidden border border-white/5 shadow-2xl relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={isMobile ? 11 : 12} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsHandler professionals={professionals} />
        {(() => {
          const uniqueProsMap = Array.from(new Map(professionals.filter(p => p.coordinates).map(p => [p.id, p])).values()) as Professional[];
          return uniqueProsMap.map((pro) => (
            <Marker 
              key={pro.id} 
              position={[pro.coordinates!.lat, pro.coordinates!.lng]}
              icon={hammerIcon}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="flex gap-3 mb-3">
                    <img 
                      src={pro.photoURL || undefined} 
                      alt={pro.name} 
                      className="w-12 h-12 rounded-xl object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm leading-tight">{pro.name}</h4>
                      <p className="text-orange-600 text-[10px] font-bold uppercase">{pro.category}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-bold text-gray-600">{pro.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 border-t border-gray-100 pt-3 mb-3">
                    <div className="text-[10px] text-gray-500 font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1"><MapPin size={10} /> Distância:</span>
                      <span className="text-gray-900 font-bold">{pro.distance ? `${pro.distance} km` : '...'}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1"><Clock size={10} /> Resposta:</span>
                      <span className="text-gray-900 font-bold">{pro.responseTime || 'Rápida'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <button 
                      onClick={() => onSelectPro(pro)}
                      className="w-full bg-orange-500 text-white text-[10px] font-bold px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                    >
                      Ver Perfil Completo
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ));
        })()}
      </MapContainer>
    </div>
  );
};
