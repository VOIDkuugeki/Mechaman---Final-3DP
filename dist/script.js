function startGame() {
    // Show loading screen
    document.querySelector('.start-screen').style.display = 'none';
    document.querySelector('.loading-screen').style.display = 'flex';

    // Set a minimum loading time of 5 seconds
    var minimumLoadingTime = 5000;

    // Record the start time
    var startTime = Date.now();

    // Use AJAX to fetch the content of index.html
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'game.html', true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Calculate the time elapsed
            var elapsedTime = Date.now() - startTime;

            // Wait for the minimum loading time
            var remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

            // Hide loading screen after the minimum loading time
            setTimeout(function () {
                document.querySelector('.loading-screen').style.display = 'none';

                // Replace the current document with the fetched content
                document.open();
                document.write(xhr.responseText);
                document.close();
            }, remainingTime);
        }
    };

    // Send the request
    xhr.send();
}


function showTutorial() {
    // Show the tutorial board
    document.querySelector('.tutorial-board').style.display = 'block';

    // Trigger reflow to enable the transition
    void document.querySelector('.tutorial-board').offsetWidth;

    // Add the active class to enable the enlarge animation
    document.querySelector('.tutorial-board').classList.add('active');
}

function hideTutorial() {
    // Hide the tutorial board
    document.querySelector('.tutorial-board').classList.remove('active');
}

function showHoverImage() {
    // Show the hover image container
    document.querySelector('.hover-image-container').style.display = 'block';
}

function hideHoverImage() {
    // Hide the hover image container
    document.querySelector('.hover-image-container').style.display = 'none';
}

function retryGame() {

    window.location.reload();
}

// Return home (to the start screen)
function returnHome() {
    // Redirect or perform necessary actions to go back to the start screen
    window.location.href = 'index.html';
}