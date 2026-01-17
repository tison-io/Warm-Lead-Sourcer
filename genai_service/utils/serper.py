from ..models.schemas import SerperSearchResult
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

def get_user_parameters(
    keywords: str | None = None,
    country: str = "us",
    pages: int = 1
) -> SerperSearchResult:
    """
    Get search parameters. Falls back to defaults if not provided.
    """
    return SerperSearchResult(
        keywords=keywords or "latest technology trends",
        country=country,
        pages=pages
    )

def serper_search():
    params = get_user_parameters()
    def linkedin_query_builder(keywords: str, country: str) -> str:
        logger.info("Building LinkedIn-specific query for Serper search.")
        keyword_list = keywords.split()
        formatted_keywords = " AND ".join(keyword_list)
        return f'site:linkedin.com/in/ {formatted_keywords} {country}'
    try:
        logger.info("Building combined payload query.")
        queries = [
            # General query
            {
            "q": params.keywords, 
            "gl": params.country, 
            "page": params.pages
            },
            # 2. The LinkedIn Targeted Search (People)
            {
                "q": linkedin_query_builder(params.keywords, params.country), 
                "gl": params.country,
                "page": params.pages
            }
        ]
        logger.info("Combined payload query built successfully.")
    except Exception as e:
        logger.error("Error building combined payload query: %s", e)
        raise Exception(f"Failed to build combined payload query: {e}")

    try:
        logger.info("Creating connection object for google.serper.dev.")
        google = http.client.HTTPSConnection("google.serper.dev")
        logger.info("Connected to google.serper.dev successfully.")
    except Exception as e:
        logger.error("Error creating connection object: %s", e)
        raise  Exception(f"Failed to connect to Serper API: {e}") 
    
    try:
        logger.info("Preparing Serper search payload.")
        payload = json.dumps(queries)
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
        return raw_data
    except Exception as e:
        logger.error("Error executing Serper search request: %s", e)
        raise Exception(f"Failed to execute Serper search request: {e}")
    finally:
        google.close()


if __name__ == "__main__":
    print(serper_search())