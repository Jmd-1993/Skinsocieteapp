'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from "../../components/layout/MainLayout";
import { User, Mail, Phone, Calendar, MapPin, Edit, Camera, Gift, Trophy, Star, Clock, ShoppingBag, Zap } from "lucide-react";

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

export default function EnhancedProfilePage() {
  const [phorestData, setPhorestData] = useState<PhorestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  
  // Demo user email for testing - in real app this would come from auth
  const userEmail = 'josh@skinsociete.com.au';

  useEffect(() => {
    syncPhorestData();
  }, []);

  const syncPhorestData = async () => {
    setIsLoading(true);
    setSyncStatus('syncing');
    
    try {
      const response = await fetch(`/api/user/sync?email=${encodeURIComponent(userEmail)}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setPhorestData(result.data);
        setSyncStatus('success');
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enhanced Profile</h1>
            <p className="text-gray-600">Your complete Skin Societé profile with Phorest integration</p>
          </div>
          <button 
            onClick={syncPhorestData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            <Clock className="h-4 w-4" />
            {isLoading ? 'Syncing...' : 'Sync Data'}
          </button>
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <span className="text-red-800">No Phorest account found. You may be a new customer or need to update your email.</span>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {phorestData?.client.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg border">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {phorestData?.client.fullName || 'User Profile'}
              </h2>
              <p className="text-gray-600">{phorestData?.client.email || userEmail}</p>
              <div className="flex items-center gap-4 mt-2">
                {phorestData && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getTierColor(phorestData.loyaltyStatus.tier)}`}>
                    {getTierIcon(phorestData.loyaltyStatus.tier)}
                    {phorestData.loyaltyStatus.tier}
                  </span>
                )}
                <span className="text-sm text-gray-600">
                  Member since {phorestData?.summary.memberSince || '2024'}
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Phorest Integration Status */}
            {phorestData && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">Phorest Account Connected</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">{phorestData.summary.totalAppointments}</div>
                    <div className="text-sm text-green-600">Total Appointments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">{phorestData.summary.totalPurchases}</div>
                    <div className="text-sm text-green-600">Total Purchases</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">${phorestData.summary.totalSpent}</div>
                    <div className="text-sm text-green-600">Total Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">{phorestData.summary.loyaltyPoints}</div>
                    <div className="text-sm text-green-600">Loyalty Points</div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Appointments */}
            {phorestData && phorestData.appointments.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Recent Appointments</h3>
                <div className="space-y-3">
                  {phorestData.appointments.slice(0, 5).map((appointment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{appointment.service}</div>
                        <div className="text-sm text-gray-600">
                          {appointment.date} at {appointment.time} with {appointment.staff}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${appointment.cost}</div>
                        <div className="text-sm text-gray-600">{appointment.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase History */}
            {phorestData && phorestData.purchases.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Recent Purchases</h3>
                <div className="space-y-3">
                  {phorestData.purchases.slice(0, 5).map((purchase, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Purchase #{index + 1}</div>
                        <div className="text-sm text-gray-600">
                          {purchase.date} • {purchase.source}
                        </div>
                      </div>
                      <div className="font-bold">${purchase.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={phorestData?.client.email || userEmail}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phorestData?.client.phone || 'Not provided'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Home Clinic</label>
                  <input
                    type="text"
                    value={phorestData?.client.homeClinic || 'Not set'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Loyalty Status */}
            {phorestData && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Loyalty Status</h3>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-pink-600">{phorestData.loyaltyStatus.points}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                
                {phorestData.loyaltyStatus.nextTierProgress.nextTier !== 'MAX_TIER' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress to {phorestData.loyaltyStatus.nextTierProgress.nextTier}</span>
                      <span>{phorestData.loyaltyStatus.nextTierProgress.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-pink-600 h-2 rounded-full" 
                        style={{ width: `${phorestData.loyaltyStatus.nextTierProgress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {phorestData.loyaltyStatus.nextTierProgress.pointsNeeded} points needed
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Your Benefits:</h4>
                  {phorestData.loyaltyStatus.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">•</span>
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Calendar className="h-5 w-5 text-pink-600" />
                  <span>Book Appointment</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <ShoppingBag className="h-5 w-5 text-pink-600" />
                  <span>View Orders</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Trophy className="h-5 w-5 text-pink-600" />
                  <span>View Rewards</span>
                </button>
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