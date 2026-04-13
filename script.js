// 1. CONFIGURATION
const SANITY_CONFIG = {
  projectId: "en43zbld",
  dataset: "production",
  useCdn: true,
  apiVersion: "2021-10-21",
};

// 2. STATE MANAGEMENT
let blogPosts = [];
let postsShown = 8;

// --- DYNAMIC DATA FETCH (POSTS) ---
// --- DYNAMIC DATA FETCH (POSTS) ---
// --- DYNAMIC DATA FETCH (POSTS) ---
async function fetchPosts() {
  const QUERY =
    encodeURIComponent(`*[_type == "post"] | order(publishedAt desc) [0...10] {
    title,
    "id": _id,
    "date": publishedAt,
    "image": mainImage.asset->url,
    "category": categories[0]->title,
    excerpt
  }`);

  const URL = `https://en43zbld.api.sanity.io/v1/data/query/production?query=${QUERY}`;

  try {
    const res = await fetch(URL);
    const data = await res.json();

    // 1. Update the global array so search and other functions work
    blogPosts = data.result || [];

    const mainContainer = document.getElementById("postsContainer");
    const popularContainer = document.getElementById("popular-grid");

    if (blogPosts.length > 0) {
      // 2. Render Main Feed
      if (mainContainer) {
        mainContainer.innerHTML = blogPosts
          .map((post) => {
            const dateStr = post.date
              ? new Date(post.date).toLocaleDateString()
              : "Recent";
            return `
              <article class="post-card">
                  <img src="${post.image || "https://via.placeholder.com/400x250"}" alt="${post.title}">
                  <div class="post-info">
                      <h3>${post.title}</h3>
                      <p>${post.excerpt ? post.excerpt.substring(0, 150) + "..." : "Click read more to see the full story."}</p>
                      <div class="post-meta">${post.category || "General"} | ${dateStr}</div>
                      <a href="post.html?id=${post.id}" class="btn-read">Read More</a>
                  </div>
              </article>
            `;
          })
          .join("");
      }

      // 3. Render Popular Section
      if (popularContainer) {
        const popularPosts = blogPosts.slice(0, 3);
        popularContainer.innerHTML = popularPosts
          .map(
            (post) => `
            <div class="popular-card">
              <img src="${post.image || "https://via.placeholder.com/400x250"}" alt="${post.title}">
              <div class="popular-card-content">
                <span>${post.category || "Lifestyle"}</span>
                <h4><a href="post.html?id=${post.id}">${post.title}</a></h4>
              </div>
            </div>
          `,
          )
          .join("");
      }
    }
  } catch (err) {
    console.error("Error fetching homepage posts:", err);
  }
}

async function fetchSinglePost(id) {
  // 1. Updated Query: "recommended" now fetches a list (up to 6)

  const QUERY = encodeURIComponent(`{
  "post": *[_id == "${id}"][0]{
    title,
    "date": publishedAt,
    "category": categories[0]->title,
    "image": mainImage.asset->url,
    body,
    "authorName": author->name
  },
  "recommended": *[_type == "post" && _id != "${id}"][0...6]{
    title,
    "id": _id,
    "image": mainImage.asset->url,
    "category": categories[0]->title
  }
}`);

  const URL = `https://en43zbld.api.sanity.io/v1/data/query/production?query=${QUERY}`;

  try {
    const res = await fetch(URL);
    const data = await res.json();
    const { post, recommended } = data.result;

    if (post) {
      // --- CONTENT INJECTION ---
      if (document.getElementById("postTitle"))
        document.getElementById("postTitle").innerText = post.title;

      const meta = document.getElementById("postMeta");
      if (meta) {
        const formattedDate = post.date
          ? new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "";
        meta.innerHTML = `By <strong>${post.authorName || "Oluwabunmi Oke"}</strong> | ${post.category || "General"} | ${formattedDate}`;
      }

      const imageContainer = document.getElementById("postHeroImage");
      if (imageContainer && post.image) {
        imageContainer.innerHTML = `<img src="${post.image}" class="hero-img-full" alt="${post.title}">`;
      }

      // Update Body Content
      // Update Body Content
      // --- UPDATED BODY & IN-FEED RECOMMENDATIONS ---
      const contentArea = document.getElementById("contentPartOne");

      if (contentArea && post.body) {
        // Convert all blocks to HTML first
        let htmlBlocks = post.body.map((block) => {
          if (block.style === "h2") return `<h2>${block.children[0].text}</h2>`;
          if (block.style === "h3") return `<h3>${block.children[0].text}</h3>`;

          if (block.listItem === "bullet") {
            const listText = block.children
              .map((c) =>
                c.marks?.includes("strong")
                  ? `<strong>${c.text}</strong>`
                  : c.text,
              )
              .join("");
            return `<li>${listText}</li>`;
          }

          if (block._type === "block") {
            const pText = block.children
              .map((c) => {
                let t = c.text;
                if (c.marks?.includes("strong")) t = `<strong>${t}</strong>`;
                if (c.marks?.includes("em")) t = `<em>${t}</em>`;
                return t;
              })
              .join("");
            return `<p>${pText}</p>`;
          }
          return "";
        });

        // Function to create a suggestion box HTML
        const createRecBox = (recPost) => `
          <div class="mid-post-suggestion">
            <span>Recommended</span>
            <a href="post.html?id=${recPost.id}">${recPost.title}</a>
          </div>
        `;

        // Insert recommendations at specific points (e.g., after block 3 and block 7)
        if (recommended && recommended.length > 0) {
          if (htmlBlocks.length > 4) {
            htmlBlocks.splice(3, 0, createRecBox(recommended[0]));
          }
          if (htmlBlocks.length > 9 && recommended.length > 1) {
            htmlBlocks.splice(8, 0, createRecBox(recommended[1]));
          }
        }

        contentArea.innerHTML = htmlBlocks.join("");
      }

      // --- MULTIPLE RECOMMENDATIONS LOGIC ---
      // --- MULTIPLE RECOMMENDATIONS LOGIC ---
      const suggestionBox = document.getElementById("midSuggestionBox");
      const suggestionLinkContainer =
        document.getElementById("midSuggestionLink");
      const bottomGrid = document.getElementById("bottomSuggestions");

      if (recommended && recommended.length > 0) {
        // 1. Fill the small "Mid-Post" text link box
        if (suggestionBox && suggestionLinkContainer) {
          suggestionBox.style.display = "block";
          suggestionLinkContainer.innerHTML = `
            <a href="post.html?id=${recommended[0].id}">${recommended[0].title}</a>
          `;
        }

        // 2. Fill the "You Might Also Like" Bottom Grid with Cards
        if (bottomGrid) {
          bottomGrid.innerHTML = recommended
            .slice(0, 3) // Show top 3 recommendations
            .map(
              (rec) => `
              <div class="popular-card">
                <img src="${rec.image || "https://via.placeholder.com/400x250"}" alt="${rec.title}">
                <div class="popular-card-content">
                  <h4><a href="post.html?id=${rec.id}">${rec.title}</a></h4>
                </div>
              </div>
            `,
            )
            .join("");
        }
      } else {
        if (suggestionBox) suggestionBox.style.display = "none";
      }
    }
  } catch (err) {
    console.error("Single Post Fetch Error:", err);
  }
}

