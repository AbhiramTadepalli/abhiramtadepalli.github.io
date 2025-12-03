const fs = require('fs');
const path = require('path');

/** Creates a .html file for every post in /blog/data/posts.json */
async function generateBlogPosts() {
  // Read posts.json
  const postsData = JSON.parse(fs.readFileSync('blog/data/posts.json', 'utf-8'));
  
  const baseDir = 'blog/post';
  
  // Clear all subdirectories (that contain index.html) except the main post directory
  const items = fs.readdirSync(baseDir);
  items.forEach(item => {
    const itemPath = path.join(baseDir, item);
    const stat = fs.statSync(itemPath);
    
    // If it's a directory and contains index.html, delete it
    if (stat.isDirectory()) {
      if (fs.existsSync(path.join(itemPath, 'index.html'))) {
        fs.rmSync(itemPath, { recursive: true, force: true });
        console.log(`Deleted folder: ${item}/`);
      }
    }
  });
  
  // Generate HTML for each post
  for (const [slug, post] of Object.entries(postsData)) {
    console.log(`Generating ${slug}...`);
    
    // Read markdown content
    const markdown = loadMarkdown(post.content);
    
    // Convert to HTML
    const htmlContent = markdownToHTML(markdown);    

    // Create folder for the slug
    const slugDir = path.join(baseDir, slug);
    if (!fs.existsSync(slugDir)) {
      fs.mkdirSync(slugDir, { recursive: true });
    }

    // Generate Link Preview Image
    generatePreviewImage(post, slugDir)

    // Generate complete HTML page
    const fullHTML = generateHTML(post, htmlContent, slug);

    // Write index.html inside the slug folder
    const outputPath = path.join(slugDir, 'index.html');
    fs.writeFileSync(outputPath, fullHTML);
    
    console.log(`✓ Generated ${outputPath}`);
  }
  
  console.log('\nAll posts generated successfully!');
}

function loadMarkdown(filepath)
{
    const mdPath = path.join('blog/data/', filepath);
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    return markdown;
}

/** Injects headers, meta, and post content */
function generateHTML(post, content, slug)
{
    const template = fs.readFileSync('blog/post/index.html', 'utf-8');
    let html = null;
    if (post) {
        // Generate meta tags section
        const metaTags = `
            <!-- Default meta tags (will be updated by JavaScript) -->
            <title>${post.title} | Abhiram's Blog</title>
            <meta property="og:title" content="${post.title}" id="og-title">
            <meta property="og:description" content="${post.affiliation + " &bull; " + post.snippet || 'Check out Abhiram\'s Blog'}" id="og-description">
            <meta property="og:image" content="https://abhiramtadepalli.github.io/blog/post/${slug}/preview.png" />
            <meta property="og:url" content="https://abhiramtadepalli.github.io/blog/post/${slug}" id="og-url">
            <meta property="og:type" content="article">
            
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:image" content="https://abhiramtadepalli.github.io/blog/post/${slug}/preview.png" />
            <meta name="twitter:title" content="${post.title}" id="twitter-title">
            <meta name="twitter:description" content="${post.antedote || 'Check out Abhiram\'s Blog'}" id="twitter-description">
            <!-- End of meta tags -->
        `;
        
        html = template
            .replace(/<!-- Default meta tags[\s\S]*?<!-- End of meta tags -->/, metaTags)
            .replace(/(<div id="date">)[\s\S]*?(<\/div>)/, `$1${post.date}$2`)
            .replace(/(<div id="affiliation">)[\s\S]*?(<\/div>)/, `$1${post.affiliation}$2`)
            .replace(/(<div id="funny-antedote">)[\s\S]*?(<\/div>)/, `$1${post.antedote}$2`)
            .replace(/(<div id="title">\s*<h1>)[\s\S]*?(<\/h1>\s*<\/div>)/, `$1${post.title}$2`)
            .replace(/(<article id="post-content">)[\s\S]*?(<\/article>)/, `$1${content}$2`);
    }
    else {
        html = template
            .replace(/(<article id="post-content">)[\s\S]*?(<\/article>)/, `$1<h1>Post not found</h1>$2`);
    }
    return html;
}

