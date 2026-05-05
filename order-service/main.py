from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import engine, get_db, Base
from models import Order, OrderItem
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
import time, json, os, datetime
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

# ── RabbitMQ Publisher ──
import pika

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
_rmq_connection = None
_rmq_channel = None

def get_rabbitmq_channel():
    global _rmq_connection, _rmq_channel
    try:
        if _rmq_connection and _rmq_connection.is_open:
            return _rmq_channel
        _rmq_connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=RABBITMQ_HOST, heartbeat=600,
                                      connection_attempts=3, retry_delay=2)
        )
        _rmq_channel = _rmq_connection.channel()
        _rmq_channel.exchange_declare(exchange="order_events", exchange_type="fanout", durable=True)
        return _rmq_channel
    except Exception:
        return None

def publish_order_event(order_id: int, total: float, customer: str, table: int):
    try:
        ch = get_rabbitmq_channel()
        if ch:
            msg = json.dumps({"order_id": order_id, "total": total, "customer": customer,
                               "table_number": table, "timestamp": time.time()})
            ch.basic_publish(exchange="order_events", routing_key="", body=msg)
    except Exception:
        pass

# ── Schemas ──
class OrderItemBase(BaseModel):
    menu_item_id: int
    qty: int = 1
    quantity: int = 1  # Accept both field names from frontend

class OrderCreate(BaseModel):
    items: List[OrderItemBase]
    customer_name: Optional[str] = "Guest"
    table_number: Optional[int] = None
    total: Optional[float] = 0.0

class OrderItemOut(BaseModel):
    id: int
    menu_item_id: int
    qty: int
    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    status: str
    total: float
    customer_name: Optional[str] = ""
    table_number: Optional[int] = None
    created_at: Optional[str] = None
    items: Optional[List[OrderItemOut]] = []
    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str

class OrderUpdateItems(BaseModel):
    items: List[OrderItemBase]
    total: Optional[float] = None

# ── Routes ──
@app.get("/orders", response_model=List[OrderOut])
def list_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.id.desc()).all()
    result = []
    for o in orders:
        order_items = db.query(OrderItem).filter(OrderItem.order_id == o.id).all()
        result.append({
            "id": o.id,
            "status": o.status,
            "total": o.total,
            "customer_name": o.customer_name,
            "table_number": o.table_number,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "items": [{"id": i.id, "menu_item_id": i.menu_item_id, "qty": i.qty} for i in order_items]
        })
    return result

@app.get("/orders/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    return {
        "id": order.id,
        "status": order.status,
        "total": order.total,
        "customer_name": order.customer_name,
        "table_number": order.table_number,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "items": [{"id": i.id, "menu_item_id": i.menu_item_id, "qty": i.qty} for i in items],
    }

@app.post("/orders", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    db_order = Order(
        customer_name=order.customer_name or "Guest",
        status="pending",
        total=order.total or 0.0,
        table_number=order.table_number,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    for item in order.items:
        q = item.qty if item.qty > 1 else item.quantity
        db_item = OrderItem(order_id=db_order.id, menu_item_id=item.menu_item_id, qty=q)
        db.add(db_item)
    db.commit()

    publish_order_event(db_order.id, db_order.total, db_order.customer_name, db_order.table_number or 0)
    
    return {
        "id": db_order.id,
        "status": db_order.status,
        "total": db_order.total,
        "customer_name": db_order.customer_name,
        "table_number": db_order.table_number,
        "created_at": db_order.created_at.isoformat() if db_order.created_at else None,
    }

@app.put("/orders/{order_id}/items")
def update_order_items(order_id: int, update: OrderUpdateItems, db: Session = Depends(get_db)):
    """Allow customers to add items to an order while it is still pending or preparing."""
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    if db_order.status not in ("pending", "preparing"):
        raise HTTPException(status_code=400, detail="Order can no longer be modified")

    # Add new items to the order
    for item in update.items:
        q = item.qty if item.qty > 1 else item.quantity
        db_item = OrderItem(order_id=db_order.id, menu_item_id=item.menu_item_id, qty=q)
        db.add(db_item)

    # Update total if provided
    if update.total is not None:
        db_order.total = update.total

    db.commit()
    db.refresh(db_order)

    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    return {
        "id": db_order.id,
        "status": db_order.status,
        "total": db_order.total,
        "customer_name": db_order.customer_name,
        "table_number": db_order.table_number,
        "created_at": db_order.created_at.isoformat() if db_order.created_at else None,
        "items": [{"id": i.id, "menu_item_id": i.menu_item_id, "qty": i.qty} for i in items],
    }

@app.put("/orders/{order_id}/status", response_model=OrderOut)
def update_status(order_id: int, update: StatusUpdate, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    db_order.status = update.status
    db.commit()
    db.refresh(db_order)
    return {
        "id": db_order.id,
        "status": db_order.status,
        "total": db_order.total,
        "customer_name": db_order.customer_name,
        "table_number": db_order.table_number,
        "created_at": db_order.created_at.isoformat() if db_order.created_at else None,
    }

@app.get("/")
def read_root():
    return {"service": "Order Service", "status": "active"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "order-service"}

