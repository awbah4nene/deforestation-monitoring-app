"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import CreateAlertModal from "@/components/alerts/CreateAlertModal";

interface Alert {
  id: string;
  alertCode: string;
  forestRegion: {
    name: string;
    district: string;
    chiefdom: string;
  };
  latitude: number;
  longitude: number;
  alertDate: string;
  detectedDate: string;
  areaHectares: number;
  confidence: number;
  severity: string;
  status: string;
  priority: number;
  assignedTo: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  _count: {
    alertComments: number;
    fieldReports: number;
  };
}

type SortField = "alertCode" | "detectedDate" | "areaHectares" | "severity" | "status" | "priority";
type SortDirection = "asc" | "desc";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [sortField, setSortField] = useState<SortField>("detectedDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [editingPriority, setEditingPriority] = useState<string | null>(null);
  const [newPriority, setNewPriority] = useState<number>(5);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    severity: "",
    district: "",
    search: "",
  });

  useEffect(() => {
    fetchAlerts();
  }, [page, filters]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      });

      const response = await fetch(`/api/alerts?${params}`);
      const data = await response.json();

      setAlerts(data.alerts || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "danger";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "IN_PROGRESS":
        return "info";
      case "VERIFIED":
        return "success";
      case "RESOLVED":
        return "success";
      case "FALSE_POSITIVE":
        return "default";
      default:
        return "default";
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlerts(new Set(alerts.map((a) => a.id)));
      setShowBulkActions(true);
    } else {
      setSelectedAlerts(new Set());
      setShowBulkActions(false);
    }
  };

  const handleSelectAlert = (alertId: string, checked: boolean) => {
    const newSelected = new Set(selectedAlerts);
    if (checked) {
      newSelected.add(alertId);
    } else {
      newSelected.delete(alertId);
    }
    setSelectedAlerts(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedAlerts.size === 0) return;

    try {
      const response = await fetch("/api/alerts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertIds: Array.from(selectedAlerts),
          action: bulkAction,
        }),
      });

      if (response.ok) {
        setSelectedAlerts(new Set());
        setShowBulkActions(false);
        setBulkAction("");
        fetchAlerts();
        alert(`Successfully updated ${selectedAlerts.size} alert(s)`);
      }
    } catch (error) {
      console.error("Error performing bulk action:", error);
      alert("Failed to perform bulk action");
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleQuickStatusUpdate = async (alertId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchAlerts();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handlePriorityUpdate = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (response.ok) {
        setEditingPriority(null);
        fetchAlerts();
      }
    } catch (error) {
      console.error("Error updating priority:", error);
      alert("Failed to update priority");
    }
  };

  const handleExport = async (format: "csv" | "pdf" = "csv") => {
    try {
      const params = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
        format,
      });

      const response = await fetch(`/api/alerts/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alerts-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting alerts:", error);
      alert("Failed to export alerts");
    }
  };

  // Sort alerts client-side
  const sortedAlerts = [...alerts].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "alertCode":
        aValue = a.alertCode;
        bValue = b.alertCode;
        break;
      case "detectedDate":
        aValue = new Date(a.detectedDate).getTime();
        bValue = new Date(b.detectedDate).getTime();
        break;
      case "areaHectares":
        aValue = a.areaHectares;
        bValue = b.areaHectares;
        break;
      case "severity":
        const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        aValue = severityOrder[a.severity as keyof typeof severityOrder] || 0;
        bValue = severityOrder[b.severity as keyof typeof severityOrder] || 0;
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "priority":
        aValue = a.priority;
        bValue = b.priority;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Deforestation Alerts
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage deforestation alerts across Northern Region
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button variant="secondary" onClick={() => handleExport("csv")}>
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export CSV
            </Button>
          </div>
          <Button variant="secondary" onClick={() => handleExport("pdf")}>
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
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Export PDF
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Alert
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  {selectedAlerts.size} alert(s) selected
                </span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select action...</option>
                  <option value="status:PENDING">Mark as Pending</option>
                  <option value="status:IN_PROGRESS">Mark as In Progress</option>
                  <option value="status:VERIFIED">Mark as Verified</option>
                  <option value="status:RESOLVED">Mark as Resolved</option>
                  <option value="status:FALSE_ALARM">Mark as False Alarm</option>
                </select>
                <Button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  size="sm"
                >
                  Apply
                </Button>
              </div>
              <button
                onClick={() => {
                  setSelectedAlerts(new Set());
                  setShowBulkActions(false);
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Selection
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by alert code or region..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
            <Select
              options={[
                { value: "", label: "All Statuses" },
                { value: "PENDING", label: "Pending" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "VERIFIED", label: "Verified" },
                { value: "RESOLVED", label: "Resolved" },
                { value: "FALSE_POSITIVE", label: "False Positive" },
              ]}
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            />
            <Select
              options={[
                { value: "", label: "All Severities" },
                { value: "CRITICAL", label: "Critical" },
                { value: "HIGH", label: "High" },
                { value: "MEDIUM", label: "Medium" },
                { value: "LOW", label: "Low" },
              ]}
              value={filters.severity}
              onChange={(e) =>
                setFilters({ ...filters, severity: e.target.value })
              }
            />
            <Select
              options={[
                { value: "", label: "All Districts" },
                { value: "Bombali", label: "Bombali" },
                { value: "Kambia", label: "Kambia" },
                { value: "Koinadugu", label: "Koinadugu" },
                { value: "Port Loko", label: "Port Loko" },
                { value: "Tonkolili", label: "Tonkolili" },
              ]}
              value={filters.district}
              onChange={(e) =>
                setFilters({ ...filters, district: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts ({alerts.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No alerts found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.size === alerts.length && alerts.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("alertCode")}
                    >
                      <div className="flex items-center gap-1">
                        Alert Code
                        {sortField === "alertCode" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region / District
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("detectedDate")}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {sortField === "detectedDate" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("areaHectares")}
                    >
                      <div className="flex items-center gap-1">
                        Area (ha)
                        {sortField === "areaHectares" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("severity")}
                    >
                      <div className="flex items-center gap-1">
                        Severity
                        {sortField === "severity" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {sortField === "status" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("priority")}
                    >
                      <div className="flex items-center gap-1">
                        Priority
                        {sortField === "priority" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAlerts.map((alert) => (
                    <tr
                      key={alert.id}
                      className={`hover:bg-gray-50 ${
                        selectedAlerts.has(alert.id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedAlerts.has(alert.id)}
                          onChange={(e) => handleSelectAlert(alert.id, e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {alert.alertCode}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(alert.confidence * 100).toFixed(1)}% confidence
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {alert.forestRegion.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {alert.forestRegion.district},{" "}
                          {alert.forestRegion.chiefdom}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(alert.detectedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.areaHectares.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={getSeverityColor(alert.severity) as any}
                          size="sm"
                        >
                          {alert.severity}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getStatusColor(alert.status) as any}
                            size="sm"
                          >
                            {alert.status}
                          </Badge>
                          {alert.status === "PENDING" && (
                            <select
                              value={alert.status}
                              onChange={(e) => handleQuickStatusUpdate(alert.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-900 focus:ring-green-500 focus:border-green-500"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="VERIFIED">Verified</option>
                              <option value="FALSE_ALARM">False Alarm</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingPriority === alert.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={newPriority}
                              onChange={(e) => setNewPriority(parseInt(e.target.value))}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900 focus:ring-green-500 focus:border-green-500"
                              autoFocus
                            />
                            <button
                              onClick={() => handlePriorityUpdate(alert.id)}
                              className="text-green-600 hover:text-green-700 text-sm"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingPriority(null)}
                              className="text-gray-500 hover:text-gray-700 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            className="flex items-center gap-1 cursor-pointer hover:text-green-600"
                            onClick={() => {
                              setEditingPriority(alert.id);
                              setNewPriority(alert.priority);
                            }}
                            title="Click to edit priority"
                          >
                            <span className="text-sm font-medium text-gray-900">{alert.priority}</span>
                            <span className="text-xs text-gray-400">/10</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {alert.assignedTo?.name || (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/alerts/${alert.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                          <Link href={`/dashboard/map?alert=${alert.id}`}>
                            <Button variant="ghost" size="sm" title="View on map">
                              🗺️
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchAlerts();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}
