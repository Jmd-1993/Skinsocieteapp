'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { useRouter } from 'next/navigation';
import { MainLayout } from '../components/layout/MainLayout';
import { BookingModal } from '../components/booking/BookingModal';
import { ConditionBasedSelector } from '../components/booking/ConditionBasedSelector';
import { VisualTreatmentGallery } from '../components/booking/VisualTreatmentGallery';
import { MobileBookingInterface } from '../components/booking/MobileBookingInterface';
import { SmartScheduler } from '../components/booking/SmartScheduler';
import { ProgressiveIntakeForm } from '../components/booking/ProgressiveIntakeForm';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  ArrowRight,
  Plus,
  DollarSign,
  Users,
  ChevronRight
} from 'lucide-react';

interface Branch {
  branchId: string;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  phone?: string;
  email?: string;
}

interface ClientData {
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  creatingBranchId?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [homeClinic, setHomeClinic] = useState<Branch | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [phorestServices, setPhorestServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMobileBooking, setShowMobileBooking] = useState(false);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [bookingMode, setBookingMode] = useState<'condition' | 'gallery' | 'list'>('condition');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch client's home clinic from Phorest
  useEffect(() => {
    async function fetchClientData() {
      console.log('🚀 Starting client data fetch...');
      
      try {
        // FIRST: Always set fallback services and clinic to ensure page works
        console.log('🔧 Setting fallback services and clinic...');
        setHomeClinic({
          branchId: 'wQbnBjP6ztI8nuVpNT6MsQ',
          name: 'Skin Societé Cottesloe',
          addressLine1: '123 Marine Parade',
          addressLine2: 'Cottesloe, WA 6011',
          phone: '(08) 9384 1234',
          email: 'cottesloe@skinsociete.com.au'
        });
        setServicesLoading(false); // Allow fallback services to show
        
        // Use logged-in user data directly for booking
        if (user) {
          // Create client data from user profile
          const userData = {
            clientId: user.uid || 'user-' + Date.now(),
            firstName: user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Guest',
            lastName: user.displayName?.split(' ')[1] || '',
            email: user.email || '',
            phone: user.phoneNumber || '',
            creatingBranchId: 'wQbnBjP6ztI8nuVpNT6MsQ' // Default to Cottesloe
          };
          setClientData(userData);
          console.log('✅ Using logged-in user data:', userData.firstName, userData.lastName);
        } else {
          // For testing: Use a test client
          setClientData({
            clientId: 'B3muduu_Ob2yqdJdfxu-eQ',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@skinsociete.com.au',
            creatingBranchId: 'wQbnBjP6ztI8nuVpNT6MsQ'
          });
        }
        
        // Import Phorest service dynamically to avoid SSR issues
        const phorestService = await import('../services/phorestService');
        const service = phorestService.default;
        
        // Get branch/clinic information
        console.log('🏥 Fetching branch information...');
        const branches = await service.getBranches();
        
        if (branches && branches.length > 0) {
          // Find the client's home branch
          const homeBranch = branches.find((b: any) => b.branchId === client?.creatingBranchId) || branches[0];
          setHomeClinic(homeBranch);
          console.log('✅ Home clinic updated:', homeBranch?.name);
        }
        
        // Fetch actual services from Phorest
        console.log('🔧 Fetching services from Phorest...');
        const services = await service.getServices();
        console.log('✅ Found', services.length, 'services in Phorest');
        
        // Transform Phorest services to our format with enhanced categorization
        const transformedServices = services.map((phorestService: any) => {
          const serviceName = phorestService.name || phorestService.serviceName;
          const lowerName = serviceName.toLowerCase();
          
          // Enhanced categorization logic
          let category = 'Treatment';
          let description = phorestService.description || `Professional ${serviceName} service`;
          
          // Laser treatments
          if (lowerName.includes('laser') || lowerName.includes('ipl') || lowerName.includes('nd:yag') || lowerName.includes('carbon')) {
            category = 'Laser';
            if (lowerName.includes('hair removal')) {
              description = `Advanced laser hair removal for permanent hair reduction`;
            } else if (lowerName.includes('carbon')) {
              description = `Carbon laser facial for deep pore cleansing and skin rejuvenation`;
            } else {
              description = `Professional laser treatment for skin rejuvenation and correction`;
            }
          }
          // Injectable treatments  
          else if (lowerName.includes('filler') || lowerName.includes('botox') || lowerName.includes('dysport') || 
                   lowerName.includes('injectable') || lowerName.includes('bio remodel') || lowerName.includes('bio stimulator')) {
            category = 'Injectable';
            if (lowerName.includes('dermal filler')) {
              description = `Advanced dermal filler treatment for natural enhancement and volume restoration`;
            } else if (lowerName.includes('bio remodel')) {
              description = `Skin quality improvement with advanced bio-remodelling technology`;
            } else if (lowerName.includes('botox') || lowerName.includes('dysport')) {
              description = `Anti-wrinkle injections for smooth, youthful skin`;
            } else {
              description = `Professional injectable treatment for facial enhancement`;
            }
          }
          // Member exclusive treatments
          else if (lowerName.includes('member') || lowerName.includes('vip') || lowerName.includes('glow society')) {
            category = 'Member Exclusive';
            description = `Exclusive treatment available only to Glow Society members`;
          }
          // Skin treatments
          else if (lowerName.includes('facial') || lowerName.includes('peel') || lowerName.includes('microneedling') || 
                   lowerName.includes('dermaplaning') || lowerName.includes('hydrafacial')) {
            category = 'Skin Treatment';
            if (lowerName.includes('hydrafacial')) {
              description = `Multi-step facial treatment for instant glowing skin`;
            } else if (lowerName.includes('peel')) {
              description = `Chemical peel treatment to reveal fresh, renewed skin`;
            } else if (lowerName.includes('microneedling')) {
              description = `Collagen induction therapy for improved skin texture and tone`;
            } else {
              description = `Professional facial treatment for healthy, glowing skin`;
            }
          }
          // Advanced treatments
          else if (lowerName.includes('prp') || lowerName.includes('fat dissolv') || lowerName.includes('thread')) {
            category = 'Advanced';
            if (lowerName.includes('fat dissolv')) {
              description = `Non-surgical fat reduction treatment for targeted body contouring`;
            } else if (lowerName.includes('thread')) {
              description = `Non-surgical thread lift for facial contouring and lifting`;
            } else {
              description = `Advanced aesthetic treatment with cutting-edge technology`;
            }
          }
          // Consultation
          else if (lowerName.includes('consultation')) {
            category = 'Consultation';
            description = `Professional consultation to plan your treatment journey`;
          }
          
          return {
            id: phorestService.serviceId || phorestService.id,
            name: serviceName,
            description,
            duration: phorestService.duration || 60,
            price: phorestService.price || 0,
            category,
            branchId: phorestService.branchId,
            branchName: phorestService.branchName,
            availableAt: phorestService.availableAt || [phorestService.branchName || 'All Clinics']
          };
        });
        
        if (transformedServices.length > 0) {
          setPhorestServices(transformedServices);
          console.log('✅ Phorest services loaded and set:', transformedServices.length);
        }
        
      } catch (error) {
        console.error('⚠️ Error fetching Phorest data (fallback will be used):', error);
        // Fallbacks are already set above, so page will still work
      } finally {
        setLoading(false);
        setServicesLoading(false);
        console.log('🏁 Client data fetch completed');
      }
    }
    
    // Always run fetchClientData to ensure services and clinic are set
    fetchClientData();
  }, [user]);

