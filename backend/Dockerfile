# ===============================
# Base image
# ===============================
FROM python:3.11-slim

# ===============================
# System dependencies
# ===============================
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    proj-bin \
    proj-data \
    gcc \
    build-essential \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# ===============================
# Environment variables
# ===============================
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# These help Django locate GDAL/GEOS
ENV GDAL_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgdal.so
ENV GEOS_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgeos_c.so

# ===============================
# Working directory
# ===============================
WORKDIR /app

# ===============================
# Install Python dependencies
# ===============================
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# ===============================
# Copy project
# ===============================
COPY . .

# ===============================
# Collect static (safe even if skipped)
# ===============================
RUN python manage.py collectstatic --noinput || true

# ===============================
# Start command (Render & Docker)
# ===============================
CMD ["gunicorn", "ngao_core.wsgi:application", "--bind", "0.0.0.0:8200"]
