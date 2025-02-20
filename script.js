const API_KEY = '488eb36776275b8ae18600751059fb49'; // Replace with your TMDB API key
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = '/api/proxy?id='; // Proxy route on Vercel
let timeout = null;
let page = 1; // For infinite scrolling

async function fetchMovies(url) {
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
        
        // **Sort movies by release date (newest first)**
        const sortedMovies = data.results.sort((a, b) => 
            new Date(b.release_date || b.first_air_date) - new Date(a.release_date || a.first_air_date)
        );

        displayMovies(sortedMovies);
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching movies!";
        document.getElementById("loading").style.display = "none";
    }
}

function displayMovies(movies) {
    const moviesDiv = document.getElementById("movies");

    movies.forEach(movie => {
        if (!movie.poster_path) return; // Skip movies without posters

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title || movie.name}" loading="lazy">
            <div class="overlay">${movie.title || movie.name} (${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'})</div>
        `;

        // Show movie info before redirecting
        movieEl.onclick = () => showMovieInfo(movie);
        
        moviesDiv.appendChild(movieEl);
    });
}

// Show Movie Info before Redirecting
function showMovieInfo(movie) {
    let modal = document.getElementById("movieModal");
    
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "movieModal";
        modal.classList.add("modal");
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="document.getElementById('movieModal').remove()">&times;</span>
                <h2 id="modalTitle"></h2>
                <img id="modalImage" src="" alt="" width="100%">
                <p><strong>Release Date:</strong> <span id="modalReleaseDate"></span></p>
                <p id="modalDescription"></p>
                <button id="watchNow">Watch Now</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Fill the modal with movie details
    document.getElementById("modalTitle").innerText = movie.title || movie.name;
    document.getElementById("modalImage").src = `${IMG_URL}${movie.poster_path}`;
    document.getElementById("modalReleaseDate").innerText = movie.release_date || 'Unknown';
    document.getElementById("modalDescription").innerText = movie.overview || 'No description available.';
    
    document.getElementById("watchNow").onclick = () => {
        window.open(`${PROXY_URL}${movie.id}`, "_blank");
        modal.remove();
    };

    // Show modal
    modal.style.display = "block";
}

// Infinite Scroll for More Movies
window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        page++;
        fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`);
    }
});

// Debounced Search
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

// Load popular movies on page load (sorted from latest to old)
fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`);
