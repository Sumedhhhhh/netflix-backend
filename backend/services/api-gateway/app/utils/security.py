# Helper function to hash and verify password
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password : str) :
    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        raise ValueError("Password too long (max 72 bytes for bcrypt)")
    return pwd_context.hash(password)

def verify_password(password, hashed) :
    return pwd_context.verify(password, hashed)

