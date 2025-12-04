import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Navigation, Locate, MapPin } from 'lucide-react';
import { getLixeiras } from '../../services/dataService';

import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: iconMarker as unknown as string,
    iconRetinaUrl: iconRetina as unknown as string,
    shadowUrl: iconShadow as unknown as string,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapController({ lat, lng, zoom = 15 }: any) {
  const map = useMap();
  useEffect(() => { 
    if (lat && lng) {
        map.setView([lat, lng], zoom); 
        setTimeout(() => map.invalidateSize(), 100);
    }
  }, [lat, lng, zoom]);
  return null;
}

export function BinMap() {
  const [bins, setBins] = useState<any[]>([]);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number}>({ lat: -8.0522, lng: -34.8956 });

  useEffect(() => {
    getLixeiras().then(setBins);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
    }
  }, []);

  const selectedBin = bins.find(b => b.id === selectedBinId);
  const mapCenter = selectedBin ? { lat: Number(selectedBin.lat), lng: Number(selectedBin.lng) } : userLocation;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Metade Superior: Mapa */}
      <div className="h-[45%] relative w-full bg-gray-100 z-0">
        <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={14} zoomControl={false} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <Marker position={[userLocation.lat, userLocation.lng]}><Popup>Você</Popup></Marker>
          {bins.map(bin => (
            <Marker key={bin.id} position={[Number(bin.lat), Number(bin.lng)]} eventHandlers={{ click: () => setSelectedBinId(bin.id) }} />
          ))}
          <MapController lat={mapCenter.lat} lng={mapCenter.lng} zoom={15} />
        </MapContainer>
        
        <div className="absolute top-4 right-4 z-[500]">
            <Button size="icon" className="bg-white text-blue-600 shadow-md rounded-full" onClick={() => setSelectedBinId(null)}><Locate className="w-5 h-5"/></Button>
        </div>
      </div>
      
      {/* Metade Inferior: Lista (Com scroll independente) */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-6 relative z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden">
        <div className="p-4 border-b shrink-0">
            <h2 className="font-bold text-lg text-gray-800">Ecopontos ({bins.length})</h2>
            <p className="text-xs text-gray-500">Toque para localizar no mapa</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
          {bins.map(bin => (
            <Card key={bin.id} onClick={() => setSelectedBinId(bin.id)} className={`cursor-pointer border transition-all ${selectedBinId === bin.id ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-100 hover:bg-gray-50'}`}>
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex gap-3 items-center overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><MapPin className="w-5 h-5"/></div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate text-gray-800">{bin.location}</h3>
                    <div className="flex gap-1 mt-1 flex-wrap">
                        {bin.types.slice(0, 2).map((t:string) => <Badge key={t} variant="secondary" className="text-[10px] px-1.5 h-5 bg-gray-100 text-gray-600">{t}</Badge>)}
                    </div>
                  </div>
                </div>
                {selectedBinId === bin.id && (
                    <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white rounded-full px-3 ml-2" onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${bin.lat},${bin.lng}`); }}>
                        <Navigation className="w-3 h-3 mr-1" /> Ir
                    </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}