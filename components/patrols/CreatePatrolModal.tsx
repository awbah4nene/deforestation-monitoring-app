"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
});

interface ForestRegion {
  id: string;
  name: string;
  district: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface CreatePatrolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePatrolModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePatrolModalProps) {
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState<ForestRegion[]>([]);
  const [fieldOfficers, setFieldOfficers] = useState<User[]>([]);
  const [routePoints, setRoutePoints] = useState<Array<[number, number]>>([]);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    routeName: "",
    regionId: "",
    assignedTo: [] as string[],
    plannedDate: new Date().toISOString().split("T")[0],
    priority: "5",
    distance: "",
    estimatedDuration: "",
    objectives: [] as string[],
    equipmentNeeded: [] as string[],
    safetyNotes: "",
    newObjective: "",
    newEquipment: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchRegions();
      fetchFieldOfficers();
    }
  }, [isOpen]);

  const fetchRegions = async () => {
    try {
      const response = await fetch("/api/map/regions");
      const data = await response.json();
      setRegions(data.regions || []);
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  const fetchFieldOfficers = async () => {
    try {
      const response = await fetch("/api/users?role=FIELD_OFFICER&isActive=true");
      const data = await response.json();
      setFieldOfficers(data.users || []);
    } catch (error) {
      console.error("Error fetching field officers:", error);
    }
  };

  const handleMapReady = (leafletMap: any) => {
    setMap(leafletMap);
    const L = require("leaflet");

    // Enable drawing on map
    leafletMap.on("click", (e: any) => {
      const { lat, lng } = e.latlng;
      const newPoint: [number, number] = [lat, lng];
      setRoutePoints((prev) => [...prev, newPoint]);

      // Add marker
      const marker = L.marker([lat, lng]).addTo(leafletMap);
      setMarkers((prev) => [...prev, marker]);

      // Draw polyline if multiple points
      if (routePoints.length > 0) {
        L.polyline([...routePoints, newPoint], {
          color: "#22c55e",
          weight: 3,
        }).addTo(leafletMap);
      }
    });
  };

  const clearRoute = () => {
    if (map) {
      const L = require("leaflet");
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });
    }
    setRoutePoints([]);
    setMarkers([]);
  };

  const addObjective = () => {
    if (formData.newObjective.trim()) {
      setFormData({
        ...formData,
        objectives: [...formData.objectives, formData.newObjective],
        newObjective: "",
      });
    }
  };

  const removeObjective = (index: number) => {
    setFormData({
      ...formData,
      objectives: formData.objectives.filter((_, i) => i !== index),
    });
  };

  const addEquipment = () => {
    if (formData.newEquipment.trim()) {
      setFormData({
        ...formData,
        equipmentNeeded: [...formData.equipmentNeeded, formData.newEquipment],
        newEquipment: "",
      });
    }
  };

  const removeEquipment = (index: number) => {
    setFormData({
      ...formData,
      equipmentNeeded: formData.equipmentNeeded.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create GeoJSON from route points
      const routeGeometry = routePoints.length > 0
        ? {
            type: "LineString",
            coordinates: routePoints.map(([lat, lng]) => [lng, lat]),
          }
        : null;

      // Calculate distance (simplified)
      let distance = null;
      if (routePoints.length > 1) {
        // Simple distance calculation (would use proper geodesic in production)
        let totalDistance = 0;
        for (let i = 1; i < routePoints.length; i++) {
          const [lat1, lng1] = routePoints[i - 1];
          const [lat2, lng2] = routePoints[i];
          const dLat = (lat2 - lat1) * 111.32; // km
          const dLng = (lng2 - lng1) * 111.32 * Math.cos((lat1 * Math.PI) / 180);
          totalDistance += Math.sqrt(dLat * dLat + dLng * dLng);
        }
        distance = totalDistance;
      }

      const response = await fetch("/api/patrols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          assignedTo: formData.assignedTo,
          routeGeometry,
          distance: distance || (formData.distance ? parseFloat(formData.distance) : null),
          estimatedDuration: formData.estimatedDuration
            ? parseInt(formData.estimatedDuration)
            : null,
          priority: parseInt(formData.priority),
        }),
      });

      if (response.ok) {
        onSuccess();
        setFormData({
          routeName: "",
          regionId: "",
          assignedTo: [],
          plannedDate: new Date().toISOString().split("T")[0],
          priority: "5",
          distance: "",
          estimatedDuration: "",
          objectives: [],
          equipmentNeeded: [],
          safetyNotes: "",
          newObjective: "",
          newEquipment: "",
        });
        clearRoute();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create patrol");
      }
    } catch (error) {
      console.error("Error creating patrol:", error);
      alert("Failed to create patrol");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create Patrol Route</CardTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Route Name *"
              required
              value={formData.routeName}
              onChange={(e) =>
                setFormData({ ...formData, routeName: e.target.value })
              }
            />

            <Select
              label="Forest Region *"
              required
              options={[
                { value: "", label: "Select a region..." },
                ...regions.map((r) => ({
                  value: r.id,
                  label: `${r.name} (${r.district})`,
                })),
              ]}
              value={formData.regionId}
              onChange={(e) =>
                setFormData({ ...formData, regionId: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Planned Date *"
                type="date"
                required
                value={formData.plannedDate}
                onChange={(e) =>
                  setFormData({ ...formData, plannedDate: e.target.value })
                }
              />
              <Input
                label="Priority (1-10)"
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Distance (km)"
                type="number"
                step="0.1"
                value={formData.distance}
                onChange={(e) =>
                  setFormData({ ...formData, distance: e.target.value })
                }
              />
              <Input
                label="Estimated Duration (minutes)"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedDuration: e.target.value })
                }
              />
            </div>

            {/* Assign Field Officers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Field Officers
              </label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
                {fieldOfficers.map((officer) => (
                  <label
                    key={officer.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignedTo.includes(officer.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            assignedTo: [...formData.assignedTo, officer.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            assignedTo: formData.assignedTo.filter(
                              (id) => id !== officer.id
                            ),
                          });
                        }
                      }}
                      className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-900">
                      {officer.name} ({officer.email})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Route Map */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Patrol Route (Click on map to add waypoints)
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={clearRoute}
                >
                  Clear Route
                </Button>
              </div>
              <div className="h-64 w-full border rounded-lg overflow-hidden">
                <MapComponent
                  center={[9.5, -12.0]}
                  zoom={10}
                  className="h-full w-full"
                  onMapReady={handleMapReady}
                />
              </div>
              {routePoints.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {routePoints.length} waypoint(s) added
                </p>
              )}
            </div>

            {/* Objectives */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patrol Objectives
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={formData.newObjective}
                  onChange={(e) =>
                    setFormData({ ...formData, newObjective: e.target.value })
                  }
                  placeholder="Add objective..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addObjective();
                    }
                  }}
                />
                <Button type="button" onClick={addObjective}>
                  Add
                </Button>
              </div>
              {formData.objectives.length > 0 && (
                <div className="space-y-1">
                  {formData.objectives.map((obj, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-900">{obj}</span>
                      <button
                        type="button"
                        onClick={() => removeObjective(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Equipment Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Needed
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={formData.newEquipment}
                  onChange={(e) =>
                    setFormData({ ...formData, newEquipment: e.target.value })
                  }
                  placeholder="Add equipment..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEquipment();
                    }
                  }}
                />
                <Button type="button" onClick={addEquipment}>
                  Add
                </Button>
              </div>
              {formData.equipmentNeeded.length > 0 && (
                <div className="space-y-1">
                  {formData.equipmentNeeded.map((eq, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-900">{eq}</span>
                      <button
                        type="button"
                        onClick={() => removeEquipment(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Safety Notes
              </label>
              <textarea
                value={formData.safetyNotes}
                onChange={(e) =>
                  setFormData({ ...formData, safetyNotes: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Patrol"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
