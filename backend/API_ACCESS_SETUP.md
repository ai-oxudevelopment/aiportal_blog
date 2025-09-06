# 🔧 API Access Setup Guide

## Problem: 401/403 Errors on Strapi API

When you get `401 Unauthorized` or `403 Forbidden` errors on Strapi API requests, it means the API access is not properly configured.

## 🚀 Quick Solutions

### Option 1: Enable Public Access (Recommended for Development)

Run the setup script:
```bash
node scripts/admin/quick-setup-public.js
```

Then follow the manual instructions to enable public access in the admin panel.

### Option 2: Generate New API Token

Run the token generation script:
```bash
node scripts/admin/manual-token-setup.js
```

Then create a token manually in the admin panel and update configuration.

## 📋 Manual Setup Steps

### For Public Access:

1. **Open Admin Panel**: http://localhost:1337/admin
2. **Login**: 
   - Email: `cvyatoslavka@gmail.com`
   - Password: `admin123456`
3. **Navigate**: Settings → Users & Permissions Plugin → Roles
4. **Click**: "Public" role
5. **Enable permissions** for each content type:
   - Article: `find`, `findOne`
   - Category: `find`, `findOne`
   - Section: `find`, `findOne`
   - Collection: `find`, `findOne`
   - Author: `find`, `findOne`
   - Tag: `find`, `findOne`
   - Playbook: `find`, `findOne`
6. **Save** each content type
7. **Test**: `curl http://localhost:1337/api/categories`

### For API Token:

1. **Open Admin Panel**: http://localhost:1337/admin
2. **Login** with credentials above
3. **Navigate**: Settings → API Tokens
4. **Create new token**:
   - Name: "Blog API Token"
   - Type: "Read-only"
   - Duration: "Unlimited"
5. **Copy the token**
6. **Update configuration**:
   ```bash
   node scripts/admin/update-frontend-token.js YOUR_TOKEN_HERE
   ```

## 🧪 Testing

After setup, test API access:

```bash
# Test public access
curl http://localhost:1337/api/categories

# Test with token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:1337/api/categories
```

**Expected result**: JSON response with data instead of 401/403 errors.

## 📁 Available Scripts

- `scripts/admin/quick-setup-public.js` - Instructions for public access setup
- `scripts/admin/manual-token-setup.js` - Instructions for token setup
- `scripts/admin/update-frontend-token.js` - Update frontend configuration
- `scripts/admin/refresh-blog-token.js` - Complete token refresh process

## 🔧 Troubleshooting

1. **Strapi not running**: `npm run develop`
2. **Wrong credentials**: Check `ADMIN_LOGIN_INFO.md`
3. **Reset admin password**: `node scripts/admin/reset-admin-password.js`
4. **Check logs**: Look at Strapi console output for errors

## ✅ Success Indicators

- API endpoints return JSON data instead of 401/403
- Frontend can fetch data from Strapi
- No authentication errors in browser console
