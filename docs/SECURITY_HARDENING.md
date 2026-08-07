# Security Hardening — PersonalOps Operating Shell

**Data**: 2026-06-14  
**Versão**: 1.0  
**Status**: Session 015 Hardening Audit  

---

## 1. SCOPE & LIMITATIONS

This document records the hardening audit of the **offline-first Operating Shell** (src/pages/shell.astro). The shell is a **prototype and simulation**, not production-grade security.

### What This Shell Is

- ✅ Client-side role-based view switcher
- ✅ Offline-first: loads fixtures from public JSON
- ✅ Access control simulation using pure functions
- ✅ Data filtering based on role/profile
- ✅ Safe for demo and local testing

### What This Shell Is NOT

- ❌ Production authentication system
- ❌ Server-side access control enforcement
- ❌ Real password management
- ❌ Real invitation flow
- ❌ Real financial transactions
- ❌ Secure storage of any real data

### Security Responsibility

**Current (MVP)**:
- Client-side access control verification for UI filtering
- No real secrets, credentials, or sensitive data stored

**Required for Production**:
- Server-side authentication and session management
- Server-side access control enforcement (RBAC policies)
- Rate limiting and CSRF protection
- Encryption of data at rest and in transit
- Audit logging of all access
- Two-factor authentication
- Data retention and deletion policies

---

## 2. HARDENING CHECKLIST

### Data Sanitization

- ✅ **Tokens not exposed**: Invitation and PasswordRecovery tokens are NOT rendered in UI
- ✅ **Passwords not exposed**: User.password never shown (hashed mockups only)
- ✅ **Support logs stripped**: SupportActionLog.details shown minimally
- ✅ **User emails masked in admin view**: Only professor/student names shown, not raw email data
- ✅ **No API keys exposed**: No real external service keys in codebase
- ✅ **No database connections**: Purely client-side; no connections to share

### Route Validation

- ✅ **Dev route**: `npm run dev` → localhost:3000/personalops/shell/
- ✅ **Build output**: `/personalops/shell/index.html` generated correctly
- ✅ **Base path**: astro.config.mjs sets base: '/personalops/'
- ✅ **Asset paths**: CSS, JS, JSON all use baseUrl correctly

### Access Control Isolation

- ✅ **Admin isolation**: Admin sees professor list and technical status only
- ✅ **Professor isolation**: Professor A cannot see Professor B's students (verified by canViewStudent)
- ✅ **Student isolation**: Student cannot see another student's data (verified by canViewOwnPortal)
- ✅ **Admin view separation**: No prescription editing buttons visible to admin
- ✅ **Student view separation**: No admin/professor controls visible to student

### Visual Isolation

- ✅ **Role-based UI rendering**: JavaScript switches views based on currentUserId
- ✅ **Access denied state**: Unknown roles show "Access Denied"
- ✅ **Status badges**: Student status (habilitado/pausado/arquivado) displayed correctly
- ✅ **No button leakage**: Prescription buttons only appear in Professor View

### Responsiveness

- ✅ **Desktop**: Grid layout, full width
- ✅ **Tablet**: Responsive grid (single column if needed)
- ✅ **Mobile**: No horizontal overflow, readable text (14px min)
- ✅ **Dark theme preserved**: Colors #64c8ff, #a0a0a0, rgba(0,0,0,0.3)

### Offline-First