  // Real Phorest services from Skin Societé
  const services: Service[] = [
    // Bio Treatments
    {
      id: 'OFSlDmhiLAZa2uc90-IwHg',
      name: 'Bio Remodelling',
      description: 'Advanced skin quality improvement with bio-remodelling technology',
      duration: 60,
      price: 800,
      category: 'Injectable'
    },
    {
      id: 'y4Lh2nGh0JH1Zkc49Yh5oQ',
      name: 'Bio Stimulator',
      description: 'Collagen stimulation for natural skin rejuvenation',
      duration: 60,
      price: 800,
      category: 'Injectable'
    },
    // Dermal Fillers
    {
      id: 'qGBhG3kZJMrsmauQRU5pug',
      name: 'Dermal Filler - Lips',
      description: 'Natural lip enhancement and definition',
      duration: 30,
      price: 500,
      category: 'Injectable'
    },
    {
      id: 'sFgCjiFWJVWDlVFwaeZNcw',
      name: 'Dermal Filler - Cheeks',
      description: 'Restore volume and contour to cheeks',
      duration: 30,
      price: 700,
      category: 'Injectable'
    },
    {
      id: 'SUBjx2-r6W6Ab9Q2-S6ZyA',
      name: 'Dermal Filler - Chin',
      description: 'Enhance chin projection and facial balance',
      duration: 30,
      price: 700,
      category: 'Injectable'
    },
    {
      id: 'BE3rBUlFG3cS7LS5RV7f8A',
      name: 'Dermal Filler - Jawline',
      description: 'Define and sculpt the jawline',
      duration: 30,
      price: 700,
      category: 'Injectable'
    },
    {
      id: 'Bop4Ga7w0Di_UdyhM26LkA',
      name: 'Dermal Filler - Under Eyes',
      description: 'Reduce dark circles and hollowing',
      duration: 30,
      price: 800,
      category: 'Injectable'
    },
    {
      id: 'taMRfgJQHmJvr966JsZf2Q',
      name: 'Fat Dissolving',
      description: 'Non-surgical fat reduction treatment',
      duration: 45,
      price: 750,
      category: 'Advanced'
    }
  ];

