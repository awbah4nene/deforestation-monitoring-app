"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
});

export default function NewReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([9.5, -12.0]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [regions, setRegions] = useState<Array<{ id: string; name: string; district: string }>>([]);
  const [formData, setFormData] = useState({
    forestRegionId: "",
    reportType: "ROUTINE_MONITORING",
    title: "",
    description: "",
    visitDate: new Date().toISOString().split("T")[0],
    deforestationObserved: false,
    estimatedAreaLoss: "",
    cause: "",
    weather: "",
    temperature: "",
    notes: "",
  });

  // Fetch regions on mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch("/api/map/regions");
        const data = await response.json();
        setRegions(data.regions || []);
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    };
    fetchRegions();
  }, []);

  // Get current GPS location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setMapCenter([latitude, longitude]);
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", "photo");

      try {
        const response = await fetch("/api/reports/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setPhotos((prev) => [...prev, data.fileUrl]);
        } else {
          alert(`Failed to upload ${file.name}`);
        }
      } catch (error) {
        console.error("Error uploading photo:", error);
        alert(`Failed to upload ${file.name}`);
      }
    }
  };

  // Handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please select a video file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", "video");

    try {
      const response = await fetch("/api/reports/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setVideos((prev) => [...prev, data.fileUrl]);
      } else {
        alert("Failed to upload video");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Failed to upload video");
    }
  };

  // Handle voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        // Upload voice note
        const formData = new FormData();
        formData.append("file", audioBlob, "voice-note.webm");
        formData.append("fileType", "voice");

        try {
          const response = await fetch("/api/reports/upload", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            setVoiceNote(data.fileUrl);
          }
        } catch (error) {
          console.error("Error uploading voice note:", error);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Failed to start recording. Please check microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.forestRegionId) {
      alert("Please select a forest region");
      return;
    }
    
    if (!currentLocation) {
      alert("Please get your current location or select a location on the map");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          accuracy: locationError ? null : 10, // Mock accuracy, would come from GPS
          evidencePhotos: photos,
          estimatedAreaLoss: formData.estimatedAreaLoss ? parseFloat(formData.estimatedAreaLoss) : null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          cause: formData.cause || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/reports/${data.report.id}`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create report");
      }
    } catch (error) {
      console.error("Error creating report:", error);
      alert("Failed to create report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Field Report</h1>
        <p className="text-gray-600 mt-2">
          Document field observations with GPS location, photos, and evidence
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Report Title *"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            <Select
              label="Forest Region *"
              required
              options={[
                { value: "", label: "Select a region..." },
                ...regions.map((region) => ({
                  value: region.id,
                  label: `${region.name} (${region.district})`,
                })),
              ]}
              value={formData.forestRegionId}
              onChange={(e) =>
                setFormData({ ...formData, forestRegionId: e.target.value })
              }
            />

            <Select
              label="Report Type *"
              required
              options={[
                { value: "ALERT_VERIFICATION", label: "Alert Verification" },
                { value: "ROUTINE_MONITORING", label: "Routine Monitoring" },
                { value: "INCIDENT_REPORT", label: "Incident Report" },
                { value: "BIODIVERSITY_SURVEY", label: "Biodiversity Survey" },
                { value: "ENFORCEMENT_ACTION", label: "Enforcement Action" },
                { value: "RESTORATION_PROGRESS", label: "Restoration Progress" },
              ]}
              value={formData.reportType}
              onChange={(e) =>
                setFormData({ ...formData, reportType: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={getCurrentLocation}
              >
                📍 Get Current Location
              </Button>
              {currentLocation && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Lat:</span> {currentLocation.latitude.toFixed(6)},{" "}
                  <span className="font-medium">Lng:</span> {currentLocation.longitude.toFixed(6)}
                </div>
              )}
              {locationError && (
                <Badge variant="danger" size="sm">
                  {locationError}
                </Badge>
              )}
            </div>

            {currentLocation && (
              <div className="h-64 w-full rounded-lg overflow-hidden border">
                <MapComponent
                  center={mapCenter}
                  zoom={15}
                  className="h-full w-full"
                  onMapReady={(map) => {
                    const L = require("leaflet");
                    L.marker([currentLocation.latitude, currentLocation.longitude])
                      .addTo(map)
                      .bindPopup("Report Location")
                      .openPopup();
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deforestation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Deforestation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="deforestationObserved"
                checked={formData.deforestationObserved}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deforestationObserved: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor="deforestationObserved"
                className="text-sm font-medium text-gray-700"
              >
                Deforestation Observed
              </label>
            </div>

            {formData.deforestationObserved && (
              <>
                <Input
                  label="Estimated Area Loss (hectares)"
                  type="number"
                  step="0.01"
                  value={formData.estimatedAreaLoss}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedAreaLoss: e.target.value })
                  }
                />

                <Select
                  label="Cause"
                  options={[
                    { value: "", label: "Select cause..." },
                    { value: "AGRICULTURAL_EXPANSION", label: "Agricultural Expansion" },
                    { value: "LOGGING", label: "Logging" },
                    { value: "MINING", label: "Mining" },
                    { value: "INFRASTRUCTURE", label: "Infrastructure" },
                    { value: "WILDFIRE", label: "Wildfire" },
                    { value: "CHARCOAL_PRODUCTION", label: "Charcoal Production" },
                    { value: "ENCROACHMENT", label: "Encroachment" },
                    { value: "ILLEGAL_SETTLEMENT", label: "Illegal Settlement" },
                    { value: "NATURAL", label: "Natural" },
                  ]}
                  value={formData.cause}
                  onChange={(e) =>
                    setFormData({ ...formData, cause: e.target.value })
                  }
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Evidence */}
        <Card>
          <CardHeader>
            <CardTitle>Evidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                📷 Upload Photos
              </Button>
              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPhotos(photos.filter((_, i) => i !== index))
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Videos
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-upload"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => document.getElementById("video-upload")?.click()}
              >
                🎥 Upload Video
              </Button>
              {videos.length > 0 && (
                <div className="mt-4 space-y-2">
                  {videos.map((video, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Video {index + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setVideos(videos.filter((_, i) => i !== index))
                        }
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Note
              </label>
              <div className="flex items-center gap-2">
                {!isRecording && !voiceNote && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={startRecording}
                  >
                    🎤 Start Recording
                  </Button>
                )}
                {isRecording && (
                  <>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={stopRecording}
                    >
                      ⏹️ Stop Recording
                    </Button>
                    <span className="text-sm text-red-600 animate-pulse">
                      Recording...
                    </span>
                  </>
                )}
                {voiceNote && !isRecording && (
                  <div className="flex items-center gap-2">
                    <audio controls src={voiceNote} className="h-8" />
                    <button
                      type="button"
                      onClick={() => setVoiceNote(null)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Visit Date *"
              type="date"
              required
              value={formData.visitDate}
              onChange={(e) =>
                setFormData({ ...formData, visitDate: e.target.value })
              }
            />

            <Input
              label="Weather Conditions"
              value={formData.weather}
              onChange={(e) =>
                setFormData({ ...formData, weather: e.target.value })
              }
            />

            <Input
              label="Temperature (°C)"
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={(e) =>
                setFormData({ ...formData, temperature: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating Report..." : "Create Report"}
          </Button>
        </div>
      </form>
    </div>
  );
}
