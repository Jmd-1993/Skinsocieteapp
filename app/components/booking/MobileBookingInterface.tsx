'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Star,
  Heart,
  Zap,
  Smartphone,
  Vibrate
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

interface Staff {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  rating: number;
  available: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
  staffId: string;
  staffName: string;
}

interface Branch {
  branchId: string;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  phone?: string;
}

interface MobileBookingInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  clientData: any;
  homeClinic: Branch;
  onBookingComplete: (booking: any) => void;
}

type BookingStep = 'service' | 'datetime' | 'staff' | 'details' | 'confirmation' | 'success';

export function MobileBookingInterface({ 
  isOpen, 
  onClose, 
  service, 
  clientData, 
  homeClinic, 
  onBookingComplete 
}: MobileBookingInterfaceProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [expandedSection, setExpandedSection] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Touch gesture states
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Mock staff data
  const staffMembers: Staff[] = [
    {
      id: 'X-qh_VV3E41h9tghKPiRyg',
      name: 'Isabelle Callaghan',
      title: 'Senior Aesthetic Nurse',
      specialties: ['Dermal Fillers', 'Anti-Wrinkle Injections'],
      rating: 4.9,
      available: true
    },
    {
      id: 'staff-2',
      name: 'Sarah Mitchell',
      title: 'Dermal Therapist',
      specialties: ['Chemical Peels', 'Microneedling'],
      rating: 4.8,
      available: true
    }
  ];

  // Generate next 14 days for mobile scrolling
  const generateMobileDates = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      if (date.getDay() !== 0) { // Skip Sundays
        dates.push({
          value: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString('en-AU', { weekday: 'short' }),
          dayNumber: date.getDate(),
          monthName: date.toLocaleDateString('en-AU', { month: 'short' }),
          fullDate: date.toLocaleDateString('en-AU', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })
        });
      }
    }
    return dates;
  };

  // Handle scroll events for header effects
  useEffect(() => {
    const handleScroll = (e: any) => {
      setIsScrolled(e.target.scrollTop > 20);
    };

    const modalContent = document.querySelector('.mobile-modal-content');
    modalContent?.addEventListener('scroll', handleScroll);
    
    return () => modalContent?.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch time slots
  const fetchTimeSlots = async (date: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/appointments/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          serviceId: service.id,
          branchId: homeClinic.branchId,
          duration: service.duration
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAvailableSlots(result.slots || []);
      } else {
        // Generate mock data for mobile demo
        setAvailableSlots(generateMockTimeSlots(date));
        setError('Showing demo availability');
      }
    } catch (error) {
      setAvailableSlots(generateMockTimeSlots(date));
      setError('Demo mode active');
    } finally {
      setLoading(false);
    }
  };

  const generateMockTimeSlots = (date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const selectedDateObj = new Date(date);
    const isToday = selectedDateObj.toDateString() === new Date().toDateString();
    const currentHour = new Date().getHours();
    
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (isToday && hour <= currentHour) continue;
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const randomStaff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
        const isAvailable = Math.random() > 0.4;
        
        slots.push({
          time: timeString,
          available: isAvailable,
          staffId: randomStaff.id,
          staffName: randomStaff.name
        });
      }
    }
    
    return slots;
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = touchStartY - currentY;
    const diffX = Math.abs(touchStartX - currentX);
    
    // Close modal on swipe down (and not much horizontal movement)
    if (diffY < -50 && diffX < 30 && currentStep === 'service') {
      e.preventDefault();
      onClose();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  if (!isOpen) return null;

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setSelectedStaff(null);
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    if (!timeSlot.available) return;
    
    setSelectedTime(timeSlot.time);
    const staff = staffMembers.find(s => s.id === timeSlot.staffId);
    if (staff) {
      setSelectedStaff(staff);
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([10, 10, 10]);
    }
  };

  const progressPercentage = (() => {
    const steps = ['service', 'datetime', 'staff', 'details', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  })();

  const renderMobileHeader = () => (
    <div className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-200' : 'bg-transparent'
    }`}>
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="text-center flex-1 mx-4">
          <h2 className="text-lg font-bold text-gray-900 truncate">{service.name}</h2>
          <p className="text-sm text-gray-600">${service.price} • {service.duration}min</p>
        </div>
        
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );

  const renderServiceOverview = () => (
    <div className="space-y-6 pb-24">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl p-6 text-white mx-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">{service.name}</h3>
            <p className="text-purple-100 text-sm leading-relaxed">
              {service.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${service.price}</div>
            <div className="text-purple-200 text-sm">{service.duration} minutes</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-300 fill-current" />
            <span className="text-sm">4.9 rating • Most popular</span>
          </div>
          <Heart className="w-5 h-5 text-pink-300" />
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 gap-4 px-4">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-sm font-medium text-blue-900">Duration</div>
          <div className="text-blue-700">{service.duration} min</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-sm font-medium text-green-900">Results</div>
          <div className="text-green-700">Immediate</div>
        </div>
      </div>

      {/* Treatment Benefits */}
      <div className="px-4">
        <button
          onClick={() => setExpandedSection(expandedSection === 'benefits' ? '' : 'benefits')}
          className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 mb-2"
        >
          <span className="font-semibold text-gray-900">Treatment Benefits</span>
          {expandedSection === 'benefits' ? 
            <ChevronUp className="w-5 h-5 text-gray-500" /> : 
            <ChevronDown className="w-5 h-5 text-gray-500" />
          }
        </button>
        
        {expandedSection === 'benefits' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            {['Immediate visible results', 'Professional-grade treatment', 'Minimal to no downtime', 'Personalized to your skin'].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location Info */}
      <div className="px-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">{homeClinic.name}</div>
              {homeClinic.addressLine1 && (
                <div className="text-sm text-gray-600">
                  {homeClinic.addressLine1}
                  {homeClinic.addressLine2 && `, ${homeClinic.addressLine2}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="space-y-6 pb-24">
      {/* Date Selection */}
      <div className="px-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {generateMobileDates().slice(0, 7).map(date => (
            <button
              key={date.value}
              onClick={() => handleDateSelect(date.value)}
              className={`flex-shrink-0 p-4 rounded-2xl border-2 text-center min-w-[80px] transition-all ${
                selectedDate === date.value
                  ? 'border-purple-500 bg-purple-500 text-white'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="text-xs opacity-75 mb-1">{date.dayName}</div>
              <div className="text-lg font-bold">{date.dayNumber}</div>
              <div className="text-xs opacity-75">{date.monthName}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Times</h3>
            {error && (
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                Demo
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {availableSlots.slice(0, 12).map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeSelect(slot)}
                  disabled={!slot.available}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    !slot.available
                      ? 'bg-gray-100 text-gray-400'
                      : selectedTime === slot.time
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-white border-2 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {slot.time}
                  {slot.available && slot.staffName && (
                    <div className="text-xs mt-1 opacity-75">
                      {slot.staffName.split(' ')[0]}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6 pb-24">
      {/* Appointment Summary Card */}
      <div className="mx-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Treatment</span>
            <span className="font-medium text-right">{service.name}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Date</span>
            <span className="font-medium">
              {selectedDate && new Date(selectedDate).toLocaleDateString('en-AU', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short' 
              })}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Time</span>
            <span className="font-medium">{selectedTime}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Therapist</span>
            <span className="font-medium">{selectedStaff?.name}</span>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-purple-200">
            <span className="text-gray-600">Total</span>
            <span className="text-xl font-bold text-purple-600">${service.price}</span>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="mx-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Before Your Visit</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Arrive 10 minutes early</li>
              <li>• Remove makeup if applicable</li>
              <li>• Bring valid ID</li>
            </ul>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6 p-8">
      <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600 mb-6">
          Your appointment is confirmed. We'll send you a confirmation email shortly.
        </p>
        
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-left space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Treatment:</span>
            <span className="font-medium">{service.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date & Time:</span>
            <span className="font-medium">
              {selectedDate && new Date(selectedDate).toLocaleDateString('en-AU')} at {selectedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFloatingButton = () => {
    if (currentStep === 'success') return null;

    let buttonText = 'Continue';
    let isDisabled = false;
    let onClick = () => {};

    switch (currentStep) {
      case 'service':
        buttonText = 'Select Date & Time';
        onClick = () => setCurrentStep('datetime');
        break;
      case 'datetime':
        buttonText = 'Confirm Selection';
        isDisabled = !selectedDate || !selectedTime;
        onClick = () => setCurrentStep('confirmation');
        break;
      case 'confirmation':
        buttonText = loading ? 'Booking...' : 'Confirm Booking';
        isDisabled = loading;
        onClick = async () => {
          setLoading(true);
          // Simulate booking API call
          setTimeout(() => {
            setCurrentStep('success');
            setLoading(false);
          }, 2000);
        };
        break;
    }

    return (
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-area-pb">
        <button
          onClick={onClick}
          disabled={isDisabled}
          className={`w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
            isDisabled
              ? 'bg-gray-100 text-gray-400'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 active:scale-95'
          }`}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {buttonText}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
      <div 
        className="bg-white h-full flex flex-col mobile-modal-content overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {renderMobileHeader()}
        
        <div className="flex-1">
          {currentStep === 'service' && renderServiceOverview()}
          {currentStep === 'datetime' && renderDateTimeSelection()}
          {currentStep === 'confirmation' && renderConfirmation()}
          {currentStep === 'success' && renderSuccess()}
        </div>
        
        {renderFloatingButton()}
      </div>
    </div>
  );
}