# Website Content Update Guide

**A simple guide for updating the NextGen Healthcare Network website - no coding experience required!**

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Adding Events](#adding-events)
3. [Adding Photos to Gallery](#adding-photos-to-gallery)
4. [Managing SIGs](#managing-sigs)
5. [Publishing Blog Posts](#publishing-blog-posts)
6. [Common Tasks Quick Reference](#common-tasks-quick-reference)
7. [Getting Help](#getting-help)

---

## 🚀 Getting Started

### What You Need

- **GitHub account** with access to the repository
- **Web browser** (Chrome, Firefox, Safari, or Edge)
- **Text editor** (Notepad, TextEdit, or VS Code)

### Understanding the Structure

Think of the website like a filing cabinet:
- **events.json** = List of all events
- **gallery.json** = Photo album index
- **sigs.json** = Special Interest Groups directory
- **sig-blog-index.json** = Blog post catalog

These files are like address books - they tell the website where to find information and how to display it.

### How to Edit Files

**Option 1: Edit Directly on GitHub (Easiest)**
1. Go to the repository on GitHub.com
2. Navigate to the file you want to edit
3. Click the pencil icon (Edit this file)
4. Make your changes
5. Scroll down and click "Commit changes"
6. Add a description of what you changed
7. Click "Commit changes" again

**Option 2: Edit Locally (More Control)**
1. Download the repository to your computer
2. Edit files with a text editor
3. Upload (commit) changes back to GitHub

💡 **Tip**: Start with Option 1 until you're comfortable!

---

## 📅 Adding Events

Events appear on the main homepage and the Events page.

### Step-by-Step Instructions

1. **Open the events file**
   - File location: `assets/data/events.json`
   - Click the pencil icon to edit

2. **Copy this template** for a new event:

```json
{
  "id": "unique-event-id-2025",
  "title": "Coffee & Catch-Up - Manchester",
  "date": "2025-12-15",
  "time": "18:00–19:30",
  "location": "Manchester",
  "category": "coffee",
  "categoryLabel": "Coffee & Catch-Ups",
  "short": "Informal networking over coffee",
  "details": "Join us at Costa Coffee, Oxford Road. Look for the NextGen group near the back. All welcome!",
  "link": "https://www.eventbrite.com/your-event"
}
```

3. **Fill in your event details**:

   - **id**: A unique name (use lowercase with hyphens, e.g., `2025-coffee-manchester-dec`)
   - **title**: The event name
   - **date**: Format as YYYY-MM-DD (e.g., 2025-12-15 for 15th Dec 2025)
   - **time**: Use format HH:MM–HH:MM with 24-hour clock
   - **location**: City or venue name
   - **category**: Choose from:
     - `coffee` - Coffee & Catch-Ups
     - `network` - Network Sessions
     - `iheem` - IHEEM Gatherings
     - `drinks` - Drinks events
     - `sig` - SIG-specific events
   - **categoryLabel**: Display name for the category
   - **short**: One sentence summary (appears on cards)
   - **details**: Full description with venue, parking, what to expect
   - **link**: URL for RSVP/tickets (LinkedIn, Eventbrite, etc.)

4. **Add your event to the list**:

   - Find the opening `[` bracket at the start of the file
   - Paste your event AFTER this bracket
   - Make sure to add a **comma** after the closing `}` if there are other events below it

   Example:
   ```json
   [
     {
       "id": "your-new-event",
       "title": "New Event",
       ...
     },
     {
       "id": "existing-event",
       "title": "Existing Event",
       ...
     }
   ]
   ```

5. **Check your formatting**:
   - Every opening `{` needs a closing `}`
   - Every opening `[` needs a closing `]`
   - Put commas between items, but NOT after the last item
   - Use double quotes `"` not single quotes `'`

6. **Save your changes**:
   - Scroll to bottom
   - Add commit message: "Add [event name] to events"
   - Click "Commit changes"

### ✅ Checklist Before Saving

- [ ] Date format is YYYY-MM-DD
- [ ] Event ID is unique (not used before)
- [ ] Category matches one of the standard categories
- [ ] RSVP link is correct and working
- [ ] Commas are in the right places
- [ ] All quotes are double quotes `"`

---

## 📸 Adding Photos to Gallery

The gallery displays photos from past events organized by date and category.

### Step-by-Step Instructions

#### Part 1: Upload the Photos

1. **Prepare your photos**:
   - Rename files simply: `01.jpeg`, `02.jpeg`, `03.jpeg`, etc.
   - File format: JPEG or JPG (preferred) or PNG
   - Recommended: Resize to max 1920px wide to keep files small

2. **Create a folder for your event**:
   - Location: `assets/img/gallery/`
   - Folder name format: `YYYY-MM-DD-category-location`
   - Examples:
     - `2025-12-15-coffee-manchester`
     - `2025-11-20-network-session`
     - `2025-10-10-iheem-birmingham`

3. **Upload photos to this folder**:
   - On GitHub: Navigate to `assets/img/gallery/`
   - Click "Add file" → "Upload files"
   - Create new folder by typing folder name in the filename box
   - Drag and drop your photos
   - Commit changes

#### Part 2: Add to Gallery Index

1. **Open the gallery file**:
   - File location: `assets/data/gallery.json`
   - Click the pencil icon to edit

2. **Find the `"photosByEvent"` section**:
   - It looks like this:
   ```json
   "photosByEvent": {
     "2024-10-08-iheem": [
       ...existing photos...
     ],
   ```

3. **Add your event**:
   - Copy this template:
   ```json
   "2025-12-15-coffee-manchester": [
     { "src": "../assets/img/gallery/2025-12-15-coffee-manchester/01.jpeg", "alt": "Coffee & Catch-Up – Manchester" },
     { "src": "../assets/img/gallery/2025-12-15-coffee-manchester/02.jpeg", "alt": "Coffee & Catch-Up – Manchester" },
     { "src": "../assets/img/gallery/2025-12-15-coffee-manchester/03.jpeg", "alt": "Coffee & Catch-Up – Manchester" }
   ],
   ```

4. **Customize the template**:
   - Change the folder name to match YOUR folder
   - Add one line for EACH photo
   - Update the numbers (01, 02, 03, etc.)
   - Update the description in "alt" (what the photo shows)
   - Add comma at the end of the closing `],` EXCEPT for the very last event

5. **Save your changes**:
   - Commit message: "Add gallery photos for [event name]"
   - Click "Commit changes"

### Understanding the Folder Name Format

The folder name tells the website important information:

```
2025-12-15-coffee-manchester
│    │  │  │      └─ Location
│    │  │  └─ Category (coffee, network, iheem, drinks, sig)
│    │  └─ Day
│    └─ Month
└─ Year
```

The website automatically:
- Sorts by date (newest first)
- Creates filter buttons for each category
- Shows location in the title

### ✅ Checklist Before Saving

- [ ] Folder name follows YYYY-MM-DD-category-location format
- [ ] Photos are named simply (01.jpeg, 02.jpeg, etc.)
- [ ] Each photo has an entry in gallery.json
- [ ] File paths match exactly (including .jpeg or .jpg)
- [ ] Alt text describes what's in the photo
- [ ] Commas are correct between items

---

## 👥 Managing SIGs (Special Interest Groups)

### Adding a New SIG

1. **Open the SIGs file**:
   - File location: `assets/data/sigs.json`
   - Click the pencil icon to edit

2. **Copy this template**:

```json
{
  "id": "sig-yourname",
  "name": "Your SIG Name",
  "short": "One sentence describing the focus area.",
  "details": "A longer paragraph explaining what the SIG covers, what topics you discuss, and what members can expect. Include specific examples of projects or initiatives.",
  "meeting": "Monthly",
  "channel": "Microsoft Teams",
  "leads": ["Lead Name 1", "Lead Name 2"],
  "tags": ["keyword1", "keyword2", "keyword3"]
}
```

3. **Fill in the details**:
   - **id**: Short identifier (lowercase with hyphens, e.g., `sig-energy`)
   - **name**: Official SIG name
   - **short**: Brief one-liner (shows on cards)
   - **details**: Full description (shows in popup when clicked)
   - **meeting**: How often you meet (Monthly, Quarterly, etc.)
   - **channel**: Where you meet (Microsoft Teams, WhatsApp, etc.)
   - **leads**: Array of lead names in square brackets
   - **tags**: Keywords for searching/filtering

4. **Add to the list**:
   - Add comma after previous SIG's closing `}`
   - Paste your new SIG
   - Do NOT add comma after your SIG if it's the last one

5. **Save changes**:
   - Commit message: "Add [SIG name] to SIGs list"
   - Click "Commit changes"

### Updating Existing SIG Information

1. Open `assets/data/sigs.json`
2. Find your SIG by searching for the name
3. Update the relevant fields (leads, meeting info, description, etc.)
4. Save with commit message: "Update [SIG name] information"

### ✅ Checklist

- [ ] SIG ID is unique and follows `sig-name` format
- [ ] Leads names are in square brackets `["Name 1", "Name 2"]`
- [ ] Tags are in square brackets with quotes
- [ ] Short description is concise (1-2 sentences)
- [ ] Details paragraph is informative but not too long

---

## 📝 Publishing Blog Posts

Blog posts are written in **Markdown** - a simple way to format text without HTML.

### Understanding Markdown

Markdown uses simple symbols for formatting:

```markdown
# Large Heading
## Medium Heading
### Smaller Heading

**Bold text**
*Italic text*

- Bullet point
- Another bullet point

1. Numbered item
2. Another numbered item

[Link text](https://example.com)
![Image description](path/to/image.jpg)
```

### Creating a New Blog Post

#### Part 1: Write the Post

1. **Open a text editor** (Notepad, TextEdit, VS Code)

2. **Start with the frontmatter** (metadata about the post):

```markdown
---
id: my-post-2025
sigId: sig-energy
sigName: Energy & Sustainability
title: My Blog Post Title
date: 2025-10-23
author: Your Name
authorRole: Your Job Title
excerpt: A one-sentence summary that appears on the blog card view
tags: [keyword1, keyword2, keyword3]
published: false
---
```

3. **Write your content** below the `---`:

```markdown
## Introduction

Write your introduction paragraph here...

### Key Points

1. First main point
2. Second main point
3. Third main point

## Main Content

Add your detailed content here with paragraphs, bullet points, and headings.

### Adding Images

![Description of image](../img/blog/my-image.jpg)

### Adding Tables

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data     | Data     | Data     |
| Data     | Data     | Data     |

> This is a quote or important callout

## Conclusion

Wrap up your post here...
```

4. **Save the file**:
   - Filename: Use your post ID with `.md` extension
   - Example: `my-post-2025.md`
   - Save to: `assets/data/blog-posts/`

#### Part 2: Add to Blog Index

1. **Open the blog index**:
   - File location: `assets/data/sig-blog-index.json`

2. **Add your post entry**:

```json
{
  "id": "my-post-2025",
  "filename": "my-post-2025.md",
  "sigId": "sig-energy",
  "sigName": "Energy & Sustainability",
  "title": "My Blog Post Title",
  "date": "2025-10-23",
  "author": "Your Name",
  "authorRole": "Your Job Title",
  "excerpt": "A one-sentence summary that appears on the blog card view",
  "tags": ["keyword1", "keyword2", "keyword3"],
  "published": false
}
```

3. **Important**: Add comma after the previous post's closing `}`

4. **Save changes**

#### Part 3: Preview Your Draft

Your post starts as a **draft** (`published: false`), which means only people with the special preview link can see it.

**Preview URL format**:
```
https://yoursite.com/pages/sig-blog.html?preview=true#my-post-2025
```

Share this link with colleagues to get feedback before publishing!

#### Part 4: Publish Your Post

When you're ready to make it public:

1. **In the markdown file** (`my-post-2025.md`):
   - Change `published: false` to `published: true`

2. **In the index file** (`sig-blog-index.json`):
   - Change `"published": false` to `"published": true`

3. **Commit both changes**

Your post will now appear on the public blog page!

### Markdown Formatting Guide

#### Headers
```markdown
## This is a large heading
### This is a medium heading
#### This is a smaller heading
```

#### Text Formatting
```markdown
**This text is bold**
*This text is italic*
`This is code or technical terms`
```

#### Lists
```markdown
Bullet points:
- First item
- Second item
- Third item

Numbered list:
1. First step
2. Second step
3. Third step
```

#### Links
```markdown
[Click here to visit our website](https://example.com)
```

#### Images
```markdown
![Description of the image](../img/blog/filename.jpg)
```
Note: Save images in `assets/img/blog/` folder first!

#### Tables
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

#### Quotes/Callouts
```markdown
> This is an important quote or key takeaway
> — Attribution (optional)
```

#### Code Blocks
````markdown
```
This is a block of code or technical output
Multiple lines are preserved
```
````

### Adding Images to Blog Posts

1. **Prepare your image**:
   - Save as JPG or PNG
   - Recommended max width: 1200px
   - Keep file size under 500KB

2. **Upload to blog images folder**:
   - Location: `assets/img/blog/`
   - Filename: Use descriptive name (e.g., `energy-chart-2025.jpg`)

3. **Reference in your markdown**:
   ```markdown
   ![Chart showing energy consumption trends](../img/blog/energy-chart-2025.jpg)
   ```

### ✅ Blog Post Checklist

Before publishing:

- [ ] Frontmatter has all required fields
- [ ] ID matches between markdown file and index
- [ ] Date format is YYYY-MM-DD
- [ ] SIG ID matches existing SIG (sig-energy, sig-digital, etc.)
- [ ] Excerpt is concise (1-2 sentences max)
- [ ] All images are uploaded and paths are correct
- [ ] Links work correctly
- [ ] Markdown formatting looks correct in preview
- [ ] Ready to publish? Change `published: false` to `true` in BOTH files

---

## ⚡ Common Tasks Quick Reference

### Quick Actions

| What You Want to Do | File to Edit | What to Change |
|---------------------|--------------|----------------|
| Add an event | `assets/data/events.json` | Add new event object |
| Add event photos | `assets/data/gallery.json` | Add new event with photo list |
| Update SIG info | `assets/data/sigs.json` | Edit SIG object |
| Add new SIG | `assets/data/sigs.json` | Add new SIG object |
| Publish blog post | Blog markdown file + `sig-blog-index.json` | Change `published: false` to `true` |
| Update event details | `assets/data/events.json` | Find and edit event object |

### File Locations Cheat Sheet

```
Website Root/
├── assets/
│   ├── data/
│   │   ├── events.json ..................... Events list
│   │   ├── gallery.json .................... Photo gallery index
│   │   ├── sigs.json ....................... SIGs directory
│   │   ├── sig-blog-index.json ............. Blog post index
│   │   └── blog-posts/
│   │       ├── post-name.md ................ Individual blog posts
│   │       └── README.md ................... Blog guide
│   └── img/
│       ├── gallery/ ........................ Event photos (organized by folder)
│       └── blog/ ........................... Blog post images
└── pages/
    ├── events.html ......................... Events page
    ├── gallery.html ........................ Gallery page
    ├── sigs.html ........................... SIGs page
    └── sig-blog.html ....................... Blog page
```

---

## ❓ Getting Help

### Common Errors and Solutions

#### ❌ "Invalid JSON" Error

**Problem**: Syntax error in JSON file (missing comma, quote, bracket, etc.)

**Solution**:
1. Check all opening brackets `{` `[` have closing ones `}` `]`
2. Ensure commas between items (but NOT after the last item)
3. Use double quotes `"` not single quotes `'`
4. Use an online JSON validator: https://jsonlint.com

#### ❌ Photos Not Appearing

**Problem**: Images don't show on gallery page

**Solution**:
1. Check folder name format: `YYYY-MM-DD-category-location`
2. Verify file path in gallery.json matches actual folder/filename exactly
3. Ensure file extension matches (`.jpeg` vs `.jpg`)
4. Check photos are actually uploaded to the folder

#### ❌ Event Not Showing

**Problem**: New event doesn't appear on website

**Solution**:
1. Check date format is YYYY-MM-DD
2. Verify the event is in the correct file (`events.json`)
3. Look for JSON syntax errors (use jsonlint.com)
4. Clear your browser cache and refresh
5. Check if GitHub changes were successfully committed

#### ❌ Blog Post Not Rendering

**Problem**: Blog post appears broken or doesn't load

**Solution**:
1. Check frontmatter is between `---` markers
2. Verify filename in sig-blog-index.json matches actual file
3. Ensure ID is same in both frontmatter and index file
4. Check for special characters that might break YAML parsing
5. Validate markdown syntax

### Getting Further Support

**For technical issues**:
- Contact the Digital & Data SIG through Teams
- Post in the NextGen Healthcare Network community channel

**For content questions**:
- Reach out to relevant SIG leads
- Check with the communications team

**For urgent issues**:
- Email: [contact email here]

---

## 💡 Tips for Success

### General Best Practices

✅ **Always make a small test change first** - Get comfortable with the process before making big updates

✅ **Write clear commit messages** - Future you will thank you! Example: "Add Manchester coffee event for December"

✅ **Preview before publishing** - Use preview mode for blog posts, check the live site for other updates

✅ **Keep backups** - Copy the original text before editing, just in case

✅ **Be consistent** - Follow existing naming patterns and formatting styles

✅ **Ask for help** - It's better to ask than to break something!

### Quality Checks

Before any update, ask yourself:

- [ ] Is the information accurate?
- [ ] Are dates and times correct?
- [ ] Do all links work?
- [ ] Is spelling and grammar correct?
- [ ] Does formatting look right?
- [ ] Have I tested in preview (if applicable)?

### Making Changes Safely

1. **Edit**: Make your changes in the file
2. **Review**: Read through what you changed
3. **Commit**: Save with a clear message
4. **Check**: View the live website to confirm it worked
5. **Fix**: If something's wrong, you can edit again!

GitHub keeps a history of all changes, so you can always go back if needed.

---

## 📚 Additional Resources

### Helpful Tools

- **JSON Validator**: https://jsonlint.com - Check your JSON syntax
- **Markdown Preview**: https://markdownlivepreview.com - See how markdown will look
- **Image Resizer**: https://www.iloveimg.com/resize-image - Resize photos before uploading
- **Date Formatter**: Use format YYYY-MM-DD (e.g., 2025-12-25 for Christmas Day 2025)

### Learning More

- **JSON Basics**: Think of it as a structured list with labels and values
- **Markdown Guide**: https://www.markdownguide.org/basic-syntax/
- **GitHub Basics**: https://guides.github.com/activities/hello-world/

### File Format Quick Reference

**JSON** (`.json` files):
- Used for: Events, Gallery, SIGs, Blog Index
- Structure: Lists of items with properties
- Syntax: Must be exact (commas, quotes, brackets)

**Markdown** (`.md` files):
- Used for: Blog posts, documentation
- Structure: Text with simple formatting symbols
- Syntax: Forgiving, easy to read and write

---

## 🎉 You're Ready!

Remember: **Everyone was a beginner once**. Take it slow, start with small changes, and don't be afraid to ask questions.

The website is designed to be updated by non-technical people, so you've got this! 💪

**Happy updating!**

---

*Last updated: October 2025*
*Questions? Contact the Digital & Data SIG or website administrators*
