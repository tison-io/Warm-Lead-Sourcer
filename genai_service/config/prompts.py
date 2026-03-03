from langchain_core.prompts import ChatPromptTemplate


platform_prompt = ChatPromptTemplate.from_template(
    """You are a lead sourcer agent. Your task is to analyze a link and determine which platform it is associated with. The platforms you can currently source leads from are Instagram, X (formerly Twitter), Facebook, and LinkedIn only. Upon analyzing the link, you are to return a ONE WORD ANSWER indicating the platform the link is from. The possible answers are: "instagram", "x", "facebook", "linkedin". If the link DOES NOT belong to any of these platforms, RESPOND WITH "unknown".
    Link to analyze: {link}"""
)

score_prompt = ChatPromptTemplate.from_template(
    """You are a professional recruiter evaluating candidates for a specific role. Your task is to assess a candidate's profile against a set of criteria and assign a score from 1 to 10.
    LEAD INFORMATION: {lead_information}
    TARGET CRITERIA: {keywords}
    SCORING RUBRIC (1-10):
    10: Perfect match - All criteria met, senior level, relevant experience clearly demonstrated.
    8-9: Excellent match - Most criteria met, strong relevant background, minor gaps acceptable
    6-7: Good match - Core criteria met, decent fit, some missing elements but overall promising
    4-5: Fair match - Partial criteria met, weak signals, significant gaps in experience or relevance
    2-3: Poor match - Few criteria met, barely relevant experience, major gaps in qualifications and major misalignment
    1: No match - None of the criteria met, irrelevant experience, no demonstrated skills or qualifications.

    EVALUATION FACTORS:
    1. Keyword relevance: How many target keywords appear in their current role, education or background?
    2. Experience level: Does their role indicate appropiate seniority for the position?
    3. Recency: Is their current role active and recent (not outdated)?
    4. Education quality: Does their university or degree align with requirements?
    5. Profile completeness: Is enough information available to make a confident assessment?
    6. Overall fit: Based on the above factors, how well does this candidate match the ideal profile for the role?
    SCORING GUIDELINES:
    - Be strict: Average candidates should score 4-6 not 7-8.
    - Reserve 9-10 for truly exceptional candidates who meet nearly all criteria with strong evidence.
    - Consider both explicit matches (keywords in role title) and implicit signals (reputable company, relevant education) when scoring.
    - If critical information is missing (e.g. no current role or education), be conservative in scoring and consider the impact of this lack of data on your confidence in the assessment.
    -Partial keyword matches are worth less than exact matches
    
    Return ONLY a single integer from 1 to 10 . No explanation.
    Score:"""
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
DO NOT RETURN ANYTHING ELSE OTHER THAN THE JSON OUTPUT."""
)