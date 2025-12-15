from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = "secret"
ALGORITHM = "HS256"

def create_token(data: dict, expires_delta: timedelta = None) -> str:
    # Copy the payload so callers' dicts aren't modified
    to_encode = data.copy()

    # Compute expiry: use provided delta or default to 15 minutes here
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))

    # Add the expiry into the token payload (standard 'exp' claim)
    to_encode.update({"exp": expire, "token_type": "access"})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Create a JWT refresh token with a longer expiry.
def create_refresh_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()

    # Default: refresh token lasts 7 days
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=7))
    
    to_encode.update({"exp": expire, "token_type": "refresh"})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Ensure this is an access token (not a refresh token)
        if payload.get("token_type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")

        return payload
    
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")