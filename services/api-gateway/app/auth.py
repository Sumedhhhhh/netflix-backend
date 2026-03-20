from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

def create_access_token(user_id) :

    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub" : str(user_id),"exp" : expire}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_token(token:str) :
    return jwt.decode(token, SECRET_KEY,algorithms=ALGORITHM)
