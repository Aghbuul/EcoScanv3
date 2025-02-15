# EcoScan - Smart Recycling Guide

A web application that helps users properly recycle and dispose of household items using AI-powered image recognition and environmental guidance.

## Features

- Image upload and recognition of household items
- AI-generated recycling and disposal guidance
- Voice guidance for accessibility
- Modern, responsive user interface
- Integration with leading AI services

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   Create a `.env` file in the project root with:
   ```
   GOOGLE_APPLICATION_CREDENTIALS="path/to/your/google-credentials.json"
   OPENAI_API_KEY="your-openai-api-key"
   ELEVENLABS_API_KEY="your-elevenlabs-api-key"
   ```

4. Run the application:
   ```bash
   streamlit run ai_engine.py
   ```

## API Keys Required

- Google Cloud Vision API
- OpenAI API
- ElevenLabs API (optional, for voice guidance)

## Usage

1. Open the application in your web browser
2. Upload an image of a household item
3. Wait for the AI to analyze the image
4. Review the recycling/disposal guidance
5. Optionally, listen to the voice guidance

## Technologies Used

- Streamlit for the web interface
- Google Cloud Vision API for image recognition
- OpenAI GPT-4 for recycling guidance
- ElevenLabs/gTTS for voice synthesis
- Vercel for deployment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 