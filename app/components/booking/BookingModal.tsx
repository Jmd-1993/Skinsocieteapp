'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Star, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  MapPin,
  Phone
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
  photo?: string;
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

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  clientData: any;
  homeClinic: Branch;
  onBookingComplete: (booking: any) => void;
}

type BookingStep = 'datetime' | 'staff' | 'confirmation' | 'success';

export function BookingModal({ 
  isOpen, 
  onClose, 
  service, 
  clientData, 
  homeClinic, 
  onBookingComplete 
}: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('datetime');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Mock staff data for aesthetic treatments
  const mockStaff: Staff[] = [
    {
      id: 'X-qh_VV3E41h9tghKPiRyg',
      name: 'Isabelle Callaghan',
      title: 'Senior Aesthetic Nurse',
      specialties: ['Dermal Fillers', 'Anti-Wrinkle Injections', 'Skin Assessment'],
      rating: 4.9,
      available: true
    },
    {
      id: 'staff-2',
      name: 'Sarah Mitchell',
      title: 'Dermal Therapist',
      specialties: ['Chemical Peels', 'Microneedling', 'LED Therapy'],
      rating: 4.8,
      available: true
    },
    {
      id: 'staff-3',
      name: 'Emma Thompson',
      title: 'Beauty Therapist',
      specialties: ['Hydrating Facials', 'Dermaplaning', 'Skin Analysis'],
      rating: 4.7,
      available: true
    }
  ];

  // Generate next 7 days for date selection
  const generateDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      // Skip Sundays
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-AU', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          }),
          dayName: date.toLocaleDateString('en-AU', { weekday: 'long' })
        });
      }
    }
    return dates;
  };

  // Fetch time slots from API based on selected date
  const fetchTimeSlots = async (date: string) => {
    setLoading(true);
    setError(''); // Clear any previous errors
    
    try {
      console.log(`🔍 Fetching availability for ${date}, service: ${service.id}, branch: ${homeClinic.branchId}`);
      
      const response = await fetch('/api/appointments/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          serviceId: service.id,
          branchId: homeClinic.branchId,
          duration: service.duration
        })
      });

      const result = await response.json();
      console.log('🔍 Availability API response:', result);
      
      if (result.success) {
        setAvailableSlots(result.slots || []);
        
        // Update staff members with real data if available
        if (result.staff && result.staff.length > 0) {
          const realStaff = result.staff.map((s: any) => ({
            id: s.staffId,
            name: s.staffName,
            title: s.title,
            specialties: getSpecialtiesByTitle(s.title),
            rating: 4.8 + Math.random() * 0.2, // Mock rating
            available: s.slots && s.slots.length > 0 ? s.slots.some((slot: any) => slot.available) : true
          }));
          setStaffMembers(realStaff);
          console.log(`✅ Updated with ${realStaff.length} real staff members`);
        }
        
        // Show success feedback
        console.log(`✅ Successfully loaded availability: ${result.slots.length} total slots from ${result.staff.length} staff members`);
        
        // Check if we have actual availability
        const availableCount = result.slots.filter((s: any) => s.available).length;
        if (availableCount === 0) {
          setError('No appointment slots available for this date. Please try another day or contact the clinic directly.');
        }
      } else {
        console.error('Failed to fetch availability:', result.message);
        setError('Unable to fetch real-time availability. Showing demo slots.');
        // Fallback to mock data
        setAvailableSlots(generateMockTimeSlots(date));
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setError('Connection issue - showing demo availability while we reconnect');
      // Fallback to mock data
      setAvailableSlots(generateMockTimeSlots(date));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to assign specialties based on job title
  const getSpecialtiesByTitle = (title: string): string[] => {
    if (title.toLowerCase().includes('nurse')) {
      return ['Dermal Fillers', 'Anti-Wrinkle Injections', 'Skin Assessment'];
    } else if (title.toLowerCase().includes('dermal')) {
      return ['Chemical Peels', 'Microneedling', 'LED Therapy'];
    } else {
      return ['Hydrating Facials', 'Dermaplaning', 'Skin Analysis'];
    }
  };

  // Generate mock time slots as fallback
  const generateMockTimeSlots = (date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const selectedDateObj = new Date(date);
    const isToday = selectedDateObj.toDateString() === new Date().toDateString();
    const currentHour = new Date().getHours();
    
    // Generate slots from 9 AM to 5 PM
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Skip slots that have already passed today
        if (isToday && hour <= currentHour) continue;
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Mock availability - make some slots unavailable for realism
        const randomStaff = mockStaff[Math.floor(Math.random() * mockStaff.length)];
        const isAvailable = Math.random() > 0.3; // 70% availability rate
        
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

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    setStaffMembers(mockStaff);
  }, []);

  if (!isOpen) return null;

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setSelectedStaff(null);
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    if (!timeSlot.available) return;
    
    setSelectedTime(timeSlot.time);
    // Auto-select the available staff for this slot
    const staff = staffMembers.find(s => s.id === timeSlot.staffId);
    if (staff) {
      setSelectedStaff(staff);
      setCurrentStep('staff');
    }
  };

  const handleStaffSelect = (staff: Staff) => {
    setSelectedStaff(staff);
    setCurrentStep('confirmation');
  };

  const handleBooking = async () => {
    setLoading(true);
    setError('');
    
    // Validate all required data
    if (!clientData?.clientId) {
      setError('Client information missing. Please refresh and try again.');
      setLoading(false);
      return;
    }
    
    if (!selectedStaff?.id) {
      setError('Please select a therapist for your appointment.');
      setLoading(false);
      return;
    }
    
    try {
      console.log(`🎯 Creating booking for client ${clientData.clientId}`);
      console.log(`📅 Service: ${service.id}, Staff: ${selectedStaff.id}, Date: ${selectedDate}, Time: ${selectedTime}`);
      
      const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      
      const bookingData = {
        clientId: clientData.clientId,
        serviceId: service.id,
        staffId: selectedStaff.id,
        startTime: appointmentDateTime.toISOString(),
        notes: `Booked via Skin Societe app - Service: ${service.name}`,
        clientName: `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() || 'Guest',
        clientEmail: clientData.email || '',
        serviceName: service.name,
        staffName: selectedStaff.name,
        duration: service.duration,
        price: service.price,
        clinicName: homeClinic.name
      };

      console.log('🔧 Booking payload:', bookingData);

      const response = await fetch('/api/appointments/simple-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      console.log('🔧 Booking API response:', result);
      
      if (result.success) {
        console.log('✅ Booking successful!');
        setCurrentStep('success');
        onBookingComplete(result.booking);
      } else {
        console.error('❌ Booking failed:', result);
        const errorMessage = result.message || result.error || 'Failed to book appointment';
        
        // Provide more specific error messages
        if (errorMessage.includes('STAFF_NOT_WORKING') || errorMessage.includes('not rostered')) {
          setError('The selected therapist is not available at this time. Please choose a different time slot.');
        } else if (errorMessage.includes('SLOT_UNAVAILABLE') || errorMessage.includes('already booked')) {
          setError('This time slot is no longer available. Please select a different time.');
        } else if (errorMessage.includes('CLIENT_NOT_FOUND')) {
          setError('Account not found. Please contact support for assistance.');
        } else if (errorMessage.includes('Invalid booking request')) {
          setError('Booking details are invalid. Please check your selections and try again.');
        } else {
          setError(`Unable to book appointment: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('❌ Booking error:', error);
      setError('Network error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepHeader = () => {
    const steps = [
      { id: 'datetime', label: 'Date & Time', icon: Calendar },
      { id: 'staff', label: 'Select Therapist', icon: User },
      { id: 'confirmation', label: 'Confirm Booking', icon: CheckCircle }
    ];

    const currentStepIndex = steps.findIndex(step => step.id === currentStep);

    return (
      <div className="flex items-center justify-between mb-6 px-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = index < currentStepIndex;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                ${isActive 
                  ? 'border-purple-500 bg-purple-500 text-white' 
                  : isCompleted 
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${isActive ? 'text-purple-600' : 'text-gray-500'}`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-300 mx-4" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDateTimeSelection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {generateDates().map(date => (
            <button
              key={date.value}
              onClick={() => handleDateSelect(date.value)}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                selectedDate === date.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}>
              <div className="text-sm text-gray-600">{date.dayName}</div>
              <div className="font-semibold">{date.label}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Times</h3>
          
          {/* Show any connection warnings */}
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <span className="font-medium">Connection Notice:</span>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="p-3 rounded-lg bg-gray-100 animate-pulse h-12"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleTimeSelect(slot)}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      !slot.available
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : selectedTime === slot.time
                          ? 'border-purple-500 bg-purple-500 text-white'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700'
                    }`}>
                    {slot.time}
                    {slot.available && slot.staffName && (
                      <div className="text-xs mt-1 opacity-75">
                        {slot.staffName.split(' ')[0]}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {availableSlots.filter(s => s.available).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">
                    No available slots for this date.
                  </p>
                  <p className="text-sm text-gray-400">
                    Try selecting another day or contact us directly to check availability.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderStaffSelection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Your Therapist</h3>
        <p className="text-gray-600 text-sm mb-4">
          Choose your preferred therapist for {service.name}
        </p>
      </div>

      <div className="space-y-4">
        {staffMembers.filter(staff => staff.available).map(staff => (
          <div
            key={staff.id}
            onClick={() => handleStaffSelect(staff)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedStaff?.id === staff.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {staff.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{staff.name}</h4>
                  <p className="text-sm text-gray-600">{staff.title}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{staff.rating}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Specializes in:</div>
                <div className="flex flex-wrap gap-1">
                  {staff.specialties.slice(0, 2).map(specialty => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Your Booking</h3>
      </div>

      {/* Appointment Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <h4 className="font-semibold text-gray-900 mb-4">Appointment Details</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Treatment:</span>
            <span className="font-medium">{service.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{service.duration} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Price:</span>
            <span className="font-semibold text-lg">${service.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">
              {new Date(selectedDate).toLocaleDateString('en-AU', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">{selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Therapist:</span>
            <span className="font-medium">{selectedStaff?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">{homeClinic.name}</span>
          </div>
        </div>
      </div>

      {/* Pre-Treatment Information */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900 mb-2">Before Your Treatment</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Arrive 10 minutes early for consultation</li>
              <li>• Remove makeup and contact lenses if applicable</li>
              <li>• Avoid sun exposure 24 hours before treatment</li>
              <li>• Inform us of any medications or skin conditions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Booking Policies */}
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-yellow-900 mb-2">Cancellation Policy</h5>
            <p className="text-sm text-yellow-800">
              Please provide 24 hours notice for cancellations. Late cancellations may incur a fee.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600 mb-4">
          Your appointment has been successfully booked. You'll receive a confirmation email shortly.
        </p>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-6">
          <div className="text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Treatment:</span>
              <span className="font-medium">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time:</span>
              <span className="font-medium">
                {new Date(selectedDate).toLocaleDateString('en-AU')} at {selectedTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Therapist:</span>
              <span className="font-medium">{selectedStaff?.name}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Done
          </button>
          <p className="text-sm text-gray-500">
            Need to reschedule? Call us at {homeClinic.phone} or manage your appointments online.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Book {service.name}</h2>
              <p className="text-gray-600">{service.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {currentStep !== 'success' && renderStepHeader()}
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 'datetime' && renderDateTimeSelection()}
          {currentStep === 'staff' && renderStaffSelection()}
          {currentStep === 'confirmation' && renderConfirmation()}
          {currentStep === 'success' && renderSuccess()}
        </div>

        {/* Footer */}
        {currentStep !== 'success' && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
            <div className="flex justify-between">
              <button
                onClick={() => {
                  if (currentStep === 'staff') setCurrentStep('datetime');
                  else if (currentStep === 'confirmation') setCurrentStep('staff');
                }}
                disabled={currentStep === 'datetime'}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => {
                  if (currentStep === 'datetime' && selectedDate && selectedTime) {
                    // Skip staff selection if already auto-selected
                    if (selectedStaff) setCurrentStep('confirmation');
                    else setCurrentStep('staff');
                  } else if (currentStep === 'staff' && selectedStaff) {
                    setCurrentStep('confirmation');
                  } else if (currentStep === 'confirmation') {
                    handleBooking();
                  }
                }}
                disabled={
                  (currentStep === 'datetime' && (!selectedDate || !selectedTime)) ||
                  (currentStep === 'staff' && !selectedStaff) ||
                  loading
                }
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Booking...</span>
                  </>
                ) : currentStep === 'confirmation' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Booking</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}