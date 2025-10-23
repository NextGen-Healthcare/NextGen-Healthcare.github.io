# SIG Blog System - User Guide

## Overview

The SIG Blog system allows Special Interest Groups to publish research findings, case studies, and insights using markdown files. Posts can be kept as drafts (not visible to public) until ready for publication.

## File Structure

```
assets/
  data/
    sig-blog-index.json          # Index of all posts (metadata)
    blog-posts/                  # Individual markdown files
      energy-q4-2024.md
      digital-ai-planning-2025.md
      procurement-draft-2025.md
  js/
    sig-blog.js                  # Blog page JavaScript
pages/
  sig-blog.html                  # Blog page
```

## Creating a New Blog Post

### Step 1: Write the Markdown File

Create a new `.md` file in `assets/data/blog-posts/` with this structure:

```markdown
---
id: unique-post-id
sigId: sig-energy
sigName: Energy & Sustainability
title: Your Post Title
date: 2025-03-15
author: Your Name
authorRole: Your Role (optional)
excerpt: Brief summary shown in card view (1-2 sentences)
tags: [tag1, tag2, tag3]
published: false
---

## Your Content Here

Write your post using standard markdown syntax...
```

### Step 2: Add to Index

Edit `assets/data/sig-blog-index.json` and add an entry:

```json
{
  "id": "unique-post-id",
  "filename": "your-file.md",
  "sigId": "sig-energy",
  "sigName": "Energy & Sustainability",
  "title": "Your Post Title",
  "date": "2025-03-15",
  "author": "Your Name",
  "authorRole": "Your Role",
  "excerpt": "Brief summary...",
  "tags": ["tag1", "tag2"],
  "published": false
}
```

### Step 3: Preview Draft

Access your draft post using preview mode:

```
https://yoursite.com/pages/sig-blog.html?preview=true
```

Or link directly to the post:

```
https://yoursite.com/pages/sig-blog.html?preview=true#unique-post-id
```

### Step 4: Publish

When ready to make the post public:

1. Change `published: false` to `published: true` in the markdown file
2. Change `"published": false` to `"published": true` in sig-blog-index.json
3. Commit and push to GitHub

The post will now appear on the public blog page.

## Markdown Features

The blog supports full markdown syntax including:

### Headers
```markdown
## H2 Header
### H3 Header
#### H4 Header
```

### Text Formatting
```markdown
**Bold text**
*Italic text*
`Inline code`
```

### Lists
```markdown
- Bullet point
- Another point

1. Numbered item
2. Another item
```

### Links and Images
```markdown
[Link text](https://example.com)
![Image alt text](../img/blog/your-image.jpg)
```

### Tables
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data     | Data     | Data     |
```

### Blockquotes
```markdown
> This is a quote from someone important.
> — Attribution
```

### Code Blocks
````markdown
```javascript
function example() {
  console.log("Code with syntax highlighting");
}
```
````

## SIG IDs

Use these standard SIG IDs:

- `sig-energy` - Energy & Sustainability
- `sig-digital` - Digital & Data
- `sig-procurement` - Procurement & Commercial
- `sig-estates` - Estates & Facilities
- `sig-clinical` - Clinical Engineering

## Best Practices

### Writing Tips

1. **Start with a clear executive summary** - readers should understand key points quickly
2. **Use headers liberally** - break content into scannable sections
3. **Include data/evidence** - tables, charts, statistics add credibility
4. **Add images/diagrams** - visual content improves engagement
5. **Cite sources** - link to referenced materials
6. **Keep it actionable** - provide clear recommendations or next steps

### Technical Tips

1. **Test locally first** - open sig-blog.html in browser with preview mode
2. **Check all links** - ensure images and external links work
3. **Use relative paths** - for images: `../img/blog/filename.jpg`
4. **Keep filenames simple** - use lowercase with hyphens: `post-name.md`
5. **Validate frontmatter** - ensure all required fields are present

### Image Guidelines

Store blog images in: `assets/img/blog/`

Recommended specifications:
- Format: JPG for photos, PNG for diagrams/screenshots
- Max width: 1200px (responsive design handles sizing)
- File size: < 500KB (optimize before uploading)
- Alt text: Always include descriptive alt text

## Accessing the Blog

### Public Access (Published Posts Only)
```
https://yoursite.com/pages/sig-blog.html
```

### Preview Mode (Including Drafts)
```
https://yoursite.com/pages/sig-blog.html?preview=true
```

### Direct Post Link
```
https://yoursite.com/pages/sig-blog.html#post-id
```

### Preview Specific Draft
```
https://yoursite.com/pages/sig-blog.html?preview=true#post-id
```

## Filtering

The blog page automatically creates filter buttons for each SIG that has posts. Users can click to view posts from a specific SIG or "All Posts".

## Troubleshooting

### Post Not Appearing

1. Check `published: true` in markdown frontmatter
2. Check `"published": true` in sig-blog-index.json
3. Verify filename matches in index
4. Clear browser cache
5. Check browser console for JavaScript errors

### Images Not Loading

1. Verify image path is correct (relative to HTML file location)
2. Check image file exists at specified path
3. Ensure image filename case matches exactly

### Markdown Not Rendering

1. Check frontmatter format (must start with `---` and end with `---`)
2. Verify no special characters breaking YAML parsing
3. Test markdown syntax at https://markdownlivepreview.com/

## Version Control

When updating the blog:

1. **Create new posts** by adding files and index entries
2. **Update posts** by editing markdown files
3. **Publish drafts** by changing published flag
4. **Commit changes** with clear messages
5. **Push to GitHub** to deploy

Example commit messages:
- "Add new Energy SIG post on net zero progress"
- "Update AI planning post with case study data"
- "Publish procurement draft post"

## Support

For technical issues or questions, contact the Digital & Data SIG through the NextGen Healthcare Network Teams channel.
