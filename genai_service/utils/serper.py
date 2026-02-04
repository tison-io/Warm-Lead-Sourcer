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


async def serper_search(keywords: str = "latest technology trends", country: str = "ke", page: int = 1) -> list[dict]:
    params = SerperSearchResult(keywords=keywords, country=country, page=page)
    def linkedin_query_builder() -> str:
        logger.info("Building LinkedIn-specific query for Serper search.")
        keyword_list = params.keywords.split()
        formatted_keywords = " AND ".join([f'"{k}"' for k in keyword_list])
        return f'site:linkedin.com/in/ {formatted_keywords} '
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

    try:
        logger.debug("Creating connection object for google.serper.dev.")
        google = http.client.HTTPSConnection("google.serper.dev", timeout=10)
    except Exception as e:
        logger.error("Error creating connection object: %s", e)
        raise  Exception(f"Failed to connect to Serper API: {e}") 
    
    try:
        logger.info("Preparing Serper search payload.")
        payload = json.dumps(query)
        logger.info("Serper search payload prepared: %s", payload)
    except Exception as e:
        logger.error("Error preparing Serper search payload: %s", e)
        raise Exception(f"Failed to prepare Serper search payload: {e}")
    
    try:
        logger.info("Getting Serper API key from environment variables.")
        SERPER_API_KEY = os.getenv("SERPER_API_KEY")

        if not SERPER_API_KEY:
            raise ValueError("SERPER_API_KEY environment variable is not set")
        logger.info("Making Serper search request.")
    except Exception as e:
        logger.error("Error retrieving Serper API key: %s", e)
        raise Exception(f"Failed to retrieve Serper API key: {e}")
    try:
        logger.info("Executing Serper search request")
        headers = {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
        }
        google.request("POST", "/search", payload, headers)
        res = google.getresponse()
        raw_data = res.read().decode("utf-8")
        if res.status >= 400:
            logger.error("Serper API error %d: %s", res.status, raw_data)
            raise Exception(f"Serper API returned {res.status}: {raw_data}")

        logger.info("Serper search request executed successfully.")
        json_data = json.loads(raw_data)
        warm_data = json_data.get("organic", [])
        logger.info("Generating roles and responsibilities for retrieved profiles.")
        discovered_roles = await profile_discovery(profile_snippets=warm_data)

        logger.info("Successfully discovered roles and responsibilities.")

        return discovered_roles
    except Exception as e:
        logger.error("Error executing Serper search request: %s", e)
        raise Exception(f"Failed to execute Serper search request: {e}")
    finally:
        google.close()
    

if __name__ == "__main__":
    import asyncio
    print(asyncio.run(serper_search(keywords="Jkuat Mechanical Engineering", country="ke", page=2)))
