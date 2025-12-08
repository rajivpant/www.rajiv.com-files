# Claude Code Context: www.rajiv.com-files

## Repository: www.rajiv.com-files (PUBLIC)

This repository serves two purposes:

1. **Static Archive**: Historical content and static files linked from rajiv.com (in `public_html/`)
2. **Blog Post Management**: Markdown source files for rajiv.com blog posts (in `content/posts/`)

## Repository Ecosystem

| Repository | Type | Purpose | Location |
|------------|------|---------|----------|
| **rajiv-site** | Public | Static files and blog management for rajiv.com | `~/projects/my-projects/rajiv-site/` |
| **synthesis-coding-site** | Public | Website for synthesiscoding.com | `~/projects/my-projects/synthesis-coding-site/` |
| **ownwords** | Public | WordPress to Markdown toolkit | `~/projects/my-projects/ownwords/` |
| **ragbot-site** | Public | Website for ragbot.ai | `~/projects/my-projects/ragbot-site/` |
| **ragenie-site** | Public | Website for ragenie.ai | `~/projects/my-projects/ragenie-site/` |

Note: Home directory varies by machine, so use `~` for paths.

## IMPORTANT: Content Separation

**DO NOT** manage Synthesis Coding articles in this repository. Those belong in `synthesis-coding-site`.

Articles that should be in `synthesis-coding-site` (NOT here):
- Articles about Synthesis Coding methodology
- Articles tagged with "synthesis coding"
- Articles with canonical URLs containing "synthesiscoding.com"

If you encounter an article that might belong in synthesis-coding-site, warn the user before proceeding.

## Site Structure

```text
www.rajiv.com-files/
├── public_html/            # LEGACY: Static archive content (GitHub Pages)
│   ├── archive/            # Historical site versions (1994-1995)
│   ├── resume/             # Resume materials
│   ├── work/               # Project portfolio
│   ├── personal/           # Personal content
│   └── common/             # Shared templates and assets
│
├── content/                # Blog post source files
│   ├── posts/              # Hierarchical: YYYY/MM/DD-slug/index.md
│   │   └── 2025/
│   │       └── 12/
│   │           └── 07-a-strangers-words/
│   │               ├── index.md       # Article markdown
│   │               ├── index.json     # ownwords metadata
│   │               └── *.jpg          # Co-located images
│   └── pages/              # Static pages: slug/index.md (future)
│
├── raw/                    # ownwords fetch output (HTML from WordPress)
│   └── some-post.html      # Fetched WordPress HTML
│
├── articles/               # Generated HTML (local preview only, gitignored)
│   └── some-post/
│       └── index.html
│
├── wordpress-export/       # WordPress-ready HTML for publishing
│   └── some-post.html      # Ready to paste into WordPress
│
├── scripts/
│   └── build.js            # Build script
│
├── templates/
│   └── article.html        # Article preview template
│
├── package.json            # npm configuration
├── CLAUDE.md               # This file
└── README.md               # Repository documentation
```

## Build Process

```bash
npm install                 # Install dependencies (first time only)
npm run build               # Build markdown articles to HTML
```

The build script generates:
- Local preview HTML in `articles/` (for reviewing before publishing)
- WordPress-ready HTML in `wordpress-export/` (for copy/paste to WordPress)

## Using ownwords with This Repository

### Fetching an Existing Article from rajiv.com

```bash
# From this repo directory
cd ~/projects/my-projects/rajiv-site

# Fetch article with hierarchical structure (recommended)
ownwords fetch https://rajiv.com/blog/2025/01/15/article-slug/ --api --hierarchical --output-dir=./content

# This creates: content/posts/2025/01/15-article-slug/index.md

# Build to generate WordPress export
npm run build
```

### Creating a New Article

1. Create a new directory and markdown file:
   ```bash
   mkdir -p content/posts/2025/01/15-your-article-slug
   ```

