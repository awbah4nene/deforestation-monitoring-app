"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { UserRole } from "@prisma/client";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
});

interface AlertDetail {
  id: string;
  alertCode: string;
  forestRegion: {
    name: string;
    regionCode: string;
    district: string;
    chiefdom: string;
    areaHectares: number;
    vegetationType: string;
    protectionStatus: string;
  };
  latitude: number;
  longitude: number;
  geometry: any;
  alertDate: string;
  detectedDate: string;
  areaHectares: number;
  confidence: number;
  severity: string;
  status: string;
  priority: number;
  ndviChange: number | null;
  brightnessChange: number | null;
  beforeImagePath: string | null;
  afterImagePath: string | null;
  verifiedDate: string | null;
  verifiedBy: string | null;
  verificationNotes: string | null;
  estimatedLoss: number | null;
  assignedTo: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
  } | null;
  satelliteImage: {
    id: string;
    source: string;
    imageDate: string;
    resolution: number;
    cloudCover: number;
  } | null;
  alertComments: Array<{
    id: string;
    comment: string;
    attachments: string[];
    createdAt: string;
    user: {
      name: string;
      email: string;
      role: string;
    };
  }>;
  fieldReports: Array<{
    id: string;
    reportCode: string;
    reportType: string;
    title: string;
    reportDate: string;
    deforestationObserved: boolean;
    user: {
      name: string;
      email: string;
    };
  }>;
  cases: Array<{
    id: string;
    caseCode: string;
    status: string;
    openedBy: {
      name: string;
    };
  }>;
}

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [alert, setAlert] = useState<AlertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [assignedUserId, setAssignedUserId] = useState("");
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchAlertDetails();
    fetchAvailableUsers();
  }, [params.id]);

  const fetchAlertDetails = async () => {
    try {
      const response = await fetch(`/api/alerts/${params.id}`);
      const data = await response.json();
      setAlert(data.alert);
      setAssignedUserId(data.alert?.assignedTo?.id || "");
    } catch (error) {
      console.error("Error fetching alert details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async (search?: string) => {
    try {
      const url = search
        ? `/api/users?role=FIELD_OFFICER&isActive=true&search=${encodeURIComponent(search)}`
        : "/api/users?role=FIELD_OFFICER&isActive=true";
      const response = await fetch(url);
      const data = await response.json();
      setAvailableUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userSearch) {
        fetchAvailableUsers(userSearch);
      } else {
        fetchAvailableUsers();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [userSearch]);

  const handleAssign = async () => {
    if (!assignedUserId) return;

    try {
      await fetch(`/api/alerts/${params.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: assignedUserId }),
      });
      await fetchAlertDetails();
      alert("Alert assigned successfully!");
    } catch (error) {
      console.error("Error assigning alert:", error);
      alert("Failed to assign alert");
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await fetch(`/api/alerts/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchAlertDetails();
      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() && !selectedFile) return;

    setSubmittingComment(true);
    try {
      const attachments: string[] = [];
      
      // Handle file upload if present
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("alertId", params.id as string);
        
        const uploadResponse = await fetch("/api/alerts/upload", {
          method: "POST",
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          attachments.push(uploadData.fileUrl);
        }
      }

      await fetch(`/api/alerts/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          comment: newComment || "File attachment",
          attachments 
        }),
      });
      setNewComment("");
      setSelectedFile(null);
      await fetchAlertDetails();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading alert details...</p>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Alert not found</p>
          <Link href="/dashboard/alerts">
            <Button>Back to Alerts</Button>
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
            <Link href="/dashboard/alerts">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Alert: {alert.alertCode}
          </h1>
          <p className="text-gray-600 mt-1">
            Detected on {new Date(alert.detectedDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={alert.severity === "CRITICAL" ? "danger" : alert.severity === "HIGH" ? "warning" : "info"}>
            {alert.severity}
          </Badge>
          <Badge variant={alert.status === "VERIFIED" ? "success" : alert.status === "PENDING" ? "warning" : "info"}>
            {alert.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alert Information */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Region</p>
                  <p className="font-medium">{alert.forestRegion.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">District / Chiefdom</p>
                  <p className="font-medium">
                    {alert.forestRegion.district}, {alert.forestRegion.chiefdom}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Area Affected</p>
                  <p className="font-medium">{alert.areaHectares.toFixed(2)} hectares</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="font-medium">{(alert.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <p className="font-medium">{alert.priority}/10</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Coordinates</p>
                  <p className="font-medium text-sm">
                    {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                  </p>
                </div>
                {alert.ndviChange && (
                  <div>
                    <p className="text-sm text-gray-600">NDVI Change</p>
                    <p className="font-medium">{alert.ndviChange.toFixed(3)}</p>
                  </div>
                )}
                {alert.estimatedLoss && (
                  <div>
                    <p className="text-sm text-gray-600">Estimated Loss</p>
                    <p className="font-medium">${alert.estimatedLoss.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle>Location Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <MapComponent
                center={[alert.latitude, alert.longitude]}
                zoom={13}
                className="h-[400px] w-full"
                onMapReady={(map) => {
                  // Add marker for alert
                  const L = require("leaflet");
                  L.marker([alert.latitude, alert.longitude]).addTo(map);
                }}
              />
            </CardContent>
          </Card>

          {/* Before/After Images */}
          {(alert.beforeImagePath || alert.afterImagePath) && (
            <Card>
              <CardHeader>
                <CardTitle>Satellite Imagery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {alert.beforeImagePath && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Before</p>
                      <div className="bg-gray-200 h-48 rounded flex items-center justify-center">
                        <p className="text-gray-500">Image Preview</p>
                      </div>
                    </div>
                  )}
                  {alert.afterImagePath && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">After</p>
                      <div className="bg-gray-200 h-48 rounded flex items-center justify-center">
                        <p className="text-gray-500">Image Preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Field Reports */}
          {alert.fieldReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Field Reports ({alert.fieldReports.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alert.fieldReports.map((report) => (
                    <div key={report.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{report.title}</p>
                        <Badge variant={report.deforestationObserved ? "danger" : "success"} size="sm">
                          {report.deforestationObserved ? "Confirmed" : "Not Confirmed"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        By {report.user.name} on {new Date(report.reportDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Comments & Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add Comment */}
                <div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => document.querySelector('input[type="file"]')?.click()}
                      >
                        📎 Attach File
                      </Button>
                    </label>
                    {selectedFile && (
                      <span className="text-sm text-gray-600">
                        {selectedFile.name}
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="ml-2 text-red-600 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={handleAddComment}
                    disabled={submittingComment || (!newComment.trim() && !selectedFile)}
                    className="mt-2"
                  >
                    {submittingComment ? "Posting..." : "Post Comment"}
                  </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {alert.alertComments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{comment.user.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="info" size="sm">
                          {comment.user.role}
                        </Badge>
                      </div>
                      <p className="text-gray-700">{comment.comment}</p>
                    </div>
                  ))}
                  {alert.alertComments.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No comments yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Workflow */}
          <Card>
            <CardHeader>
              <CardTitle>Status Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant={alert.status === "IN_PROGRESS" ? "primary" : "secondary"}
                  className="w-full"
                  onClick={() => handleStatusUpdate("IN_PROGRESS")}
                  disabled={updatingStatus || alert.status === "IN_PROGRESS"}
                >
                  Mark In Progress
                </Button>
                <Button
                  variant={alert.status === "VERIFIED" ? "primary" : "secondary"}
                  className="w-full"
                  onClick={() => handleStatusUpdate("VERIFIED")}
                  disabled={updatingStatus || alert.status === "VERIFIED"}
                >
                  Mark Verified
                </Button>
                <Button
                  variant={alert.status === "RESOLVED" ? "success" : "secondary"}
                  className="w-full"
                  onClick={() => handleStatusUpdate("RESOLVED")}
                  disabled={updatingStatus || alert.status === "RESOLVED"}
                >
                  Mark Resolved
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => handleStatusUpdate("FALSE_POSITIVE")}
                  disabled={updatingStatus}
                >
                  Mark False Positive
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alert.assignedTo ? (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Assigned to</p>
                    <p className="font-medium">{alert.assignedTo.name}</p>
                    <p className="text-sm text-gray-600">{alert.assignedTo.email}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Not assigned yet</p>
                )}
                <Input
                  placeholder="Search field officers..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="mb-2"
                />
                <Select
                  options={[
                    { value: "", label: "Select field officer..." },
                    ...availableUsers.map((user) => ({
                      value: user.id,
                      label: `${user.name} (${user.email})`,
                    })),
                  ]}
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                />
                <Button onClick={handleAssign} className="w-full" disabled={!assignedUserId}>
                  Assign Alert
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Region Info */}
          <Card>
            <CardHeader>
              <CardTitle>Region Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Vegetation Type</p>
                  <p className="font-medium">{alert.forestRegion.vegetationType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Protection Status</p>
                  <p className="font-medium">{alert.forestRegion.protectionStatus}</p>
                </div>
                <div>
                  <p className="text-gray-600">Region Area</p>
                  <p className="font-medium">{alert.forestRegion.areaHectares.toFixed(2)} ha</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Satellite Info */}
          {alert.satelliteImage && (
            <Card>
              <CardHeader>
                <CardTitle>Satellite Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Source</p>
                    <p className="font-medium">{alert.satelliteImage.source}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Image Date</p>
                    <p className="font-medium">
                      {new Date(alert.satelliteImage.imageDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Resolution</p>
                    <p className="font-medium">{alert.satelliteImage.resolution}m</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cloud Cover</p>
                    <p className="font-medium">{alert.satelliteImage.cloudCover}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
