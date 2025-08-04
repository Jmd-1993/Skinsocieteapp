# 🚀 Skin Societé Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Method 1: Direct GitHub Connection
1. **Push to GitHub** (if you haven't already):
   ```bash
   # If this is your first push:
   git remote add origin https://github.com/YOUR_USERNAME/skin-societe.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your `skin-societe` repository
   - Configure environment variables (see below)
   - Deploy!

3. **Your live URL**: `https://skin-societe.vercel.app`

### Method 2: Vercel CLI (Faster)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
cd /Users/joshmills/skin-societe
vercel

# Follow prompts, then get instant URL!
```

## 🔧 Environment Variables Setup

**IMPORTANT**: Add these to your hosting platform:

### Vercel Environment Variables:
```
PHOREST_USERNAME=global/josh@skinsociete.com.au
PHOREST_PASSWORD=ROW^pDL%kxSq
PHOREST_BUSINESS_ID=IX2it2QrF0iguR-LpZ6BHQ
NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app
```

### How to Add in Vercel:
1. Go to your project dashboard
2. Settings → Environment Variables
3. Add each variable above
4. Redeploy

## 🌐 Alternative Hosting Options

### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

### Railway
1. Go to [railway.app](https://railway.app)
2. "Deploy from GitHub"
3. Select your repository
4. Add environment variables
5. Deploy!

## 🔒 Custom Domain Setup

Once deployed, you can add custom domains:
- `app.skinsociete.com.au`
- `portal.skinsociete.com.au`
- `beauty.skinsociete.com.au`

### DNS Configuration:
```
Type: CNAME
Name: app (or subdomain)
Value: your-app.vercel.app
```

## ✅ Pre-Deployment Checklist

- [x] All 77 Medik8 products loading
- [x] Phorest API integration working
- [x] Rewards system functional
- [x] Responsive design tested
- [x] No console errors
- [x] Environment variables configured
- [x] Git repository up to date

## 🧪 Post-Deployment Testing

Test these URLs once live:
- `/` - Homepage
- `/products` - Product catalog
- `/appointments` - Booking system
- `/rewards` - Gamification dashboard
- `/api/products` - API endpoint

## 📱 Production Features

**Live Features:**
- ✅ 77 Medik8 products with 15% loss-leader pricing
- ✅ Phorest integration (appointment viewing)
- ✅ Rewards & achievement system
- ✅ Mobile-responsive design
- ✅ Product search & filtering

**Pending Features:**
- ⏳ Appointment booking (waiting for Phorest API fix)
- ⏳ Shopping cart & checkout
- ⏳ Payment processing

## 🎯 Recommended Next Steps

1. **Deploy to Vercel** - Get live URL in 5 minutes
2. **Test all features** - Ensure everything works in production
3. **Set custom domain** - Professional app.skinsociete.com.au
4. **Share with team** - Get feedback from users
5. **Monitor performance** - Use Vercel analytics

---

**Built with ❤️ for Australia's first integrated beauty platform**