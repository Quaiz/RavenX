FROM python:3.11-slim

WORKDIR /app

RUN adduser --disabled-password --gecos "" appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p /app/data && chown -R appuser:appuser /app

USER appuser

HEALTHCHECK --interval=5m --timeout=10s --start-period=30s --retries=3 \
  CMD python -c "import os, time, sys; p='/tmp/pipeline_heartbeat'; sys.exit(0 if os.path.exists(p) and (time.time() - os.path.getmtime(p)) < 1200 else 1)"

CMD ["python", "-m", "ravenx_pipeline.main"]
