"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
});

interface HotspotMapProps {
  dateRange: { startDate: string; endDate: string };
}

interface Hotspot {
  regionId: string;
  regionName: string;
  alertCount: number;
  totalArea: number;
  riskScore: number;
  riskLevel: string;
  rank: number;
  geometry: any;
}

export default function HotspotMap({ dateRange }: HotspotMapProps) {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  useEffect(() => {
    fetchHotspots();
  }, [dateRange]);

  const fetchHotspots = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const response = await fetch(`/api/analytics/hotspots?${params}`);
      const data = await response.json();
      setHotspots(data.hotspots || []);
    } catch (error) {
      console.error("Error fetching hotspots:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "HIGH":
        return "#dc2626";
      case "MEDIUM":
        return "#ea580c";
      case "LOW":
        return "#eab308";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">Loading hotspots...</div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Predictive Hotspot Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <MapComponent
              center={[9.5, -12.0]}
              zoom={9}
              className="h-[600px] w-full"
              onMapReady={(map) => {
                const L = require("leaflet");

                hotspots.forEach((hotspot) => {
                  if (hotspot.geometry) {
                    const color = getRiskColor(hotspot.riskLevel);
                    L.geoJSON(hotspot.geometry, {
                      style: {
                        color,
                        weight: 3,
                        fillColor: color,
                        fillOpacity: 0.3,
                      },
                      onEachFeature: (feature: any, layer: any) => {
                        layer.bindPopup(`
                          <div>
                            <h3 class="font-bold">${hotspot.regionName}</h3>
                            <p>Risk Level: <strong>${hotspot.riskLevel}</strong></p>
                            <p>Risk Score: ${hotspot.riskScore.toFixed(1)}</p>
                            <p>Alerts: ${hotspot.alertCount}</p>
                            <p>Area: ${hotspot.totalArea.toFixed(2)} ha</p>
                          </div>
                        `);
                        layer.on("click", () => {
                          setSelectedHotspot(hotspot);
                        });
                      },
                    }).addTo(map);
                  }
                });

                // Fit bounds to show all hotspots
                if (hotspots.length > 0) {
                  const bounds = L.latLngBounds([]);
                  hotspots.forEach((hotspot) => {
                    if (hotspot.geometry) {
                      L.geoJSON(hotspot.geometry).eachLayer((layer: any) => {
                        if (layer.getBounds) {
                          bounds.extend(layer.getBounds());
                        }
                      });
                    }
                  });
                  if (bounds.isValid()) {
                    map.fitBounds(bounds);
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Hotspot List */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>High-Risk Hotspots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {hotspots.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hotspots found</p>
              ) : (
                hotspots.map((hotspot) => (
                  <div
                    key={hotspot.regionId}
                    onClick={() => setSelectedHotspot(hotspot)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedHotspot?.regionId === hotspot.regionId
                        ? "bg-green-50 border-green-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        #{hotspot.rank} {hotspot.regionName}
                      </p>
                      <Badge
                        variant={
                          hotspot.riskLevel === "HIGH"
                            ? "danger"
                            : hotspot.riskLevel === "MEDIUM"
                            ? "warning"
                            : "info"
                        }
                        size="sm"
                      >
                        {hotspot.riskLevel}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Risk Score:</span>{" "}
                        {hotspot.riskScore.toFixed(1)}/100
                      </p>
                      <p>
                        <span className="font-medium">Alerts:</span> {hotspot.alertCount}
                      </p>
                      <p>
                        <span className="font-medium">Area:</span>{" "}
                        {hotspot.totalArea.toFixed(2)} ha
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
