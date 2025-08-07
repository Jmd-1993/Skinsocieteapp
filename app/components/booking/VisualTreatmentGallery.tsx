'use client';

import { useState } from 'react';
import { 
  Clock, 
  DollarSign, 
  Star, 
  ArrowRight, 
  Heart, 
  Zap, 
  Sparkles, 
  Shield, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Play,
  Info
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  benefits?: string[];
  suitableFor?: string[];
  expectedResults?: string;
  downtime?: string;
  treatmentSteps?: string[];
}

interface TreatmentImage {
  id: string;
  serviceId: string;
  beforeImage: string;
  afterImage: string;
  timeframe: string;
  patientAge?: string;
  treatmentSessions?: number;
}

interface VisualTreatmentGalleryProps {
  services: Service[];
  onServiceSelect: (service: Service) => void;
  loading?: boolean;
}

// Enhanced service data with visual elements
const enhanceServiceData = (services: Service[]): Service[] => {
  return services.map(service => {
    const enhanced = { ...service };

    // Add benefits based on service type
    if (service.name.toLowerCase().includes('filler')) {
      enhanced.benefits = ['Instant volume', 'Natural enhancement', 'Minimal downtime', 'Long-lasting results'];
      enhanced.suitableFor = ['Volume loss', 'Fine lines', 'Facial contouring'];
      enhanced.expectedResults = 'Visible improvement immediately, optimal results in 2-3 weeks';
      enhanced.downtime = '24-48 hours minimal swelling';
      enhanced.treatmentSteps = ['Consultation & planning', 'Topical numbing', 'Precision injection', 'Post-care instructions'];
    } else if (service.name.toLowerCase().includes('bio remodelling')) {
      enhanced.benefits = ['Skin hydration', 'Improved elasticity', 'Natural glow', 'Collagen stimulation'];
      enhanced.suitableFor = ['Skin quality', 'Hydration', 'Early aging signs'];
      enhanced.expectedResults = 'Progressive improvement over 4-6 weeks, optimal after 2 sessions';
      enhanced.downtime = 'None to minimal';
      enhanced.treatmentSteps = ['Skin assessment', 'Precise injections', 'Post-treatment monitoring', 'Follow-up session'];
    } else if (service.name.toLowerCase().includes('laser') || service.name.toLowerCase().includes('carbon')) {
      enhanced.benefits = ['Refined pores', 'Brighter complexion', 'Reduced blackheads', 'Smoother texture'];
      enhanced.suitableFor = ['Large pores', 'Dull skin', 'Acne scarring', 'Uneven texture'];
      enhanced.expectedResults = 'Immediate glow, continued improvement over 1-2 weeks';
      enhanced.downtime = 'None';
      enhanced.treatmentSteps = ['Deep cleanse', 'Carbon mask application', 'Laser treatment', 'Soothing serum'];
    } else if (service.name.toLowerCase().includes('facial')) {
      enhanced.benefits = ['Deep hydration', 'Clearer complexion', 'Relaxation', 'Immediate glow'];
      enhanced.suitableFor = ['All skin types', 'Maintenance', 'Special events', 'Sensitive skin'];
      enhanced.expectedResults = 'Immediate radiance, lasting hydration for 1-2 weeks';
      enhanced.downtime = 'None';
      enhanced.treatmentSteps = ['Consultation', 'Double cleanse', 'Custom treatment', 'Moisturize & protect'];
    } else if (service.name.toLowerCase().includes('peel')) {
      enhanced.benefits = ['Exfoliation', 'Improved texture', 'Reduced pigmentation', 'Cellular renewal'];
      enhanced.suitableFor = ['Sun damage', 'Fine lines', 'Acne scars', 'Uneven tone'];
      enhanced.expectedResults = 'Progressive improvement over 7-14 days';
      enhanced.downtime = '3-7 days mild peeling';
      enhanced.treatmentSteps = ['Skin prep', 'Peel application', 'Neutralization', 'Post-care protocol'];
    } else {
      enhanced.benefits = ['Skin improvement', 'Professional results', 'Personalized care', 'Visible enhancement'];
      enhanced.suitableFor = ['Various skin concerns', 'Professional treatment'];
      enhanced.expectedResults = 'Varies by individual, visible improvements expected';
      enhanced.downtime = 'Minimal to none';
      enhanced.treatmentSteps = ['Consultation', 'Treatment', 'Aftercare', 'Follow-up'];
    }

    return enhanced;
  });
};

