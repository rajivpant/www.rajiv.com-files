# Files for www.rajiv.com

This repository serves two purposes:

## 1. Static Archive (public_html/)

Historical content and static files linked from [rajiv.com](https://rajiv.com), including:

- **Archive**: Pre-WordPress site versions from 1994-1995
- **Resume**: Professional resume in multiple formats
- **Work**: Project portfolio and case studies
- **Personal**: Personal content and images

Served via GitHub Pages at: <https://rajivpant.github.io/www.rajiv.com-files/>

## 2. Blog Post Management (content/articles/)

Markdown source files for rajiv.com blog posts, managed using [ownwords](https://github.com/rajivpant/ownwords).

### Quick Start

```bash
# Install dependencies
npm install

# Fetch an article from rajiv.com
ownwords fetch https://rajiv.com/blog/2025/01/15/article-slug/

# Convert to markdown
ownwords convert ./raw/article-slug.html ./content/articles/article-slug.md

# Build WordPress export
npm run build
```

### Workflow

1. **Fetch**: Download article HTML from WordPress using ownwords
2. **Convert**: Transform to markdown with front matter
3. **Edit**: Make changes in your preferred editor
4. **Build**: Generate WordPress-ready HTML
5. **Publish**: Copy export HTML back to WordPress

### Directory Structure

```text
content/articles/     # Markdown source files
raw/                  # Fetched WordPress HTML
wordpress-export/     # Generated HTML for WordPress
articles/             # Local preview HTML
```

See [CLAUDE.md](CLAUDE.md) for detailed documentation.
