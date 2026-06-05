const axios = require('axios');

async function testLiveEmail() {
  const url = 'https://edubridge.up.railway.app/api/auth/test-email';
  console.log('Testing SMTP connection on live Railway server at:', url);
  try {
    const response = await axios.post(url, { to: 'edubridge56@gmail.com' });
    console.log('SUCCESS:', response.data);
  } catch (error) {
    console.log('FAILED TO SEND SMTP EMAIL:');
    if (error.response) {
      console.log('Status Code:', error.response.status);
      console.log('Error Details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error Message:', error.message);
    }
  }
}

testLiveEmail();
