import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';

interface MapProps {
  /**
   * Optional array of markers to display.  Each marker must provide a
   * position (latitude and longitude) and a label for its popup.
   */
  markers?: { position: LatLngExpression; label: string }[];
  /**
   * Optional initial map centre.  If omitted, the map defaults to
   * Amsterdam coordinates.
   */
  center?: [number, number];
  /**
   * Optional initial zoom level.
   */
  zoom?: number;
}

/**
 * A simple map component using react‑leaflet. It accepts an array of markers
 * with positions and labels and renders them on an OpenStreetMap base layer.
 */
export default function Map({ markers = [], center, zoom }: MapProps) {
  // Default centre is Amsterdam if none provided
  const defaultCenter: LatLngExpression = [52.3676, 4.9041];
  const mapCenter: LatLngExpression = center ?? defaultCenter;
  const mapZoom = zoom ?? 12;
  return (
    <div className="map-container">
      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
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