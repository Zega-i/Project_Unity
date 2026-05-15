const axios = require('axios');

async function testRegister() {
  const url = 'https://edubridge.up.railway.app/api/auth/register';
  const data = {
    email: `student_${Date.now()}@test.com`,
    password: 'Password123!',
    name: 'Student Tester',
    role: 'STUDENT',
    school: 'SMK Negeri 9 Yogyakarta',
    grade: 12,
    className: '12A'
  };

  try {
    console.log('Sending data to:', url);
    const response = await axios.post(url, data);
    console.log('SUCCESS:', response.data);
  } catch (error) {
    console.log('FAILED:', error.response ? error.response.data : error.message);
  }
}

testRegister();
