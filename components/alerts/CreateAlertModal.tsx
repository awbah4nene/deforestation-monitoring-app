"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface ForestRegion {
  id: string;
  name: string;
  district: string;
}

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAlertModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAlertModalProps) {
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState<ForestRegion[]>([]);
  const [formData, setFormData] = useState({
    forestRegionId: "",
    latitude: "",
    longitude: "",
    areaHectares: "",
    severity: "MEDIUM",
    priority: "5",
    confidence: "0.8",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchRegions();
    }
  }, [isOpen]);

  const fetchRegions = async () => {
    try {
      const response = await fetch("/api/map/regions");
      const data = await response.json();
      setRegions(data.regions || []);
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          areaHectares: parseFloat(formData.areaHectares),
          priority: parseInt(formData.priority),
          confidence: parseFloat(formData.confidence),
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setFormData({
          forestRegionId: "",
          latitude: "",
          longitude: "",
          areaHectares: "",
          severity: "MEDIUM",
          priority: "5",
          confidence: "0.8",
          notes: "",
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create alert");
      }
    } catch (error) {
      console.error("Error creating alert:", error);
      alert("Failed to create alert");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
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
                <CardTitle>Create New Alert</CardTitle>
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
            <Select
              label="Forest Region *"
              required
              options={[
                { value: "", label: "Select a region..." },
                ...regions.map((r) => ({
                  value: r.id,
                  label: `${r.name} (${r.district})`,
                })),
              ]}
              value={formData.forestRegionId}
              onChange={(e) =>
                setFormData({ ...formData, forestRegionId: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude *"
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
              />
              <Input
                label="Longitude *"
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
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
                label="Confidence (0-1) *"
                type="number"
                step="0.01"
                min="0"
                max="1"
                required
                value={formData.confidence}
                onChange={(e) =>
                  setFormData({ ...formData, confidence: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Severity *"
                required
                options={[
                  { value: "LOW", label: "Low" },
                  { value: "MEDIUM", label: "Medium" },
                  { value: "HIGH", label: "High" },
                  { value: "CRITICAL", label: "Critical" },
                ]}
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value })
                }
              />
              <Input
                label="Priority (1-10) *"
                type="number"
                min="1"
                max="10"
                required
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                {loading ? "Creating..." : "Create Alert"}
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
