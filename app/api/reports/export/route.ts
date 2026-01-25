/**
 * Report Export API
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { PDFGenerator } from "@/lib/reports/pdfGenerator";
import { GeoJSONExporter } from "@/lib/reports/geojsonExporter";
import prisma from "@/lib/db/connect";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();

    const { type, format, dateRange, reportType } = body;

    const start = dateRange?.start ? new Date(dateRange.start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = dateRange?.end ? new Date(dateRange.end) : new Date();

    let result: any;

    switch (type) {
      case "alerts":
        const alerts = await prisma.deforestationAlert.findMany({
          where: {
            detectedDate: {
              gte: start,
              lte: end,
            },
          },
          include: {
            forestRegion: {
              select: {
                name: true,
                district: true,
              },
            },
          },
        });

        if (format === "pdf") {
          const blob = await PDFGenerator.generateAlertReport(alerts, { start, end });
          const buffer = await blob.arrayBuffer();
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="alerts_${new Date().toISOString().split("T")[0]}.pdf"`,
            },
          });
        } else if (format === "excel") {
          // For Excel, we need to return data and let client handle download
          return NextResponse.json({
            data: alerts,
            format: "excel",
            filename: `alerts_${new Date().toISOString().split("T")[0]}.xlsx`,
          });
        } else if (format === "geojson") {
          const features = GeoJSONExporter.exportAlerts(alerts);
          const featureCollection = GeoJSONExporter.createFeatureCollection(features);
          return NextResponse.json(featureCollection, {
            headers: {
              "Content-Type": "application/geo+json",
              "Content-Disposition": `attachment; filename="alerts_${new Date().toISOString().split("T")[0]}.geojson"`,
            },
          });
        }
        break;

      case "analytics":
        // Fetch analytics data
        const [trendsRes, regionalRes, severityRes] = await Promise.all([
          fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/analytics/trends?startDate=${start.toISOString()}&endDate=${end.toISOString()}`),
          fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/analytics/regional?startDate=${start.toISOString()}&endDate=${end.toISOString()}`),
          fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/analytics/severity?startDate=${start.toISOString()}&endDate=${end.toISOString()}`),
        ]);

        const trends = await trendsRes.json();
        const regional = await regionalRes.json();
        const severity = await severityRes.json();

        const analytics = {
          trends: trends.trends,
          regional: regional.comparisons,
          severity: severity.distribution,
        };

        if (format === "pdf") {
          const blob = await PDFGenerator.generateAnalyticsReport(analytics, { start, end });
          const buffer = await blob.arrayBuffer();
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="analytics_${new Date().toISOString().split("T")[0]}.pdf"`,
            },
          });
        } else if (format === "excel") {
          return NextResponse.json({
            data: analytics,
            format: "excel",
            filename: `analytics_${new Date().toISOString().split("T")[0]}.xlsx`,
          });
        }
        break;
    }

    return NextResponse.json({ error: "Invalid export type or format" }, { status: 400 });
  } catch (error) {
    console.error("Error exporting report:", error);
    return NextResponse.json(
      { error: "Failed to export report" },
      { status: 500 }
    );
  }
}
