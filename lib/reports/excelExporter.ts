/**
 * Excel Export Utility
 * Uses xlsx library for Excel file generation
 * Client-side only - must be used in browser environment
 */

// Dynamic import for xlsx to ensure it only loads in browser
let XLSX: typeof import("xlsx") | null = null;

const getXLSX = async () => {
  if (typeof window === "undefined") {
    throw new Error("ExcelExporter can only be used in browser environment");
  }
  if (!XLSX) {
    XLSX = await import("xlsx");
  }
  return XLSX;
};

export class ExcelExporter {
  /**
   * Export data to Excel file
   */
  static async export(data: any[], filename: string = "export.xlsx"): Promise<void> {
    const xlsx = await getXLSX();
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    xlsx.writeFile(workbook, filename);
  }

  /**
   * Export alerts to Excel
   */
  static async exportAlerts(alerts: any[]): Promise<void> {
    const data = alerts.map((alert) => ({
      "Alert Code": alert.alertCode,
      "Severity": alert.severity,
      "Status": alert.status,
      "Region": alert.forestRegion?.name || "N/A",
      "District": alert.forestRegion?.district || "N/A",
      "Area (hectares)": alert.areaHectares || 0,
      "Detected Date": new Date(alert.detectedDate).toLocaleDateString(),
      "Priority": alert.priority || "N/A",
      "Confidence": alert.confidence || "N/A",
    }));

    await this.export(data, `alerts_${new Date().toISOString().split("T")[0]}.xlsx`);
  }

  /**
   * Export reports to Excel
   */
  static async exportReports(reports: any[]): Promise<void> {
    const data = reports.map((report) => ({
      "Report Code": report.reportCode,
      "Title": report.title,
      "Type": report.reportType,
      "Region": report.forestRegion?.name || "N/A",
      "District": report.forestRegion?.district || "N/A",
      "Report Date": new Date(report.reportDate).toLocaleDateString(),
      "Visit Date": new Date(report.visitDate).toLocaleDateString(),
      "Deforestation Observed": report.deforestationObserved ? "Yes" : "No",
      "Area Loss (ha)": report.estimatedAreaLoss || 0,
      "Verified": report.isVerified ? "Yes" : "No",
      "Created By": report.user?.name || "N/A",
    }));

    await this.export(data, `reports_${new Date().toISOString().split("T")[0]}.xlsx`);
  }

  /**
   * Export analytics to Excel
   */
  static async exportAnalytics(analytics: any): Promise<void> {
    const xlsx = await getXLSX();
    const workbook = xlsx.utils.book_new();

    // Trends sheet
    if (analytics.trends) {
      const trendsSheet = xlsx.utils.json_to_sheet(
        analytics.trends.map((t: any) => ({
          Date: t.date,
          "Alert Count": t.count,
          "Total Area (ha)": t.totalArea,
        }))
      );
      xlsx.utils.book_append_sheet(workbook, trendsSheet, "Trends");
    }

    // Regional comparison sheet
    if (analytics.regional) {
      const regionalSheet = xlsx.utils.json_to_sheet(
        analytics.regional.map((r: any) => ({
          Region: r.regionName,
          District: r.district,
          "Alert Count": r.alertCount,
          "Total Area (ha)": r.totalArea,
          "Average Area (ha)": r.averageArea,
        }))
      );
      xlsx.utils.book_append_sheet(workbook, regionalSheet, "Regional");
    }

    // Severity distribution sheet
    if (analytics.severity) {
      const severitySheet = xlsx.utils.json_to_sheet(
        analytics.severity.distribution.map((s: any) => ({
          Severity: s.severity,
          Count: s.count,
          Percentage: `${s.percentage.toFixed(1)}%`,
          "Total Area (ha)": s.totalArea,
        }))
      );
      xlsx.utils.book_append_sheet(workbook, severitySheet, "Severity");
    }

    xlsx.writeFile(workbook, `analytics_${new Date().toISOString().split("T")[0]}.xlsx`);
  }

  /**
   * Export multiple sheets
   */
  static async exportMultipleSheets(
    sheets: Array<{ name: string; data: any[] }>,
    filename: string = "export.xlsx"
  ): Promise<void> {
    const xlsx = await getXLSX();
    const workbook = xlsx.utils.book_new();

    sheets.forEach((sheet) => {
      const worksheet = xlsx.utils.json_to_sheet(sheet.data);
      xlsx.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });

    xlsx.writeFile(workbook, filename);
  }
}
