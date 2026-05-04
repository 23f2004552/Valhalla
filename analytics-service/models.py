from sqlalchemy import Column, Integer, String, Float, Date
from database import Base

class DailySales(Base):
    __tablename__ = "daily_sales"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, index=True)
    total_revenue = Column(Float, default=0.0)
    order_count = Column(Integer, default=0)

class TopItem(Base):
    __tablename__ = "top_items"

    id = Column(Integer, primary_key=True, index=True)
    menu_item_id = Column(Integer, index=True)
    name = Column(String)
    quantity_sold = Column(Integer, default=0)
