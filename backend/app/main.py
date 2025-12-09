from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import models, schemas, auth
from .database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from .auth import oauth2_scheme, SECRET_KEY, ALGORITHM
import bcrypt

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = ["*"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to get the current user from the JWT token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=403, detail="Token invalid")
    

@app.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt())
    db_user = models.User(username=user.username, password=hashed.decode())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User created"}

@app.post("/login")
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not bcrypt.checkpw(user.password.encode(), db_user.password.encode()):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = auth.create_token({"sub": db_user.username})
    return {"token": token}

# ONLY FOR TESTING WITH SWAGGER UI
# -------------------------------------------------
@app.post("/token")
def token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2 password grant expects form-encoded username & password
    db_user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not db_user or not bcrypt.checkpw(form_data.password.encode(), db_user.password.encode()):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = auth.create_token({"sub": db_user.username})
    # Swagger UI expects {"access_token": "...", "token_type": "bearer"}
    return {"access_token": access_token, "token_type": "bearer"}
# -------------------------------------------------

# ---- User endpoints ----
# GET current user profile
@app.get("/profile", response_model=schemas.UserOut)
def get_user(user = Depends(get_current_user), db: Session = Depends(get_db)):
    return user

# PUT update current user 
@app.put("/profile")
def update_user(updated_user: schemas.UserCreate, user = Depends(get_current_user), 
                db: Session = Depends(get_db)):
    
    user.username = updated_user.username
    hashed = bcrypt.hashpw(updated_user.password.encode(), bcrypt.gensalt())
    user.password = hashed.decode()
    
    db.commit()
    db.refresh(user)
    return {"message": "User updated"}

# Delete current user
@app.delete("/profile")
def delete_user(user = Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user.id).first()
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted"}
# -------------------------

# --- Book endpoints ---
# GET all books
@app.get("/books", response_model=list[schemas.CompressedBookOut], dependencies=[Depends(auth.verify_token)])
def get_books(db: Session = Depends(get_db)):
    books = db.query(models.Book).all()
    if not books:
        raise HTTPException(status_code=404, detail="No books found")
    return books

# GET selected book
@app.get("/books/{book_id}", response_model=schemas.BookOut, 
         dependencies=[Depends(auth.verify_token)])
def get_book (book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

# GET all books added by current user
@app.get("/profile/books", response_model=list[schemas.CompressedBookOut])
def get_user_books(user = Depends(get_current_user), db: Session = Depends(get_db)):
    books = db.query(models.Book).filter(models.Book.creator_id == user.id).all()
    if not books:
        raise HTTPException(status_code=404, detail="No books found for this user")
    return books

# POST Book
@app.post("/books", dependencies=[Depends(auth.verify_token)])
def add_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    db_book = models.Book(
        creator_id = book.creator_id,
        title=book.title,
        author=book.author,
        Date_published=book.Date_published,
        Description=book.Description
    )
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return {"message": "Book added", "book_id": db_book.id}


# PUT Book created by current user
@app.put("/profile/books/{book_id}")
def update_book(book_id: int, updated_book: schemas.BookCreate,
                user = Depends(get_current_user), db: Session = Depends(get_db)):
    
    db_book = db.query(models.Book).filter(models.Book.id == book_id, 
                                           models.Book.creator_id == user.id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found or not owned by user")
    
    db_book.title = updated_book.title
    db_book.author = updated_book.author
    db_book.Date_published = updated_book.Date_published
    db_book.Description = updated_book.Description
    
    db.commit()
    db.refresh(db_book)
    return {"message": "Book updated"}


# DELETE Book created by current user
@app.delete("/profile/books/{book_id}")
def delete_book(book_id: int, user = Depends(get_current_user), db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id, 
                                           models.Book.creator_id == user.id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found or not owned by user")
    
    archived_book = models.BookArchive(
        creator_id=db_book.creator_id,
        title=db_book.title,
        author=db_book.author,
        Date_published=db_book.Date_published,
        Description=db_book.Description,
        Average_rating=db_book.Average_rating
    )
    db.add(archived_book)

    
    db.delete(db_book)
    db.commit()
    return {"message": "Book deleted"}

# ----------------------

# --- Review endpoints ---
# GET Reviews for a Book
@app.get("/books/{book_id}/reviews", response_model=list[schemas.ReviewOut], 
         dependencies=[Depends(auth.verify_token)])
def get_book_reviews(book_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.book_id == book_id).all()
    if not reviews:
        raise HTTPException(status_code=404, detail="No reviews found for this book")
    return reviews

# GET Reviews made by the current User
@app.get("/profile/reviews", response_model=list[schemas.ProfileReviewOut])
def get_user_reviews(user = Depends(get_current_user), db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.user_id == user.id).all()
    if not reviews:
        raise HTTPException(status_code=404, detail="No reviews found for this user")
    return reviews

# POST Review for a Book
@app.post("/books/{book_id}/reviews", dependencies=[Depends(auth.verify_token)])
def add_review(book_id: int, review: schemas.ReviewCreate, user = Depends(get_current_user), db: Session = Depends(get_db)):
    db_review = models.Review(
        user_id=user.id,
        book_id=book_id,
        content=review.content,
        rating=review.rating
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return {"message": "Review added", "review_id": db_review.id}

# PUT Review by current User
@app.put("/reviews/{review_id}")
def update_review(review_id: int, updated_review: schemas.ReviewCreate, 
                  user = Depends(get_current_user), db: Session = Depends(get_db)):
    
    db_review = db.query(models.Review).filter(models.Review.id == review_id, 
                                               models.Review.user_id == user.id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found or not owned by user")
    
    db_review.content = updated_review.content
    db_review.rating = updated_review.rating
    
    db.commit()
    db.refresh(db_review)
    return {"message": "Review updated"}

# Delete Review by current User
@app.delete("/reviews/{review_id}")
def delete_review(review_id: int, user = Depends(get_current_user), db: Session = Depends(get_db)):
    db_review = db.query(models.Review).filter(models.Review.id == review_id, 
                                               models.Review.user_id == user.id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found or not owned by user")
    
    # Archive the review before deletion
    archived_review = models.ReviewArchive(
        user_id=db_review.user_id,
        book_id=db_review.book_id,
        content=db_review.content,
        rating=db_review.rating
    )
    db.add(archived_review)
    
    db.delete(db_review)
    db.commit()
    return {"message": "Review deleted and archived"}
# ------------------------



    
