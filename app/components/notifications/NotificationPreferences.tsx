"use client";

import { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  Clock, 
  Trophy, 
  Heart, 
  Lightbulb, 
  Calendar,
  ShoppingBag,
  Settings
} from 'lucide-react';

interface NotificationPreferences {
  routineReminders: boolean;
  gamification: boolean;
  behavioralTriggers: boolean;
  personalizedContent: boolean;
  appointments: boolean;
  promotional: boolean;
  morningTime: string;
  eveningTime: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone: string;
  maxPerDay: number;
  maxPerWeek: number;
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    routineReminders: true,
    gamification: true,
    behavioralTriggers: true,
    personalizedContent: true,
    appointments: true,
    promotional: true,
    morningTime: "07:30",
    eveningTime: "21:00",
    timezone: "UTC",
    maxPerDay: 3,
    maxPerWeek: 15
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      const data = await response.json();
      
      if (data.success) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      
      const data = await response.json();
      if (data.success) {
        // Show success message
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        <button
          onClick={savePreferences}
          disabled={saving}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Notification Categories */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Types
        </h4>

        <div className="space-y-3">
          {/* Routine Reminders */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-pink-600" />
              <div>
                <p className="font-medium text-gray-900">Routine Reminders</p>
                <p className="text-sm text-gray-600">Morning and evening skincare reminders</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.routineReminders}
                onChange={(e) => updatePreference('routineReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          {/* Gamification */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-gray-900">Gamification</p>
                <p className="text-sm text-gray-600">Challenges, streaks, and achievements</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.gamification}
                onChange={(e) => updatePreference('gamification', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          {/* Behavioral Triggers */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-gray-900">Smart Reminders</p>
                <p className="text-sm text-gray-600">Re-engagement and booking reminders</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.behavioralTriggers}
                onChange={(e) => updatePreference('behavioralTriggers', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          {/* Personalized Content */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Personalized Tips</p>
                <p className="text-sm text-gray-600">Skincare tips and weather advice</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.personalizedContent}
                onChange={(e) => updatePreference('personalizedContent', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          {/* Appointments */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Appointments</p>
                <p className="text-sm text-gray-600">Booking reminders and aftercare</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.appointments}
                onChange={(e) => updatePreference('appointments', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          {/* Promotional */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Promotional</p>
                <p className="text-sm text-gray-600">Sales, new products, and special offers</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.promotional}
                onChange={(e) => updatePreference('promotional', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Timing Preferences */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Timing Preferences
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Morning Routine Time
            </label>
            <input
              type="time"
              value={preferences.morningTime}
              onChange={(e) => updatePreference('morningTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evening Routine Time
            </label>
            <input
              type="time"
              value={preferences.eveningTime}
              onChange={(e) => updatePreference('eveningTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiet Hours Start
            </label>
            <input
              type="time"
              value={preferences.quietHoursStart || ''}
              onChange={(e) => updatePreference('quietHoursStart', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiet Hours End
            </label>
            <input
              type="time"
              value={preferences.quietHoursEnd || ''}
              onChange={(e) => updatePreference('quietHoursEnd', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Frequency Limits */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Frequency Limits</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum per Day
            </label>
            <select
              value={preferences.maxPerDay}
              onChange={(e) => updatePreference('maxPerDay', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value={1}>1 notification</option>
              <option value={2}>2 notifications</option>
              <option value={3}>3 notifications</option>
              <option value={5}>5 notifications</option>
              <option value={10}>10 notifications</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum per Week
            </label>
            <select
              value={preferences.maxPerWeek}
              onChange={(e) => updatePreference('maxPerWeek', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value={5}>5 notifications</option>
              <option value={10}>10 notifications</option>
              <option value={15}>15 notifications</option>
              <option value={20}>20 notifications</option>
              <option value={50}>50 notifications</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900">Smart Notifications</h5>
            <p className="text-sm text-blue-700 mt-1">
              Our intelligent system learns your preferences and sends notifications at optimal times 
              to help you maintain your skincare routine and achieve your goals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}