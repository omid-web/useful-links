// Audio context and variables
let audioContext;
let oscillatorLeft;
let oscillatorRight;
let gainNode;
let analyser;
let isPlaying = false;
let animationId;

// DOM elements
const carrierFrequencySlider = document.getElementById('carrier-frequency');
const beatFrequencySlider = document.getElementById('beat-frequency');
const volumeSlider = document.getElementById('volume-slider');
const carrierValue = document.getElementById('carrier-value');
const beatValue = document.getElementById('beat-value');
const volumeValue = document.getElementById('volume-value');
const playPauseButton = document.getElementById('play-pause');
const presetButtons = document.querySelectorAll('.preset-button');
const waveformCanvas = document.getElementById('waveform');
const waveformCtx = waveformCanvas.getContext('2d');

// Initialize canvas
function resizeCanvas() {
    waveformCanvas.width = waveformCanvas.offsetWidth;
    waveformCanvas.height = waveformCanvas.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Update value displays
carrierFrequencySlider.addEventListener('input', updateCarrierValue);
beatFrequencySlider.addEventListener('input', updateBeatValue);
volumeSlider.addEventListener('input', updateVolumeValue);

function updateCarrierValue() {
    const carrierFreq = parseFloat(carrierFrequencySlider.value);
    carrierValue.textContent = `${carrierFreq} Hz`;
    if (isPlaying) {
        updateOscillators();
    }
}

function updateBeatValue() {
    const beatFreq = parseFloat(beatFrequencySlider.value);
    beatValue.textContent = `${beatFreq} Hz`;
    if (isPlaying) {
        updateOscillators();
    }
}

function updateVolumeValue() {
    const volume = parseFloat(volumeSlider.value);
    volumeValue.textContent = `${Math.round(volume * 100)}%`;
    if (gainNode) {
        gainNode.gain.value = volume;
    }
}

// Play/pause button
playPauseButton.addEventListener('click', togglePlayPause);

function togglePlayPause() {
    if (isPlaying) {
        stopSound();
        playPauseButton.textContent = 'Start';
    } else {
        startSound();
        playPauseButton.textContent = 'Stop';
    }
}

// Preset buttons
presetButtons.forEach(button => {
    button.addEventListener('click', () => {
        const carrier = parseFloat(button.dataset.carrier);
        const beat = parseFloat(button.dataset.beat);
        
        carrierFrequencySlider.value = carrier;
        beatFrequencySlider.value = beat;
        
        updateCarrierValue();
        updateBeatValue();
        
        if (isPlaying) {
            updateOscillators();
        }
    });
});

// Start binaural beats
function startSound() {
    try {
        // Create or resume audio context (handling autoplay policy)
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } else if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // Create nodes
        oscillatorLeft = audioContext.createOscillator();
        oscillatorRight = audioContext.createOscillator();
        gainNode = audioContext.createGain();
        analyser = audioContext.createAnalyser();
        
        // Create stereo panner for separation
        const pannerLeft = audioContext.createStereoPanner();
        const pannerRight = audioContext.createStereoPanner();
        
        pannerLeft.pan.value = -1; // Left
        pannerRight.pan.value = 1; // Right
        
        // Set frequencies
        updateOscillators();
        
        // Set volume
        gainNode.gain.value = parseFloat(volumeSlider.value);
        
        // Connect nodes
        oscillatorLeft.connect(pannerLeft);
        oscillatorRight.connect(pannerRight);
        
        pannerLeft.connect(gainNode);
        pannerRight.connect(gainNode);
        
        gainNode.connect(analyser);
        analyser.connect(audioContext.destination);
        
        // Configure analyser
        analyser.fftSize = 2048;
        
        // Start oscillators
        oscillatorLeft.start();
        oscillatorRight.start();
        
        isPlaying = true;
        
        // Start visualization
        visualize();
    } catch (error) {
        console.error("Error starting audio:", error);
        alert("There was an error starting the audio. Please ensure you're using a supported browser.");
    }
}

// Stop binaural beats
function stopSound() {
    if (oscillatorLeft) {
        oscillatorLeft.stop();
        oscillatorRight.stop();
        
        oscillatorLeft.disconnect();
        oscillatorRight.disconnect();
        
        oscillatorLeft = null;
        oscillatorRight = null;
    }
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    isPlaying = false;
    
    // Clear waveform
    waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
}

// Update oscillator frequencies
function updateOscillators() {
    if (!oscillatorLeft || !oscillatorRight) return;
    
    const carrierFreq = parseFloat(carrierFrequencySlider.value);
    const beatFreq = parseFloat(beatFrequencySlider.value);
    
    // Left ear frequency
    const leftFreq = carrierFreq - (beatFreq / 2);
    // Right ear frequency
    const rightFreq = carrierFreq + (beatFreq / 2);
    
    oscillatorLeft.frequency.setValueAtTime(leftFreq, audioContext.currentTime);
    oscillatorRight.frequency.setValueAtTime(rightFreq, audioContext.currentTime);
}

// Visualize audio
function visualize() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        animationId = requestAnimationFrame(draw);
        
        analyser.getByteTimeDomainData(dataArray);
        
        waveformCtx.fillStyle = '#ecf0f1';
        waveformCtx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);
        
        waveformCtx.lineWidth = 2;
        waveformCtx.strokeStyle = '#3498db';
        waveformCtx.beginPath();
        
        const sliceWidth = waveformCanvas.width / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * waveformCanvas.height / 2;
            
            if (i === 0) {
                waveformCtx.moveTo(x, y);
            } else {
                waveformCtx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        waveformCtx.lineTo(waveformCanvas.width, waveformCanvas.height / 2);
        waveformCtx.stroke();
    }
    
    draw();
}

// Initialize values
updateCarrierValue();
updateBeatValue();
updateVolumeValue();