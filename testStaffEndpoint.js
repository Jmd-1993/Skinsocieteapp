// testStaffEndpoint.js - Test staff endpoint thoroughly
import phorestService from './app/services/phorestService.js';

async function testStaffEndpointThoroughly() {
  console.log('👥 Testing Staff Endpoint Thoroughly\n');
  
  try {
    await phorestService.getBranches();
    console.log(`Using branch: ${phorestService.branchId} (Cottesloe)`);
    console.log(`Business ID: ${phorestService.config.businessId}`);
    console.log(`Base URL: ${phorestService.config.baseURL}`);
    
    // Test 1: Basic staff call
    console.log('\n1️⃣ Testing basic staff endpoint...');
    try {
      const staff = await phorestService.getStaff();
      console.log(`✅ SUCCESS: Found ${staff.length} staff members`);
      
      if (staff.length > 0) {
        staff.forEach(member => {
          console.log(`   - ${member.firstName} ${member.lastName}`);
          console.log(`     ID: ${member.staffId}`);
          console.log(`     Email: ${member.email || 'No email'}`);
          console.log(`     Active: ${member.active !== false ? 'Yes' : 'No'}`);
          console.log(`     Services: ${member.services?.length || 0} assigned`);
        });
      } else {
        console.log('   No staff members returned');
      }
    } catch (error) {
      console.log(`❌ Basic staff call failed: ${error.message}`);
    }
    
    // Test 2: Manual API call with different parameters
    console.log('\n2️⃣ Testing staff endpoint with parameters...');
    
    const testParams = [
      { name: 'Include all staff', params: {} },
      { name: 'Include archived', params: { includeArchived: true } },
      { name: 'Active only', params: { active: true } },
      { name: 'With pagination', params: { size: 50, page: 0 } }
    ];
    
    for (const test of testParams) {
      console.log(`\n   Testing: ${test.name}`);
      try {
        const response = await phorestService.api.get(
          `/${phorestService.config.businessId}/branch/${phorestService.branchId}/staff`,
          { params: test.params }
        );
        
        const staff = response.data._embedded?.staff || response.data || [];
        console.log(`   ✅ ${test.name}: Found ${Array.isArray(staff) ? staff.length : 'non-array'} staff`);
        
        if (Array.isArray(staff) && staff.length > 0) {
          console.log(`   First staff member: ${staff[0].firstName} ${staff[0].lastName}`);
          console.log(`   Response structure:`, Object.keys(response.data));
        }
      } catch (error) {
        console.log(`   ❌ ${test.name} failed: ${error.message}`);
      }
    }
    
    // Test 3: Test all branches for staff
    console.log('\n3️⃣ Testing staff across all branches...');
    const branches = await phorestService.getBranches();
    
    for (const branch of branches) {
      console.log(`\n   Branch: ${branch.name} (${branch.branchId})`);
      try {
        const response = await phorestService.api.get(
          `/${phorestService.config.businessId}/branch/${branch.branchId}/staff`
        );
        
        const staff = response.data._embedded?.staff || response.data || [];
        console.log(`   ✅ Staff count: ${Array.isArray(staff) ? staff.length : 'N/A'}`);
        
        if (Array.isArray(staff) && staff.length > 0) {
          staff.slice(0, 3).forEach(member => {
            console.log(`      - ${member.firstName} ${member.lastName} (${member.staffId})`);
          });
        }
      } catch (error) {
        console.log(`   ❌ Branch ${branch.name} failed: ${error.message}`);
      }
    }
    
    // Test 4: Check raw response structure
    console.log('\n4️⃣ Checking raw response structure...');
    try {
      const response = await phorestService.api.get(
        `/${phorestService.config.businessId}/branch/${phorestService.branchId}/staff`
      );
      
      console.log('Raw response keys:', Object.keys(response.data));
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('Raw response failed:', error.message);
    }
    
    // Test 5: Try the availability endpoint to see if staff show up there
    console.log('\n5️⃣ Testing availability endpoint for staff...');
    const services = await phorestService.getServices();
    if (services.length > 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      
      try {
        const availability = await phorestService.checkAvailability(dateStr, services[0].serviceId);
        console.log('Availability response:', JSON.stringify(availability, null, 2));
      } catch (error) {
        console.log('Availability check failed:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Setup error:', error.message);
  }
}

testStaffEndpointThoroughly();