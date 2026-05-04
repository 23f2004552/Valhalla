import bcrypt
from database import SessionLocal
from models import User

db = SessionLocal()
if not db.query(User).filter(User.username == "admin").first():
    admin_user = User(
        username="admin",
        password_hash=bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode("utf-8"),
        role="admin",
    )
    db.add(admin_user)
    db.commit()
db.close()
