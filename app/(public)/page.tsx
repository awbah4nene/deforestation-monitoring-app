"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-green-100 flex items-center justify-center">
      <p className="text-green-700">Loading map...</p>
    </div>
  ),
});

export default function HomePage() {
  const [mapReady, setMapReady] = useState(false);

  return (
    <>
      {/* Hero Section with Full Width Map */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Content and Map Side by Side - Full Width */}
        <div className="relative w-full">
          <div className="w-full py-20 px-8 md:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-[1920px] mx-auto">
              {/* Left: Content */}
              <div className="space-y-8 animate-fadeInUp">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight transition-all duration-500 hover:scale-105">
                  AI-Powered Deforestation Monitoring
                  <span className="block text-green-300 mt-2 animate-pulse">
                    Northern Sierra Leone
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-green-100 leading-relaxed">
                  An innovative IT-based early warning system for sustainable forest 
                  management, leveraging satellite imagery, machine learning, and 
                  real-time monitoring to protect vital forest ecosystems.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link href="/auth/login">
                    <Button 
                      size="lg" 
                      variant="ghost"
                      className="bg-white text-green-700 hover:bg-green-50 hover:text-green-800 text-base px-8 py-3 transition-all duration-300 transform hover:scale-105 hover:shadow-xl font-semibold border-0"
                      style={{ color: '#15803d' }}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Access Dashboard
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="secondary" size="lg" className="bg-green-700 hover:bg-green-600 border-0 text-base px-8 py-3 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Learn More
                    </Button>
                  </Link>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-green-700">
                  <div className="transform transition-all duration-300 hover:scale-110">
                    <div className="text-4xl font-bold text-green-300 transition-all duration-300 hover:text-green-200">5</div>
                    <div className="text-sm text-green-200 mt-2">Districts Monitored</div>
                  </div>
                  <div className="transform transition-all duration-300 hover:scale-110">
                    <div className="text-4xl font-bold text-green-300 transition-all duration-300 hover:text-green-200">24/7</div>
                    <div className="text-sm text-green-200 mt-2">Real-time Alerts</div>
                  </div>
                  <div className="transform transition-all duration-300 hover:scale-110">
                    <div className="text-4xl font-bold text-green-300 transition-all duration-300 hover:text-green-200">AI</div>
                    <div className="text-sm text-green-200 mt-2">Powered System</div>
                  </div>
                </div>
              </div>

              {/* Right: Map */}
              <div className="relative animate-fadeInRight">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 shadow-2xl transform transition-all duration-500 hover:shadow-3xl hover:scale-105">
                  <div className="mb-3">
                    <h3 className="text-xl font-semibold text-white mb-2">Interactive Coverage Map</h3>
                    <p className="text-base text-green-200">
                      Bombali • Kambia • Koinadugu • Port Loko • Tonkolili
                    </p>
                  </div>
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-2xl" style={{ height: '500px' }}>
                    <MapComponent
                      center={[9.5, -11.5]}
                      zoom={8}
                      className="h-full w-full"
                      onMapReady={() => setMapReady(true)}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-green-200 text-base flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>Real-time monitoring</span>
                    <Link href="/dashboard/map" className="text-green-300 hover:text-white font-medium text-base transition-all duration-300 hover:translate-x-1">
                      View Full Map →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Satellite Integration Feature */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="w-full px-8 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-[1920px] mx-auto">
            {/* Left: Feature Info */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-3 bg-blue-500/20 px-6 py-3 rounded-full">
                <svg className="w-7 h-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="text-blue-200 font-semibold text-base">Real-Time Technology</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold leading-tight transition-all duration-500 hover:scale-105">
                Satellite Integration
              </h2>
              
              <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                Multi-spectral satellite imagery from Sentinel and Landsat for continuous 
                forest cover monitoring and change detection.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-blue-800/50 backdrop-blur-sm p-4 rounded-lg transition-all duration-300 hover:bg-blue-700/50 hover:scale-105 hover:shadow-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-white text-base">Sentinel</h3>
                  </div>
                  <p className="text-sm text-blue-200">10-20m resolution, 5-day revisit</p>
                </div>
                <div className="bg-blue-800/50 backdrop-blur-sm p-4 rounded-lg transition-all duration-300 hover:bg-blue-700/50 hover:scale-105 hover:shadow-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    <h3 className="font-semibold text-white text-base">Landsat</h3>
                  </div>
                  <p className="text-sm text-blue-200">30m resolution, 16-day revisit</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-blue-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-base font-medium">Live Monitoring Active</span>
                </div>
                <span className="text-blue-400 text-lg">•</span>
                <span className="text-base">Updated every 5-16 days</span>
              </div>
            </div>

            {/* Right: Visual/Graphic */}
            <div className="relative">
              <div className="bg-blue-800/30 backdrop-blur-sm rounded-2xl p-10 border border-blue-700/50">
                <div className="space-y-6">
                  {/* Satellite Imagery Layers */}
                  <div className="bg-gradient-to-br from-blue-700/50 to-blue-900/50 rounded-lg p-8 border border-blue-600/30">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-white">Data Sources</h3>
                      <span className="text-base bg-green-500/20 text-green-300 px-4 py-2 rounded font-medium">Active</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-blue-900/50 p-4 rounded transition-all duration-300 hover:bg-blue-800/50 hover:scale-105">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center transform transition-all duration-300 hover:rotate-12">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white font-semibold text-base">Sentinel-2</p>
                            <p className="text-sm text-blue-300">Multi-spectral</p>
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex items-center justify-between bg-blue-900/50 p-4 rounded transition-all duration-300 hover:bg-blue-800/50 hover:scale-105">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-purple-600 rounded flex items-center justify-center transform transition-all duration-300 hover:rotate-12">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white font-semibold text-base">Landsat 8/9</p>
                            <p className="text-sm text-blue-300">Thermal + Optical</p>
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Detection Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-600/30 rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:border-green-500/50">
                      <p className="text-3xl font-bold text-green-300">10m</p>
                      <p className="text-sm text-green-200 mt-1">Min. Resolution</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-600/30 rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:border-yellow-500/50">
                      <p className="text-3xl font-bold text-yellow-300">5-16</p>
                      <p className="text-sm text-yellow-200 mt-1">Days Coverage</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Context Section */}
      <section className="py-20 bg-white">
        <div className="w-full px-8 md:px-12 lg:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-16 animate-fadeInUp">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 transition-all duration-500 hover:scale-105">
                Addressing Critical Environmental Challenges
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Sierra Leone faces significant deforestation challenges. This system provides 
                scientific, data-driven solutions for sustainable forest management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:border-l-8 animate-fadeIn">
              <div className="flex items-start">
                <div className="text-4xl mr-5 transition-transform duration-300 hover:scale-110">⚠️</div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">The Problem</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    Rapid deforestation threatens biodiversity, carbon storage, and 
                    local livelihoods in Northern Sierra Leone's critical forest ecosystems.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:border-l-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
              <div className="flex items-start">
                <div className="text-4xl mr-5 transition-transform duration-300 hover:scale-110">💡</div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">The Innovation</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    Integrating satellite technology, AI algorithms, and mobile systems 
                    for real-time detection and rapid response to deforestation events.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:border-l-8 animate-fadeIn" style={{animationDelay: '0.4s'}}>
              <div className="flex items-start">
                <div className="text-4xl mr-5 transition-transform duration-300 hover:scale-110">🎯</div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">The Impact</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    Empowering local authorities and communities with tools for 
                    evidence-based decision-making and sustainable forest conservation.
                  </p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Features */}
      <section className="py-20 bg-gray-50">
        <div className="w-full px-8 md:px-12 lg:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-16 animate-fadeInUp">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 transition-all duration-500 hover:scale-105">
                Comprehensive Monitoring System
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Advanced technology stack for effective forest protection
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Cards */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-fadeIn">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-5 transform transition-all duration-300 hover:rotate-12 hover:scale-110">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors duration-300 hover:text-green-600">Satellite Integration</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Multi-spectral satellite imagery from Sentinel and Landsat for continuous 
                forest cover monitoring and change detection.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-fadeIn" style={{animationDelay: '0.1s'}}>
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-5 transform transition-all duration-300 hover:rotate-12 hover:scale-110">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors duration-300 hover:text-blue-600">Machine Learning</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                AI-powered algorithms analyze patterns, predict high-risk areas, and 
                automatically detect deforestation with high accuracy.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-fadeIn" style={{animationDelay: '0.2s'}}>
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-5 transform transition-all duration-300 hover:rotate-12 hover:scale-110">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors duration-300 hover:text-yellow-600">Early Warning System</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Real-time alerts and notifications to stakeholders when potential 
                deforestation activities are detected.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-fadeIn" style={{animationDelay: '0.3s'}}>
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-5 transform transition-all duration-300 hover:rotate-12 hover:scale-110">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors duration-300 hover:text-purple-600">Analytics Dashboard</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Interactive visualizations, trend analysis, and comprehensive reporting 
                for data-driven forest management decisions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-fadeIn" style={{animationDelay: '0.4s'}}>
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-5 transform transition-all duration-300 hover:rotate-12 hover:scale-110">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors duration-300 hover:text-red-600">Field Verification</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Mobile app for field officers to verify alerts, collect evidence, 
                and report ground-truth observations in real-time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-fadeIn" style={{animationDelay: '0.5s'}}>
              <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mb-5 transform transition-all duration-300 hover:rotate-12 hover:scale-110">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors duration-300 hover:text-indigo-600">Multi-Stakeholder Platform</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Collaborative tools connecting government agencies, conservation organizations, 
                local communities, and research institutions.
              </p>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Coverage Districts */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="w-full px-8 md:px-12 lg:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-16 animate-fadeInUp">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 transition-all duration-500 hover:scale-105">
                Northern Region Coverage
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Five critical districts under continuous monitoring
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { name: 'Bombali', icon: '🌲' },
                { name: 'Kambia', icon: '🌳' },
                { name: 'Koinadugu', icon: '🌴' },
                { name: 'Port Loko', icon: '🌿' },
                { name: 'Tonkolili', icon: '🍃' },
              ].map((district, index) => (
                <div key={district.name} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-110 animate-fadeIn" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="text-5xl mb-4 transform transition-transform duration-300 hover:scale-125 hover:rotate-12">{district.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 transition-colors duration-300 hover:text-green-600">{district.name}</h3>
                  <p className="text-base text-gray-600 mt-2">District</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="w-full px-8 md:px-12 lg:px-16 relative z-10">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center animate-fadeInUp">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 transition-all duration-500 hover:scale-105">
                Join the Forest Conservation Mission
              </h2>
              <p className="text-lg md:text-xl text-green-100 mb-10 max-w-3xl mx-auto leading-relaxed">
                Be part of this groundbreaking initiative to protect Northern Sierra Leone's 
                forest ecosystems through technology and collaboration.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/auth/register">
                  <Button 
                    size="lg" 
                    variant="ghost"
                    className="bg-white text-green-700 hover:bg-gray-100 hover:text-green-800 text-base px-8 py-3 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl font-semibold border-0"
                    style={{ color: '#15803d' }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Register Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="bg-green-500 hover:bg-green-400 border-0 text-base px-8 py-3 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Us
                </Button>
              </Link>
            </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
