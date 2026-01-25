"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import CreateRegionModal from "@/components/regions/CreateRegionModal";
import EditRegionModal from "@/components/regions/EditRegionModal";
import ViewRegionModal from "@/components/regions/ViewRegionModal";

interface Region {
  id: string;
  name: string;
  regionCode: string;
  district: string;
  chiefdom: string;
  areaHectares: number;
  elevation: number | null;
  vegetationType: string;
  protectionStatus: string;
  description: string | null;
  population: number | null;
  _count: {
    deforestationAlerts: number;
    fieldReports: number;
  };
}

interface Stats {
  totalRegions: number;
  totalArea: number;
  alertCount: number;
  reportCount: number;
  districtStats: Array<{
    district: string;
    _count: { _all: number };
    _sum: { areaHectares: number | null };
  }>;
}

// Action Dropdown Component
function ActionDropdown({ 
  region, 
  onEdit, 
  onView 
}: { 
  region: Region; 
  onEdit: (region: Region) => void;
  onView: (regionId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Actions"
      >
        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
          <button
            onClick={() => {
              onView(region.id);
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>
          <button
            onClick={() => {
              onEdit(region);
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Region
          </button>
        </div>
      )}
    </div>
  );
}

export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [viewRegionId, setViewRegionId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    district: "",
    protectionStatus: "",
    vegetationType: "",
    search: "",
  });

  useEffect(() => {
    fetchRegions();
    fetchStats();
  }, [filters]);

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        )
      );

      const response = await fetch(`/api/regions?${params}`);
      const data = await response.json();
      setRegions(data.regions || []);
    } catch (error) {
      console.error("Error fetching regions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/regions/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

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

  const handleEdit = (region: Region) => {
    setSelectedRegion(region);
    setShowEditModal(true);
  };

  const handleView = (regionId: string) => {
    setViewRegionId(regionId);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Forest Regions Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Monitor and manage forest regions across Northern Sierra Leone
          </p>
        </div>
        <div className="flex-shrink-0 sm:ml-auto">
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
            Add Region
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Regions"
            value={stats.totalRegions}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
            color="green"
          />
          <StatCard
            label="Total Area"
            value={`${(stats.totalArea || 0).toFixed(0)} ha`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            label="Total Alerts"
            value={stats.alertCount}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            color="red"
          />
          <StatCard
            label="Field Reports"
            value={stats.reportCount}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            color="yellow"
          />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              placeholder="Search by name, code, or chiefdom..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
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
            <Select
              options={[
                { value: "", label: "All Protection Status" },
                { value: "STRICTLY_PROTECTED", label: "Strictly Protected" },
                { value: "PROTECTED", label: "Protected" },
                { value: "PROTECTED_AREA", label: "Protected Area" },
                { value: "COMMUNITY_MANAGED", label: "Community Managed" },
                { value: "COMMUNITY_FOREST", label: "Community Forest" },
                { value: "BUFFER_ZONE", label: "Buffer Zone" },
              ]}
              value={filters.protectionStatus}
              onChange={(e) =>
                setFilters({ ...filters, protectionStatus: e.target.value })
              }
            />
            <Select
              options={[
                { value: "", label: "All Vegetation Types" },
                { value: "TROPICAL_RAINFOREST", label: "Tropical Rainforest" },
                { value: "SAVANNA_WOODLAND", label: "Savanna Woodland" },
                { value: "MANGROVE", label: "Mangrove" },
                { value: "SECONDARY_FOREST", label: "Secondary Forest" },
              ]}
              value={filters.vegetationType}
              onChange={(e) =>
                setFilters({ ...filters, vegetationType: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* District Summary */}
      {stats && stats.districtStats && stats.districtStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Coverage by District</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {stats.districtStats.map((district) => (
                <div
                  key={district.district}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {district.district}
                  </h3>
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-600">
                      {district._count._all} regions
                    </p>
                    <p className="text-xs text-gray-600">
                      {(district._sum.areaHectares || 0).toFixed(0)} ha
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Forest Regions ({regions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-600">
              Loading regions...
            </div>
          ) : regions.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No regions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      District
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Area
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Vegetation
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Alerts
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {regions.map((region) => (
                    <tr key={region.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {region.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {region.regionCode}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="text-sm text-gray-900">
                          {region.district}
                        </div>
                        <div className="text-xs text-gray-500">
                          {region.chiefdom}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 hidden md:table-cell">
                        {region.areaHectares?.toFixed(0) || 0} ha
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                        {region.vegetationType?.replace(/_/g, " ") || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            getProtectionColor(region.protectionStatus) as any
                          }
                          size="sm"
                        >
                          {region.protectionStatus?.replace(/_/g, " ") || "-"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="text-sm text-gray-900">
                          {region._count?.deforestationAlerts || 0} alerts
                        </div>
                        <div className="text-xs text-gray-500">
                          {region._count?.fieldReports || 0} reports
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ActionDropdown 
                          region={region} 
                          onEdit={handleEdit}
                          onView={handleView}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Region Modal */}
      <CreateRegionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchRegions();
          fetchStats();
        }}
      />

      {/* Edit Region Modal */}
      <EditRegionModal
        isOpen={showEditModal}
        region={selectedRegion}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRegion(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setSelectedRegion(null);
          fetchRegions();
          fetchStats();
        }}
      />

      {/* View Region Modal */}
      <ViewRegionModal
        isOpen={showViewModal}
        regionId={viewRegionId}
        onClose={() => {
          setShowViewModal(false);
          setViewRegionId(null);
        }}
        onEdit={(regionId) => {
          const region = regions.find((r) => r.id === regionId);
          if (region) {
            setShowViewModal(false);
            setViewRegionId(null);
            handleEdit(region);
          }
        }}
      />
    </div>
  );
}
