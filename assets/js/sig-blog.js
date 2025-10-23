const VERSION = 10;
const INDEX_URL = `../assets/data/sig-blog-index.json?v=${VERSION}`;
const POSTS_BASE_URL = '../assets/data/blog-posts/';

let allPosts = [];
let activeSig = 'all';
let showDrafts = false;

// Initialize
async function init() {
  try {
    // Check if preview mode is enabled
    const urlParams = new URLSearchParams(window.location.search);
    showDrafts = urlParams.has('preview');
    
    if (showDrafts) {
      document.getElementById('draft-banner').style.display = 'block';
    }

    // Load the index of all posts
    const res = await fetch(INDEX_URL);
    if (!res.ok) throw new Error('Failed to load blog index');
    
    const data = await res.json();
    allPosts = data.posts || [];

    // Build SIG filters
    buildFilters();

    // Check if viewing single post
    const postId = window.location.hash.slice(1);
    if (postId) {
      await showSinglePost(postId);
    } else {
      showPostList();
    }

    document.getElementById('loading').style.display = 'none';
  } catch (err) {
    console.error('Failed to load blog posts:', err);
    document.getElementById('loading').style.display = 'none';
    const errorEl = document.getElementById('error');
    errorEl.textContent = 'Failed to load blog posts. Please try again later.';
    errorEl.style.display = 'block';
  }
}

// Build filter buttons from available SIGs
function buildFilters() {
  const sigs = [...new Set(allPosts.map(p => p.sigId))];
  const sigNames = {};
  
  allPosts.forEach(p => {
    if (!sigNames[p.sigId]) {
      sigNames[p.sigId] = p.sigName;
    }
  });

  const filtersContainer = document.getElementById('blog-filters');
  
  // Add SIG-specific filters
  sigs.forEach(sigId => {
    const btn = document.createElement('button');
    btn.dataset.sig = sigId;
    btn.textContent = sigNames[sigId];
    btn.addEventListener('click', () => {
      activeSig = sigId;
      updateActiveFilter();
      showPostList();
    });
    filtersContainer.appendChild(btn);
  });

  // Add event listener to "All Posts" button
  const allBtn = filtersContainer.querySelector('[data-sig="all"]');
  allBtn.addEventListener('click', () => {
    activeSig = 'all';
    updateActiveFilter();
    showPostList();
  });
}

// Update active filter button styling
function updateActiveFilter() {
  document.querySelectorAll('.blog-filters button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sig === activeSig);
  });
}

// Show list of posts
function showPostList() {
  const listContainer = document.getElementById('blog-list');
  const postContainer = document.getElementById('blog-post');
  const noPostsEl = document.getElementById('no-posts');
  
  listContainer.style.display = 'grid';
  postContainer.style.display = 'none';
  noPostsEl.style.display = 'none';

  // Filter posts
  let posts = showDrafts ? allPosts : allPosts.filter(p => p.published);
  
  if (activeSig !== 'all') {
    posts = posts.filter(p => p.sigId === activeSig);
  }

  // Sort by date (newest first)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (posts.length === 0) {
    listContainer.style.display = 'none';
    noPostsEl.style.display = 'block';
    return;
  }

  listContainer.innerHTML = posts.map(post => createPostCard(post)).join('');
}

// Create HTML for a post card
function createPostCard(post) {
  const tags = post.tags && post.tags.length > 0
    ? `<div class="blog-tags">${post.tags.map(tag => `<span class="blog-tag">#${tag}</span>`).join('')}</div>`
    : '';

  const draftBadge = !post.published 
    ? '<span style="color: #f57c00; font-weight: 600; font-size: 0.85rem;">🚧 DRAFT</span>' 
    : '';

  return `
    <div class="blog-card">
      <span class="sig-badge">${post.sigName}</span>
      <h3>${post.title}</h3>
      <div class="blog-meta">
        <span>📅 ${formatDate(post.date)}</span>
        <span>✍️ ${post.author}</span>
        ${draftBadge}
      </div>
      <p class="blog-excerpt">${post.excerpt}</p>
      ${tags}
      <a href="#${post.id}" class="btn btn-outline">Read More →</a>
    </div>
  `;
}

