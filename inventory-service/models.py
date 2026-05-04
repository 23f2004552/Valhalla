from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database import Base

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    current_stock = Column(Integer, default=0)
    threshold = Column(Integer, default=10)

class RecipeMap(Base):
    __tablename__ = "recipe_map"

    id = Column(Integer, primary_key=True, index=True)
    menu_item_id = Column(Integer, index=True, nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    quantity_required = Column(Integer, default=1)
