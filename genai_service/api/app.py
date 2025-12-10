from fastapi import FastAPI
from ..models.schemas import GeneralProfile, PostInput
from ..utils.llm_client import platform_detection
from ..utils.scrapers import ScraperUtils
import logging

logger = logging.getLogger(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger.info("Starting GenAI Service API")
app = FastAPI(title="Warm Lead Sourcer", description="API for Generative AI based lead enrichment and scoring service", version="1.0.0")


try:
    logger.info("Setting up scraper utilities")
    scraper = ScraperUtils()
    logger.info("Scraper utilities set up successfully")
except Exception as e:
    logger.exception("Failed to set up scraper utilities: %s", e)

async def main_pipeline(post_url, filters: list[str]):
    try:
        platform = await platform_detection(link=post_url)
        logger.info("Platform detected: %s", platform)
        logger.info("Identified platform. Proceeding with lead generation.")
    except Exception as e:
        logger.exception("Error in lead generation process: %s", e)
        return {"message": "Failed to detect platform", "error": str(e)}
    if platform == "linkedin":
        logger.info("LinkedIn platform detected. Proceeding with LinkedIn lead generation.")
        return scraper.linkedin_scraper(link=post_url)
    elif platform == "instagram":
        logger.info("Instagram platform detected. Proceeding with Instagram lead generation.")
        return scraper.instagram_scraper(link=post_url)
    elif platform == "x":
        logger.info("X platform detected. Proceeding with X lead generation.")
        return scraper.x_scraper(link=post_url)
    elif platform == "facebook":
        logger.info("Facebook platform detected. Proceeding with Facebook lead generation.")
        return scraper.facebook_scraper(link=post_url)
    elif platform == "unknown":
        logger.warning("Unknown platform detected. Cannot proceed with lead generation.")
        return {"message": "The provided link does not belong to a supported platform."}
    
    


@app.get("/")
async def health_check():
    logger.info("Health check endpoint called")
    return {"message": "GenAI Service is up and running!"}

@app.post("/leads")
async def lead_generator(post: PostInput):
    logger.info("Starting the lead generaation process")
    try:
        platform = await platform_detection(link=post.post_url)
        logger.info("Platform detected: %s", platform)
        logger.info("Identified platform. Proceeding with lead generation.")
    except Exception as e:
        logger.exception("Error in lead generation process: %s", e)
    if platform == "linkedin":
        logger.info("LinkedIn platform detected. Proceeding with LinkedIn lead generation.")
        return scraper.linkedin_scraper(link=post.post_url)
    elif platform == "instagram":
        logger.info("Instagram platform detected. Proceeding with Instagram lead generation.")
        return scraper.instagram_scraper(link=post.post_url)
    elif platform == "x":
        logger.info("X platform detected. Proceeding with X lead generation.")
        return scraper.x_scraper(link=post.post_url)
    elif platform == "facebook":
        logger.info("Facebook platform detected. Proceeding with Facebook lead generation.")
        return scraper.facebook_scraper(link=post.post_url)
    elif platform == "unknown":
        logger.warning("Unknown platform detected. Cannot proceed with lead generation.")
        return {"message": "The provided link does not belong to a supported platform."}
    

@app.post("/export/csv")
async def export_leads(profiles: list[GeneralProfile]):
    pass