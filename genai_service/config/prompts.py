from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.schemas import LeadScoreOutput


parser = JsonOutputParser(pydantic_object=LeadScoreOutput)
format_instructions = parser.get_format_instructions()

platform_prompt = ChatPromptTemplate.from_template(
    """You are a lead sourcer agent. Your task is to analyze a link and determine which platform it is associated with. The platforms you can currently source leads from are Instagram, X (formerly Twitter), Facebook, and LinkedIn only. Upon analyzing the link, you are to return a ONE WORD ANSWER indicating the platform the link is from. The possible answers are: "instagram", "x", "facebook", "linkedin". If the link DOES NOT belong to any of these platforms, RESPOND WITH "unknown".
    Link to analyze: {link}"""
)

score_prompt = ChatPromptTemplate.from_template(
    """You are a lead scoring agent. Your task is to analyze the provided lead information and assign a lead score based on the following criteria: 
    Compare the keywords and filter parameters with the lead information.
    Assign only an integer score from 1 to 10, where 1 indicates a low-quality lead and 10 indicates a high-quality lead.
    Consider factors such as relevance to the specified keywords, completeness of information, and alignment with the filter parameters.
    
    Lead information: {lead_information}
    keywords and filters: {keywords}
    
    CRITICAL: Return ONLY the integer number (e.g., 7). Do not output any text, explanation, or punctuation."""
)

EXTRACTION_PROMPT = """Extract from this LinkedIn profile:

{profile_text}

Return ONLY JSON:
{{
  "role": "job title or null",
  "university": "university name or null",
  "country": "country or null",
  "raw_location": "location or null"
}}

Rules: Use only visible info, return null if not found, expand abbreviations (MIT → Massachusetts Institute of Technology)."""