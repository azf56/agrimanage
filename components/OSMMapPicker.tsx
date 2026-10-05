import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Check, X, ExternalLink, Compass } from 'lucide-react';

interface OSMMapPickerProps {
  initialUrl?: string;
  initialLat?: number;
  initialLng?: number;
  title?: string;
  onSelect?: (data: { url: string; lat: number; lng: number }) => void;
  onLocationChange?: (lat: number, lng: number, url: string) => void;
  onClose?: () => void;
  inline?: boolean;
}

export const parseCoordinates = (input?: string): [number, number] | null => {
  if (!input) return null;
  
  // Try matching OpenStreetMap format: ?mlat=35.6892&mlon=51.3890 or #map=15/35.6892/51.3890
  const osmMatch = input.match(/mlat=([-+]?\d*\.?\d+)&mlon=([-+]?\d*\.?\d+)/i) ||
                   input.match(/#map=\d+\/([-+]?\d*\.?\d+)\/([-+]?\d*\.?\d+)/i);
  if (osmMatch) {
    const lat = parseFloat(osmMatch[1]);
    const lng = parseFloat(osmMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }

  // Try matching standard lat,lng coordinates: 35.6892, 51.3890
  const coordMatch = input.match(/([-+]?\d{1,2}\.\d+)\s*[, ]\s*([-+]?\d{1,3}\.\d+)/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }

  // Try matching Google / standard query maps URLs
  const urlMatch = input.match(/@([-+]?\d*\.?\d+),([-+]?\d*\.?\d+)|q=([-+]?\d*\.?\d+),([-+]?\d*\.?\d+)|ll=([-+]?\d*\.?\d+),([-+]?\d*\.?\d+)/);
  if (urlMatch) {
    const lat = parseFloat(urlMatch[1] || urlMatch[3] || urlMatch[5]);
    const lng = parseFloat(urlMatch[2] || urlMatch[4] || urlMatch[6]);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }

  return null;
};

export const createOSMUrl = (lat: number, lng: number, zoom = 15): string => {
  return `https://www.openstreetmap.org/?mlat=${lat.toFixed(5)}&mlon=${lng.toFixed(5)}#map=${zoom}/${lat.toFixed(5)}/${lng.toFixed(5)}`;
};

const OSMMapPicker: React.FC<OSMMapPickerProps> = ({
  initialUrl,
  initialLat,
  initialLng,
  title = 'انتخاب موقعیت روی نقشه OpenStreetMap',
  onSelect,
  onLocationChange,
  onClose,
  inline = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const initialCoords = (initialLat && initialLng && !isNaN(initialLat) && !isNaN(initialLng))
    ? [initialLat, initialLng] as [number, number]
    : parseCoordinates(initialUrl) || [32.4279, 53.6880] as [number, number]; // Iran center default

  const [selectedLat, setSelectedLat] = useState<number>(initialCoords[0]);
  const [selectedLng, setSelectedLng] = useState<number>(initialCoords[1]);
  const [hasSelectedPoint, setHasSelectedPoint] = useState<boolean>(Boolean(initialLat || parseCoordinates(initialUrl)));

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });

      const map = L.map(mapContainerRef.current, {
        center: initialCoords,
        zoom: hasSelectedPoint ? 14 : 6,
        layers: [osmLayer]
      });

      mapInstanceRef.current = map;

      // Custom green marker icon
      const customIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      if (hasSelectedPoint) {
        markerRef.current = L.marker(initialCoords, { icon: customIcon }).addTo(map);
      }

      // Invalidate size after mount so tiles load seamlessly
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);

      // Map click handler
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setSelectedLat(lat);
        setSelectedLng(lng);
        setHasSelectedPoint(true);

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        }

        const osmUrl = createOSMUrl(lat, lng);
        if (typeof onLocationChange === 'function') {
          onLocationChange(lat, lng, osmUrl);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const notifyChange = (lat: number, lng: number) => {
    const url = createOSMUrl(lat, lng);
    if (typeof onSelect === 'function') {
      onSelect({
        url,
        lat,
        lng
      });
    }
    if (typeof onLocationChange === 'function') {
      onLocationChange(lat, lng, url);
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleConfirm = () => {
    notifyChange(selectedLat, selectedLng);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setSelectedLat(lat);
          setSelectedLng(lng);
          setHasSelectedPoint(true);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 15);
            const L = (window as any).L;
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            } else if (L) {
              const customIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              });
              markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current);
            }
          }

          const osmUrl = createOSMUrl(lat, lng);
          if (typeof onLocationChange === 'function') {
            onLocationChange(lat, lng, osmUrl);
          }
        },
        (err) => {
          alert('امکان دریافت موقعیت فعلی وجود ندارد: ' + err.message);
        }
      );
    }
  };

  const mapContent = (
    <div className={`flex flex-col ${inline ? 'w-full bg-white rounded-2xl border border-gray-200 overflow-hidden' : 'bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]'}`}>
      {/* Header */}
      <div className={`p-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50/50`}>
        <div className="flex items-center gap-2 text-emerald-800">
          <div className="bg-emerald-600 text-white p-1.5 rounded-xl">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black">{title}</h3>
            <p className="text-[11px] text-gray-500 font-medium">روی نقطه مورد نظر در نقشه کلیک کنید یا موقعیت من را بزنید</p>
          </div>
        </div>
        {typeof onClose === 'function' && (
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Map Canvas */}
      <div className={`relative w-full bg-gray-100 ${inline ? 'h-[240px]' : 'flex-1 min-h-[360px]'}`}>
        <div ref={mapContainerRef} className="h-full w-full absolute inset-0 z-10" />

        {/* Floating Controls */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="bg-white/95 backdrop-blur shadow-md hover:bg-emerald-50 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-gray-200 transition"
            title="موقعیت فعلی من"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>موقعیت من</span>
          </button>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="p-3.5 bg-gray-50 border-t border-gray-100 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 font-mono text-[11px]">
            <span className="text-gray-400 font-sans">مختصات:</span>
            <span className="font-bold text-emerald-700">{selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}</span>
          </div>

          <a
            href={createOSMUrl(selectedLat, selectedLng)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 hover:underline text-[11px]"
          >
            <ExternalLink className="w-3 h-3" />
            مشاهده در OSM
          </a>
        </div>

        {!inline && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-black text-xs transition shadow-md flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              تأیید و ذخیره موقعیت
            </button>
            {typeof onClose === 'function' && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-xl font-bold text-xs transition"
              >
                انصراف
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (inline) {
    return mapContent;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      {mapContent}
    </div>
  );
};

export default OSMMapPicker;
