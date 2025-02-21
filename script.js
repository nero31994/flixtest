const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id=';

let currentPage = 1;
let currentQuery = '';
let isFetching = false;
let timeout = null;

// 🎬 Intro GIF Animation
document.addEventListener("DOMContentLoaded", function () {
    const introScreen = document.getElementById("intro-screen");

    setTimeout(() => {
        introScreen.classList.add("hidden");
        fetchMovies(); // Load movies after intro animation
    }, 3000);
});

// Fetch Movies
async function fetchMovies(query = '', page = 1) {
    if (isFetching) return;
    isFetching = true;
    document.getElementById("loading").style.display = "block";

    let url = query
        ? `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}&page=${page}`
        : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        displayMovies(data.results, page === 1);
    } catch {
        document.getElementById("error").innerText = "Error fetching data!";
    } finally {
        isFetching = false;
        document.getElementById("loading").style.display = "none";
    }
}
