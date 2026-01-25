/**
 * GeoJSON Exporter
 * Export geographical data as GeoJSON for GIS applications
 */

interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: Record<string, any>;
}

export class GeoJSONExporter {
  /**
   * Export alerts as GeoJSON
   */
  static exportAlerts(alerts: any[]): GeoJSONFeature[] {
    return alerts
      .filter((alert) => alert.latitude && alert.longitude)
      .map((alert) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point",
          coordinates: [alert.longitude, alert.latitude],
        },
        properties: {
          alertCode: alert.alertCode,
          severity: alert.severity,
          status: alert.status,
          areaHectares: alert.areaHectares || 0,
          detectedDate: alert.detectedDate,
          region: alert.forestRegion?.name || "N/A",
          district: alert.forestRegion?.district || "N/A",
          priority: alert.priority || "N/A",
          confidence: alert.confidence || "N/A",
        },
      }));
  }

  /**
   * Export regions as GeoJSON
   */
  static exportRegions(regions: any[]): GeoJSONFeature[] {
    return regions
      .filter((region) => region.geometry)
      .map((region) => ({
        type: "Feature" as const,
        geometry: region.geometry,
        properties: {
          id: region.id,
          name: region.name,
          district: region.district,
          chiefdom: region.chiefdom,
          totalArea: region.totalArea || 0,
          alertCount: region._count?.deforestationAlerts || 0,
        },
      }));
  }

  /**
   * Export reports as GeoJSON
   */
  static exportReports(reports: any[]): GeoJSONFeature[] {
    return reports
      .filter((report) => report.latitude && report.longitude)
      .map((report) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point",
          coordinates: [report.longitude, report.latitude],
        },
        properties: {
          reportCode: report.reportCode,
          title: report.title,
          reportType: report.reportType,
          reportDate: report.reportDate,
          visitDate: report.visitDate,
          deforestationObserved: report.deforestationObserved,
          estimatedAreaLoss: report.estimatedAreaLoss || 0,
          region: report.forestRegion?.name || "N/A",
          district: report.forestRegion?.district || "N/A",
          isVerified: report.isVerified,
        },
      }));
  }

  /**
   * Export patrol routes as GeoJSON
   */
  static exportPatrolRoutes(patrols: any[]): GeoJSONFeature[] {
    return patrols
      .filter((patrol) => patrol.routeGeometry)
      .map((patrol) => ({
        type: "Feature" as const,
        geometry: patrol.routeGeometry,
        properties: {
          id: patrol.id,
          routeName: patrol.routeName,
          status: patrol.status,
          plannedDate: patrol.plannedDate,
          startDate: patrol.startDate,
          endDate: patrol.endDate,
          distance: patrol.distance || 0,
          priority: patrol.priority,
          region: patrol.forestRegion?.name || "N/A",
        },
      }));
  }

  /**
   * Create GeoJSON FeatureCollection
   */
  static createFeatureCollection(features: GeoJSONFeature[]) {
    return {
      type: "FeatureCollection",
      features,
    };
  }

  /**
   * Download GeoJSON file
   */
  static downloadGeoJSON(
    features: GeoJSONFeature[],
    filename: string = "export.geojson"
  ): void {
    const featureCollection = this.createFeatureCollection(features);
    const jsonString = JSON.stringify(featureCollection, null, 2);
    const blob = new Blob([jsonString], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
