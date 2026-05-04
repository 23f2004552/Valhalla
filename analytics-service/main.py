from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import engine, get_db, Base
from models import DailySales, TopItem
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
import time, json, threading, os, datetime
from sqlalchemy import exc

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

while True:
    try:
        Base.metadata.create_all(bind=engine)
        break
    except exc.OperationalError:
        time.sleep(2)

# ── RabbitMQ Consumer (background thread) ──
import pika

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")

def on_order_event(ch, method, properties, body):
    """Process incoming order events and update daily sales."""
    try:
        data = json.loads(body)
        from database import SessionLocal
        db = SessionLocal()
        today = str(datetime.date.today())
        row = db.query(DailySales).filter(DailySales.date == today).first()
        if row:
            row.total_revenue += data.get("total", 0)
            row.order_count += 1
        else:
            row = DailySales(date=today, total_revenue=data.get("total", 0), order_count=1)
            db.add(row)
        db.commit()
        db.close()
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

def start_consumer():
    """Connect to RabbitMQ and consume order events in a loop."""
    while True:
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=RABBITMQ_HOST, heartbeat=600,
                                          connection_attempts=5, retry_delay=5)
            )
            channel = connection.channel()
            channel.exchange_declare(exchange="order_events", exchange_type="fanout", durable=True)
            result = channel.queue_declare(queue="analytics_orders", durable=True)
            channel.queue_bind(exchange="order_events", queue=result.method.queue)
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue="analytics_orders", on_message_callback=on_order_event)
            channel.start_consuming()
        except Exception:
            time.sleep(5)  # Retry on connection failure

# Start consumer in background thread
consumer_thread = threading.Thread(target=start_consumer, daemon=True)
consumer_thread.start()

# ── Routes ──
@app.get("/daily-sales")
def get_daily_sales(db: Session = Depends(get_db)):
    sales = db.query(DailySales).all()
    if not sales:
        return [
            {"date": "2026-04-01", "amount": 8500.0},
            {"date": "2026-04-02", "amount": 9200.5},
            {"date": "2026-04-03", "amount": 7800.0},
            {"date": "2026-04-04", "amount": 10500.25},
            {"date": "2026-04-05", "amount": 12500.50}
        ]
    return [{"date": str(s.date), "amount": s.total_revenue} for s in sales]

@app.get("/top-items")
def get_top_items(db: Session = Depends(get_db)):
    items = db.query(TopItem).order_by(TopItem.quantity_sold.desc()).all()
    if not items:
        return [{"menu_item_id": 1, "name": "Saffron Risotto", "quantity_sold": 42}]
    return items

@app.get("/")
def read_root():
    return {"service": "Analytics Service", "status": "active"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "analytics-service"}
