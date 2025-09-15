const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_ACCOUNTS = [
  { email: 'admin@acme.test', password: 'password', tenant: 'acme', role: 'admin' },
  { email: 'user@acme.test', password: 'password', tenant: 'acme', role: 'member' },
  { email: 'admin@globex.test', password: 'password', tenant: 'globex', role: 'admin' },
  { email: 'user@globex.test', password: 'password', tenant: 'globex', role: 'member' }
];

async function testAPI() {
  console.log('🧪 Testing Multi-Tenant Notes API\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test each account
    for (const account of TEST_ACCOUNTS) {
      console.log(`\n2. Testing ${account.email} (${account.role}, ${account.tenant})...`);
      
      // Login
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: account.email,
        password: account.password
      });
      
      const token = loginResponse.data.token;
      const user = loginResponse.data.user;
      
      console.log(`✅ Login successful - Role: ${user.role}, Tenant: ${user.tenant.name}`);
      
      // Set authorization header
      const headers = { Authorization: `Bearer ${token}` };
      
      // Test notes CRUD
      console.log('   Testing notes CRUD...');
      
      // Create a note
      const createResponse = await axios.post(`${BASE_URL}/api/notes`, {
        title: `Test Note from ${account.email}`,
        content: `This is a test note created by ${account.email}`
      }, { headers });
      
      const noteId = createResponse.data._id;
      console.log(`   ✅ Note created: ${noteId}`);
      
      // Get all notes
      const getNotesResponse = await axios.get(`${BASE_URL}/api/notes`, { headers });
      console.log(`   ✅ Retrieved ${getNotesResponse.data.length} notes`);
      
      // Get specific note
      const getNoteResponse = await axios.get(`${BASE_URL}/api/notes/${noteId}`, { headers });
      console.log(`   ✅ Retrieved specific note: ${getNoteResponse.data.title}`);
      
      // Update note
      const updateResponse = await axios.put(`${BASE_URL}/api/notes/${noteId}`, {
        title: `Updated Note from ${account.email}`,
        content: `This note has been updated by ${account.email}`
      }, { headers });
      console.log(`   ✅ Note updated: ${updateResponse.data.title}`);
      
      // Test tenant info
      const tenantResponse = await axios.get(`${BASE_URL}/api/tenants/${account.tenant}`, { headers });
      console.log(`   ✅ Tenant info: ${tenantResponse.data.tenant.name} (${tenantResponse.data.tenant.subscription})`);
      
      // Test upgrade (admin only)
      if (account.role === 'admin') {
        console.log('   Testing upgrade endpoint...');
        try {
          const upgradeResponse = await axios.post(`${BASE_URL}/api/tenants/${account.tenant}/upgrade`, {}, { headers });
          console.log(`   ✅ Upgrade successful: ${upgradeResponse.data.tenant.subscription}`);
        } catch (error) {
          if (error.response?.status === 400) {
            console.log('   ℹ️  Already upgraded or upgrade not needed');
          } else {
            console.log(`   ❌ Upgrade failed: ${error.response?.data?.message || error.message}`);
          }
        }
      }
      
      // Delete note
      const deleteResponse = await axios.delete(`${BASE_URL}/api/notes/${noteId}`, { headers });
      console.log(`   ✅ Note deleted: ${deleteResponse.data.message}`);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testAPI();
