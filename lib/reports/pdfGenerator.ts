/**
 * PDF Report Generator
 * Uses jsPDF for client-side PDF generation
 */

interface ReportOptions {
  title: string;
  subtitle?: string;
  dateRange?: { start: Date; end: Date };
  data: any;
  charts?: Array<{ type: string; data: any }>;
  tables?: Array<{ headers: string[]; rows: any[][] }>;
}

export class PDFGenerator {
  /**
   * Generate PDF report
   */
  static async generate(options: ReportOptions): Promise<Blob> {
    // Dynamic import for client-side only
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.text(options.title, 20, yPosition);
    yPosition += 10;

    // Subtitle
    if (options.subtitle) {
      doc.setFontSize(14);
      doc.text(options.subtitle, 20, yPosition);
      yPosition += 10;
    }

    // Date range
    if (options.dateRange) {
      doc.setFontSize(10);
      doc.text(
        `Period: ${options.dateRange.start.toLocaleDateString()} - ${options.dateRange.end.toLocaleDateString()}`,
        20,
        yPosition
      );
      yPosition += 10;
    }

    // Add page break
    yPosition += 5;

    // Add data sections
    if (options.tables && options.tables.length > 0) {
      options.tables.forEach((table, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Table header
        doc.setFontSize(12);
        doc.text(`Table ${index + 1}`, 20, yPosition);
        yPosition += 8;

        // Table headers
        doc.setFontSize(10);
        let xPosition = 20;
        table.headers.forEach((header, i) => {
          doc.text(header, xPosition, yPosition);
          xPosition += 40;
        });
        yPosition += 6;

        // Table rows
        table.rows.forEach((row) => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          xPosition = 20;
          row.forEach((cell, i) => {
            doc.text(String(cell), xPosition, yPosition);
            xPosition += 40;
          });
          yPosition += 6;
        });

        yPosition += 10;
      });
    }

    // Add summary
    doc.setFontSize(12);
    doc.text("Summary", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    if (options.data.summary) {
      Object.entries(options.data.summary).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 20, yPosition);
        yPosition += 6;
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount} - Generated on ${new Date().toLocaleString()}`,
        20,
        285
      );
    }

    return doc.output("blob");
  }

  /**
   * Generate alert report PDF
   */
  static async generateAlertReport(
    alerts: any[],
    dateRange: { start: Date; end: Date }
  ): Promise<Blob> {
    const tables = [
      {
        headers: ["Alert Code", "Severity", "Region", "Area (ha)", "Date"],
        rows: alerts.map((alert) => [
          alert.alertCode,
          alert.severity,
          alert.forestRegion?.name || "N/A",
          (alert.areaHectares || 0).toFixed(2),
          new Date(alert.detectedDate).toLocaleDateString(),
        ]),
      },
    ];

    return this.generate({
      title: "Deforestation Alert Report",
      subtitle: "Sierra Leone Northern Region",
      dateRange,
      data: {
        summary: {
          "Total Alerts": alerts.length,
          "Total Area Affected": `${alerts.reduce((sum, a) => sum + (a.areaHectares || 0), 0).toFixed(2)} ha`,
        },
      },
      tables,
    });
  }

  /**
   * Generate analytics report PDF
   */
  static async generateAnalyticsReport(
    analytics: any,
    dateRange: { start: Date; end: Date }
  ): Promise<Blob> {
    const tables: any[] = [];

    if (analytics.trends) {
      tables.push({
        headers: ["Date", "Alert Count", "Total Area (ha)"],
        rows: analytics.trends.map((t: any) => [
          t.date,
          t.count,
          t.totalArea.toFixed(2),
        ]),
      });
    }

    if (analytics.regional) {
      tables.push({
        headers: ["Region", "Alert Count", "Total Area (ha)", "Avg Area (ha)"],
        rows: analytics.regional.map((r: any) => [
          r.regionName,
          r.alertCount,
          r.totalArea.toFixed(2),
          r.averageArea.toFixed(2),
        ]),
      });
    }

    return this.generate({
      title: "Analytics Report",
      subtitle: "Deforestation Monitoring Analytics",
      dateRange,
      data: {
        summary: analytics.summary || {},
      },
      tables,
    });
  }
}
