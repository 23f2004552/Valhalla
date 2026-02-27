from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db
from structured_logger import StructuredLogger
import json
import os

log = StructuredLogger("menu-service")

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)


# Removed Redis since we don't have it anymore
cache = None

# Category Endpoints


@app.post(
    "/categories", response_model=schemas.Category, status_code=status.HTTP_201_CREATED
)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = (
        db.query(models.Category).filter(models.Category.name == category.name).first()
    )
    if db_category:
        raise HTTPException(status_code=400, detail="Category already exists")
    new_category = models.Category(name=category.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category


@app.get("/categories", response_model=List[schemas.Category])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = db.query(models.Category).offset(skip).limit(limit).all()
    return categories


@app.post("/menu", response_model=schemas.MenuItem, status_code=status.HTTP_201_CREATED)
def create_menu_item(item: schemas.MenuItemCreate, db: Session = Depends(get_db)):
    db_item = models.MenuItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    # Invalidate Cache
    if cache:
        cache.delete("menu_all")

    return db_item


@app.get("/menu", response_model=list[schemas.MenuItem])
def read_menu_items(db: Session = Depends(get_db)):
    # Check Cache
    if cache:
        cached_menu = cache.get("menu_all")
        if cached_menu:
            log.info("cache_hit", endpoint="/menu")
            return json.loads(cached_menu)

    # Database Query
    items = db.query(models.MenuItem).all()

    # Set Cache
    if cache:
        # Pydantic models to dict
        items_dict = [
            schemas.MenuItem.model_validate(item).model_dump() for item in items
        ]
        cache.setex("menu_all", 60, json.dumps(items_dict, default=str))  # TTL 60s

    return items


@app.get("/menu/{menu_item_id}", response_model=schemas.MenuItem)
def read_menu_item(menu_item_id: int, db: Session = Depends(get_db)):
    db_item = (
        db.query(models.MenuItem).filter(models.MenuItem.id == menu_item_id).first()
    )
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return db_item


@app.put("/menu/{menu_item_id}", response_model=schemas.MenuItem)
def update_menu_item(
    menu_item_id: int,
    item_update: schemas.MenuItemCreate,
    db: Session = Depends(get_db),
):
    db_item = (
        db.query(models.MenuItem).filter(models.MenuItem.id == menu_item_id).first()
    )
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    for key, value in item_update.model_dump().items():
        setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)

    # Invalidate Cache
    if cache:
        cache.delete("menu_all")

    return db_item


@app.delete("/menu/{menu_item_id}")
def delete_menu_item(menu_item_id: int, db: Session = Depends(get_db)):
    db_item = (
        db.query(models.MenuItem).filter(models.MenuItem.id == menu_item_id).first()
    )
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    db.delete(db_item)
    db.commit()

    # Invalidate Cache
    if cache:
        cache.delete("menu_all")

    return {"message": "Menu item deleted"}


@app.get("/")
def read_root():
    return {"service": "Menu Service", "status": "active"}


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "menu-service"}
