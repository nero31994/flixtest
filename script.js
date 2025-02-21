const API_KEY = '488eb36776275b8ae18600751059fb49';
const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id=';

// Fetch and display movie or TV show details in the modal
function showMovieInfo(movie) {
    const title = movie.title || movie.name;
    const overview = movie.overview || "No description available.";
    const releaseDate = movie.release_date || movie.first_air_date || "Unknown";
    const rating = movie.vote_average || "N/A";

    const watchUrl = `${PROXY_URL}${movie.id}`;
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalOverview").textContent = overview;
    document.getElementById("modalRelease").textContent = "Release Date: " + releaseDate;
    document.getElementById("modalRating").textContent = "Rating: " + rating;
    document.getElementById("watchNow").dataset.url = watchUrl;

    // If it's a TV show, load episodes
    if (movie.media_type === "tv" || movie.first_air_date) {
        loadEpisodes(movie.id);
    } else {
        document.getElementById("episodeList").innerHTML = ""; // Clear episodes for movies
    }

    document.getElementById("movieModal").style.display = "flex";
}

// Load and display the movie/TV list
async function loadMovies(category, containerId) {
    const url = `https://api.themoviedb.org/3/${category}?api_key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        const container = document.getElementById(containerId);
        container.innerHTML = "";

        data.results.forEach(movie => {
            const movieElement = document.createElement("div");
            movieElement.classList.add("movie");
            movieElement.dataset.id = movie.id;
            movieElement.dataset.mediaType = movie.media_type || "movie"; // Set media type

            movieElement.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title || movie.name}">
                <p>${movie.title || movie.name}</p>
            `;

            movieElement.onclick = () => showMovieInfo(movie);

            container.appendChild(movieElement);
        });
    } catch (error) {
        console.error("Error loading movies:", error);
    }
}

// Close modal function
document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("movieModal").style.display = "none";
});

// Watch now button redirection
document.getElementById("watchNow").addEventListener("click", () => {
    const watchUrl = document.getElementById("watchNow").dataset.url;
    window.location.href = watchUrl;
});

// Load initial movie lists
document.addEventListener("DOMContentLoaded", () => {
    loadMovies('movie/popular', 'movieContainer');
    loadMovies('tv/popular', 'tvContainer');
});
