document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".movie").forEach(movie => {
        movie.addEventListener("click", function () {
            const movieId = this.dataset.id;
            const type = this.dataset.type;
            showMovieInfo(movieId, type);
        });
    });
});

async function showMovieInfo(movieId, type) {
    const API_KEY = '488eb36776275b8ae18600751059fb49';
    const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id=';
    let url = `https://api.themoviedb.org/3/${type}/${movieId}?api_key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        const movie = await response.json();
        
        document.getElementById("modalTitle").textContent = movie.title || movie.name;
        document.getElementById("modalOverview").textContent = movie.overview || "No description available.";
        document.getElementById("modalRelease").textContent = "Release Date: " + (movie.release_date || movie.first_air_date || "Unknown");
        document.getElementById("modalRating").textContent = "Rating: " + (movie.vote_average || "N/A");
        
        if (type === 'tv') {
            fetchEpisodes(movieId);
        }

        const watchNowButton = document.getElementById("watchNow");
        watchNowButton.dataset.url = `${PROXY_URL}${movieId}`;
        document.getElementById("movieModal").style.display = "flex";
    } catch (error) {
        console.error("Error fetching movie info:", error);
    }
}

async function fetchEpisodes(tvId) {
    const API_KEY = '488eb36776275b8ae18600751059fb49';
    let url = `https://api.themoviedb.org/3/tv/${tvId}/seasons?api_key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch episodes.");
        const data = await response.json();
        const episodeList = document.getElementById("episodeList");
        episodeList.innerHTML = "";

        data.seasons.forEach(season => {
            if (season.season_number > 0) {
                const seasonHeader = document.createElement("h3");
                seasonHeader.textContent = `Season ${season.season_number}`;
                episodeList.appendChild(seasonHeader);
                
                for (let i = 1; i <= season.episode_count; i++) {
                    const episodeButton = document.createElement("button");
                    episodeButton.textContent = `Episode ${i}`;
                    episodeButton.onclick = () => window.location.href = `https://officialflix.vercel.app/api/proxy?id=${tvId}&season=${season.season_number}&episode=${i}`;
                    episodeList.appendChild(episodeButton);
                }
            }
        });
    } catch (error) {
        console.error("Error fetching episodes:", error);
    }
}

function closeModal() {
    document.getElementById("movieModal").style.display = "none";
}
 
