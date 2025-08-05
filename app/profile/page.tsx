"use client";

import { useState, useEffect } from 'react';
import { MainLayout } from "../components/layout/MainLayout";
import { useAuth } from '../lib/auth-context';
import { NotificationPreferences } from '../components/notifications/NotificationPreferences';
import { User, Mail, Phone, Calendar, MapPin, Edit, Camera, Gift, Trophy, Star, Zap, Clock } from "lucide-react";

interface PhorestData {
  client: {
    fullName: string;
    email: string;
    phone: string;
    homeClinic: string;
  };
  appointments: Array<{
    date: string;
    time: string;
    service: string;
    staff: string;
    cost: number;
    status: string;
  }>;
  purchases: Array<{
    date: string;
    amount: number;
    source: string;
  }>;
  loyaltyStatus: {
    tier: string;
    points: number;
    benefits: string[];
    nextTierProgress: {
      nextTier: string;
      pointsNeeded: number;
      percentage: number;
    };
  };
  summary: {
    totalAppointments: number;
    totalPurchases: number;
    totalSpent: number;
    loyaltyTier: string;
    loyaltyPoints: number;
    memberSince: string;
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [phorestData, setPhorestData] = useState<PhorestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (user?.email) {
      syncPhorestData();
    }
  }, [user?.email]);

  const syncPhorestData = async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    setSyncStatus('syncing');
    
    try {
      const response = await fetch(`/api/user/sync?email=${encodeURIComponent(user.email)}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setPhorestData(result.data);
        setSyncStatus('success');
        
        // Debug: Log client data to help troubleshoot
        console.log('🔍 Profile Debug - Client data received:', result.data.client);
        console.log('📱 Phone fields:', {
          phone: result.data.client.phone,
          mobile: result.data.client.mobile,
          telephone: result.data.client.telephone
        });
        console.log('📅 Date fields:', {
          dateOfBirth: result.data.client.dateOfBirth,
          dob: result.data.client.dob,
          birthDate: result.data.client.birthDate
        });
      } else {
        setSyncStatus('error');
        console.log('No Phorest data found for user');
      }
    } catch (error) {
      console.error('Failed to sync Phorest data:', error);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'VIP Goddess': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'Skincare Guru': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Beauty Enthusiast': return 'bg-pink-100 text-pink-600 border-pink-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'VIP Goddess': return <Trophy className="h-4 w-4" />;
      case 'Skincare Guru': return <Star className="h-4 w-4" />;
      case 'Beauty Enthusiast': return <Zap className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getDisplayName = () => {
    if (phorestData?.client.fullName) return phorestData.client.fullName;
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    return user?.email?.split('@')[0] || 'User';
  };

  const getTierName = () => {
    if (phorestData?.loyaltyStatus.tier) return phorestData.loyaltyStatus.tier;
    return user?.loyaltyTier || 'Glow Starter';
  };

  const getFirstName = () => {
    if (phorestData?.client.fullName) return phorestData.client.fullName.split(' ')[0];
    return user?.firstName || 'User';
  };

  const getLastName = () => {
    if (phorestData?.client.fullName) {
      const parts = phorestData.client.fullName.split(' ');
      return parts.length > 1 ? parts.slice(1).join(' ') : '';
    }
    return user?.lastName || '';
  };

  const getPhone = () => {
    // Check multiple possible field names for phone number
    const phoneFields = [
      phorestData?.client.phone,
      phorestData?.client.mobile,
      phorestData?.client.telephone,
      phorestData?.client.phoneNumber,
      phorestData?.client.mobilePhone
    ];
    
    for (const phoneField of phoneFields) {
      if (phoneField && phoneField !== '' && phoneField !== null && phoneField !== 'Not provided') {
        return phoneField;
      }
    }
    
    return 'Not provided';
  };

  const getEmail = () => {
    return phorestData?.client.email || user?.email || '';
  };

  const getLocation = () => {
    return phorestData?.client.homeClinic || phorestData?.client.address || 'Not set';
  };

  const getTotalOrders = () => {
    return phorestData?.summary.totalPurchases || user?.totalSpent ? Math.floor((user?.totalSpent || 0) / 50) : 0;
  };

  const getClinicVisits = () => {
    return phorestData?.summary.totalAppointments || 0;
  };

  const getPointsBalance = () => {
    return phorestData?.loyaltyStatus.points || user?.totalPoints || 0;
  };

  const getCurrentStreak = () => {
    return user?.currentStreak || 0;
  };

  const getDateOfBirth = () => {
    // Check multiple possible field names for date of birth
    const dobFields = [
      phorestData?.client.dateOfBirth,
      phorestData?.client.dob,
      phorestData?.client.birthDate,
      phorestData?.client.birth_date
    ];
    
    for (const dobField of dobFields) {
      if (dobField && dobField !== '' && dobField !== null) {
        try {
          const date = new Date(dobField);
          // Check if it's a valid date and not today's date (which might indicate missing data)
          if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < new Date().getFullYear()) {
            return date.toISOString().split('T')[0];
          }
        } catch (error) {
          console.warn('Error parsing date field:', dobField, error);
        }
      }
    }
    
    return ''; // Return empty string if no valid date found
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
          
          {user?.email && (
            <button 
              onClick={syncPhorestData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              <Clock className="h-4 w-4" />
              {isLoading ? 'Syncing...' : 'Sync Phorest'}
            </button>
          )}
        </div>

        {/* Sync Status */}
        {syncStatus === 'syncing' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-800">Syncing your data from Phorest...</span>
            </div>
          </div>
        )}

        {syncStatus === 'error' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <span className="text-amber-800">No Phorest account found. Using app data only.</span>
            </div>
          </div>
        )}

        {syncStatus === 'success' && phorestData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-green-800">Successfully synced with your Phorest account!</span>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {getDisplayName().charAt(0).toUpperCase()}
                </span>
              </div>
              <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg border">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{getDisplayName()}</h2>
              <p className="text-gray-600">{getEmail()}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getTierColor(getTierName())}`}>
                  {getTierIcon(getTierName())}
                  {getTierName()}
                </span>
                <span className="text-sm text-gray-600">
                  Member since {phorestData?.summary.memberSince || 'Jan 2024'}
                </span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={getFirstName()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={getLastName()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={getEmail()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={getPhone()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={getDateOfBirth()}
                    placeholder="dd/mm/yyyy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={getLocation()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <NotificationPreferences />
            </div>

            {/* Skin Profile */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Skin Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skin Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                    <option>Select your skin type</option>
                    <option>Normal</option>
                    <option>Dry</option>
                    <option>Oily</option>
                    <option>Combination</option>
                    <option>Sensitive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skin Concerns
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Acne', 'Dark spots', 'Fine lines', 'Dryness', 'Sensitivity', 'Pores'].map((concern) => (
                      <label key={concern} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{concern}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergies
                  </label>
                  <textarea
                    placeholder="List any known allergies or sensitivities..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-bold">{getTotalOrders()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Clinic Visits</span>
                  <span className="font-bold">{getClinicVisits()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Points Balance</span>
                  <span className="font-bold text-pink-600">{getPointsBalance().toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-bold text-green-600">{getCurrentStreak()} days</span>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm">Email notifications</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">SMS reminders</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Marketing emails</span>
                  <input type="checkbox" className="rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Newsletter</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
              </div>
            </div>

            {/* Referral */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
              <div className="text-center">
                <Gift className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-2">Refer Friends</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Give $10, get $10 when they make their first purchase
                </p>
                <button className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors">
                  Share Referral Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}