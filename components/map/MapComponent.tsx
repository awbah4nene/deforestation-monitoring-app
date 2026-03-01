"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Store onMapReady in a ref so map init effect doesn't depend on it (avoids re-create loops)
function useStableCallback<T extends (...args: any[]) => void>(cb: T): T {
  const ref = useRef(cb);
  ref.current = cb;
  return useRef(((...args: Parameters<T>) => ref.current(...args)) as T).current;
}

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMapReady?: (map: L.Map) => void;
  showLayerControl?: boolean;
}

// Fix Leaflet default icon issue with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Tile layer configurations
const TILE_LAYERS = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    name: "Street Map",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> | Sources: Esri, DigitalGlobe, GeoEye, i-cubed, USDA FSA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community',
    name: "Satellite",
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
    name: "Terrain",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    name: "Dark Mode",
  },
};

type TileLayerType = keyof typeof TILE_LAYERS;

export default function MapComponent({
  center = [9.5, -11.5], // Northern Region, Sierra Leone
  zoom = 9,
  className = "h-[600px] w-full",
  onMapReady,
  showLayerControl = true,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [activeLayer, setActiveLayer] = useState<TileLayerType>("street");
  const onMapReadyStable = useStableCallback(onMapReady ?? (() => {}));

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current, {
      zoomControl: false, // We'll add custom controls
    }).setView(center, zoom);

    // Add zoom control to top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Add scale control
    L.control.scale({ position: "bottomright", imperial: false }).addTo(map);

    // Add initial tile layer
    const initialLayer = L.tileLayer(TILE_LAYERS.street.url, {
      attribution: TILE_LAYERS.street.attribution,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = initialLayer;
    mapRef.current = map;

    // Call onMapReady callback (stable ref, no dependency)
    onMapReadyStable(map);

    // Cleanup
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.closePopup();
        } catch (_) {}
        try {
          mapRef.current.remove();
        } catch (_) {}
        mapRef.current = null;
      }
    };
  }, [center, zoom]); // Intentionally omit onMapReady to avoid map re-creation loops

  // Handle layer change
  const handleLayerChange = (layerType: TileLayerType) => {
    if (!mapRef.current || !tileLayerRef.current) return;

    const layerConfig = TILE_LAYERS[layerType];
    
    // Remove current layer
    mapRef.current.removeLayer(tileLayerRef.current);

    // Add new layer
    const newLayer = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: 19,
    }).addTo(mapRef.current);

    tileLayerRef.current = newLayer;
    setActiveLayer(layerType);
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="h-full w-full" />
      
      {/* Custom Layer Control */}
      {showLayerControl && (
        <div className="absolute top-4 right-14 z-[1000] bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col">
            {(Object.keys(TILE_LAYERS) as TileLayerType[]).map((layerType) => (
              <button
                key={layerType}
                onClick={() => handleLayerChange(layerType)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  activeLayer === layerType
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {TILE_LAYERS[layerType].name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
