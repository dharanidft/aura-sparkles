const http = require('http');

async function run() {
  const BASE_URL = 'http://localhost:3000';
  console.log('Testing WhatsApp OTP flow on', BASE_URL);

  // 1. Send WhatsApp OTP
  const sendRes = await fetch(`${BASE_URL}/api/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber: '9876543210',
      countryCode: '+91',
      channel: 'whatsapp'
    })
  });

  const sendData = await sendRes.json();
  console.log('[Step 1] Send WhatsApp OTP response:', sendData);
  if (!sendData.success || !sendData.devOtp) {
    throw new Error('Failed to send WhatsApp OTP: ' + JSON.stringify(sendData));
  }

  const otp = sendData.devOtp;
  console.log('Obtained test WhatsApp OTP:', otp);

  // 2. Verify WhatsApp OTP
  const verifyRes = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber: '9876543210',
      otpCode: otp,
      displayName: 'WhatsApp Customer',
      countryCode: '+91'
    })
  });

  const verifyData = await verifyRes.json();
  const setCookie = verifyRes.headers.get('set-cookie');
  console.log('[Step 2] Verify OTP response:', verifyData);
  console.log('[Step 2] Session cookie received:', !!setCookie);

  if (!verifyData.success || !verifyData.customer) {
    throw new Error('Verification failed: ' + JSON.stringify(verifyData));
  }

  console.log('✅ ALL WhatsApp OTP TESTS PASSED!');
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
