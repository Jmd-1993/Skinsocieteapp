// Debug the booking API to identify issues
const axios = require('axios');

async function debugBookingAPI() {
  console.log('🔍 DEBUGGING BOOKING API');
  console.log('=' .repeat(50));
  
  const testUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Simple GET request to appointments API
    console.log('1. Testing GET /api/appointments...');
    try {
      const getResponse = await axios.get(`${testUrl}/api/appointments`);
      console.log('✅ GET response:', getResponse.status);
    } catch (getError) {
      console.log('❌ GET error:', getError.response?.status, getError.response?.data);
    }
    
    // Test 2: Minimal POST request
    console.log('\n2. Testing minimal POST /api/appointments...');
    try {
      const minimalData = {
        clientId: 'test-client',
        serviceId: 'test-service',
        staffId: 'test-staff',
        startTime: new Date().toISOString()
      };
      
      const postResponse = await axios.post(`${testUrl}/api/appointments`, minimalData);
      console.log('✅ POST response:', postResponse.status, postResponse.data);
    } catch (postError) {
      console.log('❌ POST error:', postError.response?.status);
      console.log('Error details:', postError.response?.data);
    }
    
    // Test 3: Test availability endpoint
    console.log('\n3. Testing POST /api/appointments/availability...');
    try {
      const availabilityData = {
        date: '2025-08-08',
        serviceId: 'test-service',
        branchId: 'test-branch',
        duration: 60
      };
      
      const availResponse = await axios.post(`${testUrl}/api/appointments/availability`, availabilityData);
      console.log('✅ Availability response:', availResponse.status, availResponse.data);
    } catch (availError) {
      console.log('❌ Availability error:', availError.response?.status);
      console.log('Error details:', availError.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugBookingAPI();