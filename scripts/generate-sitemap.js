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

Object.keys(posts).forEach(slug => {
  const post = posts[slug];
  sitemap += `
  <url>
    <loc>${baseUrl}/blog/post/?post=${slug}</loc>
    <lastmod>${post.date || today}</lastmod>
    <priority>0.8</priority>
  </url>`;
});

sitemap += '\n</urlset>';

fs.writeFileSync('sitemap.xml', sitemap);
console.log('Sitemap generated!');
