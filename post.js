document.addEventListener("DOMContentLoaded", () => {
  // --- 1. SETUP PAGE CONTENT ---
  const urlParams = new URLSearchParams(window.location.search);
  const postId = parseInt(urlParams.get("id"));
  const post = blogPosts.find((p) => p.id === postId) || blogPosts[0];

  document.getElementById("postTitle").innerText = post.title;
  document.getElementById("postMeta").innerText =
    `${post.category} | ${post.date}`;
  document.getElementById("postHeroImage").innerHTML =
    `<img src="${post.image}" class="hero-img-full" alt="${post.title}">`;

  // Content Splitting
  if (post.content.includes("<br><br>")) {
    const parts = post.content.split("<br><br>");
    document.getElementById("contentPartOne").innerHTML = `<p>${parts[0]}</p>`;
    document.getElementById("contentPartTwo").innerHTML =
      `<p>${parts[1] || ""}</p>`;
  } else {
    const words = post.content.split(" ");
    const mid = Math.floor(words.length / 2);
    document.getElementById("contentPartOne").innerHTML =
      `<p>${words.slice(0, mid).join(" ")}</p>`;
    document.getElementById("contentPartTwo").innerHTML =
      `<p>${words.slice(mid).join(" ")}</p>`;
  }

  // Suggestions
  const otherPosts = blogPosts.filter((p) => p.id !== post.id);
  const randomSugg = otherPosts[Math.floor(Math.random() * otherPosts.length)];
  document.getElementById("midSuggestionLink").innerHTML =
    `<a href="post.html?id=${randomSugg.id}">${randomSugg.title}</a>`;
  document.getElementById("bottomSuggestions").innerHTML = otherPosts
    .slice(0, 3)
    .map(
      (s) => `
        <div class="pop-card" onclick="window.location.href='post.html?id=${s.id}'">
            <img src="${s.image}">
            <h4>${s.title}</h4>
        </div>
    `,
    )
    .join("");

  // --- 2. THE COMMENT SYSTEM (Defined and Called here) ---
  const commentForm = document.getElementById("commentForm");
  const commentList = document.getElementById("commentList");
  const commentCount = document.getElementById("commentCount");

  const loadComments = () => {
    const comments =
      JSON.parse(localStorage.getItem(`comments_${postId}`)) || [];
    commentCount.innerText = comments.length;
    commentList.innerHTML =
      comments
        .map(
          (c) => `
          <div class="comment-item">
              <div class="comment-avatar">${c.name.charAt(0).toUpperCase()}</div>
              <div class="comment-body">
                  <strong>${c.name}</strong> <small style="color:#999; margin-left:10px;">${c.date}</small>
                  <p>${c.text}</p>
              </div>
          </div>
      `,
        )
        .join("") || "<p>No comments yet.</p>";
  };

  commentForm.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById("commentName").value;
    const text = document.getElementById("commentText").value;

    const comments =
      JSON.parse(localStorage.getItem(`comments_${postId}`)) || [];
    comments.push({ name, text, date: new Date().toLocaleDateString() });
    localStorage.setItem(`comments_${postId}`, JSON.stringify(comments));

    commentForm.reset();
    loadComments();
  };

  loadComments(); // Run once to show existing comments
});

// hambuger
document.addEventListener("DOMContentLoaded", () => {
  // 1. SAFE HAMBURGER LOGIC
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("navLinks");

  if (hamburger && nav) {
    hamburger.onclick = (e) => {
      e.preventDefault();
      nav.classList.toggle("active");
      console.log("Hamburger clicked!"); // Check your browser console to see this
    };
  }

  // 2. PAGE INITIALIZATION
  const urlParams = new URLSearchParams(window.location.search);
  const postId = parseInt(urlParams.get("id"));
  const post = blogPosts.find((p) => p.id === postId) || blogPosts[0];

  if (post) {
    document.getElementById("postTitle").innerText = post.title;
    document.getElementById("postMeta").innerText =
      `${post.category} | ${post.date}`;
    document.getElementById("postHeroImage").innerHTML =
      `<img src="${post.image}" class="hero-img-full">`;

    // Handle content
    const contentParts = post.content.split("<br><br>");
    document.getElementById("contentPartOne").innerHTML =
      `<p>${contentParts[0]}</p>`;
    if (contentParts[1]) {
      document.getElementById("contentPartTwo").innerHTML =
        `<p>${contentParts[1]}</p>`;
    }
  }

  // 3. SAFE SEARCH BYPASS
  // This prevents index.html search logic from breaking post.html
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.oninput = null; // Clears any conflicting listeners
  }
});
