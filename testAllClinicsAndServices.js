// Comprehensive test for all Skin Societé clinics and services
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

async function getAuthToken() {
  const response = await axios.post(
    'https://api-gateway-au.phorest.com/third-party-api-server/api/business/v1/login',
    {
      username: process.env.PHOREST_USERNAME || 'global/josh@skinsociete.com.au',
      password: process.env.PHOREST_PASSWORD || 'ROW^pDL%kxSq'
    }
  );
  return response.data.access_token;
}

async function getAllBranches() {
  const token = await getAuthToken();
  const businessId = process.env.PHOREST_BUSINESS_ID || 'IX2it2QrF0iguR-LpZ6BHQ';
  
  const response = await axios.get(
    `https://api-gateway-au.phorest.com/third-party-api-server/api/business/v1/${businessId}/branch`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data._embedded?.branches || [];
}

async function getServicesForBranch(branchId, token) {
  const businessId = process.env.PHOREST_BUSINESS_ID || 'IX2it2QrF0iguR-LpZ6BHQ';
  
  try {
    const response = await axios.get(
      `https://api-gateway-au.phorest.com/third-party-api-server/api/business/v1/${businessId}/branch/${branchId}/service`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data._embedded?.services || [];
  } catch (error) {
    console.error(`Error fetching services for branch ${branchId}:`, error.message);
    return [];
  }
}

function categorizeService(serviceName) {
  const name = serviceName.toLowerCase();
  
  if (name.includes('laser') || name.includes('ipl') || name.includes('nd:yag') || name.includes('carbon')) {
    return '🔴 Laser';
  }
  if (name.includes('filler') || name.includes('botox') || name.includes('dysport') || 
      name.includes('injectable') || name.includes('bio remodel') || name.includes('bio stimulator')) {
    return '💉 Injectable';
  }
  if (name.includes('member') || name.includes('vip') || name.includes('glow society')) {
    return '⭐ Member Exclusive';
  }
  if (name.includes('facial') || name.includes('peel') || name.includes('microneedling') || 
      name.includes('dermaplaning') || name.includes('hydrafacial')) {
    return '✨ Skin Treatment';
  }
  if (name.includes('prp') || name.includes('fat dissolv') || name.includes('thread')) {
    return '🚀 Advanced';
  }
  if (name.includes('body') || name.includes('sculpt') || name.includes('cellulite')) {
    return '💪 Body';
  }
  if (name.includes('consultation')) {
    return '📋 Consultation';
  }
  return '🔧 Treatment';
}

async function testAllClinicsAndServices() {
  console.log('🏥 SKIN SOCIETÉ - COMPLETE CLINIC & SERVICE ANALYSIS');
  console.log('=' .repeat(80));
  console.log('Connecting to Phorest API (Australia)...\n');
  
  try {
    // Get authentication token
    const token = await getAuthToken();
    console.log('✅ Authentication successful\n');
    
    // Get all branches
    const branches = await getAllBranches();
    console.log(`📍 Found ${branches.length} Skin Societé clinics:\n`);
    
    // Display all branches
    branches.forEach((branch, index) => {
      console.log(`${index + 1}. ${branch.name}`);
      console.log(`   ID: ${branch.branchId}`);
      if (branch.addressLine1) console.log(`   Address: ${branch.addressLine1}`);
      if (branch.phone) console.log(`   Phone: ${branch.phone}`);
      console.log('');
    });
    
    // Collect all services from all branches
    const allServicesMap = new Map();
    const branchServices = {};
    
    console.log('=' .repeat(80));
    console.log('FETCHING SERVICES FROM ALL CLINICS...');
    console.log('=' .repeat(80));
    
    for (const branch of branches) {
      console.log(`\n🔍 ${branch.name}:`);
      const services = await getServicesForBranch(branch.branchId, token);
      branchServices[branch.name] = services;
      
      console.log(`   Found ${services.length} services`);
      
      // Track unique services across all branches
      services.forEach(service => {
        const name = service.name || service.serviceName;
        if (!allServicesMap.has(name)) {
          allServicesMap.set(name, {
            ...service,
            availableAt: [branch.name],
            category: categorizeService(name)
          });
        } else {
          allServicesMap.get(name).availableAt.push(branch.name);
        }
      });
    }
    
    // Organize services by category
    const servicesByCategory = {};
    allServicesMap.forEach(service => {
      const category = service.category;
      if (!servicesByCategory[category]) {
        servicesByCategory[category] = [];
      }
      servicesByCategory[category].push(service);
    });
    
    // Display services by category
    console.log('\n' + '=' .repeat(80));
    console.log('ALL SERVICES BY CATEGORY');
    console.log('=' .repeat(80));
    
    Object.keys(servicesByCategory).sort().forEach(category => {
      const services = servicesByCategory[category];
      console.log(`\n${category} (${services.length} services)`);
      console.log('-'.repeat(40));
      
      services.sort((a, b) => (a.name || a.serviceName).localeCompare(b.name || b.serviceName))
        .forEach(service => {
          const name = service.name || service.serviceName;
          console.log(`• ${name}`);
          console.log(`  💰 $${service.price || 'N/A'} | ⏱️ ${service.duration || 'N/A'} min`);
          console.log(`  📍 Available at: ${service.availableAt.join(', ')}`);
        });
    });
    
    // Summary statistics
    console.log('\n' + '=' .repeat(80));
    console.log('📊 SUMMARY STATISTICS');
    console.log('=' .repeat(80));
    console.log(`Total Clinics: ${branches.length}`);
    console.log(`Total Unique Services: ${allServicesMap.size}`);
    console.log(`Service Categories: ${Object.keys(servicesByCategory).length}`);
    
    // Category breakdown
    console.log('\nServices per Category:');
    Object.entries(servicesByCategory).forEach(([category, services]) => {
      console.log(`  ${category}: ${services.length}`);
    });
    
    // Clinic coverage
    console.log('\nServices per Clinic:');
    Object.entries(branchServices).forEach(([branchName, services]) => {
      console.log(`  ${branchName}: ${services.length}`);
    });
    
    // Find services available at all clinics
    const universalServices = Array.from(allServicesMap.values())
      .filter(s => s.availableAt.length === branches.length);
    
    if (universalServices.length > 0) {
      console.log(`\n🌟 Services Available at ALL ${branches.length} Clinics (${universalServices.length}):`);
      universalServices.forEach(service => {
        console.log(`  • ${service.name || service.serviceName}`);
      });
    }
    
    // Update .env.local with all branch IDs
    console.log('\n' + '=' .repeat(80));
    console.log('📝 BRANCH IDS FOR .env.local');
    console.log('=' .repeat(80));
    branches.forEach(branch => {
      const envName = branch.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      console.log(`PHOREST_BRANCH_ID_${envName}=${branch.branchId}`);
    });
    
    console.log('\n✅ Complete clinic and service analysis finished successfully!');
    console.log('🚀 Ready for deployment on Render with all clinics and services');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testAllClinicsAndServices();