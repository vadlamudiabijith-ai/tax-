# Deployment Checklist

## Pre-Deployment

### 1. Code Review
- [ ] All features tested locally
- [ ] Build passes without errors (`npm run build`)
- [ ] No console errors in browser
- [ ] All environment variables documented
- [ ] Security best practices followed

### 2. Database Setup
- [ ] Supabase project created
- [ ] All migrations applied in order
- [ ] RLS policies enabled on all tables
- [ ] Test data inserted (optional)
- [ ] Database backup configured

### 3. Environment Configuration
```bash
# Required environment variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Deployment Steps

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Configure Environment Variables**
- Go to Vercel Dashboard → Settings → Environment Variables
- Add all variables from `.env`
- Redeploy after adding variables

### Option 2: Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Environment Variables**: Add in Site Settings

### Option 3: AWS Amplify

1. **Connect Repository**
2. **Build Settings**:
   - Build Command: `npm run build`
   - Base Directory: `/`
   - Output Directory: `dist`
3. **Add Environment Variables**

## Post-Deployment

### 1. System Verification
- [ ] Homepage loads correctly
- [ ] Login/Signup works
- [ ] Tax payment flow works
- [ ] Crowdfunding campaigns display
- [ ] System status page shows correct data
- [ ] Service worker registers successfully

### 2. Feature Testing
- [ ] Tax calculator works
- [ ] Payment verification works
- [ ] Help & support displays
- [ ] Deadline management shows deadlines
- [ ] Browser warning shows on IE
- [ ] Offline page works (disable network)

### 3. Performance Check
- [ ] Lighthouse score > 90
- [ ] Page load time < 3s
- [ ] First contentful paint < 1.5s
- [ ] Time to interactive < 3s
- [ ] No console errors

### 4. Security Verification
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] CORS properly set
- [ ] No sensitive data in client
- [ ] Rate limiting active

### 5. Monitoring Setup
- [ ] Error tracking enabled (Sentry recommended)
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured
- [ ] Alert notifications set up
- [ ] Log aggregation working

## Production Configuration

### Cloudflare Setup (Recommended CDN)

1. **Add Site to Cloudflare**
2. **SSL/TLS**: Full (strict)
3. **Enable Features**:
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - HTTP/3
   - WAF

4. **Cache Rules**:
```
/assets/* - Cache everything, 1 year
/*.js - Cache everything, 1 year
/*.css - Cache everything, 1 year
/*.html - Cache 5 minutes
/api/* - No cache
```

5. **Security Rules**:
   - Rate limiting: 100 requests/minute per IP
   - Bot fight mode: Enabled
   - Challenge passage: 30 minutes

### Service Worker Configuration

The service worker is automatically registered. Verify it's working:

1. Open DevTools → Application → Service Workers
2. Should see "service-worker.js" activated
3. Test offline mode:
   - Open DevTools → Network
   - Select "Offline"
   - Reload page
   - Should see offline.html

## Rollback Procedure

If issues are detected:

1. **Immediate Rollback**
```bash
# Vercel
vercel rollback

# Or redeploy previous version
git checkout previous-commit
vercel --prod
```

2. **Notify Users**
- Update system status page
- Send email to affected users
- Post on social media

3. **Fix and Redeploy**
- Fix the issue locally
- Test thoroughly
- Deploy again

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build -- --mode production

# Check for large dependencies
npx vite-bundle-visualizer
```

### CDN Assets
- Images should be < 100KB
- Use WebP format where possible
- Lazy load images below the fold
- Use appropriate cache headers

### Database Optimization
- Enable connection pooling
- Add indexes for frequent queries
- Use read replicas for heavy loads
- Monitor slow queries

## Maintenance Schedule

### Daily
- Check error logs
- Monitor system status
- Review failed payments

### Weekly
- Database backup verification
- Security updates
- Performance metrics review

### Monthly
- Full backup test restore
- Security scan
- Dependency updates
- Performance optimization

### Quarterly
- Penetration testing
- DR drill
- Capacity planning
- Security audit

## Monitoring Dashboards

### Application Metrics
- Response time (avg, p95, p99)
- Error rate (4xx, 5xx)
- Request throughput
- Active users

### Infrastructure Metrics
- CPU usage
- Memory usage
- Disk I/O
- Network bandwidth

### Business Metrics
- Payment success rate
- User registrations
- Active campaigns
- Total contributions

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

### Service Worker Issues
```bash
# Unregister all service workers
# Run in browser console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister())
})
```

### Database Connection Issues
- Check environment variables
- Verify Supabase project is active
- Check RLS policies aren't blocking queries
- Verify API keys are correct

### Performance Issues
- Check CDN cache hit rate
- Review database query performance
- Check for memory leaks
- Monitor server response times

## Emergency Contacts

**Critical Issues (24/7)**
- On-call DevOps: [PagerDuty]
- Security Team: security@taxfundportal.gov

**High Priority (Business Hours)**
- Support Team: support@taxfundportal.gov
- Development Team: [Slack #engineering]

**General Inquiries**
- Email: info@taxfundportal.gov
- Phone: 1800-180-1961

## Success Criteria

Deployment is considered successful when:
- [ ] All automated tests pass
- [ ] Manual smoke tests pass
- [ ] No critical errors in logs (first 30 minutes)
- [ ] Performance metrics within acceptable range
- [ ] User-facing features work as expected
- [ ] Monitoring and alerts active
- [ ] Team notified of deployment

---

**Last Updated**: 2025-11-01
**Version**: 1.0.0
