import React, { useEffect, useRef } from 'react';
import { Land, WaterSource, LabAnalysis } from '../types';
import { MapPin, Droplets, AlertCircle, Layers, Maximize2, Trees } from 'lucide-react';
import { parseCoordinates, createOSMUrl } from './OSMMapPicker';

interface MapReportProps {
  lands: Land[];
  waterSources?: WaterSource[];
  waterTests?: any[];
  labAnalyses?: LabAnalysis[];
  soilTests?: any[];
}

export const MapReport: React.FC<MapReportProps> = ({ 
  lands = [], 
  waterSources = [], 
  waterTests = [], 
  labAnalyses = [],
  soilTests = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  const parseCoords = (url?: string, lat?: string | number, lng?: string | number): [number, number] | null => {
    const latNum = typeof lat === 'string' ? parseFloat(lat) : Number(lat);
    const lngNum = typeof lng === 'string' ? parseFloat(lng) : Number(lng);

    if (latNum && lngNum && !isNaN(latNum) && !isNaN(lngNum)) {
      return [latNum, lngNum];
    }
    return parseCoordinates(url);
  };

  useEffect(() => {
    const L = (window as any).L;
    if (typeof window === 'undefined' || !L || !mapContainerRef.current) return;

    if (!mapRef.current) {
      const osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      });
      const osmTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { 
        attribution: 'Map data: OpenStreetMap contributors, SRTM | OpenTopoMap',
        maxZoom: 17
      });
      const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { 
        attribution: 'Esri World Imagery',
        maxZoom: 19
      });

      mapRef.current = L.map(mapContainerRef.current, {
        center: [35.118, 57.184],
        zoom: 12,
        layers: [osmStandard]
      });

      const baseMaps = { 
        "نقشه خیابان‌ها OpenStreetMap": osmStandard, 
        "نقشه توپوگرافی": osmTopo,
        "نقشه ماهواره‌ای": satellite 
      };
      L.control.layers(baseMaps, {}, { position: 'topleft' }).addTo(mapRef.current);
      
      layerGroupRef.current = L.featureGroup().addTo(mapRef.current);

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 200);
    }

    // Reset markers
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
    }

    const L_INSTANCE = (window as any).L;

    // 1. Process Lands (باغات پسته)
    lands.forEach(land => {
      const coords = parseCoords(land.osmUrl || land.googleMapUrl, land.latitude, land.longitude);
      if (coords) {
        const osmLink = createOSMUrl(coords[0], coords[1]);
        const latestAnalysis = (labAnalyses || soilTests)
          .filter(t => t.landId === land.id)
          .sort((a, b) => new Date(b.analysisDate || b.testDate || '').getTime() - new Date(a.analysisDate || a.testDate || '').getTime())[0];

        const popupHTML = `
          <div style="direction: rtl; text-align: right; min-width: 260px; font-family: system-ui, -apple-system, sans-serif; padding: 4px;">
            <div style="border-bottom: 2px solid #16a34a; margin-bottom: 8px; padding-bottom: 6px;">
              <span style="background: #dcfce7; color: #166534; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 6px; display: inline-block; margin-bottom: 4px;">باغ پسته</span>
              <h3 style="margin: 0; color: #14532d; font-size: 15px; font-weight: 800;">${land.name || land.title}</h3>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px; font-size: 11px;">
               <div style="background: #f0fdf4; padding: 6px; border-radius: 8px; border: 1px solid #dcfce7;"><b>رقم:</b><br/>${land.pistachioRootstock || land.cropType || 'پسته'}</div>
               <div style="background: #f0fdf4; padding: 6px; border-radius: 8px; border: 1px solid #dcfce7;"><b>مساحت:</b><br/>${land.areaHectares || land.area || 1} هکتار</div>
            </div>
            ${latestAnalysis ? `
              <div style="background: #fdf4ff; border: 1px solid #f5d0fe; border-radius: 8px; padding: 6px; margin-bottom: 8px; font-size: 11px;">
                <p style="margin: 0 0 4px 0; font-size: 10px; font-weight: bold; color: #86198f;">
                  آخرین آنالیز (${latestAnalysis.analysisDate || latestAnalysis.testDate})
                </p>
                <div style="display: flex; justify-content: space-between;"><span>EC خاک:</span> <b>${latestAnalysis.soilEc || latestAnalysis.ec || '-'}</b></div>
                <div style="display: flex; justify-content: space-between;"><span>pH:</span> <b>${latestAnalysis.soilPh || latestAnalysis.ph || '-'}</b></div>
              </div>
            ` : ''}
            
            <a href="${osmLink}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #16a34a; color: white; text-decoration: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">
              مشاهده موقعیت در OpenStreetMap ↗
            </a>
          </div>
        `;

        const marker = L_INSTANCE.marker(coords, {
          icon: L_INSTANCE.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
          })
        }).bindPopup(popupHTML, { maxWidth: 350 });
        layerGroupRef.current.addLayer(marker);
      }
    });

    // 2. Process Water Sources (چاه‌های موتور)
    const allWater = waterSources.length > 0 ? waterSources : waterTests;
    allWater.forEach(water => {
      const coords = parseCoords(water.wellMapUrl || water.osmUrl, water.latitude, water.longitude);
      if (coords) {
        const osmLink = createOSMUrl(coords[0], coords[1]);
        const popupHTML = `
          <div style="direction: rtl; text-align: right; min-width: 260px; font-family: system-ui, -apple-system, sans-serif; padding: 4px;">
            <div style="border-bottom: 2px solid #2563eb; margin-bottom: 8px; padding-bottom: 6px;">
              <span style="background: #dbeafe; color: #1e40af; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 6px; display: inline-block; margin-bottom: 4px;">چاه موتور و منبع آب</span>
              <h3 style="margin: 0; color: #1e3a8a; font-size: 15px; font-weight: 800;">${water.name || water.wellName || 'چاه کشاورزی'}</h3>
            </div>
            <div style="background: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 6px; margin-bottom: 8px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;"><span>دبی:</span> <b>${water.flowRate || '-'}</b></div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;"><span>شوری (EC):</span> <b>${water.waterEc || water.ec || '-'}</b></div>
              <div style="display: flex; justify-content: space-between;"><span>اسیدیته (pH):</span> <b>${water.waterPh || water.ph || '-'}</b></div>
            </div>
            <a href="${osmLink}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #2563eb; color: white; text-decoration: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">
              مشاهده موقعیت در OpenStreetMap ↗
            </a>
          </div>
        `;

        const marker = L_INSTANCE.marker(coords, {
          icon: L_INSTANCE.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
          })
        }).bindPopup(popupHTML, { maxWidth: 350 });
        layerGroupRef.current.addLayer(marker);
      }
    });

    // Auto-zoom to fit markers
    if (layerGroupRef.current && layerGroupRef.current.getLayers().length > 0) {
      try {
        mapRef.current.fitBounds(layerGroupRef.current.getBounds().pad(0.2));
      } catch (e) {
        // ignore bounds calculation error if single point or zero width
      }
    }

    return () => {
      // Map cleanup if component unmounts
    };
  }, [lands, waterSources, waterTests, labAnalyses, soilTests]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-gray-800">نقشه یکپارچه OpenStreetMap باغات پسته و منابع آب</h2>
          <p className="text-xs text-gray-500 font-bold">پایش موقعیت مکانی قطعات باغات، منابع آب و دسترسی به اطلاعات آزمایشگاهی</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-2 rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[600px] relative">
          <div ref={mapContainerRef} className="h-full w-full z-10 rounded-2xl"></div>
          
          <div className="absolute bottom-6 right-6 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-200 text-xs font-bold flex flex-col gap-2.5 min-w-[170px]">
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 shadow-sm border-2 border-white"></div>
              <span className="text-gray-700">باغات پسته ({lands.length})</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-600 shadow-sm border-2 border-white"></div>
              <span className="text-gray-700">چاه‌های موتور ({waterSources.length || waterTests.length})</span>
            </div>
            <div className="pt-2 border-t flex items-center gap-1.5 text-[10px] text-emerald-800 font-black">
              <Layers className="w-3.5 h-3.5" /> نقشه فعال: OpenStreetMap
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-800 mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-emerald-700" />
              راهنمای لایه‌ها و پایش مکانی
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium mb-3">
              با کلیک بر روی هر نشانگر سبز (باغ پسته) یا آبی (چاه موتور) اطلاعات سطح زیرکشت، مشخصات آب و آخرین نتایج آزمایشگاهی نمایش داده می‌شود.
            </p>
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-100 text-xs font-bold">
              🌿 تمامی نقاط بر روی نقشه رایگان و بومی OpenStreetMap تنظیم شده‌اند.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapReport;
