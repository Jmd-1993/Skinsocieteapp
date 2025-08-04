// Test what services are available in Phorest
import phorestService from './app/services/phorestService.js';

async function testPhorestServices() {
  console.log('🔧 Testing Phorest Services\n');
  
  try {
    console.log('1️⃣ Getting services from Phorest...');
    const services = await phorestService.getServices();
    
    console.log(`✅ Found ${services.length} services in Phorest:\n`);
    
    services.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name || service.serviceName || 'Unnamed Service'}`);
      console.log(`   ID: ${service.serviceId || service.id}`);
      console.log(`   Duration: ${service.duration || 'Not specified'} min`);
      console.log(`   Price: $${service.price || 'Not specified'}`);
      console.log(`   Category: ${service.category || 'Not specified'}`);
      console.log(`   Description: ${service.description || 'No description'}`);
      console.log('');
    });
    
    console.log('🎯 These are the REAL services that will show on your appointments page!');
    
  } catch (error) {
    console.error('❌ Error fetching services:', error.message);
  }
}

testPhorestServices();