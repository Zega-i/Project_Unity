import axios from 'axios';

const testTutorChat = async () => {
  try {
    console.log('🧪 Testing AI Tutor Endpoint...');
    console.log('-----------------------------------');
    
    // Test 1: Login first to get token
    console.log('\n1️⃣ Logging in...');
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'student@test.com',
      password: 'password123'
    });
    
    const token = loginRes.data.data.token;
    console.log('✅ Login successful, token received');
    
    // Test 2: Call tutor endpoint
    console.log('\n2️⃣ Testing /api/ai/tutor endpoint...');
    const tutorRes = await axios.post(
      'http://localhost:3000/api/ai/tutor',
      {
        message: 'Apa itu fotosintesis?',
        context: {
          subject: 'Biologi',
          grade: 'SMA',
          topic: 'Proses Biologi'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Endpoint successful!');
    console.log('\nResponse:');
    console.log(JSON.stringify(tutorRes.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ ERROR OCCURRED:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Error:', error.response?.data?.error || error.message);
    if (error.response?.data) {
      console.error('Full response:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('\nStack:', error.message);
  }
};

testTutorChat();
