from typing import Optional, List
from pydantic import BaseModel

class EnrichmentRequest(BaseModel):
    links: List[str]


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

