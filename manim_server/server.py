"""
Manim Server - Flask backend for running Manim animations
Renders animations on-demand and serves them to the frontend
"""

from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import subprocess
import os
import tempfile
import shutil
import hashlib
import json
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from frontend

# Configuration
MANIM_OUTPUT_DIR = Path(__file__).parent / "manim_output"
MANIM_SCENES_DIR = Path(__file__).parent / "manim_scenes"
CACHE_DIR = Path(__file__).parent / "cache"

# Create directories
MANIM_OUTPUT_DIR.mkdir(exist_ok=True)
MANIM_SCENES_DIR.mkdir(exist_ok=True)
CACHE_DIR.mkdir(exist_ok=True)


@app.route('/health', methods=['GET'])
def health_check():
    """Check if server and Manim are working"""
    try:
        result = subprocess.run(
            ['manim', '--version'],
            capture_output=True,
            text=True,
            timeout=10
        )
        manim_version = result.stdout.strip() if result.returncode == 0 else "Not found"
        return jsonify({
            'status': 'ok',
            'manim_version': manim_version
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500


@app.route('/render', methods=['POST'])
def render_animation():
    """
    Render a Manim scene from provided Python code
    
    Request body:
    {
        "code": "from manim import *\n...",
        "scene_name": "MyScene",
        "quality": "low"  # low, medium, high
    }
    """
    data = request.json
    code = data.get('code', '')
    scene_name = data.get('scene_name', 'MainScene')
    quality = data.get('quality', 'low')
    
    # Quality flags
    quality_flags = {
        'low': '-ql',      # 480p, 15fps
        'medium': '-qm',   # 720p, 30fps  
        'high': '-qh'      # 1080p, 60fps
    }
    
    # Create hash for caching
    code_hash = hashlib.md5(f"{code}{scene_name}{quality}".encode()).hexdigest()[:12]
    cache_path = CACHE_DIR / f"{code_hash}.mp4"
    
    # Check cache
    if cache_path.exists():
        return jsonify({
            'status': 'success',
            'video_url': f'/video/{code_hash}.mp4',
            'cached': True
        })
    
    # Create temporary file for the scene
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(code)
        temp_file = f.name
    
    try:
        # Run Manim
        cmd = [
            'manim',
            quality_flags.get(quality, '-ql'),
            temp_file,
            scene_name,
            '-o', f'{code_hash}',
            '--media_dir', str(MANIM_OUTPUT_DIR)
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120  # 2 minute timeout
        )
        
        if result.returncode != 0:
            return jsonify({
                'status': 'error',
                'error': result.stderr,
                'stdout': result.stdout
            }), 400
        
        # Find the output video
        video_path = None
        for root, dirs, files in os.walk(MANIM_OUTPUT_DIR):
            for file in files:
                if file.endswith('.mp4') and code_hash in file:
                    video_path = Path(root) / file
                    break
        
        if video_path and video_path.exists():
            # Move to cache
            shutil.copy(video_path, cache_path)
            
            return jsonify({
                'status': 'success',
                'video_url': f'/video/{code_hash}.mp4',
                'cached': False
            })
        else:
            return jsonify({
                'status': 'error',
                'error': 'Video file not found after rendering',
                'stdout': result.stdout,
                'stderr': result.stderr
            }), 500
            
    except subprocess.TimeoutExpired:
        return jsonify({
            'status': 'error',
            'error': 'Rendering timed out (>2 minutes)'
        }), 408
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500
    finally:
        # Cleanup temp file
        os.unlink(temp_file)


@app.route('/video/<filename>')
def serve_video(filename):
    """Serve rendered video from cache"""
    return send_from_directory(CACHE_DIR, filename)


@app.route('/scenes', methods=['GET'])
def list_scenes():
    """List available pre-built scenes"""
    scenes = []
    for file in MANIM_SCENES_DIR.glob('*.py'):
        scenes.append({
            'name': file.stem,
            'file': file.name
        })
    return jsonify({'scenes': scenes})


@app.route('/render-preset/<scene_name>', methods=['POST'])
def render_preset(scene_name):
    """Render a pre-built scene with parameters"""
    data = request.json or {}
    params = data.get('params', {})
    quality = data.get('quality', 'low')
    
    scene_file = MANIM_SCENES_DIR / f"{scene_name}.py"
    if not scene_file.exists():
        return jsonify({
            'status': 'error',
            'error': f'Scene {scene_name} not found'
        }), 404
    
    # Read and potentially modify scene code with params
    code = scene_file.read_text()
    
    # Simple parameter injection (for demo)
    for key, value in params.items():
        code = code.replace(f'${{{key}}}', str(value))
    
    # Use the main render endpoint
    return render_animation()


# Serve static files (for development)
@app.route('/')
def index():
    return send_from_directory('..', 'interactive_manim.html')


@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('..', path)


if __name__ == '__main__':
    print("🎬 Manim Server starting...")
    print(f"📁 Output dir: {MANIM_OUTPUT_DIR}")
    print(f"📁 Cache dir: {CACHE_DIR}")
    print("🌐 Server running at http://localhost:5000")
    app.run(debug=True, port=5000)
