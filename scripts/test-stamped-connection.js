// scripts/test-stamped-connection.js
/**
 * This is a standalone script to test your Stamped API connection.
 * Run with: node scripts/test-stamped-connection.js
 * 
 * Based on the examples from the Stamped.io API documentation
 */

const https = require('https');

// Replace these with your actual keys from your config
const STAMPED_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_STAMPED_PUBLIC_KEY || 'pubkey-4R57319D5548L8eyo3k03s5CiWb08O',
  privateKey: process.env.STAMPED_PRIVATE_KEY || 'key-aUG1IG2m2QaT15i125Y8AjHD3WKx7c',
  storeHash: process.env.NEXT_PUBLIC_STAMPED_STORE_HASH || '151250',
  storeUrl: process.env.NEXT_PUBLIC_STORE_URL || 'https://caught-online.myshopify.com'
};

// Create Basic Auth token per the docs
const basicAuth = Buffer.from(`${STAMPED_CONFIG.publicKey}:${STAMPED_CONFIG.privateKey}`).toString('base64');

// Test getting reviews using widget endpoint
function testGetReviews() {
  // Product ID from your logs - change this to one of your product IDs
  const productId = '7954189779004';
  
  // Use the widget reviews endpoint as shown in docs
  const params = new URLSearchParams({
    productId,
    sId: STAMPED_CONFIG.storeHash,
    apiKey: STAMPED_CONFIG.publicKey,
    storeUrl: STAMPED_CONFIG.storeUrl
  });
  
  const path = `/api/widget/reviews?${params.toString()}`;
  console.log(`\nTesting Widget Reviews API: ${path}`);
  
  const options = {
    hostname: 'stamped.io',
    port: 443,
    path,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Basic ${basicAuth}`
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`Widget Reviews API Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        console.log('Response Headers:', res.headers);
        
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log(`✅ Widget Reviews API successful!`);
          console.log(`Found ${response.data ? response.data.length : 0} reviews.`);
          console.log('Response Structure:', JSON.stringify(response, null, 2).substring(0, 500) + '...');
          
          // Test badges endpoint if this was successful
          testGetRating(productId);
        } else {
          console.log('❌ Widget Reviews API failed:', data);
        }
      } catch (e) {
        console.error('Error parsing response:', e);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error('Request error:', e);
  });
  
  req.end();
}

// Test getting rating using badges endpoint
function testGetRating(productId) {
  const requestBody = JSON.stringify({
    productIds: [
      {
        productId,
        productSKU: "",
        productType: "",
        productTitle: ""
      }
    ],
    apiKey: STAMPED_CONFIG.publicKey,
    storeUrl: STAMPED_CONFIG.storeUrl
  });
  
  console.log(`\nTesting Badges API for product ${productId}`);
  
  const options = {
    hostname: 'stamped.io',
    port: 443,
    path: '/api/widget/badges',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuth}`,
      'Content-Length': Buffer.byteLength(requestBody)
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`Badges API Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log(`✅ Badges API successful!`);
          console.log('Response:', JSON.stringify(response, null, 2));
          
          // Test submit review endpoint if this was successful
          testSubmitReview(productId);
        } else {
          console.log('❌ Badges API failed:', data);
        }
      } catch (e) {
        console.error('Error parsing response:', e);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error('Request error:', e);
  });
  
  req.write(requestBody);
  req.end();
}

// Test submitting a review using reviews3 endpoint
function testSubmitReview(productId) {
  console.log(`\nTesting Review Submission API for product ${productId}`);
  
  const params = new URLSearchParams({
    apiKey: STAMPED_CONFIG.publicKey,
    sId: STAMPED_CONFIG.storeHash
  });
  
  // Create form data for submission
  const formData = new URLSearchParams();
  formData.append('productId', productId);
  formData.append('author', 'Test User');
  formData.append('email', 'test@example.com');
  formData.append('reviewRating', '5');
  formData.append('reviewTitle', 'Test Review');
  formData.append('reviewMessage', 'This is a test review from the API connection test script.');
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
  
  const req = https.request(options, (res) => {
    console.log(`Review Submission API Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        console.log('Response Data:', data);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Review Submission API successful!`);
        } else {
          console.log('❌ Review Submission API failed.');
        }
      } catch (e) {
        console.error('Error parsing response:', e);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error('Request error:', e);
  });
  
  req.write(formData.toString());
  req.end();
}

// Start tests with the reviews endpoint instead of auth
console.log('Starting Stamped API Tests...');
testGetReviews();