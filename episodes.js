const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id=';

// 📌 Function to fetch and display episodes
async function fetchEpisodes(showId) {
    const url = `https://api.themoviedb.org/3/tv/${showId}/season/1?api_key=488eb36776275b8ae18600751059fb49`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load episodes.");

        const data = await response.json();
        displayEpisodes(data.episodes, showId);
    } catch (error) {
        console.error("Error fetching episodes:", error);
        document.getElementById("episode-list").innerHTML = `<p>❌ Error loading episodes.</p>`;
    }
}

// 📌 Function to display episodes inside the modal
function displayEpisodes(episodes, showId) {
    const episodeListDiv = document.getElementById("episode-list");
    const episodeSection = document.getElementById("episode-section");

    if (!episodeListDiv || !episodeSection) {
        console.error("❌ 'episode-list' or 'episode-section' not found.");
        return;
    }

    episodeListDiv.innerHTML = ""; // Clear previous episodes

    if (!episodes || episodes.length === 0) {
        episodeListDiv.innerHTML = "<p>No episodes available.</p>";
        return;
    }

    episodes.forEach(episode => {
        const episodeBtn = document.createElement("button");
        episodeBtn.textContent = `Episode ${episode.episode_number}: ${episode.name}`;
        episodeBtn.onclick = () => watchEpisode(showId, episode.episode_number);
        episodeListDiv.appendChild(episodeBtn);
    });

    episodeSection.classList.remove("hidden"); // ✅ Show episode section
}

// 📌 Function to redirect to proxy with episode ID
function watchEpisode(showId, episodeNum) {
    const proxyUrl = `${PROXY_URL}${showId}&episode=${episodeNum}`;
    window.location.href = proxyUrl;
}

// 📌 Integrating with existing modal function
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

    // Show episodes for TV shows and anime
    if (movie.media_type === "tv") {
        fetchEpisodes(movie.id);
    } else {
        document.getElementById("episode-section").classList.add("hidden"); // Hide episodes if not TV show
    }

    // Store the watch URL in the button for redirection
    const watchNowButton = document.getElementById("watchNow");
    watchNowButton.dataset.url = watchUrl;

    // Show the modal
    document.getElementById("movieModal").style.display = "flex";
}

// ❌ Close Modal
function closeModal() {
    document.getElementById("movieModal").style.display = "none";
    document.getElementById("episode-section").classList.add("hidden"); // Hide episodes when closing
}
