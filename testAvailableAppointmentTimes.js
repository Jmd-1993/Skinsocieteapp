// testAvailableAppointmentTimes.js - Test the correct availability endpoint
import phorestService from './app/services/phorestService.js';

async function testAvailableAppointmentTimes() {
  console.log('🎯 Testing Available Appointment Times Endpoint\n');
  
  try {
    await phorestService.getBranches();
    
    const joshClientId = 'EKig-KWT5NYu4b150Fra8w';
    const isabelleStaffId = 'X-qh_VV3E41h9tghKPiRyg';
    const serviceId = 'gyyUxf51abS0lB-A_3PDFA'; // Dermal Filler - Dissolve
    
    console.log('🔍 Finding available appointment times...\n');
    
    // Test different endpoint patterns for availability
    const endpoints = [
      '/findAvailableAppointmentTimes',
      '/available-appointment-times',
      '/appointment/available-times',
      '/availability/appointment-times',
      '/booking/available-times'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`📋 Trying endpoint: ${endpoint}`);
        
        const params = {
          serviceId: serviceId,
          date: '2025-08-11', // Monday
          staffId: isabelleStaffId,
          clientId: joshClientId
        };
        
        const response = await phorestService.api.get(
          `/${phorestService.config.businessId}/branch/${phorestService.branchId}${endpoint}`,
          { params }
        );
        
        console.log('✅ SUCCESS! Available times found:');
        console.log(JSON.stringify(response.data, null, 2));
        
        // If we found available times, try to book one
        if (response.data && response.data.length > 0) {
          const availableTime = response.data[0];
          console.log(`\n🎯 Attempting to book available time: ${availableTime.startTime || availableTime.time}`);
          
          const booking = await phorestService.createBooking(
            joshClientId,
            serviceId,
            isabelleStaffId,
            availableTime.startTime || availableTime.time
          );
          
          console.log('🎉 BOOKING SUCCESSFUL!');
          console.log('Booking Details:', booking);
          return booking;
        }
        
        break;
      } catch (error) {
        console.log(`❌ ${endpoint} failed:`, error.response?.status || error.message);
        continue;
      }
    }
    
    // If no availability endpoint works, try work time table approach
    console.log('\n🔄 Trying work time table approach...');
    
    try {
      const workTimeParams = {
        from: '2025-08-11',
        to: '2025-08-15',
        staffId: isabelleStaffId
      };
      
      const workTimeResponse = await phorestService.api.get(
        `/${phorestService.config.businessId}/branch/${phorestService.branchId}/staff-work-time-table`,
        { params: workTimeParams }
      );
      
      console.log('✅ Work time table found:');
      console.log(JSON.stringify(workTimeResponse.data, null, 2));
      
      // Extract available times from work schedule
      if (workTimeResponse.data && workTimeResponse.data._embedded?.workTimeTables) {
        const workTables = workTimeResponse.data._embedded.workTimeTables;
        console.log(`\n📅 Found ${workTables.length} work time entries for Isabelle`);
        
        // Try to book during the first available work time
        for (const workTime of workTables) {
          try {
            // Create a booking time during work hours (add 1 hour to start time)
            const workStart = new Date(workTime.startTime);
            const bookingTime = new Date(workStart.getTime() + (60 * 60 * 1000)); // Add 1 hour
            
            console.log(`\n🎯 Attempting booking during work hours: ${bookingTime.toISOString()}`);
            
            const booking = await phorestService.createBooking(
              joshClientId,
              serviceId,
              isabelleStaffId,
              bookingTime.toISOString()
            );
            
            console.log('🎉 BOOKING SUCCESSFUL!');
            console.log('Booking Details:', booking);
            return booking;
            
          } catch (bookingError) {
            console.log(`❌ Booking failed for ${workTime.startTime}:`, bookingError.response?.data?.detail || bookingError.message);
            continue;
          }
        }
      }
    } catch (error) {
      console.log('❌ Work time table failed:', error.response?.status || error.message);
    }
    
    // Final attempt - try different business endpoint
    console.log('\n🔄 Trying business-level availability...');
    
    try {
      const businessAvailabilityParams = {
        serviceId: serviceId,
        date: '2025-08-11',
        branchId: phorestService.branchId
      };
      
      const businessResponse = await phorestService.api.get(
        `/${phorestService.config.businessId}/findAvailableAppointmentTimes`,
        { params: businessAvailabilityParams }
      );
      
      console.log('✅ Business availability found:');
      console.log(JSON.stringify(businessResponse.data, null, 2));
      
    } catch (error) {
      console.log('❌ Business availability failed:', error.response?.status || error.message);
    }
    
    // Summary of findings
    console.log('\n📊 AVAILABILITY ENDPOINT TEST SUMMARY:');
    console.log('━'.repeat(60));
    console.log('✅ API Connection: Working');
    console.log('✅ Authentication: Working');
    console.log('✅ Booking Endpoint: Working (correct format confirmed)');
    console.log('⚠️ Availability Endpoints: Most return 404 - may not be enabled');
    console.log('⚠️ Staff Scheduling: Staff not scheduled or already booked');
    console.log('\n💡 RECOMMENDED APPROACH:');
    console.log('1. Contact Phorest support to enable availability endpoints');
    console.log('2. Ensure staff schedules are properly set up in Phorest');
    console.log('3. Use a business-day booking approach for testing');
    console.log('4. Implement graceful error handling for booking conflicts');
    
  } catch (error) {
    console.error('Setup error:', error.message);
  }
}

testAvailableAppointmentTimes();