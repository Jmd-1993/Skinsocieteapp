#!/usr/bin/env node

/**
 * Booking Implementation Validator
 * Validates that all booking components are properly implemented
 */

const fs = require('fs');
const path = require('path');

function validateBookingImplementation() {
  console.log('🔍 Validating Booking System Implementation\n');

  const results = {
    passed: 0,
    failed: 0,
    issues: []
  };

  // Test 1: Check availability API endpoint exists
  console.log('1️⃣ Checking availability API endpoint...');
  const availabilityApiPath = './app/api/appointments/availability/route.ts';
  if (fs.existsSync(availabilityApiPath)) {
    const content = fs.readFileSync(availabilityApiPath, 'utf8');
    if (content.includes('getStaff') && content.includes('getStaffAvailability')) {
      console.log('✅ Availability API endpoint properly implemented');
      results.passed++;
    } else {
      console.log('⚠️ Availability API missing staff availability logic');
      results.issues.push('Availability API needs staff availability implementation');
      results.failed++;
    }
  } else {
    console.log('❌ Availability API endpoint not found');
    results.issues.push('Missing availability API endpoint');
    results.failed++;
  }

  // Test 2: Check booking API endpoint exists
  console.log('\n2️⃣ Checking booking API endpoint...');
  const bookingApiPath = './app/api/appointments/route.ts';
  if (fs.existsSync(bookingApiPath)) {
    const content = fs.readFileSync(bookingApiPath, 'utf8');
    if (content.includes('createBooking') && content.includes('POST') && content.includes('validation')) {
      console.log('✅ Booking API endpoint properly implemented');
      results.passed++;
    } else {
      console.log('⚠️ Booking API missing proper validation or booking logic');
      results.issues.push('Booking API needs validation improvements');
      results.failed++;
    }
  } else {
    console.log('❌ Booking API endpoint not found');
    results.issues.push('Missing booking API endpoint');
    results.failed++;
  }

  // Test 3: Check PhorestService has required methods
  console.log('\n3️⃣ Checking PhorestService implementation...');
  const phorestServicePath = './app/services/phorestService.js';
  if (fs.existsSync(phorestServicePath)) {
    const content = fs.readFileSync(phorestServicePath, 'utf8');
    const requiredMethods = [
      'getStaff',
      'getStaffAvailability', 
      'createBooking',
      'convertToUTC',
      'parseAvailabilitySlots'
    ];
    
    const missingMethods = requiredMethods.filter(method => !content.includes(method));
    
    if (missingMethods.length === 0) {
      console.log('✅ PhorestService has all required methods');
      results.passed++;
    } else {
      console.log(`⚠️ PhorestService missing methods: ${missingMethods.join(', ')}`);
      results.issues.push(`PhorestService needs: ${missingMethods.join(', ')}`);
      results.failed++;
    }
  } else {
    console.log('❌ PhorestService not found');
    results.issues.push('Missing PhorestService');
    results.failed++;
  }

  // Test 4: Check BookingModal component
  console.log('\n4️⃣ Checking BookingModal component...');
  const bookingModalPath = './app/components/booking/BookingModal.tsx';
  if (fs.existsSync(bookingModalPath)) {
    const content = fs.readFileSync(bookingModalPath, 'utf8');
    const requiredFeatures = [
      'fetchTimeSlots',
      'handleBooking',
      'error handling',
      'availability API call',
      'booking validation'
    ];
    
    const hasFeatures = [
      content.includes('fetchTimeSlots'),
      content.includes('handleBooking'),
      content.includes('setError'),
      content.includes('/api/appointments/availability'),
      content.includes('clientData?.clientId')
    ];
    
    const missingFeatures = requiredFeatures.filter((_, index) => !hasFeatures[index]);
    
    if (missingFeatures.length === 0) {
      console.log('✅ BookingModal has all required features');
      results.passed++;
    } else {
      console.log(`⚠️ BookingModal missing: ${missingFeatures.join(', ')}`);
      results.issues.push(`BookingModal needs: ${missingFeatures.join(', ')}`);
      results.failed++;
    }
  } else {
    console.log('❌ BookingModal component not found');
    results.issues.push('Missing BookingModal component');
    results.failed++;
  }

  // Test 5: Check appointments page integration
  console.log('\n5️⃣ Checking appointments page integration...');
  const appointmentsPagePath = './app/appointments/page.tsx';
  if (fs.existsSync(appointmentsPagePath)) {
    const content = fs.readFileSync(appointmentsPagePath, 'utf8');
    if (content.includes('BookingModal') && content.includes('handleBookNow') && content.includes('phorestService')) {
      console.log('✅ Appointments page properly integrated');
      results.passed++;
    } else {
      console.log('⚠️ Appointments page missing proper integration');
      results.issues.push('Appointments page needs BookingModal integration');
      results.failed++;
    }
  } else {
    console.log('❌ Appointments page not found');
    results.issues.push('Missing appointments page');
    results.failed++;
  }

  // Summary
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📝 Total Score: ${results.passed}/${results.passed + results.failed}`);

  if (results.issues.length > 0) {
    console.log('\n🔧 ISSUES TO ADDRESS:');
    results.issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }

  console.log('\n🎯 BOOKING WORKFLOW STATUS:');
  if (results.failed === 0) {
    console.log('🟢 FULLY IMPLEMENTED - Ready for testing');
    console.log('\nNext steps:');
    console.log('1. Start the Next.js development server');
    console.log('2. Run: node test-booking-flow.js');
    console.log('3. Test the booking flow in the browser');
  } else if (results.passed >= 3) {
    console.log('🟡 MOSTLY IMPLEMENTED - Minor issues to fix');
    console.log('\nPriority fixes needed before testing');
  } else {
    console.log('🔴 MAJOR ISSUES - Significant work needed');
    console.log('\nMust address critical issues before testing');
  }

  return results.failed === 0;
}

// Run validation
if (require.main === module) {
  const success = validateBookingImplementation();
  process.exit(success ? 0 : 1);
}

module.exports = { validateBookingImplementation };