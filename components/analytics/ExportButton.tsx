"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ExportButtonProps {
  dateRange: { startDate: string; endDate: string };
}

export default function ExportButton({ dateRange }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: "pdf" | "excel" | "geojson") => {
    setLoading(true);
    try {
      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "analytics",
          format,
          dateRange: {
            start: dateRange.startDate,
            end: dateRange.endDate,
          },
        }),
      });

      if (format === "pdf") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `analytics_${new Date().toISOString().split("T")[0]}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else if (format === "excel") {
        const data = await response.json();
        // Use ExcelExporter on client side
        const { ExcelExporter } = await import("@/lib/reports/excelExporter");
        await ExcelExporter.exportAnalytics(data.data);
      } else if (format === "geojson") {
        const data = await response.json();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/geo+json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `analytics_${new Date().toISOString().split("T")[0]}.geojson`;
        link.click();
        window.URL.revokeObjectURL(url);
      }

      setShowMenu(false);
    } catch (error) {
      console.error("Error exporting:", error);
      alert("Failed to export report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
      >
        {loading ? "Exporting..." : "📊 Export"}
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
            <div className="py-1">
              <button
                onClick={() => handleExport("pdf")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                📄 Export as PDF
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                📊 Export as Excel
              </button>
              <button
                onClick={() => handleExport("geojson")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                🗺️ Export as GeoJSON
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
