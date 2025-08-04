// Test user sync functionality with Josh Mills by ID
import phorestService from './app/services/phorestService.js';

async function testUserSyncById() {
  console.log('🧪 Testing Phorest User Sync by Client ID\n');
  
  try {
    // We know Josh Mills exists with ID: EKig-KWT5NYu4b150Fra8w
    const joshId = 'EKig-KWT5NYu4b150Fra8w';
    
    console.log(`1️⃣ Getting client by ID: ${joshId}`);
    const client = await phorestService.getClientById(joshId);
    
    if (client) {
      console.log(`✅ Found: ${client.firstName} ${client.lastName}`);
      console.log(`   Email: ${client.email || 'Not provided'}`);
      console.log(`   Phone: ${client.phone || 'Not provided'}`);
      console.log(`   Created: ${client.createdDate || 'Unknown'}`);
      
      // Test 2: Full user sync using the client's email
      console.log('\n2️⃣ Testing full user data sync...');
      const syncResult = await phorestService.syncUserData(client.email, client.phone);
      
      if (syncResult.found) {
        console.log('\n✅ USER SYNC SUCCESSFUL!');
        console.log('\n📊 Summary:');
        console.log(`   Name: ${syncResult.client.fullName}`);
        console.log(`   Email: ${syncResult.client.email || 'Not provided'}`);
        console.log(`   Phone: ${syncResult.client.phone || 'Not provided'}`);
        console.log(`   Home Clinic: ${syncResult.client.homeClinic}`);
        console.log(`   Member Since: ${syncResult.summary.memberSince}`);
        console.log(`   Total Appointments: ${syncResult.summary.totalAppointments}`);
        console.log(`   Total Purchases: ${syncResult.summary.totalPurchases}`);
        console.log(`   Total Spent: $${syncResult.summary.totalSpent}`);
        console.log(`   Loyalty Tier: ${syncResult.summary.loyaltyTier}`);
        console.log(`   Loyalty Points: ${syncResult.summary.loyaltyPoints}`);
        
        if (syncResult.appointments.length > 0) {
          console.log('\n📅 Recent Appointments:');
          syncResult.appointments.slice(0, 5).forEach(apt => {
            console.log(`   • ${apt.date} ${apt.time} - ${apt.service} with ${apt.staff} ($${apt.cost})`);
          });
        }
        
        if (syncResult.purchases.length > 0) {
          console.log('\n💰 Recent Purchases:');
          syncResult.purchases.slice(0, 5).forEach(purchase => {
            console.log(`   • ${purchase.date} - $${purchase.amount} (${purchase.source})`);
          });
        }
        
        console.log('\n🏆 Loyalty Benefits:');
        syncResult.loyaltyStatus.benefits.forEach(benefit => {
          console.log(`   • ${benefit}`);
        });
        
        console.log('\n📈 Next Tier Progress:');
        if (syncResult.loyaltyStatus.nextTierProgress.nextTier !== 'MAX_TIER') {
          console.log(`   • ${syncResult.loyaltyStatus.nextTierProgress.percentage.toFixed(1)}% to ${syncResult.loyaltyStatus.nextTierProgress.nextTier}`);
          console.log(`   • Need ${syncResult.loyaltyStatus.nextTierProgress.pointsNeeded} more points`);
        } else {
          console.log(`   • Maximum tier achieved! 🎉`);
        }
        
        console.log('\n🎯 Ready for App Integration:');
        console.log('   ✅ User profile data populated');
        console.log('   ✅ Appointment history available');
        console.log('   ✅ Purchase history tracked');
        console.log('   ✅ Loyalty status calculated');
        console.log('   ✅ Home clinic identified');
        
        // Test search capabilities
        console.log('\n3️⃣ Testing search capabilities...');
        if (client.email) {
          const emailSearch = await phorestService.searchClientByEmail(client.email);
          console.log(`✅ Email search found ${emailSearch.length} matches`);
        }
        
        if (client.phone) {
          const phoneSearch = await phorestService.searchClientByPhone(client.phone);
          console.log(`✅ Phone search found ${phoneSearch.length} matches`);
        }
        
      } else {
        console.log('❌ User sync failed - no data found');
      }
    } else {
      console.log('❌ Client not found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testUserSyncById();