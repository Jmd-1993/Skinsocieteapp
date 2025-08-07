const axios = require('axios');

async function testAPIDirectly() {
  console.log('🔧 Direct API Test - Phorest Availability Endpoint');
  console.log('==================================================\n');
  
  const testCases = [
    {
      name: 'Local Development Server',
      baseURL: 'http://localhost:3000',
      testLive: false
    },
    {
      name: 'Production Render Deployment',
      baseURL: 'https://skinsocieteapp.onrender.com',
      testLive: true
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n=== Testing ${testCase.name} ===`);
    
    try {
      const payload = {
        date: '2025-08-10', // This Sunday should be closed
        serviceId: 'dermal-filler',
        branchId: 'wQbnBjP6ztI8nuVpNT6MsQ', // Cottesloe branch
        duration: 60
      };
      
      console.log('📡 Making API request...');
      console.log('Payload:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post(
        `${testCase.baseURL}/api/appointments/availability`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      console.log(`✅ Response Status: ${response.status}`);
      console.log(`📊 Response Data:`, JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        const slots = response.data.slots || [];
        const availableSlots = slots.filter(s => s.available);
        console.log(`⏰ Total Slots: ${slots.length}`);
        console.log(`✅ Available Slots: ${availableSlots.length}`);
        console.log(`👥 Staff Count: ${response.data.staff?.length || 0}`);
        
        if (availableSlots.length > 0) {
          console.log('🎉 SUCCESS: Availability API working!');
          console.log('Sample slots:', availableSlots.slice(0, 3));
        } else {
          console.log('⚠️ No available slots returned (might be Sunday or outside hours)');
        }
      } else {
        console.log('❌ API returned success: false');
        console.log('Error:', response.data.error);
      }
      
    } catch (error) {
      console.error(`❌ ${testCase.name} API Test Failed:`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data:`, error.response.data);
      } else if (error.code === 'ECONNREFUSED') {
        console.error('Connection refused - server not running');
        if (!testCase.testLive) {
          console.error('💡 Start local server: npm run dev');
        }
      } else {
        console.error('Error:', error.message);
      }
    }
  }
  
  // Test with Monday (business day)
  console.log('\n=== Testing Monday Business Day ===');
  try {
    const mondayPayload = {
      date: '2025-08-11', // Monday
      serviceId: 'hydrating-facial',
      branchId: 'wQbnBjP6ztI8nuVpNT6MsQ',
      duration: 60
    };
    
    console.log('📡 Testing Monday availability...');
    const response = await axios.post(
      'http://localhost:3000/api/appointments/availability',
      mondayPayload,
      { timeout: 10000 }
    );
    
    if (response.data.success) {
      const availableSlots = response.data.slots?.filter(s => s.available) || [];
      console.log(`✅ Monday slots available: ${availableSlots.length}`);
      if (availableSlots.length > 0) {
        console.log('🎯 PERFECT: Business day availability working!');
      }
    }
  } catch (error) {
    console.error('❌ Monday test failed:', error.message);
  }
  
  console.log('\n📋 Test Summary:');
  console.log('- API endpoint should return appointment slots');
  console.log('- Sunday should have fewer/no slots (clinic closed)');
  console.log('- Monday should have many available slots');
  console.log('- Staff information should be populated');
}

// Run the test
testAPIDirectly().catch(console.error);