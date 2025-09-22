"use client";
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Bell,
  Shield,
  Database,
  HelpCircle,
  AlertTriangle,
  Save,
  RefreshCw,
  Mail,
  BarChart3,
  Lock,
  Eye,
  EyeOff,
  Globe
} from 'lucide-react';

export default function Page() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [paymentNotifications, setPaymentNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Account Settings
  const [contactEmail, setContactEmail] = useState('');
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  // Appearance Settings
  const [theme, setTheme] = useState('light');
  const [compactMode, setCompactMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Business Settings
  const [taxSettings, setTaxSettings] = useState('inclusive');
  const [autoBackup, setAutoBackup] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    setLoading(true);
    try {
      const raw = localStorage.getItem('simbi_settings');
      if (raw) {
        try {
          const s = JSON.parse(raw);
          setContactEmail(s.contactEmail || '');
          setEmailNotifications(typeof s.emailNotifications === 'boolean' ? s.emailNotifications : true);
          setPushNotifications(typeof s.pushNotifications === 'boolean' ? s.pushNotifications : true);
          setOrderNotifications(typeof s.orderNotifications === 'boolean' ? s.orderNotifications : true);
          setPaymentNotifications(typeof s.paymentNotifications === 'boolean' ? s.paymentNotifications : true);
          setMarketingEmails(typeof s.marketingEmails === 'boolean' ? s.marketingEmails : false);
          setTwoFactorAuth(typeof s.twoFactorAuth === 'boolean' ? s.twoFactorAuth : false);
          setSessionTimeout(s.sessionTimeout || '30');
          setTheme(s.theme || 'light');
          setCompactMode(typeof s.compactMode === 'boolean' ? s.compactMode : false);
          setShowSidebar(typeof s.showSidebar !== 'boolean' ? true : s.showSidebar);
          setTaxSettings(s.taxSettings || 'inclusive');
          setAutoBackup(typeof s.autoBackup === 'boolean' ? s.autoBackup : true);
          setAnalyticsEnabled(typeof s.analyticsEnabled === 'boolean' ? s.analyticsEnabled : true);
        } catch (parseError) {
          console.error('Error parsing settings from localStorage:', parseError);
          // If parsing fails, remove corrupted data
          localStorage.removeItem('simbi_settings');
        }
      }
    } catch (storageError) {
      console.error('Error accessing localStorage:', storageError);
      // localStorage might not be available (private browsing, etc.)
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const settings = {
        contactEmail,
        emailNotifications,
        pushNotifications,
        orderNotifications,
        paymentNotifications,
        marketingEmails,
        twoFactorAuth,
        sessionTimeout,
        theme,
        compactMode,
        showSidebar,
        taxSettings,
        autoBackup,
        analyticsEnabled,
        lastUpdated: new Date().toISOString()
      };

      // Validate settings before saving
      if (contactEmail && !contactEmail.includes('@')) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      localStorage.setItem('simbi_settings', JSON.stringify(settings));

      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const resetToDefaults = () => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      localStorage.removeItem('simbi_settings');
      loadSettings();
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to defaults.",
        variant: "default",
      });
    }
  };

  const clearDemoData = () => {
    if (confirm('Clear all demo data? This will remove all local data and cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your notification preferences, security settings, and account configuration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadSettings}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={saveSettings}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Settings */}
          <div className="xl:col-span-3 space-y-6">

            {/* Notifications */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Order Notifications</Label>
                      <p className="text-xs text-muted-foreground">Get notified when orders are placed</p>
                    </div>
                    <Switch
                      checked={orderNotifications}
                      onCheckedChange={setOrderNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Payment Notifications</Label>
                      <p className="text-xs text-muted-foreground">Get notified about payment status</p>
                    </div>
                    <Switch
                      checked={paymentNotifications}
                      onCheckedChange={setPaymentNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Marketing Emails</Label>
                      <p className="text-xs text-muted-foreground">Receive promotional emails and updates</p>
                    </div>
                    <Switch
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={twoFactorAuth}
                    onCheckedChange={setTwoFactorAuth}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Session Timeout</Label>
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Automatically log out after inactivity</p>
                </div>
              </CardContent>
            </Card>

            {/* Business Settings */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Business Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tax Settings</Label>
                  <Select value={taxSettings} onValueChange={setTaxSettings}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inclusive">Tax Inclusive</SelectItem>
                      <SelectItem value="exclusive">Tax Exclusive</SelectItem>
                      <SelectItem value="none">No Tax</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">How taxes are calculated and displayed</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Auto Backup</Label>
                    <p className="text-xs text-muted-foreground">Automatically backup your data daily</p>
                  </div>
                  <Switch
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Analytics</Label>
                    <p className="text-xs text-muted-foreground">Help improve the platform with anonymous usage data</p>
                  </div>
                  <Switch
                    checked={analyticsEnabled}
                    onCheckedChange={setAnalyticsEnabled}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={resetToDefaults}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/profile">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Type</span>
                  <Badge variant="secondary">Seller</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground">
                  <p>• Settings auto-save locally</p>
                  <p>• Data encrypted in transit</p>
                  <p>• 24/7 system monitoring</p>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="shadow-sm border-destructive/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Irreversible actions that affect your account
                </p>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={clearDemoData}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </CardContent>
            </Card>

            {/* Help */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Help & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Need assistance? Our support team is here to help.
                </p>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
