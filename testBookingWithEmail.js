// Test the complete booking system with email notifications
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Test configuration
const TEST_CONFIG = {
  apiUrl: 'http://localhost:3000/api/appointments',
  testBooking: {
    clientId: 'EKig-KWT5NYu4b150Fra8w', // Josh Mills
    serviceId: 'test-service-001',
    staffId: 'test-staff-001',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    notes: 'Test booking with email notification',
    // Additional fields for email
    clientName: 'Josh Mills',
    clientEmail: 'josh@skinsociete.com.au', // Update with actual email for testing
    serviceName: 'Hydrating Facial',
    staffName: 'Sarah Johnson',
    duration: 60,
    price: 180,
    clinicName: 'Skin Societé Cottesloe',
    clinicAddress: '123 Marine Parade, Cottesloe, WA 6011',
    clinicPhone: '(08) 9384 1234'
  }
};

async function testBookingWithEmail() {
  console.log('🚀 Testing Booking System with Email Notifications\n');
  console.log('=' .repeat(80));
  
  try {
    // Step 1: Check server is running
    console.log('\n1️⃣ Checking if server is running...');
    try {
      await axios.get('http://localhost:3000');
      console.log('✅ Server is running');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ Server is not running. Please start the server with: npm run dev');
        process.exit(1);
      }
    }
    
    // Step 2: Test booking creation
    console.log('\n2️⃣ Creating test booking with email notification...');
    console.log('Booking details:', JSON.stringify(TEST_CONFIG.testBooking, null, 2));
    
    const response = await axios.post(TEST_CONFIG.apiUrl, TEST_CONFIG.testBooking);
    
    console.log('\n✅ Booking created successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Step 3: Verify email status
    if (response.data.booking?.emailSent) {
      console.log('\n📧 Email notifications queued for sending:');
      console.log('  - Client confirmation email to:', TEST_CONFIG.testBooking.clientEmail);
      console.log('  - Staff notification emails to:', process.env.STAFF_NOTIFICATION_EMAILS || 'Not configured');
      console.log('\nNote: Email delivery depends on SMTP configuration in .env.local');
    } else {
      console.log('\n⚠️ Email notifications were not sent (email may not be configured)');
    }
    
    // Step 4: Provide configuration status
    console.log('\n' + '=' .repeat(80));
    console.log('📊 CONFIGURATION STATUS');
    console.log('=' .repeat(80));
    console.log('Phorest API:', process.env.PHOREST_USERNAME ? '✅ Configured' : '❌ Not configured');
    console.log('Email Service:', (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) ? '✅ Configured' : '❌ Not configured');
    console.log('Firebase Notifications:', process.env.FIREBASE_PROJECT_ID ? '✅ Configured' : '❌ Not configured');
    console.log('Stripe Payments:', process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Not configured');
    
    // Step 5: Provide next steps
    console.log('\n' + '=' .repeat(80));
    console.log('📝 NEXT STEPS');
    console.log('=' .repeat(80));
    console.log('1. Configure email in .env.local:');
    console.log('   - Set EMAIL_USER to your Gmail address');
    console.log('   - Set EMAIL_PASSWORD to your Gmail app-specific password');
    console.log('   - Guide: https://support.google.com/accounts/answer/185833');
    console.log('\n2. Test with real Phorest data:');
    console.log('   - Update clientId with a real Phorest client ID');
    console.log('   - Update serviceId with a real service from testPhorestServices.js');
    console.log('   - Update staffId with a real staff member ID');
    console.log('\n3. Monitor emails:');
    console.log('   - Check the email inbox specified in the test');
    console.log('   - Check server logs for email sending status');
    
    console.log('\n✨ Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.error('\n💡 This usually means:');
      console.error('  - Invalid client, service, or staff ID');
      console.error('  - Time slot not available');
      console.error('  - Missing required fields');
    }
    
    process.exit(1);
  }
}

// Run the test
testBookingWithEmail();