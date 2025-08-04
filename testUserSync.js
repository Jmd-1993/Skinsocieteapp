// Test user sync functionality with Josh Mills
import phorestService from './app/services/phorestService.js';

async function testUserSync() {
  console.log('🧪 Testing Phorest User Sync System\n');
  
  try {
    // Test with Josh Mills (we know he exists in the system)
    console.log('Testing with Josh Mills...');
    
    // Test 1: Search by phone number
    console.log('\n1️⃣ Testing phone search: 0406529251');
    const phoneResults = await phorestService.searchClientByPhone('0406529251');
    console.log(`Found ${phoneResults.length} clients by phone`);
    
    if (phoneResults.length > 0) {
      const client = phoneResults[0];
      console.log(`✅ Found: ${client.firstName} ${client.lastName}`);
      console.log(`   Email: ${client.email || 'Not provided'}`);
      console.log(`   Phone: ${client.phone || 'Not provided'}`);
      console.log(`   ID: ${client.clientId}`);
      
      // Test 2: Full user sync
      console.log('\n2️⃣ Testing full user data sync...');
      const syncResult = await phorestService.syncUserData(client.email, '0406529251');
      
      if (syncResult.found) {
        console.log('\n✅ USER SYNC SUCCESSFUL!');
        console.log('\n📊 Summary:');
        console.log(`   Name: ${syncResult.client.fullName}`);
        console.log(`   Email: ${syncResult.client.email}`);
        console.log(`   Phone: ${syncResult.client.phone}`);
        console.log(`   Home Clinic: ${syncResult.client.homeClinic}`);
        console.log(`   Member Since: ${syncResult.summary.memberSince}`);
        console.log(`   Total Appointments: ${syncResult.summary.totalAppointments}`);
        console.log(`   Total Purchases: ${syncResult.summary.totalPurchases}`);
        console.log(`   Total Spent: $${syncResult.summary.totalSpent}`);
        console.log(`   Loyalty Tier: ${syncResult.summary.loyaltyTier}`);
        console.log(`   Loyalty Points: ${syncResult.summary.loyaltyPoints}`);
        
        if (syncResult.appointments.length > 0) {
          console.log('\n📅 Recent Appointments:');
          syncResult.appointments.slice(0, 3).forEach(apt => {
            console.log(`   • ${apt.date} - ${apt.service} with ${apt.staff}`);
          });
        }
        
        if (syncResult.purchases.length > 0) {
          console.log('\n💰 Recent Purchases:');
          syncResult.purchases.slice(0, 3).forEach(purchase => {
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
        
        // Test what this data would look like for app integration
        console.log('\n🔗 App Integration Preview:');
        console.log('   This data would populate:');
        console.log('   ✅ User profile page');
        console.log('   ✅ Appointment history section');
        console.log('   ✅ Purchase history section');
        console.log('   ✅ Loyalty dashboard');
        console.log('   ✅ Personalized recommendations');
        console.log('   ✅ Home clinic preference');
        
      } else {
        console.log('❌ User sync failed - no data found');
      }
    } else {
      console.log('❌ No client found with phone 0406529251');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testUserSync();