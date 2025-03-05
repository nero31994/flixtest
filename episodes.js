const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id=';

// 📌 Function to fetch and display episodes
async function fetchEpisodes(showId) {
    try {
        const seasonData = await fetchSeasons(showId);
        if (!seasonData || seasonData.length === 0) {
            document.getElementById("episodeList").innerHTML = `<p>⚠ No episodes found.</p>`;
            return;
        }

        // Get the first season if available (default to season 1)
        const firstSeason = seasonData.find(s => s.season_number > 0) || seasonData[0];
        console.log("Fetching episodes for season:", firstSeason.season_number); // Debugging

        const url = `https://api.themoviedb.org/3/tv/${showId}/season/${firstSeason.season_number}?api_key=488eb36776275b8ae18600751059fb49`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load episodes.");

        const data = await response.json();
        console.log("Fetched episodes:", data); // Debugging

        if (data.episodes && data.episodes.length > 0) {
            displayEpisodes(data.episodes, showId, firstSeason.season_number);
        } else {
            document.getElementById("episodeList").innerHTML = `<p>⚠ No episodes available.</p>`;
        }
    } catch (error) {
        console.error("Error fetching episodes:", error);
        document.getElementById("episodeList").innerHTML = `<p>❌ Error loading episodes.</p>`;
    }
}

// 📌 Function to fetch all available seasons for a TV show
async function fetchSeasons(showId) {
    const url = `https://api.themoviedb.org/3/tv/${showId}?api_key=488eb36776275b8ae18600751059fb49`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch seasons.");
        const data = await response.json();

        console.log("Seasons data:", data.seasons); // Debugging
        return data.seasons || [];
    } catch (error) {
        console.error("Error fetching seasons:", error);
        return [];
    }
}

// 📌 Function to display episodes inside the modal
function displayEpisodes(episodes, showId, season) {
    const episodeListDiv = document.getElementById("episodeList");
    episodeListDiv.innerHTML = "";
    episodeListDiv.classList.remove("hidden");

    episodes.forEach(episode => {
        const episodeBtn = document.createElement("button");
        episodeBtn.textContent = `Episode ${episode.episode_number}: ${episode.name}`;
        episodeBtn.onclick = () => watchEpisode(showId, season, episode.episode_number);
        episodeBtn.classList.add("episode-button");
        episodeListDiv.appendChild(episodeBtn);
    });
}

// 📌 Function to redirect to proxy with episode ID
function watchEpisode(showId, seasonNum, episodeNum) {
    const proxyUrl = `${PROXY_URL}${showId}&season=${seasonNum}&episode=${episodeNum}`;
    window.location.href = proxyUrl;
}

// 📌 Show Movie/TV Show Info with Episode List
function showMovieInfo(movie) {
    const title = movie.title || movie.name;
    const overview = movie.overview || "No description available.";
    const releaseDate = movie.release_date || movie.first_air_date || "Unknown";
    const rating = movie.vote_average || "N/A";
    const mediaType = movie.media_type || (movie.seasons ? "tv" : "movie"); // Ensure correct type detection

    // Update modal content
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalOverview").textContent = overview;
    document.getElementById("modalRelease").textContent = "Release Date: " + releaseDate;
    document.getElementById("modalRating").textContent = "Rating: " + rating;

    // ✅ Show episodes only if it's a TV show
    if (mediaType === "tv") {
        fetchEpisodes(movie.id);
        document.getElementById("episodeList").classList.remove("hidden");
    } else {
        document.getElementById("episodeList").classList.add("hidden");
    }

    // Store the watch URL in the button for redirection
    const watchNowButton = document.getElementById("watchNow");
    watchNowButton.dataset.url = `${PROXY_URL}${movie.id}`;

    // Show the modal
    document.getElementById("movieModal").style.display = "flex";
}

// 📌 Close Modal
function closeModal() {
    document.getElementById("movieModal").style.display = "none";
    document.getElementById("episodeList").classList.add("hidden"); // Hide episodes when closing
}
