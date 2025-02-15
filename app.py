import os
from flask import Flask, request, jsonify, render_template, send_from_directory
import google.generativeai as genai
from dotenv import load_dotenv
import base64
from PIL import Image
import io
from elevenlabs import generate as generate_voice, set_api_key, voices

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure APIs
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    client = genai.GenerativeModel('gemini-2.0-flash')

if ELEVENLABS_API_KEY:
    set_api_key(ELEVENLABS_API_KEY)

# Define the recycling prompt
RECYCLING_PROMPT = """You are an expert in sustainable waste management. Analyze the attached image and provide a response in the following format:

## Recycling Instructions
[Provide clear, numbered, step-by-step instructions for recycling or disposing of the item. Be concise and practical, focusing on minimal hassle.]

## Materials Breakdown
[List each material that makes up the object using this format:
- ♻️ [material name] (for recyclable materials)
- ⛔ [material name] (for non-recyclable materials)]

## Eco-Friendly Tips
1. [First suggestion to maximize eco-friendliness]
2. [Second suggestion to maximize eco-friendliness]
3. [Third suggestion to maximize eco-friendliness]

## Environmental Impact
🌍 Did you know? [Share one interesting fact about recycling this particular item, specifically focusing on its environmental impact. Make it engaging and quantifiable if possible.]"""

def create_voice_summary(text):
    """Create a concise, enthusiastic summary for voice conversion."""
    prompt = """Create an enthusiastic and engaging 30-second summary (approximately 75 words) of the following recycling advice. 
    Make it sound exciting and motivational, using an upbeat tone. Include encouraging phrases and positive reinforcement.
    Focus on the most important preparation steps and disposal methods. Start with an energetic greeting and end with a motivational closer.
    
    Example style:
    "Hey there, eco-warrior! Great news about recycling your [items]! Here's what you need to know... Remember, you're making a real difference!"
    
    Advice to summarize:
    {text}"""
    
    response = client.generate_content(prompt.format(text=text))
    return response.text.strip()

def generate_audio(text):
    """Generate audio using ElevenLabs API."""
    try:
        if not ELEVENLABS_API_KEY:
            return None, "ElevenLabs API key not configured"
            
        # Get available voices
        available_voices = voices()
        if not available_voices:
            return None, "No voices available"
            
        # Find a voice with a more enthusiastic style
        voice_id = None
        preferred_voices = ['Bella', 'Antoni', 'Sam']
        for voice in available_voices:
            if voice.name in preferred_voices:
                voice_id = voice.voice_id
                break
        
        if not voice_id and available_voices:
            voice_id = available_voices[0].voice_id
            
        if not voice_id:
            return None, "No suitable voice found"
        
        # Generate audio
        audio_bytes = generate_voice(
            text=text,
            voice=voice_id,
            model="eleven_monolingual_v1"
        )
        
        # Convert to base64 for frontend
        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
        return audio_b64, None
    except Exception as e:
        return None, str(e)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/api/recycle', methods=['POST'])
def recycle():
    if not GEMINI_API_KEY:
        return jsonify({'error': 'Gemini API key not configured'}), 500

    try:
        # Get image file from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'error': 'No image selected'}), 400

        # Read and process the image
        img_bytes = image_file.read()
        image = Image.open(io.BytesIO(img_bytes))
        
        # Convert to RGB if necessary
        if image.mode not in ('RGB', 'L'):
            image = image.convert('RGB')
        
        # Prepare image for Gemini
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode()

        # Create the prompt with image
        response = client.generate_content([
            RECYCLING_PROMPT,
            {'mime_type': 'image/jpeg', 'data': img_str}
        ])

        # Generate voice summary and audio
        summary = create_voice_summary(response.text)
        audio_b64, error = generate_audio(summary)

        return jsonify({
            'result': response.text,
            'audio': audio_b64,
            'error': error
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 