"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
});

interface RegionDetail {
  id: string;
  name: string;
  regionCode: string;
  district: string;
  chiefdom: string;
  areaHectares: number;
  geometry: any;
  centroid: any;
  elevation: number | null;
  vegetationType: string;
  protectionStatus: string;
  description: string | null;
  population: number | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    deforestationAlerts: number;
    fieldReports: number;
    forestPlots: number;
    satelliteImages: number;
    patrolRoutes: number;
    biodiversityRecords: number;
    carbonStocks: number;
  };
  deforestationAlerts: Array<{
    id: string;
    alertCode: string;
    detectedDate: string;
    severity: string;
    status: string;
    areaHectares: number;
  }>;
  patrolRoutes: Array<{
    id: string;
    routeName: string;
    plannedDate: string;
    status: string;
    priority: number;
    distance: number | null;
  }>;
  biodiversityRecords: Array<{
    id: string;
    speciesName: string;
    scientificName: string | null;
    speciesType: string;
    observationDate: string;
    count: number | null;
    isEndangered: boolean;
  }>;
  carbonStocks: Array<{
    id: string;
    measurementDate: string;
    carbonDensity: number;
    totalCarbon: number;
    carbonChange: number | null;
    methodology: string;
  }>;
}

interface ViewRegionModalProps {
  isOpen: boolean;
  regionId: string | null;
  onClose: () => void;
  onEdit?: (regionId: string) => void;
}

export default function ViewRegionModal({
  isOpen,
  regionId,
  onClose,
  onEdit,
}: ViewRegionModalProps) {
  const [region, setRegion] = useState<RegionDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && regionId) {
      fetchRegionDetails();
    }
  }, [isOpen, regionId]);

  const fetchRegionDetails = async () => {
    if (!regionId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/regions/${regionId}`);
      const data = await response.json();
      setRegion(data.region);
    } catch (error) {
      console.error("Error fetching region details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getProtectionColor = (status: string) => {
    switch (status) {
      case "STRICTLY_PROTECTED":
        return "danger";
      case "PROTECTED":
      case "PROTECTED_AREA":
      case "NATIONAL_PARK":
        return "success";
      case "COMMUNITY_MANAGED":
      case "COMMUNITY_FOREST":
        return "info";
      default:
        return "warning";
    }
  };

  return (
    <>
      {/* Backdrop - lighter to see content below */}
      <div
        className="fixed inset-0 bg-black/20 z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Slide-in Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-[60%] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          <Card className="h-full flex flex-col rounded-none border-0 shadow-none">
            <CardHeader className="border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{region?.name || "Region Details"}</CardTitle>
                  {region && (
                    <p className="text-sm text-gray-600 mt-1">
                      {region.district}, {region.chiefdom} • Code: {region.regionCode}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {onEdit && region && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        onEdit(region.id);
                        onClose();
                      }}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </Button>
                  )}
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-600">Loading region details...</p>
                </div>
              ) : !region ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-600">Region not found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Region Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Region Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">District</p>
                        <p className="font-medium">{region.district}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Chiefdom</p>
                        <p className="font-medium">{region.chiefdom}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Area</p>
                        <p className="font-medium">
                          {region.areaHectares?.toFixed(2) || 0} hectares
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Elevation</p>
                        <p className="font-medium">
                          {region.elevation ? `${region.elevation}m` : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Vegetation Type</p>
                        <p className="font-medium">
                          {region.vegetationType?.replace(/_/g, " ") || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Protection Status</p>
                        <Badge
                          variant={getProtectionColor(region.protectionStatus) as any}
                          size="sm"
                        >
                          {region.protectionStatus?.replace(/_/g, " ") || "-"}
                        </Badge>
                      </div>
                      {region.population && (
                        <div>
                          <p className="text-sm text-gray-600">Population</p>
                          <p className="font-medium">
                            {region.population.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    {region.description && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-2">Description</p>
                        <p className="text-gray-700">{region.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Statistics */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-xs text-gray-600">Alerts</p>
                        <p className="text-xl font-bold text-red-600">
                          {region._count?.deforestationAlerts || 0}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600">Reports</p>
                        <p className="text-xl font-bold text-blue-600">
                          {region._count?.fieldReports || 0}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-gray-600">Forest Plots</p>
                        <p className="text-xl font-bold text-green-600">
                          {region._count?.forestPlots || 0}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-xs text-gray-600">Satellite Images</p>
                        <p className="text-xl font-bold text-purple-600">
                          {region._count?.satelliteImages || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Alerts */}
                  {region.deforestationAlerts && region.deforestationAlerts.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Recent Alerts ({region._count?.deforestationAlerts || 0})
                        </h3>
                        <Link href={`/dashboard/alerts?regionId=${region.id}`}>
                          <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                      </div>
                      <div className="space-y-2">
                        {region.deforestationAlerts.slice(0, 3).map((alert) => (
                          <Link
                            key={alert.id}
                            href={`/dashboard/alerts/${alert.id}`}
                            className="block"
                          >
                            <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-sm text-gray-900">{alert.alertCode}</p>
                                <Badge
                                  variant={
                                    alert.severity === "CRITICAL"
                                      ? "danger"
                                      : alert.severity === "HIGH"
                                      ? "warning"
                                      : "info"
                                  }
                                  size="sm"
                                >
                                  {alert.severity}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>{alert.areaHectares?.toFixed(2) || 0} ha</span>
                                <span>
                                  {new Date(alert.detectedDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Map */}
                  {region.centroid && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Map</h3>
                      <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200">
                        <MapComponent
                          center={[
                            region.centroid.coordinates[1],
                            region.centroid.coordinates[0],
                          ]}
                          zoom={11}
                          className="h-full w-full"
                          onMapReady={(map) => {
                            const L = require("leaflet");
                            if (region.geometry) {
                              L.geoJSON(region.geometry, {
                                style: {
                                  color: "#22c55e",
                                  weight: 2,
                                  opacity: 0.8,
                                  fillOpacity: 0.2,
                                },
                              }).addTo(map);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