// --- DYNAMIC DATA FETCH (CATEGORIES) ---
async function fetchCategories() {
  const url = `https://en43zbld.api.sanity.io/v1/data/query/production?query=${encodeURIComponent('*[_type == "category"]')}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const menuList = document.getElementById("menu-list");
    if (menuList && data.result) {
      // 1. Clear everything first
      menuList.innerHTML = "";

      // 2. Add HOME (Hardcoded)
      const homeLi = document.createElement("li");
      homeLi.innerHTML = '<a href="index.html">HOME</a>';
      menuList.appendChild(homeLi);

      // 3. Add ABOUT (Hardcoded)
      const aboutLi = document.createElement("li");
      aboutLi.innerHTML = '<a href="about.html">ABOUT</a>';
      menuList.appendChild(aboutLi);

      // 4. Add Sanity Categories (Dynamic)
      data.result.forEach((cat) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="#${cat.title.toLowerCase()}">${cat.title.toUpperCase()}</a>`;
        menuList.appendChild(li);
      });

      console.log("Menu fully reconstructed with About and Categories!");
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

// --- RENDERING LOGIC ---
function renderPage() {
  if (document.getElementById("postsContainer")) {
    displayPosts();
  }
  if (document.getElementById("postTitle")) {
    initPostPage();
  }
}

function displayPosts(filteredData = null) {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  const dataToRender = filteredData
    ? filteredData
    : blogPosts.slice(0, postsShown);

  container.innerHTML = dataToRender
    .map((post) => {
      // Clean up the date format
      const formattedDate = post.date
        ? new Date(post.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "Recent";

      return `
        <article class="post-card">
            <img src="${post.image || "https://via.placeholder.com/400x250"}" alt="${post.title}">
            <div class="post-info">
                <h3>${post.title}</h3>
                <p>${post.excerpt ? post.excerpt.substring(0, 150) + "..." : "Click read more to see the full story."}</p>
                <div class="post-meta">${post.category || "General"} | ${formattedDate}</div>
                <a href="post.html?id=${post.id}" class="btn-read">Read More</a>
            </div>
        </article>
      `;
    })
    .join("");

  // ... rest of loadMoreBtn logic
}

// --- UI INITIALIZERS ---
function initMenu() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  if (hamburger && navLinks) {
    hamburger.onclick = () => navLinks.classList.toggle("active");
  }
}

function initSearch() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.oninput = (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = blogPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term),
      );
      displayPosts(term === "" ? null : filtered);
    };
  }
}

function initPostPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  if (postId) {
    console.log("Fetching data for Post ID:", postId);
    fetchSinglePost(postId);
  } else {
    console.warn(
      "No Post ID found in the URL. Redirecting or showing default...",
    );
  }
}

// --- BOOTSTRAP ---
// window.onload = () => {
//   fetchPosts();
// };

// COMPONENTS LOADING
// --- COMPONENTS LOADING ---
fetch("header.html")
  .then((res) => res.text())
  .then((headerHtml) => {
    // 1. Put the header on the page
    const placeholder = document.getElementById("header-placeholder");
    if (placeholder) {
      placeholder.innerHTML = headerHtml;

      // 2. NOW that the header is there, initialize the menu and search
      initMenu();
      initSearch();

      // 3. NOW fetch the categories from Sanity
      fetchCategories();
    }
  });

// --- COMPONENTS LOADING ---
fetch("footer.html")
  .then((res) => res.text())
  .then((data) => {
    const footerPlaceholder = document.getElementById("footer-placeholder");
    if (footerPlaceholder) {
      footerPlaceholder.innerHTML = data;

      // ADD THIS LINE BELOW:
      const yearSpan = document.getElementById("currentYear");
      if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
      }
    }
  });

const loadBtn = document.getElementById("loadMoreBtn");
if (loadBtn) {
  loadBtn.onclick = () => {
    postsShown += 5;
    displayPosts();
  };
}

// jjjjjjjjjjjjjjjjjj
window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  // Check: Are we on the Home page?
  if (document.getElementById("postsContainer")) {
    fetchPosts();
  }

  // Check: Are we on the Post page?
  if (postId && document.getElementById("postTitle")) {
    fetchSinglePost(postId);
  }
};
