// Blog functionality
let currentUser = null;
let currentPostId = null;
let isEditing = false;

// Initialize blog when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadBlogPosts();
    setupEventListeners();
    checkAuthStatus();
});

// Setup event listeners
function setupEventListeners() {
    // Blog post form submission
    const form = document.getElementById('blog-post-form');
    if (form) {
        form.addEventListener('submit', handlePostSubmit);
    }

    // Admin login form submission
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // Admin login/logout
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', toggleAdmin);
    }
}

// Check authentication status
async function checkAuthStatus() {
    try {
        // Check if user is authenticated using the auth functions
        if (typeof isAuthenticated === 'function' && isAuthenticated()) {
            currentUser = getCurrentUser();
        } else {
            currentUser = null;
        }
        updateAdminUI();
    } catch (error) {
        console.error('Error checking auth status:', error);
        currentUser = null;
    }
}

// Update admin UI based on authentication
function updateAdminUI() {
    const adminSection = document.getElementById('admin-section');
    const editBtn = document.getElementById('edit-post-btn');
    const deleteBtn = document.getElementById('delete-post-btn');
    const loginForm = document.getElementById('login-form');
    const adminControls = document.getElementById('admin-controls');
    
    if (currentUser) {
        if (editBtn) editBtn.style.display = 'inline-block';
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
        if (loginForm) loginForm.style.display = 'none';
        if (adminControls) adminControls.style.display = 'block';
    } else {
        if (editBtn) editBtn.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
        if (adminControls) adminControls.style.display = 'none';
    }
}

// Load blog posts
async function loadBlogPosts() {
    const blogList = document.getElementById('blog-list');
    if (!blogList) return;

    try {
        blogList.innerHTML = '<div class="col-12"><div class="loading">Loading posts...</div></div>';
        
        // Call the list-posts function
        const posts = await listPosts();
        
        if (posts && posts.length > 0) {
            displayBlogPosts(posts);
        } else {
            blogList.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <h3>No posts yet</h3>
                        <p>Check back soon for new content!</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        blogList.innerHTML = `
            <div class="col-12">
                <div class="error-state">
                    <h3>Error loading posts</h3>
                    <p>Please try again later.</p>
                </div>
            </div>
        `;
    }
}

// Display blog posts in the list
function displayBlogPosts(posts) {
    const blogList = document.getElementById('blog-list');
    if (!blogList) return;

    const postsHTML = posts.map(post => `
        <div class="col-4 col-12-medium">
            <article class="blog-post-preview">
                <header>
                    <h3>${post.title}</h3>
                    <p class="post-meta">
                        <span class="date">${formatDate(post.createdAt)}</span>
                        ${post.tags && post.tags.length > 0 ? 
                            `<span class="tags">${post.tags.join(', ')}</span>` : ''}
                    </p>
                </header>
                <p>${truncateContent(post.content, 150)}</p>
                <ul class="actions special">
                    <li><a href="#" class="button" onclick="viewPost('${post.id}')">Read More</a></li>
                </ul>
            </article>
        </div>
    `).join('');

    blogList.innerHTML = postsHTML;
}

// View individual post
async function viewPost(postId) {
    try {
        const post = await getPost(postId);
        if (!post) {
            alert('Post not found');
            return;
        }

        currentPostId = postId;
        displaySinglePost(post);
        showSinglePostSection();
    } catch (error) {
        console.error('Error loading post:', error);
        alert('Error loading post');
    }
}

// Display single post
function displaySinglePost(post) {
    const postContent = document.getElementById('post-content');
    if (!postContent) return;

    const postHTML = `
        <article class="blog-post">
            <header>
                <h2>${post.title}</h2>
                <p class="post-meta">
                    <span class="date">${formatDate(post.createdAt)}</span>
                    ${post.updatedAt && post.updatedAt !== post.createdAt ? 
                        `<span class="updated">(Updated: ${formatDate(post.updatedAt)})</span>` : ''}
                    ${post.tags && post.tags.length > 0 ? 
                        `<span class="tags">${post.tags.join(', ')}</span>` : ''}
                </p>
            </header>
            <div class="post-body">
                ${formatContent(post.content)}
            </div>
        </article>
    `;

    postContent.innerHTML = postHTML;
}

// Show single post section
function showSinglePostSection() {
    document.getElementById('blog-posts').style.display = 'none';
    document.getElementById('single-post').style.display = 'block';
    document.getElementById('admin-section').style.display = 'none';
    document.getElementById('post-form').style.display = 'none';
}

// Show blog list
function showBlogList() {
    document.getElementById('blog-posts').style.display = 'block';
    document.getElementById('single-post').style.display = 'none';
    document.getElementById('admin-section').style.display = 'none';
    document.getElementById('post-form').style.display = 'none';
    currentPostId = null;
    isEditing = false;
}

// Show create post form
function showCreatePostForm() {
    if (!currentUser) {
        alert('Please log in to create posts');
        return;
    }

    isEditing = false;
    currentPostId = null;
    document.getElementById('form-title').textContent = 'Create New Post';
    document.getElementById('post-title').value = '';
    document.getElementById('post-content-input').value = '';
    document.getElementById('post-tags').value = '';

    document.getElementById('blog-posts').style.display = 'none';
    document.getElementById('single-post').style.display = 'none';
    document.getElementById('admin-section').style.display = 'none';
    document.getElementById('post-form').style.display = 'block';
}

// Show edit post form
function showEditPostForm() {
    if (!currentUser) {
        alert('Please log in to edit posts');
        return;
    }

    if (!currentPostId) {
        alert('No post selected for editing');
        return;
    }

    // Load current post data into form
    loadPostForEditing(currentPostId);
}

// Load post data for editing
async function loadPostForEditing(postId) {
    try {
        const post = await getPost(postId);
        if (!post) {
            alert('Post not found');
            return;
        }

        isEditing = true;
        currentPostId = postId;
        document.getElementById('form-title').textContent = 'Edit Post';
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-content-input').value = post.content;
        document.getElementById('post-tags').value = post.tags ? post.tags.join(', ') : '';

        document.getElementById('blog-posts').style.display = 'none';
        document.getElementById('single-post').style.display = 'none';
        document.getElementById('admin-section').style.display = 'none';
        document.getElementById('post-form').style.display = 'block';
    } catch (error) {
        console.error('Error loading post for editing:', error);
        alert('Error loading post for editing');
    }
}

// Handle post form submission
async function handlePostSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-content-input').value.trim();
    const tags = document.getElementById('post-tags').value.trim();

    if (!title || !content) {
        alert('Please fill in all required fields');
        return;
    }

    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    try {
        if (isEditing) {
            // Update existing post
            await updatePost(currentPostId, { title, content, tags: tagsArray });
            alert('Post updated successfully!');
        } else {
            // Create new post
            await createPost({ title, content, tags: tagsArray });
            alert('Post created successfully!');
        }

        // Reload posts and show list
        await loadBlogPosts();
        showBlogList();
    } catch (error) {
        console.error('Error saving post:', error);
        alert('Error saving post. Please try again.');
    }
}

