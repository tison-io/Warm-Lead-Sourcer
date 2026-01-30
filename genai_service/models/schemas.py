from typing import Optional, List
from pydantic import BaseModel

class GeneralProfile(BaseModel):
    """General profile structure for existing code"""
    name: str
    linkedin_url: Optional[str] = None
    current_role: Optional[str] = None
    education: Optional[str] = None
    country: Optional[str] = None
    email: Optional[str] = None
    score: int = 0


class GeneratedExtractorProfile(BaseModel):
    profiles: List[GeneralProfile]


class IGComment(BaseModel):
    username: str
    text: str
    timestamp: str


class IGPostScrape(BaseModel):
    url: str
    owner_username: str
    likes_count: int
    comments_count: int
    top_comments: List[IGComment]
    image_description: Optional[str] = None


class SerperSearchResult(BaseModel):
    keywords: str
    country: str
    page: int


class UserInput(BaseModel):
    post_url: Optional[str] = None
    keywords: Optional[str] = None
    country: Optional[str] = None
    page: Optional[int] = 1

class ErrorHandling(BaseModel):
    error_code: int
    error_message: str

