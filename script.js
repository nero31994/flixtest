const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id=';

let currentPage = 1;
let currentQuery = '';
let isFetching = false;
let timeout = null;
let currentCategory = 'movies'; // Default category

// 🎬 Auto-load movies based on URL
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        document.getElementById("intro-screen").classList.add("hidden");
        handleHashChange(); // ✅ Load category from URL
    }, 3000);

    document.getElementById("search").addEventListener("input", debounceSearch);
    window.addEventListener("hashchange", handleHashChange); // ✅ Detect hash changes

    // Ensure "Click to Watch" redirects correctly
    document.getElementById("watchNow").addEventListener("click", function () {
        const proxyUrl = this.dataset.url;
        if (proxyUrl) {
            window.location.href = proxyUrl;
        } else {
            alert("No movie URL found!");
        }
    });
});

// 📌 Handle category switching based on URL hash
function handleHashChange() {
    const hash = window.location.hash.replace("#", ""); // Get category from URL
    currentCategory = hash || 'movies'; // Default to movies if empty
    currentQuery = '';
    currentPage = 1;
    fetchContent();
}

// 📡 Fetch movies, TV shows, or anime
async function fetchContent(query = '', page = 1) {
    if (isFetching) return;
    isFetching = true;
    document.getElementById("loading").style.display = "block";
    document.getElementById("error").innerText = "";

    let url;
    if (query) {
        url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
    } else {
        if (currentCategory === 'movies') {
            url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`;
        } else if (currentCategory === 'tv') {
            url = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&page=${page}`;
        } else if (currentCategory === 'anime') {
            url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16&page=${page}`; // Anime Genre ID: 16
        }
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const data = await response.json();
        if (!data.results || data.results.length === 0) throw new Error("No content found.");

        displayMovies(data.results, page === 1);
    } catch (error) {
        console.error("Error fetching content:", error);
        document.getElementById("error").innerText = "❌ " + error.message;
    } finally {
        isFetching = false;
        document.getElementById("loading").style.display = "none";
    }
}

// 🎥 Display content
function displayMovies(movies, clear = false) {
    const moviesDiv = document.getElementById("movies");
    if (clear) moviesDiv.innerHTML = ""; 

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const title = movie.title || movie.name;
        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${title}" loading="lazy">
            <div class="overlay">${title}</div>
        `;
        movieEl.onclick = () => showMovieInfo(movie);
        moviesDiv.appendChild(movieEl);
    });
}

// 🆕 Show Movie Info and Fix Proxy Redirection
function showMovieInfo(movie) {
    const title = movie.title || movie.name;
    const overview = movie.overview || "No description available.";
    const releaseDate = movie.release_date || movie.first_air_date || "Unknown";
    const rating = movie.vote_average || "N/A";

    // Use movie ID to create a correct proxy URL
    const watchUrl = `${PROXY_URL}${movie.id}`;

    console.log("Generated Proxy URL:", watchUrl); // Debugging

    // Update modal content
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalOverview").textContent = overview;
    document.getElementById("modalRelease").textContent = "Release Date: " + releaseDate;
    document.getElementById("modalRating").textContent = "Rating: " + rating;

    // Store the watch URL in the button for redirection
    const watchNowButton = document.getElementById("watchNow");
    watchNowButton.dataset.url = watchUrl;

    // Show the modal
    document.getElementById("movieModal").style.display = "flex";
}

// 🔎 Debounced Search
function debounceSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const query = document.getElementById("search").value.trim();
        if (query !== currentQuery) {
            currentQuery = query;
            currentPage = 1;
            fetchContent(currentQuery, currentPage);
        }
    }, 500);
}

// 🔄 Infinite Scroll
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        currentPage++;
        fetchContent(currentQuery, currentPage);
    }
});

// ❌ Close Modal
function closeModal() {
    document.getElementById("movieModal").style.display = "none";
            }
