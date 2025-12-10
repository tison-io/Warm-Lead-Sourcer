from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from ..models.schemas import LeadScoreOutput

parser = JsonOutputParser(pydantic_object=LeadScoreOutput)
format_instructions = parser.get_format_instructions()

platform_prompt = ChatPromptTemplate.from_template(
    """You are a lead sourcer agent. Your task is to analyze a link and determine which platform it is associated with. The platforms you can currently source leads from are Instagram, X (formerly Twitter), Facebook, and LinkedIn only. Upon analyzing the link, you are to return a ONE WORD ANSWER indicating the platform the link is from. The possible answers are: "instagram", "x", "facebook", "linkedin". If the link DOES NOT belong to any of these platforms, RESPOND WITH "unknown".
    Link to analyze: {link}"""
    )

score_prompt = ChatPromptTemplate.from_template("""
        You are a lead scoring agent. Your task is to analyze the provided lead information and assign a lead score based on the following criteria: 
                                                Compare the keywords and filter parameters with the lead information.
                                                Assign a score from 1 to 10, where 1 indicates a low-quality lead and 10 indicates a high-quality lead.
                                                Consider factors such as relevance to the specified keywords, completeness of information, and alignment with the filter parameters.
                                                Provide a brief explanation for the assigned score
                                                Lead information: {lead_information}
                                                keywords and filters: {keywords}
""")