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
        document.getElementById('post-content').innerHTML = post.content;
    } else {
        document.getElementById('post-content').innerHTML = '<h1>Post not found</h1>';
    }
}

loadBlogPost();