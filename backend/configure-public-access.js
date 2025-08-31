// Script to configure public access for Strapi API
// This script should be run after Strapi is set up

const fs = require('fs');
const path = require('path');

console.log('🔧 Strapi Public Access Configuration');
console.log('=====================================');
console.log('');
console.log('To fix the 401 Unauthorized error, you need to configure public access:');
console.log('');
console.log('1. Open Strapi Admin Panel: http://localhost:1337/admin');
console.log('2. Create an admin account if you haven\'t already');
console.log('3. Go to Settings → Users & Permissions Plugin → Roles → Public');
console.log('4. Enable the following permissions for each content type:');
console.log('   - Article: find, findOne');
console.log('   - Category: find, findOne');
console.log('   - Section: find, findOne');
console.log('   - Collection: find, findOne');
console.log('   - Author: find, findOne');
console.log('   - Tag: find, findOne');
console.log('');
console.log('5. Save the configuration');
console.log('');
console.log('Alternatively, create an API token:');
console.log('1. Go to Settings → API Tokens');
console.log('2. Create a new token with "Read-only" permissions');
console.log('3. Add the token to your frontend/.env.local file:');
console.log('   NEXT_PUBLIC_STRAPI_API_TOKEN=your_token_here');
console.log('');
console.log('After configuration, restart your frontend application.');
