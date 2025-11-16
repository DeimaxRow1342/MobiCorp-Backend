import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', { username: 'admin', password: 'admin123' });
    console.log('Status:', res.status);
    console.log('Data:', res.data);
  } catch (err) {
    if (err.response) {
      console.log('Status:', err.response.status);
      console.log('Data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

test();
