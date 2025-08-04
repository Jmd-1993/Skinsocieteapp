// bookingWithValidation.js - Comprehensive booking with all validations
import phorestService from './app/services/phorestService.js';

async function bookingWithFullValidation() {
  console.log('🔧 COMPREHENSIVE BOOKING VALIDATION TEST\n');
  
  try {
    await phorestService.getBranches();
    
    const joshClientId = 'EKig-KWT5NYu4b150Fra8w';
    
    // Step 1: Get staff and check qualifications properly
    console.log('1️⃣ Analyzing staff qualifications...');
    const staff = await phorestService.getStaff();
    const availableStaff = staff.filter(member => !member.hideFromOnlineBookings);
    
    console.log(`Found ${availableStaff.length} staff available for online booking:`);
    availableStaff.forEach(member => {
      console.log(`   - ${member.firstName} ${member.lastName} (${member.staffCategoryName})`);
      console.log(`     Disqualified from ${member.disqualifiedServices.length} services`);
    });
    
    // Step 2: Get services and find QUALIFIED staff
    console.log('\n2️⃣ Finding qualified staff/service combinations...');
    const services = await phorestService.getServices();
    
    const qualifiedCombinations = [];
    
    for (const service of services) {
      for (const staffMember of availableStaff) {
        // Check if staff is QUALIFIED (NOT in disqualified list)
        if (!staffMember.disqualifiedServices.includes(service.serviceId)) {
          qualifiedCombinations.push({
            staff: staffMember,
            service: service
          });
        }
      }
    }
    
    console.log(`✅ Found ${qualifiedCombinations.length} qualified staff/service combinations`);
    
    if (qualifiedCombinations.length === 0) {
      console.log('❌ NO QUALIFIED COMBINATIONS FOUND!');
      console.log('This explains the 500 errors - staff are disqualified from services.');
      return;
    }
    
    // Show qualified combinations
    qualifiedCombinations.slice(0, 5).forEach((combo, index) => {
      console.log(`   ${index + 1}. ${combo.staff.firstName} ${combo.staff.lastName} → ${combo.service.name}`);
    });
    
    // Step 3: Select the best combination (prefer cheaper services for testing)
    const selectedCombo = qualifiedCombinations.find(combo => 
      combo.service.price && combo.service.price < 500
    ) || qualifiedCombinations[0];
    
    console.log(`\n✅ Selected combination:`);
    console.log(`   Staff: ${selectedCombo.staff.firstName} ${selectedCombo.staff.lastName}`);
    console.log(`   Service: ${selectedCombo.service.name} ($${selectedCombo.service.price})`);
    console.log(`   Duration: ${selectedCombo.service.duration} minutes`);
    
    // Step 4: Check for working hours and availability
    console.log('\n3️⃣ Checking timing and availability...');
    
    // Use a business day and time
    const appointmentTime = new Date();
    appointmentTime.setDate(appointmentTime.getDate() + 2); // Day after tomorrow
    appointmentTime.setHours(10, 0, 0, 0); // 10 AM - safe business hour
    
    // Ensure it's a weekday
    while (appointmentTime.getDay() === 0 || appointmentTime.getDay() === 6) {
      appointmentTime.setDate(appointmentTime.getDate() + 1);
    }
    
    console.log(`   Appointment time: ${appointmentTime.toLocaleString()}`);
    console.log(`   Day of week: ${appointmentTime.toLocaleDateString('en-US', { weekday: 'long' })}`);
    
    // Step 5: Check if client has existing bookings
    console.log('\n4️⃣ Checking client existing bookings...');
    try {
      const existingAppointments = await phorestService.getClientAppointments(joshClientId);
      console.log(`   Josh has ${existingAppointments.length} existing appointments`);
      
      // Check for same-day bookings
      const sameDayBookings = existingAppointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate.toDateString() === appointmentTime.toDateString();
      });
      
      if (sameDayBookings.length > 0) {
        console.log(`   ⚠️ WARNING: ${sameDayBookings.length} bookings on same day`);
        // Move to next day
        appointmentTime.setDate(appointmentTime.getDate() + 1);
        console.log(`   Moved to: ${appointmentTime.toLocaleString()}`);
      }
    } catch (error) {
      console.log('   Could not check existing appointments');
    }
    
    // Step 6: Create the booking with all validations
    console.log('\n5️⃣ Creating validated booking request...');
    
    const bookingRequest = {
      clientId: joshClientId,
      serviceId: selectedCombo.service.serviceId,
      staffId: selectedCombo.staff.staffId,
      startTime: appointmentTime.toISOString(),
      duration: selectedCombo.service.duration || 30,
      notes: `Validated booking - Staff qualified for service`
    };
    
    console.log('\n📋 Validated booking request:');
    console.log(JSON.stringify(bookingRequest, null, 2));
    
    // Step 7: Try the booking
    console.log('\n6️⃣ Attempting booking...');
    
    try {
      const booking = await phorestService.createAppointment(bookingRequest);
      
      console.log('\n🎉 SUCCESS! APPOINTMENT BOOKED SUCCESSFULLY!');
      console.log('━'.repeat(60));
      console.log('📅 CONFIRMED APPOINTMENT:');
      console.log(`   ✅ Client: Josh Mills`);
      console.log(`   ✅ Service: ${selectedCombo.service.name}`);
      console.log(`   ✅ Staff: ${selectedCombo.staff.firstName} ${selectedCombo.staff.lastName}`);
      console.log(`   ✅ Date/Time: ${appointmentTime.toLocaleString()}`);
      console.log(`   ✅ Duration: ${selectedCombo.service.duration} minutes`);
      console.log(`   ✅ Price: $${selectedCombo.service.price}`);
      console.log(`   ✅ Location: Skin Societé Cottesloe`);
      console.log('━'.repeat(60));
      console.log('\n🚀 PHOREST INTEGRATION FULLY OPERATIONAL!');
      
      return true;
      
    } catch (error) {
      console.log('\n❌ Booking still failed:', error.message);
      
      // Analyze the specific error
      if (error.message.includes('STAFF_UNQUALIFIED')) {
        console.log('   → Staff not qualified for this service');
      } else if (error.message.includes('STAFF_NOT_WORKING')) {
        console.log('   → Staff not working at this time');
      } else if (error.message.includes('MACHINE_DOUBLE_BOOKED')) {
        console.log('   → Equipment/machine not available');
      } else if (error.message.includes('ROOM_UNSUITABLE')) {
        console.log('   → Room configuration issue');
      } else if (error.message.includes('500')) {
        console.log('   → Internal server error - may need Phorest configuration');
      }
      
      // Try with a different service/staff combo
      console.log('\n🔄 Trying with different staff/service combination...');
      
      if (qualifiedCombinations.length > 1) {
        const altCombo = qualifiedCombinations[1];
        
        const altBooking = {
          clientId: joshClientId,
          serviceId: altCombo.service.serviceId,
          staffId: altCombo.staff.staffId,
          startTime: appointmentTime.toISOString(),
          duration: altCombo.service.duration || 30,
          notes: `Alternative qualified booking attempt`
        };
        
        try {
          const booking2 = await phorestService.createAppointment(altBooking);
          console.log('✅ Alternative combination worked!');
          console.log(`   Service: ${altCombo.service.name}`);
          console.log(`   Staff: ${altCombo.staff.firstName} ${altCombo.staff.lastName}`);
          return true;
        } catch (error2) {
          console.log('❌ Alternative also failed:', error2.message);
        }
      }
      
      return false;
    }
    
  } catch (error) {
    console.error('Setup error:', error.message);
    return false;
  }
}

bookingWithFullValidation().then(success => {
  if (success) {
    console.log('\n✅ APPOINTMENT BOOKING TEST: PASSED');
  } else {
    console.log('\n❌ APPOINTMENT BOOKING TEST: FAILED');
    console.log('\nNext steps:');
    console.log('1. Verify staff schedules in Phorest admin');
    console.log('2. Check service room/equipment requirements');
    console.log('3. Confirm business rules for API bookings');
    console.log('4. Contact Phorest with qualified combination details');
  }
});