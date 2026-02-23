import React, { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/assets/css/leaflet.css';
import logoImg from '../image/logo.jpg';

// Icône personnalisée pour la carte
const customIcon = new L.Icon({
  iconUrl: logoImg,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  className: 'rounded-full border-2 border-marron shadow-xl'
});

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

function MapSearch({ onCoordsChange }) {
  const map = useMap();

  useEffect(() => {
    let searchControl;
    let isMounted = true;

    import('leaflet-geosearch').then(({ GeoSearchControl, OpenStreetMapProvider }) => {
      if (!isMounted) return;

      const provider = new OpenStreetMapProvider({
        params: {
          countrycodes: 'tg',
          'accept-language': 'fr',
        },
      });

      searchControl = new GeoSearchControl({
        provider,
        style: 'bar',
        showMarker: false,
        autoClose: true,
        searchLabel: 'Rechercher: Hôtel, Quartier, Resto...',
      });

      const onLocationSelect = (result) => {
        const { y: lat, x: lng } = result.location;
        onCoordsChange({ lat, lng });
        map.flyTo([lat, lng], 15);
      };

      map.addControl(searchControl);
      map.on('geosearch/showlocation', onLocationSelect);
    });
    return () => {
      isMounted = false;
      if (searchControl) map.removeControl(searchControl);
    };
  }, [map, onCoordsChange]);

  return null;
}

export default function MapModal({ isOpen, onClose, onConfirm, tempMapCoords, setTempMapCoords }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative h-[70vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between bg-white px-4 py-3 border-b">
          <h3 className="font-fredoka text-lg text-marron">📍 Touchez votre position</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200"><i className="fa-solid fa-xmark"></i></button>
        </div>
        
        <div className="flex-1 relative">
          <MapContainer center={[6.1375, 1.2125]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <MapSearch onCoordsChange={setTempMapCoords} />
            <MapClickHandler onClick={setTempMapCoords} />
            {tempMapCoords && <Marker position={tempMapCoords} icon={customIcon} />}
          </MapContainer>
          
          <div className="absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2 w-max">
            <button onClick={onConfirm} disabled={!tempMapCoords} className="rounded-full bg-marron px-8 py-3 font-bold text-white shadow-xl disabled:opacity-50 hover:bg-orange-doux transition-all hover:scale-105">
              Valider cette position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
