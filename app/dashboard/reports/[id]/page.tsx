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

interface FieldReport {
  id: string;
  reportCode: string;
  title: string;
  description: string;
  reportType: string;
  reportDate: string;
  visitDate: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  deforestationObserved: boolean;
  estimatedAreaLoss: number | null;
  cause: string | null;
  evidencePhotos: string[];
  notes: string | null;
  weather: string | null;
  temperature: number | null;
  isVerified: boolean;
  verifiedBy: string | null;
  verifiedDate: string | null;
  forestRegion: {
    id: string;
    name: string;
    district: string;
    chiefdom: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  evidenceCollections: Array<{
    id: string;
    collectedDate: string;
    evidenceType: string;
    description: string;
    filePaths: string[];
    collector: {
      name: string;
      email: string;
    };
  }>;
  deforestationAlerts: Array<{
    id: string;
    alertCode: string;
    severity: string;
    status: string;
  }>;
}

function formatEnum(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [report, setReport] = useState<FieldReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportDetails();
  }, [params.id]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/reports/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Report not found.");
        } else if (response.status === 403) {
          setError("You do not have permission to view this report.");
        } else {
          setError("Failed to load report details. Please try again.");
        }
        setReport(null);
        return;
      }

      const data = await response.json();
      setReport(data.report ?? null);
    } catch (error) {
      console.error("Error fetching report details:", error);
      setError("Failed to load report details. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (verified: boolean) => {
    if (!confirm(`Are you sure you want to ${verified ? "verify" : "unverify"} this report?`)) {
      return;
    }

    setVerifying(true);
    try {
      const verificationNotes = prompt("Verification notes (optional):");
      const response = await fetch(`/api/reports/${params.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verified,
          verificationNotes: verificationNotes || null,
        }),
      });

      if (response.ok) {
        await fetchReportDetails();
        alert(`Report ${verified ? "verified" : "unverified"} successfully`);
      } else {
        alert("Failed to verify report");
      }
    } catch (error) {
      console.error("Error verifying report:", error);
      alert("Failed to verify report");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading report details...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {error || "Report not found."}
          </p>
          <Link href="/dashboard/reports">
            <Button>Back to Reports</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canVerify = session?.user?.role === "ADMIN" || session?.user?.role === "GOVERNMENT_OFFICIAL";
  const hasValidCoordinates =
    typeof report.latitude === "number" &&
    typeof report.longitude === "number" &&
    Number.isFinite(report.latitude) &&
    Number.isFinite(report.longitude);

  const evidencePhotos = Array.isArray(report.evidencePhotos)
    ? report.evidencePhotos
    : [];

  const evidenceCollections = Array.isArray(report.evidenceCollections)
    ? report.evidenceCollections
    : [];

  const deforestationAlerts = Array.isArray(report.deforestationAlerts)
    ? report.deforestationAlerts
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/reports">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
          <p className="text-gray-600 mt-1">
            {report.reportCode} • {new Date(report.reportDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={report.isVerified ? "success" : "warning"}
          >
            {report.isVerified ? "Verified" : "Pending Verification"}
          </Badge>
          {report.deforestationObserved && (
            <Badge variant="danger">Deforestation Observed</Badge>
          )}
          {canVerify && (
            <Button
              variant="secondary"
              onClick={() => handleVerify(!report.isVerified)}
              disabled={verifying}
            >
              {report.isVerified ? "Unverify" : "Verify Report"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Information */}
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Report Type</p>
                  <p className="font-medium">{formatEnum(report.reportType)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Visit Date</p>
                  <p className="font-medium">
                    {new Date(report.visitDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Region</p>
                  <p className="font-medium">{report.forestRegion.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">District / Chiefdom</p>
                  <p className="font-medium">
                    {report.forestRegion.district}, {report.forestRegion.chiefdom}
                  </p>
                </div>
                {report.weather && (
                  <div>
                    <p className="text-sm text-gray-600">Weather</p>
                    <p className="font-medium">{report.weather}</p>
                  </div>
                )}
                {report.temperature && (
                  <div>
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="font-medium">{report.temperature}°C</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
              </div>

              {report.notes && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-2">Additional Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{report.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deforestation Details */}
          {report.deforestationObserved && (
            <Card>
              <CardHeader>
                <CardTitle>Deforestation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {typeof report.estimatedAreaLoss === "number" && !isNaN(report.estimatedAreaLoss) && (
                    <div>
                      <p className="text-sm text-gray-600">Estimated Area Loss</p>
                      <p className="font-medium">{report.estimatedAreaLoss.toFixed(2)} hectares</p>
                    </div>
                  )}
                  {report.cause && (
                    <div>
                      <p className="text-sm text-gray-600">Cause</p>
                      <p className="font-medium">{formatEnum(report.cause)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evidence Photos */}
          {evidencePhotos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Evidence Photos ({report.evidencePhotos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {evidencePhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                        onClick={() => window.open(photo, "_blank")}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evidence Collections */}
          {evidenceCollections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Evidence Collections ({report.evidenceCollections.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {evidenceCollections.map((evidence) => (
                    <div key={evidence.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">
                          {formatEnum(evidence.evidenceType)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(evidence.collectedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{evidence.description}</p>
                      <p className="text-xs text-gray-500">
                        Collected by: {evidence.collector.name}
                      </p>
                      {evidence.filePaths.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {evidence.filePaths.map((path, idx) => (
                            <a
                              key={idx}
                              href={path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-green-600 hover:text-green-700"
                            >
                              View File {idx + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Alerts */}
          {deforestationAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Alerts ({report.deforestationAlerts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deforestationAlerts.map((alert) => (
                    <Link
                      key={alert.id}
                      href={`/dashboard/alerts/${alert.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{alert.alertCode}</p>
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
                          {formatEnum(alert.severity)}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location Map */}
          {hasValidCoordinates && (
            <Card>
              <CardHeader>
                <CardTitle>Report Location</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <MapComponent
                  center={[report.latitude, report.longitude]}
                  zoom={15}
                  className="h-[400px] w-full"
                  onMapReady={(map) => {
                    const L = require("leaflet");
                    L.marker([report.latitude, report.longitude])
                      .addTo(map)
                      .bindPopup(`Report: ${report.reportCode}`)
                      .openPopup();
                    
                    if (typeof report.accuracy === "number" && !isNaN(report.accuracy)) {
                      L.circle([report.latitude, report.longitude], {
                        radius: report.accuracy,
                        color: "#22c55e",
                        fillOpacity: 0.2,
                      }).addTo(map);
                    }
                  }}
                />
                <div className="p-4 border-t">
                  <p className="text-sm text-gray-600">
                    Coordinates: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                  </p>
                  {typeof report.accuracy === "number" && !isNaN(report.accuracy) && (
                    <p className="text-sm text-gray-600">
                      GPS Accuracy: ±{report.accuracy.toFixed(0)} meters
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Report Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Report Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Submitted By</p>
                  <p className="font-medium">{report.user.name}</p>
                  <p className="text-xs text-gray-500">{report.user.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Report Date</p>
                  <p className="font-medium">
                    {new Date(report.reportDate).toLocaleString()}
                  </p>
                </div>
                {report.isVerified && report.verifiedDate && (
                  <div>
                    <p className="text-gray-600">Verified Date</p>
                    <p className="font-medium">
                      {new Date(report.verifiedDate).toLocaleString()}
                    </p>
                  </div>
                )}
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
                <Link href={`/dashboard/reports/${report.id}/edit`}>
                  <Button variant="ghost" className="w-full justify-start">
                    ✏️ Edit Report
                  </Button>
                </Link>
                <Link href={`/dashboard/alerts?reportId=${report.id}`}>
                  <Button variant="ghost" className="w-full justify-start">
                    🚨 View Related Alerts
                  </Button>
                </Link>
                <Link href={`/dashboard/map?report=${report.id}`}>
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
