# Hearthstone Deployment Checklist 🦆
**Pre-Deploy Sanity Check — Ready to Ship**

Complete this checklist before promoting to production. Use this as your pre-flight runbook for every major deployment.

---

## 1. Environment & Secrets ✅
- [ ] **No NEXT_PUBLIC_ prefix on sensitive keys**
  - Verify: Search codebase for `NEXT_PUBLIC_SUPABASE`, `NEXT_PUBLIC_OPENAI`, `NEXT_PUBLIC_STRIPE`
  - All secrets must be server-only environment variables
- [ ] **Vercel environment variables configured**
  - `SUPABASE_URL` (server-only)
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - `OPENAI_API_KEY` (server-only)
  - `STRIPE_SECRET_KEY` (server-only)
  - `JWT_SECRET` (server-only)
  - `RESEND_API_KEY` (server-only)
- [ ] **Supabase Vault initialized**
  - Store `JWT_SECRET` in Supabase Vault
  - Store `OPENAI_API_KEY` in Supabase Vault
  - Verify access via server-only functions only
- [ ] **No secrets in `.env.local` committed to Git**
  - `.gitignore` includes `*.env.local`, `*.env`

---

## 2. RLS & Database Security 🔐
- [ ] **Supabase RLS policies enabled**
  - [ ] `recordings` table: `recordings/{parent_id}/{week_number}.wav` paths protected
  - [ ] Users can only access their own recordings
  - [ ] Co-Pilot users can read engagement metadata but NOT raw audio/transcripts
  - [ ] Service role can write only via authenticated API routes
- [ ] **Service-role keys rotated**
  - [ ] Old keys deactivated in Supabase
  - [ ] New key stored in Vercel secrets
- [ ] **Database backups automated**
  - [ ] Supabase backup frequency set to daily
  - [ ] Restore test completed in staging environment

---

## 3. Stripe & Webhooks 💳
- [ ] **Stripe live mode configured**
  - [ ] Switch from test to live API keys in Vercel
  - [ ] Webhook endpoint configured: `https://hearthstone.vercel.app/api/webhooks/stripe`
  - [ ] Webhook signing secret (`STRIPE_WEBHOOK_SECRET`) stored in Vercel
- [ ] **Webhook scenarios tested**
  - [ ] `payment_intent.succeeded` → "Legacy Welcome" email sequence triggered via Resend
  - [ ] `payment_intent.payment_failed` → User notified, retry offered
  - [ ] `charge.refunded` → Recording access revoked (if applicable)
  - [ ] Webhook replay tested (Stripe dashboard → Resend logs verified)
- [ ] **Payment success flow verified**
  - [ ] User purchases $397 Legacy Package
  - [ ] Webhook fires and creates user record in `users` table
  - [ ] Resend email triggers within 5 minutes
  - [ ] User can log in and access recording interface
- [ ] **Concierge add-on filter working**
  - [ ] Users with $49 add-on flag receive "Schedule Orientation" email instead of standard login prompt
  - [ ] Database query for `has_concierge_addon = true` returns correct users

---

## 4. Security Headers & Permissions 🛡️
- [ ] **Content Security Policy (CSP) headers set**
  - [ ] `next.config.js` includes CSP header middleware
  - [ ] Allows OpenAI Whisper API (`api.openai.com`)
  - [ ] Allows Stripe API (`js.stripe.com`)
  - [ ] Blocks `script-src` from inline scripts (nonce-based only)
- [ ] **HSTS enabled**
  - [ ] `Strict-Transport-Security: max-age=31536000` header present
- [ ] **X-Frame-Options set**
  - [ ] `X-Frame-Options: DENY` to prevent clickjacking
- [ ] **Referrer-Policy configured**
  - [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] **Camera/Microphone permissions**
  - [ ] `permissions.policy` header restricts to localhost and hearthstone.vercel.app domains
  - [ ] User prompted for permission before recording starts
  - [ ] Permission state persisted in local storage with user consent
- [ ] **No secrets exposed in client bundles**
  - [ ] Run `npm run build` and check `.next/static` for any API keys
  - [ ] Verify no keys in browser console logs
  - [ ] Check Network tab in DevTools for exposed credentials

---

## 5. Resilience & Infrastructure ⚙️
- [ ] **Heartbeat API sync working**
  - [ ] Audio chunks streamed to server every 30 seconds
  - [ ] Local storage persists chunks on browser crash/battery death
  - [ ] Test: Record → kill browser → reopen → "Elena" recovery prompt appears
- [ ] **Whisper retry logic verified**
  - [ ] If Whisper API fails, error logged and audio chunk retained
  - [ ] Next heartbeat (30 seconds) retries the failed chunk
  - [ ] Logs show: `[WHISPER_RETRY] chunk_id={id} attempt={n} timestamp={ts}`
