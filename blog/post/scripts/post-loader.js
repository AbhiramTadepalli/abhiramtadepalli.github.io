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
    const mdPath = path.join('blog/data/', post.content);
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    
    // Convert to HTML
    const htmlContent = markdownToHTML(markdown);
    
    // Generate complete HTML page
    const fullHTML = generateHTML(post, htmlContent, slug);
    

    // Create folder for the slug
    const slugDir = path.join(baseDir, slug);
    if (!fs.existsSync(slugDir)) {
      fs.mkdirSync(slugDir, { recursive: true });
    }
    // Write index.html inside the slug folder
    const outputPath = path.join(slugDir, 'index.html');
    fs.writeFileSync(outputPath, fullHTML);
    
    console.log(`✓ Generated ${outputPath}`);
  }
  
  console.log('\nAll posts generated successfully!');
}
/** Injects headers, meta, and post content */
function generateHTML(post, content, slug)
{
    const template = fs.readFileSync('blog/post/index.html', 'utf-8');
    let html = null;
    if (post) {
        html = template
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
        .map((line) =>
        line.replace(/^(?:\(\d+\)|\d+[.)]) /, "").trim()
        )
        .map((item) => `  <li>${item}</li>`)
        .join("\n");
    return `<ol>\n${items}\n</ol>`;
    });

  // Step 7: Inline code `code`
  html = html.replace(/`(.+?)`/g, "<code>$1</code>");

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
    const codeHtml = `<details class="collapsible"><summary>${block.lang.substring(block.lang.indexOf("_") + 1).replaceAll("_", " ").trim()}</summary><div class="code-container"><div class="code-block"><pre><code${langAttr}>${block.code}</code></pre></div></div></details>`;
    html = html.replace(`~~CODE~BLOCK_${i}~~`, codeHtml);
  });

  return html;
}


generateBlogPosts().catch(console.error);