async function generatePreviewImage(post, outputPath) {
  // Read template & fill it in
  let html = fs.readFileSync('blog/post/preview-template.html', 'utf8');
  html = html.replace('{{TITLE}}', post.title);
  html = html.replace('{{AFFILIATION}}', post.affiliation);
  html = html.replace('{{AUTHOR}}', "Abhiram Tadepalli");
  const time = Math.floor(loadMarkdown(post.content).trim().split(/\s+/).length * 0.66 / 300);
  html = html.replace('{{TIME}}', time > 1 ? `${time} min read` : '1 min read');

  // Write preview.html inside the slug folder
  fs.writeFileSync(path.join(outputPath, 'preview.html'), html);
  
  // Launch browser
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to OG image dimensions
  await page.setViewport({ width: 1200, height: 630 });
  
  // Load HTML content
  await page.goto(`file://${path.resolve(outputPath, 'preview.html')}`, {
    waitUntil: 'networkidle0'
  });

  // Take screenshot
  await page.screenshot({ path: path.join(outputPath, 'preview.png') });
  
  // delete preview.html
  fs.unlinkSync(path.join(outputPath, 'preview.html'));

  await browser.close();
  console.log(`Generated: ${outputPath}`);
}

function markdownToHTML(md) {
  if (!md) return "";

  let html = md;

  // Step 1: Extract and protect fenced code blocks (``````)
  const codeBlocks = [];
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `~~CODE~BLOCK_${codeBlocks.length}~~`;
    codeBlocks.push({ lang, code: code.trim() });
    return placeholder;
  });

  // Step 2: Basic HTML escaping (for text outside code blocks)
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

    // Step 3: Blockquotes (lines starting with >)
    html = html.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");

  // Step 4: Headings
  html = html
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Step 9: Unordered lists with nested support (up to 2 levels) for - or *
    html = html.replace(/((?:^[*-] .+$\n?)+(?:^ {2}[*-] .+$\n?)*)+/gm, (match) => {
        const lines = match.trim().split("\n");
        let result = "<ul>\n";
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check if this is a nested item (starts with 2 spaces)
            if (line.match(/^ {2}[*-] /)) {
            // Start nested list if this is the first nested item
            if (i === 0 || !lines[i - 1].match(/^ {2}[*-] /)) {
                result += "<ul>\n";
            }
            
            const item = line.replace(/^ {2}[*-] /, "").trim();
            result += `  <li>${item}</li>\n`;
            
            // Close nested list if next line is not nested
            if (i === lines.length - 1 || !lines[i + 1].match(/^ {2}[*-] /)) {
                result += "</ul>\n";
            }
            } else {
            // Top-level item
            const item = line.replace(/^[*-] /, "").trim();
            result += `  <li>${item}</li>\n`;
            }
        }
        
        result += "</ul>";
        return result;
    });


  // Step 10: Ordered lists (lines starting with 1., 2., etc.)
  html = html.replace(/((?:^(?:\(\d+\)|\d+[.)]) .+$\n?)+)/gm, (match) => {
    const items = match
        .trim()
        .split("\n")
        .map((line) => {
          const numMatch = line.match(/^(?:\((\d+)\)|(\d+)[.)])\s*/);
          const num = numMatch ? (numMatch[1] || numMatch[2]) : null;
          const newLine = line.replace(/^(?:\(\d+\)|\d+[.)]) /, "").trim();
          return {num, newLine};;
        })
        .map(({num, newLine}) => `  <li ${num ? 'value="' + num + '"' : ""}>${newLine}</li>`)
        .join("\n");
    return `<ol>\n${items}\n</ol>`;
    });

  // Step 7: Inline code `code`
  html = html.replace(/`(.+?)`/g, '<code class="inline-code">$1</code>');

  // Step 11: Paragraphs (wrap remaining non-HTML lines)
  html = html.replace(/^(?!<[a-z]|___CODE)(.+)$/gm, (match) => {
    if (!match.trim()) return match;
    return `<p>${match}</p>`;
  });

  // Step 5: Bold **text**
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Step 6: Italic *text* or _text_ (strict matching opening and closing delimeters)
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Step 8: Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        return url.startsWith('/') 
            ? `<a href="${url}">${text}</a>`
            : `<a href="${url}" target="_blank">${text}</a>`;
    });

  // Step 12: Restore code blocks
  codeBlocks.forEach((block, i) => {
    const langAttr = block.lang ? ` class="language-${block.lang.substring(0, block.lang.indexOf("_"))}"` : "";
    const codeHtml = `<details class="collapsible"><summary>${block.lang.substring(block.lang.indexOf("_") + 1).replaceAll("_", " ").trim()}</summary><div class="code-container"><div class="code-block"><pre><code${langAttr}>${cleanSpecialCharacters(block.code)}</code></pre></div></div></details>`;
    html = html.replace(`~~CODE~BLOCK_${i}~~`, codeHtml);
  });

  return html;
}

/** Use &lt instead of < in the code blocks so as to not trigger html and other languages in the browser rendering */
function cleanSpecialCharacters(code) {
  return code
    .replaceAll('&', '&amp;')   // MUST be first
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('`', '&#96;')
    .replaceAll('$', '&#36;');
}

generateBlogPosts().catch(console.error);