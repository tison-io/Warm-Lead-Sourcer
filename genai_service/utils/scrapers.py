from apify_client import ApifyClient
from dotenv import load_dotenv
import logging
import os

load_dotenv()
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

try:
    client = ApifyClient(os.getenv("APIFY_TOKEN"))
    logger.info("Apify Client initialized successfully.")
except Exception as e:
    logger.exception("Failed to initialize Apify Client: %s", e)
    client = None

try:
    logger.info("Setting up Instagram scraper actor.")
    instagram_actor = client.actor("apify/instagram-scraper")
except Exception as e:
    logger.exception("Failed to set up Instagram scraper actor %s", e)

try:
    logger.info("Starting X scraper")
    # Where we have the logic for X scraper
except Exception as e:
    logger.exception("Error while running X scraper %s", e)

try:
    logger.info("Starting Facebook scraper")
    # Where we have the logic for Facebook scraper
except Exception as e:
    logger.exception("Error while running Facebook scraper", e)

try:
    logger.info("Starting LinkedIn scraper")
    # Where we have the logic for LinkedIn scraper
except Exception as e:
    logger.exception("Error while running LinkedIn scraper", e)

def instagram_input(link):
        logger.info("Preparing input for Instagram scraper.")
        run_input = { 
            "directUrls": [link],
            "resultsType": "posts",
            "resultsLimit": 200,
            "searchType": "hashtag",
            "searchLimit": 1, 
        }
        return run_input


class ScraperUtils:
    enriched_output: dict = {
        "name": "",
        "username": "",
        "current_role": "",
        "education": "",
        "country":"",
        "email": "",
        "score":0
    }
    # Scrapers are to obtain raw data from different platforms without filtering or enrichment

    def instagram_scraper(self, link):
        # try:
        #     logger.info("Starting Instagram scraper actor.")
        #     raw_results = instagram_actor.call(run_input=instagram_input(link=link))
        #     # Instagram URL will be modified as needed
        #     logger.info("Instagram scraper actor finished successfully.")
        #     for item in client.dataset(raw_results["defaultDatasetId"]).iterate_items():
        #         print(item)
        # except Exception as e:
        #     logger.exception("Error while running Instagram scraper actor: %s", e)
        return {"message": "Instagram scraper not yet implemented."}

    def x_scraper(self, link):
        return {"message": "X scraper not yet implemented."}

    def facebook_scraper(self,link):
        return {"message": "Facebook scraper not yet implemented."}
    
    def linkedin_scraper(self,link):
        return {"message": "LinkedIn scraper not yet implemented."}


    


