FROM python:3.10-slim

WORKDIR /app
COPY order-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY order-service/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
