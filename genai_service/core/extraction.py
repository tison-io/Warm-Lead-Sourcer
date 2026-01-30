import logging
import re
from typing import Optional
from ..utils.llm_client import platform_detection
from ..utils.serper import serper_search
from ..utils.data_wrangling import data_pipeline

logger = logging.getLogger(__name__)

def link_validation(link: str) -> bool:
    pattern = r"^https?://([a-z]{2,3}\.)?linkedin\.com/"
    return bool(re.match(pattern, link, re.IGNORECASE))

    
class MainPipeline():
    async def run_pipeline(self, link : Optional[str]=None, keywords: Optional[str] = None, country: Optional[str]= None, page: Optional[int]=1):
        logger.info("Running main pipeline")

        if link:
           
            logger.info(f"Validating the provided link: {link}")
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
            logger.info("No link provided. Running general search based on keywords.")
            try:
                logger.info(f"Searching for profiles with keywords: {keywords}")
                extraction_results =  await serper_search(keywords=keywords, country=country, page=page)
                logger.info("General profile extraction completed")
            except Exception as e:
                logger.error(f"Error during general profile extraction: {e}")
                raise

            try:
                logger.info("Processing extracted profiles through data pipeline")
                processed_results = await data_pipeline(extraction_results, keywords=keywords.split())
                logger.info("Data processing completed")
                return processed_results
            except Exception as e:
                logger.error(f"Error during data processing: {e}")
                raise

        else:
            logger.warning("No valid input provided for lead sourcing.")
            raise ValueError("Either a link or keywords must be provided for lead sourcing.")
