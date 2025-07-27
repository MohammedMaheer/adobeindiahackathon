FROM --platform=linux/amd64 python:3.9-slim-buster as base
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app

# Create input/output dirs for runtime
RUN mkdir -p /app/input /app/output

# Default: run structure extractor (Round 1A)
ENTRYPOINT ["python", "round1a_structure_extractor.py", "--input", "/app/input", "--output", "/app/output"]

# To run Round 1B, override entrypoint:
# docker run ... python round1b_persona_intelligence.py --input /app/output --output /app/output --persona "..." --job "..."
