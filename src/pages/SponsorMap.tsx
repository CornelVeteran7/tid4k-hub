import { useAuth } from '@/contexts/AuthContext';
import { type VerticalType } from '@/config/verticalConfig';
import { DEMO_LOCATIONS, VERTICAL_MAP_LABELS } from '@/data/demoLocations';
import { MapPin, Phone, Building2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { DEMO_ENVIRONMENTS } from '@/config/demoEnvironments';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createColoredIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

export default function SponsorMap() {
  const { user } = useAuth();
  const verticalType = (user?.vertical_type || 'kids') as VerticalType;
  const locations = DEMO_LOCATIONS[verticalType] || [];
  const labels = VERTICAL_MAP_LABELS[verticalType];
  const env = DEMO_ENVIRONMENTS.find(e => e.key === verticalType);
  const markerColor = env?.primaryColor || '#1E3A4C';

  // Center map on average of locations
  const centerLat = locations.reduce((sum, l) => sum + l.lat, 0) / (locations.length || 1);
  const centerLng = locations.reduce((sum, l) => sum + l.lng, 0) / (locations.length || 1);

  const icon = createColoredIcon(markerColor);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          {labels.title}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{labels.subtitle}</p>
      </motion.div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-2xl overflow-hidden border border-white/30 shadow-lg"
        style={{
          background: 'rgba(255,255,255,0.45)',
          backdropFilter: 'blur(24px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), 0 8px 32px rgba(0,0,0,0.08)',
        }}
      >
        <div className="h-[400px] lg:h-[500px] rounded-2xl overflow-hidden" style={{ position: 'relative', zIndex: 0 }}>
          {locations.length > 0 ? (
          <MapContainer
            key={`${centerLat}-${centerLng}`}
            center={[centerLat, centerLng]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map(loc => (
              <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={icon}>
                <Popup>
                  <div className="text-sm min-w-[180px]">
                    <p className="font-bold text-foreground">{loc.name}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{loc.type}</p>
                    <p className="text-xs mt-1">{loc.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">{loc.description}</p>
                    {loc.phone && <p className="text-xs mt-1 font-medium">📞 {loc.phone}</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p className="text-sm">Nu sunt locații disponibile</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Location cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc, i) => (
          <motion.div
            key={loc.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.2 + i * 0.05 }}
            className="rounded-xl overflow-hidden border border-white/30 shadow-md p-4"
            style={{
              background: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(20px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), 0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: markerColor + '20' }}
              >
                <Building2 className="h-5 w-5" style={{ color: markerColor }} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground truncate">{loc.name}</h3>
                <p className="text-xs text-muted-foreground">{loc.type}</p>
                <p className="text-xs text-foreground/70 mt-1">{loc.address}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{loc.description}</p>
                {loc.phone && (
                  <p className="text-xs mt-1.5 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{loc.phone}</span>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
