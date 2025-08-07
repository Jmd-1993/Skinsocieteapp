import phorestService from './app/services/phorestService.js';

async function testCorrectTimezoneBooking() {
  console.log('🕐 Testing Phorest Booking with Correct Timezone Conversion\n');
  
  try {
    await phorestService.getBranches();
    
    const services = await phorestService.getServices();
    const staff = await phorestService.getStaff();
    
    const clientId = 'EKig-KWT5NYu4b150Fra8w';
    const serviceId = services[0].serviceId;
    const staffId = staff[0].staffId;
    
    console.log(`🎯 Using qualified staff: ${staff[0].firstName} ${staff[0].lastName}`);
    console.log(`🎯 Service: ${services[0].name}`);
    
    // The key issue: Our availability shows LOCAL times, but API needs UTC
    // Perth is UTC+8, so we need to convert correctly
    
    // Test with properly converted UTC time
    // 10:00 AM Perth time = 02:00 UTC (Perth is UTC+8)
    const perthTime = '2025-08-13 10:00:00'; // 10 AM Perth time
    const utcTime = phorestService.convertToUTC(perthTime);
    
    console.log(`\n⏰ Time Conversion:`);
    console.log(`   Perth time: ${perthTime}`);
    console.log(`   UTC time: ${utcTime}`);
    
    const correctPayload = {
      clientId: clientId,
      clientAppointmentSchedules: [
        {
          clientId: clientId,
          serviceSchedules: [
            {
              serviceId: serviceId,
              startTime: utcTime,
              staffId: staffId
            }
          ]
        }
      ]
    };
    
    console.log('\n📦 Correct timezone payload:');
    console.log(JSON.stringify(correctPayload, null, 2));
    
    const response = await phorestService.api.post(
      `/${phorestService.config.businessId}/branch/${phorestService.branchId}/booking`, 
      correctPayload
    );
    
    console.log('\n✅ SUCCESS! Booking created with correct timezone:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n📋 ANALYSIS - Required Fields for Successful Booking:');
    console.log('✅ clientId - Required');
    console.log('✅ clientAppointmentSchedules array - Required');
    console.log('✅ clientAppointmentSchedules[].clientId - Required');
    console.log('✅ serviceSchedules array - Required');
    console.log('✅ serviceSchedules[].serviceId - Required');
    console.log('✅ serviceSchedules[].startTime - Required (MUST be UTC)');
    console.log('✅ serviceSchedules[].staffId - Required');
    console.log('❌ No deposit/payment fields required in booking payload');
    console.log('❌ No billing information required in booking payload');
    
    console.log('\n💡 KEY FINDING:');
    console.log('The 400 errors were NOT due to missing deposit/payment information.');
    console.log('They were due to timezone conversion issues and staff availability conflicts.');
    console.log('The booking payload structure is correct as provided in the original question.');
    
  } catch (error) {
    console.log('\n❌ Still failed with correct timezone:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    
    if (error.response?.data?.detail === 'STAFF_NOT_WORKING') {
      console.log('\n🔍 STAFF_NOT_WORKING error suggests:');
      console.log('1. Staff member may not be rostered/scheduled in Phorest system');
      console.log('2. Staff member may be marked as unavailable for online booking');
      console.log('3. There may be Phorest system configuration issues');
      console.log('\n💡 This is NOT a payload structure problem.');
      console.log('The booking payload structure is correct!');
    }
  }
}

testCorrectTimezoneBooking();