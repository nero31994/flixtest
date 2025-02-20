const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = '/api/proxy?id=';
const YT_BASE = 'https://www.youtube.com/embed/';
let timeout = null;

async function fetchMovies(url) {
    document.getElementById("loading").style.display = "block";
    try {
        const res = await fetch(url);
        const data = await res.json();
        document.getElementById("loading").style.display = "none";

        if (!data.results || data.results.length === 0) {
            document.getElementById("error").innerText = "No movies found!";
            document.getElementById("movies").innerHTML = "";
            return;
        }

        document.getElementById("error").innerText = "";
        displayMovies(data.results);
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching movies!";
        document.getElementById("loading").style.display = "none";
    }
}

async function displayMovies(movies) {
    const moviesDiv = document.getElementById("movies");
    moviesDiv.innerHTML = "";

    for (const movie of movies) {
        if (!movie.poster_path) continue;
        
        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title}">
            <div class="movie-description">
                <p>${movie.overview.substring(0, 100)}...</p>
                <div class="button-container">
                    <button class="watch-now" onclick="watchNow(${movie.id})">Watch Now</button>
                    <button class="watch-trailer" onclick="showTrailer(${movie.id})">Watch Trailer</button>
                </div>
            </div>
        `;
        moviesDiv.appendChild(movieEl);
    }
}

function watchNow(movieId) {
    window.open(`${PROXY_URL}${movieId}`, "_blank");
}

async function showTrailer(movieId) {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`);
    const data = await res.json();
    const trailerKey = data.results.find(vid => vid.type === "Trailer")?.key;

    if (trailerKey) {
        window.open(`${YT_BASE}${trailerKey}`, "_blank");
    } else {
        alert("Trailer not available!");
    }
}

fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
