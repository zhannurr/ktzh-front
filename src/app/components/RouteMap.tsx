import { MapContainer, TileLayer, Polyline, Marker, useMap, ZoomControl } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons in Vite/Webpack
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

interface RouteMapProps {
    stationList: string[];
    currentKm: number;
    totalKm: number;
    points: [number, number][];
}

// Helper to update map view ONLY when coordinates actually change
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1]]); // only re-center if the coordinates change
  
  return null;
}

export function RouteMap({ stationList, currentKm, totalKm, points }: RouteMapProps) {
  const progress = (currentKm / totalKm) * 100;
  
  if (!points || points.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-black/10 rounded-lg text-xs" style={{ color: 'var(--dash-text-muted)' }}>
        Нет данных о маршруте
      </div>
    );
  }

  // Calculate current marker position
  const currentIndex = Math.min(
    points.length - 1,
    Math.max(0, Math.floor(points.length * (progress / 100)))
  );
  const currentPos = points[currentIndex];

  return (
    <div className="flex flex-col gap-3 h-full">
      
      {/* 🗺️ КАРТА */}
      <div className="h-[200px] w-full rounded-lg overflow-hidden border shadow-inner" style={{ borderColor: 'var(--dash-border)', borderWidth: '0.5px' }}>
        <MapContainer
          center={points[0]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <ChangeView center={points[0]} zoom={5} />
          <ZoomControl position="bottomright" />
          
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* линия маршрута */}
          <Polyline 
            positions={points} 
            pathOptions={{ color: 'var(--dash-gold)', weight: 4, opacity: 0.8 }} 
          />

          {/* старт */}
          <Marker position={points[0]} />

          {/* конец */}
          <Marker position={points[points.length - 1]} />

          {/* текущая позиция */}
          <Marker position={currentPos} />
        </MapContainer>
      </div>

      {/* инфа снизу */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--dash-gold)' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--dash-gold)' }}>
            {currentKm} км
          </span>
        </div>
        <div className="text-xs" style={{ color: 'var(--dash-text-muted)' }}>
          •
        </div>
        <div className="text-xs font-medium" style={{ color: 'var(--dash-text-primary)' }}>
          {Math.round(progress)}% пути
        </div>
      </div>

      <div className="text-[11px] text-center font-medium opacity-80" style={{ color: 'var(--dash-text-secondary)' }}>
        {stationList[0]} <span className="mx-1 text-gold">→</span> {stationList[1]}
      </div>
    </div>
  );
}