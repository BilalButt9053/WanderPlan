// Test API Configuration
// Run this in browser console to test API connectivity

const API_URL = 'http://localhost:5000/api'

// Test 1: Register Business
async function testRegister() {
  console.log('Testing Business Registration...')
  
  const response = await fetch(`${API_URL}/business/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      businessName: 'Test Hotel',
      ownerName: 'John Doe',
      email: 'test@hotel.com',
      password: 'password123',
      phone: '+1234567890',
      businessType: 'hotel'
    })
  })
  
  const data = await response.json()
  console.log('Register Response:', data)
  return data
}

// Test 2: Verify Email
async function testVerifyEmail(businessId, otp) {
  console.log('Testing Email Verification...')
  
  const response = await fetch(`${API_URL}/business/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      businessId,
      otp
    })
  })
  
  const data = await response.json()
  console.log('Verify Response:', data)
  return data
}

// Test 3: Login (will fail if not approved)
async function testLogin(email, password) {
  console.log('Testing Business Login...')
  
  const response = await fetch(`${API_URL}/business/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password
    })
  })
  
  const data = await response.json()
  console.log('Login Response:', data)
  return data
}

// Test 4: Get Profile (requires token)
async function testGetProfile(token) {
  console.log('Testing Get Profile...')
  
  const response = await fetch(`${API_URL}/business/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  })
  
  const data = await response.json()
  console.log('Profile Response:', data)
  return data
}

// Run all tests
async function runAllTests() {
  try {
    // Step 1: Register
    const registerData = await testRegister()
    console.log('✅ Registration successful')
    console.log('Business ID:', registerData.businessId)
    console.log('Check your email for OTP')
    
    // Note: You need to get OTP from email for next step
    // const otp = prompt('Enter OTP from email:')
    // await testVerifyEmail(registerData.businessId, otp)
    
    // Note: Login will only work after admin approval
    // const loginData = await testLogin('test@hotel.com', 'password123')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Export functions for manual testing
window.businessApiTests = {
  testRegister,
  testVerifyEmail,
  testLogin,
  testGetProfile,
  runAllTests
}

console.log('Business API Tests loaded. Use: businessApiTests.runAllTests()')
