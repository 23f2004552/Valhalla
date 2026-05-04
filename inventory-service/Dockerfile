FROM python:3.10-slim

WORKDIR /app

COPY inventory-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY inventory-service/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
