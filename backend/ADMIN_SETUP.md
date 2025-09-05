# Strapi Admin Account Setup

## 🔑 Accessing Admin Panel

**URL**: http://localhost:1337/admin

## 📋 Common Admin Credentials

Try these credentials in order:

### Option 1: Default Credentials
- **Email**: `admin@localhost`
- **Password**: `admin123456`

### Option 2: Alternative Credentials  
- **Email**: `admin@aiportal.com`
- **Password**: `admin123456`

### Option 3: Simple Credentials
- **Email**: `admin`
- **Password**: `admin`

## 🆕 Creating New Admin Account

If none of the above work, you'll see a registration form:

1. **Go to**: http://localhost:1337/admin
2. **Fill the registration form**:
   - First Name: `Admin`
   - Last Name: `User`
   - Username: `admin`
   - Email: `admin@aiportal.com`
   - Password: `admin123456`
   - Confirm Password: `admin123456`
3. **Click "Let's start"**

## 🔧 Manual Database Reset (Advanced)

If you need to reset the admin account manually:

1. **Connect to PostgreSQL**:
   ```bash
   docker exec -it aiportal-postgres psql -U postgres -d aiportal_blog
   ```

2. **Clear admin users**:
   ```sql
   DELETE FROM admin_users;
   ```

3. **Restart Strapi**:
   ```bash
   docker-compose restart aiportal-strapi
   ```

4. **Go to admin panel** and create new account

## ✅ After Login

Once logged in, configure public API access:

1. **Go to**: Settings → Users & Permissions Plugin → Roles → Public
2. **Enable permissions** for each content type:
   - Article: `find`, `findOne`
   - Author: `find`, `findOne`
   - Category: `find`, `findOne`
   - Section: `find`, `findOne`
   - Collection: `find`, `findOne`
   - Tag: `find`, `findOne`
   - Playbook: `find`, `findOne`
3. **Save** the configuration

## 🧪 Test API Access

After configuring public access, test with:
```bash
cd backend && node test-api.js
```

You should see `200 OK` responses instead of `403 Forbidden`.
