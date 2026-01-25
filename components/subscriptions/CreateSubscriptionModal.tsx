"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface ForestRegion {
  id: string;
  name: string;
  district: string;
}

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateSubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateSubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState<ForestRegion[]>([]);
  const [formData, setFormData] = useState({
    regionIds: [] as string[],
    minSeverity: "",
    channels: [] as string[],
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

  const handleChannelToggle = (channel: string) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.channels.length === 0) {
      alert("Please select at least one notification channel");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/notifications/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regionIds: formData.regionIds,
          minSeverity: formData.minSeverity || "MEDIUM",
          channels: formData.channels,
          isActive: true,
        }),
      });

      if (response.ok) {
        onSuccess();
        setFormData({
          regionIds: [],
          minSeverity: "",
          channels: [],
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create subscription");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert("Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create Alert Subscription</CardTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forest Regions (Optional - select multiple or leave empty for all)
              </label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
                {regions.map((region) => (
                  <label
                    key={region.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.regionIds.includes(region.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            regionIds: [...formData.regionIds, region.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            regionIds: formData.regionIds.filter((id) => id !== region.id),
                          });
                        }
                      }}
                      className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-900">
                      {region.name} ({region.district})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Select
              label="Minimum Severity Threshold"
              options={[
                { value: "LOW", label: "Low and above" },
                { value: "MEDIUM", label: "Medium and above" },
                { value: "HIGH", label: "High and above" },
                { value: "CRITICAL", label: "Critical only" },
              ]}
              value={formData.minSeverity}
              onChange={(e) =>
                setFormData({ ...formData, minSeverity: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Channels *
              </label>
              <div className="space-y-2">
                {[
                  { value: "IN_APP", label: "In-App Notifications", icon: "🔔" },
                  { value: "EMAIL", label: "Email", icon: "📧" },
                  { value: "SMS", label: "SMS", icon: "💬" },
                  { value: "WHATSAPP", label: "WhatsApp", icon: "💚" },
                ].map((channel) => (
                  <label
                    key={channel.value}
                    className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.channels.includes(channel.value)}
                      onChange={() => handleChannelToggle(channel.value)}
                      className="mr-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="mr-2">{channel.icon}</span>
                    <span className="text-sm text-gray-900">{channel.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || formData.channels.length === 0}>
                {loading ? "Creating..." : "Create Subscription"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
