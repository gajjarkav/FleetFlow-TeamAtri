from pydantic import BaseModel, EmailStr



class UserLogin(BaseModel):
    email: EmailStr
    password: str

class DispatcherCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str

    class Config:
        from_attributes = True