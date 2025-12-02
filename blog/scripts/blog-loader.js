async function loadBlogPosts() {
    // Fetch posts data
    const response = await fetch('data/posts.json');
    const posts = await response.json();
    const postEntries = Object.entries(posts);
    
    if (posts) {
        document.getElementById('posts').innerHTML = postEntries.reverse().map(([key, post]) => `<post-card preview="" key=${key} title="${post.title}" org="${post.affiliation}" snippet="${post.snippet}" tags="${post.tags}" date="${post.date}"></post-card>`).reduce((prev, curr) => prev + "\n" + curr);
    } else {
        document.getElementById('posts').innerHTML = '<div>check back soon for more posts</div>';
    }
}

loadBlogPosts();