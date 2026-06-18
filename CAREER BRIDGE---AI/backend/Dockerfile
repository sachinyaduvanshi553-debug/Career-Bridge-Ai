# Backend Dockerfile - Production Ready (CPU-Only, Render Optimized)
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# ── Step 1: Install CPU-only PyTorch FIRST ──────────────────────────────────
# sentence-transformers pulls torch as a dependency. If torch is already
# installed (CPU wheel), pip will reuse it and skip the massive CUDA packages
# (torch-GPU + all nvidia-* libs = ~3 GB). CPU wheel is only ~200 MB.
RUN pip install --no-cache-dir \
    torch \
    --index-url https://download.pytorch.org/whl/cpu

# ── Step 2: Install remaining requirements ────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Step 3: Download spaCy language model ────────────────────────────────────
RUN python -m spacy download en_core_web_sm

# ── Step 4: Pre-cache sentence-transformers model into the image ─────────────
# Without this, the model (~90 MB) downloads from HuggingFace at container
# startup, which blocks the port from opening and causes Render's health check
# to fail ("No open ports detected").
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2'); print('Model cached OK')"

# ── Step 5: Copy application source ──────────────────────────────────────────
COPY . .

# Set PYTHONPATH so that `app` and `ml_models` are top-level importable
ENV PYTHONPATH=/app

# Expose default port (Render overrides via $PORT env var)
EXPOSE 8000

# Shell form so $PORT is expanded at runtime
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