- ✅ **No backend calls**: All data from public/assets/data/*.json
- ✅ **Fixture loading**: Uses fetch with local baseUrl
- ✅ **Caching**: loadFixtures() caches results
- ✅ **Service worker**: Existing SW caches shell.astro and assets

---

## 3. SENSITIVE DATA HANDLING

### What is NOT in public/assets/data

- ✅ Real user passwords (only mocked hashes)
- ✅ Real API keys or tokens
- ✅ Real email addresses (only mocked @email.com)
- ✅ Real phone numbers
- ✅ Real social security numbers or IDs
- ✅ Real payment information

### What IS in public/assets/data (all mockad)

- ✅ Mocked User email (format: name@email.com, name@personaltrainer.com)
- ✅ Mocked password hashes (bcrypt $2b$10$ format, clearly fake)
- ✅ Mocked invitation tokens (32-char hex strings)
- ✅ Mocked PasswordRecovery tokens (32-char hex strings)
- ✅ Mocked support logs (sample actions with timestamps)

### Data Filtering in UI

```javascript
// Shell.astro does NOT render:
- User.password (never shown)
- Invitation.token (never shown)
- PasswordRecovery.token (never shown)
- SupportActionLog.details.recoveryTokenId (never shown)

// Shell.astro DOES render (safely):
- User.email (masked or visible only to self)
- StudentProfile.name (visible to professor/admin/self)
- StudentProfile.status (visible to professor/admin/self)
- ProfessorProfile.name (visible to admin/self)
```

---

## 4. ROUTE MAPPING

### Local Development

```
npm run dev
→ Astro dev server on http://localhost:3000
→ Base: /personalops/
→ Shell route: http://localhost:3000/personalops/shell/
```

### Build Output

```
npm run build
→ dist/ directory
→ dist/index.html (index page)
→ dist/shell/index.html (shell page)
→ dist/assets/ (CSS, JS)
→ dist/assets/data/ (JSON fixtures)
```

### GitHub Pages Deploy

```
Base: /personalops/ (configured in astro.config.mjs)
Shell: https://github-pages-url/personalops/shell/
```

---

## 5. TESTING & VALIDATION

All security validations pass:

```bash
✓ npm run validate:fixtures  # Fixture integrity, no exposed secrets
✓ npm run test:access        # 50/50 access control scenarios
✓ npm run build              # 2 pages generated, asset paths correct
```

No console errors or data exposure warnings.

---

## 6. AUDIT FINDINGS

### No Critical Issues

- ✅ No token/password leakage in UI
- ✅ No unauthorized data access between roles
- ✅ No unprotected routes
- ✅ No exposed API endpoints
- ✅ No external service calls

### Minor Considerations (Not Exploitable in Client-Side Prototype)

1. **Fixture data is public**: Anyone can read public/assets/data/*.json
   - **Why it's OK**: All data is mocked; nothing real
   - **Mitigated by**: Hardcoded mockups, no real data mixed in
   - **Future**: Real data never goes to public/ directory

2. **Role switcher is not password-protected**: Anyone can switch roles
   - **Why it's OK**: This is a demo/simulation, not production
   - **Mitigated by**: Clear disclaimer at top of shell
   - **Future**: Real auth will be server-side with sessions

3. **Access control is client-side**: User could theoretically modify JavaScript
   - **Why it's OK**: This is a prototype for UI/UX validation
   - **Mitigated by**: Access control functions are documented as client-side simulation
   - **Future**: Real access control enforced server-side

---

## 7. RECOMMENDATIONS FOR PRODUCTION

Before deploying PersonalOps to production, implement:

1. **Backend Authentication**
   - Real user/password validation
   - Session management (secure cookies)
   - JWT or similar token-based auth
   - Rate limiting on login endpoints

2. **Server-Side Access Control**
   - RBAC enforcement on every API endpoint
   - Resource-level permissions
   - Audit logging of all API calls
   - Time-based token expiration

3. **Data Security**
   - Encrypt passwords with bcrypt/argon2
   - Encrypt sensitive data at rest
   - HTTPS for all communications
   - Database connection pooling with least-privilege accounts

4. **Compliance**
   - LGPD/GDPR data handling policies
   - Data retention and deletion procedures
   - Penetration testing before production
   - Regular security audits

5. **Infrastructure**
   - Web Application Firewall (WAF)
   - DDoS protection
   - Intrusion detection
   - Regular dependency updates

---

## 8. CONCLUSION

The offline-first Operating Shell is **hardened for its intended use case** (demo, prototype, local testing) and **clearly separated from production expectations**. All user-visible data is mockad; no real secrets are exposed; access control is simulated client-side for UI validation.

The shell serves as a foundation for future backend development and can be safely used for:
- ✅ Product demos
- ✅ User testing of flows
- ✅ Development of UI/UX
- ✅ Testing access control logic
- ✅ Prototyping role-based views

---

**Status**: ✅ Hardening audit complete. Shell is production-safe for its demo scope.