2. Create `content/posts/2025/01/15-your-article-slug/index.md`:
   ```markdown
   ---
   title: "Your Article Title"
   slug: "your-article-slug"
   date: "2025-01-15"
   description: "A brief description for SEO"
   canonical_url: "https://rajiv.com/blog/2025/01/15/your-article-slug/"
   category: "Technology"
   tags:
     - "tag1"
     - "tag2"
   author: "Rajiv Pant"
   ---

   Your article content in markdown...
   ```

3. Place any images in the same directory as `index.md`

4. Build to generate WordPress export:
   ```bash
   npm run build
   ```

5. Copy content from `wordpress-export/your-article-slug.html` to WordPress

### Publishing Back to WordPress

**Recommended: Use ownwords publish (with safeguards)**

```bash
# Always preview first
node ~/projects/my-projects/ownwords/bin/ownwords.js publish ./content/posts/2025/12/07-your-slug/index.md --dryrun

# Verify the dry-run output shows:
# - "UPDATE existing post" (not "CREATE new post")
# - "Would upload: 0" for images (if images already uploaded)
# - Correct post_id matches what's in front matter

# Then publish
node ~/projects/my-projects/ownwords/bin/ownwords.js publish ./content/posts/2025/12/07-your-slug/index.md
```

**Manual workflow (alternative):**

1. Run `npm run build`
2. Open the corresponding file in `wordpress-export/`
3. Copy the HTML content
4. Paste into WordPress post editor (HTML/Code view)
5. Update the post in WordPress

### Pre-Publish Checklist

Before publishing any changes to WordPress:

1. **Verify you're updating, not creating**
   - Check front matter has `wordpress.post_id`
   - Dry-run should show "UPDATE existing post", not "CREATE new post"

2. **Verify images won't be re-uploaded**
   - Check `index.images.json` sidecar exists with image URLs
   - Dry-run should show "Would upload: 0" (unless you added new images)

3. **Preview locally first**
   - Run `npm run build`
   - Check `articles/your-slug/index.html` looks correct
   - Verify images render with captions

4. **Test on mobile**
   - Images should not overflow viewport
   - Figures/captions should display correctly

5. **Don't rush**
   - Review dry-run output carefully
   - If anything looks wrong, investigate before publishing

## Front Matter Reference

Required fields:
- `title`: Article title
- `slug`: URL slug (must match directory name suffix)
- `date`: Publication date (YYYY-MM-DD)
- `canonical_url`: Full URL on rajiv.com

Optional fields:
- `description`: SEO description
- `category`: Post category
- `tags`: Array of tags
- `author`: Author name
- `featured_image`: Featured image URL
- `wordpress`: WordPress metadata (auto-populated by ownwords)
  - `post_id`: WordPress post ID
  - `category_ids`: WordPress category IDs
  - `tag_ids`: WordPress tag IDs
  - `synced_at`: Last sync timestamp

## Git Operations

**IMPORTANT**: Before any git commands, ensure you are in the correct directory:

```bash
cd ~/projects/my-projects/rajiv-site
```

This repo is separate from synthesis-coding-site and ownwords. Do NOT mix commits between repos.

## Deployment Notes

### Current (GitHub Pages)
- `public_html/` is served via GitHub Pages
- URL: https://rajivpant.github.io/www.rajiv.com-files/

### Future (Cloudflare Pages)
- Plan to migrate `public_html/` static content to Cloudflare Pages
- Update links on rajiv.com to point to new Cloudflare URLs
- This migration is separate from the blog management functionality

## Files to .gitignore

The following are generated and should not be committed:
- `node_modules/`
- `articles/` (generated preview HTML - WordPress is source of truth)
- `wordpress-export/` (generated WordPress HTML)

The following should be committed:
- `content/posts/**/*.md` (source markdown)
- `content/posts/**/*.json` (ownwords metadata for sync tracking)
- `content/posts/**/*.jpg` (co-located images)
- `raw/*.html` (fetched WordPress HTML for reference)
