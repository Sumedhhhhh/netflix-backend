# Request response schema
from pydantic import BaseModel

class UserSignup(BaseModel) :
    email : str
    password : str

class UserLogin(BaseModel) :
    email : str
    password : str 

class TokenResponse(BaseModel) :
    access_token : str