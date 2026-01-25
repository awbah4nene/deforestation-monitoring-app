"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import EditBoundariesModal from "@/components/regions/EditBoundariesModal";

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

export default function RegionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [region, setRegion] = useState<RegionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showEditBoundaries, setShowEditBoundaries] = useState(false);

  useEffect(() => {
    fetchRegionDetails();
    fetchUserRole();
  }, [params.id]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();
      setUserRole(data.user?.role || null);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const fetchRegionDetails = async () => {
    try {
      const response = await fetch(`/api/regions/${params.id}`);
      const data = await response.json();
      setRegion(data.region);
    } catch (error) {
      console.error("Error fetching region details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading region details...</p>
      </div>
    );
  }

  if (!region) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Region not found</p>
          <Link href="/dashboard/regions">
            <Button>Back to Regions</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/regions">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{region.name}</h1>
          <p className="text-gray-600 mt-1">
            {region.district}, {region.chiefdom} • Code: {region.regionCode}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userRole === "ADMIN" && (
            <Button
              variant="secondary"
              onClick={() => setShowEditBoundaries(true)}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              Edit Boundaries
            </Button>
          )}
          <Button variant="secondary">
            <svg
              className="w-5 h-5 mr-2"
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
            Edit Region
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Region Information */}
          <Card>
            <CardHeader>
              <CardTitle>Region Information</CardTitle>
            </CardHeader>
            <CardContent>
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
                    {region.areaHectares.toFixed(2)} hectares
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
                    {region.vegetationType.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Protection Status</p>
                  <Badge
                    variant={
                      region.protectionStatus === "STRICTLY_PROTECTED"
                        ? "danger"
                        : region.protectionStatus === "PROTECTED"
                        ? "success"
                        : "info"
                    }
                  >
                    {region.protectionStatus.replace(/_/g, " ")}
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
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-700">{region.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Area Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Area Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Area</p>
                  <p className="text-2xl font-bold text-green-600">
                    {region.areaHectares.toFixed(2)} ha
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Forest Plots</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {region._count.forestPlots}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Satellite Images</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {region._count.satelliteImages}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Field Reports</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {region._count.fieldReports}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Alerts ({region._count.deforestationAlerts})</CardTitle>
                <Link href={`/dashboard/alerts?regionId=${region.id}`}>
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {region.deforestationAlerts.length > 0 ? (
                <div className="space-y-3">
                  {region.deforestationAlerts.map((alert) => (
                    <Link
                      key={alert.id}
                      href={`/dashboard/alerts/${alert.id}`}
                      className="block"
                    >
                      <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{alert.alertCode}</p>
                          <div className="flex items-center gap-2">
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
                            <Badge
                              variant={
                                alert.status === "PENDING"
                                  ? "warning"
                                  : alert.status === "VERIFIED"
                                  ? "success"
                                  : "info"
                              }
                              size="sm"
                            >
                              {alert.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{alert.areaHectares.toFixed(2)} ha</span>
                          <span>
                            {new Date(alert.detectedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No alerts in this region</p>
              )}
            </CardContent>
          </Card>

          {/* Active Patrols */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Patrols ({region._count.patrolRoutes})</CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {region.patrolRoutes.length > 0 ? (
                <div className="space-y-3">
                  {region.patrolRoutes.map((patrol) => (
                    <div
                      key={patrol.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{patrol.routeName}</p>
                        <Badge
                          variant={
                            patrol.status === "IN_PROGRESS"
                              ? "info"
                              : "warning"
                          }
                          size="sm"
                        >
                          {patrol.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          Planned: {new Date(patrol.plannedDate).toLocaleDateString()}
                        </span>
                        {patrol.distance && (
                          <span>{patrol.distance.toFixed(1)} km</span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Priority: {patrol.priority}/10
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No active patrols</p>
              )}
            </CardContent>
          </Card>

          {/* Biodiversity Data */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Biodiversity Records ({region._count.biodiversityRecords})</CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {region.biodiversityRecords.length > 0 ? (
                <div className="space-y-3">
                  {region.biodiversityRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {record.speciesName}
                          </p>
                          {record.scientificName && (
                            <p className="text-sm text-gray-500 italic">
                              {record.scientificName}
                            </p>
                          )}
                        </div>
                        {record.isEndangered && (
                          <Badge variant="danger" size="sm">Endangered</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{record.speciesType.replace(/_/g, " ")}</span>
                        {record.count && <span>Count: {record.count}</span>}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Observed: {new Date(record.observationDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No biodiversity records</p>
              )}
            </CardContent>
          </Card>

          {/* Carbon Stock Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Carbon Stock Information</CardTitle>
                <Button variant="ghost" size="sm">View History</Button>
              </div>
            </CardHeader>
            <CardContent>
              {region.carbonStocks.length > 0 ? (
                <div className="space-y-4">
                  {region.carbonStocks.map((stock) => (
                    <div key={stock.id} className="p-4 bg-green-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Carbon Density</p>
                          <p className="text-xl font-bold text-green-600">
                            {stock.carbonDensity.toFixed(2)} tons/ha
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Carbon</p>
                          <p className="text-xl font-bold text-green-600">
                            {stock.totalCarbon.toFixed(2)} tons
                          </p>
                        </div>
                      </div>
                      {stock.carbonChange !== null && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">Carbon Change</p>
                          <p
                            className={`text-lg font-semibold ${
                              stock.carbonChange >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {stock.carbonChange >= 0 ? "+" : ""}
                            {stock.carbonChange.toFixed(2)} tons
                          </p>
                        </div>
                      )}
                      <div className="text-sm text-gray-600">
                        <p>Methodology: {stock.methodology}</p>
                        <p>
                          Measured: {new Date(stock.measurementDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No carbon stock measurements available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle>Location Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {region.centroid && (
                <MapComponent
                  center={[
                    region.centroid.coordinates[1],
                    region.centroid.coordinates[0],
                  ]}
                  zoom={11}
                  className="h-[400px] w-full"
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
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Region Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Deforestation Alerts</p>
                    <p className="text-2xl font-bold text-red-600">
                      {region._count.deforestationAlerts}
                    </p>
                  </div>
                  <div className="text-3xl">🚨</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Field Reports</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {region._count.fieldReports}
                    </p>
                  </div>
                  <div className="text-3xl">📝</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Forest Plots</p>
                    <p className="text-2xl font-bold text-green-600">
                      {region._count.forestPlots}
                    </p>
                  </div>
                  <div className="text-3xl">🌲</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Satellite Images</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {region._count.satelliteImages}
                    </p>
                  </div>
                  <div className="text-3xl">🛰️</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link
                  href={`/dashboard/alerts?regionId=${region.id}`}
                  className="block"
                >
                  <Button variant="ghost" className="w-full justify-start">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    View Alerts
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  View Reports
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium">
                    {new Date(region.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="font-medium">
                    {new Date(region.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Region ID</p>
                  <p className="font-mono text-xs text-gray-500">{region.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Boundaries Modal */}
      {userRole === "ADMIN" && (
        <EditBoundariesModal
          isOpen={showEditBoundaries}
          onClose={() => setShowEditBoundaries(false)}
          regionId={region.id}
          currentGeometry={region.geometry}
          onSave={async (geometry) => {
            try {
              const response = await fetch(`/api/regions/${region.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ geometry }),
              });

              if (response.ok) {
                await fetchRegionDetails();
                alert("Boundaries updated successfully!");
              } else {
                throw new Error("Failed to update boundaries");
              }
            } catch (error) {
              console.error("Error saving boundaries:", error);
              throw error;
            }
          }}
        />
      )}
    </div>
  );
}