- [ ] **Local database persistence**
  - [ ] IndexedDB or localStorage properly caches audio chunks
  - [ ] Chunks cleared only after successful Whisper transcription and server confirmation
  - [ ] Test on low-end tablet (iPad 5th gen) to verify performance
- [ ] **chime.wav file present**
  - [ ] `/public/sounds/chime.wav` exists and loads correctly
  - [ ] File is <100KB for fast load times
  - [ ] Test audio plays on first recording button click
- [ ] **Vercel Cron jobs active**
  - [ ] Cron job configured in `vercel.json` for Monday 8:00 AM ET
  - [ ] Email dispatch function tested in staging
  - [ ] Resend logs show all 52 weekly prompts queued correctly
  - [ ] Test: Manually trigger cron endpoint → verify email in inbox within 2 minutes

---

## 6. Accessibility & UX Checks 👁️
- [ ] **Modal focus trap**
  - [ ] Opening recording modal traps keyboard focus inside
  - [ ] Closing modal restores focus to trigger button
  - [ ] Test with Tab key and screen reader (NVDA/JAWS)
- [ ] **Dropdown keyboard navigation**
  - [ ] Arrow keys (↑/↓) navigate list items
  - [ ] Navigation wraps from bottom to top and vice versa
  - [ ] Enter key selects highlighted option
- [ ] **ARIA semantics verified**
  - [ ] Semantic HTML: `<button>`, `<main>`, `<nav>` used correctly
  - [ ] ARIA labels on form inputs: `aria-label="Record audio"`
  - [ ] ARIA live regions for async messages: `aria-live="polite"` on transcription updates
  - [ ] Role attributes where needed: `role="dialog"` on modal
- [ ] **High-contrast styles for tablet**
  - [ ] Test on iPad 5th gen (2017) with reduced motion enabled
  - [ ] Big Red Button clearly visible (≥44px touch target)
  - [ ] Text contrast meets WCAG AA: 4.5:1 for normal text, 3:1 for large text
  - [ ] Colors don't rely solely on red/green (colorblind-friendly)

---

## 7. Final Runbook — E2E Smoke Test 🚀

### Pre-Flight (Staging)
1. **Deploy to preview environment**
   - [ ] Run `vercel --prod` to staging URL
   - [ ] Verify all environment variables populated from Vercel secrets

2. **Smoke test: Full onboarding flow**
   - [ ] User purchases $397 Legacy Package (Stripe test mode → live mode switch)
   - [ ] Webhook fires and user record created in Supabase
   - [ ] Resend email received within 5 minutes ("Legacy Welcome" sequence)
   - [ ] User clicks email link → routed to `/dashboard`
   - [ ] Dashboard shows "Welcome, [Name]" and "Start Recording" button
   - [ ] Click "Start Recording" → modal opens, focus trapped
   - [ ] Big Red Button visible and clickable
   - [ ] Record 30 seconds of audio
   - [ ] Stop recording → audio chunks sent to server via heartbeat
   - [ ] Whisper transcription completes within 2 minutes
   - [ ] Transcript appears on screen with timestamp
   - [ ] Co-Pilot dashboard (as adult child) shows engagement streak but blocks raw recordings

3. **Test Co-Pilot privacy lock**
   - [ ] Log in as co-pilot user (adult child)
   - [ ] Verify: See "Parent recorded 3 prompts this week" but NO transcript/audio
   - [ ] "Conversation Starter" copy-to-text button works (copies next week's prompt)

4. **Test "Elena" recovery**
   - [ ] Simulate orphaned chunks: Open DevTools → delete IndexedDB records
   - [ ] Reload page → "Elena" prompt should appear: "We found X minutes of unsaved audio. Recover?"
   - [ ] Click "Recover" → chunks re-synced to server
   - [ ] Whisper processes successfully

---

### Go Live (Production)
5. **Promote to production**
   - [ ] All staging checks passed
   - [ ] Run one final production smoke test on live Stripe account
   - [ ] Monitor error logs for 1 hour post-deployment (check Sentry/Vercel)
   - [ ] Verify weekly cron job scheduled for Monday morning

6. **First onboarding call**
   - [ ] New user completes Stripe purchase (production, not test)
   - [ ] "Legacy Welcome" email arrives
   - [ ] User logs in and records first prompt
   - [ ] Transcription succeeds
   - [ ] Co-Pilot receives engagement notification

---

## Deployment Sign-Off

| Item | Status | Owner | Date |
|------|--------|-------|------|
| Env & Secrets | ☐ | bilbywilby | |
| RLS & Database | ☐ | bilbywilby | |
| Stripe & Webhooks | ☐ | bilbywilby | |
| Security Headers | ☐ | bilbywilby | |
| Resilience & Infra | ☐ | bilbywilby | |
| Accessibility | ☐ | bilbywilby | |
| E2E Smoke Test (Staging) | ☐ | bilbywilby | |
| E2E Smoke Test (Production) | ☐ | bilbywilby | |

**Ready to deploy? Sign off above and push to Vercel. Quack! 🦆**
