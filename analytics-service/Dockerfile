FROM python:3.10-slim

WORKDIR /app

COPY analytics-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY analytics-service/ .

CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-5000}"
