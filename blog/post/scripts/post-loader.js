async function loadBlogPost() {
    // Get slug from URL: blog/post/?post=course-name-search
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('post');
    // Fetch posts data
    const response = await fetch('../data/posts.json');
    const posts = await response.json();
    const post = posts[slug];
    
    if (post) {
        document.getElementById('date').textContent = post.date;
        document.getElementById('affiliation').textContent = post.affiliation;
        document.getElementById('funny-antedote').textContent = post.antedote;
        // document.getElementById('tldr').textContent = post.summary;
        document.getElementById('title').textContent = post.title;
        document.getElementById('post-content').innerHTML = await loadContents(post.content);
        attachDetailsListeners();
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

/** For collapsible code chunks, scrolls into view on close */
function attachDetailsListeners() {
    const detailsElements = document.querySelectorAll('details');
    
    detailsElements.forEach(details => {
        const codeContainer = details.querySelector('.code-container');
        const summary = details.querySelector('summary');

        summary.addEventListener('click', (e) => {
            // Check if details is currently open
            if (details.hasAttribute('open')) {
                // Prevent the default close behavior
                e.preventDefault();

                // Scroll summary into view
                // Check if summary is already in viewport
                const rect = summary.getBoundingClientRect();
                const targetScrollTop = details.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3;
                const isInViewport = (
                    rect.top >= 0 &&
                    rect.bottom <= window.innerHeight &&
                    rect.left >= 0 &&
                    rect.right <= window.innerWidth
                );
                
                // Only scroll if not already visible
                if (!isInViewport) {
                    // Scroll with offset using window.scrollTo
                    window.scrollTo({
                        top: targetScrollTop,
                        behavior: 'smooth'
                    });
                }
                
                // Add closing class for animation
                details.classList.add('closing');
                
                // Wait for animation to complete, then actually close
                setTimeout(() => {
                    details.removeAttribute('open');
                    details.classList.remove('closing');
                }, 500); // Match your CSS transition duration
            } else {
                // Opening
                requestAnimationFrame(() => {
                    codeContainer.style.maxHeight = codeContainer.scrollHeight + 'px';
                }); // to fix safari bug
                // First, temporarily remove max-height to measure
                codeContainer.style.transition = 'none';
                codeContainer.style.maxHeight = 'none';
                const height = codeContainer.scrollHeight;
                
                // Reset to 0
                codeContainer.style.maxHeight = '0';
                
                // Force browser reflow
                codeContainer.offsetHeight;
                
                // Re-enable transition and animate
                codeContainer.style.transition = '';
                setTimeout(() => {
                    codeContainer.style.maxHeight = height + 'px';
                }, 10);
            }
        });
    });
}


loadBlogPost();