async function loadBlogPost() {
    // Get slug from URL: blog-post.html?slug=course-name-search
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    // Fetch posts data
    const response = await fetch('../data/posts.json');
    const posts = await response.json();
    const post = posts[slug];
    
    if (post) {
        document.getElementById('title').textContent = post.title;
        document.getElementById('post-content').innerHTML = await loadContents(post.content);
    } else {
        document.getElementById('post-content').innerHTML = '<h1>Post not found</h1>';
    }
}

async function loadContents(md)
{
    return fetch('../data/' + md).then(response => response.text())
    .then (md => {
        const html = markdownToHTML(md);
        return html;
    });
}

function markdownToHTML(md) {
  if (!md) return "";

  let html = md;

  // Step 1: Extract and protect fenced code blocks (``````)
  const codeBlocks = [];
  html = html.replace(/``````/g, (match, lang, code) => {
    const placeholder = `___CODE_BLOCK_${codeBlocks.length}___`;
    codeBlocks.push({ lang, code: code.trim() });
    return placeholder;
  });

  // Step 2: Basic HTML escaping (for text outside code blocks)
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Step 3: Blockquotes (lines starting with >)
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

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

  // Step 7: Inline code `code`
  html = html.replace(/`(.+?)`/g, "<code>$1</code>");

  // Step 8: Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Step 12: Restore code blocks
  codeBlocks.forEach((block, i) => {
    const langAttr = block.lang ? ` class="language-${block.lang}"` : "";
    const codeHtml = `<pre><code${langAttr}>${block.code}</code></pre>`;
    html = html.replace(`___CODE_BLOCK_${i}___`, codeHtml);
  });

  return html;
}

loadBlogPost();