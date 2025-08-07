'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Heart, 
  Shield, 
  Zap, 
  Star,
  ChevronRight,
  ChevronLeft,
  Save,
  FileText,
  Camera,
  Upload,
  X,
  Info,
  Lock
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
}

interface ClientData {
  clientId?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  dateOfBirth?: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  medicalHistory?: {
    allergies?: string[];
    medications?: string[];
    skinConditions?: string[];
    previousTreatments?: string[];
    contraindications?: string[];
  };
  skinAnalysis?: {
    skinType?: string;
    concerns?: string[];
    goals?: string[];
    lifestyle?: {
      sunExposure?: string;
      skincare?: string;
      diet?: string;
    };
  };
  preferences?: {
    communication?: string;
    newsletter?: boolean;
    marketing?: boolean;
  };
  consent?: {
    treatment?: boolean;
    photography?: boolean;
    dataProcessing?: boolean;
    terms?: boolean;
  };
}

interface ProgressiveIntakeFormProps {
  service: Service;
  existingClientData?: ClientData;
  onComplete: (clientData: ClientData) => void;
  onCancel: () => void;
}

type FormStep = 'personal' | 'contact' | 'medical' | 'skin-analysis' | 'preferences' | 'consent' | 'review';

const SKIN_TYPES = [
  { value: 'normal', label: 'Normal', description: 'Balanced, not too dry or oily' },
  { value: 'dry', label: 'Dry', description: 'Tight, flaky, or rough feeling' },
  { value: 'oily', label: 'Oily', description: 'Shiny, enlarged pores, acne-prone' },
  { value: 'combination', label: 'Combination', description: 'Oily T-zone, dry cheeks' },
  { value: 'sensitive', label: 'Sensitive', description: 'Easily irritated, reactive' }
];

const SKIN_CONCERNS = [
  'Acne & breakouts', 'Fine lines & wrinkles', 'Dark spots & pigmentation',
  'Dullness & uneven texture', 'Large pores', 'Dehydration',
  'Redness & sensitivity', 'Loss of firmness', 'Under-eye concerns'
];

const COMMON_ALLERGIES = [
  'Latex', 'Lidocaine', 'Topical anesthetics', 'Iodine', 'Adhesives',
  'Fragrances', 'Preservatives', 'Sunscreens', 'Retinoids', 'Alpha hydroxy acids'
];

