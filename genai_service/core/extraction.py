import asyncio
import json
import logging
import re
from typing import Dict, List
import os
import sys
from utils.llm_client import LLMClient
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.schemas import ExtractedFields

logger = logging.getLogger(__name__)


class FieldExtractor:
    def __init__(self):
        self.llm = LLMClient()
        logger.info("FieldExtractor initialized")
    
    async def extract_fields(self, profile_text: str) -> ExtractedFields:
        """Extract fields from LinkedIn profile text using rules + LLM fallback
        
        Example:
            profile = '''
            John Kamau
            Data Scientist at Safaricom PLC
            Nairobi, Kenya
            Education: University of Nairobi - Computer Science
            '''
            result = await extractor.extract_fields(profile)
            # result.role = "Data Scientist"
            # result.university = "University of Nairobi"
        """
        try:
            text = self._clean(profile_text)
            data = self._extract_with_rules(text)
            
            if not data.get('role') or not data.get('university'):
                logger.info("Using LLM for missing fields")
                llm_data = await self._extract_with_llm(text)
                data = {**llm_data, **{k: v for k, v in data.items() if v}}  # Merge, prefer rules
            
            data = self._validate(data, text)
            
            result = ExtractedFields(**data)
            logger.info(f"Extracted: role={result.role}, uni={result.university}")
            return result
            
        except Exception as e:
            logger.exception(f"Extraction failed: {e}")
            return ExtractedFields()
    
    def _clean(self, text: str) -> str:
        if not text:
            return ""
        text = re.sub(r'<[^>]+>', '', text)  # Removes HTML
        text = " ".join(text.split())  # Normalize whitespace
        return text[:3000]  # Limit length
    
    def _extract_with_rules(self, text: str) -> Dict:
        data = {'role': None, 'university': None, 'country': None, 'raw_location': None}
        
        name_match = re.search(r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*\n', text)
        extracted_name = name_match.group(1).strip() if name_match else None
        
        role_patterns = [
            r'\n([A-Z][A-Za-z\s&,-]+?)\s+at\s+[A-Z]',  # "Software Engineer at Safaricom"
            r'\n([A-Z][A-Za-z\s&,-]+?)\s+@\s+[A-Z]',   # "Data Analyst @ Equity Bank"
        ]
        
        for pattern in role_patterns:
            role_match = re.search(pattern, text)
            if role_match:
                potential_role = role_match.group(1).strip()
                if (extracted_name and potential_role != extracted_name and 
                    5 < len(potential_role) < 50):
                    data['role'] = potential_role
                    break
        
        if not data['role']:
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            if len(lines) >= 2:
                second_line = lines[1]
                if (len(second_line) < 50 and 
                    not re.search(r'\d{4}', second_line) and  
                    ',' not in second_line and  
                    'University' not in second_line and
                    'College' not in second_line):
                    data['role'] = second_line
        
        uni_patterns = [
            r'University of ([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',  
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+University',   
            r'(JKUAT|UoN|KU|USIU|Strathmore|Moi University|Kenyatta University)',  
            r'(MIT|Stanford|Harvard|Cambridge|Oxford)\b',  
        ]
        
        for pattern in uni_patterns:
            uni_match = re.search(pattern, text, re.IGNORECASE)
            if uni_match:
                university_text = uni_match.group(0).strip()
                university_text = re.split(r'\s*[-–—,]\s*', university_text)[0].strip()
                data['university'] = self._expand_uni(university_text)
                break
        
        loc_patterns = [
            r'(Nairobi|Mombasa|Kisumu|Nakuru|Eldoret|Thika|Kakamega),?\s*(Kenya|KE)',  # City, Country
            r'([A-Z][a-z]+),\s*(Kenya|KE)\b',  
        ]
        
        for pattern in loc_patterns:
            loc_match = re.search(pattern, text)
            if loc_match:
                location = loc_match.group(0).strip()
                data['raw_location'] = location
                if 'Kenya' in location or 'KE' in location:
                    data['country'] = 'Kenya'
                else:
                    parts = location.split(',')
                    if len(parts) >= 2:
                        data['country'] = parts[-1].strip()
                break
        
        return data
    
    def _expand_uni(self, uni: str) -> str:
        """Expand university abbreviations for Kenyan and international universities
        
        Examples:
            "UoN" -> "University of Nairobi"
            "JKUAT" -> "Jomo Kenyatta University of Agriculture and Technology"
            "MIT" -> "Massachusetts Institute of Technology"
        """
        abbrevs = {
            'UoN': 'University of Nairobi',
            'JKUAT': 'Jomo Kenyatta University of Agriculture and Technology',
            'KU': 'Kenyatta University',
            'USIU': 'United States International University',
            'Moi University': 'Moi University',
            'MIT': 'Massachusetts Institute of Technology',
            'Oxford': 'University of Oxford',
            'Cambridge': 'University of Cambridge',
        }
        
        uni_lower = uni.lower()
        for abbrev, full in abbrevs.items():
            if abbrev.lower() == uni_lower or abbrev.lower() in uni_lower:
                return full
        
        # Ensure "University" is included if not already
        if 'university' not in uni_lower and 'institute' not in uni_lower and 'college' not in uni_lower:
            return f"{uni} University"
        
        return uni
    
    async def _extract_with_llm(self, text: str) -> Dict:
    
        try:
            prompt = f"""Extract information from this LinkedIn profile. Focus on accuracy.

Profile Text:
{text}

Return ONLY valid JSON with these exact fields:
{{
  "role": "current job title only (e.g., 'Software Engineer', 'Data Analyst') or null",
  "university": "full university name (e.g., 'University of Nairobi', 'Strathmore University') or null",
  "country": "country name (e.g., 'Kenya', 'Uganda') or null",
  "raw_location": "city and country (e.g., 'Nairobi, Kenya') or null"
}}

Rules:
- Extract ONLY information that is clearly stated in the text
- Do NOT include company names in the role field
- Do NOT include degree programs or majors in the university field
- Do NOT include person's name in the role field
- Return null if information is not found
- Expand abbreviations (UoN -> University of Nairobi)"""
            
            response = await self.llm.call(prompt, temperature=0.1, json_mode=True)
            extracted = self.llm.parse_json_response(response)
            
            if extracted.get('role'):
                role = extracted['role']
                role = re.sub(r'\bat\b.*$', '', role, flags=re.IGNORECASE).strip()
                role = re.sub(r'\b@\b.*$', '', role, flags=re.IGNORECASE).strip()
                extracted['role'] = role
            
            if extracted.get('university'):
                uni = extracted['university']
                uni = re.split(r'\s*[-–—,]\s*', uni)[0].strip()
                extracted['university'] = uni
            
            return extracted
        except Exception as e:
            logger.error(f"LLM extraction failed: {e}")
            return {}
    
    def _validate(self, data: Dict, source: str) -> Dict:
        validated = {}
        source_lower = source.lower()
        
        for field, value in data.items():
            if not value:
                validated[field] = None
                continue
            
            value_lower = value.lower()
            
            if value_lower in source_lower:
                validated[field] = value
            elif field == 'university':
                key_words = [w for w in value_lower.split() 
                           if len(w) > 3 and w not in ['university', 'institute', 'college', 'of', 'and', 'the']]
                if any(word in source_lower for word in key_words):
                    validated[field] = value
                else:
                    logger.warning(f"University '{value}' not validated in source")
                    validated[field] = None
            elif field == 'country':
                if 'kenya' in value_lower or value_lower == 'ke':
                    validated[field] = 'Kenya' if 'kenya' in source_lower or 'ke' in source_lower else None
                else:
                    country_parts = value_lower.split()
                    if any(part in source_lower for part in country_parts if len(part) > 3):
                        validated[field] = value
                    else:
                        validated[field] = None
            elif field == 'role':
                role_words = [w for w in value_lower.split() if len(w) > 3]
                if any(word in source_lower for word in role_words):
                    validated[field] = value
                else:
                    validated[field] = None
            else:
                validated[field] = None
        
        return validated
    
    async def extract_batch(self, profiles: List[str]) -> List[ExtractedFields]:
       
        tasks = [self.extract_fields(text) for text in profiles]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return [r for r in results if isinstance(r, ExtractedFields)]


async def enrich_from_linkedin(raw_profile: Dict) -> Dict:
    from genai_service.core.enrichment_service import email_generator
    
    try:
        extractor = FieldExtractor()
        extracted = await extractor.extract_fields(str(raw_profile))
        
        enriched = {
            'name': raw_profile.get('name', ''),
            'linkedin_url': raw_profile.get('url', ''),
            'current_role': extracted.role or '',
            'education': extracted.university or '',
            'country': extracted.country or '',
            'email': '',
            'score': 0
        }
        
        if enriched['name'] and enriched['education']:
            enriched['email'] = email_generator(enriched)
        
        return enriched
    except Exception as e:
        logger.exception(f"Enrichment error: {e}")
        return {}


# Tests
async def test():
    """Test extraction with Kenyan profile examples"""
    extractor = FieldExtractor()
    
    print("\n" + "="*50)
    print("TEST 1: Standard LinkedIn Profile")
    print("="*50)
    sample1 = """
    Ushindi Sidi
    Software Engineer at TechCorp
    Nairobi, Kenya
    
    Education:
    University of Nairobi
    Information Science
    """
    
    result1 = await extractor.extract_fields(sample1)
    print(f"\nInput: {sample1.strip()}")
    print(f"\nExtraction Results:")
    print(f"  Name: Ushindi Sidi (from context)")
    print(f"  Role: {result1.role}")
    print(f"  University: {result1.university}")
    print(f"  Country: {result1.country}")
    print(f"  Location: {result1.raw_location}")
    
    print("\n" + "="*50)
    print("TEST 2: Different Format")
    print("="*50)
    sample2 = """
    Mary Wanjiku
    Data Analyst @ Safaricom PLC
    Nairobi, Nairobi County, Kenya
    
    Strathmore University - Bachelor of Business IT
    2018-2022
    """
    
    result2 = await extractor.extract_fields(sample2)
    print(f"\nInput: {sample2.strip()}")
    print(f"\nExtraction Results:")
    print(f"  Name: Mary Wanjiku (from context)")
    print(f"  Role: {result2.role}")
    print(f"  University: {result2.university}")
    print(f"  Country: {result2.country}")
    print(f"  Location: {result2.raw_location}")
    
    print("\n" + "="*50)
    print("TEST 3: Abbreviated University")
    print("="*50)
    sample3 = """
    James Omondi
    DevOps Engineer at Equity Bank
    Mombasa, Kenya
    
    JKUAT - Computer Science
    """
    
    result3 = await extractor.extract_fields(sample3)
    print(f"\nInput: {sample3.strip()}")
    print(f"\nExtraction Results:")
    print(f"  Name: James Omondi (from context)")
    print(f"  Role: {result3.role}")
    print(f"  University: {result3.university}")
    print(f"  Country: {result3.country}")
    print(f"  Location: {result3.raw_location}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test())