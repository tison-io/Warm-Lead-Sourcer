from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import logging
import os
from ..config.prompts import platform_prompt, score_prompt, role_extraction_prompt

load_dotenv()
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

DEFAULT_GENERAL_MODEL = "llama-3.3-70b-versatile"
DEFAULT_CORE_MODEL = "llama-3.3-70b-versatile"
DEFAULT_FALLBACK_MODEL ="llama-3.1-8b-instant"

try:
    logger.info("Setting up main Groq LLM model.")
    general_model_name = os.getenv("GENERAL_MODEL", DEFAULT_GENERAL_MODEL)
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY is not set in environment variables")
    
    general_model = ChatGroq(model=general_model_name, api_key=groq_api_key)
    logger.info(f"Successfully set up general model: {general_model_name}")
except Exception as e:
    logger.exception("Failed to set up general model. Switching to Fallback model")
    fallback_model_name = os.getenv("FALLBACK_MODEL", DEFAULT_FALLBACK_MODEL)
    general_model = ChatGroq(model=fallback_model_name, api_key=os.getenv("GROQ_API_KEY"))
    logger.info(f"Using fallback model: {fallback_model_name}")

try:
    logger.info("Setting up Groq LLM models.")
    core_model_name = os.getenv("CORE_MODEL", DEFAULT_CORE_MODEL)
    core_model = ChatGroq(model=core_model_name, api_key=os.getenv("GROQ_API_KEY"))
    logger.info(f"Successfully set up core logic model: {core_model_name}")
except Exception as e:
    logger.exception("Failed to set up core logic model. Switching to general model")
    core_model = general_model
    logger.info("Using general model as core model")


async def platform_detection(link: str) -> str:
    """Detect platform from URL"""
    try:
        platform_chain = platform_prompt | core_model | StrOutputParser()
        platform = await platform_chain.ainvoke({"link": link})
        logger.info("Detected platform: %s", platform)
        return platform.lower().strip()
    except Exception as e:
        logger.exception("Error detecting platform: %s", e)
        return "unknown"


async def calculate_score(profile: dict, criteria: list) -> int:
    """Calculate lead score (1-10) using LangChain chain"""
    try:        
        score_chain = score_prompt | core_model | StrOutputParser()
        result = await score_chain.ainvoke({
            "lead_information": str(profile),
            "keywords": criteria
        })
        return result.strip()
    except Exception as e:
        logger.exception(f"Error calculating score: {e}")
        return 5

async def profile_discovery(profile_snippets: list[dict]) -> dict | str:
    """Extract roles and responsibilities from profile snippet"""
    try:
        role_chain = role_extraction_prompt | core_model | JsonOutputParser()
        logger.info(f"Extracting roles from {len(profile_snippets)} profile snippets...")
        result = await role_chain.ainvoke({
            "profile_snippet": profile_snippets
        })
        return result
    except Exception as e:
        logger.exception(f"Error extracting roles: {e}")
        return "Role not found"

    