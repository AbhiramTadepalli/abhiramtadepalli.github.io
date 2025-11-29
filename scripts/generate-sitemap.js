const fs = require('fs');
const posts = require('..//blog/data/posts.json');

const baseUrl = 'https://abhiramtadepalli.github.io';
const today = new Date().toISOString().split('T')[0];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog/</loc>
    <lastmod>${today}</lastmod>
    <priority>0.9</priority>
  </url>`;

// Add Blog posts
Object.keys(posts).forEach(slug => {
  const post = posts[slug];
  sitemap += `
  <url>
    <loc>${baseUrl}/blog/post/${slug}</loc>
    <lastmod>${post.date || today}</lastmod>
    <priority>0.8</priority>
  </url>`;
});

// Add project, org, and cert pages
const pagesFromDirs = getPagesFromDirs("projects").concat(getPagesFromDirs("organizations")).concat(getPagesFromDirs("certifications"));

pagesFromDirs.forEach(page => {
  sitemap += `
  <url>
    <loc>${baseUrl}/${page}/</loc>
    <lastmod>${today}</lastmod>
    <priority>0.8</priority>
  </url>`;
});

sitemap += '\n</urlset>';

fs.writeFileSync('sitemap.xml', sitemap);
console.log('Sitemap generated!');


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