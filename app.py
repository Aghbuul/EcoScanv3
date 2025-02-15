import os
from flask import Flask, request, jsonify, render_template, send_from_directory
import google.generativeai as genai
from dotenv import load_dotenv
import base64
from PIL import Image
import io
from elevenlabs_integration import generate_voice_guidance, create_voice_summary

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configure API keys and services
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    client = genai.GenerativeModel('gemini-2.0-flash')

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

        return jsonify({'result': response.text})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-audio', methods=['POST'])
def generate_voice():
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400

        summary = create_voice_summary(data['text'])
        audio = generate_voice_guidance(summary)
        audio_base64 = base64.b64encode(audio).decode('utf-8')
        return jsonify({'audio': audio_base64})
    except Exception as e:
        print(f"Error generating audio: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 8080))) 