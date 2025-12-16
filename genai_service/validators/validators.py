import re
from typing import List, Tuple

def validate_linkedin_url(url:str) -> bool:
    pattern = r'^https?://(www\.)?linkedin\.com/(in|company)/[\w\-]+/?$'
    return bool(re.match(pattern, url))

def validate_profile_urls(urls: List[str], max_count: int = 50) -> Tuple[bool, str]:
    """
    Validate list of profile URLs
    
    Returns:
        (is_valid, error_message)
    """
    if not urls:
        return False, "No URLs provided"
    
    if len(urls) > max_count:
        return False, f"Too many URLs (max: {max_count})"
    
    invalid_urls = [url for url in urls if not validate_linkedin_url(url)]
    
    if invalid_urls:
        return False, f"Invalid LinkedIn URLs: {invalid_urls[:3]}"
    
    return True, ""

def validate_keywords(keywords: List[str]) -> Tuple[bool, str]:
    """Validate keywords list"""
    if keywords and len(keywords) > 20:
        return False, "Too many keywords (max: 20)"
    
    return True, ""