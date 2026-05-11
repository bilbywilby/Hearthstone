# Hearthstone Test Matrix 🐺
**Production Readiness Verification**

This matrix covers the critical paths that must be verified before the first onboarding call. Each test case is tied to a specific user story and deployment risk.

---

## Test Matrix

| Category | Test Case | Expected Result | Priority | Status |
|---|---|---|---|---|
| **Onboarding** | Stripe Webhook: Completion | Success triggers the "Legacy Welcome" email sequence via Resend. | 🔴 Critical | ☐ |
| **Onboarding** | Concierge Add-on Filter | Users with the $49 add-on receive the "Schedule Orientation" email instead of the standard login. | 🔴 Critical | ☐ |
| **Recording** | Local Storage Persistence | Audio chunks are saved to the browser's local database to survive tab crashes or battery death. | 🔴 Critical | ☐ |
| **Recording** | Heartbeat API Sync | Accumulated audio buffers are streamed to the server every 30 seconds. | 🔴 Critical | ☐ |
| **Co-Pilot** | Privacy Lock | Co-Pilot dashboard shows engagement status/streaks but blocks access to raw recordings/transcripts. | 🔴 Critical | ☐ |
| **Co-Pilot** | "Conversation Starter" | "Copy to Text" button correctly captures next week's prompt for the child to send to the parent. | 🟡 High | ☐ |
| **UI/UX** | Modal Focus Trap | Opening the recording modal traps keyboard focus inside; closing it restores focus to the trigger button. | 🟡 High | ☐ |
| **UI/UX** | Dropdown Wrap | Keyboard navigation (↑/↓) wraps from bottom to top and top to bottom in list selections. | 🟡 High | ☐ |
| **Resilience** | "Elena" Recovery | If orphaned audio chunks are detected on mount, the "Elena" prompt offers to recover the lost minutes. | 🟡 High | ☐ |
| **Integrations** | Whisper Retry | If the Whisper API fails, the system logs a retry event and retains the audio chunk for the next heartbeat. | 🟡 High | ☐ |

---

## Test Case Details

### 1. Stripe Webhook: Completion (Onboarding - Critical)

**Objective:** Verify that successful payment via Stripe triggers the "Legacy Welcome" email sequence.

**Pre-conditions:**
- Stripe live mode configured in Vercel environment variables
- Resend API key configured
- Webhook endpoint: `/api/webhooks/stripe` deployed and listening

**Steps:**
1. Complete purchase of $397 Legacy Package on production site
2. Monitor webhook logs (Stripe dashboard → Events)
3. Verify webhook delivery status: `200 OK`
4. Check Resend logs for email dispatch
5. Confirm "Legacy Welcome" email arrives in user's inbox within 5 minutes

**Expected Result:**
- Webhook fires with `payment_intent.succeeded` event
- Email sent via Resend within 5 minutes
- User record created in Supabase `users` table with `legacy_package_purchased = true`
- User can log in and access dashboard

**Test Data:**
- Test card: 4242 4242 4242 4242 (Stripe test mode)
- Production: Use real card or Stripe test account promoted to live

---

### 2. Concierge Add-on Filter (Onboarding - Critical)

**Objective:** Verify that users with the $49 Concierge add-on receive the correct email sequence.

**Pre-conditions:**
- Stripe products configured: Legacy Package ($397) + Concierge add-on ($49)
- Resend email templates created: "Schedule Orientation" (concierge users) vs. standard login prompt

**Steps:**
1. Purchase Legacy Package + Concierge add-on together
2. Verify webhook creates user with `has_concierge_addon = true` in Supabase
3. Monitor Resend email dispatch
4. Confirm user receives "Schedule Orientation" email, not standard login prompt

**Expected Result:**
- Database query `SELECT * FROM users WHERE has_concierge_addon = true` returns user
- "Schedule Orientation" email sent (not standard login prompt)
- Email includes concierge contact info and scheduling link

**Test Data:**
- Use same test card as above, add concierge add-on to cart

---

### 3. Local Storage Persistence (Recording - Critical)

**Objective:** Verify audio chunks survive browser crashes and battery loss via local database.

**Pre-conditions:**
- Frontend deployed with IndexedDB or localStorage implementation
- Recording modal functional

