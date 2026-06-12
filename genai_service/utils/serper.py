from ..models.schemas import SerperSearchResult
from ..utils.llm_client import profile_discovery
from dotenv import load_dotenv
import http.client
import json
import logging
import os

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

load_dotenv()

class SerperAPIError(Exception):
    """Custom exception for Serper API failures"""
    pass

async def serper_search(keywords: str = "latest technology trends", country: str = "ke", page: int = 1) -> list[dict]:
    # Input Validation
    if not keywords or not keywords.strip():
        logger.warning("Search attempted with empty keywords.")
        return []

    params = SerperSearchResult(keywords=keywords, country=country, page=page)
    
    def linkedin_query_builder() -> str:
        logger.info("Building LinkedIn-specific query for Serper search.")
        keyword_list = params.keywords.split()
        formatted_keywords = " AND ".join([f'"{k}"' for k in keyword_list])
        return f'site:linkedin.com/in/ {formatted_keywords} {params.country}'

    try:
        logger.info("Building combined payload query.")
        query = {
                "q": linkedin_query_builder(), 
                "gl": params.country,
                "page": params.page
            } 
        logger.info("Combined payload query built successfully.")
    except Exception as e:
        logger.error("Error building combined payload query: %s", e)
        raise Exception(f"Failed to build combined payload query: {e}")

    conn = None
    try:
        logger.debug("Creating connection object for google.serper.dev.")
        conn = http.client.HTTPSConnection("google.serper.dev", timeout=10)
        
        logger.info("Getting Serper API key from environment variables.")
        SERPER_API_KEY = os.getenv("SERPER_API_KEY")

        if not SERPER_API_KEY:
            raise ValueError("SERPER_API_KEY environment variable is not set")
        
        logger.info("Preparing Serper search payload.")
        payload = json.dumps(query)
        
        logger.info("Executing Serper search request")
        headers = {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
        }
        conn.request("POST", "/search", payload, headers)
        res = conn.getresponse()
        raw_data = res.read().decode("utf-8")

        # Specific HTTP Error Handling
        if res.status == 401:
            raise SerperAPIError("Unauthorized: Check your Serper API Key.")
        if res.status == 429:
            raise SerperAPIError("Rate Limit Exceeded: You are making too many requests to Serper.")
        if res.status >= 500:
            raise SerperAPIError("Serper Server Error: The search engine is down.")
        if res.status >= 400:
            logger.error("Serper API error %d: %s", res.status, raw_data)
            raise SerperAPIError(f"Serper API returned {res.status}: {raw_data}")

        logger.info("Serper search request executed successfully.")
        
        try:
            json_data = json.loads(raw_data)
        except json.JSONDecodeError:
            raise SerperAPIError("Invalid JSON received from Serper API.")

        warm_data = json_data.get("organic", [])
        
        if not warm_data:
            logger.warning("Serper returned 0 results.")
            return []

        logger.info("Generating roles and responsibilities for retrieved profiles.")
        try:
            discovered_roles = await profile_discovery(profile_snippets=warm_data)
        except Exception as e:
            logger.error(f"Profile discovery failed: {e}")
            raise SerperAPIError(f"Failed to process profiles: {e}")

        logger.info("Successfully discovered roles and responsibilities.")

        return discovered_roles

    except (OSError, TimeoutError) as e:
        logger.error(f"Connection error: {e}")
        raise SerperAPIError(f"Cannot connect to Serper API: {e}")
    except SerperAPIError as e:
        logger.error(f"Serper API Failure: {e}")
        raise
    except Exception as e:
        logger.error("Error executing Serper search request: %s", e)
        raise SerperAPIError(f"Failed to execute Serper search request: {e}") from e
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    import asyncio
    print(asyncio.run(serper_search(keywords="Jkuat Mechanical Engineering", country="ke", page=2)))