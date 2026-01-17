from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from ..models.schemas import GeneralProfile, PostInput
from ..utils.llm_client import platform_detection
from ..utils.scrapers import ScraperUtils
from ..core.main import LeadPipeline  
import logging
import csv
import io
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

logger = logging.getLogger(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger.info("Starting GenAI Service API")
app = FastAPI(
    title="Warm Lead Sourcer", 
    description="API for Generative AI based lead enrichment and scoring service", 
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

try:
    logger.info("Setting up scraper utilities")
    scraper = ScraperUtils()
    logger.info("Scraper utilities set up successfully")
except Exception as e:
    logger.exception("Failed to set up scraper utilities: %s", e)

try:
    logger.info("Setting up lead processing pipeline")
    pipeline = LeadPipeline()
    logger.info("Pipeline set up successfully")
except Exception as e:
    logger.exception("Failed to set up pipeline: %s", e)
    pipeline = None


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
@limiter.limit("10/minute")
async def lead_generator(request: Request, post: PostInput):
    logger.info("Starting the lead generation process")
    
    try:
        platform = await platform_detection(link=post.post_url)
        logger.info("Platform detected: %s", platform)
        
        if platform == "linkedin":
            logger.info("LinkedIn platform detected. Running full enrichment pipeline.")
            
            if not pipeline:
                raise HTTPException(status_code=500, detail="Pipeline not initialized")
            
            urls = [url.strip() for url in post.post_url.split(',')]
            
            result = await pipeline.process_linkedin_post(urls, post.keywords)
            
            if not result.get("success"):
                raise HTTPException(status_code=500, detail=result.get("error"))
            
            return {
                "success": True,
                "platform": "linkedin",
                "leads": result.get("leads", []),
                "stats": result.get("stats", {}),
                "csv_file": result.get("csv_file")
            }
        
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
            return {
                "success": False,
                "message": "The provided link does not belong to a supported platform."
            }
    
    except HTTPException:
        raise   
    except Exception as e:
        logger.exception("Error in lead generation process: %s", e)
    if platform == "linkedin":
        logger.info("LinkedIn platform detected. Proceeding with LinkedIn lead generation.")
        return scraper.linkedin_scraper(profile_urls=[post.post_url])
    elif platform == "unknown":
        logger.warning("Unknown platform detected. Cannot proceed with lead generation.")
        return {"message": "The provided link does not belong to a supported platform."}
    
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/export/csv")
async def export_leads(profiles: list[GeneralProfile]):
    logger.info(f"Export requested for {len(profiles)} profiles")
    
    if not profiles:
        raise HTTPException(status_code=400, detail="No profiles provided for export")

    output = io.StringIO()
    
    headers = profiles[0].model_dump().keys()
    
    writer = csv.DictWriter(output, fieldnames=headers)
    writer.writeheader()
    
    for profile in profiles:
        row = profile.model_dump()
        for key, value in row.items():
            if isinstance(value, (list, dict)):
                row[key] = str(value)
        writer.writerow(row)
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads.csv"}
    )