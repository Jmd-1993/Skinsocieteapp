// testWithStaffAssignment.js - Test booking with different staff scenarios
import phorestService from './app/services/phorestService.js';

async function testStaffRequirements() {
  console.log('👥 Testing Staff Assignment Requirements for Booking\n');
  
  try {
    await phorestService.getBranches();
    
    const joshClientId = 'EKig-KWT5NYu4b150Fra8w';
    const services = await phorestService.getServices();
    const selectedService = services[0];
    
    // Check staff situation
    console.log('🔍 Checking staff availability...');
    const staff = await phorestService.getStaff();
    console.log(`Found ${staff.length} staff members`);
    
    if (staff.length === 0) {
      console.log('⚠️  NO STAFF MEMBERS FOUND!');
      console.log('This might be the issue - many booking systems require staff assignment.');
      console.log('\nPossible solutions:');
      console.log('1. Add staff members in Phorest admin panel');
      console.log('2. Check if staff are assigned to this branch');
      console.log('3. Verify staff have permissions for this service');
      
      // Try booking without staff anyway
      console.log('\n🧪 Testing booking without staff assignment...');
      const appointmentTime = new Date();
      appointmentTime.setDate(appointmentTime.getDate() + 2);
      appointmentTime.setHours(14, 0, 0, 0);
      
      const bookingWithoutStaff = {
        clientId: joshClientId,
        serviceId: selectedService.serviceId,
        startTime: appointmentTime.toISOString(),
        duration: selectedService.duration || 60,
        notes: 'Test booking without staff assignment'
      };
      
      try {
        const result = await phorestService.createAppointment(bookingWithoutStaff);
        console.log('✅ SUCCESS! Booking works without staff assignment');
        console.log('Booking result:', result);
      } catch (error) {
        console.log('❌ Failed without staff:', error.message);
        
        if (error.message.includes('500')) {
          console.log('\n💡 The 500 error suggests other issues:');
          console.log('1. Service may not be available for online booking');
          console.log('2. Branch operating hours restrictions');
          console.log('3. Minimum advance booking requirements');
          console.log('4. Service requires specific setup/permissions');
        }
      }
    } else {
      console.log('Staff members found:');
      staff.forEach(member => {
        console.log(`  - ${member.firstName} ${member.lastName} (ID: ${member.staffId})`);
      });
      
      // Try booking with staff assignment
      console.log('\n🧪 Testing booking WITH staff assignment...');
      const appointmentTime = new Date();
      appointmentTime.setDate(appointmentTime.getDate() + 2);
      appointmentTime.setHours(14, 0, 0, 0);
      
      const bookingWithStaff = {
        clientId: joshClientId,
        serviceId: selectedService.serviceId,
        staffId: staff[0].staffId,
        startTime: appointmentTime.toISOString(),
        duration: selectedService.duration || 60,
        notes: 'Test booking with staff assignment'
      };
      
      try {
        const result = await phorestService.createAppointment(bookingWithStaff);
        console.log('✅ SUCCESS! Booking works with staff assignment');
        console.log('Booking result:', result);
      } catch (error) {
        console.log('❌ Failed with staff:', error.message);
      }
    }
    
    // Additional diagnostic tests
    console.log('\n🔧 Additional Diagnostics...');
    
    // Test 1: Check if service has specific requirements
    console.log('\n1️⃣ Service Analysis:');
    console.log(`  Service: ${selectedService.name}`);
    console.log(`  Price: $${selectedService.price}`);
    console.log(`  Duration: ${selectedService.duration} minutes`);
    console.log(`  Service ID: ${selectedService.serviceId}`);
    
    // Test 2: Check business hours by trying different times
    console.log('\n2️⃣ Testing different appointment times:');
    
    const testTimes = [
      { hour: 9, name: '9 AM (Early)' },
      { hour: 10, name: '10 AM (Standard)' },
      { hour: 14, name: '2 PM (Afternoon)' },
      { hour: 16, name: '4 PM (Late afternoon)' }
    ];
    
    for (const timeTest of testTimes) {
      const testTime = new Date();
      testTime.setDate(testTime.getDate() + 3); // 3 days ahead
      testTime.setHours(timeTest.hour, 0, 0, 0);
      
      // Skip weekends
      if (testTime.getDay() === 0) testTime.setDate(testTime.getDate() + 1);
      if (testTime.getDay() === 6) testTime.setDate(testTime.getDate() + 2);
      
      console.log(`  Testing ${timeTest.name}: ${testTime.toLocaleString()}`);
      
      const timeTestBooking = {
        clientId: joshClientId,
        serviceId: selectedService.serviceId,
        startTime: testTime.toISOString(),
        duration: selectedService.duration || 60
      };
      
      try {
        const result = await phorestService.createAppointment(timeTestBooking);
        console.log(`    ✅ ${timeTest.name} works!`);
        console.log(`    Booking ID: ${result.appointmentId || result.id}`);
        break; // Stop on first success
      } catch (error) {
        console.log(`    ❌ ${timeTest.name} failed: ${error.message.substring(0, 50)}...`);
      }
    }
    
    console.log('\n📋 Summary of Issues:');
    console.log('1. Staff assignment may be required');
    console.log('2. Service configuration in Phorest may restrict API booking');
    console.log('3. Business rules (hours, advance booking) may apply');
    console.log('4. The API has full access but internal validation is failing');
    
    console.log('\n💡 Recommended Actions:');
    console.log('1. Add staff members to the Cottesloe branch in Phorest admin');
    console.log('2. Check service settings - ensure it\'s available for online booking');
    console.log('3. Verify branch operating hours and booking rules');
    console.log('4. Contact Phorest support with these specific error details');
    
  } catch (error) {
    console.error('Setup error:', error.message);
  }
}

testStaffRequirements();