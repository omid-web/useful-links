// Timer state variables
let isRunning = false;
let timer;
let timeLeft = 1500; // 25 minutes in seconds

// DOM elements
const toggleButton = document.getElementById('toggle');
const resetButton = document.getElementById('reset');
const timerDisplay = document.getElementById('timer-display');
const audio = document.getElementById('background-audio');
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');
const minusFiveButton = document.getElementById('minus-five');
const plusFiveButton = document.getElementById('plus-five');

// Initialize the timer display
updateDisplay();

// Event listeners
toggleButton?.addEventListener('click', toggleTimer);
resetButton?.addEventListener('click', resetTimer);
volumeSlider?.addEventListener('input', handleVolumeChange);
minusFiveButton.addEventListener('click', () => updateTimerDisplay(-5));
plusFiveButton.addEventListener('click', () => updateTimerDisplay(5));

// Update the timer display
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Toggle the timer (start/stop)
function toggleTimer() {
    if (isRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

// Start the timer
function startTimer() {
    isRunning = true;
    updateButtonState('Stop 🔇', 'stop', 'start');
    playAudio();

    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            resetTimer();
            alert("Time's up!");
        }
    }, 1000);
}

// Stop the timer
function stopTimer() {
    clearInterval(timer);
    isRunning = false;
    updateButtonState('Start 🔊', 'start', 'stop');
    pauseAudio();
}

// Reset the timer
function resetTimer() {
    stopTimer();
    timeLeft = 1500; // Reset to 25 minutes
    updateDisplay();
    resetAudio();
}

// Update button text and styles
function updateButtonState(text, addClass, removeClass) {
    toggleButton.textContent = text;
    toggleButton.classList.add(addClass);
    toggleButton.classList.remove(removeClass);
}

// Handle volume slider changes
function handleVolumeChange(event) {
    const volume = event.target.value;
    volumeValue.textContent = `${volume}%`;
    if (audio) {
        audio.volume = volume / 100;
        console.log(`Volume set to: ${volume / 100}`);
    } else {
        console.error("Audio element not found");
    }
}

// Play audio
function playAudio() {
    if (audio) {
        try {
            audio.play();
            console.log("Audio playing");
        } catch (error) {
            console.error("Audio playback failed:", error);
        }
    } else {
        console.error("Audio element not found");
    }
}

// Pause audio
function pauseAudio() {
    if (audio) {
        audio.pause();
        console.log("Audio paused");
    } else {
        console.error("Audio element not found");
    }
}

// Reset audio to the beginning
function resetAudio() {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        console.log("Audio reset");
    } else {
        console.error("Audio element not found");
    }
}

// Update timer display by adding or subtracting minutes
function updateTimerDisplay(minutes) {
    const [currentMinutes, currentSeconds] = timerDisplay.textContent.split(':').map(Number);
    let newMinutes = currentMinutes + minutes;

    if (newMinutes < 0) newMinutes = 0; // Prevent negative timer
    timerDisplay.textContent = `${String(newMinutes).padStart(2, '0')}:${String(currentSeconds).padStart(2, '0')}`;
    
    // Update timeLeft in seconds
    timeLeft = newMinutes * 60 + currentSeconds;
}