// Mock before/after images data
const mockTreatmentImages: TreatmentImage[] = [
  {
    id: '1',
    serviceId: 'dermal-filler',
    beforeImage: '/images/treatments/before-filler.jpg',
    afterImage: '/images/treatments/after-filler.jpg',
    timeframe: '2 weeks post-treatment',
    patientAge: '35',
    treatmentSessions: 1
  },
  // Add more mock images as needed
];

export function VisualTreatmentGallery({ services, onServiceSelect, loading = false }: VisualTreatmentGalleryProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const enhancedServices = enhanceServiceData(services);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'injectable': return Zap;
      case 'laser': return Sparkles;
      case 'facial': return Heart;
      case 'advanced': return Star;
      case 'treatment': return Shield;
      default: return Eye;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'injectable': return 'from-blue-500 to-indigo-600';
      case 'laser': return 'from-purple-500 to-pink-600';
      case 'facial': return 'from-green-500 to-teal-600';
      case 'advanced': return 'from-orange-500 to-red-600';
      case 'treatment': return 'from-cyan-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const renderTreatmentCard = (service: Service) => {
    const Icon = getCategoryIcon(service.category);
    const gradient = getCategoryColor(service.category);

    return (
      <div
        key={service.id}
        className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow">
          {/* Treatment Hero Image */}
          <div className="relative h-56 overflow-hidden">
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
            
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            
            {/* Content Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            
            {/* Treatment Icon */}
            <div className="absolute top-4 left-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Category Badge */}
            <div className="absolute top-4 right-4">
              <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                {service.category}
              </span>
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-lg font-bold text-gray-900">${service.price}</div>
                <div className="text-xs text-gray-600">from</div>
              </div>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-4 left-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">{service.duration}min</span>
              </div>
            </div>

            {/* Play Button for Virtual Tour */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
            </div>
          </div>

          {/* Treatment Info */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {service.name}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                {service.description}
              </p>
            </div>

            {/* Key Benefits */}
            {service.benefits && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {service.benefits.slice(0, 3).map((benefit, index) => (
                    <span
                      key={index}
                      className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {benefit}
                    </span>
                  ))}
                  {service.benefits.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{service.benefits.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Treatment Stats */}
            <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>4.9 rating</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Most popular</div>
              </div>
            </div>

            {/* Expected Results */}
            {service.expectedResults && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-green-800 mb-1">Expected Results</div>
                    <div className="text-xs text-green-700">{service.expectedResults}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedService(service);
                  setShowDetailModal(true);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button
                onClick={() => onServiceSelect(service)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white
                          py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600
                          transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Book Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailModal = () => {
    if (!selectedService || !showDetailModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedService.name}</h2>
                <p className="text-gray-600">{selectedService.description}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Treatment Gallery */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Before & After Results</h3>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                      <span className="text-gray-500">Before</span>
                    </div>
                    <p className="text-sm text-gray-600">Day 1</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-purple-500" />
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-2 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-sm text-gray-600">2 weeks later</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 italic">
                  * Results may vary. Individual results will be discussed during consultation.
                </p>
              </div>
            </div>

            {/* Treatment Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* What to Expect */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  What to Expect
                </h4>
                <div className="space-y-2 text-sm text-blue-800">
                  {selectedService.treatmentSteps?.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Treatment Info */}
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 mb-2">Duration & Price</h5>
                  <div className="text-sm text-green-800 space-y-1">
                    <div>Treatment time: {selectedService.duration} minutes</div>
                    <div>Investment: ${selectedService.price}</div>
                    <div>Downtime: {selectedService.downtime || 'None'}</div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h5 className="font-medium text-purple-900 mb-2">Best For</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedService.suitableFor?.map((item, index) => (
                      <span key={index} className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 mb-4">Key Benefits</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedService.benefits?.map((benefit, index) => (
                  <div key={index} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg text-center">
                    <div className="text-sm font-medium">{benefit}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  onServiceSelect(selectedService);
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
              >
                Book {selectedService.name}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-gray-200 rounded-2xl h-80"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enhancedServices.map(renderTreatmentCard)}
      </div>
      {renderDetailModal()}
    </>
  );
}