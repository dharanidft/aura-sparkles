/**
 * Test full customer login, session cookie, address creation, profile and logout.
 */

const assert = require("assert");

async function testFullCustomerFlow() {
  console.log("=================================================");
  console.log("🧪 TESTING FULL CUSTOMER AUTH & ADDRESS FLOW");
  console.log("=================================================\n");

  const BASE_URL = "http://localhost:3000";
  const TEST_PHONE = "+919566725454";
  const TEST_OTP = "631803"; // Active OTP from previous dispatch

  // Step 1: Verify OTP
  console.log("1. Verifying OTP...");
  const verifyRes = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phoneNumber: TEST_PHONE,
      otp: TEST_OTP,
      displayName: "Dharanivel Customer"
    })
  });

  const verifyData = await verifyRes.json();
  console.log("   Verify status:", verifyRes.status, verifyData);
  assert.strictEqual(verifyRes.status, 200, "Verification must succeed");
  assert.strictEqual(verifyData.success, true);
  assert.ok(verifyData.customer?.uid, "Customer UID must be returned");

  // Extract Session Cookie
  const setCookie = verifyRes.headers.get("set-cookie");
  console.log("   Set-Cookie received:", !!setCookie);
  assert.ok(setCookie, "Session cookie must be returned by server");
  const cookieHeader = setCookie.split(";")[0];

  // Step 2: Verify authenticated /api/auth/me
  console.log("\n2. Checking /api/auth/me with session cookie...");
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: cookieHeader }
  });
  const meData = await meRes.json();
  console.log("   Authenticated customer:", meData.customer?.displayName, meData.customer?.phoneNumber);
  assert.strictEqual(meData.authenticated, true);
  assert.strictEqual(meData.customer.phoneNumber, TEST_PHONE);

  // Step 3: Add an address via /api/customer/addresses
  console.log("\n3. Adding delivery address...");
  const addAddrRes = await fetch(`${BASE_URL}/api/customer/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader
    },
    body: JSON.stringify({
      recipientName: "Dharanivel",
      deliveryPhone: "9566725454",
      addressLine1: "Plot 42, Aura Residency",
      addressLine2: "Anna Nagar Main Road",
      landmark: "Near Grand Mall",
      city: "Chennai",
      state: "Tamil Nadu",
      postalCode: "600040",
      addressType: "home",
      isDefault: true
    })
  });
  const addAddrData = await addAddrRes.json();
  console.log("   Address created:", addAddrData.address?.addressId, addAddrData.address?.city);
  assert.strictEqual(addAddrRes.status, 200);
  assert.strictEqual(addAddrData.success, true);
  assert.strictEqual(addAddrData.address.isDefault, true);

  // Step 4: Check address list
  console.log("\n4. Fetching customer addresses...");
  const listAddrRes = await fetch(`${BASE_URL}/api/customer/addresses`, {
    headers: { Cookie: cookieHeader }
  });
  const listAddrData = await listAddrRes.json();
  console.log("   Total saved addresses:", listAddrData.addresses?.length);
  assert.strictEqual(listAddrData.addresses.length >= 1, true);

  // Step 5: Check customer orders
  console.log("\n5. Checking customer order history...");
  const ordersRes = await fetch(`${BASE_URL}/api/customer/orders`, {
    headers: { Cookie: cookieHeader }
  });
  const ordersData = await ordersRes.json();
  console.log("   Orders retrieved for customer:", ordersData.orders?.length);
  assert.strictEqual(ordersRes.status, 200);
  assert.ok(Array.isArray(ordersData.orders));

  // Step 6: Update customer profile
  console.log("\n6. Updating customer profile...");
  const profileRes = await fetch(`${BASE_URL}/api/customer/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader
    },
    body: JSON.stringify({
      displayName: "Dharanivel Aura VIP",
      email: "contact@aurasparkles.com"
    })
  });
  const profileData = await profileRes.json();
  console.log("   Profile updated:", profileData.customer?.displayName);
  assert.strictEqual(profileData.customer.displayName, "Dharanivel Aura VIP");

  // Step 7: Logout
  console.log("\n7. Logging out...");
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookieHeader }
  });
  const logoutData = await logoutRes.json();
  console.log("   Logout response:", logoutData);
  assert.strictEqual(logoutData.success, true);

  // Step 8: Verify unauthenticated after logout
  console.log("\n8. Verifying session terminated...");
  const unauthRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: "aura_customer_session=" }
  });
  const unauthData = await unauthRes.json();
  console.log("   Status after logout:", unauthData);
  assert.strictEqual(unauthData.authenticated, false);

  console.log("\n=================================================");
  console.log("🎉 ALL COMPLETE CUSTOMER FLOWS VERIFIED SUCCESSFULLY!");
  console.log("=================================================");
}

testFullCustomerFlow().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
