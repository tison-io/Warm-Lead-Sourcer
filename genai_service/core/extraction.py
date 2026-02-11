import logging
import re
from typing import Optional, List
from ..models.schemas import GeneralProfile
from ..utils.llm_client import platform_detection
from ..utils.apify import apify_search, apify_lead_presentation
from ..utils.data_wrangling import data_pipeline
from ..utils.caching import get_cached_results, save_to_cache

logger = logging.getLogger(__name__)

def link_validation(link: str) -> bool:
    pattern = r"^https?://([a-z0-9-]+\.)?linkedin\.com/"
    return bool(re.match(pattern, link, re.IGNORECASE))

class MainPipeline():
    async def run_pipeline(self, link: Optional[str] = None, keywords: Optional[str] = None, country: Optional[str] = None, page: Optional[int] = 1):
        logger.info("Running main pipeline")

        if link:
            logger.info("Validating the provided LinkedIn link")
            valid = link_validation(link)
            if not valid:
                logger.error("Invalid LinkedIn link provided.")
                raise ValueError("The provided link is not a valid LinkedIn URL.")
                
            logger.info(f"Link provided. Platform detection will be based on the link.")
            try:
                platform = await platform_detection(link=link)
            except Exception as e:
                logger.error(f"Error during platform detection: {e}")
                raise

            logger.info(f"Detected platform: {platform}")

            if platform == "linkedin":
                logger.info("Running LinkedIn extraction pipeline")
                raise NotImplementedError("LinkedIn extraction not implemented yet")  
            elif platform == "unknown":
                logger.warning("Unknown platform detected. Cannot proceed with extraction.")
                raise ValueError("The provided link does not belong to a supported platform.")
            
        elif keywords and not link:
            logger.info("No link provided. Running Apify search based on keywords.")
            
            logger.info("Checking cache for existing results...")
            cached_data = get_cached_results(keywords, country, page)
            
            if cached_data is not None:
                logger.info(f"Cache HIT! Found {len(cached_data)} cached profiles.")
                return [GeneralProfile(**p) for p in cached_data]
            
            logger.info("Cache MISS. Fetching fresh data from Apify...")
            
            try:
                search_query = f"{keywords} {country}" if country else keywords
                logger.info(f"Searching Apify for: {search_query}")
                
                rich_profiles = await apify_search(keywords=search_query, max_items=5)
                cleaned_profiles = apify_lead_presentation(rich_profiles)
                if not rich_profiles:
                    logger.warning("Apify found 0 profiles.")
                    return []
                
                logger.info(f"Cleaned {len(cleaned_profiles)} profiles. Processing & Scoring...")
                processed_results = []
                processed_results = await data_pipeline(cleaned_profiles, keywords=keywords.split())
                logger.info("Data processing completed")
                return processed_results
            except Exception as e:
                logger.error(f"Error during data processing: {e}")
                raise
                