**Steps:**
1. Open recording modal
2. Record 60 seconds of audio (generates multiple chunks every 5 seconds)
3. Kill browser tab/process before uploading
4. Reopen page → check DevTools → Application → Storage for persisted chunks
5. Verify chunk metadata (timestamp, duration, audio data blob)

**Expected Result:**
- All chunks present in IndexedDB with correct blob data
- Chunks survive across browser restarts
- Chunks cleared only after successful Whisper transcription

**Test Data:**
- Record any speech for 60 seconds
- Device: iPad 5th gen (low memory scenario)

---

### 4. Heartbeat API Sync (Recording - Critical)

**Objective:** Verify accumulated audio buffers are streamed to server every 30 seconds.

**Pre-conditions:**
- Backend API endpoint `/api/audio/heartbeat` deployed
- Supabase storage configured for audio chunks

**Steps:**
1. Open DevTools → Network tab
2. Start recording
3. Monitor HTTP requests to `/api/audio/heartbeat`
4. Verify request fires every 30 seconds with audio blob payload
5. Check response status: `200 OK`
6. Verify chunk uploaded to Supabase storage path: `recordings/{parent_id}/{week_number}.wav`

**Expected Result:**
- Heartbeat request fires every 30 seconds
- Audio blob payload sent with chunk metadata
- Server responds with `200 OK` and chunk ID confirmation
- Storage path correctly namespaced by parent_id and week_number

**Test Data:**
- Record for 90+ seconds to capture multiple heartbeat cycles

---

### 5. Privacy Lock (Co-Pilot - Critical)

**Objective:** Verify Co-Pilot dashboard shows engagement metadata but blocks raw recordings.

**Pre-conditions:**
- Parent and co-pilot user accounts created
- Parent has completed at least 3 recordings
- Co-Pilot dashboard deployed with RLS policies

**Steps:**
1. Log in as co-pilot user (adult child)
2. Navigate to Co-Pilot dashboard
3. Verify visible: parent name, engagement streak ("3 prompts this week"), completion %
4. Attempt to access: recordings list, transcript text, audio playback
5. Verify blocks all attempts with 403 Forbidden or "Access Denied" message

**Expected Result:**
- Co-Pilot sees engagement metrics only
- No raw audio or transcript data visible
- API calls to `/api/recordings/{id}` return 403 Forbidden
- RLS policy on `recordings` table blocks non-owner access

**Test Data:**
- Parent user ID: test_parent_123
- Co-pilot user ID: test_copilot_456

---

### 6. "Conversation Starter" (Co-Pilot - High)

**Objective:** Verify "Copy to Text" button correctly captures next week's prompt.

**Pre-conditions:**
- Co-Pilot dashboard deployed
- Next week's prompt loaded from email template system

**Steps:**
1. Log in as co-pilot user
2. Navigate to "Conversation Starter" section
3. Click "Copy to Text" button
4. Paste text into device clipboard
5. Verify content matches next week's prompt email

**Expected Result:**
- Button copies prompt text to clipboard
- Text includes prompt + sensory cue (e.g., "Close your eyes. What's the earliest memory?")
- User can paste into Messages/Email to send to parent

---

### 7. Modal Focus Trap (UI/UX - High)

**Objective:** Verify keyboard focus is trapped inside recording modal.

**Pre-conditions:**
- Recording modal component deployed
- Focus management library (e.g., react-focus-guard) integrated

**Steps:**
1. Open recording modal
2. Press Tab repeatedly → verify focus cycles only within modal elements
3. Press Shift+Tab → verify reverse focus cycling stays within modal
4. Verify focus doesn't escape to body/background
5. Close modal → verify focus restores to trigger button

**Expected Result:**
- Tab cycles through: Record Button → Stop Button → Close Button → back to Record Button
- Shift+Tab cycles in reverse
- No focus escape to background
- Post-close focus returns to original trigger element

**Test Data:**
- Use keyboard only (no mouse)
- Test with NVDA/JAWS screen reader

---

### 8. Dropdown Wrap (UI/UX - High)

**Objective:** Verify keyboard navigation in dropdowns wraps seamlessly.

**Pre-conditions:**
- Dropdown component deployed (e.g., week selection, prompt category)
- Arrow key handlers implemented

