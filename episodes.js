function displayEpisodes(episodes, showId) {
    const episodeListContainer = document.getElementById("episodeListContainer");
    const episodeListDiv = document.getElementById("episodeList");
    episodeListDiv.innerHTML = ""; // Clear previous content
    episodeListContainer.classList.remove("hidden"); // Show episode list

    episodes.forEach((episode, index) => {
        const episodeBtn = document.createElement("button");
        episodeBtn.textContent = `Episode ${episode.episode_number}: ${episode.name}`;
        episodeBtn.classList.add("episode-btn");
        
        // Highlight selected episode
        episodeBtn.onclick = () => {
            document.querySelectorAll(".episode-btn").forEach(btn => btn.classList.remove("active"));
            episodeBtn.classList.add("active");
            watchEpisode(showId, episode.episode_number);
        };

        episodeListDiv.appendChild(episodeBtn);
    });
}
