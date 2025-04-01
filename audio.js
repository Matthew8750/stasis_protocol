export function toggleBackgroundMusic() {
    const toggleButton = document.getElementById("toggle-music-button");

    if (backgroundMusic.muted) {
        backgroundMusic.muted = false;
        console.log("[System]: Background music unmuted.");
        toggleButton.style.backgroundImage = "url('images/music_unmute.png')";
        console.log("Background image set to: images/music_unmute.png");
    } else {
        backgroundMusic.muted = true;
        console.log("[System]: Background music muted.");
        toggleButton.style.backgroundImage = "url('images/music_mute.png')";
        console.log("Background image set to: images/music_mute.png");
    }
}
