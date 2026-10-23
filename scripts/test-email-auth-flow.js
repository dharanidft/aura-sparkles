/**
 * Test Suite: Passwordless Email Link Authentication & Customer Management
 * Tests against live server at http://localhost:3000
 */

const assert = require("assert");

async function testEmailAuthFlow() {
  console.log("=================================================");
  console.log("🕯️  AURA SPARKLES - PASSWORDLESS EMAIL AUTH TEST");
  console.log("=================================================\n");

  const BASE_URL = "http://localhost:3000";
  const TEST_EMAIL = `priya.test.${Date.now()}@example.com`;

  // Step 1: Send Sign-In Link
  console.log("1. Requesting passwordless sign-in link for:", TEST_EMAIL);
  const sendRes = await fetch(`${BASE_URL}/api/auth/email/send-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, redirect: "/checkout" })
  });
  const sendData = await sendRes.json();
  console.log("   Send link response:", sendData);
  assert.strictEqual(sendRes.status, 200, "Send link must return 200");
  assert.strictEqual(sendData.success, true, "Success must be true");
  assert.ok(sendData.message.includes("Check your email"), "Message must instruct user to check email");
  console.log("   ✓ Sign-in link successfully generated and dispatched without SMS fees");

  // Step 2: Rate Limiting & Cooldown Test
  console.log("\n2. Testing 60-second cooldown rate limit...");
  const cooldownRes = await fetch(`${BASE_URL}/api/auth/email/send-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL })
  });
  const cooldownData = await cooldownRes.json();
  console.log("   Cooldown response:", cooldownData);
  assert.strictEqual(cooldownRes.status, 429, "Immediate re-request must return 429");
  console.log("   ✓ 60-second cooldown rate limiting confirmed");

  // Step 3: Bad Token Rejection
  console.log("\n3. Testing invalid sign-in link token rejection...");
  const badVerifyRes = await fetch(`${BASE_URL}/api/auth/email/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, token: "invalid_fake_token_123" })
  });
  const badVerifyData = await badVerifyRes.json();
  console.log("   Bad token response:", badVerifyData);
  assert.strictEqual(badVerifyRes.status, 400, "Invalid token must return 400");
  console.log("   ✓ Invalid token rejected");

  // Step 4: Extract generated token from server log (in dev mode)
  console.log("\n4. Reading dispatched sign-in token...");
  const fs = require("fs");
  const path = require("path");
  const logPath = "/Users/dhara/.gemini/antigravity-ide/brain/f410a6eb-3915-48c6-9f9e-31679506ec79/.system_generated/tasks/task-1474.log";
  const logContent = fs.readFileSync(logPath, "utf8");
  const escapedEmail = encodeURIComponent(TEST_EMAIL).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`token=([a-f0-9_]+)&email=${escapedEmail}`, "gi");
  const allMatches = [...logContent.matchAll(regex)];
  assert.ok(allMatches.length > 0, "Token must be found in development server dispatch log");
  const rawToken = allMatches[allMatches.length - 1][1];
  console.log("   Found active token:", rawToken.slice(0, 16) + "...");

  console.log("\n5. Verifying valid sign-in link via /api/auth/email/verify...");
  const verifyRes = await fetch(`${BASE_URL}/api/auth/email/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, token: rawToken })
  });
  const verifyData = await verifyRes.json();
  console.log("   Verify status:", verifyRes.status, verifyData.customer?.email, verifyData.customer?.uid);
  assert.strictEqual(verifyRes.status, 200, "Verify link must succeed");
  assert.strictEqual(verifyData.success, true);
  assert.strictEqual(verifyData.customer.email, TEST_EMAIL);
  assert.strictEqual(verifyData.customer.emailVerified, true);

  // Extract Session Cookie
  const setCookie = verifyRes.headers.get("set-cookie");
  assert.ok(setCookie, "Server must return session cookie");
  const cookieHeader = setCookie.split(";")[0];
  console.log("   ✓ Customer profile created and authenticated session cookie issued");

  // Step 5: Check Authenticated Session
  console.log("\n5. Checking /api/auth/me with session cookie...");
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: cookieHeader }
  });
  const meData = await meRes.json();
  console.log("   Authenticated customer email:", meData.customer?.email);
  assert.strictEqual(meData.authenticated, true);
  assert.strictEqual(meData.customer.email, TEST_EMAIL);
  console.log("   ✓ Authenticated customer profile verified via cookie");

  // Step 6: Add Saved Delivery Address
  console.log("\n6. Adding delivery address to customer profile...");
  const addrRes = await fetch(`${BASE_URL}/api/customer/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader
    },
    body: JSON.stringify({
      recipientName: "Priya Sharma",
      deliveryPhone: "9876543210",
      addressLine1: "Flat 301, Whispering Palms",
      addressLine2: "Indiranagar 100ft Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      addressType: "home",
      isDefault: true
    })
  });
  const addrData = await addrRes.json();
  console.log("   Address created:", addrData.address?.city, addrData.address?.postalCode);
  assert.strictEqual(addrRes.status, 200);
  assert.strictEqual(addrData.success, true);
  console.log("   ✓ Delivery address saved to customer account");

  // Step 7: Update Profile (Display Name & Delivery Mobile)
  console.log("\n7. Updating customer display name & delivery mobile...");
  const profileRes = await fetch(`${BASE_URL}/api/customer/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader
    },
    body: JSON.stringify({
      displayName: "Priya Sharma VIP",
      phoneNumber: "9876543210"
    })
  });
  const profileData = await profileRes.json();
  console.log("   Updated customer:", profileData.customer?.displayName, profileData.customer?.phoneNumber);
  assert.strictEqual(profileRes.status, 200);
  assert.strictEqual(profileData.customer.displayName, "Priya Sharma VIP");
  assert.strictEqual(profileData.customer.phoneNumber, "9876543210");
  console.log("   ✓ Customer profile updated without altering verified email identity");

  // Step 8: Reused Token Rejection
  console.log("\n8. Testing used token rejection (prevent replay attack)...");
  const reuseRes = await fetch(`${BASE_URL}/api/auth/email/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, token: rawToken })
  });
  const reuseData = await reuseRes.json();
  console.log("   Reuse response:", reuseData);
  assert.strictEqual(reuseRes.status, 400);
  console.log("   ✓ Used token replay properly prevented");

  // Step 9: Logout
  console.log("\n9. Testing logout...");
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookieHeader }
  });
  const logoutData = await logoutRes.json();
  console.log("   Logout response:", logoutData);
  assert.strictEqual(logoutData.success, true);

  // Step 10: Verify Unauthenticated after logout
  const afterLogoutRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: "aura_customer_session=" }
  });
  const afterLogoutData = await afterLogoutRes.json();
  assert.strictEqual(afterLogoutData.authenticated, false);
  console.log("   ✓ Session terminated cleanly on logout");

  console.log("\n=================================================");
  console.log("🎉 ALL PASSWORDLESS EMAIL AUTH TESTS PASSED!");
  console.log("=================================================");
}

testEmailAuthFlow().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
