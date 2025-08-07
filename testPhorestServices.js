// Test what services are available in Phorest for both branches
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const PHOREST_CONFIG = {
  username: process.env.PHOREST_USERNAME,
  password: process.env.PHOREST_PASSWORD,
  branches: {
    COTTESLOE: process.env.PHOREST_BRANCH_ID_COTTESLOE || 'Z_nUKK_6R-GhRsGmJZgQ2g',
    KARRINYUP: process.env.PHOREST_BRANCH_ID_KARRINYUP || 'NP1hf5xJTfGLMO5t6VrBxA'
  }
};

async function getAuthToken() {
  try {
    const response = await axios.post(
      'https://api-gateway-au.phorest.com/third-party-api-server/api/business/v1/login',
      {
        username: PHOREST_CONFIG.username,
        password: PHOREST_CONFIG.password
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error.response?.data || error.message);
    throw error;
  }
}

async function fetchServices(branchId, branchName) {
  try {
    const token = await getAuthToken();
    
    console.log(`\n📍 ${branchName} - Fetching services for branch: ${branchId}`);
    
    const response = await axios.get(
      `https://api-gateway-au.phorest.com/third-party-api-server/api/business/v1/branches/${branchId}/services`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const services = response.data._embedded?.services || [];
    
    console.log(`✅ Found ${services.length} services for ${branchName}:`);
    console.log('=' .repeat(80));
    
    services.forEach((service, index) => {
      console.log(`\n${index + 1}. ${service.name}`);
      console.log(`   ID: ${service.serviceId}`);
      console.log(`   Category: ${service.categoryName || 'N/A'}`);
      console.log(`   Duration: ${service.duration} minutes`);
      console.log(`   Price: $${service.price}`);
      console.log(`   Active: ${service.active}`);
      if (service.description) {
        console.log(`   Description: ${service.description.substring(0, 100)}...`);
      }
    });

    return services;
  } catch (error) {
    console.error(`Error fetching services for ${branchName}:`, error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('🔧 Testing Phorest Services API');
  console.log('Configuration:', {
    username: PHOREST_CONFIG.username ? '✓ Set' : '✗ Missing',
    password: PHOREST_CONFIG.password ? '✓ Set' : '✗ Missing',
    cottesloeBranch: PHOREST_CONFIG.branches.COTTESLOE,
    karrinyupBranch: PHOREST_CONFIG.branches.KARRINYUP
  });

  if (!PHOREST_CONFIG.username || !PHOREST_CONFIG.password) {
    console.error('\n❌ Error: Missing Phorest credentials in .env.local');
    console.error('Please ensure PHOREST_USERNAME and PHOREST_PASSWORD are set');
    process.exit(1);
  }

  try {
    // Test Cottesloe branch
    const cottesloeServices = await fetchServices(
      PHOREST_CONFIG.branches.COTTESLOE, 
      'COTTESLOE'
    );
    
    // Test Karrinyup branch
    const karrinyupServices = await fetchServices(
      PHOREST_CONFIG.branches.KARRINYUP,
      'KARRINYUP'
    );

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Cottesloe: ${cottesloeServices.length} services`);
    console.log(`Karrinyup: ${karrinyupServices.length} services`);
    
    // Find common services
    const cottesloeServiceNames = new Set(cottesloeServices.map(s => s.name));
    const commonServices = karrinyupServices.filter(s => cottesloeServiceNames.has(s.name));
    
    console.log(`\nCommon services across both branches: ${commonServices.length}`);
    if (commonServices.length > 0) {
      console.log('Common services:');
      commonServices.slice(0, 10).forEach(s => {
        console.log(`  - ${s.name}`);
      });
      if (commonServices.length > 10) {
        console.log(`  ... and ${commonServices.length - 10} more`);
      }
    }

    console.log('\n🎯 These are the REAL services from Phorest that will show on your appointments page!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();