async function testLead() {
  try {
    const res = await fetch('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        address: '123 Test St',
        email: 'test@example.com',
        phone: '1234567890',
        service: 'Drain Cleaning',
        message: 'This is a test lead.'
      })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
  } catch (e) {
    console.error('Lead test failed:', e);
  }
}
testLead();