**Steps:**
1. Open dropdown menu
2. Press ↓ arrow repeatedly → verify items cycle from top to bottom and wrap to top
3. Press ↑ arrow repeatedly → verify items cycle from bottom to top and wrap to bottom
4. Press Enter on highlighted item → verify selection confirmed
5. Press Escape → verify dropdown closes

**Expected Result:**
- Down arrow on last item wraps to first item
- Up arrow on first item wraps to last item
- Enter key selects highlighted option
- Escape closes dropdown

---

### 9. "Elena" Recovery (Resilience - High)

**Objective:** Verify orphaned audio chunks are detected and offered for recovery.

**Pre-conditions:**
- IndexedDB persistence implemented
- Recovery UI component ("Elena" prompt) deployed

**Steps:**
1. Open recording modal and record 60 seconds
2. Open DevTools → Application → IndexedDB → hearthstone
3. Note the chunk records
4. Manually delete records from database (simulate crash before sync)
5. Reload page
6. Verify "Elena" recovery prompt appears: "We found X minutes of unsaved audio. Recover?"
7. Click "Recover" → verify chunks re-queued for upload

**Expected Result:**
- "Elena" prompt appears on mount if orphaned chunks detected
- Prompt displays correct minute count
- "Recover" button re-uploads chunks to server
- Chunks processed by Whisper as normal

---

### 10. Whisper Retry (Integrations - High)

**Objective:** Verify failed Whisper API calls are retried and logged.

**Pre-conditions:**
- OpenAI Whisper API integrated
- Retry logic with exponential backoff implemented
- Server logs configured (Sentry or Vercel)

**Steps:**
1. Simulate Whisper API failure (e.g., use invalid API key temporarily)
2. Send audio chunk to `/api/audio/heartbeat`
3. Monitor server logs for retry event: `[WHISPER_RETRY] chunk_id={id} attempt={n}`
4. Fix API key
5. Verify next heartbeat retries and succeeds
6. Confirm transcription appears on frontend

**Expected Result:**
- Chunk retained in queue on first failure
- Retry logged with timestamp and attempt count
- After fix, retry succeeds within 30-second heartbeat window
- No data loss; transcription eventually succeeds

---

## Test Execution Checklist

### Pre-Test (Setup)
- [ ] All environment variables loaded in staging environment
- [ ] Supabase RLS policies reviewed and active
- [ ] Stripe test/live mode switch prepared
- [ ] Resend templates deployed
- [ ] Test users created with various roles (parent, co-pilot, admin)

### Test Phases

**Phase 1: Critical Path (Blocking)**
- [ ] Test #1: Stripe Webhook Completion
- [ ] Test #2: Concierge Add-on Filter
- [ ] Test #3: Local Storage Persistence
- [ ] Test #4: Heartbeat API Sync
- [ ] Test #5: Privacy Lock

**Phase 2: User Experience (High)**
- [ ] Test #6: Conversation Starter
- [ ] Test #7: Modal Focus Trap
- [ ] Test #8: Dropdown Wrap
- [ ] Test #9: Elena Recovery
- [ ] Test #10: Whisper Retry

### Post-Test
- [ ] All tests passed in staging environment
- [ ] Ready for production deployment
- [ ] Deployment sign-off obtained

---

## Regression Test (Before Each Deploy)

Run this abbreviated checklist before deploying to production:

| Test | Steps | Pass/Fail |
|------|-------|-----------|
| **Payment → Email** | Purchase in test mode, verify Resend logs | ☐ |
| **Recording → Upload** | Record 60s, verify heartbeat requests in Network tab | ☐ |
| **Co-Pilot Privacy** | Log in as co-pilot, verify no transcript access | ☐ |
| **Focus Trap** | Open modal, press Tab 5x, verify focus cycles | ☐ |
| **Elena Recovery** | Delete IndexedDB records, reload, verify recovery prompt | ☐ |

---

## Sign-Off

| Test Category | Owner | Completed | Date |
|---|---|---|---|
| Onboarding | bilbywilby | ☐ | |
| Recording | bilbywilby | ☐ | |
| Co-Pilot | bilbywilby | ☐ | |
| UI/UX | bilbywilby | ☐ | |
| Resilience | bilbywilby | ☐ | |
| **ALL TESTS PASSED** | bilbywilby | ☐ | |

**Ready to deploy to production? Obtain sign-off above. Quack! 🦆**
