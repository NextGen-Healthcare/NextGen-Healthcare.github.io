# Eventbrite Integration Guide

## The Challenge

Eventbrite's API requires a **private OAuth token** for authentication, which cannot be exposed in client-side JavaScript (it would be visible to anyone viewing your site's source code).

## Solutions (Choose One)

### ✅ **Option A: Manual Entry (Recommended for Now)**

Continue using `events.json` for upcoming events, just like you do for past events.

**Pros:**
- No API setup needed
- Full design control
- Works immediately
- No security concerns

**Cons:**
- Manual updates when you create new events

### ⚡ **Option B: Server-Side Proxy**

Set up a simple serverless function (Netlify, Vercel, or Cloudflare Workers) that:
1. Securely stores your Eventbrite API token
2. Fetches events from Eventbrite
3. Returns them to your site

**Pros:**
- Automatic updates from Eventbrite
- Secure token handling
- Full brand control

**Cons:**
- Requires setting up serverless function
- Need Eventbrite API token

### 🔄 **Option C: GitHub Actions Cache**

Use GitHub Actions to fetch events twice-weekly and update a JSON file automatically.

**Pros:**
- Free on GitHub
- Automatic twice-weekly sync (conserves API credits)
- No additional services needed

**Cons:**
- Events update twice per week (Monday & Thursday, not real-time)

## My Recommendation

For your use case, I recommend **Option A** (manual entry) or **Option C** (GitHub Actions).

Would you like me to:

1. **Revert to manual events** - Use events.json for upcoming events (like past events)
2. **Set up GitHub Actions** - Auto-sync from Eventbrite daily
3. **Keep the iframe** - Simplest, but less brand control

Let me know which direction you prefer!
