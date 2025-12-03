This past week I worked on getting my blog page up and running. Because my website is pure HTML & CSS (with a handful of JS), I hypothesized that I'd need an HTML file per post. I didn't like the idea of having to format my writing into HTML, so I tried to look for alternatives. What I settled on was 
## Dyanmic Post Loading (via JS)
and this is why it didn't work.

The pipeline I was working with was:
1) Write a markdown file
2) Link it's path in a `posts.json` file
3) Use the json file to dynamically populate the blog page with posts
4) On click, dynamically (a) convert `md -> html` and (b) fill in a template HTML file with

Steps 3 and 4b are where our `post-loader.js` file comes in play.

## How it works
The `blog/index.html` file has a section where I want to populate a card for each post. This is simple enough to do through `blog-loader.js` where I fetch the json and map through each post. In `index.html`, I just need to include a `<script src="scripts/blog-loader.js"></script>`.

Similar logic for `post-loader.js`:
1) Get the post from the url slug
2) Convert md to html
3) Fill in parts of the template like the title, metadata, and content.

This is how I modify the template dynamically:

```js_String_RegEx_for_building_html_code_dynamically
html = template
    .replace(/(<div id="affiliation">)[\s\S]*?(<\/div>)/, `$1${post.affiliation}$2`)
    .replace(/(<div id="funny-antedote">)[\s\S]*?(<\/div>)/, `$1${post.antedote}$2`)
    .replace(/(<div id="title">\s*<h1>)[\s\S]*?(<\/h1>\s*<\/div>)/, `$1${post.title}$2`)
    .replace(/(<article id="post-content">)[\s\S]*?(<\/article>)/, `$1${content}$2`);
```

So a url like `/blog/post/?post=post1` would route to the `index.html` template and then `post-loader.js` would fill in the details.

Perfect right?
## NO
The issue came because I wanted to scope-creep and make
## Dynamic Link Previews
When Twitter or iMessages generates a link preview for a url, it looks at the [OpenGraph Meta Tags](https://ogp.me/) (or *[Twitter Meta Tags](https://developer.x.com/en/docs/x-for-websites/cards/overview/markup)*) in the HTML like this:

```html_Meta_tags
<title>Abhiram's Blog Post</title>
<meta property="og:title" content="Abhiram's Blog" id="og-title">
<meta property="og:description" content="Check out Abhiram's Blog" id="og-description">
<meta property="og:url" content="https://abhiramtadepalli.github.io/blog/post/" id="og-url">
<meta property="og:type" content="article">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Abhiram's Blog" id="twitter-title">
<meta name="twitter:description" content="Check out Abhiram's Blog" id="twitter-description">
```
These generators run the HTML without JS. So my method of loading post content cannot help here.

This means I have 2 options:
1) Make a general set of meta tags that statically represent a blog post
But where's the fun in that?
So we go with
2) Find a way *(this options requires a bit of explaining)*

## The Way
If I want a different link preview for each post, I *need* a different .html file for each post.
That's not super hard – I just didn't want to duplicate information (like the content of the post) in multiple places while still maintaining an easy workflow for me. But remember how `post-loader.js` handles dynamic HTML modification? I can use those functions to batch-create HTML's. This way, each page can statically provide the right data to link previews.

Re-architecting the code itself was pretty simple. My new workflow makes me run `post-loader` as a script every time I update a blog post and it generates the HTML for me.

## Images
Scope-creep again. Of course.

Most platforms that render a link preview also include an image attached to it. I had the bright idea of making the preview image the title of the blog in the same font I use on my Blog.

I worked on this before in [UTD Trends](https://trends.utdnebula.com/) but never actually got around to implementing it. [This feature](https://github.com/UTDNebula/utd-trends/pull/525/files) developed by one of our engineers, however, gave me inspiration. In it, the library [html2canvas](https://html2canvas.hertzen.com/) loads the HTML and takes a screenshot. I've done something similar using Puppeteer, so I installed that library and played around.

```js_Puppeteer_Screenshot
// Load HTML content
await page.goto(`file://${path.resolve(outputPath, 'preview.html')}`, {
  waitUntil: 'networkidle0'
});

// Take screenshot
await page.screenshot({ path: path.join(outputPath, 'preview.png') });
```

The next step is to actually create an HTML file just for the preview. Another template. OpenGraph previews are often rendered in 1200x630, so I made a basic template using the same styling as my blog post page.

The final part was actually including this in `post-loader.js`. I generate an HTML for each post and take a snapshot, then I delete the HTML and pass the png filepath into the meta tag.

```html_Dynamically_generated_meta_tags
<!-- Default meta tags (will be updated by JavaScript) -->
<title>The One where I build a Course Name Search | Abhiram's Blog</title>
<meta property="og:title" content="The One where I build a Course Name Search" id="og-title">
<meta property="og:description" content="Nebula Labs &bull; I don't know what CS 4375 is, but I do know how to type &quot;Machine Learning&quot;" id="og-description">
<meta property="og:image" content="https://abhiramtadepalli.github.io/blog/post/course-name-search/preview.png" />
<meta property="og:url" content="https://abhiramtadepalli.github.io/blog/post/course-name-search" id="og-url">
<meta property="og:type" content="article">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://abhiramtadepalli.github.io/blog/post/course-name-search/preview.png" />
<meta name="twitter:title" content="The One where I build a Course Name Search" id="twitter-title">
<meta name="twitter:description" content="yes, I use em dashes. no, I did not have an LLM write this." id="twitter-description">
<!-- End of meta tags -->
```

If you look at my [source files](https://github.com/AbhiramTadepalli/abhiramtadepalli.github.io), you'll now see  `blog/post/index.html` & `blog/post/preview-template.html` templates and `blog/post/{name}/index.html` & `blog/post/{name}/preview.png` under each post folder. Neat!

## Why I did this
I'm a completionist and I wanted a fully functional Blog Page before I made [this post](https://abhiramtadepalli.github.io/blog/post/course-name-search/) public on LinkedIn (my first post!). I'll probably get around to that tomorrow. As I am writing this, however, I just noticed that I never specifically added meta tags for my home and `/blog` pages. Let me get working on that...

And if you got to this page without seeing a link preview, here's how it looks:

<img src="/blog/post/how-to-blog-a-blog/preview.png" style="width: 30rem; margin-top: 1rem;"></img>

Neat, right!