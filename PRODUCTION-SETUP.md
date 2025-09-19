# Production Setup Guide for NKBook

## 🌐 Domain Configuration
- **Frontend**: https://kanakk.moajmalnk.com (Vercel)
- **Backend**: https://kanakki.moajmalnk.com (Your hosting)

## 📋 Backend Production Setup

### 1. Create `.env` file on your server
Create `/path/to/your/backend/.env` with:

```env
# Production Environment
APP_ENV=production
APP_DEBUG=false

# Production Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u524154866_kanakk
DB_USER=u524154866_kanakk
DB_PASS=CodoMail@8848
DB_CHARSET=utf8mb4

# API Configuration
API_BASE_URL=https://kanakki.moajmalnk.com
FRONTEND_URL=https://kanakk.moajmalnk.com

# Security
JWT_SECRET=generate-a-strong-random-secret-here
API_RATE_LIMIT=100

# Logging
LOG_LEVEL=error
LOG_FILE=logs/app.log
```

### 2. Upload Backend Files
Upload all files from the `backend/` directory to your hosting server at `kanakki.moajmalnk.com`.

### 3. Set Proper Permissions
```bash
chmod 644 *.php
chmod 600 .env
mkdir -p logs
chmod 755 logs
```

## 🚀 Frontend Production Setup (Vercel)

### 1. Environment Variables in Vercel
Add these environment variables in your Vercel dashboard:

```
VITE_API_BASE=https://kanakki.moajmalnk.com
```

### 2. Deploy Command
Make sure your Vercel build settings are:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## ✅ Testing Your Production Setup

### 1. Test Backend Health
```bash
curl https://kanakki.moajmalnk.com/health.php
```

### 2. Test Backend API Endpoints
```bash
# Test accounts
curl https://kanakki.moajmalnk.com/accounts.php

# Test categories
curl https://kanakki.moajmalnk.com/categories.php

# Test transactions
curl https://kanakki.moajmalnk.com/transactions.php
```

### 3. Test Frontend
Visit https://kanakk.moajmalnk.com and check:
- ✅ App loads without errors
- ✅ API calls work (check browser console)
- ✅ Data is fetched from backend

## 🔧 Troubleshooting

### CORS Issues
If you get CORS errors, ensure your backend `config.php` has the correct frontend URL in `$allowedOrigins`.

### Database Connection Issues
1. Verify database credentials in `.env`
2. Check if database exists
3. Ensure database user has proper permissions

### API Not Found (404)
1. Check if backend files are uploaded correctly
2. Verify server configuration for PHP
3. Check if `.htaccess` is needed for URL rewriting

## 🔒 Security Checklist

- [ ] Strong JWT secret generated
- [ ] Database password is secure
- [ ] Debug mode disabled in production
- [ ] CORS configured for specific origins only
- [ ] `.env` file has proper permissions (600)
- [ ] Error logging enabled

## 📱 Final Steps

1. **Deploy Backend**: Upload to `kanakki.moajmalnk.com`
2. **Configure Vercel**: Set environment variables
3. **Test Everything**: Use the testing commands above
4. **Update DNS**: Ensure both domains point to correct services
5. **SSL/HTTPS**: Verify both domains have valid SSL certificates

Your app should now be fully functional at https://kanakk.moajmalnk.com!
