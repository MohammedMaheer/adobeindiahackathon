import os
from flask import Flask, request, render_template, send_from_directory, jsonify
from werkzeug.utils import secure_filename
import json

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
ALLOWED_EXTENSIONS = {'pdf'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

import subprocess

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        # Call backend structure extractor
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], filename.replace('.pdf', '.json'))
        # Run extraction script (simulate here, replace with real call)
        try:
            # CASCADE PATCH: use absolute path for round1a_structure_extractor.py
            round1a_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'round1a_structure_extractor.py'))
            ret = subprocess.run([
                'python', round1a_path,
                '--input', app.config['UPLOAD_FOLDER'],
                '--output', app.config['OUTPUT_FOLDER']
            ], check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            print('STDOUT:', e.stdout)
            print('STDERR:', e.stderr)
            return jsonify({'error': f'Extraction failed: {e}\nSTDOUT:\n{e.stdout}\nSTDERR:\n{e.stderr}'}), 500
        if not os.path.exists(output_path):
            return jsonify({'error': 'No output generated'}), 500
        with open(output_path) as f:
            output_json = json.load(f)
        return jsonify({'filename': filename, 'output': output_json})
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/persona_upload', methods=['POST'])
def persona_upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    persona = request.form.get('persona', '')
    job = request.form.get('job', '')
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        # Run structure extractor first
        try:
            # CASCADE PATCH: use absolute path for round1a_structure_extractor.py
            round1a_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'round1a_structure_extractor.py'))
            ret = subprocess.run([
                'python', round1a_path,
                '--input', app.config['UPLOAD_FOLDER'],
                '--output', app.config['OUTPUT_FOLDER']
            ], check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            print('STDOUT:', e.stdout)
            print('STDERR:', e.stderr)
            return jsonify({'error': f'Extraction failed: {e}\nSTDOUT:\n{e.stdout}\nSTDERR:\n{e.stderr}'}), 500
        # Now run persona intelligence
        json_input_path = os.path.join(app.config['OUTPUT_FOLDER'], filename.replace('.pdf', '.json'))
        try:
            round1b_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'round1b_persona_intelligence.py'))
            ret2 = subprocess.run([
                'python', round1b_path,
                '--input', app.config['OUTPUT_FOLDER'],
                '--output', app.config['OUTPUT_FOLDER'],
                '--persona', persona,
                '--job', job
            ], check=True, capture_output=True, text=True)
        except Exception as e:
            return jsonify({'error': f'Persona intelligence failed: {e}'}), 500
        out_path = json_input_path.replace('.json', '_challenge1b_output.json')
        if not os.path.exists(out_path):
            return jsonify({'error': 'No persona output generated'}), 500
        with open(out_path) as f:
            output_json = json.load(f)
        return jsonify({'filename': filename, 'output': output_json})
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/output/<filename>')
def get_output(filename):
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename)

@app.route('/uploads/<filename>')
def get_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/output')
def list_outputs():
    files = [f for f in os.listdir(app.config['OUTPUT_FOLDER']) if f.endswith('.json')]
    return jsonify(files)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if __name__ == "__main__":
    import sys
    port = 5000
    for i, arg in enumerate(sys.argv):
        if arg.startswith('--port'):
            if '=' in arg:
                port = int(arg.split('=')[1])
            elif i+1 < len(sys.argv):
                port = int(sys.argv[i+1])
    app.run(debug=True, port=port)
