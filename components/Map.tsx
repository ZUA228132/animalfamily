import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';

interface MapProps {
  markers?: { position: LatLngExpression; label: string }[];
}

/**
 * A simple map component using react‑leaflet. It accepts an array of markers
 * with positions and labels and renders them on an OpenStreetMap base layer.
 */
export default function Map({ markers = [] }: MapProps) {
  // Default center is Amsterdam
  const defaultCenter: LatLngExpression = [52.3676, 4.9041];
  return (
    <div className="map-container">
      <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker, idx) => (
          <Marker key={idx} position={marker.position}>
            <Popup>{marker.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}