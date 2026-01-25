/**
 * Sentinel Hub API Integration
 * Free tier: 10m resolution, 5-day update frequency
 * Documentation: https://docs.sentinel-hub.com/
 */

interface SentinelConfig {
  instanceId?: string;
  clientId?: string;
  clientSecret?: string;
  baseUrl?: string;
}

interface ImageRequest {
  bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  time?: string; // ISO date string or date range
  width?: number;
  height?: number;
  format?: "image/png" | "image/jpeg" | "image/tiff";
  evalscript?: string; // Custom processing script
}

interface SentinelImage {
  imageUrl: string;
  timestamp: string;
  bbox: [number, number, number, number];
  cloudCover?: number;
  resolution: number;
}

export class SentinelHubClient {
  private config: SentinelConfig;
  private defaultEvalscript: string;

  constructor(config: SentinelConfig = {}) {
    this.config = {
      instanceId: process.env.SENTINEL_HUB_INSTANCE_ID || "",
      clientId: process.env.SENTINEL_HUB_CLIENT_ID || "",
      clientSecret: process.env.SENTINEL_HUB_CLIENT_SECRET || "",
      baseUrl: "https://services.sentinel-hub.com/ogc/wms",
      ...config,
    };

    // Default evalscript for RGB visualization
    this.defaultEvalscript = `
      return [B04, B03, B02];
    `;
  }

  /**
   * Fetch Sentinel-2 image for a given bounding box
   */
  async fetchImage(request: ImageRequest): Promise<SentinelImage> {
    const { bbox, time, width = 512, height = 512, format = "image/png" } = request;

    // Calculate time range (default to last 30 days)
    const timeRange = time || this.getDefaultTimeRange();

    // Build WMS request URL
    const params = new URLSearchParams({
      service: "WMS",
      request: "GetMap",
      layers: "TRUE_COLOR", // or use custom layer
      bbox: bbox.join(","),
      width: width.toString(),
      height: height.toString(),
      format,
      time: timeRange,
      ...(this.config.instanceId && { instanceId: this.config.instanceId }),
    });

    const imageUrl = `${this.config.baseUrl}?${params.toString()}`;

    return {
      imageUrl,
      timestamp: new Date().toISOString(),
      bbox,
      resolution: 10, // Sentinel-2 resolution in meters
    };
  }

  /**
   * Fetch NDVI image (Normalized Difference Vegetation Index)
   */
  async fetchNDVI(bbox: [number, number, number, number], time?: string): Promise<SentinelImage> {
    const ndviEvalscript = `
      // NDVI = (NIR - Red) / (NIR + Red)
      // Sentinel-2: B08 (NIR), B04 (Red)
      let ndvi = (B08 - B04) / (B08 + B04);
      return [ndvi];
    `;

    return this.fetchImage({
      bbox,
      time,
      evalscript: ndviEvalscript,
    });
  }

  /**
   * Fetch cloud-free image (with cloud filtering)
   */
  async fetchCloudFreeImage(
    bbox: [number, number, number, number],
    time?: string,
    maxCloudCover: number = 20
  ): Promise<SentinelImage> {
    // In production, you would query the catalog first to find cloud-free images
    // For now, we'll use the standard image fetch
    const image = await this.fetchImage({ bbox, time });
    
    // Note: Cloud cover filtering should be done via catalog API
    // This is a simplified version
    return {
      ...image,
      cloudCover: 0, // Would be calculated from actual data
    };
  }

  /**
   * Get available images for a time range
   */
  async getAvailableImages(
    bbox: [number, number, number, number],
    startDate: string,
    endDate: string
  ): Promise<Array<{ timestamp: string; cloudCover: number }>> {
    // In production, use Sentinel Hub Catalog API
    // This is a placeholder that returns mock data
    const images = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);

    while (current <= end) {
      images.push({
        timestamp: current.toISOString(),
        cloudCover: Math.random() * 30, // Mock cloud cover
      });
      current.setDate(current.getDate() + 5); // Sentinel-2 revisit time
    }

    return images;
  }

  /**
   * Get default time range (last 30 days)
   */
  private getDefaultTimeRange(): string {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return `${start.toISOString().split("T")[0]}/${end.toISOString().split("T")[0]}`;
  }

  /**
   * Authenticate with Sentinel Hub (if using authenticated endpoints)
   */
  async authenticate(): Promise<string | null> {
    if (!this.config.clientId || !this.config.clientSecret) {
      return null; // Public endpoints don't need auth
    }

    try {
      const response = await fetch("https://services.sentinel-hub.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("Sentinel Hub authentication failed:", error);
      return null;
    }
  }
}

// Export singleton instance
export const sentinelHub = new SentinelHubClient();
