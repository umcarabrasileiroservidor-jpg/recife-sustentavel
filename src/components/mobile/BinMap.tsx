import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Navigation, Locate, Maximize2, Minimize2, Recycle, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { getLixeiras } from '../../services/dataService';

// ... (Mantenha seus imports de ícones aqui: iconMarker, iconRetina, iconShadow) ...
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({ iconUrl: iconMarker as unknown as string, iconRetinaUrl: iconRetina as unknown as string, shadowUrl: iconShadow as unknown as string, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
L.Marker.prototype.options.icon = DefaultIcon;

function MapController({ lat, lng, zoom = 15 }: any) {
  const map = useMap();
  useEffect(() => { setTimeout(() => { map.invalidateSize(); map.setView([lat, lng], zoom); }, 500); }, [lat, lng, zoom]);
  return null;
}

export function BinMap() {
  const [bins, setBins] = useState<any[]>([]);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number}>({ lat: -8.0522, lng: -34.8956 }); // Derby default
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    getLixeiras().then(setBins);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
    }
  }, []);

  const mapCenter = selectedBinId ? bins.find(b => b.id === selectedBinId) || userLocation : userLocation;

  return (
    <div className="h-screen flex flex-col bg-background">
      <motion.div layout className={`relative w-full transition-all duration-500 ${isExpanded ? 'h-screen z-50 absolute' : 'h-[45vh]'}`}>
        <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={14} zoomControl={false} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='© CARTO' />
          <Marker position={[userLocation.lat, userLocation.lng]}><Popup>Você</Popup></Marker>
          {bins.map(bin => (
            <Marker key={bin.id} position={[bin.lat, bin.lng]} eventHandlers={{ click: () => setSelectedBinId(bin.id) }}>
              <Popup><strong>{bin.location}</strong></Popup>
            </Marker>
          ))}
          <MapController lat={mapCenter.lat} lng={mapCenter.lng} zoom={15} />
        </MapContainer>
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
            <Button size="icon" className="bg-white text-black" onClick={() => setIsExpanded(!isExpanded)}><Maximize2 className="w-5 h-5"/></Button>
            <Button size="icon" className="bg-white text-blue-600" onClick={() => setSelectedBinId(null)}><Locate className="w-5 h-5"/></Button>
        </div>
      </motion.div>
      
      {!isExpanded && (
        <div className="flex-1 bg-background -mt-6 rounded-t-3xl relative z-10 shadow-lg flex flex-col">
          <div className="p-4 border-b"><h2 className="font-bold text-lg">Ecopontos ({bins.length})</h2></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
            {bins.map(bin => (
              <Card key={bin.id} onClick={() => setSelectedBinId(bin.id)} className={`cursor-pointer ${selectedBinId === bin.id ? 'border-l-4 border-l-primary' : ''}`}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><MapPin className="w-5 h-5"/></div>
                    <div><h3 className="font-bold text-sm">{bin.location}</h3><div className="flex gap-1 mt-1">{bin.types.map((t:string) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div></div>
                  </div>
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); window.open(`https://maps.google.com/?q=${bin.lat},${bin.lng}`) }}>Ir</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}