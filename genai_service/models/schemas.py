from typing import Optional, List
from pydantic import BaseModel, Field, validator, field_validator
from datetime import datetime
from enum import Enum

class EngagementSource(str, Enum):
    '''type of engagement'''
    reaction = "reaction"
    comment = "comment"


# Email pattern schema
class EmailPattern(BaseModel):
    '''unverified emaail pattern guessed by LLM'''
    pattern: str 
    confidence: float = Field(ge=0.0, le=1.0)
    verified: bool = False

    class Config:
        json_schema_extra = {
            "example": {
                "pattern": "johndoe@students.uonbi.ac.ke",
                "confidence": 0.7,
                "verified": False
            }
        }


# after extraction, immediate schema
class ExtractedFields(BaseModel):
    '''fields extracted by LLM from raw profile text'''
    role: Optional[str] = None
    university: Optional[str] = None
    country: Optional[str] = None
    raw_location: Optional[str] = None

    @field_validator('role', 'university', 'country')
    @classmethod
    def strip_whitespace(cls, v):
        return v.strip() if v else None

#output schema to backend
class EnrichedProfile(BaseModel):
    '''Enriched profile data after LLM processing'''
    engagement_id: str
    name: Optional[str] = None
    linkedIn_url: str
    role: Optional[str]= None
    university: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    guessed_emails: List[EmailPattern] = Field(default_factory=list)
    score: int = Field(ge=0, le=100, default=0)
    processing_time_ms: Optional[int] = None

    class Config:
        json_schema_extra = {
            "example": {
                "engagement_id": "eng_12345",
                "name": "John Doe",
                "linkedIn_url": "https://www.linkedin.com/in/johndoe/",
                "role": "Software Engineer at Microsoft",
                "university": "University of Nairobi",
                "city": "Nairobi",
                "country": "Kenya",
                "guessed_emails": [
                    {
                        "pattern": "johndoe@students.uonbi.ac.ke",
                        "confidence": 0.7,
                        "verified": False
                    }
                ],
                "score": 85,
                "enriched_at": "2024-01-15T10:30:00Z",
                "processing_time_ms": 1234
            }
        }


class ValidationResult(BaseModel):
    '''Result of validation checks'''
    is_valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)



                             
