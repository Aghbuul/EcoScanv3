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
    const listenButton = document.getElementById('listenButton');
    const audioPlayer = document.getElementById('audioPlayer');
    const audioElement = document.getElementById('audioElement');
    const playbackSpeed = document.getElementById('playbackSpeed');
    const loadingMessage = audioPlayer.querySelector('.loading-message');
    
    let currentAudioCache = null;
    let currentText = null;

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
    listenButton.addEventListener('click', async () => {
        if (currentAudioCache) {
            toggleAudioPlayer(true);
            return;
        }

        if (!currentText) return;

        try {
            toggleAudioPlayer(true);
            loadingMessage.classList.remove('hidden');
            listenButton.disabled = true;

            const response = await fetch('/api/generate-audio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: currentText })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Convert base64 to blob
            const audioBlob = base64ToBlob(data.audio, 'audio/mpeg');
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Cache the audio URL
            currentAudioCache = audioUrl;
            
            // Set up audio player
            audioElement.src = audioUrl;
            loadingMessage.classList.add('hidden');
            audioElement.play();

        } catch (error) {
            loadingMessage.textContent = `Error: ${error.message}`;
        } finally {
            listenButton.disabled = false;
        }
    });

    // Handle playback speed
    playbackSpeed.addEventListener('change', () => {
        audioElement.playbackRate = parseFloat(playbackSpeed.value);
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
            clearAudioCache();
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
        clearAudioCache();
    }

    function clearAudioCache() {
        if (currentAudioCache) {
            URL.revokeObjectURL(currentAudioCache);
            currentAudioCache = null;
        }
        currentText = null;
        toggleAudioPlayer(false);
    }

    function toggleAudioPlayer(show) {
        if (show) {
            audioPlayer.classList.remove('hidden');
        } else {
            audioPlayer.classList.add('hidden');
            audioElement.pause();
            audioElement.currentTime = 0;
        }
    }

    function base64ToBlob(base64, type) {
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new Blob([bytes], { type: type });
    }

    async function analyzeImage() {
        if (!imageInput.files.length) return;

        // Clear any existing audio
        clearAudioCache();

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

            // Store the current text for audio generation
            currentText = data.result;

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
}); 