const API_URL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=YOUR_API_KEY&page=";
let currentPage = 1;

async function loadMovies() {
    document.getElementById("loading").style.display = "block";
    try {
        const response = await fetch(API_URL + currentPage);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        document.getElementById("error").textContent = "Failed to load movies.";
    } finally {
        document.getElementById("loading").style.display = "none";
    }
}

function displayMovies(movies) {
    const moviesDiv = document.getElementById("movies");
    movies.forEach(movie => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie");
        movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        `;
        movieElement.onclick = () => showMovieInfo(movie);
        moviesDiv.appendChild(movieElement);
    });
}

function showMovieInfo(movie) {
    document.getElementById("modalTitle").textContent = movie.title;
    document.getElementById("modalOverview").textContent = movie.overview;
    document.getElementById("modalRelease").textContent = "Release Date: " + movie.release_date;
    document.getElementById("modalRating").textContent = "Rating: " + movie.vote_average;
    document.getElementById("watchNow").onclick = () => {
        const source = document.getElementById("streamingSource").value;
        window.location.href = `https://officialflix.vercel.app/api/proxy?id=${movie.id}&source=${source}`;
    };
    document.getElementById("movieModal").style.display = "flex";
}

document.getElementById("loadMore").addEventListener("click", () => {
    currentPage++;
    loadMovies();
});

loadMovies();
