"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import CreateSubscriptionModal from "@/components/subscriptions/CreateSubscriptionModal";

interface Subscription {
  id: string;
  regionIds: string[];
  regions?: Array<{
    id: string;
    name: string;
    district: string;
  }>;
  minSeverity: string;
  channels: string[];
  isActive: boolean;
  createdAt: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications/subscriptions");
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscription = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/notifications/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchSubscriptions();
    } catch (error) {
      console.error("Error toggling subscription:", error);
    }
  };

  const deleteSubscription = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription?")) return;

    try {
      await fetch(`/api/notifications/subscriptions/${id}`, {
        method: "DELETE",
      });
      fetchSubscriptions();
    } catch (error) {
      console.error("Error deleting subscription:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alert Subscriptions</h1>
          <p className="text-gray-600 mt-2">
            Manage your alert subscriptions and notification preferences
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
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
          New Subscription
        </Button>
      </div>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>My Subscriptions ({subscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p className="mb-4">No subscriptions yet</p>
              <Button onClick={() => setShowCreateModal(true)}>
                Create Your First Subscription
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {subscription.regions && subscription.regions.length > 0
                            ? subscription.regions.length === 1
                              ? subscription.regions[0].name
                              : `${subscription.regions.length} Regions`
                            : "All Regions"}
                        </h3>
                        <Badge
                          variant={subscription.isActive ? "success" : "default"}
                          size="sm"
                        >
                          {subscription.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          Minimum Severity:{" "}
                          <span className="font-medium">
                            {subscription.minSeverity}
                          </span>
                        </p>
                        <p>
                          Channels:{" "}
                          <span className="font-medium">
                            {subscription.channels.join(", ")}
                          </span>
                        </p>
                        {subscription.regions && subscription.regions.length > 0 && (
                          <div>
                            <p className="font-medium mb-1">Regions:</p>
                            <ul className="list-disc list-inside text-xs">
                              {subscription.regions.map((r) => (
                                <li key={r.id}>
                                  {r.name} ({r.district})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="text-xs text-gray-400">
                          Created: {new Date(subscription.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleSubscription(subscription.id, subscription.isActive)
                        }
                      >
                        {subscription.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSubscription(subscription.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Subscription Modal */}
      <CreateSubscriptionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchSubscriptions();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}
