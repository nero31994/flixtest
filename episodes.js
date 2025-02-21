const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id=';

// 📌 Fetch and display episodes inside the modal
async function fetchEpisodes(showId) {
    const url = `https://api.themoviedb.org/3/tv/${showId}/season/1?api_key=488eb36776275b8ae18600751059fb49`;
    const episodeListDiv = document.getElementById("episodeList");
    episodeListDiv.innerHTML = "Loading episodes..."; // Show loading state
    episodeListDiv.classList.remove("hidden");

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load episodes.");

        const data = await response.json();
        if (!data.episodes || data.episodes.length === 0) {
            episodeListDiv.innerHTML = "<p>No episodes available.</p>";
            return;
        }

        displayEpisodes(data.episodes, showId);
    } catch (error) {
        console.error("Error fetching episodes:", error);
        episodeListDiv.innerHTML = `<p>❌ Error loading episodes.</p>`;
    }
}

// 📌 Display episodes inside the modal
function displayEpisodes(episodes, showId) {
    const episodeListDiv = document.getElementById("episodeList");
    episodeListDiv.innerHTML = ""; // Clear previous content

    episodes.forEach(episode => {
        const episodeBtn = document.createElement("button");
        episodeBtn.textContent = `Episode ${episode.episode_number}: ${episode.name}`;
        episodeBtn.classList.add("episode-btn");
        episodeBtn.onclick = () => watchEpisode(showId, episode.episode_number);
        episodeListDiv.appendChild(episodeBtn);
    });
}

// 📌 Redirect to proxy with episode ID
function watchEpisode(showId, episodeNum) {
    const proxyUrl = `${PROXY_URL}${showId}&episode=${episodeNum}`;
    window.location.href = proxyUrl;
}

// 📌 Updated showMovieInfo function to correctly detect TV shows
function showMovieInfo(movie) {
    const title = movie.title || movie.name;
    const overview = movie.overview || "No description available.";
    const releaseDate = movie.release_date || movie.first_air_date || "Unknown";
    const rating = movie.vote_average || "N/A";

    // Use movie ID to create a correct proxy URL
    const watchUrl = `${PROXY_URL}${movie.id}`;

    // Update modal content
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalOverview").textContent = overview;
    document.getElementById("modalRelease").textContent = "Release Date: " + releaseDate;
    document.getElementById("modalRating").textContent = "Rating: " + rating;

    // Detect if it's a TV show (since `media_type` isn't always reliable)
    if (movie.first_air_date) {
        fetchEpisodes(movie.id); // Load episodes
    } else {
        document.getElementById("episodeList").classList.add("hidden"); // Hide episodes for movies
    }

    // Store the watch URL in the button for redirection
    const watchNowButton = document.getElementById("watchNow");
    watchNowButton.dataset.url = watchUrl;

    // Show the modal
    document.getElementById("movieModal").style.display = "flex";
}

// ❌ Close Modal and Reset Episode List
function closeModal() {
    document.getElementById("movieModal").style.display = "none";
    document.getElementById("episodeList").classList.add("hidden"); // Hide episodes when closing
    document.getElementById("episodeList").innerHTML = ""; // Clear episodes when closing
}