// Show single post
async function showSinglePost(postId) {
  const postMeta = allPosts.find(p => p.id === postId);
  
  if (!postMeta) {
    window.location.hash = '';
    showPostList();
    return;
  }

  // Check if post is published (unless preview mode)
  if (!postMeta.published && !showDrafts) {
    window.location.hash = '';
    showPostList();
    return;
  }

  const listContainer = document.getElementById('blog-list');
  const postContainer = document.getElementById('blog-post');
  const noPostsEl = document.getElementById('no-posts');
  
  listContainer.style.display = 'none';
  postContainer.style.display = 'block';
  noPostsEl.style.display = 'none';

  // Show loading state
  postContainer.innerHTML = '<div class="loading">Loading post...</div>';

  try {
    // Load markdown content
    const markdownUrl = `${POSTS_BASE_URL}${postMeta.filename}?v=${VERSION}`;
    const res = await fetch(markdownUrl);
    
    if (!res.ok) throw new Error('Failed to load post content');
    
    const markdown = await res.text();
    
    // Parse frontmatter and content
    const { frontmatter, content } = parseMarkdown(markdown);
    
    // Merge metadata (prefer frontmatter over index)
    const post = { ...postMeta, ...frontmatter };

    // Convert markdown to HTML
    const htmlContent = marked.parse(content);

    // Build tags HTML
    const tags = post.tags && post.tags.length > 0
      ? `<div class="blog-tags">${post.tags.map(tag => `<span class="blog-tag">#${tag}</span>`).join('')}</div>`
      : '';

    const draftBadge = !post.published 
      ? '<div class="draft-banner" style="margin-top: 1rem;">🚧 <strong>Draft Preview</strong> - This post is not yet public</div>' 
      : '';

    postContainer.innerHTML = `
      <button class="btn btn-outline back-btn" onclick="window.history.back()">
        ← Back
      </button>
      <article>
        <header>
          <span class="sig-badge">${post.sigName}</span>
          <h1>${post.title}</h1>
          <div class="blog-meta">
            <span>📅 ${formatDate(post.date)}</span>
            <span>✍️ ${post.author}${post.authorRole ? `, ${post.authorRole}` : ''}</span>
          </div>
          ${tags}
          ${draftBadge}
        </header>
        <div class="blog-content">
          ${htmlContent}
        </div>
      </article>
    `;

    window.scrollTo(0, 0);
  } catch (err) {
    console.error('Failed to load post:', err);
    postContainer.innerHTML = `
      <button class="btn btn-outline back-btn" onclick="window.history.back()">
        ← Back
      </button>
      <div class="error">Failed to load post content. Please try again later.</div>
    `;
  }
}

// Parse markdown with frontmatter
function parseMarkdown(markdown) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    // No frontmatter, return as-is
    return { frontmatter: {}, content: markdown };
  }

  const [, frontmatterStr, content] = match;
  
  // Parse YAML-like frontmatter
  const frontmatter = {};
  frontmatterStr.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();
    
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // Convert booleans
    if (value === 'true') value = true;
    if (value === 'false') value = false;
    
    // Handle arrays (simple comma-separated values)
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
    }
    
    frontmatter[key] = value;
  });

  return { frontmatter, content };
}

// Format date
function formatDate(iso) {
  if (!iso) return '';
  
  // Handle local date without timezone issues
  const parts = iso.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }
  
  return iso;
}

// Handle hash changes (navigation)
window.addEventListener('hashchange', async () => {
  const postId = window.location.hash.slice(1);
  if (postId) {
    await showSinglePost(postId);
  } else {
    showPostList();
  }
});

// Handle back button to return to list view
window.addEventListener('popstate', () => {
  if (!window.location.hash) {
    showPostList();
  }
});

// Initialize on load
init();
