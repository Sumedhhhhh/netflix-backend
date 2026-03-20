from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import User
from ..schema import UserSignup, UserLogin
from ..utils.security import hash_password, verify_password
from ..auth import create_access_token

router = APIRouter()

def get_db() :
    db = SessionLocal()
    try :
        yield db
    finally :
        db.close()


@router.post("/signup")
def signup(user : UserSignup, db: Session = Depends(get_db)):

    existing = db.query(User).filter(User.email==user.email).first()

    if existing :
        raise HTTPException(status_code = 400, detail = "User already exists")

    new_user = User(
        email = user.email,
        password_hash = hash_password(user.password)
    )    

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id)

    return { "access_token" : token }


@router.post("/login")
def login(user : UserLogin, db : Session = Depends(get_db)):
    
    db_user = db.query(User).filter(User.email==user.email).first()

    if not db_user :
        raise HTTPException(status_code=401)
    
    if not verify_password(user.password, db_user.password_hash) :
        raise HTTPException(status_code=401)
    
    token = create_access_token(db_user.id)

    return { "access_token" : token }




