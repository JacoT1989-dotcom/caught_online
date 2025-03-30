// scripts/debug-stamped-api.js
/**
 * This is a comprehensive debug script to troubleshoot Stamped.io API issues
 * It tests various endpoints and configurations to identify problems
 * 
 * Run with: node scripts/debug-stamped-api.js
 */

const https = require('https');
const process = require('process');

// Configuration - replace with your actual values if needed
const STAMPED_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_STAMPED_PUBLIC_KEY || 'pubkey-4R57319D5548L8eyo3k03s5CiWb08O',
  privateKey: process.env.STAMPED_PRIVATE_KEY || 'key-aUG1IG2m2QaT15i125Y8AjHD3WKx7c',
  storeHash: process.env.NEXT_PUBLIC_STAMPED_STORE_HASH || '151250',
  storeUrl: process.env.NEXT_PUBLIC_STORE_URL || 'https://caught-online.myshopify.com'
};

// Create Basic Auth token as specified by Stamped dev team
const basicAuth = Buffer.from(`${STAMPED_CONFIG.publicKey}:${STAMPED_CONFIG.privateKey}`).toString('base64');

// Utility to make HTTP requests with detailed logging
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    console.log(`\n[REQUEST] ${options.method} https://${options.hostname}${options.path}`);
    console.log(`[REQUEST HEADERS]`, options.headers);
    if (data) {
      console.log(`[REQUEST BODY]`, data.substring(0, 500) + (data.length > 500 ? '...' : ''));
    }
    
    const req = https.request(options, (res) => {
      console.log(`[RESPONSE STATUS] ${res.statusCode}`);
      console.log(`[RESPONSE HEADERS]`, res.headers);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`[RESPONSE BODY]`, responseData.substring(0, 500) + (responseData.length > 500 ? '...' : ''));
        
        try {
          const jsonData = responseData ? JSON.parse(responseData) : {};
          resolve({ statusCode: res.statusCode, headers: res.headers, data: jsonData });
        } catch (e) {
          console.log(`[PARSE ERROR] Could not parse response as JSON: ${e.message}`);
          resolve({ statusCode: res.statusCode, headers: res.headers, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`[REQUEST ERROR]`, error);
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Test 1: List Stores - should tell us what stores are available with this API key
async function testListStores() {
  console.log('\n===============================================');
  console.log('TEST 1: List Stores');
  console.log('===============================================');
  console.log('This test will verify your API key and show available stores');
  
  const options = {
    hostname: 'stamped.io',
    port: 443,
    path: '/api/storeList',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Basic ${basicAuth}`
    }
  };
  
  try {
    const result = await makeRequest(options);
    
    if (result.statusCode === 200) {
      console.log('\n✅ SUCCESS: API key is valid');
      
      // Check if the store hash is in the list
      let storeFound = false;
      if (result.data.storesList) {
        console.log('\nFound stores:');
        result.data.storesList.forEach(store => {
          console.log(`- ID: ${store.id}, Name: ${store.shopName}, URL: ${store.shopUrl}`);
          if (store.id.toString() === STAMPED_CONFIG.storeHash) {
            storeFound = true;
            console.log(`✅ FOUND YOUR STORE: ${store.shopName} (ID: ${store.id})`);
          }
        });
        
        if (!storeFound) {
          console.log(`❌ WARNING: Your configured storeHash "${STAMPED_CONFIG.storeHash}" was not found in the list`);
          console.log('   Please update your STAMPED_CONFIG with one of the store IDs listed above');
        }
      } else {
        console.log('❌ No stores found for this API key');
      }
    } else {
      console.log(`❌ FAILED: List Stores returned status ${result.statusCode}`);
    }
  } catch (error) {
    console.error('❌ List Stores test failed', error);
  }
}

// Test 2: Get Reviews for a specific product
async function testGetReviews() {
  console.log('\n===============================================');
  console.log('TEST 2: Get Reviews');
  console.log('===============================================');
  console.log('This test will attempt to get reviews for a product');
  
  // Product ID to test - update this if needed
  const productIdToTest = '7954189779004';
  
  const params = new URLSearchParams({
    productId: productIdToTest,
    sId: STAMPED_CONFIG.storeHash,
    apiKey: STAMPED_CONFIG.publicKey,
    storeUrl: STAMPED_CONFIG.storeUrl
  });
  
  const options = {
    hostname: 'stamped.io',
    port: 443,
    path: `/api/widget/reviews?${params.toString()}`,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Basic ${basicAuth}`
    }
  };
  
  try {
    const result = await makeRequest(options);
    
    if (result.statusCode === 200) {
      console.log(`\n✅ SUCCESS: Get Reviews API request succeeded`);
      
      // Check reviews data
      if (result.data && result.data.data && Array.isArray(result.data.data)) {
        console.log(`Found ${result.data.data.length} reviews`);
        
        if (result.data.data.length > 0) {
          console.log('First review:', JSON.stringify(result.data.data[0], null, 2));
        }
      } else if (result.data && result.data.reviews && Array.isArray(result.data.reviews)) {
        console.log(`Found ${result.data.reviews.length} reviews`);
        
        if (result.data.reviews.length > 0) {
          console.log('First review:', JSON.stringify(result.data.reviews[0], null, 2));
        }
      } else {
        console.log('No reviews found for this product');
      }
    } else {
      console.log(`❌ FAILED: Get Reviews returned status ${result.statusCode}`);
    }
  } catch (error) {
    console.error('❌ Get Reviews test failed', error);
  }
}

// Test 3: Submit a Test Review
async function testSubmitReview() {
  console.log('\n===============================================');
  console.log('TEST 3: Submit Review');
  console.log('===============================================');
  console.log('This test will attempt to submit a test review');
  
  // Product ID to test - update this if needed
  const productIdToTest = '7954189779004';
  
  const params = new URLSearchParams({
    apiKey: STAMPED_CONFIG.publicKey,
    sId: STAMPED_CONFIG.storeHash
  });
  
  // Create form data for submission
  const formData = new URLSearchParams();
  formData.append('productId', productIdToTest);
  formData.append('author', 'API Test User');
  formData.append('email', 'test@example.com');
  formData.append('reviewRating', '5');
  formData.append('reviewTitle', 'API Test Review');
  formData.append('reviewMessage', 'This is a test review submitted from the API debug script.');
  formData.append('reviewRecommendProduct', 'true');
  formData.append('productName', 'Test Product');
  formData.append('reviewSource', 'api');
  
  const options = {
    hostname: 'stamped.io',
    port: 443,
    path: `/api/reviews3?${params.toString()}`,
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
      'Content-Length': Buffer.byteLength(formData.toString())
    }
  };
  
  try {
    const result = await makeRequest(options, formData.toString());
    
    if (result.statusCode >= 200 && result.statusCode < 300) {
      console.log(`\n✅ SUCCESS: Submit Review API request succeeded`);
      console.log('Response:', result.data);
    } else {
      console.log(`❌ FAILED: Submit Review returned status ${result.statusCode}`);
    }
  } catch (error) {
    console.error('❌ Submit Review test failed', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('=======================================================');
  console.log('STAMPED API DEBUG SCRIPT');
  console.log('=======================================================');
  console.log('Configuration:');
  console.log(`- Public Key: ${STAMPED_CONFIG.publicKey.substring(0, 10)}...`);
  console.log(`- Private Key: ${STAMPED_CONFIG.privateKey.substring(0, 5)}...`);
  console.log(`- Store Hash: ${STAMPED_CONFIG.storeHash}`);
  console.log(`- Store URL: ${STAMPED_CONFIG.storeUrl}`);
  console.log('=======================================================\n');
  
  await testListStores();
  await testGetReviews();
  await testSubmitReview();
  
  console.log('\n=======================================================');
  console.log('DEBUG SCRIPT COMPLETE');
  console.log('=======================================================');
}

// Run the tests
runAllTests().catch(error => {
  console.error('Error running tests:', error);
});
// Add this to your debug script
async function testAuthAndListAllReviews() {
    console.log('\n===============================================');
    console.log('TESTING AUTH AND LISTING ALL REVIEWS');
    console.log('===============================================');
    
    // Create Basic Auth header exactly as recommended by Stamped.io support
    const username = STAMPED_CONFIG.publicKey;
    const password = STAMPED_CONFIG.privateKey;
    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
    
    console.log(`Using Basic Auth with username: ${username}`);
    
    // Try to get ALL reviews (not filtered by product)
    const options = {
      hostname: 'stamped.io',
      port: 443,
      path: `/api/v2/${STAMPED_CONFIG.storeHash}/dashboard/reviews?limit=200`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${basicAuth}`
      }
    };
    
    try {
      const result = await makeRequest(options);
      console.log(`Status code: ${result.statusCode}`);
      
      if (result.statusCode === 200 && result.data && result.data.results) {
        console.log(`✅ SUCCESS: Found ${result.data.results.length} reviews in your account`);
        
        if (result.data.results.length > 0) {
          console.log('First review summary:');
          const firstReview = result.data.results[0].review;
          console.log(`- ID: ${firstReview.id}`);
          console.log(`- Product: ${firstReview.productTitle} (${firstReview.productId})`);
          console.log(`- Rating: ${firstReview.rating}`);
          console.log(`- Author: ${firstReview.author}`);
        }
      } else {
        console.log('❌ Failed to retrieve reviews from dashboard API');
        console.log('Response:', result);
      }
    } catch (error) {
      console.error('Error testing dashboard API:', error);
    }
  }