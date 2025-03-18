const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id=';

let currentPage = 1;
let currentQuery = '';
let isFetching = false;
let timeout = null;

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        document.getElementById("intro-screen").classList.add("hidden");
        fetchMovies(); // ✅ Load movies on startup
    }, 3000);

    document.getElementById("search").addEventListener("input", debounceSearch);
});

// 📡 Fetch Movies
async function fetchMovies(query = '', page = 1) {
    if (isFetching) return;
    isFetching = true; // ✅ Prevent multiple API calls
    document.getElementById("loading").style.display = "block";
    document.getElementById("error").innerText = "";

    let url = query
        ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
        : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const data = await response.json();
        if (!data.results || data.results.length === 0) throw new Error("No more movies found.");

        displayMovies(data.results, page === 1);
        
        // ✅ Stop infinite scroll when reaching last page
        if (data.total_pages <= page) {
            window.removeEventListener("scroll", handleScroll);
        }
    } catch (error) {
        console.error("Error fetching movies:", error);
        document.getElementById("error").innerText = "❌ " + error.message;
    } finally {
        isFetching = false;
        document.getElementById("loading").style.display = "none";
    }
}

// 🎥 Display Movies (No Popups, Direct Load)
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

        // ✅ Clicking a movie redirects to proxy link (No modal pop-up)
        movieEl.onclick = () => window.location.href = `${PROXY_URL}${movie.id}`;

        moviesDiv.appendChild(movieEl);
    });
}

// 🔎 Debounced Search (Optimized)
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

// 🔄 Infinite Scroll (Fixed & Optimized)
function handleScroll() {
    if (isFetching) return;

    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentScroll = window.scrollY;

    if (currentScroll >= scrollableHeight - 300) { // ✅ Trigger before bottom
        currentPage++;
        fetchMovies(currentQuery, currentPage);
    }
}

window.addEventListener('scroll', handleScroll);
