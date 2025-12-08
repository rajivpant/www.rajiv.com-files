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
const CONTENT_DIR = path.join(ROOT_DIR, 'content');
const OUTPUT_DIR = path.join(ROOT_DIR, 'articles');
const WORDPRESS_EXPORT_DIR = path.join(ROOT_DIR, 'wordpress-export');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');

const SITE_URL = 'https://rajiv.com';
const WORDS_PER_MINUTE = 225;

// Custom renderer for WordPress-compatible output
const renderer = new marked.Renderer();

// Image renderer: wraps in figure with optional figcaption, adds responsive styles
renderer.image = function(token) {
  let src, alt, title;
  if (typeof token === 'object') {
    src = token.href || '';
    alt = token.text || '';
    title = token.title || '';
  } else {
    src = token;
    alt = arguments[1] || '';
    title = arguments[2] || '';
  }

  // Escape HTML in alt and title
  const escapeHtml = (str) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const escapedAlt = escapeHtml(alt);
  const escapedTitle = title ? escapeHtml(title) : '';

  // Use </p> prefix and <p> suffix to break out of paragraph context
  // This ensures figure is a block-level element, not wrapped in <p>
  let html = '</p><figure class="wp-block-image">';
  html += `<img src="${src}" alt="${escapedAlt}" style="max-width: 100%; height: auto;" loading="lazy" />`;
  if (escapedTitle) {
    html += `<figcaption>${escapedTitle}</figcaption>`;
  }
  html += '</figure><p>';
  return html;
};

// Code renderer: put language class on <pre> for Prism.js
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
 * Find all content files (supports hierarchical structure)
 * Returns array of { filePath, slug, contentDir }
 */
function findContentFiles() {
  const results = [];
  const postsDir = path.join(CONTENT_DIR, 'posts');

  if (fs.existsSync(postsDir)) {
    walkHierarchicalPosts(postsDir, results);
  }

  return results;
}

/**
 * Walk hierarchical posts directory: posts/YYYY/MM/DD-slug/index.md
 */
function walkHierarchicalPosts(postsDir, results) {
  const years = fs.readdirSync(postsDir).filter(f => {
    const fullPath = path.join(postsDir, f);
    return fs.statSync(fullPath).isDirectory() && /^\d{4}$/.test(f);
  });

  for (const year of years) {
    const yearDir = path.join(postsDir, year);
    const months = fs.readdirSync(yearDir).filter(f => {
      const fullPath = path.join(yearDir, f);
      return fs.statSync(fullPath).isDirectory() && /^\d{2}$/.test(f);
    });

    for (const month of months) {
      const monthDir = path.join(yearDir, month);
      const daySlugDirs = fs.readdirSync(monthDir).filter(f => {
        const fullPath = path.join(monthDir, f);
        return fs.statSync(fullPath).isDirectory() && /^\d{2}-/.test(f);
      });

      for (const daySlugDir of daySlugDirs) {
        const articleDir = path.join(monthDir, daySlugDir);
        const indexMd = path.join(articleDir, 'index.md');

        if (fs.existsSync(indexMd)) {
          // Extract slug from "DD-slug" format
          const slug = daySlugDir.substring(3);
          results.push({
            filePath: indexMd,
            slug,
            contentDir: articleDir
          });
        }
      }
    }
  }
}

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
    img { max-width: 100%; height: auto; border-radius: 4px; margin: 1.5rem 0; }
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
  // Clean up empty paragraph tags left by figure extraction
  html = html.replace(/<p><\/p>\n?/g, '');
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

  // For index.md files in hierarchical structure, don't check filename match
  const filename = path.basename(filePath, '.md');
  if (filename !== 'index' && frontMatter.slug && frontMatter.slug !== filename) {
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
 * Copy article assets (images) to output directory
 * Returns number of files copied
 */
function copyArticleAssets(sourceDir, destDir) {
  if (!fs.existsSync(sourceDir)) {
    return 0;
  }

  const files = fs.readdirSync(sourceDir);
  let copied = 0;

  for (const file of files) {
    const srcPath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);

    // Only copy image files, not .md or .json
    if (fs.statSync(srcPath).isFile() && !file.endsWith('.md') && !file.endsWith('.json')) {
      fs.copyFileSync(srcPath, destPath);
      copied++;
    }
  }

  return copied;
}

/**
 * Rewrite image paths in HTML for local preview
 * Changes ./image.jpg to just image.jpg (since assets are copied to same dir)
 */
function rewriteImagePathsForPreview(html) {
  // Match src="./filename" and replace with src="filename"
  return html.replace(/src="\.\/([^"]+)"/g, 'src="$1"');
}

/**
 * Main build function
 */
function build() {
  console.log('🔨 Building rajiv.com blog posts...\n');

  if (!fs.existsSync(CONTENT_DIR)) {
    console.log('📁 No content directory found. Creating empty structure...');
    fs.mkdirSync(path.join(CONTENT_DIR, 'posts'), { recursive: true });
    console.log('✅ Created content/posts/ directory');
    console.log('\nTo add articles:');
    console.log('  1. Use ownwords to fetch from rajiv.com:');
    console.log('     ownwords fetch https://rajiv.com/blog/YYYY/MM/DD/slug/ --api --hierarchical --output-dir=./content');
    console.log('  2. Run build:');
    console.log('     npm run build\n');
    return;
  }

  const contentFiles = findContentFiles();

  if (contentFiles.length === 0) {
    console.log('📝 No markdown files found in content/posts/');
    console.log('\nTo add articles, use ownwords to fetch from rajiv.com:');
    console.log('  ownwords fetch https://rajiv.com/blog/YYYY/MM/DD/slug/ --api --hierarchical --output-dir=./content\n');
    return;
  }

  console.log(`📄 Found ${contentFiles.length} article(s)\n`);

  ensureDirectories();

  // Try to read template (optional)
  const articleTemplate = readTemplate('article.html');
  if (!articleTemplate) {
    console.log('  ℹ️  No article.html template, using built-in preview template\n');
  }

  // Process each article
  const articles = [];
  let hasErrors = false;

  for (const { filePath, slug, contentDir } of contentFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath);
    console.log(`  Processing: ${relativePath}`);

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
      let articleHtml = generateArticleHtml(article, articleTemplate);
      const articleDir = path.join(OUTPUT_DIR, article.frontMatter.slug);
      if (!fs.existsSync(articleDir)) {
        fs.mkdirSync(articleDir, { recursive: true });
      }

      // Copy article assets (images) and rewrite paths
      const assetsCopied = copyArticleAssets(contentDir, articleDir);
      if (assetsCopied > 0) {
        articleHtml = rewriteImagePathsForPreview(articleHtml);
      }

      fs.writeFileSync(path.join(articleDir, 'index.html'), articleHtml);

      // Generate WordPress export
      const wordpressHtml = generateWordPressHtml(article);
      fs.writeFileSync(
        path.join(WORDPRESS_EXPORT_DIR, `${article.frontMatter.slug}.html`),
        wordpressHtml
      );

      const assetsMsg = assetsCopied > 0 ? `, ${assetsCopied} images` : '';
      console.log(`    ✅ Generated: ${article.frontMatter.slug} (${article.readingTime} min read${assetsMsg})`);

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
