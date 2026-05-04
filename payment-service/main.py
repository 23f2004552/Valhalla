from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import engine, get_db, Base
from models import Payment
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import Counter
import time
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

# Custom Prometheus counters for alerting rules
PAYMENT_SUCCESS = Counter("payment_success_total", "Successful payments")
PAYMENT_FAILURES = Counter("payment_failures_total", "Failed payments")

while True:
    try:
        Base.metadata.create_all(bind=engine)
        break
    except exc.OperationalError:
        time.sleep(2)

class PaymentCreate(BaseModel):
    order_id: int
    amount: float

class PaymentOut(PaymentCreate):
    id: int
    status: str
    class Config:
        from_attributes = True

@app.get("/payments", response_model=List[PaymentOut])
def list_payments(db: Session = Depends(get_db)):
    return db.query(Payment).all()

@app.post("/payments", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    if payment.amount == 999.00:
        db_payment = Payment(order_id=payment.order_id, amount=payment.amount, status="failed")
        PAYMENT_FAILURES.inc()
    else:
        db_payment = Payment(order_id=payment.order_id, amount=payment.amount, status="completed")
        PAYMENT_SUCCESS.inc()
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@app.get("/")
def read_root():
    return {"service": "Payment Service", "status": "active"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "payment-service"}
