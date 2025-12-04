from apify_client import ApifyClient
from dotenv import load_dotenv
from logs import logger

import os

load_dotenv()

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
    def __init__(self, link):
        self.link = link
    

    def get_instagram_results(self, link):
        try:
            logger.info("Starting Instagram scraper actor.")
            raw_results = instagram_actor.call(run_input=instagram_input(link=link))
            # Instagram URL will be modified as needed
            logger.info("Instagram scraper actor finished successfully.")
            for item in client.dataset(raw_results["defaultDatasetId"]).iterate_items():
                print(item)
        except Exception as e:
            logger.exception("Error while running Instagram scraper actor: %s", e)

    def x_scraper(self, link):
        pass

    def facebook_scraper(self,link):
        pass

    def linkedin_scraper(self,link):
        pass


    


