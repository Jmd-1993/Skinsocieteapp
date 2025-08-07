#!/usr/bin/env node

/**
 * Test the fixed PhorestService to ensure it works correctly
 */

// Import the fixed service
const phorestService = require('./app/services/phorestService.js').default;

async function testFixedService() {
  console.log('🧪 TESTING FIXED PHOREST SERVICE');
  console.log('================================');
  
  try {
    // Test connection
    console.log('\n1. Testing connection...');
    const connectionSuccess = await phorestService.testConnection();
    
    if (connectionSuccess) {
      console.log('✅ Service connection test passed!');
      
      // Test a simple API call
      console.log('\n2. Testing getBranches()...');
      const branches = await phorestService.getBranches();
      console.log(`✅ Found ${branches.length} branches`);
      branches.forEach(branch => {
        console.log(`   - ${branch.name} (${branch.branchId})`);
      });
      
      // Test services
      if (branches.length > 0) {
        console.log('\n3. Testing getServices()...');
        const services = await phorestService.getServices();
        console.log(`✅ Found ${services.length} services across all branches`);
        
        const onlineServices = services.filter(s => s.internetEnabled);
        console.log(`   - ${onlineServices.length} services available for online booking`);
      }
      
    } else {
      console.error('❌ Service connection test failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Run the test
testFixedService();