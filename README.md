# Hearthstone 🐺
**A Digital Legacy Preservation Service**
Hearthstone is a digital memory vault and guided autobiography service designed specifically for **Baby Boomers and the Silent Generation**. Architected as a solo side project, the platform empowers users to document, secure, and share their life stories through a high-trust, voice-first interface.
## 核心 (The Core)
 * **The 52-Week Journey**: A year-long guided autobiography delivered via weekly sensory-driven email prompts (e.g., "The Roots," "Coming of Age," "Milestones").
 * **Voice-First Recording**: A tablet-optimized interface featuring a "Big Red Button" and real-time transcription via OpenAI Whisper, designed for users who prefer speaking over typing.
 * **Co-Pilot Dashboard**: A secure hub for adult children (the "Sandwich Generation") to support their parents' progress without infringing on their privacy.
 * **25-Year Stewardship**: A commitment to data retention and format migration, framed as "Responsible Stewardship" rather than a subscription-based "forever" promise.
## 技术栈 (Tech Stack)
 * **Framework**: Next.js 14 (App Router) for a full-stack, Vercel-native experience.
 * **Backend**: Supabase (PostgreSQL, Auth, and Storage).
 * **AI/Transcriptions**: OpenAI Whisper for audio-to-text processing.
 * **Payments**: Stripe for one-time $397 Legacy Package and $49 Concierge add-ons.
 * **Emails**: Resend for automated weekly prompts and concierge sequences.
## 设计原则 (UX Principles)
 * **Husky Trust Anchor**: Constant presence of the husky/wolf logo to reinforce professional credibility and long-term security.
 * **High Contrast & Plain Language**: UI designed for older eyes and zero tech jargon.
 * **Single-Action Focus**: Every email and screen contains exactly one clear action to prevent decision paralysis.
 * **ARIA 1.2 Compliance**: Robust accessibility with focus restoration, keyboard navigation, and semantic HTML for screen readers.