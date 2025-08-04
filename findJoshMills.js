// findJoshMills.js
import phorestService from './app/services/phorestService.js';

async function findJosh() {
  console.log('🔍 Searching for Josh Mills with phone 0406529251\n');
  
  try {
    // Initialize branch ID
    await phorestService.getBranches();
    
    // Method 1: Search by exact email if we know it
    console.log('1️⃣ Searching by email patterns...');
    const emailPatterns = ['josh@', 'mills@', 'josh.mills@'];
    
    for (const pattern of emailPatterns) {
      console.log(`   Trying email pattern: ${pattern}`);
      const results = await phorestService.searchClientByEmail(pattern);
      console.log(`   Found ${results.length} results`);
      
      results.forEach(client => {
        console.log(`   - ${client.firstName} ${client.lastName}`);
        console.log(`     Email: ${client.email}`);
        console.log(`     Phone: ${client.mobile || client.phone || 'No phone'}`);
        console.log(`     ID: ${client.clientId}`);
      });
    }
    
    // Method 2: Get all clients and search manually
    console.log('\n2️⃣ Searching through all clients for phone 0406529251...');
    let found = false;
    let totalSearched = 0;
    
    for (let page = 0; page < 100; page++) {
      const { clients, pagination } = await phorestService.getClients({ 
        size: 200,
        page: page 
      });
      
      totalSearched += clients.length;
      
      // Search for Josh by phone
      const joshResults = clients.filter(client => {
        const phone = (client.mobile || client.phone || '').replace(/\s+/g, '');
        const name = `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase();
        
        // Check various phone formats
        if (phone.includes('406529251') || 
            phone === '0406529251' ||
            phone === '+61406529251' ||
            phone === '61406529251' ||
            phone === '406529251') {
          return true;
        }
        
        // Also check by name
        if (name.includes('josh') && name.includes('mills')) {
          return true;
        }
        
        return false;
      });
      
      if (joshResults.length > 0) {
        console.log(`\n✅ FOUND JOSH MILLS!`);
        joshResults.forEach(client => {
          console.log(`\n   Name: ${client.firstName} ${client.lastName}`);
          console.log(`   Email: ${client.email || 'No email'}`);
          console.log(`   Mobile: ${client.mobile || 'No mobile'}`);
          console.log(`   Phone: ${client.phone || 'No phone'}`);
          console.log(`   Client ID: ${client.clientId}`);
          console.log(`   Created: ${client.createdAt}`);
          console.log(`   Notes: ${client.notes || 'No notes'}`);
        });
        found = true;
        break;
      }
      
      // Progress indicator
      if (page % 10 === 0) {
        console.log(`   Searched ${totalSearched} clients so far...`);
      }
      
      // Stop if we've reached the last page
      if (!pagination || page >= pagination.totalPages - 1) {
        break;
      }
    }
    
    if (!found) {
      console.log(`\n❌ Josh Mills not found after searching ${totalSearched} clients`);
      console.log('\nThe phone number 0406529251 exists in the system but we cannot find the client record.');
      console.log('This might be because:');
      console.log('1. The client is in a different branch');
      console.log('2. The phone is stored in a different format');
      console.log('3. The client has restricted visibility');
    }
    
    // Method 3: Try to get recent clients
    console.log('\n3️⃣ Showing recent clients as reference...');
    const { clients: recentClients } = await phorestService.getClients({ size: 10 });
    console.log('Recent clients:');
    recentClients.forEach(client => {
      console.log(`   - ${client.firstName} ${client.lastName} (${client.mobile || client.phone || 'No phone'})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findJosh();