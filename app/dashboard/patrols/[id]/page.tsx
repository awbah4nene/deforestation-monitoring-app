"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
});

interface Patrol {
  id: string;
  routeName: string;
  plannedDate: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  priority: number;
  distance: number | null;
  estimatedDuration: number | null;
  objectives: string[];
  equipmentNeeded: string[];
  safetyNotes: string | null;
  completedBy: string | null;
  completionNotes: string | null;
  routeGeometry: any;
  forestRegion: {
    id: string;
    name: string;
    district: string;
    chiefdom: string;
  };
  assignedUsers: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
  }>;
  patrolReports: Array<{
    id: string;
    reportCode: string;
    title: string;
    reportDate: string;
    user: {
      name: string;
      email: string;
    };
  }>;
}

export default function PatrolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [patrol, setPatrol] = useState<Patrol | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPatrolDetails();
  }, [params.id]);

  const fetchPatrolDetails = async () => {
    try {
      const response = await fetch(`/api/patrols/${params.id}`);
      const data = await response.json();
      setPatrol(data.patrol);
    } catch (error) {
      console.error("Error fetching patrol details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/patrols/${params.id}/start`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchPatrolDetails();
        alert("Patrol started successfully!");
      } else {
        alert("Failed to start patrol");
      }
    } catch (error) {
      console.error("Error starting patrol:", error);
      alert("Failed to start patrol");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    const notes = prompt("Completion notes (optional):");
    setActionLoading(true);
    try {
      const response = await fetch(`/api/patrols/${params.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completionNotes: notes || null,
        }),
      });

      if (response.ok) {
        await fetchPatrolDetails();
        alert("Patrol completed successfully!");
      } else {
        alert("Failed to complete patrol");
      }
    } catch (error) {
      console.error("Error completing patrol:", error);
      alert("Failed to complete patrol");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading patrol details...</p>
      </div>
    );
  }

  if (!patrol) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Patrol not found</p>
          <Link href="/dashboard/patrols">
            <Button>Back to Patrols</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAssigned = patrol.assignedUsers.some(
    (u) => u.id === session?.user?.id
  );
  const canManage = session?.user?.role === "ADMIN" || session?.user?.role === "GOVERNMENT_OFFICIAL";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/patrols">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{patrol.routeName}</h1>
          <p className="text-gray-600 mt-1">
            {patrol.forestRegion.name} • {new Date(patrol.plannedDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              patrol.status === "COMPLETED"
                ? "success"
                : patrol.status === "IN_PROGRESS"
                ? "info"
                : "warning"
            }
          >
            {patrol.status.replace(/_/g, " ")}
          </Badge>
          {patrol.status === "PLANNED" && (isAssigned || canManage) && (
            <Button onClick={handleStart} disabled={actionLoading}>
              Start Patrol
            </Button>
          )}
          {patrol.status === "IN_PROGRESS" && (isAssigned || canManage) && (
            <Button onClick={handleComplete} disabled={actionLoading}>
              Complete Patrol
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patrol Information */}
          <Card>
            <CardHeader>
              <CardTitle>Patrol Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Region</p>
                  <p className="font-medium">{patrol.forestRegion.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">District / Chiefdom</p>
                  <p className="font-medium">
                    {patrol.forestRegion.district}, {patrol.forestRegion.chiefdom}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Planned Date</p>
                  <p className="font-medium">
                    {new Date(patrol.plannedDate).toLocaleString()}
                  </p>
                </div>
                {patrol.startDate && (
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">
                      {new Date(patrol.startDate).toLocaleString()}
                    </p>
                  </div>
                )}
                {patrol.endDate && (
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium">
                      {new Date(patrol.endDate).toLocaleString()}
                    </p>
                  </div>
                )}
                {patrol.distance && (
                  <div>
                    <p className="text-sm text-gray-600">Distance</p>
                    <p className="font-medium">{patrol.distance.toFixed(1)} km</p>
                  </div>
                )}
                {patrol.estimatedDuration && (
                  <div>
                    <p className="text-sm text-gray-600">Estimated Duration</p>
                    <p className="font-medium">
                      {Math.floor(patrol.estimatedDuration / 60)}h {patrol.estimatedDuration % 60}m
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <p className="font-medium">{patrol.priority}/10</p>
                </div>
              </div>

              {patrol.objectives.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-2">Objectives</p>
                  <ul className="list-disc list-inside space-y-1">
                    {patrol.objectives.map((obj, index) => (
                      <li key={index} className="text-gray-700">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {patrol.equipmentNeeded.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-2">Equipment Needed</p>
                  <div className="flex flex-wrap gap-2">
                    {patrol.equipmentNeeded.map((eq, index) => (
                      <Badge key={index} variant="info" size="sm">
                        {eq}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {patrol.safetyNotes && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-2">Safety Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{patrol.safetyNotes}</p>
                </div>
              )}

              {patrol.completionNotes && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-2">Completion Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{patrol.completionNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Route Map */}
          {patrol.routeGeometry && (
            <Card>
              <CardHeader>
                <CardTitle>Patrol Route</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <MapComponent
                  center={[9.5, -12.0]}
                  zoom={11}
                  className="h-[400px] w-full"
                  onMapReady={(map) => {
                    const L = require("leaflet");
                    if (patrol.routeGeometry) {
                      L.geoJSON(patrol.routeGeometry, {
                        style: {
                          color: "#22c55e",
                          weight: 4,
                          opacity: 0.8,
                        },
                      }).addTo(map);
                      const bounds = L.geoJSON(patrol.routeGeometry).getBounds();
                      map.fitBounds(bounds);
                    }
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Patrol Reports */}
          {patrol.patrolReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Patrol Reports ({patrol.patrolReports.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patrol.patrolReports.map((report) => (
                    <Link
                      key={report.id}
                      href={`/dashboard/reports/${report.id}`}
                      className="block"
                    >
                      <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{report.title}</p>
                            <p className="text-sm text-gray-600">
                              {report.reportCode} • {new Date(report.reportDate).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">
                            By: {report.user.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned Users */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Field Officers</CardTitle>
            </CardHeader>
            <CardContent>
              {patrol.assignedUsers.length > 0 ? (
                <div className="space-y-3">
                  {patrol.assignedUsers.map((user) => (
                    <div key={user.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.phone && (
                        <p className="text-xs text-gray-500">{user.phone}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No officers assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href={`/dashboard/reports/new?patrolId=${patrol.id}`}>
                  <Button variant="ghost" className="w-full justify-start">
                    📝 Submit Report
                  </Button>
                </Link>
                <Link href={`/dashboard/map?patrol=${patrol.id}`}>
                  <Button variant="ghost" className="w-full justify-start">
                    🗺️ View on Map
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
