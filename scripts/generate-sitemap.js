const fs = require('fs');
const posts = require('../blog/data/posts.json');

const baseUrl = 'https://abhiramtadepalli.github.io';
const today = new Date().toISOString().split('T')[0];
const sitemapPath = 'sitemap.xml';

// Parse existing sitemap if it exists
function parseExistingSitemap() {
  try {
    if (!fs.existsSync(sitemapPath)) {
      return new Map();
    }
    
    const xml = fs.readFileSync(sitemapPath, 'utf-8');
    const urlMap = new Map();
    
    // Simple regex-based parsing for sitemap structure
    const urlRegex = /<url>\s*<loc>(.*?)<\/loc>\s*<lastmod>(.*?)<\/lastmod>\s*<priority>(.*?)<\/priority>\s*<\/url>/gs;
    let match;
    
    while ((match = urlRegex.exec(xml)) !== null) {
      urlMap.set(match[1], { lastmod: match[2], priority: match[3] });
    }
    
    return urlMap;
  } catch (err) {
    console.warn('Could not parse existing sitemap:', err);
    return new Map();
  }
}

// Get existing URLs with their metadata
const existingUrls = parseExistingSitemap();

// Track which URLs we're keeping
const currentUrls = new Set();

// Helper to get or create URL entry
function getUrlEntry(loc, defaultPriority = '0.8') {
  currentUrls.add(loc);
  
  if (existingUrls.has(loc)) {
    const existing = existingUrls.get(loc);
    return { lastmod: existing.lastmod, priority: existing.priority };
  }
  return { lastmod: today, priority: defaultPriority };
}

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

// Add homepage
const homeUrl = `${baseUrl}/`;
const homeEntry = getUrlEntry(homeUrl, '1.0');
sitemap += `
  <url>
    <loc>${homeUrl}</loc>
    <lastmod>${homeEntry.lastmod}</lastmod>
    <priority>${homeEntry.priority}</priority>
  </url>`;

// Add blog index
const blogUrl = `${baseUrl}/blog/`;
const blogEntry = getUrlEntry(blogUrl, '0.9');
sitemap += `
  <url>
    <loc>${blogUrl}</loc>
    <lastmod>${blogEntry.lastmod}</lastmod>
    <priority>${blogEntry.priority}</priority>
  </url>`;

// Add Blog posts
Object.keys(posts).forEach(slug => {
  const post = posts[slug];
  const postUrl = `${baseUrl}/blog/post/${slug}`;
  const postEntry = getUrlEntry(postUrl);

  let date = postEntry.lastmod;
  if (post.mod) {
    const [month, day, year] = post.mod.split('-');
    date = `${year}-${month}-${day}`;
  }
  
  sitemap += `
  <url>
    <loc>${postUrl}</loc>
    <lastmod>${date}</lastmod>
    <priority>${postEntry.priority}</priority>
  </url>`;
});

// Add project, org, and cert pages
const pagesFromDirs = getPagesFromDirs("projects")
  .concat(getPagesFromDirs("organizations"))
  .concat(getPagesFromDirs("certifications"));

pagesFromDirs.forEach(page => {
  const pageUrl = `${baseUrl}/${page}/`;
  const pageEntry = getUrlEntry(pageUrl);
  
  sitemap += `
  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${pageEntry.lastmod}</lastmod>
    <priority>${pageEntry.priority}</priority>
  </url>`;
});

sitemap += '\n</urlset>';

// Log deleted URLs
const deletedUrls = Array.from(existingUrls.keys()).filter(url => !currentUrls.has(url));
if (deletedUrls.length > 0) {
  console.log(`Removed ${deletedUrls.length} deleted pages from sitemap:`);
  deletedUrls.forEach(url => console.log(`  - ${url}`));
}

fs.writeFileSync(sitemapPath, sitemap);
console.log(`Sitemap generated! (${currentUrls.size} URLs)`);

function getPagesFromDirs(path) {
  try {
    const entries = fs.readdirSync(path, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => path + "/" + entry.name);
  } catch (err) {
    console.warn('Could not read projects directory:', err);
    return [];
  }
}