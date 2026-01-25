"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GeoJSONExporter } from "@/lib/reports/geojsonExporter";

export default function DataPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleDownload = async (type: string, format: string) => {
    setLoading(`${type}-${format}`);
    try {
      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          format,
          dateRange: {
            start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
        }),
      });

      if (format === "pdf") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${type}_${new Date().toISOString().split("T")[0]}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else if (format === "geojson") {
        const data = await response.json();
        GeoJSONExporter.downloadGeoJSON(
          data.features || [],
          `${type}_${new Date().toISOString().split("T")[0]}.geojson`
        );
      }
    } catch (error) {
      console.error("Error downloading:", error);
      alert("Failed to download data");
    } finally {
      setLoading(null);
    }
  };

  const datasets = [
    {
      name: "Deforestation Alerts",
      description: "All deforestation alerts with coordinates, severity, and area data",
      formats: ["PDF", "GeoJSON"],
      type: "alerts",
    },
    {
      name: "Forest Regions",
      description: "Geographic boundaries of all monitored forest regions",
      formats: ["GeoJSON"],
      type: "regions",
    },
    {
      name: "Field Reports",
      description: "Field observation reports with GPS locations and evidence",
      formats: ["PDF", "GeoJSON"],
      type: "reports",
    },
    {
      name: "Analytics Summary",
      description: "Aggregated analytics data including trends and regional comparisons",
      formats: ["PDF"],
      type: "analytics",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">Public Data Portal</h1>
          <p className="text-xl text-green-100 max-w-3xl">
            Access open data, research publications, and API documentation
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Downloadable Datasets */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Downloadable Datasets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {datasets.map((dataset, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{dataset.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{dataset.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {dataset.formats.map((format) => (
                      <Button
                        key={format}
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleDownload(
                            dataset.type,
                            format.toLowerCase()
                          )
                        }
                        disabled={loading === `${dataset.type}-${format.toLowerCase()}`}
                      >
                        {loading === `${dataset.type}-${format.toLowerCase()}`
                          ? "Downloading..."
                          : `Download ${format}`}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* API Documentation */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              API Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Base URL
                </h3>
                <code className="block p-3 bg-gray-100 rounded text-sm">
                  {process.env.NEXT_PUBLIC_API_URL || "https://api.deforestation-monitor.sl"}
                </code>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Authentication
                </h3>
                <p className="text-gray-700 mb-2">
                  Most endpoints require authentication. Use Bearer token authentication:
                </p>
                <code className="block p-3 bg-gray-100 rounded text-sm">
                  Authorization: Bearer YOUR_API_TOKEN
                </code>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Public Endpoints
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded">
                    <code className="text-sm font-mono">GET /api/public/alerts</code>
                    <p className="text-sm text-gray-600 mt-1">
                      Get public deforestation alerts (read-only)
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <code className="text-sm font-mono">GET /api/public/regions</code>
                    <p className="text-sm text-gray-600 mt-1">
                      Get forest region boundaries
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <code className="text-sm font-mono">GET /api/public/statistics</code>
                    <p className="text-sm text-gray-600 mt-1">
                      Get aggregated statistics
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Rate Limits
                </h3>
                <p className="text-gray-700">
                  Public API: 100 requests per hour per IP address
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Publications */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Research Publications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-green-600 bg-gray-50 rounded">
                <h3 className="font-semibold text-gray-900 mb-1">
                  AI-Powered Deforestation Monitoring in Sierra Leone
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Journal of Environmental Monitoring, 2024
                </p>
                <p className="text-gray-700 text-sm">
                  This paper presents the methodology and results of our AI-powered 
                  deforestation monitoring system, including ML model performance 
                  metrics and case studies.
                </p>
                <Button variant="ghost" size="sm" className="mt-2">
                  Download PDF
                </Button>
              </div>

              <div className="p-4 border-l-4 border-green-600 bg-gray-50 rounded">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Real-Time Satellite-Based Forest Monitoring
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  International Conference on Remote Sensing, 2024
                </p>
                <p className="text-gray-700 text-sm">
                  Technical paper on satellite data integration, NDVI calculations, 
                  and automated alert generation workflows.
                </p>
                <Button variant="ghost" size="sm" className="mt-2">
                  Download PDF
                </Button>
              </div>

              <div className="p-4 border-l-4 border-green-600 bg-gray-50 rounded">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Community Engagement in Forest Conservation
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Conservation Science Journal, 2024
                </p>
                <p className="text-gray-700 text-sm">
                  Case study on community participation and public data access 
                  in deforestation monitoring programs.
                </p>
                <Button variant="ghost" size="sm" className="mt-2">
                  Download PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Usage Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Data Usage Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Attribution:</strong> When using our data in publications or 
                presentations, please cite the source as "Sierra Leone Deforestation 
                Monitoring System" and include a link to this portal.
              </p>
              <p>
                <strong>Research Use:</strong> Data is provided for research and 
                educational purposes. Commercial use requires prior permission.
              </p>
              <p>
                <strong>Privacy:</strong> All personal information and sensitive location 
                data have been anonymized or removed from public datasets.
              </p>
              <p>
                <strong>Updates:</strong> Datasets are updated monthly. Check back 
                regularly for the latest data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
