"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  const faqs = [
    {
      question: "How does the AI detection system work?",
      answer: "Our system uses satellite imagery from Sentinel-2 and Google Earth Engine, processes it through custom ML models to detect deforestation patterns, and generates alerts based on confidence thresholds. Field officers then verify these alerts on the ground.",
    },
    {
      question: "How often is the satellite data updated?",
      answer: "Satellite imagery is updated every 5 days using Sentinel-2 data. This provides near real-time monitoring capabilities for rapid response to deforestation events.",
    },
    {
      question: "Can I access the data for research purposes?",
      answer: "Yes! We have a public data portal where researchers can access anonymized datasets, download GeoJSON files, and use our API for research purposes. Visit the Data Portal page for more information.",
    },
    {
      question: "How can I report deforestation?",
      answer: "You can report deforestation through our public monitoring portal, contact our field officers directly, or use the contact form on this page. All reports are verified by our team.",
    },
    {
      question: "Is the system available for other regions?",
      answer: "Currently, the system is focused on the Northern Region of Sierra Leone. However, we are working on expanding to other regions and countries. Contact us if you're interested in implementation.",
    },
    {
      question: "How accurate is the AI detection?",
      answer: "Our ML models achieve over 85% accuracy in detecting deforestation events. All alerts are verified by field officers to ensure accuracy before taking action.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-green-100 max-w-3xl">
            Get in touch with our team for questions, partnerships, or support
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="p-6 bg-green-50 rounded-lg text-center">
                    <div className="text-5xl mb-4">✓</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      We'll get back to you as soon as possible.
                    </p>
                    <Button onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="Your Name *"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    <Input
                      label="Email Address *"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                    <Input
                      label="Subject *"
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                      </label>
                      <textarea
                        required
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Office Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Main Office
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Northern Region<br />
                      Sierra Leone<br />
                      West Africa
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Field Operations
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Multiple locations across<br />
                      Northern Region districts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a
                    href="#"
                    className="flex items-center text-gray-700 hover:text-green-600"
                  >
                    <span className="mr-3">📘</span>
                    Facebook
                  </a>
                  <a
                    href="#"
                    className="flex items-center text-gray-700 hover:text-green-600"
                  >
                    <span className="mr-3">🐦</span>
                    Twitter
                  </a>
                  <a
                    href="#"
                    className="flex items-center text-gray-700 hover:text-green-600"
                  >
                    <span className="mr-3">📷</span>
                    Instagram
                  </a>
                  <a
                    href="#"
                    className="flex items-center text-gray-700 hover:text-green-600"
                  >
                    <span className="mr-3">💼</span>
                    LinkedIn
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
