import bcrypt
import uuid

SESSION_STORE = {}


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_session(user_id: int):
    token = str(uuid.uuid4())
    SESSION_STORE[token] = user_id
    return token

def get_user_from_token(token: str):
    return SESSION_STORE.get(token)