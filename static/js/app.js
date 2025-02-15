document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const preview = document.getElementById('preview');
    const clearButton = document.getElementById('clearButton');
    const analyzeButton = document.getElementById('analyzeButton');
    const resultContainer = document.getElementById('result');
    const resultContent = document.querySelector('.result-content');
    const cameraButton = document.getElementById('cameraButton');
    const uploadButton = document.getElementById('uploadButton');
    
    // Audio elements
    const listenButton = document.getElementById('listenButton');
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseButton = document.getElementById('playPauseButton');
    const audioProgress = document.getElementById('audioProgress');
    const audioProgressBar = document.getElementById('audioProgressBar');
    const audioTime = document.getElementById('audioTime');
    const volumeSlider = document.getElementById('volumeSlider');
    const speedSelect = document.getElementById('speedSelect');
    
    let audio = null;
    let audioData = null;
    
    // Handle drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary-color)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border-color)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-color)';
        
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Handle camera button
    cameraButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        imageInput.setAttribute('capture', 'environment');
        imageInput.click();
    });

    // Handle upload button
    uploadButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        imageInput.removeAttribute('capture');
        imageInput.click();
    });

    // Handle file input change
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    // Handle clear button
    clearButton.addEventListener('click', (e) => {
        e.stopPropagation();
        clearImage();
    });

    // Handle analyze button
    analyzeButton.addEventListener('click', analyzeImage);

    // Handle listen button
    listenButton.addEventListener('click', () => {
        if (!audioData) return;
        
        if (!audio) {
            // Create new audio instance
            const audioBlob = base64ToBlob(audioData, 'audio/mpeg');
            audio = new Audio(URL.createObjectURL(audioBlob));
            
            // Set up audio event listeners
            audio.addEventListener('timeupdate', updateAudioProgress);
            audio.addEventListener('ended', () => {
                playPauseButton.innerHTML = '<span class="button-icon">▶️</span>';
                audio.currentTime = 0;
            });
            
            // Show audio player
            audioPlayer.classList.add('visible');
        }
        
        togglePlayPause();
    });

    // Handle play/pause button
    playPauseButton.addEventListener('click', togglePlayPause);

    // Handle audio progress click
    audioProgress.addEventListener('click', (e) => {
        if (!audio) return;
        const rect = audioProgress.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pos * audio.duration;
    });

    // Handle volume change
    volumeSlider.addEventListener('input', (e) => {
        if (!audio) return;
        audio.volume = e.target.value / 100;
    });

    // Handle playback speed change
    speedSelect.addEventListener('change', (e) => {
        if (!audio) return;
        audio.playbackRate = parseFloat(e.target.value);
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            dropZone.classList.add('hidden');
            imagePreview.classList.remove('hidden');
            analyzeButton.disabled = false;
            resultContainer.classList.add('hidden');
            
            // Reset audio
            if (audio) {
                audio.pause();
                audio = null;
            }
            audioData = null;
            audioPlayer.classList.remove('visible');
            listenButton.classList.remove('visible');
        };
        reader.readAsDataURL(file);
    }

    function clearImage() {
        imageInput.value = '';
        preview.src = '';
        dropZone.classList.remove('hidden');
        imagePreview.classList.add('hidden');
        analyzeButton.disabled = true;
        resultContainer.classList.add('hidden');
        
        // Reset audio
        if (audio) {
            audio.pause();
            audio = null;
        }
        audioData = null;
        audioPlayer.classList.remove('visible');
        listenButton.classList.remove('visible');
    }

    async function analyzeImage() {
        if (!imageInput.files.length) return;

        // Show loading state
        analyzeButton.disabled = true;
        const buttonText = analyzeButton.querySelector('.button-text');
        const loadingSpinner = analyzeButton.querySelector('.loading-spinner');
        buttonText.textContent = 'Analyzing...';
        loadingSpinner.classList.remove('hidden');
        resultContainer.classList.add('hidden');

        try {
            const formData = new FormData();
            formData.append('image', imageInput.files[0]);

            const response = await fetch('/api/recycle', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Convert markdown to HTML (basic conversion)
            const formattedResult = data.result
                .replace(/#{3} (.*?)\n/g, '<h3>$1</h3>')
                .replace(/#{2} (.*?)\n/g, '<h2>$1</h2>')
                .replace(/#{1} (.*?)\n/g, '<h1>$1</h1>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>');

            resultContent.innerHTML = formattedResult;
            resultContainer.classList.remove('hidden');

            // Handle audio
            if (data.audio) {
                audioData = data.audio;
                listenButton.classList.add('visible');
            }
        } catch (error) {
            resultContent.innerHTML = `<div style="color: var(--error-color)">Error: ${error.message}</div>`;
            resultContainer.classList.remove('hidden');
        } finally {
            // Reset button state
            buttonText.textContent = 'Analyze Item';
            loadingSpinner.classList.add('hidden');
            analyzeButton.disabled = false;
        }
    }

    function togglePlayPause() {
        if (!audio) return;
        
        if (audio.paused) {
            audio.play();
            playPauseButton.innerHTML = '<span class="button-icon">⏸️</span>';
        } else {
            audio.pause();
            playPauseButton.innerHTML = '<span class="button-icon">▶️</span>';
        }
    }

    function updateAudioProgress() {
        if (!audio) return;
        
        const progress = (audio.currentTime / audio.duration) * 100;
        audioProgressBar.style.width = `${progress}%`;
        
        const minutes = Math.floor(audio.currentTime / 60);
        const seconds = Math.floor(audio.currentTime % 60);
        audioTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function base64ToBlob(base64, type) {
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new Blob([bytes], { type: type });
    }
}); 