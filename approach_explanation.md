# Approach Explanation: Adobe India Hackathon – Connecting the Dots

## Overview
This solution is designed for the Adobe India Hackathon, addressing both Round 1A (Document Structure Extraction) and Round 1B (Persona-Driven Document Intelligence) with a focus on:
- Full offline, CPU-only operation (AMD64)
- Strict compliance with model size (<200MB), runtime (<10s per 50-page PDF), and memory (<200MB RAM) constraints
- Batch processing and robust error handling
- Modular, extensible, and documented code
- Unique, professional frontend with PDF preview (Adobe PDF Embed API)

## Round 1A: Structure Extraction
- **PDF Parsing:** Uses PyMuPDF (`fitz`) for fine-grained extraction of text, font size, boldness, position, and page structure.
- **Heading Detection Heuristic:**
  - Combines font size, boldness, left margin, and line spacing for robust heading detection.
  - Recognizes numbered and section headings (e.g., "1. Introduction").
  - Utilizes document metadata and cross-validates with the Table of Contents if available.
  - Handles multilingual/CJK scripts (Japanese, Chinese, Korean) with script-aware heuristics.
  - Optionally applies clustering-based self-learning for new heading styles.
- **Output:**
  - JSON per PDF: `{ "title": ..., "outline": [{"level": "H1", "text": ..., "page": ...}, ...] }`
  - Performance and memory profiling are included, with warnings if constraints are exceeded.

## Round 1B: Persona-Driven Intelligence
- **Section Ranking:**
  - Loads outlines from Round 1A.
  - Embeds the persona/job-to-be-done and all section texts using `sentence-transformers` (all-MiniLM-L6-v2, ~80MB).
  - Computes cosine similarity for ranking sections by relevance to the persona/job.
- **Sub-section Analysis:**
  - For top-ranked sections, splits into paragraphs/sentences and re-ranks for fine-grained insights.
  - Outputs explainable fields: similarity scores, highlights, and section summaries.
- **Multilingual Support:**
  - Model and heuristics support multiple languages, including Japanese and CJK scripts.
- **Output:**
  - JSON per document: includes `Metadata`, `Extracted Sections`, and `Sub-section Analysis`.

## Batch Processing & Compliance
- All scripts use `--input` and `--output` arguments (no hardcoding).
- Batch processing: all PDFs in `/app/input` are processed, outputs written to `/app/output`.
- Dockerfile creates `/app/input` and `/app/output` at build time; all paths are container-compliant.
- No internet or GPU dependencies at runtime.

## Frontend & User Experience
- Flask backend handles uploads, runs analysis, and serves output/download links.
- Frontend (HTML/JS) is responsive, branded, and hackathon-compliant.
- PDF preview is integrated using Adobe PDF Embed API for interactive document review.
- User can upload PDFs, select personas/jobs, and download output JSONs.

## Unique/Advanced Features
- Self-learning (clustering-based) heading detection for new/unseen styles
- TOC cross-validation and whitespace/visual context heuristics
- Multilingual and script-aware processing
- Explainable output fields for transparency
- Section summarization and highlights

## Compliance Checklist
- [x] All code and models run offline, on CPU (AMD64)
- [x] Model size and memory usage within limits
- [x] Runtime <10s per 50-page PDF (profiling included)
- [x] Batch processing and argument-based paths
- [x] Output directory: `/app/output` only
- [x] Dockerfile and requirements.txt fully compliant
- [x] README and documentation up to date
- [x] Innovative and professional frontend

---

For further details, see the code, `README.md`, and comments throughout the repository.
