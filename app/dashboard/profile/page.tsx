"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  organization: string | null;
  position: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    organization: "",
    position: "",
  });

  useEffect(() => {
    // Wait for session to be available before fetching profile
    if (session) {
      fetchProfile();
    } else if (session === null) {
      // Session is null (not loading), redirect to login
      setLoading(false);
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to fetch profile (${response.status})`;
        
        // Handle authentication errors
        if (response.status === 401) {
          // Redirect to login if unauthorized
          window.location.href = "/auth/login";
          return;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.user) {
        throw new Error("No user data returned");
      }
      
      setProfile(data.user);
      setFormData({
        name: data.user.name || "",
        phone: data.user.phone || "",
        organization: data.user.organization || "",
        position: data.user.position || "",
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      // Set default empty profile on error
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchProfile();
        setEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password changed successfully!");
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        alert(data.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Error changing password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading || session === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  // If no session, show message (will be handled by middleware, but just in case)
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your profile</p>
          <Button onClick={() => window.location.href = "/auth/login"}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-red-600 font-medium mb-2">Failed to load profile</p>
              <p className="text-gray-600 mb-4">There was an error loading your profile information.</p>
              <Button onClick={fetchProfile}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your account information and settings
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="secondary">
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: profile?.name || "",
                      phone: profile?.phone || "",
                      organization: profile?.organization || "",
                      position: profile?.position || "",
                    });
                  }}
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={editing ? formData.name : profile?.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={!editing}
              />
              <Input
                label="Email"
                value={profile?.email || ""}
                disabled={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                value={editing ? formData.phone : profile?.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={!editing}
                placeholder="Enter phone number"
              />
              <Input
                label="Role"
                value={profile?.role || ""}
                disabled={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Organization"
                value={
                  editing ? formData.organization : profile?.organization || ""
                }
                onChange={(e) =>
                  setFormData({ ...formData, organization: e.target.value })
                }
                disabled={!editing}
                placeholder="Enter organization"
              />
              <Input
                label="Position"
                value={editing ? formData.position : profile?.position || ""}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                disabled={!editing}
                placeholder="Enter position"
              />
            </div>

            <div>
              <p className="text-sm text-gray-600">Member since</p>
              <p className="font-medium">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Password</p>
              <div className="flex items-center gap-3">
                <Input
                  type="password"
                  value="••••••••"
                  disabled={true}
                  className="max-w-xs"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Account Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Last Login</p>
                <p className="text-sm text-gray-600">
                  Your most recent login to the system
                </p>
              </div>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Account Status</p>
                <p className="text-sm text-gray-600">Your account is active</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Change Password
            </h3>
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Enter new password (min 8 characters)"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="flex-1"
              >
                {changingPassword ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
