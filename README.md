# EcoScan - Recycling Helper

EcoScan is a web application that helps users determine how to properly recycle or dispose of items by analyzing images using Google's Gemini AI.

## Features

- 📸 Upload or drag-and-drop images
- 🤖 AI-powered item analysis
- ♻️ Detailed recycling and disposal instructions
- 📱 Mobile-friendly design

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ecoscan
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Get a Gemini API key:
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- Copy the API key

5. Set up environment variables:
```bash
# On Windows:
copy .env.example .env
# On macOS/Linux:
cp .env.example .env
```
Then edit the `.env` file and add your Gemini API key.

6. Run the application:
```bash
python app.py
```

7. Open your browser and visit `http://localhost:5000`

## Usage

1. Click the upload area or drag and drop an image of the item you want to recycle
2. Click "Analyze Item"
3. View the detailed recycling and disposal instructions

## Development

The project structure is organized as follows:

```
ecoscan/
├── app.py              # Flask application
├── requirements.txt    # Python dependencies
├── .env.example       # Example environment variables
├── static/
│   ├── css/
│   │   └── style.css  # Styles
│   └── js/
│       └── app.js     # Frontend JavaScript
└── templates/
    └── index.html     # Main HTML template
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 