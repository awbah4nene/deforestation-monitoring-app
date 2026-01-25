"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
});

interface EditBoundariesModalProps {
  isOpen: boolean;
  onClose: () => void;
  regionId: string;
  currentGeometry: any;
  onSave: (geometry: any) => void;
}

export default function EditBoundariesModal({
  isOpen,
  onClose,
  regionId,
  currentGeometry,
  onSave,
}: EditBoundariesModalProps) {
  const [geometry, setGeometry] = useState<any>(currentGeometry);
  const [saving, setSaving] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [drawLayer, setDrawLayer] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setGeometry(currentGeometry);
    }
  }, [isOpen, currentGeometry]);

  const handleMapReady = (leafletMap: any) => {
    setMap(leafletMap);
    const L = require("leaflet");

    // Add existing geometry
    if (currentGeometry) {
      const geoJsonLayer = L.geoJSON(currentGeometry, {
        style: {
          color: "#22c55e",
          weight: 3,
          opacity: 0.8,
          fillOpacity: 0.2,
        },
      }).addTo(leafletMap);

      leafletMap.fitBounds(geoJsonLayer.getBounds());
      setDrawLayer(geoJsonLayer);
    }

    // Add drawing controls (simplified - you may want to use Leaflet.draw plugin)
    // For now, we'll use a simple polygon drawing approach
  };

  const handleReset = () => {
    setGeometry(currentGeometry);
    if (map && currentGeometry) {
      const L = require("leaflet");
      map.eachLayer((layer: any) => {
        if (layer instanceof L.GeoJSON) {
          map.removeLayer(layer);
        }
      });

      const geoJsonLayer = L.geoJSON(currentGeometry, {
        style: {
          color: "#22c55e",
          weight: 3,
          opacity: 0.8,
          fillOpacity: 0.2,
        },
      }).addTo(map);

      map.fitBounds(geoJsonLayer.getBounds());
      setDrawLayer(geoJsonLayer);
    }
  };

  const handleSave = async () => {
    if (!geometry) {
      alert("No geometry to save");
      return;
    }

    setSaving(true);
    try {
      await onSave(geometry);
      onClose();
    } catch (error) {
      console.error("Error saving boundaries:", error);
      alert("Failed to save boundaries");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit Region Boundaries</CardTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Boundary editing requires GeoJSON format. For
                advanced editing, please use GIS software and import the geometry.
              </p>
            </div>

            <div className="h-[500px] w-full border rounded-lg overflow-hidden">
              <MapComponent
                center={[9.5, -12.0]}
                zoom={10}
                className="h-full w-full"
                onMapReady={handleMapReady}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={handleReset} disabled={saving}>
                Reset
              </Button>
              <Button variant="secondary" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Boundaries"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
