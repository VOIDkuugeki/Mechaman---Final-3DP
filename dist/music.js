// Function to toggle the music
function toggleMusic() {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
        backgroundMusic.volume = 0.5
        musicToggleButton.classList.add('active');
    } else {
        backgroundMusic.pause();
        musicToggleButton.classList.remove('active');
    }
}