// Delete post
async function deleteCurrentPost() {
    if (!currentUser) {
        alert('Please log in to delete posts');
        return;
    }

    if (!currentPostId) {
        alert('No post selected for deletion');
        return;
    }

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }

    try {
        await deletePost(currentPostId);
        alert('Post deleted successfully!');
        await loadBlogPosts();
        showBlogList();
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post. Please try again.');
    }
}

// Cancel edit
function cancelEdit() {
    showBlogList();
}

// Handle login form submission
async function handleLoginSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    try {
        const result = await login(email, password);
        if (result.success) {
            currentUser = result.user;
            updateAdminUI();
            alert('Login successful!');
            document.getElementById('login-email').value = '';
            document.getElementById('login-password').value = '';
        } else {
            alert('Login failed: ' + result.error);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Toggle admin section
function toggleAdmin() {
    const adminSection = document.getElementById('admin-section');
    if (adminSection.style.display === 'none') {
        adminSection.style.display = 'block';
    } else {
        adminSection.style.display = 'none';
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function truncateContent(content, maxLength) {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
}

function formatContent(content) {
    // Simple markdown-like formatting
    // You can enhance this with a proper markdown parser
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

// Add some CSS for blog styling
const blogStyles = `
<style>
.blog-post-preview {
    border: 1px solid #ddd;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 5px;
    transition: box-shadow 0.3s ease;
}

.blog-post-preview:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.post-meta {
    color: #666;
    font-size: 0.9em;
    margin-bottom: 10px;
}

.post-meta .date {
    font-weight: bold;
}

.post-meta .tags {
    margin-left: 10px;
    color: #888;
}

.blog-post {
    max-width: 800px;
    margin: 0 auto;
}

.blog-post header {
    margin-bottom: 30px;
    text-align: center;
}

.blog-post .post-body {
    line-height: 1.6;
    font-size: 1.1em;
}

.loading, .empty-state, .error-state {
    text-align: center;
    padding: 40px;
    color: #666;
}

#post-form textarea {
    font-family: monospace;
    font-size: 14px;
}

.post-actions {
    margin-top: 30px;
    text-align: center;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', blogStyles);
