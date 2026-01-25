"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

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
}

interface EditRegionModalProps {
  isOpen: boolean;
  region: Region | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditRegionModal({
  isOpen,
  region,
  onClose,
  onSuccess,
}: EditRegionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    regionCode: "",
    district: "",
    chiefdom: "",
    areaHectares: "",
    elevation: "",
    vegetationType: "TROPICAL_RAINFOREST",
    protectionStatus: "PROTECTED_AREA",
    description: "",
    population: "",
  });

  useEffect(() => {
    if (region) {
      setFormData({
        name: region.name || "",
        regionCode: region.regionCode || "",
        district: region.district || "",
        chiefdom: region.chiefdom || "",
        areaHectares: region.areaHectares?.toString() || "",
        elevation: region.elevation?.toString() || "",
        vegetationType: region.vegetationType || "TROPICAL_RAINFOREST",
        protectionStatus: region.protectionStatus || "PROTECTED_AREA",
        description: region.description || "",
        population: region.population?.toString() || "",
      });
    }
  }, [region]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!region) return;
    
    setLoading(true);

    try {
      const response = await fetch(`/api/regions/${region.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          regionCode: formData.regionCode.trim(),
          district: formData.district.trim(),
          chiefdom: formData.chiefdom.trim(),
          areaHectares: parseFloat(formData.areaHectares),
          elevation: formData.elevation ? parseFloat(formData.elevation) : null,
          vegetationType: formData.vegetationType,
          protectionStatus: formData.protectionStatus,
          description: formData.description.trim() || null,
          population: formData.population ? parseInt(formData.population) : null,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update region");
      }
    } catch (error) {
      console.error("Error updating region:", error);
      alert("Failed to update region");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !region) return null;

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
        <div className="h-full flex flex-col">
          <Card className="h-full flex flex-col rounded-none border-0 shadow-none">
            <CardHeader className="border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle>Edit Region</CardTitle>
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
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Region Name *"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Gola Rainforest National Park"
                />

                <Input
                  label="Region Code *"
                  required
                  value={formData.regionCode}
                  onChange={(e) =>
                    setFormData({ ...formData, regionCode: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., GRNP-001"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="District *"
                    required
                    options={[
                      { value: "", label: "Select district..." },
                      { value: "Bombali", label: "Bombali" },
                      { value: "Kambia", label: "Kambia" },
                      { value: "Koinadugu", label: "Koinadugu" },
                      { value: "Port Loko", label: "Port Loko" },
                      { value: "Tonkolili", label: "Tonkolili" },
                    ]}
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                  />

                  <Input
                    label="Chiefdom *"
                    required
                    value={formData.chiefdom}
                    onChange={(e) =>
                      setFormData({ ...formData, chiefdom: e.target.value })
                    }
                    placeholder="e.g., Gbendembu"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Area (hectares) *"
                    type="number"
                    step="0.01"
                    required
                    value={formData.areaHectares}
                    onChange={(e) =>
                      setFormData({ ...formData, areaHectares: e.target.value })
                    }
                  />

                  <Input
                    label="Elevation (meters)"
                    type="number"
                    step="0.1"
                    value={formData.elevation}
                    onChange={(e) =>
                      setFormData({ ...formData, elevation: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Vegetation Type *"
                    required
                    options={[
                      { value: "TROPICAL_RAINFOREST", label: "Tropical Rainforest" },
                      { value: "MANGROVE", label: "Mangrove" },
                      { value: "SAVANNAH", label: "Savannah" },
                      { value: "MONTANE_FOREST", label: "Montane Forest" },
                      { value: "SECONDARY_FOREST", label: "Secondary Forest" },
                      { value: "PLANTATION", label: "Plantation" },
                      { value: "MIXED_FOREST", label: "Mixed Forest" },
                    ]}
                    value={formData.vegetationType}
                    onChange={(e) =>
                      setFormData({ ...formData, vegetationType: e.target.value })
                    }
                  />

                  <Select
                    label="Protection Status *"
                    required
                    options={[
                      { value: "PROTECTED_AREA", label: "Protected Area" },
                      { value: "COMMUNITY_FOREST", label: "Community Forest" },
                      { value: "CONCESSION", label: "Concession" },
                      { value: "UNPROTECTED", label: "Unprotected" },
                      { value: "CONSERVATION_AREA", label: "Conservation Area" },
                      { value: "NATIONAL_PARK", label: "National Park" },
                    ]}
                    value={formData.protectionStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, protectionStatus: e.target.value })
                    }
                  />
                </div>

                <Input
                  label="Population"
                  type="number"
                  value={formData.population}
                  onChange={(e) =>
                    setFormData({ ...formData, population: e.target.value })
                  }
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="Additional information about the region..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
