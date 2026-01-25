import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/connect";
import { requireAuth } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const district = searchParams.get("district");

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (district) where.forestRegion = { district };

    // Fetch all alerts matching filters
    const alerts = await prisma.deforestationAlert.findMany({
      where,
      include: {
        forestRegion: {
          select: {
            name: true,
            district: true,
            chiefdom: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        detectedDate: "desc",
      },
    });

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "Alert Code",
        "Region",
        "District",
        "Chiefdom",
        "Latitude",
        "Longitude",
        "Area (ha)",
        "Severity",
        "Status",
        "Confidence",
        "Detected Date",
        "Assigned To",
      ];

      const rows = alerts.map((alert) => [
        alert.alertCode,
        alert.forestRegion.name,
        alert.forestRegion.district,
        alert.forestRegion.chiefdom,
        alert.latitude.toString(),
        alert.longitude.toString(),
        alert.areaHectares.toString(),
        alert.severity,
        alert.status,
        (alert.confidence * 100).toFixed(1) + "%",
        new Date(alert.detectedDate).toISOString().split("T")[0],
        alert.assignedTo?.name || "Unassigned",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="alerts-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    if (format === "pdf") {
      // Generate simple PDF-like HTML (can be enhanced with a proper PDF library)
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Deforestation Alerts Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #059669; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #059669; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Deforestation Alerts Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Total Alerts: ${alerts.length}</p>
            <table>
              <thead>
                <tr>
                  <th>Alert Code</th>
                  <th>Region</th>
                  <th>District</th>
                  <th>Area (ha)</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Detected Date</th>
                  <th>Assigned To</th>
                </tr>
              </thead>
              <tbody>
                ${alerts.map(alert => `
                  <tr>
                    <td>${alert.alertCode}</td>
                    <td>${alert.forestRegion.name}</td>
                    <td>${alert.forestRegion.district}</td>
                    <td>${alert.areaHectares.toFixed(2)}</td>
                    <td>${alert.severity}</td>
                    <td>${alert.status}</td>
                    <td>${new Date(alert.detectedDate).toLocaleDateString()}</td>
                    <td>${alert.assignedTo?.name || "Unassigned"}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      return new NextResponse(htmlContent, {
        headers: {
          "Content-Type": "text/html",
          "Content-Disposition": `attachment; filename="alerts-${new Date().toISOString().split("T")[0]}.html"`,
        },
      });
    }

    // Default to JSON
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Error exporting alerts:", error);
    return NextResponse.json(
      { error: "Failed to export alerts" },
      { status: 500 }
    );
  }
}
