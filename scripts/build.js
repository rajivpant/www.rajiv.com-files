#!/usr/bin/env node

/**
 * Build script for rajiv.com blog posts
 *
 * Features:
 * - Converts markdown articles to HTML
 * - Generates WordPress-ready export for publishing back to rajiv.com
 * - Calculates reading time
 * - Validates front matter
 *
 * Unlike synthesis-coding-site, this does NOT generate a standalone static site.
 * The primary output is wordpress-export/ for publishing to WordPress.
 * The articles/ output is for local preview only.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content', 'articles');
const OUTPUT_DIR = path.join(ROOT_DIR, 'articles');
const WORDPRESS_EXPORT_DIR = path.join(ROOT_DIR, 'wordpress-export');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');

const SITE_URL = 'https://rajiv.com';
const WORDS_PER_MINUTE = 225;

// Custom renderer to put language class on <pre> for Prism.js
const renderer = new marked.Renderer();
renderer.code = function(codeBlock) {
  let code, language;
  if (typeof codeBlock === 'object') {
    code = codeBlock.text || '';
    language = codeBlock.lang || '';
  } else {
    code = codeBlock;
    language = arguments[1] || '';
  }
  const langClass = language ? ` class="language-${language}"` : '';
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  return `<pre${langClass}><code${langClass}>${escaped}</code></pre>\n`;
};

marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: true,
  mangle: false,
  renderer: renderer
});

/**
 * Calculate reading time from content
 */
function calculateReadingTime(markdown) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~`>\-+|]/g, '')
    .replace(/\n+/g, ' ');

  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
  return { wordCount, minutes };
}

/**
 * Read and parse a markdown file with front matter
 */
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data: frontMatter, content: markdown } = matter(content);
  const html = marked(markdown);
  const { wordCount, minutes } = calculateReadingTime(markdown);

  return {
    frontMatter,
    markdown,
    html,
    readingTime: minutes,
    wordCount
  };
}

/**
 * Read a template file
 */
function readTemplate(templateName) {
  const templatePath = path.join(TEMPLATES_DIR, templateName);
  if (!fs.existsSync(templatePath)) {
    return null;
  }
  return fs.readFileSync(templatePath, 'utf-8');
}

/**
 * Format a date for display
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Generate HTML for tags display
 */
function generateTagsHtml(tags) {
  if (!tags || tags.length === 0) {
    return '';
  }
  return tags.map(tag => `<span class="tag">${tag}</span>`).join(' ');
}

/**
 * Generate HTML for a single article (local preview)
 */
function generateArticleHtml(article, template) {
  if (!template) {
    // Simple fallback if no template exists
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.frontMatter.title}</title>
  <link rel="canonical" href="${article.frontMatter.canonical_url}">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1 { margin-bottom: 0.5rem; }
    .meta { color: #666; margin-bottom: 2rem; }
    .tags { margin-top: 2rem; }
    .tag { background: #f0f0f0; padding: 0.25rem 0.5rem; border-radius: 3px; margin-right: 0.5rem; font-size: 0.875rem; }
    pre { background: #f5f5f5; padding: 1rem; overflow-x: auto; border-radius: 4px; }
    code { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
    blockquote { border-left: 3px solid #ddd; margin-left: 0; padding-left: 1rem; color: #555; }
  </style>
</head>
<body>
  <article>
    <h1>${article.frontMatter.title}</h1>
    <div class="meta">
      <span>${formatDate(article.frontMatter.date)}</span> ·
      <span>${article.readingTime} min read</span>
      ${article.frontMatter.category ? ` · <span>${article.frontMatter.category}</span>` : ''}
    </div>
    ${article.html}
    <div class="tags">${generateTagsHtml(article.frontMatter.tags)}</div>
  </article>
  <hr>
  <p><em>Canonical URL: <a href="${article.frontMatter.canonical_url}">${article.frontMatter.canonical_url}</a></em></p>
</body>
</html>`;
  }

  let html = template;
  html = html.replace(/\{\{title\}\}/g, article.frontMatter.title);
  html = html.replace(/\{\{slug\}\}/g, article.frontMatter.slug);
  html = html.replace(/\{\{date\}\}/g, article.frontMatter.date);
  html = html.replace(/\{\{formatted_date\}\}/g, formatDate(article.frontMatter.date));
  html = html.replace(/\{\{description\}\}/g, article.frontMatter.description || '');
  html = html.replace(/\{\{canonical_url\}\}/g, article.frontMatter.canonical_url);
  html = html.replace(/\{\{category\}\}/g, article.frontMatter.category || '');
  html = html.replace(/\{\{tags\}\}/g, generateTagsHtml(article.frontMatter.tags));
  html = html.replace(/\{\{reading_time\}\}/g, `${article.readingTime} min read`);
  html = html.replace(/\{\{content\}\}/g, article.html);

  return html;
}

