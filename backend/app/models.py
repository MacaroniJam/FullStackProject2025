import datetime
from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, Float
from sqlalchemy.orm import relationship
from .database import Base

# Standard User model, no admins
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

# Book model to store book details
# No admin users to add books
# If book doesn't exist, user adds it
class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey('users.id'))
    title = Column(String, nullable=False, index=True)
    author = Column(String, nullable=False)
    Date_published = Column(Date, nullable=False)
    Description = Column(String, nullable=True)
    Average_rating = Column(Float, nullable=True)
    user = relationship("User")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id  = Column(Integer, ForeignKey('users.id'))
    book_id = Column(Integer, ForeignKey('books.id'))
    date = Column(Date, default=datetime.date.today)
    time = Column(Time, default=lambda: datetime.datetime.now(datetime.timezone.utc).time())
    content = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)
    user = relationship("User")
    book = relationship("Book")

class BookArchive(Base):
    __tablename__ = "book_archives"
    id = Column(Integer, primary_key=True, index=True)
    archived_date = Column(Date, default=datetime.date.today)
    archived_time = Column(Time, default=lambda: datetime.datetime.now(datetime.timezone.utc).time())
    creator_id = Column(Integer)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    Date_published = Column(Date, nullable=False)
    Description = Column(String, nullable=True)
    Average_rating = Column(Integer, nullable=True)

class ReviewArchive(Base):
    __tablename__ = "review_archives"

    id = Column(Integer, primary_key=True, index=True)
    user_id  = Column(Integer)
    book_id = Column(Integer)
    date = Column(Date, default=datetime.date.today)
    time = Column(Time, default=lambda: datetime.datetime.now(datetime.timezone.utc).time())
    content = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)


