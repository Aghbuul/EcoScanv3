# ElevenLabs API Implementation Guide

This guide explains how to implement text-to-speech functionality using the ElevenLabs API in a Python application.

## Setup and Installation

1. Install the ElevenLabs package:
```bash
pip install elevenlabs==0.2.26
```

2. Set up your environment variables in a `.env` file:
```
ELEVENLABS_API_KEY="your-api-key-here"
```

## Code Implementation

### 1. Required Imports
```python
from elevenlabs import generate, set_api_key, voices
from dotenv import load_dotenv
import os
```

### 2. Load Environment Variables
```python
# Load environment variables
load_dotenv()
```

### 3. Create Voice Summary
This function generates a concise, enthusiastic summary for voice conversion:

```python
def create_voice_summary(advice):
    try:
        model = init_gemini()
        if not model:
            return None
            
        prompt = """Create an enthusiastic and engaging 30-second summary (approximately 75 words) of the following recycling advice. 
        Make it sound exciting and motivational, using an upbeat tone. Include encouraging phrases and positive reinforcement.
        Focus on the most important preparation steps and disposal methods. Start with an energetic greeting and end with a motivational closer.
        
        Example style:
        "Hey there, eco-warrior! Great news about recycling your [items]! Here's what you need to know... Remember, you're making a real difference!"

        Advice to summarize:
        {advice}"""
        
        response = model.generate_content(prompt.format(advice=advice))
        response.resolve()
        return response.text.strip()
    except Exception as e:
        st.error(f"Error creating summary: {str(e)}")
        return None
```

### 4. Generate Voice Using ElevenLabs
This function handles the text-to-speech conversion:

```python
def generate_voice_guidance(text):
    try:
        # Get ElevenLabs API key from environment
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            st.error("ElevenLabs API key not found. Please set the ELEVENLABS_API_KEY environment variable.")
            return None
            
        # Set the API key
        set_api_key(api_key)
        
        # Get available voices
        available_voices = voices()
        if not available_voices:
            st.error("No voices available. Please check your ElevenLabs API key and subscription.")
            return None
            
        # Find a voice with a more enthusiastic style
        voice_id = None
        preferred_voices = ['Bella', 'Antoni', 'Sam']  # Voices known for energetic delivery
        for voice in available_voices:
            if voice.name in preferred_voices:
                voice_id = voice.voice_id
                break
        
        # If no preferred voice found, use the first available voice
        if not voice_id and available_voices:
            voice_id = available_voices[0].voice_id
            
        if not voice_id:
            st.error("No suitable voice found.")
            return None
        
        # Generate audio using ElevenLabs
        audio_bytes = generate(
            text=text,
            voice=voice_id,
            model="eleven_monolingual_v1"
        )
        
        return audio_bytes
    except Exception as e:
        st.error(f"Error generating voice guidance: {str(e)}")
        return None
```

### 5. Using the Voice Generation in Your Application

```python
# Generate voice summary
with st.spinner("Generating voice summary..."):
    summary = create_voice_summary(advice)
    if summary:
        st.markdown("### 🎧 Voice Summary")
        audio_bytes = generate_voice_guidance(summary)
        if audio_bytes:
            st.audio(audio_bytes, format='audio/mp3')
```

## Key Features

1. **API Key Management**: Securely loads the API key from environment variables
2. **Voice Selection**: 
   - Attempts to use more enthusiastic voices (Bella, Antoni, Sam)
   - Falls back to the first available voice if preferred voices aren't found
3. **Error Handling**: 
   - Checks for API key presence
   - Validates voice availability
   - Provides clear error messages
4. **Voice Settings**:
   - Uses the `eleven_monolingual_v1` model for high-quality speech
   - Returns audio in bytes format for easy playback

## Best Practices

1. Always store API keys in environment variables
2. Handle errors gracefully with informative messages
3. Use a consistent voice for better user experience
4. Keep summaries concise (around 75 words for 30-second audio)
5. Test voice availability before generation

## Common Issues and Solutions

1. **Voice Not Found**: 
   - Ensure you have access to voices in your ElevenLabs subscription
   - Check if the API key has the correct permissions

2. **API Key Issues**:
   - Verify the API key is correctly set in your .env file
   - Make sure the API key is valid and active

3. **Audio Quality**:
   - Use the recommended model (`eleven_monolingual_v1`)
   - Keep text input well-formatted and punctuated

## Resources

- [ElevenLabs API Documentation](https://docs.elevenlabs.io/api-reference/quick-start/introduction)
- [Python Package Documentation](https://github.com/elevenlabs/elevenlabs-python) 