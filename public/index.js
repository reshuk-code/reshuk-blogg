 // Function to fetch and display posts
 async function fetchPosts() {
    try {
        const response = await fetch('http://localhost:3000/api/posts');
        const posts = await response.json();
        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
            <em>Posted on: ${new Date(post.createdAt).toLocaleString()}</em>
                <h3>${post.title}</h3>
                <img src="${post.coverImage}" alt="Cover Image">
                <p>${post.content}</p>
                <button onclick="likePost('${post._id}')">👍 Like (${post.likes})</button>
                <button onclick="dislikePost('${post._id}')">👎 Dislike (${post.dislikes})</button>
                <div class="reply-section">
                    <textarea id="reply-input-${post._id}" placeholder="Write a reply..."></textarea>
                    <button onclick="replyToPost('${post._id}')">Reply</button>
                </div>
                <div class="replies">
                    ${post.replies.map(reply => `
                        <div class="reply">
                            <p>${reply.reply}</p>
                            <em>Replied on: ${new Date(reply.createdAt).toLocaleString()}</em>
                        </div>
                    `).join('')}
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    } catch (err) {
        console.error('Error fetching posts:', err);
    }
}

// Function to submit a new post
document.getElementById('postForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const author = document.getElementById('author').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const coverImage = document.getElementById('coverImage').files[0];

    const formData = new FormData();
    formData.append('author', author);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('coverImage', coverImage);

    try {
        await fetch('http://localhost:3000/api/postUpdaTe', {
            method: 'POST',
            body: formData
        });
        alert('Post submitted successfully');
        fetchPosts();
    } catch (err) {
        console.error('Error submitting post:', err);
        alert('Error submitting post');
    }
});
document.getElementById('postForm').reset(); 
// Function to like a post
async function likePost(postId) {
    try {
        const response = await fetch(`http://localhost:3000/api/like/${postId}`, {
            method: 'POST'
        });
        const data = await response.json();
        alert('Post liked');
        fetchPosts();
    } catch (err) {
        console.error('Error liking post:', err);
    }
}

// Function to dislike a post
async function dislikePost(postId) {
    try {
        const response = await fetch(`http://localhost:3000/api/dislike/${postId}`, {
            method: 'POST'
        });
        const data = await response.json();
        alert('Post disliked');
        fetchPosts();
    } catch (err) {
        console.error('Error disliking post:', err);
    }
}

// Function to reply to a post
async function replyToPost(postId) {
    const replyText = document.getElementById(`reply-input-${postId}`).value;
    if (replyText.trim()) {
        try {
            const response = await fetch(`http://localhost:3000/api/reply/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reply: replyText })
            });
            const data = await response.json();
            alert('Replied successfully');
            fetchPosts();
        } catch (err) {
            console.error('Error replying to post:', err);
        }
    } else {
        alert('Reply cannot be empty');
    }
}

// Fetch posts on page load
fetchPosts();