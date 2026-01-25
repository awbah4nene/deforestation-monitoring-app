"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import CreatePatrolModal from "@/components/patrols/CreatePatrolModal";

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
  forestRegion: {
    id: string;
    name: string;
    district: string;
  };
  assignedUsers: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  _count: {
    patrolReports: number;
  };
}

export default function PatrolsPage() {
  const [patrols, setPatrols] = useState<Patrol[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    regionId: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    planned: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchPatrols();
  }, [filters]);

  const fetchPatrols = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        )
      );

      const response = await fetch(`/api/patrols?${params}`);
      const data = await response.json();
      setPatrols(data.patrols || []);

      // Calculate stats
      const allPatrols = data.patrols || [];
      setStats({
        total: allPatrols.length,
        planned: allPatrols.filter((p: Patrol) => p.status === "PLANNED").length,
        inProgress: allPatrols.filter((p: Patrol) => p.status === "IN_PROGRESS").length,
        completed: allPatrols.filter((p: Patrol) => p.status === "COMPLETED").length,
      });
    } catch (error) {
      console.error("Error fetching patrols:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "info";
      case "PLANNED":
        return "warning";
      case "CANCELLED":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patrol Management</h1>
          <p className="text-gray-600 mt-2">
            Create and manage patrol routes for field operations
          </p>
        </div>
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
          New Patrol
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Patrols"
          value={stats.total}
          icon="🗺️"
          color="blue"
        />
        <StatCard
          label="Planned"
          value={stats.planned}
          icon="📅"
          color="yellow"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon="🚶"
          color="green"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon="✅"
          color="green"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              options={[
                { value: "", label: "All Statuses" },
                { value: "PLANNED", label: "Planned" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            />
            <Button
              variant="secondary"
              onClick={() => {
                setFilters({ status: "", regionId: "" });
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patrols List */}
      <Card>
        <CardHeader>
          <CardTitle>Patrol Routes ({patrols.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading patrols...</div>
          ) : patrols.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No patrols found</div>
          ) : (
            <div className="divide-y">
              {patrols.map((patrol) => (
                <Link
                  key={patrol.id}
                  href={`/dashboard/patrols/${patrol.id}`}
                  className="block"
                >
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {patrol.routeName}
                          </h3>
                          <Badge
                            variant={getStatusColor(patrol.status) as any}
                            size="sm"
                          >
                            {patrol.status.replace(/_/g, " ")}
                          </Badge>
                          <Badge variant="info" size="sm">
                            Priority: {patrol.priority}/10
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">Region:</span> {patrol.forestRegion.name} ({patrol.forestRegion.district})
                          </p>
                          <p>
                            <span className="font-medium">Planned:</span> {new Date(patrol.plannedDate).toLocaleDateString()}
                            {patrol.startDate && (
                              <> • <span className="font-medium">Started:</span> {new Date(patrol.startDate).toLocaleDateString()}</>
                            )}
                            {patrol.endDate && (
                              <> • <span className="font-medium">Completed:</span> {new Date(patrol.endDate).toLocaleDateString()}</>
                            )}
                          </p>
                          <p>
                            <span className="font-medium">Assigned to:</span> {patrol.assignedUsers.map(u => u.name).join(", ") || "Unassigned"}
                          </p>
                          {patrol.distance && (
                            <p>
                              <span className="font-medium">Distance:</span> {patrol.distance.toFixed(1)} km
                              {patrol.estimatedDuration && (
                                <> • <span className="font-medium">Duration:</span> {Math.floor(patrol.estimatedDuration / 60)}h {patrol.estimatedDuration % 60}m</>
                              )}
                            </p>
                          )}
                          {patrol._count.patrolReports > 0 && (
                            <p className="text-xs text-gray-500">
                              {patrol._count.patrolReports} report(s) submitted
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Patrol Modal */}
      <CreatePatrolModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchPatrols();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}
