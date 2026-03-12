async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        address: '123 Test St',
        email: 'test@example.com',
        phone: '123-456-7890',
        service: 'General Plumbing Repair',
        message: 'This is a test message.'
      })
    });
    const data = await res.json();
    console.log('Response:', res.status, data);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
