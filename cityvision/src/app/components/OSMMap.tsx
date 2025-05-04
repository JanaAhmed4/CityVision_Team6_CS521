'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const iconHtml = (label: string) =>
  L.divIcon({ className: 'marker-icon', html: label });

interface OSMMapProps {
  markers: { id: string; position: [number, number] }[];
}

export default function OSMMap({ markers }: OSMMapProps) {
  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {markers.map(({ id, position }) => (
        <Marker key={id} position={position} icon={iconHtml(id)}>
          <Popup>{id}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
