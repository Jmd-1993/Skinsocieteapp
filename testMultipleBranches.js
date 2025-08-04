// testMultipleBranches.js - Test booking across all branches
import axios from 'axios';

class MultiBranchBookingTest {
  constructor() {
    this.config = {
      businessId: 'IX2it2QrF0iguR-LpZ6BHQ',
      username: 'global/josh@skinsociete.com.au',
      password: 'ROW^pDL%kxSq'
    };

    this.api = axios.create({
      baseURL: 'https://api-gateway-us.phorest.com/third-party-api-server/api',
      auth: {
        username: this.config.username,
        password: this.config.password
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // All Skin Societé branches
    this.branches = [
      { id: 'wQbnBjP6ztI8nuVpNT6MsQ', name: 'Skin Societé Cottesloe' },
      { id: '2sHZitUd3WRgiOmCX-Mb7w', name: 'Skin Societé Ellenbrook' },
      { id: 'x-aZrXH_rReI5Pky88pzuA', name: 'Skin Societé Karrinyup' },
      { id: 'Kr08rOfh9fLZ4bhw9uEqPQ', name: 'Skin Societé Osborne Park' },
      { id: 'Pk_S44S6jDxyeS6fcEXwDw', name: 'Skin Societé Rockingham' }
    ];
  }

  // Get staff for a specific branch
  async getBranchStaff(branchId) {
    try {
      const response = await this.api.get(
        `/business/${this.config.businessId}/branch/${branchId}/staff`
      );
      return response.data._embedded?.staffs || [];
    } catch (error) {
      console.log(`   ❌ Could not get staff for branch ${branchId}`);
      return [];
    }
  }

  // Get services for a specific branch
  async getBranchServices(branchId) {
    try {
      const response = await this.api.get(
        `/business/${this.config.businessId}/branch/${branchId}/service`
      );
      return response.data._embedded?.services || [];
    } catch (error) {
      console.log(`   ❌ Could not get services for branch ${branchId}`);
      return [];
    }
  }

  // Find qualified staff/service combination for a branch
  async findQualifiedCombination(branchId) {
    const staff = await this.getBranchStaff(branchId);
    const services = await this.getBranchServices(branchId);
    
    // Filter to staff available for online booking
    const availableStaff = staff.filter(s => !s.hideFromOnlineBookings);
    
    // Find a qualified combination
    for (const staffMember of availableStaff) {
      for (const service of services) {
        // Check if staff is qualified (not in disqualified list)
        if (!staffMember.disqualifiedServices?.includes(service.serviceId)) {
          return {
            staff: staffMember,
            service: service,
            qualified: true
          };
        }
      }
    }
    
    // If no qualified combination, just return first available
    if (availableStaff.length > 0 && services.length > 0) {
      return {
        staff: availableStaff[0],
        service: services[0],
        qualified: false
      };
    }
    
    return null;
  }

  // Test booking at a specific branch
  async testBranchBooking(branchId, branchName, clientId) {
    console.log(`\n🏢 TESTING: ${branchName}`);
    console.log(`   Branch ID: ${branchId}`);
    console.log('   ' + '─'.repeat(50));

    try {
      // Step 1: Find qualified staff/service combination
      console.log('   1️⃣ Finding qualified staff/service...');
      const combination = await this.findQualifiedCombination(branchId);
      
      if (!combination) {
        console.log('   ❌ No staff/service combinations available');
        return { success: false, reason: 'No staff/service available' };
      }

      console.log(`   ✅ Staff: ${combination.staff.firstName} ${combination.staff.lastName}`);
      console.log(`   ✅ Service: ${combination.service.name} ($${combination.service.price})`);
      console.log(`   ✅ Qualified: ${combination.qualified ? 'Yes' : 'Testing anyway'}`);

      // Step 2: Create booking request
      console.log('   2️⃣ Creating booking request...');
      
      const appointmentTime = new Date('2025-08-07T10:00:00+08:00'); // Perth time
      const startTimeUTC = appointmentTime.toISOString();

      const bookingData = {
        clientId: clientId,
        branchId: branchId,
        appointments: [{
          serviceId: combination.service.serviceId,
          staffId: combination.staff.staffId,
          startTime: startTimeUTC
        }],
        sendConfirmation: false,
        bookingSource: 'ONLINE'
      };

      console.log('   📤 Request:', JSON.stringify(bookingData, null, 6));

      // Step 3: Attempt booking
      console.log('   3️⃣ Attempting booking...');
      
      const response = await this.api.post(
        `/business/${this.config.businessId}/branch/${branchId}/booking`,
        bookingData
      );

      console.log('   🎉 SUCCESS! Booking created!');
      console.log('   📅 Appointment ID:', response.data.appointmentId || response.data.id);
      console.log('   📅 Status:', response.data.status);
      
      return { 
        success: true, 
        branch: branchName,
        staff: combination.staff.firstName + ' ' + combination.staff.lastName,
        service: combination.service.name,
        appointmentData: response.data
      };

    } catch (error) {
      console.log('   ❌ Booking failed:', error.response?.status, error.response?.data?.detail || error.message);
      
      return { 
        success: false, 
        branch: branchName,
        error: error.response?.status,
        message: error.response?.data?.detail || error.message
      };
    }
  }

  // Test all branches
  async testAllBranches(clientId = 'EKig-KWT5NYu4b150Fra8w') {
    console.log('🚀 TESTING BOOKING ACROSS ALL SKIN SOCIETÉ BRANCHES');
    console.log('━'.repeat(60));
    console.log(`📋 Client: Josh Mills (${clientId})`);
    console.log(`📅 Date: August 7, 2025 10:00 AM Perth time`);
    console.log('━'.repeat(60));

    const results = [];
    
    for (const branch of this.branches) {
      const result = await this.testBranchBooking(branch.id, branch.name, clientId);
      results.push(result);
      
      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    console.log('\n📊 MULTI-BRANCH TEST RESULTS');
    console.log('━'.repeat(60));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful bookings: ${successful.length}`);
    console.log(`❌ Failed bookings: ${failed.length}`);
    
    if (successful.length > 0) {
      console.log('\n🎉 SUCCESS BRANCHES:');
      successful.forEach(result => {
        console.log(`   ✅ ${result.branch}`);
        console.log(`      Staff: ${result.staff}`);
        console.log(`      Service: ${result.service}`);
        console.log(`      ID: ${result.appointmentData?.appointmentId || result.appointmentData?.id}`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ FAILED BRANCHES:');
      failed.forEach(result => {
        console.log(`   ❌ ${result.branch}`);
        console.log(`      Error: ${result.error} - ${result.message}`);
      });
    }

    // Analysis
    console.log('\n🔍 ANALYSIS:');
    if (successful.length > 0) {
      console.log('✅ SOLUTION FOUND! Some branches allow API bookings.');
      console.log('✅ The issue is branch-specific configuration.');
      console.log('✅ Working branches can be used immediately.');
      console.log('💡 Configure failed branches in Phorest admin to match working ones.');
    } else {
      console.log('❌ All branches failed - this is a business-wide configuration issue.');
      console.log('💡 Contact Phorest to enable API booking permissions globally.');
    }
    
    return results;
  }
}

// Run the test
async function runMultiBranchTest() {
  const tester = new MultiBranchBookingTest();
  
  const results = await tester.testAllBranches();
  
  console.log('\n📞 FOR PHOREST SUPPORT:');
  console.log('━'.repeat(60));
  console.log('Business ID: IX2it2QrF0iguR-LpZ6BHQ');
  console.log('API Username: global/josh@skinsociete.com.au');
  console.log('Test performed on all 5 branches simultaneously');
  console.log('Client ID used: EKig-KWT5NYu4b150Fra8w (Josh Mills)');
  
  const successfulBranches = results.filter(r => r.success);
  const failedBranches = results.filter(r => !r.success);
  
  if (successfulBranches.length > 0) {
    console.log('\n✅ WORKING BRANCHES (use these settings for all):');
    successfulBranches.forEach(branch => {
      console.log(`   - ${branch.branch}`);
    });
  }
  
  if (failedBranches.length > 0) {
    console.log('\n❌ FAILED BRANCHES (need configuration):');
    failedBranches.forEach(branch => {
      console.log(`   - ${branch.branch}: ${branch.message}`);
    });
  }
}

// Export for use
export default MultiBranchBookingTest;

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMultiBranchTest().catch(console.error);
}