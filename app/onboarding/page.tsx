'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '../components/layout/MainLayout';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Heart,
  Shield,
  CheckCircle,
  ArrowRight,
  Building,
  AlertCircle
} from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  homeClinicId: string;
  skinType: string;
  skinConcerns: string[];
  allergies: string;
  marketingConsent: boolean;
  smsConsent: boolean;
}

const clinics = [
  { id: 'wQbnBjP6ztI8nuVpNT6MsQ', name: 'Skin Societé Cottesloe', address: 'Cottesloe, WA' },
  { id: 'other-1', name: 'Skin Societé Perth CBD', address: 'Perth, WA' },
  { id: 'other-2', name: 'Skin Societé Subiaco', address: 'Subiaco, WA' },
  { id: 'other-3', name: 'Skin Societé Fremantle', address: 'Fremantle, WA' },
  { id: 'other-4', name: 'Skin Societé Joondalup', address: 'Joondalup, WA' }
];

const skinTypes = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];
const concernOptions = ['Acne', 'Dark spots', 'Fine lines', 'Wrinkles', 'Dryness', 'Sensitivity', 'Large pores', 'Uneven texture'];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    homeClinicId: '',
    skinType: '',
    skinConcerns: [],
    allergies: '',
    marketingConsent: true,
    smsConsent: true
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleConcern = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      skinConcerns: prev.skinConcerns.includes(concern)
        ? prev.skinConcerns.filter(c => c !== concern)
        : [...prev.skinConcerns, concern]
    }));
  };

  const nextStep = () => {
    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/user/create-phorest-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Redirect to profile or dashboard after success
        setTimeout(() => {
          router.push('/profile/enhanced?welcome=true');
        }, 2000);
      } else {
        setError(result.message || 'Failed to create account');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Skin Societé!</h1>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. You're now part of Australia's premier beauty community.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">🎉 You've started as a Glow Starter!</p>
              <p className="text-green-700 text-sm">Enjoy 5% off treatments and exclusive birthday offers</p>
            </div>
            <p className="text-sm text-gray-500">Redirecting to your profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Skin Societé</h1>
              <p className="text-gray-600">Let's create your beauty profile</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="0400 000 000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={nextStep}
                disabled={!formData.firstName || !formData.lastName || !formData.email}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Home Clinic */}
        {currentStep === 2 && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Home Clinic</h1>
              <p className="text-gray-600">Select your preferred Skin Societé location</p>
            </div>

            <div className="space-y-3">
              {clinics.map((clinic) => (
                <label key={clinic.id} className="block">
                  <input
                    type="radio"
                    name="homeClinic"
                    value={clinic.id}
                    checked={formData.homeClinicId === clinic.id}
                    onChange={(e) => updateFormData('homeClinicId', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.homeClinicId === clinic.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-5 h-5 ${
                        formData.homeClinicId === clinic.id ? 'text-pink-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900">{clinic.name}</div>
                        <div className="text-sm text-gray-600">{clinic.address}</div>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Skin Profile */}
        {currentStep === 3 && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Skin Profile</h1>
              <p className="text-gray-600">Help us personalize your experience</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What's your skin type?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {skinTypes.map((type) => (
                    <label key={type} className="block">
                      <input
                        type="radio"
                        name="skinType"
                        value={type}
                        checked={formData.skinType === type}
                        onChange={(e) => updateFormData('skinType', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-3 text-center border-2 rounded-lg cursor-pointer transition-all ${
                        formData.skinType === type
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <span className="font-medium">{type}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What are your main skin concerns? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {concernOptions.map((concern) => (
                    <label key={concern} className="block">
                      <input
                        type="checkbox"
                        checked={formData.skinConcerns.includes(concern)}
                        onChange={() => toggleConcern(concern)}
                        className="sr-only"
                      />
                      <div className={`p-3 text-center border-2 rounded-lg cursor-pointer transition-all ${
                        formData.skinConcerns.includes(concern)
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <span className="text-sm font-medium">{concern}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Any allergies or sensitivities?
                </label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => updateFormData('allergies', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows={3}
                  placeholder="List any known allergies or product sensitivities..."
                />
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Preferences & Consent */}
        {currentStep === 4 && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Almost Done!</h1>
              <p className="text-gray-600">Set your communication preferences</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Communication Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">Email Marketing</span>
                      <p className="text-sm text-gray-600">Receive exclusive offers, beauty tips, and updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.marketingConsent}
                      onChange={(e) => updateFormData('marketingConsent', e.target.checked)}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">SMS Notifications</span>
                      <p className="text-sm text-gray-600">Appointment reminders and important updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.smsConsent}
                      onChange={(e) => updateFormData('smsConsent', e.target.checked)}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-pink-800 font-medium">Your Glow Starter Benefits</p>
                    <ul className="text-sm text-pink-700 mt-1 space-y-1">
                      <li>• 5% discount on all treatments</li>
                      <li>• Exclusive birthday month offers</li>
                      <li>• First treatment welcome discount</li>
                      <li>• Earn points with every visit</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}