import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function FeaturesPage() {
  const features = [
    {
      icon: "🛰️",
      title: "Satellite Monitoring",
      description: "Real-time satellite imagery analysis with 5-day update frequency using Sentinel-2 and Google Earth Engine.",
      details: [
        "10m resolution imagery",
        "NDVI change detection",
        "Automated image processing",
        "Historical comparison",
      ],
    },
    {
      icon: "🤖",
      title: "AI-Powered Detection",
      description: "Advanced machine learning models identify deforestation patterns with high accuracy and confidence scoring.",
      details: [
        "Custom ML models",
        "Confidence-based alerts",
        "Pattern recognition",
        "Predictive analytics",
      ],
    },
    {
      icon: "🚨",
      title: "Early Warning System",
      description: "Multi-channel notification system ensures rapid response to deforestation events.",
      details: [
        "Email notifications",
        "SMS alerts",
        "WhatsApp integration",
        "Push notifications",
      ],
    },
    {
      icon: "📱",
      title: "Field Operations",
      description: "Comprehensive field reporting system with GPS tracking, photo evidence, and voice notes.",
      details: [
        "GPS location capture",
        "Photo/video evidence",
        "Voice recording",
        "Offline mode support",
      ],
    },
    {
      icon: "🗺️",
      title: "Interactive Mapping",
      description: "Real-time interactive maps showing alerts, regions, and patrol routes with detailed information.",
      details: [
        "Live alert visualization",
        "Region boundaries",
        "Patrol route tracking",
        "Historical data overlay",
      ],
    },
    {
      icon: "📊",
      title: "Analytics & Insights",
      description: "Comprehensive analytics dashboard with trends, regional comparisons, and carbon impact calculations.",
      details: [
        "Trend analysis",
        "Regional comparisons",
        "Carbon loss tracking",
        "Predictive hotspots",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">Features & Capabilities</h1>
          <p className="text-xl text-green-100 max-w-3xl">
            Discover the powerful features that make our deforestation monitoring system effective
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-600">
                        <span className="text-green-600 mr-2">✓</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI/ML Capabilities */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">🤖 AI/ML Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Deforestation Detection
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Custom CNN models trained on satellite imagery</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Change detection algorithms for before/after comparison</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Confidence scoring (LOW, MEDIUM, HIGH, CRITICAL)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Automated alert generation based on thresholds</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Predictive Analytics
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Hotspot prediction using historical patterns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Risk score calculation (0-100 scale)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Trend forecasting for proactive monitoring</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Anomaly detection for unusual patterns</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Stories */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">🌟 Success Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-6 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Early Detection Saves 50 Hectares
                </h3>
                <p className="text-gray-700">
                  Our AI system detected illegal logging activity in Bombali District within 
                  24 hours of satellite image capture. Field officers were dispatched immediately, 
                  preventing further deforestation and saving approximately 50 hectares of forest.
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Community Engagement Success
                </h3>
                <p className="text-gray-700">
                  Through our public monitoring portal, local communities have been able to 
                  report suspicious activities, leading to 15 verified alerts and increased 
                  community awareness about forest conservation.
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Data-Driven Policy Decisions
                </h3>
                <p className="text-gray-700">
                  Government officials have used our analytics dashboard to identify high-risk 
                  regions and allocate resources more effectively, resulting in a 30% reduction 
                  in deforestation rates in targeted areas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Experience the Power of AI-Driven Monitoring
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            See our system in action with live monitoring and real-time alerts
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/monitor">
              <Button size="lg">View Live Monitor</Button>
            </Link>
            <Link href="/data">
              <Button variant="secondary" size="lg">Explore Data Portal</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
