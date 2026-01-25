"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";

interface MLModel {
  id: string;
  name: string;
  modelType: string;
  version: string;
  description: string | null;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1Score: number | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    predictions: number;
    validations: number;
  };
}

export default function MLModelsPage() {
  const [models, setModels] = useState<MLModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalModels: 0,
    activeModels: 0,
    totalPredictions: 0,
    avgAccuracy: 0,
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ml-models");
      const data = await response.json();
      setModels(data.models || []);

      // Calculate stats
      const activeModels = data.models.filter((m: MLModel) => m.isActive);
      const totalPredictions = data.models.reduce(
        (sum: number, m: MLModel) => sum + m._count.predictions,
        0
      );
      const avgAccuracy =
        activeModels.length > 0
          ? activeModels.reduce((sum: number, m: MLModel) => sum + (m.accuracy || 0), 0) /
            activeModels.length
          : 0;

      setStats({
        totalModels: data.models.length,
        activeModels: activeModels.length,
        totalPredictions,
        avgAccuracy,
      });
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ML Models Management</h1>
          <p className="text-gray-600 mt-2">
            Manage machine learning models for deforestation detection
          </p>
        </div>
        <Button>
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Model
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Models"
          value={stats.totalModels}
          icon="🤖"
          color="blue"
        />
        <StatCard
          label="Active Models"
          value={stats.activeModels}
          icon="✅"
          color="green"
        />
        <StatCard
          label="Total Predictions"
          value={stats.totalPredictions}
          icon="📊"
          color="purple"
        />
        <StatCard
          label="Avg Accuracy"
          value={`${(stats.avgAccuracy * 100).toFixed(1)}%`}
          icon="🎯"
          color="yellow"
        />
      </div>

      {/* Models List */}
      <Card>
        <CardHeader>
          <CardTitle>Machine Learning Models</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading models...</div>
          ) : models.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No models found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accuracy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      F1 Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Predictions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {models.map((model) => (
                    <tr key={model.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {model.name}
                        </div>
                        {model.description && (
                          <div className="text-xs text-gray-500">
                            {model.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model.modelType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        v{model.version}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {model.accuracy !== null ? (
                          <span className="text-sm font-medium text-gray-900">
                            {(model.accuracy * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {model.f1Score !== null ? (
                          <span className="text-sm font-medium text-gray-900">
                            {model.f1Score.toFixed(3)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model._count.predictions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={model.isActive ? "success" : "default"}
                          size="sm"
                        >
                          {model.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link href={`/dashboard/ml-models/${model.id}`}>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