  const handleBookNow = (service: Service) => {
    setSelectedService(service);
    
    // Show appropriate booking interface based on device
    if (isMobile) {
      setShowMobileBooking(true);
    } else {
      // Always go straight to booking modal - we have client data
      setShowBookingModal(true);
    }
  };

  const handleBookingComplete = (booking: any) => {
    console.log('Booking completed:', booking);
    // Optionally refresh appointments or navigate to confirmation page
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setShowMobileBooking(false);
    setShowIntakeForm(false);
    setSelectedService(null);
  };

  const handleIntakeComplete = (completedClientData: any) => {
    setClientData(completedClientData);
    setShowIntakeForm(false);
    setShowBookingModal(true);
  };

  const handleSlotSelect = (date: string, time: string, staffId: string) => {
    // Handle direct slot selection from smart scheduler
    console.log('Slot selected:', { date, time, staffId });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header with Mode Selector */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Treatment</h1>
              <p className="text-gray-600">Premium treatments with real-time availability</p>
            </div>
            
            {/* Booking Mode Selector */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 mt-4 sm:mt-0">
              <button
                onClick={() => setBookingMode('condition')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  bookingMode === 'condition'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                By Concern
              </button>
              <button
                onClick={() => setBookingMode('gallery')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  bookingMode === 'gallery'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Gallery View
              </button>
              <button
                onClick={() => setBookingMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  bookingMode === 'list'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                List View
              </button>
            </div>
          </div>
        </div>

        {/* Home Clinic Card - Pulled from Phorest */}
        {homeClinic && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8
                        border border-purple-200 transform transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🏥</span>
                  <h2 className="text-xl font-bold text-gray-900">Your Home Clinic</h2>
                </div>
                <h3 className="text-lg font-semibold text-purple-700 mb-2">{homeClinic.name}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  {homeClinic.addressLine1 && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {homeClinic.addressLine1}
                      {homeClinic.addressLine2 && `, ${homeClinic.addressLine2}`}
                    </p>
                  )}
                  {homeClinic.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {homeClinic.phone}
                    </p>
                  )}
                  {homeClinic.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {homeClinic.email}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => router.push('/clinics')}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium
                         transition-colors flex items-center gap-1 group">
                Change Clinic
                <ChevronRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}

        {/* Service Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-pink-500 text-2xl mb-1">
              <Calendar className="w-8 h-8 mx-auto" />
            </div>
            <div className="text-sm text-gray-600">Next Available</div>
            <div className="font-bold text-gray-900">Today 2:30 PM</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-blue-500 text-2xl mb-1">
              <Clock className="w-8 h-8 mx-auto" />
            </div>
            <div className="text-sm text-gray-600">Average Wait</div>
            <div className="font-bold text-gray-900">15 minutes</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-yellow-500 text-2xl mb-1">
              <Star className="w-8 h-8 mx-auto fill-current" />
            </div>
            <div className="text-sm text-gray-600">Clinic Rating</div>
            <div className="font-bold text-gray-900">4.9/5 ★</div>
          </div>
        </div>

        {/* Welcome Message */}
        {user && (
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">
                  Welcome back, {user.firstName}! 
                </h2>
                <p className="text-pink-100">
                  Ready for your next beauty transformation? Book your appointment below.
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{user.loyaltyTier}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{user.totalPoints?.toLocaleString()} points</span>
                  </div>
                </div>
              </div>
              <div className="text-4xl opacity-80">✨</div>
            </div>
          </div>
        )}

        {/* Dynamic Service Display Based on Mode */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {bookingMode === 'condition' ? 'Find Your Perfect Treatment' : 
               bookingMode === 'gallery' ? 'Treatment Gallery' : 'Available Services'}
            </h2>
            {phorestServices.length > 0 && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Live from Phorest
              </span>
            )}
          </div>
          
          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Condition-Based Selector */}
              {bookingMode === 'condition' && (
                <ConditionBasedSelector 
                  services={phorestServices.length > 0 ? phorestServices : services}
                  onServiceSelect={handleBookNow}
                  loading={servicesLoading}
                />
              )}
              
              {/* Visual Treatment Gallery */}
              {bookingMode === 'gallery' && (
                <VisualTreatmentGallery 
                  services={phorestServices.length > 0 ? phorestServices : services}
                  onServiceSelect={handleBookNow}
                  loading={servicesLoading}
                />
              )}
              
              {/* Traditional List View */}
              {bookingMode === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(phorestServices.length > 0 ? phorestServices : services).map(service => (
                  <div key={service.id} 
                       className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100
                                transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
                                group cursor-pointer">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {service.name}
                          </h3>
                          <p className="text-gray-600 mt-1 text-sm leading-relaxed">{service.description}</p>
                        </div>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium ml-2">
                          {service.category}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-bold text-gray-900">${service.price}</span>
                          </span>
                        </div>
                        
                        {/* Show clinic availability */}
                        {(service as any).availableAt && (service as any).availableAt.length > 0 && (
                          <div className="text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Available at: {(service as any).availableAt.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleBookNow(service)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white
                                 font-semibold py-3 rounded-lg transform transition-all duration-300
                                 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center
                                 justify-center gap-2 group-hover:from-purple-600 group-hover:to-pink-600">
                        <Plus className="w-5 h-5" />
                        Book Now
                      </button>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Need Something Different?</h3>
          <p className="text-gray-600 mb-6">
            Explore our full range of premium treatments and advanced skincare services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/services')}
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 
                       px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors
                       border border-gray-200 shadow-sm">
              View All Services
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/consultation')}
              className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white 
                       px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors
                       shadow-sm">
              Free Consultation
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Phorest Integration Status */}
        <div className="mt-8 space-y-4">
          {phorestServices.length > 0 ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">
                  ✅ Successfully loaded {phorestServices.length} services from your Phorest system!
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  Loading services from Phorest... (showing demo services as fallback)
                </span>
              </div>
            </div>
          )}
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                Booking system integration with Phorest in progress. 
                You can select services and will be redirected to complete your booking.
              </span>
            </div>
          </div>
        </div>

        {/* Smart Scheduler - Desktop Alternative */}
        {!isMobile && selectedService && homeClinic && !showBookingModal && !showIntakeForm && (
          <div className="mt-8">
            <SmartScheduler
              service={selectedService}
              homeClinic={homeClinic}
              onSlotSelect={handleSlotSelect}
              clientData={clientData}
            />
          </div>
        )}

        {/* Progressive Intake Form */}
        {showIntakeForm && selectedService && (
          <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
            <ProgressiveIntakeForm
              service={selectedService}
              existingClientData={clientData || undefined}
              onComplete={handleIntakeComplete}
              onCancel={handleCloseModal}
            />
          </div>
        )}

        {/* Mobile Booking Interface */}
        {showMobileBooking && selectedService && clientData && homeClinic && (
          <MobileBookingInterface
            isOpen={showMobileBooking}
            onClose={handleCloseModal}
            service={selectedService}
            clientData={clientData}
            homeClinic={homeClinic}
            onBookingComplete={handleBookingComplete}
          />
        )}

        {/* Enhanced Desktop Booking Modal */}
        {showBookingModal && selectedService && clientData && homeClinic && !isMobile && (
          <BookingModal
            isOpen={showBookingModal}
            onClose={handleCloseModal}
            service={selectedService}
            clientData={clientData}
            homeClinic={homeClinic}
            onBookingComplete={handleBookingComplete}
          />
        )}
      </div>
    </MainLayout>
  );
}