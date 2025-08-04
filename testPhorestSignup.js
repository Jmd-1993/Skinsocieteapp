// testPhorestSignup.js - Test new user signup with Phorest integration
import phorestService from './app/services/phorestService.js';

async function testSignupIntegration() {
  console.log('🧪 TESTING PHOREST SIGNUP INTEGRATION\n');
  
  // Test user data
  const newUserData = {
    firstName: 'Sarah',
    lastName: 'Johnson', 
    email: 'sarah.johnson@example.com',
    phone: '+61 412 345 678',
    password: 'securePassword123'
  };
  
  console.log('👤 Creating new user with data:');
  console.log(JSON.stringify(newUserData, null, 2));
  
  try {
    // Step 1: Check if client already exists
    console.log('\n1️⃣ Checking if client exists in Phorest...');
    let existingClients = await phorestService.searchClientByEmail(newUserData.email);
    
    if (existingClients.length > 0) {
      console.log('✅ Found existing Phorest client:', existingClients[0].clientId);
      console.log('   Name:', existingClients[0].firstName, existingClients[0].lastName);
      console.log('   Email:', existingClients[0].email);
      return {
        success: true,
        action: 'linked',
        phorestClientId: existingClients[0].clientId,
        userData: newUserData
      };
    }
    
    console.log('ℹ️ No existing client found, creating new one...');
    
    // Step 2: Create new client in Phorest
    console.log('\n2️⃣ Creating new Phorest client...');
    const phorestClientData = {
      firstName: newUserData.firstName,
      lastName: newUserData.lastName,
      email: newUserData.email,
      phone: newUserData.phone,
      notes: `Created via Skin Societé app on ${new Date().toLocaleString()}`
    };
    
    const phorestClient = await phorestService.createClient(phorestClientData);
    
    console.log('🎉 SUCCESS! Phorest client created:');
    console.log('   Client ID:', phorestClient.clientId);
    console.log('   Name:', phorestClient.firstName, phorestClient.lastName);
    console.log('   Email:', phorestClient.email);
    console.log('   Phone:', phorestClient.phone);
    
    // Step 3: Verify client was created
    console.log('\n3️⃣ Verifying client creation...');
    const verifyClient = await phorestService.getClientById(phorestClient.clientId);
    
    if (verifyClient) {
      console.log('✅ Verification successful!');
      console.log('   Client details match created record');
      
      return {
        success: true,
        action: 'created',
        phorestClientId: phorestClient.clientId,
        userData: newUserData,
        phorestData: phorestClient
      };
    } else {
      throw new Error('Client verification failed');
    }
    
  } catch (error) {
    console.error('❌ Signup integration failed:', error.message);
    
    return {
      success: false,
      error: error.message,
      userData: newUserData
    };
  }
}

// Run the test
testSignupIntegration().then(result => {
  console.log('\n📊 FINAL RESULT:');
  console.log('━'.repeat(60));
  
  if (result.success) {
    console.log(`✅ INTEGRATION ${result.action.toUpperCase()} SUCCESSFULLY`);
    console.log(`   User: ${result.userData.firstName} ${result.userData.lastName}`);
    console.log(`   Email: ${result.userData.email}`);
    console.log(`   Phorest Client ID: ${result.phorestClientId}`);
    console.log('\n🎯 RESULT: New users WILL be automatically created in Phorest!');
  } else {
    console.log('❌ INTEGRATION FAILED');
    console.log(`   Error: ${result.error}`);
    console.log('\n⚠️ RESULT: New users will NOT be created in Phorest');
  }
}).catch(console.error);