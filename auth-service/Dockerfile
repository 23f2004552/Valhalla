FROM python:3.10-slim

WORKDIR /app

COPY auth-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY auth-service/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
