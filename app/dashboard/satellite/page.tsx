"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export default function SatelliteProcessingPage() {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [formData, setFormData] = useState({
    regionId: "",
    startDate: "",
    endDate: "",
    source: "sentinel",
  });

  const handleProcess = async () => {
    if (!formData.regionId || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields");
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch("/api/alerts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regionId: formData.regionId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          autoProcess: true,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResults(data);
        alert("Processing completed successfully!");
      } else {
        alert(data.error || "Processing failed");
      }
    } catch (error) {
      console.error("Error processing satellite data:", error);
      alert("Failed to process satellite data");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Satellite Image Processing
        </h1>
        <p className="text-gray-600 mt-2">
          Process satellite images and generate deforestation alerts
        </p>
      </div>

      {/* Processing Form */}
      <Card>
        <CardHeader>
          <CardTitle>Process Satellite Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Region ID *"
              value={formData.regionId}
              onChange={(e) =>
                setFormData({ ...formData, regionId: e.target.value })
              }
              placeholder="Enter region ID"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date *"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
              <Input
                label="End Date *"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>

            <Select
              label="Satellite Source"
              options={[
                { value: "sentinel", label: "Sentinel-2" },
                { value: "landsat", label: "Landsat 8" },
                { value: "planet", label: "Planet Labs" },
              ]}
              value={formData.source}
              onChange={(e) =>
                setFormData({ ...formData, source: e.target.value })
              }
            />

            <Button
              onClick={handleProcess}
              disabled={processing}
              className="w-full"
            >
              {processing ? "Processing..." : "Process Images & Generate Alerts"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Detection Results */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Detection Results
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Detected</p>
                    <Badge
                      variant={results.detection.detected ? "danger" : "success"}
                    >
                      {results.detection.detected ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="text-lg font-bold text-gray-900">
                      {(results.detection.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Severity</p>
                    <Badge
                      variant={
                        results.detection.severity === "CRITICAL"
                          ? "danger"
                          : results.detection.severity === "HIGH"
                          ? "warning"
                          : "info"
                      }
                    >
                      {results.detection.severity}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Area Affected</p>
                    <p className="text-lg font-bold text-gray-900">
                      {results.detection.areaHectares.toFixed(2)} ha
                    </p>
                  </div>
                  {results.detection.ndviChange && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">NDVI Change</p>
                      <p
                        className={`text-lg font-bold ${
                          results.detection.ndviChange < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {results.detection.ndviChange >= 0 ? "+" : ""}
                        {results.detection.ndviChange.toFixed(3)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Before Image</h4>
                  <p className="text-sm text-gray-600">
                    NDVI: {results.images.before.ndvi?.toFixed(3) || "N/A"}
                  </p>
                  {results.images.before.url && (
                    <img
                      src={results.images.before.url}
                      alt="Before"
                      className="mt-2 rounded border"
                    />
                  )}
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">After Image</h4>
                  <p className="text-sm text-gray-600">
                    NDVI: {results.images.after.ndvi?.toFixed(3) || "N/A"}
                  </p>
                  {results.images.after.url && (
                    <img
                      src={results.images.after.url}
                      alt="After"
                      className="mt-2 rounded border"
                    />
                  )}
                </div>
              </div>

              {/* Generated Alert */}
              {results.alert && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Alert Generated
                  </h4>
                  <p className="text-sm text-gray-600">
                    Alert Code: {results.alert.alertCode}
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-2"
                    onClick={() =>
                      window.open(`/dashboard/alerts/${results.alert.id}`, "_blank")
                    }
                  >
                    View Alert
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
