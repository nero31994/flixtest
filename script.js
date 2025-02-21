const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id='; // ✅ Proxy restored

let currentPage = 1;
let currentQuery = '';
let isFetching = false;
let timeout = null;

// 🎬 Auto-load movies after intro animation
document.addEventListener("DOMContentLoaded", function () {
    const introScreen = document.getElementById("intro-screen");

    setTimeout(() => {
        introScreen.classList.add("hidden");
        fetchMovies(); // ✅ Auto-load movies
    }, 3000);
});

// 📡 Fetch movies with error handling
async function fetchMovies(query = '', page = 1) {
    if (isFetching) return;
    isFetching = true;
    document.getElementById("loading").style.display = "block";

    let url = query
        ? `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}&page=${page}`
        : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`;

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

// 🎥 Display movies & attach modal event
function displayMovies(movies, clear = false) {
    const moviesDiv = document.getElementById("movies");
    if (clear) moviesDiv.innerHTML = ""; 

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title || movie.name}" loading="lazy">
            <div class="overlay">${movie.title || movie.name}</div>
        `;
        movieEl.onclick = () => showMovieInfo(movie); // ✅ Attach modal event
        moviesDiv.appendChild(movieEl);
    });
}

// 🎬 Show movie details in modal
function showMovieInfo(movie) {
    const modal = document.getElementById("movieModal");
    document.getElementById("modalTitle").innerText = movie.title || movie.name;
    document.getElementById("modalOverview").innerText = movie.overview || "No description available.";
    document.getElementById("modalRelease").innerText = `Release Date: ${movie.release_date || "N/A"}`;
    document.getElementById("modalRating").innerText = `Rating: ${movie.vote_average}/10`;

    document.getElementById("watchNow").onclick = () => {
        window.open(`${PROXY_URL}${movie.id}`, "_blank"); // ✅ Open movie via proxy
        modal.style.display = "none";
    };

    modal.style.display = "block";
}

// ❌ Close modal
function closeModal() {
    document.getElementById("movieModal").style.display = "none";
}

// 🔄 Infinite Scroll for more movies
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        currentPage++;
        fetchMovies(currentQuery, currentPage);
    }
});
