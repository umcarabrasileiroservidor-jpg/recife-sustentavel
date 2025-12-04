import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getLixeiras } from '../../services/dataService';
import { Loader2 } from 'lucide-react';

// Ícones do Leaflet (Correção padrão)
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

export function HomeMap() {
  const [bins, setBins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLixeiras().then(data => {
      // Filtra lixeiras com coordenadas inválidas (0,0 ou null)
      const validBins = data.filter((b: any) => b.lat && b.lng && b.lat !== 0);
      setBins(validBins);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="h-48 flex items-center justify-center bg-gray-100 rounded-xl"><Loader2 className="animate-spin text-green-600" /></div>;

  // Centro do Recife (Derby)
  const RECIFE_CENTER: [number, number] = [-8.0522, -34.8956];

  return (
    <div className="w-full h-56 rounded-2xl overflow-hidden shadow-md border border-gray-200 relative z-0">
      <MapContainer 
        center={RECIFE_CENTER}
        zoom={13} 
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        
        {bins.map(bin => (
          <Marker key={bin.id} position={[Number(bin.lat), Number(bin.lng)]}>
            <Popup>
              <strong>{bin.location}</strong><br/>
              <span className="text-xs">{bin.types.join(', ')}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}