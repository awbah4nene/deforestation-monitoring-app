"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import L from "leaflet";
import Link from "next/link";

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

interface ForestRegion {
  id: string;
  name: string;
  regionCode: string;
  district: string;
  chiefdom: string;
  areaHectares: number;
  geometry: any;
  centroid: any;
  vegetationType: string;
  protectionStatus: string;
  population?: number;
  _count: {
    deforestationAlerts: number;
    fieldReports: number;
    patrolRoutes: number;
  };
  deforestationAlerts: Array<{ id: string; severity: string }>;
}

interface DeforestationAlert {
  id: string;
  alertCode: string;
  latitude: number;
  longitude: number;
  alertDate: string;
  detectedDate: string;
  areaHectares: number;
  confidence: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: string;
  priority: number;
  ndviChange?: number;
  forestRegionId: string;
  forestRegion: {
    id: string;
    name: string;
    district: string;
    chiefdom: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
  _count: {
    fieldReports: number;
    alertComments: number;
  };
}

interface Filters {
  status: string;
  severity: string;
  district: string;
  startDate: string;
  endDate: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#dc2626",
  HIGH: "#ea580c",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
};

const PROTECTION_COLORS: Record<string, string> = {
  PROTECTED_AREA: "#16a34a",
  NATIONAL_PARK: "#15803d",
  CONSERVATION_AREA: "#22c55e",
  COMMUNITY_FOREST: "#3b82f6",
  CONCESSION: "#f59e0b",
  UNPROTECTED: "#9ca3af",
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "VERIFIED", label: "Verified" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "ACTION_TAKEN", label: "Action Taken" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "FALSE_ALARM", label: "False Alarm" },
];

const SEVERITY_OPTIONS = [
  { value: "ALL", label: "All Severities" },
  { value: "CRITICAL", label: "🔴 Critical" },
  { value: "HIGH", label: "🟠 High" },
  { value: "MEDIUM", label: "🟡 Medium" },
  { value: "LOW", label: "🟢 Low" },
];

