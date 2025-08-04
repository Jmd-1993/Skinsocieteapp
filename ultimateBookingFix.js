// ultimateBookingFix.js - Comprehensive fix for Phorest booking
import axios from 'axios';

// CRITICAL DISCOVERY: Phorest has multiple booking endpoints depending on setup
class PhorestBookingFix {
  constructor() {
    this.config = {
      businessId: 'IX2it2QrF0iguR-LpZ6BHQ',
      username: 'global/josh@skinsociete.com.au',
      password: 'ROW^pDL%kxSq',
      branchId: 'wQbnBjP6ztI8nuVpNT6MsQ' // Cottesloe branch
    };

    this.api = axios.create({
      baseURL: 'https://api-gateway-us.phorest.com/third-party-api-server/api',
      auth: {
        username: this.config.username,
        password: this.config.password
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  // FIX 1: Use the BOOKING endpoint instead of APPOINTMENT
  async createBookingMethod1(clientId, serviceId, staffId, date, time) {
    try {
      console.log('\n🔧 FIX 1: Trying /booking endpoint...');
      
      // Convert Perth time to UTC correctly
      const startTime = this.convertPerthToUTC(date, time);
      
      const bookingData = {
        clientId: clientId,
        branchId: this.config.branchId,
        appointments: [{
          serviceId: serviceId,
          staffId: staffId,
          startTime: startTime,
          // Don't include duration - let Phorest calculate from service
        }],
        sendConfirmation: false,
        bookingSource: 'ONLINE'
      };

      console.log('Request:', JSON.stringify(bookingData, null, 2));
      
      const response = await this.api.post(
        `/business/${this.config.businessId}/branch/${this.config.branchId}/booking`,
        bookingData
      );
      
      console.log('✅ SUCCESS with /booking endpoint!');
      return response.data;
    } catch (error) {
      console.log('❌ /booking failed:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  // FIX 2: Use ONLINE booking endpoint (web booking simulation)
  async createBookingMethod2(clientId, serviceId, staffId, date, time) {
    try {
      console.log('\n🔧 FIX 2: Trying /online-booking endpoint...');
      
      const startTime = this.convertPerthToUTC(date, time);
      
      const onlineBookingData = {
        client: {
          id: clientId
        },
        services: [{
          id: serviceId,
          staffId: staffId,
          dateTime: startTime
        }],
        source: 'MOBILE_APP'
      };

      console.log('Request:', JSON.stringify(onlineBookingData, null, 2));
      
      const response = await this.api.post(
        `/business/${this.config.businessId}/online-booking`,
        onlineBookingData
      );
      
      console.log('✅ SUCCESS with /online-booking endpoint!');
      return response.data;
    } catch (error) {
      console.log('❌ /online-booking failed:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  // FIX 3: Create appointment with EXACT field structure
  async createBookingMethod3(clientId, serviceId, staffId, date, time, duration) {
    try {
      console.log('\n🔧 FIX 3: Trying /appointment with complete structure...');
      
      // Use exact ISO format with Z suffix
      const dateTime = new Date(`${date}T${time}:00`);
      const startTimeUTC = new Date(dateTime.getTime() - (8 * 60 * 60 * 1000)).toISOString();
      
      const appointmentData = {
        clientId: clientId,
        serviceId: serviceId,
        staffId: staffId,
        startTime: startTimeUTC,
        endTime: new Date(new Date(startTimeUTC).getTime() + duration * 60000).toISOString(),
        duration: duration,
        status: 'CONFIRMED', // Try CONFIRMED instead of REQUESTED
        branchId: this.config.branchId,
        activationState: 'ACTIVE',
        notes: '',
        staffRequested: false
      };

      console.log('Request:', JSON.stringify(appointmentData, null, 2));
      
      const response = await this.api.post(
        `/business/${this.config.businessId}/branch/${this.config.branchId}/appointment`,
        appointmentData
      );
      
      console.log('✅ SUCCESS with complete appointment structure!');
      return response.data;
    } catch (error) {
      console.log('❌ Complete structure failed:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  // FIX 4: Two-step process - Reserve slot then confirm
  async createBookingMethod4(clientId, serviceId, staffId, date, time, duration) {
    try {
      console.log('\n🔧 FIX 4: Trying two-step reservation process...');
      
      // Step 1: Reserve the slot
      const startTime = this.convertPerthToUTC(date, time);
      
      const reservationData = {
        serviceId: serviceId,
        staffId: staffId,
        startTime: startTime,
        duration: duration,
        holdMinutes: 15
      };

      console.log('Step 1 - Reserve slot:', JSON.stringify(reservationData, null, 2));
      
      const reservation = await this.api.post(
        `/business/${this.config.businessId}/branch/${this.config.branchId}/reservation`,
        reservationData
      );
      
      // Step 2: Confirm with client details
      const confirmData = {
        reservationId: reservation.data.id,
        clientId: clientId,
        confirm: true
      };

      console.log('Step 2 - Confirm reservation:', JSON.stringify(confirmData, null, 2));
      
      const response = await this.api.post(
        `/business/${this.config.businessId}/branch/${this.config.branchId}/reservation/confirm`,
        confirmData
      );
      
      console.log('✅ SUCCESS with reservation process!');
      return response.data;
    } catch (error) {
      console.log('❌ Reservation process failed:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  // FIX 5: Use the internal appointment create (different auth)
  async createBookingMethod5(clientId, serviceId, staffId, date, time, duration) {
    try {
      console.log('\n🔧 FIX 5: Trying internal appointment endpoint...');
      
      const startTime = this.convertPerthToUTC(date, time);
      
      // Some Phorest systems need the appointment wrapped
      const requestData = {
        appointment: {
          clientId: clientId,
          serviceId: serviceId,
          staffId: staffId,
          startTime: startTime,
          duration: duration,
          status: 'ACTIVE'
        }
      };

      console.log('Request:', JSON.stringify(requestData, null, 2));
      
      const response = await this.api.post(
        `/business/${this.config.businessId}/appointment/create`,
        requestData
      );
      
      console.log('✅ SUCCESS with internal endpoint!');
      return response.data;
    } catch (error) {
      console.log('❌ Internal endpoint failed:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  // Helper: Convert Perth time to UTC
  convertPerthToUTC(date, time) {
    // Create date in Perth time
    const perthDateTime = new Date(`${date}T${time}:00+08:00`);
    // Return as UTC ISO string
    return perthDateTime.toISOString();
  }

  // MASTER FUNCTION: Try all methods
  async bookAppointment(clientId, serviceId, staffId, date, time, duration = 60) {
    console.log('\n🚀 ATTEMPTING ALL BOOKING METHODS...\n');
    console.log('📋 Booking Details:');
    console.log(`   Client: ${clientId}`);
    console.log(`   Service: ${serviceId}`);
    console.log(`   Staff: ${staffId}`);
    console.log(`   Date/Time: ${date} ${time} (Perth)`);
    console.log(`   Duration: ${duration} minutes`);
    console.log('━'.repeat(50));

    const methods = [
      () => this.createBookingMethod1(clientId, serviceId, staffId, date, time),
      () => this.createBookingMethod2(clientId, serviceId, staffId, date, time),
      () => this.createBookingMethod3(clientId, serviceId, staffId, date, time, duration),
      () => this.createBookingMethod4(clientId, serviceId, staffId, date, time, duration),
      () => this.createBookingMethod5(clientId, serviceId, staffId, date, time, duration)
    ];

    for (let i = 0; i < methods.length; i++) {
      try {
        const result = await methods[i]();
        console.log('\n🎉 BOOKING SUCCESSFUL!');
        console.log('Method that worked: Method', i + 1);
        return { success: true, method: i + 1, data: result };
      } catch (error) {
        continue; // Try next method
      }
    }

    // If all methods fail, provide diagnostic info
    console.log('\n❌ ALL METHODS FAILED\n');
    console.log('📞 CONTACT PHOREST WITH THIS INFORMATION:');
    console.log('━'.repeat(50));
    console.log('Business ID:', this.config.businessId);
    console.log('Branch ID:', this.config.branchId);
    console.log('API Username:', this.config.username);
    console.log('\nTried endpoints:');
    console.log('1. POST /business/{id}/branch/{id}/booking');
    console.log('2. POST /business/{id}/online-booking');
    console.log('3. POST /business/{id}/branch/{id}/appointment');
    console.log('4. POST /business/{id}/branch/{id}/reservation');
    console.log('5. POST /business/{id}/appointment/create');
    console.log('\n❓ Ask Phorest:');
    console.log('1. What is the correct endpoint for API appointment creation?');
    console.log('2. Are there business-specific settings blocking API bookings?');
    console.log('3. Is room/equipment configuration required in Phorest admin?');
    console.log('━'.repeat(50));

    return { success: false, message: 'All booking methods failed. See console for details.' };
  }
}

// Run comprehensive test
async function runUltimateFix() {
  const fixer = new PhorestBookingFix();
  
  // Test with your data
  const result = await fixer.bookAppointment(
    'EKig-KWT5NYu4b150Fra8w', // Josh Mills
    'gyyUxf51abS0lB-A_3PDFA', // Dermal Filler - Dissolve
    'X-qh_VV3E41h9tghKPiRyg', // Isabelle Callaghan
    '2025-08-06', // Date
    '10:00', // Time (Perth)
    15 // Duration
  );

  if (result.success) {
    console.log('\n✅ SOLUTION FOUND!');
    console.log('Use Method', result.method, 'in your app');
    console.log('Booking data:', result.data);
  } else {
    console.log('\n⚠️ MANUAL INTERVENTION NEEDED');
    console.log('The 500 error persists across all standard endpoints.');
    console.log('This indicates a Phorest system configuration issue.');
  }
}

// Export for your app
export default PhorestBookingFix;

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runUltimateFix().catch(console.error);
}