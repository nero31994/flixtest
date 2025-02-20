const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id='; // Proxy route on Vercel
let timeout = null;

// Create Floating Trailer Preview
const mobileTrailer = document.createElement("div");
mobileTrailer.classList.add("mobile-trailer");
mobileTrailer.innerHTML = `
    <div class="trailer-header">
        <span>Trailer Preview</span>
        <button class="close-trailer">X</button>
    </div>
    <iframe frameborder="0" allowfullscreen></iframe>
`;
document.body.appendChild(mobileTrailer);

// Close trailer on button click
document.querySelector(".close-trailer").addEventListener("click", () => {
    mobileTrailer.style.display = "none";
    mobileTrailer.querySelector("iframe").src = "";
});

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

async function getTrailer(movieId) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`);
        const data = await res.json();
        const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");

        return trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=1` : null;
    } catch (error) {
        return null;
    }
}

async function displayMovies(movies) {
    const moviesDiv = document.getElementById("movies");
    moviesDiv.innerHTML = "";

    for (const movie of movies) {
        if (!movie.poster_path) continue;

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");

        const trailerUrl = await getTrailer(movie.id);
        const trailerButton = trailerUrl
            ? `<button class="watch-trailer" onclick="openTrailer('${trailerUrl}')">🎬 Watch Trailer</button>`
            : `<button class="watch-trailer disabled">No Trailer Available</button>`;

        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy">
            <div class="overlay">
                <h3>${movie.title}</h3>
                ${trailerButton}
            </div>
        `;

        movieEl.onclick = (event) => {
            if (!event.target.classList.contains("watch-trailer")) {
                window.open(`${PROXY_URL}${movie.id}`, "_blank");
            }
        };

        moviesDiv.appendChild(movieEl);
    }
}

function openTrailer(url) {
    mobileTrailer.querySelector("iframe").src = url;
    mobileTrailer.style.display = "block";
}

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

// Load popular movies on page load
fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
