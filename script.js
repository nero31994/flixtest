const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = '/api/proxy?id=';
let timeout = null;
let currentPage = 1;
let isFetching = false;

// Fetch and display movies
async function fetchMovies(url, append = false) {
    if (isFetching) return;
    isFetching = true;

    document.getElementById("loading").style.display = "block";

    try {
        const res = await fetch(url);
        const data = await res.json();
        document.getElementById("loading").style.display = "none";

        if (!data.results || data.results.length === 0) {
            document.getElementById("error").innerText = "No movies found!";
            return;
        }

        document.getElementById("error").innerText = "";

        // Sort movies from latest to oldest
        const sortedMovies = data.results.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));

        displayMovies(sortedMovies, append);
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching movies!";
    }

    isFetching = false;
}

// Display movies dynamically
function displayMovies(movies, append = false) {
    const moviesDiv = document.getElementById("movies");

    if (!append) moviesDiv.innerHTML = "";

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy">
            <div class="overlay">${movie.title}</div>
        `;

        movieEl.onclick = () => showMovieInfo(movie);
        
        moviesDiv.appendChild(movieEl);
    });
}

// Show movie info modal
function showMovieInfo(movie) {
    const modal = document.getElementById("movieModal");
    document.getElementById("modalTitle").innerText = movie.title;
    document.getElementById("modalOverview").innerText = movie.overview || "No description available.";
    document.getElementById("modalImg").src = `${IMG_URL}${movie.poster_path}`;
    
    // Set up "Watch Now" button
    const watchNowBtn = document.getElementById("watchNow");
    watchNowBtn.onclick = () => {
        window.open(`${PROXY_URL}${movie.id}`, "_blank");
        closeModal();
    };

    modal.style.display = "block";
}

// Close modal function
function closeModal() {
    document.getElementById("movieModal").style.display = "none";
}

// Close modal when clicking outside
window.onclick = (event) => {
    const modal = document.getElementById("movieModal");
    if (event.target === modal) {
        closeModal();
    }
};

// Debounce search
function debounceSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const query = document.getElementById("search").value;
        if (query.length > 2) {
            fetchMovies(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
        } else {
            fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
        }
    }, 300);
}

// Infinite scrolling
window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isFetching) {
        currentPage++;
        fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${currentPage}`, true);
    }
});

// Load movies on page load
fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
