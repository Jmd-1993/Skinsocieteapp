'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Heart, 
  Star, 
  ChevronRight, 
  Clock, 
  DollarSign,
  ArrowRight,
  Search
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  benefits?: string[];
  beforeAfter?: {
    before: string;
    after: string;
  };
}

interface SkinConcern {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
  gradient: string;
  services: string[];
  popularTreatments: string[];
}

interface ConditionBasedSelectorProps {
  services: Service[];
  onServiceSelect: (service: Service) => void;
  loading?: boolean;
}

const skinConcerns: SkinConcern[] = [
  {
    id: 'acne-breakouts',
    name: 'Acne & Breakouts',
    icon: Shield,
    description: 'Clear problematic skin and prevent future breakouts',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    services: ['chemical-peel', 'led-therapy', 'hydrating-facial'],
    popularTreatments: ['Chemical Peel', 'LED Light Therapy', 'Clarifying Facial']
  },
  {
    id: 'aging-wrinkles',
    name: 'Aging & Wrinkles',
    icon: Star,
    description: 'Turn back time with advanced anti-aging treatments',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    services: ['microneedling', 'dermal-filler', 'bio-remodelling'],
    popularTreatments: ['Microneedling', 'Anti-Wrinkle Injections', 'Bio Remodelling']
  },
  {
    id: 'dullness-texture',
    name: 'Dullness & Texture',
    icon: Sparkles,
    description: 'Reveal brighter, smoother, more radiant skin',
    color: 'yellow',
    gradient: 'from-yellow-500 to-orange-500',
    services: ['dermaplaning', 'carbon-laser', 'chemical-peel'],
    popularTreatments: ['Dermaplaning', 'Carbon Laser Facial', 'Resurfacing Peel']
  },
  {
    id: 'pigmentation',
    name: 'Pigmentation & Dark Spots',
    icon: Zap,
    description: 'Even skin tone and reduce unwanted pigmentation',
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-600',
    services: ['carbon-laser', 'chemical-peel', 'led-therapy'],
    popularTreatments: ['IPL Treatment', 'Brightening Peel', 'Pigment Correction']
  },
  {
    id: 'hydration',
    name: 'Dehydration & Sensitivity',
    icon: Heart,
    description: 'Restore moisture barrier and soothe reactive skin',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-600',
    services: ['hydrating-facial', 'led-therapy', 'bio-remodelling'],
    popularTreatments: ['Hydrating Facial', 'Skin Barrier Repair', 'Gentle LED Therapy']
  }
];

export function ConditionBasedSelector({ services, onServiceSelect, loading = false }: ConditionBasedSelectorProps) {
  const [selectedConcern, setSelectedConcern] = useState<SkinConcern | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllServices, setShowAllServices] = useState(false);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  useEffect(() => {
    if (selectedConcern) {
      // Filter services based on selected concern
      const concernServices = services.filter(service => {
        const serviceName = service.name.toLowerCase();
        const concernTreatments = selectedConcern.popularTreatments.map(t => t.toLowerCase());
        
        return concernTreatments.some(treatment => 
          serviceName.includes(treatment) || 
          treatment.includes(serviceName.split(' ')[0]) ||
          service.category.toLowerCase() === selectedConcern.id.split('-')[0]
        );
      });
      
      setFilteredServices(concernServices);
    } else if (searchQuery) {
      // Filter by search query
      const searched = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(searched);
    } else if (showAllServices) {
      setFilteredServices(services);
    } else {
      setFilteredServices([]);
    }
  }, [selectedConcern, searchQuery, showAllServices, services]);

  const handleConcernSelect = (concern: SkinConcern) => {
    setSelectedConcern(concern);
    setSearchQuery('');
    setShowAllServices(false);
  };

  const handleBackToConcerns = () => {
    setSelectedConcern(null);
    setSearchQuery('');
    setShowAllServices(false);
  };

  const renderServiceCard = (service: Service) => (
    <div
      key={service.id}
      onClick={() => onServiceSelect(service)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden
                 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
                 cursor-pointer group"
    >
      {/* Service Image Placeholder */}
      <div className="h-40 bg-gradient-to-br from-purple-100 via-pink-100 to-purple-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
            {service.category}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
        </div>
        {/* Floating treatment icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
            {service.name}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
            {service.description}
          </p>
        </div>

        {/* Treatment Benefits */}
        {service.benefits && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Benefits</h4>
            <div className="flex flex-wrap gap-1">
              {service.benefits.slice(0, 2).map((benefit, index) => (
                <span
                  key={index}
                  className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {service.duration}min
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span className="font-bold text-gray-900">${service.price}</span>
            </span>
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white
                          font-semibold py-3 rounded-lg transform transition-all duration-300
                          hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2
                          group-hover:from-purple-600 group-hover:to-pink-600">
          Book Treatment
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          What's your skin concern?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tell us what you'd like to improve and we'll recommend the perfect treatments for you
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search treatments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {!selectedConcern && !searchQuery && !showAllServices ? (
        // Skin Concerns Selection
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skinConcerns.map((concern) => {
              const Icon = concern.icon;
              return (
                <div
                  key={concern.id}
                  onClick={() => handleConcernSelect(concern)}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${concern.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {concern.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {concern.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Popular Treatments</h4>
                      {concern.popularTreatments.slice(0, 2).map((treatment, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                          {treatment}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-600">
                        View treatments
                      </span>
                      <ChevronRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Browse All Services */}
          <div className="text-center">
            <button
              onClick={() => setShowAllServices(true)}
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Browse all treatments
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        // Services Display
        <div className="space-y-6">
          {selectedConcern && (
            <div className="flex items-center justify-between mb-6">
              <div>
                <button
                  onClick={handleBackToConcerns}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-2"
                >
                  ← Back to concerns
                </button>
                <h3 className="text-2xl font-bold text-gray-900">
                  Treatments for {selectedConcern.name}
                </h3>
                <p className="text-gray-600">{selectedConcern.description}</p>
              </div>
            </div>
          )}

          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No treatments found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `No treatments match "${searchQuery}". Try a different search term.`
                  : 'No treatments available for this concern at the moment.'
                }
              </p>
              <button
                onClick={handleBackToConcerns}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Browse by skin concern
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(renderServiceCard)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}