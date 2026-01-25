"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";

interface FieldReport {
  id: string;
  reportCode: string;
  title: string;
  reportType: string;
  reportDate: string;
  deforestationObserved: boolean;
  severity: string;
  isVerified: boolean;
  forestRegion: {
    id: string;
    name: string;
    district: string;
  };
  user: {
    name: string;
    email: string;
  };
  _count: {
    evidenceCollections: number;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    withDeforestation: 0,
  });
  const [filters, setFilters] = useState({
    regionId: "",
    reportType: "",
    isVerified: "",
    search: "",
  });

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [page, filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      });

      const response = await fetch(`/api/reports?${params}`);
      const data = await response.json();

      setReports(data.reports || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/reports?limit=1000");
      const data = await response.json();
      const allReports = data.reports || [];

      setStats({
        total: allReports.length,
        verified: allReports.filter((r: FieldReport) => r.isVerified).length,
        pending: allReports.filter((r: FieldReport) => !r.isVerified).length,
        withDeforestation: allReports.filter((r: FieldReport) => r.deforestationObserved).length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Field Reports</h1>
          <p className="text-gray-600 mt-2">
            Manage and review field observation reports
          </p>
        </div>
        <Link href="/dashboard/reports/new">
          <Button>
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
            New Report
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Reports"
          value={stats.total}
          icon="📝"
          color="blue"
        />
        <StatCard
          label="Verified"
          value={stats.verified}
          icon="✅"
          color="green"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          label="With Deforestation"
          value={stats.withDeforestation}
          icon="🚨"
          color="red"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by title or code..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
            <Select
              options={[
                { value: "", label: "All Types" },
                { value: "PATROL", label: "Patrol" },
                { value: "INVESTIGATION", label: "Investigation" },
                { value: "VERIFICATION", label: "Verification" },
                { value: "MONITORING", label: "Monitoring" },
              ]}
              value={filters.reportType}
              onChange={(e) =>
                setFilters({ ...filters, reportType: e.target.value })
              }
            />
            <Select
              options={[
                { value: "", label: "All Status" },
                { value: "true", label: "Verified" },
                { value: "false", label: "Pending" },
              ]}
              value={filters.isVerified}
              onChange={(e) =>
                setFilters({ ...filters, isVerified: e.target.value })
              }
            />
            <Button
              variant="secondary"
              onClick={() => {
                setFilters({
                  regionId: "",
                  reportType: "",
                  isVerified: "",
                  search: "",
                });
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Reports ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No reports found</div>
          ) : (
            <div className="divide-y">
              {reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/dashboard/reports/${report.id}`}
                  className="block"
                >
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {report.title}
                          </h3>
                          <Badge
                            variant={report.isVerified ? "success" : "warning"}
                            size="sm"
                          >
                            {report.isVerified ? "Verified" : "Pending"}
                          </Badge>
                          {report.deforestationObserved && (
                            <Badge variant="danger" size="sm">
                              Deforestation
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">Code:</span> {report.reportCode} •{" "}
                            <span className="font-medium">Type:</span> {report.reportType}
                          </p>
                          <p>
                            <span className="font-medium">Region:</span> {report.forestRegion.name} ({report.forestRegion.district})
                          </p>
                          <p>
                            <span className="font-medium">By:</span> {report.user.name} •{" "}
                            {new Date(report.reportDate).toLocaleDateString()}
                          </p>
                          {report._count.evidenceCollections > 0 && (
                            <p className="text-xs text-gray-500">
                              {report._count.evidenceCollections} evidence item(s)
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <Badge
                          variant={
                            report.severity === "CRITICAL"
                              ? "danger"
                              : report.severity === "HIGH"
                              ? "warning"
                              : "info"
                          }
                          size="sm"
                        >
                          {report.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
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
    </div>
  );
}
