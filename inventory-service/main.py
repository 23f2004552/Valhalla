from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import engine, get_db, Base
from models import Ingredient, RecipeMap
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
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

# Wait for DB and create tables
while True:
    try:
        Base.metadata.create_all(bind=engine)
        break
    except exc.OperationalError:
        time.sleep(2)

class IngredientBase(BaseModel):
    name: str
    current_stock: int
    threshold: int

class IngredientOut(IngredientBase):
    id: int
    class Config:
        from_attributes = True

class RecipeMapBase(BaseModel):
    menu_item_id: int
    ingredient_id: int
    quantity_required: int

@app.get("/ingredients", response_model=List[IngredientOut])
@app.get("/inventory", response_model=List[IngredientOut])
def list_inventory(db: Session = Depends(get_db)):
    return db.query(Ingredient).all()

@app.post("/ingredients", response_model=IngredientOut, status_code=status.HTTP_201_CREATED)
@app.post("/inventory", response_model=IngredientOut, status_code=status.HTTP_201_CREATED)
def create_ingredient(ing: IngredientBase, db: Session = Depends(get_db)):
    db_ing = Ingredient(**ing.model_dump())
    db.add(db_ing)
    db.commit()
    db.refresh(db_ing)
    return db_ing

@app.post("/inventory/map", status_code=status.HTTP_200_OK)
def map_inventory(recipe_map: RecipeMapBase, db: Session = Depends(get_db)):
    db_map = RecipeMap(**recipe_map.model_dump())
    db.add(db_map)
    db.commit()
    return {"status": "ok"}

@app.put("/inventory/{inv_id}", response_model=IngredientOut)
def update_stock(inv_id: int, updated: IngredientBase, db: Session = Depends(get_db)):
    inv = db.query(Ingredient).filter(Ingredient.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    inv.name = updated.name
    inv.current_stock = updated.current_stock
    inv.threshold = updated.threshold
    db.commit()
    db.refresh(inv)
    return inv

@app.get("/")
def read_root():
    return {"service": "Inventory Service", "status": "active"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "inventory-service"}
