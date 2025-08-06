#!/usr/bin/env node

/**
 * End-to-End Booking Flow Test
 * Tests the complete booking workflow: service selection → availability check → booking
 */

const BASE_URL = 'http://localhost:3000';

async function testBookingFlow() {
  console.log('🧪 Starting End-to-End Booking Flow Test\n');

  try {
    // Test 1: Check availability API
    console.log('1️⃣ Testing Availability API...');
    const availabilityResponse = await fetch(`${BASE_URL}/api/appointments/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: getNextBusinessDay(),
        serviceId: 'hydrating-facial',
        branchId: 'wQbnBjP6ztI8nuVpNT6MsQ',
        duration: 60
      })
    });

    const availabilityResult = await availabilityResponse.json();
    console.log('📊 Availability Response:', {
      success: availabilityResult.success,
      slotsCount: availabilityResult.slots?.length || 0,
      staffCount: availabilityResult.staff?.length || 0,
      mockData: availabilityResult.mockData || false
    });

    if (!availabilityResult.success) {
      throw new Error(`Availability API failed: ${availabilityResult.message}`);
    }

    // Test 2: Find available slot
    const availableSlots = availabilityResult.slots?.filter(slot => slot.available) || [];
    if (availableSlots.length === 0) {
      console.log('⚠️ No available slots found, cannot continue with booking test');
      return;
    }

    const firstSlot = availableSlots[0];
    console.log(`✅ Found ${availableSlots.length} available slots`);
    console.log(`🎯 Testing with slot: ${firstSlot.time} (Staff: ${firstSlot.staffName})`);

    // Test 3: Test booking API
    console.log('\n2️⃣ Testing Booking API...');
    
    // Use Josh Mills client ID for testing
    const testClientId = 'EKig-KWT5NYu4b150Fra8w';
    const selectedDate = getNextBusinessDay();
    const appointmentDateTime = new Date(`${selectedDate}T${firstSlot.time}:00`);
    
    const bookingData = {
      clientId: testClientId,
      serviceId: 'hydrating-facial',
      staffId: firstSlot.staffId,
      startTime: appointmentDateTime.toISOString(),
      notes: 'End-to-end booking flow test'
    };

    console.log('📋 Booking data:', bookingData);

    const bookingResponse = await fetch(`${BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });

    const bookingResult = await bookingResponse.json();
    console.log('📊 Booking Response:', {
      success: bookingResult.success,
      bookingId: bookingResult.booking?.id || bookingResult.booking?.appointmentId,
      error: bookingResult.error,
      message: bookingResult.message
    });

    if (bookingResult.success) {
      console.log('\n✅ End-to-End Test PASSED!');
      console.log('🎉 Complete booking workflow is functional:');
      console.log('   ✅ Service selection');
      console.log('   ✅ Availability checking');
      console.log('   ✅ Time slot selection');  
      console.log('   ✅ Booking creation');
      console.log('   ✅ Phorest API integration');
      
      return true;
    } else {
      console.log('\n❌ End-to-End Test FAILED!');
      console.log('💥 Booking step failed:', bookingResult.message || bookingResult.error);
      
      // Analyze the error
      if (bookingResult.message?.includes('STAFF_NOT_WORKING')) {
        console.log('📝 Issue: Staff availability mismatch between availability check and booking');
        console.log('🔧 Solution: Improve staff availability validation');
      } else if (bookingResult.message?.includes('CLIENT_NOT_FOUND')) {
        console.log('📝 Issue: Test client ID not found in Phorest');
        console.log('🔧 Solution: Update test client ID or create test client');
      } else {
        console.log('📝 Issue: Unexpected booking error');
        console.log('🔧 Solution: Check Phorest API integration and error handling');
      }
      
      return false;
    }

  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Ensure Next.js dev server is running on port 3000');
    console.log('   2. Check Phorest API credentials and connectivity');
    console.log('   3. Verify test client exists in Phorest');
    console.log('   4. Check API route implementations');
    return false;
  }
}

function getNextBusinessDay() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // If tomorrow is Sunday, move to Monday
  if (tomorrow.getDay() === 0) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }
  
  return tomorrow.toISOString().split('T')[0];
}

// Run the test
if (require.main === module) {
  testBookingFlow()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { testBookingFlow };