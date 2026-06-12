from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import logging
import os
import asyncio
import re  
from config.prompts import platform_prompt, score_prompt, role_extraction_prompt

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
    logger.info("Setting up main Groq LLM models.")
    general_model_name = os.getenv("GENERAL_MODEL", DEFAULT_GENERAL_MODEL)
    core_model_name = os.getenv("CORE_MODEL", DEFAULT_CORE_MODEL)
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY is not set in environment variables")
    
    general_model = ChatGroq(model=general_model_name, api_key=groq_api_key)
    core_model = ChatGroq(model=core_model_name, api_key=groq_api_key)
    logger.info(f"Successfully set up core logic model: {core_model_name}")
    logger.info(f"Successfully set up general model: {general_model_name}")
except Exception as e:
    logger.exception("Failed to set up general models. Switching to Fallback model")
    fallback_model_name = os.getenv("FALLBACK_MODEL", DEFAULT_FALLBACK_MODEL)
    general_model = ChatGroq(model=fallback_model_name, api_key=os.getenv("GROQ_API_KEY"))
    logger.info(f"Using fallback model: {fallback_model_name}")


class LLMError(Exception):
    pass

async def platform_detection(link: str) -> str: # To determine whether it will remain or be done away with
    """Detect platform from URL with error safety."""
    try:
        if not link:
            raise LLMError("No link provided for platform detection.")
        platform_chain = platform_prompt | core_model | StrOutputParser()
        platform = await platform_chain.ainvoke({"link": link})
        logger.info("Detected platform: %s", platform)
        return platform.lower().strip()
    except Exception as e:
        logger.error("Error detecting platform: %s", e)
        return "unknown"


async def calculate_score(profile: dict, criteria: list) -> int:
    """Calculate lead score (1-10) using bounded regex extraction."""
    try:        
        score_chain = score_prompt | core_model | StrOutputParser()
        result = await score_chain.ainvoke({
            "lead_information": str(profile),
            "keywords": criteria
        })
        match = re.search(r"\b(10|[1-9])\b", result)

        if match:
            score = int(match.group(1))
        else:
            logger.warning(f"Could not parse valid score token from AI response: '{result}'. Defaulting to 5.")
            score = 5
        
        return max(1, min(10, score))
        
    except Exception as e:
        logger.exception(f"Error calculating score: {e}")
        return 5

async def profile_discovery(profile_snippets: list[dict]) -> list[dict]:
    """
    Extract roles from profile snippets using batch processing.
    Now processes safely in chunks to avoid Token Limit errors.
    """
    if not profile_snippets:
        return []

    batch_size = 5  # Process 5 profiles at a time 
    all_results = []
    
    # Create batches
    batches = [profile_snippets[i:i + batch_size] for i in range(0, len(profile_snippets), batch_size)]
    
    logger.info(f"Processing {len(profile_snippets)} profiles in {len(batches)} batches.")

    async def process_batch(batch, batch_index):
        """Helper to process a single batch"""
        try:
            role_chain = role_extraction_prompt | core_model | JsonOutputParser()
            result = await role_chain.ainvoke({"profile_snippet": batch})
            
            # Ensure result is a list
            if isinstance(result, list):
                return result
            elif isinstance(result, dict):
                return [result]
            else:
                logger.warning(f"Batch {batch_index}: Unexpected return type from AI.")
                return []
                
        except Exception as e:
            logger.error(f"Error processing batch {batch_index}: {e}")
            return [] # Return empty list on failure so other batches survive

    # Run all batches concurrently
    tasks = [process_batch(batch, idx) for idx, batch in enumerate(batches)]
    batch_results = await asyncio.gather(*tasks)

    # Flatten the list of lists
    for batch_result in batch_results:
        all_results.extend(batch_result)

    return all_results