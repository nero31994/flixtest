const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w342'; // Lighter images = faster load
const PROXY_URL = 'https://nerflixprox.arenaofvalorph937.workers.dev/proxy?id=';

let currentPage = 1;
let currentQuery = '';
let isFetching = false;
let timeout = null;
let observer;
let controller = new AbortController();

document.addEventListener("DOMContentLoaded", function () {
    preconnectTMDB();
    setTimeout(() => {
        document.getElementById("intro-screen").classList.add("hidden");
        fetchMovies(); // Load on start
    }, 3000);

    document.getElementById("search").addEventListener("input", debounceSearch);
});

// Preconnect to TMDB image CDN for faster loads
function preconnectTMDB() {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://image.tmdb.org";
    document.head.appendChild(link);
}

// Fetch movies
async function fetchMovies(query = '', page = 1) {
    if (isFetching) return;
    controller.abort(); // Cancel any previous request
    controller = new AbortController();
    isFetching = true;

    document.getElementById("loading").style.display = "block";
    document.getElementById("error").innerText = "";

    let url = query
        ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
        : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`;

    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const data = await response.json();
        if (!data.results || data.results.length === 0) throw new Error("No more movies found.");

        displayMovies(data.results, page === 1);

        if (data.total_pages <= page) {
            if (observer) observer.disconnect();
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            console.error("Error fetching movies:", error);
            document.getElementById("error").innerText = "❌ " + error.message;
        }
    } finally {
        isFetching = false;
        document.getElementById("loading").style.display = "none";
    }
}

// Display movies
function displayMovies(movies, clear = false) {
    const moviesDiv = document.getElementById("movies");
    if (clear) moviesDiv.innerHTML = "";

    movies.forEach((movie, index) => {
        if (!movie.poster_path) return;

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `<img src="${IMG_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy">`;
        movieEl.onclick = () => window.location.href = `${PROXY_URL}${movie.id}`;

        moviesDiv.appendChild(movieEl);

        // Use IntersectionObserver for infinite scroll trigger
        if (index === movies.length - 1) {
            setupObserver(movieEl);
        }
    });
}

// Set up intersection observer
function setupObserver(target) {
    if (observer) observer.disconnect();

    observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !isFetching) {
            currentPage++;
            fetchMovies(currentQuery, currentPage);
        }
    }, {
        rootMargin: "300px",
    });

    if (target) observer.observe(target);
}

// Debounced search
function debounceSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const query = document.getElementById("search").value.trim();
        if (query !== currentQuery) {
            currentQuery = query;
            currentPage = 1;
            fetchMovies(currentQuery, currentPage);
        }
    }, 400);
}
