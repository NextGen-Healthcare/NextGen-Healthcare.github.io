# Eventbrite Auto-Sync Setup Instructions

Your site is now configured to automatically sync events from Eventbrite daily using GitHub Actions!

## 🔧 Setup Steps (One-Time)

### 1. Get Your Eventbrite API Token

1. Go to https://www.eventbrite.com/account-settings/apps
2. Click **"Create New API Key"**
3. Fill in:
   - **Application Name**: NextGen Healthcare Website
   - **Application URL**: https://nextgen-healthcare.github.io
4. Click **Create Key**
5. Copy your **Private Token** (starts with `XXXXXXXXXXXXXXXX`)

### 2. Add Token to GitHub Secrets

1. Go to your GitHub repository: https://github.com/NextGen-Healthcare/NextGen-Healthcare.github.io
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Fill in:
   - **Name**: `EVENTBRITE_TOKEN`
   - **Secret**: Paste your Eventbrite Private Token
5. Click **Add secret**

### 3. Test the Workflow

1. Go to **Actions** tab in your GitHub repository
2. Click **"Sync Eventbrite Events"** workflow
3. Click **"Run workflow"** → **"Run workflow"** (green button)
4. Wait 30-60 seconds for it to complete
5. Check the **assets/data/eventbrite-upcoming.json** file - it should now contain your events!

## ✅ What Happens Next

- **Twice-Weekly Sync**: Every Monday and Thursday at 6 AM UTC (7 AM BST), GitHub Actions will automatically:
  1. Fetch all live/upcoming events from your Eventbrite organizer
  2. Save them to `assets/data/eventbrite-upcoming.json`
  3. Commit and push changes to your repository
  4. Your website will automatically show the updated events

- **Manual Trigger**: You can manually trigger the sync anytime from the Actions tab

- **Branded Display**: Events appear in fully-branded cards matching your site design (blue accent, shadows, your typography)

## 🎨 Event Cards Include

- Event name (as clickable link)
- Date and time (formatted nicely)
- Location (city/venue or "Online")
- Summary/description (first 150 characters)
- Event image (if uploaded to Eventbrite)
- Badges: "FREE" for free events, "SOLD OUT" if tickets are gone
- "Register on Eventbrite" button (or disabled "Sold Out" button)

## 📝 How to Add New Events

1. **Create event on Eventbrite** (https://www.eventbrite.com/create)
2. **Publish it** (set to "Public")
3. **Wait** - it will appear on your site within 24 hours (or trigger workflow manually for instant update)

No need to edit any files manually!

## 🔍 Troubleshooting

**Events not showing?**
1. Check the Actions tab for errors
2. Verify your `EVENTBRITE_TOKEN` secret is set correctly
3. Ensure events are "Published" (not Draft) on Eventbrite
4. Make sure events are future-dated

**Want to test locally?**
```bash
# Install Python dependencies
pip install requests

# Set your token
export EVENTBRITE_TOKEN="your_token_here"

# Run the script
python .github/scripts/fetch-eventbrite.py
```

## 📂 File Structure

```
.github/
  workflows/
    sync-eventbrite.yml       # GitHub Action workflow (runs daily)
  scripts/
    fetch-eventbrite.py       # Python script that fetches events

assets/
  data/
    eventbrite-upcoming.json  # Auto-generated (don't edit manually)
  js/
    eventbrite-integration.js # Displays events on the page

pages/
  events.html                 # Your Events page
```

## 🚀 Done!

Your site now has:
- ✅ Automatic event syncing from Eventbrite
- ✅ Fully branded event cards
- ✅ No manual updates needed
- ✅ Secure token handling (never exposed to visitors)

Just create events on Eventbrite and they'll appear on your site automatically! 🎉