export function ProgressiveIntakeForm({ service, existingClientData, onComplete, onCancel }: ProgressiveIntakeFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('personal');
  const [clientData, setClientData] = useState<ClientData>(existingClientData || {
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    medicalHistory: {},
    skinAnalysis: {},
    preferences: {
      communication: 'email',
      newsletter: false,
      marketing: false
    },
    consent: {}
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [skipOptional, setSkipOptional] = useState(false);

  // Auto-save progress to localStorage
  useEffect(() => {
    const saveProgress = () => {
      localStorage.setItem('phorest-intake-progress', JSON.stringify({
        step: currentStep,
        data: clientData,
        serviceId: service.id,
        timestamp: Date.now()
      }));
    };
    
    const debounceTimer = setTimeout(saveProgress, 1000);
    return () => clearTimeout(debounceTimer);
  }, [currentStep, clientData, service.id]);

  // Load saved progress
  useEffect(() => {
    const savedProgress = localStorage.getItem('phorest-intake-progress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        // Only restore if it's recent (within 24 hours) and for the same service
        if (Date.now() - parsed.timestamp < 86400000 && parsed.serviceId === service.id) {
          setClientData(parsed.data);
          setCurrentStep(parsed.step);
        }
      } catch (error) {
        console.error('Failed to load saved progress:', error);
      }
    }
  }, [service.id]);

  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 'personal':
        if (!clientData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!clientData.lastName.trim()) newErrors.lastName = 'Last name is required';
        break;
      case 'contact':
        if (!clientData.email.trim()) newErrors.email = 'Email is required';
        if (clientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
          newErrors.email = 'Invalid email format';
        }
        if (!clientData.mobile?.trim()) newErrors.mobile = 'Phone number is required';
        break;
      case 'consent':
        if (!clientData.consent?.treatment) newErrors.treatment = 'Treatment consent is required';
        if (!clientData.consent?.terms) newErrors.terms = 'Terms acceptance is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    
    const steps: FormStep[] = ['personal', 'contact', 'medical', 'skin-analysis', 'preferences', 'consent', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    
    // Skip optional steps if requested
    if (skipOptional && (currentStep === 'medical' || currentStep === 'skin-analysis')) {
      const nextIndex = currentStep === 'medical' ? steps.indexOf('preferences') : steps.indexOf('consent');
      setCurrentStep(steps[nextIndex]);
    } else if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: FormStep[] = ['personal', 'contact', 'medical', 'skin-analysis', 'preferences', 'consent', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep('consent')) return;
    
    setSaving(true);
    
    try {
      // Create or update client in Phorest
      const response = await fetch('/api/clients', {
        method: existingClientData?.clientId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...clientData,
          serviceId: service.id,
          intakeCompleted: true
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Clear saved progress
        localStorage.removeItem('phorest-intake-progress');
        onComplete({ ...clientData, clientId: result.clientId });
      } else {
        throw new Error(result.message || 'Failed to save client information');
      }
    } catch (error: any) {
      setErrors({ submit: error.message });
    } finally {
      setSaving(false);
    }
  };

  const updateClientData = (updates: Partial<ClientData>) => {
    setClientData(prev => ({ ...prev, ...updates }));
  };

  const updateNestedData = (path: string[], value: any) => {
    setClientData(prev => {
      const updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      return updated;
    });
  };

  const renderProgress = () => {
    const steps = ['personal', 'contact', 'medical', 'skin-analysis', 'preferences', 'consent', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    const progress = ((currentIndex + 1) / steps.length) * 100;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {currentIndex + 1} of {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  const renderPersonalStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Let's start with some basic information about you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={clientData.firstName}
            onChange={(e) => updateClientData({ firstName: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={clientData.lastName}
            onChange={(e) => updateClientData({ lastName: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date of Birth (Optional)
        </label>
        <input
          type="date"
          value={clientData.dateOfBirth || ''}
          onChange={(e) => updateClientData({ dateOfBirth: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">
          Helps us provide age-appropriate treatment recommendations
        </p>
      </div>
    </div>
  );

  const renderContactStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
        <p className="text-gray-600">How can we reach you for appointment confirmations?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          value={clientData.email}
          onChange={(e) => updateClientData({ email: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="your.email@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mobile Phone *
        </label>
        <input
          type="tel"
          value={clientData.mobile || ''}
          onChange={(e) => updateClientData({ mobile: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.mobile ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="0412 345 678"
        />
        {errors.mobile && (
          <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          For appointment reminders and urgent notifications
        </p>
      </div>
    </div>
  );

  const renderMedicalStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Medical History</h2>
        <p className="text-gray-600">Help us ensure your safety during treatment</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-900 mb-1">Medical Information</h3>
            <p className="text-sm text-yellow-800">
              This information is kept strictly confidential and is used only to ensure your safety during treatment.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Do you have any allergies? (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COMMON_ALLERGIES.map(allergy => (
            <label key={allergy} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={clientData.medicalHistory?.allergies?.includes(allergy) || false}
                onChange={(e) => {
                  const allergies = clientData.medicalHistory?.allergies || [];
                  if (e.target.checked) {
                    updateNestedData(['medicalHistory', 'allergies'], [...allergies, allergy]);
                  } else {
                    updateNestedData(['medicalHistory', 'allergies'], allergies.filter(a => a !== allergy));
                  }
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{allergy}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Medications (Optional)
        </label>
        <textarea
          value={clientData.medicalHistory?.medications?.join(', ') || ''}
          onChange={(e) => updateNestedData(['medicalHistory', 'medications'], 
            e.target.value.split(',').map(m => m.trim()).filter(Boolean)
          )}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows={3}
          placeholder="List any medications you're currently taking..."
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div>
          <h3 className="font-medium text-blue-900">Skip detailed medical history?</h3>
          <p className="text-sm text-blue-700">You can complete this during your consultation</p>
        </div>
        <button
          onClick={() => setSkipOptional(true)}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Skip for now
        </button>
      </div>
    </div>
  );

  const renderSkinAnalysisStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Skin Analysis</h2>
        <p className="text-gray-600">Tell us about your skin to personalize your treatment</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          What's your skin type?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SKIN_TYPES.map(type => (
            <label key={type.value} className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-purple-300 ${
              clientData.skinAnalysis?.skinType === type.value 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="skinType"
                value={type.value}
                checked={clientData.skinAnalysis?.skinType === type.value}
                onChange={(e) => updateNestedData(['skinAnalysis', 'skinType'], e.target.value)}
                className="sr-only"
              />
              <div className="font-medium text-gray-900">{type.label}</div>
              <div className="text-sm text-gray-600">{type.description}</div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What are your main skin concerns? (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SKIN_CONCERNS.map(concern => (
            <label key={concern} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={clientData.skinAnalysis?.concerns?.includes(concern) || false}
                onChange={(e) => {
                  const concerns = clientData.skinAnalysis?.concerns || [];
                  if (e.target.checked) {
                    updateNestedData(['skinAnalysis', 'concerns'], [...concerns, concern]);
                  } else {
                    updateNestedData(['skinAnalysis', 'concerns'], concerns.filter(c => c !== concern));
                  }
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{concern}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConsentStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Consent & Agreements</h2>
        <p className="text-gray-600">Please review and accept our terms</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={clientData.consent?.treatment || false}
              onChange={(e) => updateNestedData(['consent', 'treatment'], e.target.checked)}
              className={`mt-1 rounded border-gray-300 ${errors.treatment ? 'border-red-500' : ''}`}
            />
            <div>
              <div className="font-medium text-gray-900">Treatment Consent *</div>
              <div className="text-sm text-gray-600 mt-1">
                I consent to receive {service.name} treatment and understand the associated risks and benefits.
              </div>
            </div>
          </label>
          {errors.treatment && (
            <p className="mt-2 text-sm text-red-600">{errors.treatment}</p>
          )}
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={clientData.consent?.photography || false}
              onChange={(e) => updateNestedData(['consent', 'photography'], e.target.checked)}
              className="mt-1 rounded border-gray-300"
            />
            <div>
              <div className="font-medium text-gray-900">Photography Consent (Optional)</div>
              <div className="text-sm text-gray-600 mt-1">
                I consent to before/after photos being taken for treatment documentation and potential marketing use.
              </div>
            </div>
          </label>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={clientData.consent?.terms || false}
              onChange={(e) => updateNestedData(['consent', 'terms'], e.target.checked)}
              className={`mt-1 rounded border-gray-300 ${errors.terms ? 'border-red-500' : ''}`}
            />
            <div>
              <div className="font-medium text-gray-900">Terms & Conditions *</div>
              <div className="text-sm text-gray-600 mt-1">
                I have read and agree to the{' '}
                <a href="/terms" target="_blank" className="text-purple-600 hover:underline">
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" className="text-purple-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </div>
            </div>
          </label>
          {errors.terms && (
            <p className="mt-2 text-sm text-red-600">{errors.terms}</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Data Security</h3>
            <p className="text-sm text-blue-800">
              Your information is securely stored and integrated with our Phorest clinic management system. 
              We never share your data with third parties without consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Information</h2>
        <p className="text-gray-600">Please review your information before submitting</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <div>{clientData.firstName} {clientData.lastName}</div>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <div>{clientData.email}</div>
            </div>
            {clientData.mobile && (
              <div>
                <span className="text-gray-600">Phone:</span>
                <div>{clientData.mobile}</div>
              </div>
            )}
          </div>
        </div>

        {clientData.skinAnalysis?.skinType && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Skin Analysis</h3>
            <div className="text-sm">
              <div className="mb-2">
                <span className="text-gray-600">Skin Type:</span>
                <span className="ml-2 capitalize">{clientData.skinAnalysis.skinType}</span>
              </div>
              {clientData.skinAnalysis.concerns && clientData.skinAnalysis.concerns.length > 0 && (
                <div>
                  <span className="text-gray-600">Concerns:</span>
                  <div className="ml-2">{clientData.skinAnalysis.concerns.join(', ')}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{errors.submit}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'personal': return renderPersonalStep();
      case 'contact': return renderContactStep();
      case 'medical': return renderMedicalStep();
      case 'skin-analysis': return renderSkinAnalysisStep();
      case 'consent': return renderConsentStep();
      case 'review': return renderReviewStep();
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {renderProgress()}
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {renderStepContent()}
        
        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={currentStep === 'personal' ? onCancel : prevStep}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 'personal' ? 'Cancel' : 'Back'}
          </button>
          
          {currentStep === 'review' ? (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Complete Registration
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}