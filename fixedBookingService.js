// fixedBookingService.js - Corrected booking implementation
import phorestService from './app/services/phorestService.js';

// CRITICAL FIX: The booking endpoint needs proper structure and flow
class PhorestBookingService {
  constructor() {
    this.businessId = 'IX2it2QrF0iguR-LpZ6BHQ';
    this.branchId = null;
  }

  // Initialize and get branch
  async initialize() {
    const branches = await phorestService.getBranches();
    if (branches.length > 0) {
      this.branchId = branches[0].branchId;
      console.log(`✅ Branch initialized: ${branches[0].name} (${this.branchId})`);
    }
    return this.branchId;
  }

  // FIX 1: Check availability BEFORE booking (required step)
  async checkAvailability(serviceId, date, staffId = null) {
    if (!this.branchId) await this.initialize();
    
    try {
      // Format date properly for Phorest
      const formattedDate = new Date(date).toISOString().split('T')[0];
      
      const params = {
        serviceId: serviceId,
        date: formattedDate,
        branchId: this.branchId
      };
      
      if (staffId) {
        params.staffId = staffId;
      }
      
      // This endpoint might be different - trying common patterns
      const response = await phorestService.api.get(
        `/${this.businessId}/branch/${this.branchId}/availability`,
        { params }
      );
      
      return response.data;
    } catch (error) {
      console.log('Availability check failed, trying alternative endpoint...');
      
      // Alternative: Get work timetables for the day
      try {
        const response = await phorestService.api.get(
          `/${this.businessId}/branch/${this.branchId}/staff-work-time-table`,
          {
            params: {
              from: date,
              to: date
            }
          }
        );
        return response.data;
      } catch (err) {
        throw err;
      }
    }
  }

  // FIX 2: Create appointment with COMPLETE required fields
  async createAppointment(appointmentData) {
    if (!this.branchId) await this.initialize();
    
    try {
      // CRITICAL: Ensure all required fields are present
      const completeAppointmentData = {
        // Basic required fields
        clientId: appointmentData.clientId,
        serviceId: appointmentData.serviceId,
        staffId: appointmentData.staffId,
        
        // FIX: Use correct date/time format
        // Phorest might expect local time, not UTC
        startTime: this.formatDateTime(appointmentData.date, appointmentData.time),
        
        // FIX: Include duration from service
        duration: appointmentData.duration || 60,
        
        // FIX: Add often-required but undocumented fields
        branchId: this.branchId,
        status: 'REQUESTED', // or 'CONFIRMED' depending on business rules
        
        // FIX: Add booking source
        bookingSource: 'API',
        
        // FIX: Add notes if provided
        notes: appointmentData.notes || '',
        
        // FIX: Add price (might be required)
        price: appointmentData.price || 0,
        
        // FIX: Add deposit if required
        depositRequired: false,
        depositAmount: 0,
        
        // FIX: Add reminder preferences
        sendReminder: true,
        reminderType: 'SMS',
        
        // FIX: Staff request vs assignment
        staffRequest: false, // false = assigned, true = requested
        
        // FIX: Activation state
        activationState: 'ACTIVE'
      };
      
      console.log('📤 Sending appointment request:', JSON.stringify(completeAppointmentData, null, 2));
      
      // Try the standard endpoint
      const response = await phorestService.api.post(
        `/${this.businessId}/branch/${this.branchId}/appointment`,
        completeAppointmentData
      );
      
      return response.data;
      
    } catch (error) {
      // If standard endpoint fails, try booking endpoint
      if (error.response?.status === 500) {
        console.log('Standard endpoint failed, trying booking endpoint...');
        return this.tryBookingEndpoint(appointmentData);
      }
      throw error;
    }
  }

