from dotenv import load_dotenv
import os
from elevenlabs import generate, set_api_key, voices

# Ensure environment variables are loaded
load_dotenv()


def generate_voice_guidance(text: str) -> bytes:
    """
    Generate voice guidance audio bytes using ElevenLabs API.
    """
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise ValueError("ElevenLabs API key not found. Please set the ELEVENLABS_API_KEY environment variable.")
    set_api_key(api_key)
    available_voices = voices()
    if not available_voices:
        raise ValueError("No voices available. Please check your ElevenLabs API key and subscription.")
    voice_id = None
    preferred_voices = ['Bella', 'Antoni', 'Sam']
    for voice in available_voices:
        if voice.name in preferred_voices:
            voice_id = voice.voice_id
            break
    if not voice_id and available_voices:
        voice_id = available_voices[0].voice_id
    if not voice_id:
        raise ValueError("No suitable voice found.")
    
    audio_bytes = generate(text=text, voice=voice_id, model="eleven_monolingual_v1")
    return audio_bytes


def create_voice_summary(text: str) -> str:
    """
    Create a voice-friendly summary from the provided text.
    This function mimics the reference setup by extracting key sections.
    """
    sections = text.split('##')
    summary = "Here's how to recycle this item: "
    for section in sections:
        if 'Recycling Instructions' in section:
            instructions = section.replace('Recycling Instructions', '').strip()
            summary += instructions + " "
        elif 'Environmental Impact' in section:
            impact = section.replace('Environmental Impact', '').replace('🌍', '').strip()
            summary += "And here's an interesting fact: " + impact + " "
    if summary.strip() == "Here's how to recycle this item:":
        # if no sections found, return original text
        return text
    return summary.strip() 