"use client";
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import PayoutsHistory from '@/components/PayoutsHistory';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Building2,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Camera,
  Trash2,
  Save,
  Plus,
  Shield,
  FileText
} from 'lucide-react';

export default function Page() {
  const { user, profile, updateProfile } = useUser();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [storeCountry, setStoreCountry] = useState('');
  const [storeCity, setStoreCity] = useState('');
  const [storeAddress1, setStoreAddress1] = useState('');
  const [storeAddress2, setStoreAddress2] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [businessOwnerName, setBusinessOwnerName] = useState('');
  const [businessOwnerEmail, setBusinessOwnerEmail] = useState('');
  const [businessOwnerPhone, setBusinessOwnerPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [methods, setMethods] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(()=>{
    async function loadProfileData() {
      // Load data from user profile context first
      if (profile) {
        setName(profile.displayName || '');
        setEmail(profile.email || '');
        setAvatarUrl(profile.photoURL || null);
        setPhone(profile.phoneNumber || '');
        setStoreName(profile.storeName || '');
        setStoreCountry(profile.storeCountry || '');
        setStoreCity(profile.storeCity || '');
        setStoreAddress1(profile.storeAddress1 || '');
        setStoreAddress2(profile.storeAddress2 || '');
        setPostalCode(profile.postalCode || '');
        setVatNumber(profile.vatNumber || '');
        setBusinessOwnerName(profile.businessOwnerName || '');
        setBusinessOwnerEmail(profile.businessOwnerEmail || '');
        setBusinessOwnerPhone(profile.businessOwnerPhone || '');
        setNationalId(profile.nationalId || '');
      }

      // If user is logged in but profile data is missing, try to load from database (unless disabled)
      const dbDisabled = localStorage.getItem('simbi_db_disabled') === 'true';
      if (user && (!profile || (!profile.storeName && !profile.businessOwnerName)) && !dbDisabled) {
        try {
          // Add user ID as query parameter to get specific user data
          const response = await fetch(`/api/users?uid=${encodeURIComponent(user.uid)}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.user) {
              const userData = data.user;
              // Update the profile context with database data
              await updateProfile({
                displayName: userData.first_name && userData.last_name ? `${userData.first_name} ${userData.last_name}` : profile?.displayName || '',
                phoneNumber: userData.phone_number || profile?.phoneNumber || '',
                nationalId: userData.national_id || profile?.nationalId || '',
                storeName: userData.store_name || profile?.storeName || '',
                vatNumber: '', // Not stored in database yet
                storeCountry: '', // Not stored in database yet
                storeCity: '', // Not stored in database yet
                storeAddress1: '', // Not stored in database yet
                businessOwnerName: userData.first_name && userData.last_name ? `${userData.first_name} ${userData.last_name}` : profile?.businessOwnerName || '',
                businessOwnerEmail: userData.email || profile?.businessOwnerEmail || '',
                businessOwnerPhone: userData.phone_number || profile?.businessOwnerPhone || ''
              });
            }
          } else {
            console.warn('Failed to load user data from database:', response.status);
          }
        } catch (error) {
          console.error('Error loading user data from database:', error);
        }
      }
    }

    loadProfileData();
    fetchMethods();
    setInitialLoading(false);
  },[profile, user, updateProfile]);

  function validateVAT(v: string) {
    if (!v) return true;
    return v.trim().length >= 5; // simple client-side check
  }

  async function saveProfile() {
    console.log('saveProfile function called');

    if (vatNumber && !validateVAT(vatNumber)) {
      console.log('VAT validation failed');
      toast({
        title: "Invalid VAT Number",
        description: "Please enter a valid VAT or tax number (minimum 5 characters).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Saving profile with data:', {
        displayName: name,
        email: email,
        phoneNumber: phone,
        storeName,
        businessOwnerName
      });

      await updateProfile({
        displayName: name,
        email: email,
        photoURL: avatarUrl,
        phoneNumber: phone,
        storeName,
        storeCountry,
        storeCity,
        storeAddress1,
        storeAddress2,
        postalCode,
        vatNumber,
        businessOwnerName,
        businessOwnerEmail,
        businessOwnerPhone,
        nationalId
      });

      console.log('Profile saved successfully - showing success toast');
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  }

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check if FileReader is supported
      if (typeof FileReader === 'undefined') {
        reject(new Error('FileReader is not supported in this browser'));
        return;
      }

      const fr = new FileReader();
      fr.onload = () => {
        try {
          const result = String(fr.result);
          resolve(result);
        } catch (error) {
          reject(new Error('Failed to process file'));
        }
      };
      fr.onerror = (e) => {
        console.error('FileReader error:', e);
        reject(new Error('Failed to read file'));
      };
      fr.onabort = () => {
        reject(new Error('File reading was aborted'));
      };

      try {
        fr.readAsDataURL(file);
      } catch (error) {
        console.error('Error starting file read:', error);
        reject(new Error('Failed to start reading file'));
      }
    });
  }

  async function handleAvatarFile(f?: File | null) {
    if (!f) return;
    const allowed = ['image/png','image/jpeg','image/webp'];
    if (!allowed.includes(f.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only PNG, JPG, and WEBP images are allowed.",
        variant: "destructive",
      });
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size must be less than 2MB.",
        variant: "destructive",
      });
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(f);
      setAvatarUrl(dataUrl);
      // Auto-save the profile when avatar is updated
      await updateProfile({
        photoURL: dataUrl
      });
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been saved successfully.",
        variant: "default",
      });
    } catch (e) {
      toast({
        title: "Upload Failed",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    }
  }

  function removeAvatar() {
    if (!confirm('Remove profile picture?')) return;
    setAvatarUrl(null);
  }

  async function fetchMethods() {
    setLoading(true);
    try {
      const res = await fetch('/api/payment-methods');
      if (!res.ok) {
        console.error('Failed to fetch payment methods:', res.status, res.statusText);
        setMethods([]);
        return;
      }
      const d = await res.json();
      setMethods(d.items || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setMethods([]);
    } finally {
      setLoading(false);
    }
  }

  // simple tokenization: hash accountNumber using SubtleCrypto and send only token and last4
  async function tokenizeAccount(acc: string) {
    // Check if crypto.subtle is available (should be in all modern browsers)
    if (!crypto || !crypto.subtle) {
      console.warn('crypto.subtle not available, using fallback hash method');
      // Fallback for browsers without crypto.subtle support
      const fallbackHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
      };
      return fallbackHash(acc + '::' + Date.now());
    }

    try {
      const enc = new TextEncoder();
      const data = enc.encode(acc + '::' + (Date.now()));
      const hash = await crypto.subtle.digest('SHA-256', data);
      const arr = Array.from(new Uint8Array(hash));
      return arr.map(b=>b.toString(16).padStart(2,'0')).join('');
    } catch (error) {
      console.error('Error with crypto.subtle, using fallback:', error);
      // Fallback method if crypto.subtle fails
      const fallbackHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
      };
      return fallbackHash(acc + '::' + Date.now());
    }
  }

  async function addMethod() {
    if (!bankName || !accountNumber) {
      toast({
        title: "Missing Information",
        description: "Please provide both bank name and account number.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const token = await tokenizeAccount(accountNumber);
      const last4 = accountNumber.slice(-4);
      const payload = { provider: bankName, type: 'bank', token, last4 };
      const res = await fetch('/api/payment-methods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        setAdding(false);
        setBankName(''); setAccountNumber(''); setRoutingNumber('');
        await fetchMethods();
        toast({
          title: "Payment Method Added",
          description: "Your bank account has been added successfully.",
          variant: "default",
        });
      } else {
        const err = await res.json();
        toast({
          title: "Failed to Add Payment Method",
          description: err.error || res.statusText || "An error occurred while adding your payment method.",
          variant: "destructive",
        });
      }
    } catch (e:any) {
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  async function removeMethod(id:string) {
    if (!confirm('Remove payment method? This action cannot be undone.')) return;
    setLoading(true);
    try {
      const response = await fetch('/api/payment-methods?id='+encodeURIComponent(id), { method: 'DELETE' });
      if (!response.ok) {
        console.error('Failed to remove payment method:', response.status, response.statusText);
        toast({
          title: "Error",
          description: "Failed to remove payment method. Please try again.",
          variant: "destructive",
        });
        return;
      }
      await fetchMethods();
      toast({
        title: "Payment Method Removed",
        description: "The payment method has been removed successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error removing payment method:', error);
      toast({
        title: "Error",
        description: "Failed to remove payment method. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Store Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your business information and payment settings</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                console.log('Save button clicked');
                saveProfile();
              }}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {initialLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Loading Profile</h3>
              <p className="text-muted-foreground">Please wait while we load your information...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden border-2 border-border">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                        <Camera className="h-3 w-3" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e)=>handleAvatarFile(e.target.files?.[0]||null)}
                        />
                      </label>
                    </div>
                    {avatarUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeAvatar}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            value={name}
                            onChange={(e)=>setName(e.target.value)}
                            className="pl-10"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                            className="pl-10"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e)=>setPhone(e.target.value)}
                          className="pl-10"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Store Details */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName" className="text-sm font-medium">Store Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="storeName"
                        value={storeName}
                        onChange={(e)=>setStoreName(e.target.value)}
                        className="pl-10"
                        placeholder="Enter your store name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber" className="text-sm font-medium">VAT / Tax Number</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="vatNumber"
                        value={vatNumber}
                        onChange={(e)=>setVatNumber(e.target.value)}
                        className="pl-10"
                        placeholder="Enter VAT or tax number"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address1" className="text-sm font-medium">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address1"
                      value={storeAddress1}
                      onChange={(e)=>setStoreAddress1(e.target.value)}
                      className="pl-10"
                      placeholder="Street address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2" className="text-sm font-medium">Address Line 2 (Optional)</Label>
                  <Input
                    id="address2"
                    value={storeAddress2}
                    onChange={(e)=>setStoreAddress2(e.target.value)}
                    placeholder="Apartment, suite, etc."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">City</Label>
                    <Input
                      id="city"
                      value={storeCity}
                      onChange={(e)=>setStoreCity(e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-sm font-medium">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e)=>setPostalCode(e.target.value)}
                      placeholder="Postal code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                    <Input
                      id="country"
                      value={storeCountry}
                      onChange={(e)=>setStoreCountry(e.target.value)}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Owner Information */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  Business Owner Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessOwnerName" className="text-sm font-medium">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="businessOwnerName"
                        value={businessOwnerName}
                        onChange={(e)=>setBusinessOwnerName(e.target.value)}
                        className="pl-10"
                        placeholder="Business owner full name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessOwnerEmail" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="businessOwnerEmail"
                        type="email"
                        value={businessOwnerEmail}
                        onChange={(e)=>setBusinessOwnerEmail(e.target.value)}
                        className="pl-10"
                        placeholder="owner@company.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessOwnerPhone" className="text-sm font-medium">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessOwnerPhone"
                      value={businessOwnerPhone}
                      onChange={(e)=>setBusinessOwnerPhone(e.target.value)}
                      className="pl-10"
                      placeholder="Business owner phone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationalId" className="text-sm font-medium">National ID / Registration Number</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nationalId"
                      value={nationalId}
                      onChange={(e)=>setNationalId(e.target.value)}
                      className="pl-10"
                      placeholder="ID number or registration number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payout Methods */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payout Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Secure Bank Account Management</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      We never store raw account numbers. Only encrypted tokens and masked digits are saved.
                    </p>
                  </div>
                  <Button onClick={()=>setAdding(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Bank Account
                  </Button>
                </div>

                {adding && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bankName" className="text-sm font-medium">Bank Name</Label>
                            <Input
                              id="bankName"
                              value={bankName}
                              onChange={(e)=>setBankName(e.target.value)}
                              placeholder="Enter bank name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="routingNumber" className="text-sm font-medium">Routing Number (Optional)</Label>
                            <Input
                              id="routingNumber"
                              value={routingNumber}
                              onChange={(e)=>setRoutingNumber(e.target.value)}
                              placeholder="Enter routing number"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountNumber" className="text-sm font-medium">Account Number</Label>
                          <Input
                            id="accountNumber"
                            value={accountNumber}
                            onChange={(e)=>setAccountNumber(e.target.value)}
                            placeholder="Enter account number"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={addMethod} disabled={loading} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Save Account
                          </Button>
                          <Button variant="outline" onClick={()=>setAdding(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3">
                  {loading && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading payment methods...</p>
                    </div>
                  )}

                  {!loading && methods.length === 0 && (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No payout methods saved yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Add your first bank account to receive payments</p>
                    </div>
                  )}

                  {methods.map(m=> (
                    <Card key={m.id} className="border-border/50 hover:border-border transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{m.provider}</div>
                              <div className="text-sm text-muted-foreground">
                                ****{m.last4} • Added {new Date(m.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={()=>removeMethod(m.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payouts History */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Payout History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PayoutsHistory />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/products">
                    <Building2 className="h-4 w-4 mr-2" />
                    Manage Products
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/orders">
                    <FileText className="h-4 w-4 mr-2" />
                    View Orders
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/reports">
                    <FileText className="h-4 w-4 mr-2" />
                    Sales Reports
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Profile Complete</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground">
                  <p>• All information is encrypted</p>
                  <p>• Payouts processed securely</p>
                  <p>• 24/7 account monitoring</p>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
