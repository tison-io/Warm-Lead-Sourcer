import logging
import asyncio
import re
from typing import Dict, Any, Optional, List
from genai_service.utils.llm_client import LLMClient
from genai_service.models.schemas import ExtractedFields
logger = logging.getLogger(__name__)

class FieldExtractor:
   def __init__(self):
      self.llm_client = LLMClient()
      logger.info(f"FieldExtractor ready with {self.llm_client.provider}")

   async def extract_fields(self, profile_text: str, platform: str = "linkedim") -> ExtractedFields:
      try:
         logger.info(f"Extracting from {platform} profile ({len(profile_text)} chars)")
         cleaned = self._clean_text(profile_text)
         extracted = self._extract_with_rules(cleaned)
         
         if self._has_missing_fields(extracted):
            logger.info("Missing fields detected, using LLM")
            llm_data = await self._extract_with_llm(cleaned, platform)
            extracted = self._merge_results(extracted, llm_data)
         
         validated = self._validate_against_source(extracted, cleaned)
         
         result = ExtractedFields(**validated)
         logger.info(f"✓ Extracted: role={result.role}, uni={result.university}")
         return result
         
      except Exception as e:
         logger.exception(f"Extraction failed: {e}")
         return ExtractedFields()
      
      def _clean_text(self, text: str) -> str:
        """Remove junk, normalize whitespace"""
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Normalize whitespace
        text = " ".join(text.split())
        
        # Limit length (avoid token limits)
        if len(text) > 3000:
            text = text[:3000]
        
        return text
      def _extract_with_rules(self, text: str) -> Dict:
        """
        Fast regex-based extraction. Handles 70-80% of cases without LLM.
        """
        extracted = {
            'role': None,
            'university': None,
            'country': None,
            'raw_location': None
        }
        
        # Extract role
        role_patterns = [
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:at|@)\s+([A-Z][\w\s&]+)',  
            r'Current[:\s]+([^\n,]+)',
            r'Position[:\s]+([^\n,]+)',]
        for pattern in role_patterns:
           match = re.search(pattern, text)
           if match:
                ocation = match.group(1).strip()
                extracted['raw_location'] = location
                extracted['country'] = self._extract_country(location)
                break
        
        logger.debug(f"Rule extraction: {extracted}")
        return extracted
      def _expand_university(self, uni: str) -> str:
        """Expand common university abbreviations"""
        # Remove prefixes
        uni = re.sub(r'^(at|from|studied at)\s+', '', uni, flags=re.IGNORECASE).strip()
        
        # Common abbreviations
        abbrevs = {
            'UoN': 'University of Nairobi',
            'JKUAT': 'Jomo Kenyatta University of Agriculture and Technology',
        }
        for abbrev, full_name in abbrevs.items():
            if abbrev.lower() in uni.lower():
                return full_name
        
        return uni
    
def _extract_country(self, location: str) -> Optional[str]:
    """Extract country from location string"""
    countries = [
        'Kenya', 'Nigeria', 'South Africa'
    ]
    location_lower = location.lower()
        
    for country in countries:
            if country.lower() in location_lower:
                # Normalize
                if country in ['USA', 'US']:
                    return 'United States'
                if country in ['UK']:
                    return 'United Kingdom'
                return country
        
        # Country is often last part after comma
    parts = [p.strip() for p in location.split(',')]
    if len(parts) >= 2:
        return parts[-1]
    
    return None
##FALLBACK 
    def _has_missing_fields(self, extracted: Dict) -> bool:
        """Check if any key fields are missing"""
        async def _extract_with_llm(self, text: str, platform: str) -> Dict:
            try:
                