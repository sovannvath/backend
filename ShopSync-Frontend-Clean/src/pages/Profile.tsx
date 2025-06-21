import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Edit,
  Save,
  X,
  Shield,
  CreditCard,
  Package,
  Bell,
  Settings,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { authAPI, UpdateProfileData, UpdatePreferencesData, UpdatePasswordData, UserProfile } from "@/services/api";

const Profile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await authAPI.getProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userProfile) return;

    try {
      setSaving(true);
      const profileData: UpdateProfileData = {
        name: userProfile.user.name,
        email: userProfile.user.email,
        phone: userProfile.user.phone,
        street: userProfile.user.street,
        city: userProfile.user.city,
        state: userProfile.user.state,
        zip_code: userProfile.user.zip_code,
        country: userProfile.user.country,
      };

      const response = await authAPI.updateProfile(profileData);
      setUserProfile({
        ...userProfile,
        user: response.user,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setSaving(true);
      const passwordData: UpdatePasswordData = {
        current_password: passwords.current,
        password: passwords.new,
        password_confirmation: passwords.confirm,
      };

      await authAPI.updatePassword(passwordData);
      setIsChangingPassword(false);
      setPasswords({ current: "", new: "", confirm: "" });
      toast.success("Password changed successfully!");
    } catch (error: any) {
      console.error('Failed to change password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePreference = async (key: string, value: boolean) => {
    if (!userProfile) return;

    try {
      const preferenceData: UpdatePreferencesData = {
        [key]: value,
      };

      const response = await authAPI.updatePreferences(preferenceData);
      setUserProfile({
        ...userProfile,
        preferences: response.preferences,
      });
      toast.success("Preference updated");
    } catch (error: any) {
      console.error('Failed to update preference:', error);
      toast.error(error.response?.data?.message || 'Failed to update preference');
    }
  };

  const updateUserField = (field: string, value: string) => {
    if (!userProfile) return;
    setUserProfile({
      ...userProfile,
      user: {
        ...userProfile.user,
        [field]: value,
      },
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen py-8 bg-metallic-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-metallic-700" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!userProfile) {
    return (
      <Layout>
        <div className="min-h-screen py-8 bg-metallic-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-metallic-600 dark:text-slate-400">Failed to load profile data</p>
              <Button onClick={loadUserProfile} className="mt-4">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const { user, stats, preferences } = userProfile;

  return (
    <Layout>
      <div className="min-h-screen py-8 bg-metallic-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-metallic-900 dark:text-white">
                My Profile
              </h1>
              <p className="text-metallic-600 dark:text-slate-400">
                Manage your account settings and preferences
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-metallic-700 hover:bg-metallic-900"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-metallic-700 hover:bg-metallic-900"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Summary Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <Card className="bg-gradient-to-br from-metallic-700 to-metallic-900 text-white">
                <CardContent className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto">
                      <User className="w-12 h-12 text-metallic-700" />
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white text-metallic-700 hover:bg-metallic-100"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <h2 className="text-xl font-bold mb-2">{user.name}</h2>
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white hover:bg-white/30 mb-4"
                  >
                    {user.role.name}
                  </Badge>
                  <div className="space-y-2 text-sm text-metallic-100">
                    <div className="flex items-center justify-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Package className="w-4 h-4 mr-2" />
                      <span>{stats.total_orders} Orders</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Account Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-metallic-600 dark:text-slate-400">
                      Total Spent
                    </span>
                    <span className="font-bold text-metallic-900 dark:text-white">
                      ${stats.total_spent.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-metallic-600 dark:text-slate-400">
                      Loyalty Points
                    </span>
                    <span className="font-bold text-metallic-900 dark:text-white">
                      {stats.loyalty_points}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-metallic-600 dark:text-slate-400">
                      Avg. Order
                    </span>
                    <span className="font-bold text-metallic-900 dark:text-white">
                      ${stats.average_order_value.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              <Tabs defaultValue="personal" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                {/* Personal Information */}
                <TabsContent value="personal">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={user.name}
                            disabled={!isEditing}
                            onChange={(e) => updateUserField('name', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={user.email}
                            disabled={!isEditing}
                            onChange={(e) => updateUserField('email', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={user.phone || ''}
                            disabled={!isEditing}
                            onChange={(e) => updateUserField('phone', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Account Type</Label>
                          <Input
                            id="role"
                            value={user.role.name}
                            disabled
                            className="mt-2 bg-metallic-50 dark:bg-slate-800"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Address Information */}
                <TabsContent value="address">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Address Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <Label htmlFor="street">Street Address</Label>
                          <Input
                            id="street"
                            value={user.street || ''}
                            disabled={!isEditing}
                            onChange={(e) => updateUserField('street', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={user.city || ''}
                            disabled={!isEditing}
                            onChange={(e) => updateUserField('city', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State/Province</Label>
                          <Input
                            id="state"
                            value={user.state || ''}
                            disabled={!isEditing}
                            onChange={(e) => updateUserField('state', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                          <Input
                            id="zipCode"
                            value={user.zip_code || ''}
                            disabled={!isEditing}
                            onChange={(e) => updateUserField('zip_code', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={user.country || ''}
                            disabled={!isEditing}
                            onChange={(e) => updateUserField('country', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">Password</h3>
                          <p className="text-sm text-metallic-600 dark:text-slate-400">
                            Last updated: Never
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setIsChangingPassword(true)}
                          disabled={isChangingPassword}
                        >
                          Change Password
                        </Button>
                      </div>

                      {isChangingPassword && (
                        <Card className="border-metallic-200 dark:border-slate-700">
                          <CardContent className="p-4 space-y-4">
                            <div>
                              <Label htmlFor="currentPassword">Current Password</Label>
                              <div className="relative mt-2">
                                <Input
                                  id="currentPassword"
                                  type={showPassword ? "text" : "password"}
                                  value={passwords.current}
                                  onChange={(e) =>
                                    setPasswords({ ...passwords, current: e.target.value })
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input
                                id="newPassword"
                                type="password"
                                value={passwords.new}
                                onChange={(e) =>
                                  setPasswords({ ...passwords, new: e.target.value })
                                }
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="confirmPassword">Confirm New Password</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) =>
                                  setPasswords({ ...passwords, confirm: e.target.value })
                                }
                                className="mt-2"
                              />
                            </div>
                            <div className="flex space-x-3">
                              <Button
                                onClick={handleChangePassword}
                                disabled={saving}
                                className="bg-metallic-700 hover:bg-metallic-900"
                              >
                                {saving ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : null}
                                Update Password
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsChangingPassword(false);
                                  setPasswords({ current: "", new: "", confirm: "" });
                                }}
                                disabled={saving}
                              >
                                Cancel
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Bell className="w-5 h-5 mr-2" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Email Notifications</h3>
                            <p className="text-sm text-metallic-600 dark:text-slate-400">
                              Receive email notifications for account activities
                            </p>
                          </div>
                          <Switch
                            checked={preferences.email_notifications}
                            onCheckedChange={(checked) =>
                              handleUpdatePreference("email_notifications", checked)
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">SMS Notifications</h3>
                            <p className="text-sm text-metallic-600 dark:text-slate-400">
                              Receive SMS notifications for urgent updates
                            </p>
                          </div>
                          <Switch
                            checked={preferences.sms_notifications}
                            onCheckedChange={(checked) =>
                              handleUpdatePreference("sms_notifications", checked)
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Marketing Emails</h3>
                            <p className="text-sm text-metallic-600 dark:text-slate-400">
                              Receive promotional emails and special offers
                            </p>
                          </div>
                          <Switch
                            checked={preferences.marketing_emails}
                            onCheckedChange={(checked) =>
                              handleUpdatePreference("marketing_emails", checked)
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Order Updates</h3>
                            <p className="text-sm text-metallic-600 dark:text-slate-400">
                              Receive notifications about order status changes
                            </p>
                          </div>
                          <Switch
                            checked={preferences.order_updates}
                            onCheckedChange={(checked) =>
                              handleUpdatePreference("order_updates", checked)
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