export default function MapDashboard() {
  const [regions, setRegions] = useState<ForestRegion[]>([]);
  const [alerts, setAlerts] = useState<DeforestationAlert[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<DeforestationAlert | null>(null);
  const [showRegions, setShowRegions] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeSliderValue, setTimeSliderValue] = useState(100); // Percentage
  const [filters, setFilters] = useState<Filters>({
    status: "ALL",
    severity: "ALL",
    district: "ALL",
    startDate: "",
    endDate: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    bySeverity: [] as Array<{ severity: string; _count: { id: number } }>,
    byStatus: [] as Array<{ status: string; _count: { id: number } }>,
  });

  const regionLayersRef = useRef<L.GeoJSON[]>([]);
  const alertMarkersRef = useRef<L.Marker[]>([]);
  const layersInitializedRef = useRef(false);

  // Build query string from filters
  const buildQueryString = (filterObj: Filters) => {
    const params = new URLSearchParams();
    Object.entries(filterObj).forEach(([key, value]) => {
      if (value && value !== "ALL") {
        params.append(key, value);
      }
    });
    return params.toString();
  };

  // Fetch data with filters
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const queryString = buildQueryString(filters);
      const [regionsRes, alertsRes] = await Promise.all([
        fetch(`/api/map/regions?${filters.district !== "ALL" ? `district=${filters.district}` : ""}`),
        fetch(`/api/map/alerts?${queryString}`),
      ]);

      const regionsData = await regionsRes.json();
      const alertsData = await alertsRes.json();

      setRegions(regionsData.regions || []);
      setDistricts(regionsData.districts || []);
      setAlerts(alertsData.alerts || []);
      setStats(alertsData.stats || { total: 0, bySeverity: [], byStatus: [] });
    } catch (error) {
      console.error("Error fetching map data:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Clear existing layers (close popups first to avoid Leaflet _leaflet_pos errors)
  const clearLayers = useCallback((map: L.Map | null) => {
    if (!map || !map.getContainer()?.parentElement) return;
    try {
      map.closePopup();
    } catch (_) {}
    const regions = regionLayersRef.current;
    const markers = alertMarkersRef.current;
    regionLayersRef.current = [];
    alertMarkersRef.current = [];
    regions.forEach((layer) => {
      try {
        if (layer && (layer as any)._map) layer.remove();
      } catch (_) {}
    });
    markers.forEach((marker) => {
      try {
        if (marker && (marker as any)._map) {
          marker.closePopup?.();
          marker.remove();
        }
      } catch (_) {}
    });
  }, []);

  // Separate function to render layers
  const renderLayers = useCallback(() => {
    // Validate map instance and container before proceeding
    if (!mapInstance) {
      console.warn("Map instance is null");
      return;
    }

    const container = mapInstance.getContainer();
    if (!container || !container.parentElement) {
      console.warn("Map container not available");
      return;
    }

    clearLayers(mapInstance);

    // Add region boundaries
    if (showRegions) {
      regions.forEach((region) => {
        // Validate geometry data
        if (!region.geometry || !region.geometry.coordinates) {
          return;
        }

        // Validate coordinates structure
        const coords = region.geometry.coordinates;
        if (!Array.isArray(coords) || coords.length === 0) {
          return;
        }

        try {
          const color = PROTECTION_COLORS[region.protectionStatus] || "#22c55e";
          const hasActiveAlerts = region.deforestationAlerts?.some(
            (a) => a.severity === "CRITICAL" || a.severity === "HIGH"
          ) || false;

          // Create GeoJSON layer with error handling
          let polygon: L.GeoJSON | null = null;
          
          try {
            polygon = L.geoJSON(region.geometry as any, {
              style: {
                color: hasActiveAlerts ? "#dc2626" : color,
                weight: hasActiveAlerts ? 3 : 2,
                opacity: 0.8,
                fillColor: color,
                fillOpacity: 0.15,
                dashArray: hasActiveAlerts ? "5, 5" : undefined,
              },
            });

            // Only add to map if polygon was created successfully
            if (polygon && mapInstance && mapInstance.getContainer()) {
              polygon.addTo(mapInstance);

              // Escape HTML to prevent XSS
              const escapeHtml = (text: string) => {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
              };

              polygon.bindPopup(`
                <div class="p-3 min-w-[250px]">
                  <h3 class="font-bold text-lg text-gray-900 mb-2">${escapeHtml(region.name || 'Unknown')}</h3>
                  <div class="space-y-1 text-sm">
                    <p><span class="text-gray-500">District:</span> <span class="font-medium">${escapeHtml(region.district || 'N/A')}</span></p>
                    <p><span class="text-gray-500">Chiefdom:</span> <span class="font-medium">${escapeHtml(region.chiefdom || 'N/A')}</span></p>
                    <p><span class="text-gray-500">Area:</span> <span class="font-medium">${(region.areaHectares || 0).toLocaleString()} ha</span></p>
                    <p><span class="text-gray-500">Vegetation:</span> <span class="font-medium">${escapeHtml((region.vegetationType || '').replace(/_/g, " "))}</span></p>
                    <p><span class="text-gray-500">Protection:</span> <span class="font-medium">${escapeHtml((region.protectionStatus || '').replace(/_/g, " "))}</span></p>
                  </div>
                  <div class="mt-3 pt-3 border-t border-gray-200 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div class="text-lg font-bold text-red-600">${region._count?.deforestationAlerts || 0}</div>
                      <div class="text-xs text-gray-500">Alerts</div>
                    </div>
                    <div>
                      <div class="text-lg font-bold text-blue-600">${region._count?.fieldReports || 0}</div>
                      <div class="text-xs text-gray-500">Reports</div>
                    </div>
                    <div>
                      <div class="text-lg font-bold text-green-600">${region._count?.patrolRoutes || 0}</div>
                      <div class="text-xs text-gray-500">Patrols</div>
                    </div>
                  </div>
                  <a href="/dashboard/regions/${region.id}" class="mt-3 block text-center text-sm text-green-600 hover:text-green-700 font-medium">
                    View Details →
                  </a>
                </div>
              `);

              regionLayersRef.current.push(polygon);
            }
          } catch (geoJsonError) {
            console.warn(`Failed to create GeoJSON for region "${region.name}":`, geoJsonError);
            return;
          }
        } catch (error) {
          console.warn(`Error rendering region "${region.name}":`, error);
          // Continue with next region instead of breaking
        }
      });
    }

    // Add alert markers
    if (showAlerts) {
      // Verify map instance is ready before adding markers
      if (!mapInstance || !mapInstance.getContainer()) {
        console.warn("Map instance not ready for markers");
        return;
      }

      alerts.forEach((alert) => {
        // Validate alert coordinates
        if (!alert.latitude || !alert.longitude || isNaN(alert.latitude) || isNaN(alert.longitude)) {
          console.warn(`Invalid coordinates for alert ${alert.id}`);
          return;
        }

        try {
          const color = SEVERITY_COLORS[alert.severity] || "#22c55e";
          const size = alert.severity === "CRITICAL" ? 28 : alert.severity === "HIGH" ? 24 : 20;

          const icon = L.divIcon({
            html: `
              <div class="relative">
                <div style="
                  background-color: ${color}; 
                  width: ${size}px; 
                  height: ${size}px; 
                  border-radius: 50%; 
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  ${alert.severity === "CRITICAL" ? '<span style="color: white; font-size: 12px; font-weight: bold;">!</span>' : ""}
                </div>
                ${alert.status === "PENDING" ? `
                  <div style="
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 10px;
                    height: 10px;
                    background-color: #3b82f6;
                    border-radius: 50%;
                    border: 2px solid white;
                    animation: pulse 2s infinite;
                  "></div>
                ` : ""}
              </div>
            `,
            className: "custom-marker",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          // Verify map instance is still valid before adding marker
          if (!mapInstance || !mapInstance.getContainer()) {
            console.warn("Map instance became invalid while creating marker");
            return;
          }

          const marker = L.marker([alert.latitude, alert.longitude], { icon });
          
          // Add to map only if container exists
          if (mapInstance.getContainer() && mapInstance.getContainer().parentElement) {
            marker.addTo(mapInstance);
          } else {
            console.warn("Map container not available for marker");
            return;
          }

          // Escape HTML to prevent XSS
          const escapeHtml = (text: string) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
          };

          marker.bindPopup(`
            <div class="p-3 min-w-[280px]">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-bold text-lg text-gray-900">${escapeHtml(alert.alertCode || 'Unknown')}</h3>
                <span class="px-2 py-1 text-xs font-semibold rounded" style="background-color: ${color}20; color: ${color}">
                  ${escapeHtml(alert.severity || 'UNKNOWN')}
                </span>
              </div>
              <div class="space-y-1 text-sm">
                <p><span class="text-gray-500">Region:</span> <span class="font-medium">${escapeHtml(alert.forestRegion?.name || 'N/A')}</span></p>
                <p><span class="text-gray-500">District:</span> <span class="font-medium">${escapeHtml(alert.forestRegion?.district || 'N/A')}</span></p>
                <p><span class="text-gray-500">Area Affected:</span> <span class="font-medium text-red-600">${(alert.areaHectares || 0).toFixed(2)} ha</span></p>
                <p><span class="text-gray-500">Confidence:</span> <span class="font-medium">${((alert.confidence || 0) * 100).toFixed(0)}%</span></p>
                <p><span class="text-gray-500">Status:</span> <span class="inline-block px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">${escapeHtml(alert.status || 'UNKNOWN')}</span></p>
                <p><span class="text-gray-500">Detected:</span> <span class="font-medium">${alert.detectedDate ? new Date(alert.detectedDate).toLocaleDateString() : 'N/A'}</span></p>
                ${alert.assignedTo ? `<p><span class="text-gray-500">Assigned to:</span> <span class="font-medium">${escapeHtml(alert.assignedTo.name || 'N/A')}</span></p>` : ""}
              </div>
              <div class="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                <a href="/dashboard/alerts/${alert.id}" class="flex-1 text-center text-sm bg-green-600 text-white py-1.5 rounded hover:bg-green-700 font-medium">
                  View Details
                </a>
                <a href="/dashboard/alerts/${alert.id}/verify" class="flex-1 text-center text-sm bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700 font-medium">
                  Verify Alert
                </a>
              </div>
            </div>
          `);

          marker.on("click", () => {
            setSelectedAlert(alert);
          });

          alertMarkersRef.current.push(marker);
        } catch (error) {
          console.warn(`Error creating marker for alert ${alert.id}:`, error);
          // Continue with next alert instead of breaking
        }
      });
    }
  }, [mapInstance, regions, alerts, showRegions, showAlerts, clearLayers]);

  // Render map layers
  useEffect(() => {
    if (!mapInstance || loading) return;
    
    // Ensure map container is ready and has a valid DOM element
    const container = mapInstance.getContainer();
    if (!container || !container.parentElement) {
      console.warn("Map container not ready");
      return;
    }

    // Wait for map to be fully ready before rendering
    try {
      // Use whenReady to ensure map is fully initialized
      mapInstance.whenReady(() => {
        // Double-check container is still valid before rendering
        const container = mapInstance.getContainer();
        if (container && container.parentElement && container.offsetParent !== null) {
          renderLayers();
        } else {
          console.warn("Map container not properly initialized");
          // Retry after a short delay
          setTimeout(() => {
            const retryContainer = mapInstance.getContainer();
            if (retryContainer && retryContainer.parentElement) {
              renderLayers();
            }
          }, 200);
        }
      });
    } catch (error) {
      console.warn("Error in map ready handler:", error);
      // If whenReady fails, try rendering directly after a short delay
      setTimeout(() => {
        const container = mapInstance.getContainer();
        if (container && container.parentElement) {
          renderLayers();
        }
      }, 300);
    }
  }, [mapInstance, regions, alerts, showRegions, showAlerts, loading, renderLayers]);

  // Handle map initialization
  const handleMapReady = useCallback((map: L.Map) => {
    // Wait for map to be fully ready before setting instance
    if (map && map.getContainer()) {
      // Small delay to ensure map container is fully rendered
      setTimeout(() => {
        setMapInstance(map);
      }, 100);
    } else {
      setMapInstance(map);
    }
  }, []);

  // Fly to alert location
  const flyToAlert = (alert: DeforestationAlert) => {
    if (mapInstance) {
      mapInstance.flyTo([alert.latitude, alert.longitude], 13, { duration: 1 });
      setSelectedAlert(alert);
    }
  };

  // Handle filter change
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "ALL",
      severity: "ALL",
      district: "ALL",
      startDate: "",
      endDate: "",
    });
  };

  // Get severity count
  const getSeverityCount = (severity: string) => {
    const found = stats.bySeverity.find((s) => s.severity === severity);
    return found?._count?.id || 0;
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col w-full overflow-hidden max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🗺️ Deforestation Monitoring Map
          </h1>
          <p className="text-gray-600 text-sm">
            Real-time monitoring of Northern Sierra Leone forest regions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={sidebarOpen ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "Hide" : "Show"} Alerts Panel
          </Button>
          <Button variant="secondary" size="sm" onClick={fetchData}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
        <div className="bg-white rounded-lg p-3 shadow-sm border">
          <div className="text-xs text-gray-500">Total Alerts</div>
          <div className="text-xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 shadow-sm border border-red-100">
          <div className="text-xs text-red-600">Critical</div>
          <div className="text-xl font-bold text-red-600">{getSeverityCount("CRITICAL")}</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 shadow-sm border border-orange-100">
          <div className="text-xs text-orange-600">High</div>
          <div className="text-xl font-bold text-orange-600">{getSeverityCount("HIGH")}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 shadow-sm border border-yellow-100">
          <div className="text-xs text-yellow-600">Medium</div>
          <div className="text-xl font-bold text-yellow-600">{getSeverityCount("MEDIUM")}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 shadow-sm border border-green-100">
          <div className="text-xs text-green-600">Low</div>
          <div className="text-xl font-bold text-green-600">{getSeverityCount("LOW")}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 shadow-sm border border-blue-100">
          <div className="text-xs text-blue-600">Regions</div>
          <div className="text-xl font-bold text-blue-600">{regions.length}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Map Container */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Filter Bar */}
          <div className="bg-white rounded-t-lg shadow-sm border p-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Severity:</label>
              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange("severity", e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">District:</label>
              <select
                value={filters.district}
                onChange={(e) => handleFilterChange("district", e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
              >
                <option value="ALL">All Districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                max={new Date().toISOString().split('T')[0]}
                min={filters.startDate || undefined}
              />
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRegions}
                  onChange={(e) => setShowRegions(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span>🌲 Regions</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAlerts}
                  onChange={(e) => setShowAlerts(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span>🚨 Alerts</span>
              </label>
              <button
                onClick={resetFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Time Slider */}
          {alerts.length > 0 && (
            <div className="bg-white border-x border-t px-4 py-3">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  📅 Historical View:
                </label>
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={timeSliderValue}
                    onChange={(e) => {
                      const percentage = parseInt(e.target.value);
                      setTimeSliderValue(percentage);
                      
                      // Calculate date based on percentage
                      const sortedAlerts = [...alerts].sort((a, b) => 
                        new Date(a.detectedDate).getTime() - new Date(b.detectedDate).getTime()
                      );
                      if (sortedAlerts.length > 0) {
                        const oldestDate = new Date(sortedAlerts[0].detectedDate);
                        const newestDate = new Date(sortedAlerts[sortedAlerts.length - 1].detectedDate);
                        const dateRange = newestDate.getTime() - oldestDate.getTime();
                        const selectedDate = new Date(oldestDate.getTime() + (dateRange * percentage / 100));
                        handleFilterChange("endDate", selectedDate.toISOString().split('T')[0]);
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>
                      {(() => {
                        const sorted = [...alerts].sort((a, b) => 
                          new Date(a.detectedDate).getTime() - new Date(b.detectedDate).getTime()
                        );
                        return sorted.length > 0 
                          ? new Date(sorted[0].detectedDate).toLocaleDateString()
                          : 'Oldest';
                      })()}
                    </span>
                    <span>
                      {(() => {
                        const sorted = [...alerts].sort((a, b) => 
                          new Date(a.detectedDate).getTime() - new Date(b.detectedDate).getTime()
                        );
                        return sorted.length > 0 
                          ? new Date(sorted[sorted.length - 1].detectedDate).toLocaleDateString()
                          : 'Latest';
                      })()}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 whitespace-nowrap">
                  Showing: <span className="font-medium">
                    {filters.endDate 
                      ? new Date(filters.endDate).toLocaleDateString()
                      : 'All time'
                    }
                  </span>
                </div>
                <button
                  onClick={() => {
                    setTimeSliderValue(100);
                    handleFilterChange("endDate", "");
                  }}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Map */}
          <div className="flex-1 bg-white border-x border-b rounded-b-lg overflow-hidden relative min-h-0">
            {loading && (
              <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading data...</p>
                </div>
              </div>
            )}
            <MapComponent
              center={[9.5, -11.5]}
              zoom={9}
              className="h-full w-full min-h-[500px]"
              onMapReady={handleMapReady}
            />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Alert Severity</h4>
              <div className="space-y-1">
                {Object.entries(SEVERITY_COLORS).map(([severity, color]) => (
                  <div key={severity} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-3 h-3 rounded-full border border-white shadow"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-gray-600">{severity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Protection Status</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 border-2 border-green-600 bg-green-50 rounded"></div>
                    <span className="text-gray-600">Protected</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 border-2 border-blue-600 bg-blue-50 rounded"></div>
                    <span className="text-gray-600">Community</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 border-2 border-gray-400 bg-gray-50 rounded"></div>
                    <span className="text-gray-600">Unprotected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Alert List */}
        {sidebarOpen && (
          <div className="w-80 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Active Alerts</CardTitle>
                  <Badge variant="danger">{alerts.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading alerts...
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="text-4xl mb-2">✅</div>
                    <p>No alerts match your filters</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedAlert?.id === alert.id ? "bg-green-50 border-l-4 border-green-500" : ""
                        }`}
                        onClick={() => flyToAlert(alert)}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {alert.alertCode}
                          </span>
                          <span
                            className="px-2 py-0.5 text-xs font-semibold rounded"
                            style={{
                              backgroundColor: `${SEVERITY_COLORS[alert.severity]}20`,
                              color: SEVERITY_COLORS[alert.severity],
                            }}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {alert.forestRegion.name}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{alert.areaHectares.toFixed(2)} ha</span>
                          <span>{new Date(alert.detectedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            {alert.status}
                          </span>
                          <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                            {(alert.confidence * 100).toFixed(0)}% conf
                          </span>
                          {alert._count.fieldReports > 0 && (
                            <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-600 rounded">
                              {alert._count.fieldReports} reports
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Alert Details */}
            {selectedAlert && (
              <Card className="mt-4">
                <CardHeader className="border-b">
                  <CardTitle className="text-base">Selected Alert</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium">{selectedAlert.alertCode}</span>
                    <span
                      className="px-2 py-1 text-xs font-semibold rounded"
                      style={{
                        backgroundColor: `${SEVERITY_COLORS[selectedAlert.severity]}20`,
                        color: SEVERITY_COLORS[selectedAlert.severity],
                      }}
                    >
                      {selectedAlert.severity}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-500">Region:</span> {selectedAlert.forestRegion.name}</p>
                    <p><span className="text-gray-500">Area:</span> {selectedAlert.areaHectares.toFixed(2)} ha</p>
                    <p><span className="text-gray-500">Confidence:</span> {(selectedAlert.confidence * 100).toFixed(0)}%</p>
                    <p><span className="text-gray-500">Status:</span> {selectedAlert.status}</p>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Link
                      href={`/dashboard/alerts/${selectedAlert.id}`}
                      className="flex-1 text-center text-sm bg-green-600 text-white py-2 rounded hover:bg-green-700 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* CSS for pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
