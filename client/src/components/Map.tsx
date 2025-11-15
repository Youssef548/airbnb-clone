import React, { useState, useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet.fullscreen";
import "leaflet.fullscreen/Control.FullScreen.css";

import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default marker icon issue in webpack/vite
const DefaultIcon = L.Icon.Default.prototype as typeof L.Icon.Default.prototype & {
  _getIconUrl?: () => string;
};

delete DefaultIcon._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Component to add fullscreen control
const FullscreenControl: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    if (!map.fullscreenControl && L.control.fullscreen) {
      L.control.fullscreen({
        position: 'topleft',
        title: 'View Fullscreen',
        titleCancel: 'Exit Fullscreen'
      }).addTo(map);
    }
  }, [map]);

  return null;
};

interface MapProps {
  center?: [number, number];
}

const DEFAULT_CENTER: [number, number] = [26.8206, 30.8025];

const Map: React.FC<MapProps> = ({ center }) => {
  const [key, setKey] = useState<number>(0);

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [center]);

  const mapCenter = center || DEFAULT_CENTER;

  return (
    <MapContainer
      key={key}
      center={mapCenter}
      zoom={center ? 13 : 2}
      scrollWheelZoom={true}
      className="h-[35vh] rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FullscreenControl />
      {center && <Marker position={center} />}
    </MapContainer>
  );
};

export default Map;
