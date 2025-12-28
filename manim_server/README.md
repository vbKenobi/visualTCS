# Manim Server for VisualTCS

This server renders Manim animations on-demand and serves them to the web frontend.

## Setup

### 1. Install Dependencies

```bash
cd manim_server

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 2. Verify Manim Installation

```bash
manim --version
```

If Manim isn't installed, follow the [official installation guide](https://docs.manim.community/en/stable/installation.html).

### 3. Start the Server

```bash
python server.py
```

The server will start at `http://localhost:5000`

## Usage

### From the Web Interface

1. Open `interactive_manim.html` in your browser
2. Select a scene template (BFS, DFS, Compare, or Custom)
3. Edit the Manim code if desired
4. Click "Render Animation"
5. Wait for rendering (10-60 seconds)
6. Watch the animation!

### API Endpoints

#### Check Server Health
```bash
curl http://localhost:5000/health
```

#### Render Animation
```bash
curl -X POST http://localhost:5000/render \
  -H "Content-Type: application/json" \
  -d '{
    "code": "from manim import *\n\nclass Test(Scene):\n    def construct(self):\n        self.play(Create(Circle()))",
    "scene_name": "Test",
    "quality": "low"
  }'
```

Quality options: `low`, `medium`, `high`

#### Get Rendered Video
```
GET http://localhost:5000/video/{hash}.mp4
```

## File Structure

```
manim_server/
├── server.py           # Flask server
├── requirements.txt    # Python dependencies
├── manim_scenes/       # Pre-built scene templates
│   └── graph_traversal.py
├── manim_output/       # Manim render output (auto-created)
└── cache/              # Cached rendered videos (auto-created)
```

## Troubleshooting

### "Server offline" in web interface
- Make sure the server is running (`python server.py`)
- Check if port 5000 is available
- Look for errors in the terminal running the server

### Rendering fails
- Check the error message in the status bar
- Verify your Manim code is valid (test locally with `manim -pql yourfile.py SceneName`)
- Make sure LaTeX is installed if using math text

### Video doesn't play
- Check browser console for errors
- Try a different browser
- Verify the video file exists in `cache/`
