import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">About Our Project</h1>
          <p className="text-xl text-green-100 max-w-3xl">
            AI-powered early warning system for deforestation monitoring in the Northern Region of Sierra Leone
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                To protect and preserve the forests of Sierra Leone's Northern Region through 
                advanced AI-powered monitoring, early warning systems, and data-driven conservation 
                strategies. We aim to empower communities, government agencies, and stakeholders 
                with real-time insights to combat deforestation effectively.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                A future where Sierra Leone's forests are sustainably managed and protected, 
                where deforestation is detected and prevented in real-time, and where 
                communities thrive in harmony with their natural environment. We envision 
                a model system that can be replicated across West Africa and beyond.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Project Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                This project represents a comprehensive approach to deforestation monitoring, 
                combining cutting-edge satellite imagery analysis, machine learning algorithms, 
                and real-time alert systems to provide early warning capabilities for forest 
                conservation efforts.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
                  <div className="text-gray-700">Continuous Monitoring</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-4xl font-bold text-green-600 mb-2">AI-Powered</div>
                  <div className="text-gray-700">Detection System</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-4xl font-bold text-green-600 mb-2">Real-Time</div>
                  <div className="text-gray-700">Alert Generation</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Information */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Our Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-24 h-24 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  RD
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Research Team</h3>
                <p className="text-sm text-gray-600">
                  Data scientists, ML engineers, and GIS specialists
                </p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-24 h-24 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  FD
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Field Officers</h3>
                <p className="text-sm text-gray-600">
                  On-ground verification and data collection team
                </p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-24 h-24 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  PM
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Project Management</h3>
                <p className="text-sm text-gray-600">
                  Coordination and stakeholder engagement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partners & Funders */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Partners & Funders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="font-medium text-gray-900">Government</p>
                <p className="text-sm text-gray-600">Sierra Leone</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="font-medium text-gray-900">Academic</p>
                <p className="text-sm text-gray-600">Institutions</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-medium text-gray-900">NGOs</p>
                <p className="text-sm text-gray-600">Conservation</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="font-medium text-gray-900">Private</p>
                <p className="text-sm text-gray-600">Sector</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">
                Interested in partnering with us?
              </p>
              <Link href="/contact">
                <Button>Get in Touch</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Us in Protecting Our Forests
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Together, we can make a difference in preserving Sierra Leone's natural heritage 
            for future generations.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/monitor">
              <Button size="lg">View Live Monitor</Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" size="lg">Contact Us</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
