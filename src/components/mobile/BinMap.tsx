import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Navigation, MapPin, Locate, Maximize2, Minimize2, Recycle } from 'lucide-react';
import { motion } from 'motion/react';

// --- Configuração dos Ícones ---
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Força o TS a aceitar as imagens como string
const DefaultIcon = L.icon({
    iconUrl: iconMarker as unknown as string,
    iconRetinaUrl: iconRetina as unknown as string,
    shadowUrl: iconShadow as unknown as string,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const UserIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `<div style="background-color: #2563eb; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// --- Função de Distância (Haversine) ---
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*(Math.PI/180)) * Math.cos(lat2*(Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  if (d < 1) return `${(d * 1000).toFixed(0)} m`;
  return `${d.toFixed(1)} km`;
}

// --- Controlador do Mapa ---
function MapController({ lat, lng, zoom = 15 }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
      map.setView([lat, lng], zoom);
    }, 200);
  }, [lat, lng, zoom, map]);
  return null;
}

// --- Dados dos Ecopontos ---
const binSets = [
  { id: 1, location: 'Praça do Derby', types: ['Plástico', 'Metal', 'Papel'], lat: -8.0522, lng: -34.8956 },
  { id: 2, location: 'Parque da Jaqueira', types: ['Orgânico', 'Metal'], lat: -8.0389, lng: -34.8989 },
  { id: 3, location: 'Shopping Recife', types: ['Eletrônico', 'Pilhas'], lat: -8.1194, lng: -34.9050 },
  { id: 4, location: 'Boa Viagem (Posto 7)', types: ['Plástico', 'Vidro'], lat: -8.1277, lng: -34.8948 },
  { id: 5, location: 'Casa Forte', types: ['Orgânico', 'Seco'], lat: -8.0265, lng: -34.9264 },
];

const typeColors: Record<string, string> = {
  'Plástico': 'bg-red-100 text-red-700 border-red-200',
  'Metal': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Papel': 'bg-blue-100 text-blue-700 border-blue-200',
  'Vidro': 'bg-green-100 text-green-700 border-green-200',
  'Orgânico': 'bg-amber-100 text-amber-800 border-amber-200',
  'Eletrônico': 'bg-purple-100 text-purple-700 border-purple-200',
};

export function BinMap() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedBinId, setSelectedBinId] = useState<number | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Padrão: Recife Antigo
  const defaultLocation = { lat: -8.0631, lng: -34.8711 }; 
  const currentLocation = userLocation || defaultLocation;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("GPS Error:", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Calcula distância
  const binsWithDistance = binSets.map(bin => ({
    ...bin,
    distance: calculateDistance(currentLocation.lat, currentLocation.lng, bin.lat, bin.lng)
  })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  const mapCenter = selectedBinId 
    ? binSets.find(b => b.id === selectedBinId) || currentLocation
    : currentLocation;

  return (
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      
      {/* --- MAPA --- */}
      <motion.div 
        layout
        className={`relative w-full transition-all duration-500 ease-in-out ${
          isMapExpanded ? 'h-screen absolute inset-0 z-50' : 'h-[45vh] z-0'
        }`}
      >
        <MapContainer 
          center={[defaultLocation.lat, defaultLocation.lng]} 
          zoom={14} 
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='© CARTO'
          />
          
          {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon} />}
          
          {binSets.map(bin => (
            <Marker 
              key={bin.id} 
              position={[bin.lat, bin.lng]} 
              // CORREÇÃO AQUI: Removido o tipo explícito (e: ...)
              eventHandlers={{ 
                click: () => setSelectedBinId(bin.id) 
              }}
            >
              <Popup>
                <strong>{bin.location}</strong>
                <p className="text-xs m-0">Toque em "Ir" na lista</p>
              </Popup>
            </Marker>
          ))}

          <MapController lat={mapCenter.lat} lng={mapCenter.lng as number} zoom={isMapExpanded ? 16 : 14} />
        </MapContainer>

        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
          <Button size="icon" className="bg-white text-black shadow-lg hover:bg-gray-100" onClick={() => setIsMapExpanded(!isMapExpanded)}>
            {isMapExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
          {userLocation && (
            <Button size="icon" className="bg-white text-blue-600 shadow-lg hover:bg-gray-100" onClick={() => setSelectedBinId(null)}>
              <Locate className="w-5 h-5" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* --- LISTA --- */}
      {!isMapExpanded && (
        <div className="flex-1 bg-background rounded-t-3xl -mt-6 relative z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] flex flex-col">
          
          <div className="w-full flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-muted rounded-full" />
          </div>

          <div className="px-6 pb-2 flex justify-between items-center border-b border-border/50">
            <div>
              <h2 className="font-bold text-lg text-primary">Ecopontos</h2>
              <p className="text-xs text-muted-foreground">Ordenado por proximidade</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Recycle className="w-3 h-3" /> {binSets.length}
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
            {binsWithDistance.map((bin) => (
              <Card 
                key={bin.id} 
                onClick={() => setSelectedBinId(bin.id)}
                className={`cursor-pointer transition-all border-l-4 shadow-sm hover:shadow-md ${
                  selectedBinId === bin.id 
                    ? 'border-l-primary bg-primary/5 ring-1 ring-primary/20' 
                    : 'border-l-transparent'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{bin.location}</h3>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {bin.types.map(t => (
                            <Badge key={t} variant="outline" className={`text-[10px] px-1.5 py-0 border-0 ${typeColors[t] || 'bg-gray-100'}`}>
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {bin.distance}
                      </Badge>
                      {selectedBinId === bin.id && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <Button 
                            size="sm" 
                            className="h-7 text-xs bg-primary hover:bg-primary/90"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${bin.lat},${bin.lng}`, '_blank');
                            }}
                          >
                            <Navigation className="w-3 h-3 mr-1" /> Ir
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}