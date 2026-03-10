

# Security Audit: Attacker's Perspective

Here's what I'd exploit if I were attacking this application, ranked by severity.

---

## CRITICAL Vulnerabilities

### 1. Cross-Organization Data Leak via Tag Matching
**Attack**: Register for Org A, get assigned the tag "finance". Now I can read **all** people and leads records across **every** organization that also use the "finance" tag — including emails, phone numbers, LinkedIn URLs, and notes.

**Root cause**: The RLS policies `Users can view people matching their tags` and `Users can view leads matching their tags` check tag overlap but never verify `organization_id`. The `user_has_matching_lead_tag` function also has no org filter.

**Impact**: Full PII exposure across tenant boundaries.

**Fix**: Add `AND organization_id = get_user_org_id(auth.uid())` to both tag-matching policies, and update the `user_has_matching_lead_tag` function similarly.

### 2. teammate_profiles View Has Zero RLS Protection
**Attack**: Query `SELECT * FROM teammate_profiles` — returns **all** users' names and emails across every organization, not just my teammates.

**Root cause**: It's a view with no RLS policies. The `security_invoker` flag helps with the underlying `profiles` table, but the view itself has no row filtering if queried directly via PostgREST.

**Fix**: Add a proper RLS policy or replace with a function that filters by org.

### 3. Edge Function JWT Verification Disabled
**Attack**: The `invite-team-member` function has `verify_jwt = false` in config.toml. While the function does manual auth checking, this means unauthenticated requests reach the function handler. If there's any code path that bypasses the auth check, it's exploitable.

**Fix**: Set `verify_jwt = true` and rely on Supabase's built-in JWT verification as the first layer.

---

## HIGH Vulnerabilities

### 4. No Authorization Check on Team Invites
**Attack**: Any org member (even `customer_user`) can invoke `invite-team-member`. The function only checks if the caller is *a member* of the org — not if they're an admin. So a regular user can add anyone to their team.

**Fix**: Check caller has `customer_admin` or higher role before allowing invites.

### 5. No Rate Limiting on Auth Endpoints
**Attack**: Brute-force passwords against the sign-in form. There's no client-side throttling, no CAPTCHA, and Supabase's default rate limits are generous.

**Fix**: Add rate limiting (client-side cooldowns + consider enabling Supabase's stricter rate limits).

### 6. Leaked Password Protection Disabled
**Attack**: Users can set passwords that have appeared in known data breaches. This makes credential stuffing attacks more likely to succeed.

**Fix**: Enable leaked password protection in auth settings.

---

## MEDIUM Vulnerabilities

### 7. CORS Wildcard on Edge Function
**Attack**: The `invite-team-member` function sets `Access-Control-Allow-Origin: *`, allowing any website to make cross-origin requests to it. Combined with #3 (no JWT verification), a malicious site could trigger team additions if a user visits it while authenticated.

**Fix**: Restrict CORS to your actual domain(s).

### 8. Client-Side Admin Check is Cosmetic
**Attack**: The `isAdmin` flag is computed client-side from roles. While RLS enforces server-side, the client routing (`ProtectedRoute`) can be bypassed by modifying JavaScript. An attacker could navigate to admin pages and see the UI (though data queries would fail due to RLS).

**Impact**: Low (data is protected by RLS), but admin UI exposure is undesirable.

### 9. No Input Sanitization on Org Slug
**Attack**: The `generateSlug` function strips special characters but doesn't prevent slugs that collide with app routes (e.g., "admin", "auth", "reset-password"). A user could create an org named "Admin" and get slug "admin", potentially causing routing conflicts.

**Fix**: Add a reserved-words blocklist for slugs.

### 10. Error Messages Reveal System State
**Attack**: Error messages like "This email is already registered" and "This user is already with another organisation" confirm whether an email exists in the system and which org they belong to — useful for enumeration.

**Fix**: Use generic error messages that don't reveal user existence.

---

## Recommended Fix Priority

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1 | Cross-org data leak via tags | CRITICAL | Low — update 2 RLS policies + 1 function |
| 2 | teammate_profiles no RLS | CRITICAL | Low — add policy or recreate view |
| 3 | Edge function JWT disabled | HIGH | Trivial — config change |
| 4 | No role check on invites | HIGH | Low — add role check in edge function |
| 5 | No rate limiting | HIGH | Medium |
| 6 | Leaked password protection | HIGH | Trivial — config change |
| 7 | CORS wildcard | MEDIUM | Trivial |
| 8-10 | UI/enumeration issues | MEDIUM | Low |

---

Shall I fix all of these? I'd recommend starting with items 1-4 as they represent actual data exposure and privilege escalation risks.

