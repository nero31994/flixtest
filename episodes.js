const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id=';

// 📌 Function to fetch and display episodes
async function fetchEpisodes(showId) {
    console.log("Fetching episodes for ID:", showId); // Debugging

    const url = `https://api.themoviedb.org/3/tv/${showId}/season/1?api_key=488eb36776275b8ae18600751059fb49`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load episodes. Status: ${response.status}`);

        const data = await response.json();
        console.log("API Response:", data); // Debugging

        if (!data.episodes || data.episodes.length === 0) {
            throw new Error("No episodes found.");
        }

        displayEpisodes(data.episodes, showId);
    } catch (error) {
        console.error("Error fetching episodes:", error);
        document.getElementById("episodeList").innerHTML = `<p>❌ No episodes available.</p>`;
    }
}

// 📌 Function to display episodes inside the modal
function displayEpisodes(episodes, showId) {
    const episodeListDiv = document.getElementById("episodeList");
    episodeListDiv.innerHTML = "";
    episodeListDiv.classList.remove("hidden");

    // Add scrollable styles
    episodeListDiv.style.maxHeight = "300px";
    episodeListDiv.style.overflowY = "auto";
    episodeListDiv.style.padding = "10px";
    episodeListDiv.style.display = "flex";
    episodeListDiv.style.flexDirection = "column";
    episodeListDiv.style.alignItems = "center";

    episodes.forEach(episode => {
        console.log(`Adding Episode ${episode.episode_number}: ${episode.name}`); // Debugging

        const episodeBtn = document.createElement("button");
        episodeBtn.textContent = `Episode ${episode.episode_number}: ${episode.name}`;
        episodeBtn.classList.add("episode-button");
        episodeBtn.onclick = () => watchEpisode(showId, episode.season_number, episode.episode_number);
        
        // Style the button for better UX
        episodeBtn.style.width = "90%";
        episodeBtn.style.margin = "5px";
        episodeBtn.style.padding = "8px";
        episodeBtn.style.background = "#ff5757";
        episodeBtn.style.border = "none";
        episodeBtn.style.color = "white";
        episodeBtn.style.borderRadius = "5px";
        episodeBtn.style.cursor = "pointer";

        episodeBtn.addEventListener("mouseover", () => {
            episodeBtn.style.background = "#ff0000";
        });

        episodeBtn.addEventListener("mouseout", () => {
            episodeBtn.style.background = "#ff5757";
        });

        episodeListDiv.appendChild(episodeBtn);
    });
}

// 📌 Function to redirect to proxy with episode ID
function watchEpisode(showId, seasonNum, episodeNum) {
    const proxyUrl = `${PROXY_URL}${showId}&season=${seasonNum}&episode=${episodeNum}`;
    window.location.href = proxyUrl;
}

// 📌 Ensure modal properly loads TV shows and anime episodes
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
    const episodeListDiv = document.getElementById("episodeList");
    if (movie.media_type === "tv" || currentCategory === "tv" || currentCategory === "anime") {
        episodeListDiv.classList.remove("hidden");
        fetchEpisodes(movie.id);
    } else {
        episodeListDiv.classList.add("hidden");
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
    document.getElementById("episodeList").classList.add("hidden"); // Hide episodes when closing
}
