from pydantic import BaseModel
from datetime import date, time

# -- User Schemas --
# User Creation Schema
# Used for Login and Signup
class UserCreate(BaseModel):
    username: str
    password: str

# User Output Schema
# Used for profile display
class UserOut(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


# -- Book Schemas --
# Book Creation
# Used when a user adds a new book
class BookCreate(BaseModel):
    title: str
    author: str
    Date_published: str
    Description: str | None = None


# Book Output Schema
# Used when displaying book details
class BookOut(BaseModel):
    id: int
    creator_id: int
    title: str
    author: str
    Date_published: date
    Description: str | None = None
    Average_rating: float | None = None

    class Config:
        from_attributes = True

# Used when displaying a list of books
class CompressedBookOut(BaseModel):
    id: int
    title: str
    author: str
    Date_published: date
    Average_rating: float | None = None

    class Config:
        from_attributes = True

# -- Review Schemas --
# Review Creation Schema
# Used when a user adds a review for a book
class ReviewCreate(BaseModel):
    content: str
    rating: int

# Review Output Schema
# Used in showing reviews for a book
class ReviewOut(BaseModel):
    id: int
    user_id: int
    user: UserOut
    book_id: int
    date: date
    time: time
    content: str
    rating: int

    class Config:
        from_attributes = True

# Used in showing reviews in user profile
class ProfileReviewOut(BaseModel):
    id: int
    book: CompressedBookOut
    date: date
    time: time
    content: str
    rating: int

    class Config:
        from_attributes = True


