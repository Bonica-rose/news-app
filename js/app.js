const API_KEY = "YOUR_API_KEY";

const SEARCH_URL = "https://newsapi.org/v2/everything?q=";
const CATEGORY_URL = "https://newsapi.org/v2/top-headlines?category=";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const newsContainer = document.getElementById("newsContainer");
const errorMsg = document.getElementById("errorMsg");
const categoryButtons = document.querySelectorAll(".category-btn");

// fetchNews() called multiple times unnecessarily - do controlled calls
let isLoading = false;
let timeout;

// caching to reduce API hits
const cache = {};

// Fetch News (Search)
const fetchNews = async (query = "india") => {
    try {
        if (isLoading) return; // prevent duplicate calls
        isLoading = true;

        // caching to reduce API hits
        const key = `search_${query}`;
        if (cache[key]) {
            displayNews(cache[key]);
            return;
        }
        console.clear();
        console.log('Search: ',cache);        

        errorMsg.textContent = "";
        newsContainer.innerHTML = "<p>Loading...</p>";

        const response = await fetch(`${SEARCH_URL}${query}&apiKey=${API_KEY}`);

        if (!response.ok) {
            throw new Error("Failed to fetch news");
        }

        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
            throw new Error("No news found");
        }

        cache[key] = data.articles;
        displayNews(data.articles);
    } catch (error) {
        handleError(error.message);
    }finally {
        isLoading = false;
    }
};

// Fetch by Category 
const fetchByCategory = async (category) => {
    try {
        if (isLoading) return; // prevent duplicate calls
        isLoading = true;

        // caching to reduce API hits
        const key = `category_${category}`;
        if (cache[key]) {
            displayNews(cache[key]);
            return;
        }
        console.clear();
        console.log('Category: ',cache);        

        errorMsg.textContent = "";
        newsContainer.innerHTML = "<p>Loading...</p>";

        const res = await fetch(`${CATEGORY_URL}${category}&apiKey=${API_KEY}`);
        if (!res.ok) throw new Error("Failed to fetch category news");

        const data = await res.json();
        if (!data.articles || data.articles.length === 0) {
            throw new Error("No news found");
        }

        cache[key] = data.articles;
        displayNews(data.articles);
    } catch (err) {
        console.log(err);
        
        handleError(err.message);
    }finally {
        isLoading = false;
    }
};

// Display News
const displayNews = (articles) => {
    newsContainer.innerHTML = "";

    articles
    .filter(article => article.urlToImage && article.title)
    .slice(0, 12)
    .forEach(article => {
        const col = document.createElement("div");
        col.className = "col-12 col-sm-6 col-md-4 mb-4";

        col.innerHTML = `
        <div class="card h-100">
            <img src="${article.urlToImage}" class="card-img-top" alt="news">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${article.title}</h5>
                <p class="card-text">${article.description || "No description available"}</p>
                <a href="${article.url}" target="_blank" class="btn btn-accent mt-auto">
                    Read More <i class="fa fa-arrow-right"></i>
                </a>
            </div>
        </div>
        `;

        newsContainer.appendChild(col);
    });
};

// Error Handling
const handleError = (message) => {
    newsContainer.innerHTML = "";
    errorMsg.textContent = message;
};

// Search Event
searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();

    if (!query) {
        handleError("Please enter a search term");
        return;
    }
    removeActiveCategory();
    fetchNews(query);
});

// Prevents API spam while typing
const debounceSearch = (query) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
        if (query) {
            removeActiveCategory();
            fetchNews(query);
        }
    }, 500);// wait 500ms
};

// Enter Key Support
// searchInput.addEventListener("keypress", (e) => {    
//     if (e.key === "Enter") {
//         searchBtn.click();
//     }
// });

//Add debounce 
searchInput.addEventListener("input", (e) => {
    debounceSearch(e.target.value.trim());
});


// Category Filter Logic
categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        searchInput.value = '';
        const category = btn.dataset.category;        

        removeActiveCategory();
        btn.classList.add("active");

        fetchByCategory(category);
    });
});

const removeActiveCategory = () => {
    categoryButtons.forEach(btn => btn.classList.remove("active"));
};

// Initial Load
fetchNews();