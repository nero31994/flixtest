const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = 'https://apiprox.vercel.app/api/proxy?id=';

let currentPage = 1;
let currentQuery = '';
let isFetching = false;
let timeout = null;

// 🎬 Auto-load movies on page load
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        document.getElementById("intro-screen").classList.add("hidden");
        fetchMovies(); // ✅ Load movies on startup
    }, 3000);

    document.getElementById("search").addEventListener("input", debounceSearch);
});

// 📡 Fetch only movies
async function fetchMovies(query = '', page = 1) {
    if (isFetching) return;
    isFetching = true;
    document.getElementById("loading").style.display = "block";
    document.getElementById("error").innerText = "";

    let url;
    if (query) {
        url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
    } else {
        url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const data = await response.json();
        if (!data.results || data.results.length === 0) throw new Error("No movies found.");

        displayMovies(data.results, page === 1);
    } catch (error) {
        console.error("Error fetching movies:", error);
        document.getElementById("error").innerText = "❌ " + error.message;
    } finally {
        isFetching = false;
        document.getElementById("loading").style.display = "none";
    }
}

// 🎥 Display movies
function displayMovies(movies, clear = false) {
    const moviesDiv = document.getElementById("movies");
    if (clear) moviesDiv.innerHTML = ""; 

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy">
        `;
        movieEl.onclick = () => showMovieInfo(movie);
        moviesDiv.appendChild(movieEl);
    });
}

// 🎥 Redirect to Proxy Directly on Click
function showMovieInfo(movie) {
    if (!movie.id) return;
    
    // Generate the proxy URL
    const watchUrl = `${PROXY_URL}${movie.id}`;
    
    // Redirect the user to the streaming page
    window.location.href = watchUrl;
}

// 🔎 Debounced Search
function debounceSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const query = document.getElementById("search").value.trim();
        if (query !== currentQuery) {
            currentQuery = query;
            currentPage = 1;
            fetchMovies(currentQuery, currentPage);
        }
    }, 500);
}