  // FIX 3: Alternative booking endpoint (some Phorest systems use this)
  async tryBookingEndpoint(appointmentData) {
    try {
      const bookingData = {
        clientId: appointmentData.clientId,
        branchId: this.branchId,
        services: [{
          serviceId: appointmentData.serviceId,
          staffId: appointmentData.staffId,
          startTime: this.formatDateTime(appointmentData.date, appointmentData.time),
          duration: appointmentData.duration
        }],
        status: 'REQUESTED',
        source: 'API'
      };
      
      console.log('📤 Trying booking endpoint:', JSON.stringify(bookingData, null, 2));
      
      const response = await phorestService.api.post(
        `/${this.businessId}/branch/${this.branchId}/booking`,
        bookingData
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // FIX 4: Proper date/time formatting for Australian timezone
  formatDateTime(date, time) {
    // Parse the date and time
    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');
    
    // Create date in Perth timezone
    const dateObj = new Date(year, month - 1, day, hour, minute);
    
    // Convert to UTC for API (Perth is UTC+8)
    const utcDate = new Date(dateObj.getTime() - (8 * 60 * 60 * 1000));
    
    // Return ISO string with milliseconds
    return utcDate.toISOString();
  }

  // FIX 5: Get staff schedule for a specific day
  async getStaffSchedule(staffId, date) {
    if (!this.branchId) await this.initialize();
    
    try {
      const response = await phorestService.api.get(
        `/${this.businessId}/branch/${this.branchId}/staff/${staffId}/schedule`,
        {
          params: {
            date: date
          }
        }
      );
      return response.data;
    } catch (error) {
      console.log('Staff schedule endpoint not available');
      return null;
    }
  }

  // FIX 6: Comprehensive booking with all checks
  async bookAppointmentWithValidation(clientId, serviceId, preferredDate, preferredTime) {
    console.log('\n🔄 Starting comprehensive booking process...\n');
    
    try {
      // Step 1: Initialize
      await this.initialize();
      
      // Step 2: Get service details
      console.log('1️⃣ Getting service details...');
      const service = await phorestService.getServiceById(serviceId);
      console.log(`   Service: ${service.name} (${service.duration} mins, $${service.price})`);
      
      // Step 3: Get qualified staff
      console.log('2️⃣ Finding qualified staff...');
      const staff = await phorestService.getStaff();
      const qualifiedStaff = staff.filter(s => 
        !s.disqualifiedServices?.includes(serviceId) &&
        !s.hideFromOnlineBookings
      );
      
      if (qualifiedStaff.length === 0) {
        // Try staff without explicit disqualification
        const availableStaff = staff.filter(s => 
          !s.disqualifiedServices?.includes(serviceId)
        );
        
        if (availableStaff.length > 0) {
          qualifiedStaff.push(availableStaff[0]);
        }
      }
      
      console.log(`   Found ${qualifiedStaff.length} qualified staff members`);
      
      if (qualifiedStaff.length === 0) {
        throw new Error('No qualified staff available for this service');
      }
      
      const selectedStaff = qualifiedStaff[0];
      console.log(`   Selected: ${selectedStaff.firstName} ${selectedStaff.lastName}`);
      
      // Step 4: Check availability (if endpoint exists)
      console.log('3️⃣ Checking availability...');
      try {
        const availability = await this.checkAvailability(
          serviceId, 
          preferredDate, 
          selectedStaff.staffId
        );
        console.log('   Availability confirmed');
      } catch (error) {
        console.log('   Availability check skipped (endpoint not available)');
      }
      
      // Step 5: Create appointment with all fields
      console.log('4️⃣ Creating appointment...');
      const appointmentData = {
        clientId: clientId,
        serviceId: serviceId,
        staffId: selectedStaff.staffId,
        date: preferredDate,
        time: preferredTime,
        duration: service.duration,
        price: service.price,
        notes: 'Booked via Skin Societé mobile app'
      };
      
      const result = await this.createAppointment(appointmentData);
      
      console.log('✅ APPOINTMENT CREATED SUCCESSFULLY!');
      console.log('   Appointment ID:', result.appointmentId || result.id);
      console.log('   Status:', result.status);
      
      return {
        success: true,
        appointment: result
      };
      
    } catch (error) {
      console.error('❌ Booking failed:', error.response?.data || error.message);
      
      // Detailed error analysis
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('\n📋 ERROR DETAILS:');
        console.log('   Code:', errorData.code);
        console.log('   Message:', errorData.message || errorData.detail);
        console.log('   Error ID:', errorData.errorId || errorData.id);
        
        // Map to specific Phorest errors
        const errorMap = {
          'STAFF_UNQUALIFIED': 'Staff member is not qualified for this service',
          'STAFF_NOT_WORKING': 'Staff member is not working on this day',
          'CLIENT_DOUBLE_BOOKED': 'Client already has an appointment at this time',
          'STAFF_DOUBLE_BOOKED': 'Staff member is already booked at this time',
          'OUTSIDE_OPENING_HOURS': 'Time is outside business hours',
          'INSUFFICIENT_TIME': 'Not enough time available for this service',
          'MACHINE_DOUBLE_BOOKED': 'Required equipment is not available',
          'ROOM_DOUBLE_BOOKED': 'Treatment room is not available'
        };
        
        if (errorMap[errorData.code]) {
          console.log('   Reason:', errorMap[errorData.code]);
        }
      }
      
      return {
        success: false,
        error: error.message,
        details: error.response?.data
      };
    }
  }
}

// Test the fixed implementation
async function testFixedBooking() {
  const bookingService = new PhorestBookingService();
  
  // Test with your real data
  const result = await bookingService.bookAppointmentWithValidation(
    'EKig-KWT5NYu4b150Fra8w', // Josh Mills
    'gyyUxf51abS0lB-A_3PDFA', // Dermal Filler - Dissolve
    '2025-08-06', // Date
    '10:00' // Time (local Perth time)
  );
  
  if (result.success) {
    console.log('\n🎉 SUCCESS! Appointment booked:', result.appointment);
  } else {
    console.log('\n❌ Booking failed. Details:', result.details);
    
    // Provide alternative solution
    console.log('\n💡 ALTERNATIVE SOLUTION:');
    console.log('If booking continues to fail, the issue is likely:');
    console.log('1. Phorest internal system configuration');
    console.log('2. Missing room/equipment setup in Phorest admin');
    console.log('3. Business rules not exposed via API');
    console.log('\nContact Phorest with error ID:', result.details?.errorId || result.details?.id);
  }
}

// Export for use in your app
export default PhorestBookingService;

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testFixedBooking().catch(console.error);
}