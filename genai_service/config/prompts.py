from langchain_core.prompts import ChatPromptTemplate


platform_prompt = ChatPromptTemplate.from_template(
    """You are a lead sourcer agent. Your task is to analyze a link and determine which platform it is associated with. The platforms you can currently source leads from are Instagram, X (formerly Twitter), Facebook, and LinkedIn only. Upon analyzing the link, you are to return a ONE WORD ANSWER indicating the platform the link is from. The possible answers are: "instagram", "x", "facebook", "linkedin". If the link DOES NOT belong to any of these platforms, RESPOND WITH "unknown".
    Link to analyze: {link}"""
)

score_prompt = ChatPromptTemplate.from_template(
    """You are a lead scoring agent. Your task is to analyze the provided lead information and assign a lead score based on the following criteria: 
    Compare the keywords and filter parameters with the lead information.
    Assign only an integer score from 1 to 10, where 1 indicates a low-quality lead and 10 indicates a high-quality lead.
    Consider factors such as relevance to the specified keywords, timeliness, completeness of information, and alignment with the filter parameters.
    Ensure you deeply and thoroughly analyze the provided raw data against the requirements and give a very accurate score.
    Lead information: {lead_information}
    keywords and filters(Can also include a brief summary of the lead generated): {keywords}
    You are to be very critical and strict in your scoring. Really analyze the lead as per technology human resource sourcing standards. Select a very thorough score that reflects the lead quality. Not all leads should get high scores. Be very thorough and analyze the best of the best.

   Return the result as a single integer score ONLY. For example: 7"""
)

role_extraction_prompt = ChatPromptTemplate.from_template("""
You are a highly precise Data Extraction Assistant. Your task is to process a list of LinkedIn search results and extract structured, clean profile data.

1. **Name Normalization**: Remove prefixes (Dr., Eng.) or suffixes (| LinkedIn, - Kenya).
2. **Current Role Reconstruction**: Many roles are truncated (ending in "..."). Use the "Snippet" field to find the full job title or current employer.
3. **Location & Country**: Look for city/country names in the snippet (e.g. "Nairobi" -> Country: "Kenya").
4. **Education**: Look for university names or abbreviations (e.g. "JKUAT", "UoN", "Moi University").
5. **Clean Output**: Return only valid JSON.

### INPUT DATA
{profile_snippet}

### JSON FORMAT
Return a JSON array of objects with these keys:
- "name": Normal full name without extra tags.
- "raw_name": Full name exactly as it appears.
- "current_role": Clean, non-truncated professional title.
- "company": Extract the company name if available (e.g. "Safaricom"). Return null if not found.
- "education": Extract the university or school name. Return null if not found.
- "degree": Extract the degree name if available (e.g. "Bachelor of Science in Computer Science"). Return null if not found.                                               
- "country": Infer the country based on the location (e.g. "Kenya"). Return null if not found.
- "linkedin_url": The provided LinkedIn URL.

YOU ARE ONLY REQUIRED TO RETURN JSON OUTPUT IN THE FOLLOWING FORMAT:
[
{{
    "name": "Full Name Cleaned",
    "raw_name": "Full Name Raw",
    "current_role": "Software Engineer",
    "company": "Company Name",
    "education": "University Name",
    "degree": "Degree name"
    "country": "Kenya",
    "linkedin_url": "https://www.linkedin.com/in/..."
}}
] 
ENSURE THE OUTPUT IS VALID JSON.
DO NOT RETURN ANYTHING ELSE OTHER THAN THE JSON OUTPUT.""")