/**
 * Generate WordPress-ready HTML (just the article body with absolute URLs)
 */
function generateWordPressHtml(article) {
  let html = article.html;
  // Convert any relative image paths to absolute
  html = html.replace(
    /src="\.\/images\//g,
    `src="${SITE_URL}/wp-content/uploads/`
  );
  return html;
}

/**
 * Validate article front matter
 */
function validateArticle(article, filePath) {
  const errors = [];
  const warnings = [];
  const { frontMatter } = article;

  if (!frontMatter.title) errors.push(`Missing required field: title`);
  if (!frontMatter.slug) errors.push(`Missing required field: slug`);
  if (!frontMatter.date) errors.push(`Missing required field: date`);
  if (!frontMatter.canonical_url) errors.push(`Missing required field: canonical_url`);

  const filename = path.basename(filePath, '.md');
  if (frontMatter.slug && frontMatter.slug !== filename) {
    errors.push(`Slug "${frontMatter.slug}" does not match filename "${filename}"`);
  }

  // Warning for missing optional fields
  if (!frontMatter.description) {
    warnings.push('Missing description (recommended for SEO)');
  }

  return { errors, warnings };
}

/**
 * Ensure output directories exist
 */
function ensureDirectories() {
  const dirs = [OUTPUT_DIR, WORDPRESS_EXPORT_DIR];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * Main build function
 */
function build() {
  console.log('🔨 Building rajiv.com blog posts...\n');

  if (!fs.existsSync(CONTENT_DIR)) {
    console.log('📁 No content directory found. Creating empty structure...');
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
    console.log('✅ Created content/articles/ directory');
    console.log('\nTo add articles:');
    console.log('  1. Use ownwords to fetch from rajiv.com:');
    console.log('     ownwords fetch https://rajiv.com/blog/YYYY/MM/DD/slug/');
    console.log('  2. Convert to markdown:');
    console.log('     ownwords convert ./raw/slug.html ./content/articles/slug.md');
    console.log('  3. Run build:');
    console.log('     npm run build\n');
    return;
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.log('📝 No markdown files found in content/articles/');
    console.log('\nTo add articles, use ownwords to fetch and convert from rajiv.com\n');
    return;
  }

  console.log(`📄 Found ${files.length} article(s)\n`);

  ensureDirectories();

  // Try to read template (optional)
  const articleTemplate = readTemplate('article.html');
  if (!articleTemplate) {
    console.log('  ℹ️  No article.html template, using built-in preview template\n');
  }

  // Process each article
  const articles = [];
  let hasErrors = false;

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    console.log(`  Processing: ${file}`);

    try {
      const article = parseMarkdownFile(filePath);
      const { errors, warnings } = validateArticle(article, filePath);

      if (errors.length > 0) {
        console.log(`    ❌ Validation errors:`);
        errors.forEach(e => console.log(`       - ${e}`));
        hasErrors = true;
        continue;
      }

      warnings.forEach(w => console.log(`    ⚠️  ${w}`));
      articles.push(article);

      // Generate local preview HTML
      const articleHtml = generateArticleHtml(article, articleTemplate);
      const articleDir = path.join(OUTPUT_DIR, article.frontMatter.slug);
      if (!fs.existsSync(articleDir)) {
        fs.mkdirSync(articleDir, { recursive: true });
      }
      fs.writeFileSync(path.join(articleDir, 'index.html'), articleHtml);

      // Generate WordPress export
      const wordpressHtml = generateWordPressHtml(article);
      fs.writeFileSync(
        path.join(WORDPRESS_EXPORT_DIR, `${article.frontMatter.slug}.html`),
        wordpressHtml
      );

      console.log(`    ✅ Generated: ${article.frontMatter.slug} (${article.readingTime} min read)`);

    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
      hasErrors = true;
    }
  }

  console.log('\n' + (hasErrors ? '⚠️  Build completed with errors' : '✅ Build complete!'));
  console.log(`   Articles: ${articles.length}`);
  console.log(`   Preview: ${OUTPUT_DIR}`);
  console.log(`   WordPress export: ${WORDPRESS_EXPORT_DIR}\n`);
}

// Run build
build();
