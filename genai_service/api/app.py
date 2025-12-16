from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from models.schemas import GeneralProfile, PostInput
from utils.llm_client import platform_detection, calculate_score
from utils.scrapers import ScraperUtils
from core.main import LeadPipeline  
from core.extraction import FieldExtractor
from core.enrichment_service import email_generator
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
    title="Warm Lead Sourcer - GenAI Service", 
    description="AI-powered profile enrichment and lead scoring service", 
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # will update later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.get("/")
async def health_check():
    """Health check endpoint"""
    logger.info("Health check endpoint called")
    return {
        "status": "healthy",
        "message": "GenAI Service is up and running!",
        "version": "1.0.0",
        "endpoints": {
            "enrich_single": "/api/enrich",
            "enrich_batch": "/api/enrich/batch",
            "score_lead": "/api/score",
            "docs": "/docs"
        }
    }



@app.post("/api/enrich")
@limiter.limit("20/minute")
async def enrich_single_profile(request: Request, data: dict):
    """
    Enrich a single LinkedIn profile with AI-powered extraction.
    
    This endpoint is called by the web dev's backend to enrich scraped profiles.
    
    Request body:
    {
        "profile_text": "John Doe, Software Engineer at Google. Stanford University. San Francisco, USA.",
        "name": "John Doe",
        "platform": "linkedin"
    }
    
    Response:
    {
        "name": "John Doe",
        "role": "Software Engineer",
        "university": "Stanford University",
        "country": "USA",
        "city": "San Francisco",
        "email": "john.doe@stanford.edu",
        "score": 0
    }
    """
    try:
        profile_text = data.get("profile_text", "")
        name = data.get("name", "")
        platform = data.get("platform", "linkedin")
        
        if not profile_text:
            raise HTTPException(status_code=400, detail="profile_text is required")
        
        logger.info(f"Enriching profile for: {name}")
        
        # Extract fields using GenAI
        extractor = FieldExtractor()
        extracted = await extractor.extract_fields(profile_text)
        
        # Build enriched response
        enriched = {
            "name": name,
            "role": extracted.role or "",
            "university": extracted.university or "",
            "country": extracted.country or "",
            "city": extracted.raw_location.split(',')[0].strip() if extracted.raw_location else "",
            "email": "",
            "score": 0
        }
        
        # Generate email pattern
        if name and enriched["university"]:
            try:
                enriched["email"] = email_generator({
                    "name": name,
                    "education": enriched["university"]
                })
            except Exception as e:
                logger.error(f"Email generation failed: {e}")
                enriched["email"] = ""
        
        logger.info(f"✓ Successfully enriched profile: {name}")
        return enriched
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Enrichment error: {e}")
        raise HTTPException(status_code=500, detail=f"Enrichment failed: {str(e)}")


@app.post("/api/enrich/batch")
@limiter.limit("10/minute")
async def enrich_batch_profiles(request: Request, data: dict):
    """
    Enrich multiple profiles at once (max 50 profiles per request).
    
    Request body:
    {
        "profiles": [
            {
                "profile_text": "John Doe, Engineer at Google...",
                "name": "John Doe",
                "platform": "linkedin"
            },
            {
                "profile_text": "Jane Smith, Manager at Microsoft...",
                "name": "Jane Smith",
                "platform": "linkedin"
            }
        ]
    }
    
    Response:
    {
        "enriched": [
            { "name": "John Doe", "role": "Software Engineer", ... },
            { "name": "Jane Smith", "role": "Product Manager", ... }
        ],
        "total": 2,
        "successful": 2,
        "failed": 0
    }
    """
    try:
        profiles = data.get("profiles", [])
        
        if not profiles:
            raise HTTPException(status_code=400, detail="profiles array is required")
        
        if len(profiles) > 50:
            raise HTTPException(status_code=400, detail="Maximum 50 profiles per batch")
        
        logger.info(f"Batch enriching {len(profiles)} profiles")
        
        extractor = FieldExtractor()
        enriched_profiles = []
        failed_count = 0
        
        for profile in profiles:
            try:
                profile_text = profile.get("profile_text", "")
                name = profile.get("name", "")
                
                # Extract
                extracted = await extractor.extract_fields(profile_text)
                
                enriched = {
                    "name": name,
                    "role": extracted.role or "",
                    "university": extracted.university or "",
                    "country": extracted.country or "",
                    "city": extracted.raw_location.split(',')[0].strip() if extracted.raw_location else "",
                    "email": "",
                    "score": 0
                }
                
                # Generate email
                if name and enriched["university"]:
                    try:
                        enriched["email"] = email_generator({
                            "name": name,
                            "education": enriched["university"]
                        })
                    except:
                        pass
                
                enriched_profiles.append(enriched)
                
            except Exception as e:
                logger.error(f"Failed to enrich {profile.get('name', 'unknown')}: {e}")
                failed_count += 1
                # Add empty profile to maintain order
                enriched_profiles.append({
                    "name": profile.get("name", ""),
                    "role": "",
                    "university": "",
                    "country": "",
                    "city": "",
                    "email": "",
                    "score": 0
                })
        
        logger.info(f"✓ Batch complete: {len(enriched_profiles) - failed_count}/{len(profiles)} successful")
        
        return {
            "enriched": enriched_profiles,
            "total": len(profiles),
            "successful": len(enriched_profiles) - failed_count,
            "failed": failed_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Batch enrichment error: {e}")
        raise HTTPException(status_code=500, detail=f"Batch enrichment failed: {str(e)}")


@app.post("/api/score")
@limiter.limit("30/minute")
async def score_lead(request: Request, data: dict):
    """
    Score a lead from 1-10 based on keywords/criteria.
    
    Request body:
    {
        "profile": {
            "name": "John Doe",
            "role": "Software Engineer",
            "university": "MIT",
            "country": "USA"
        },
        "keywords": ["engineer", "mit", "software"]
    }
    
    Response:
    {
        "score": 8
    }
    """
    try:
        profile = data.get("profile", {})
        keywords = data.get("keywords", [])
        
        if not profile:
            raise HTTPException(status_code=400, detail="profile is required")
        
        logger.info(f"Scoring profile: {profile.get('name', 'unknown')}")
        
        score = await calculate_score(profile, keywords)
        
        logger.info(f"✓ Score calculated: {score}/10")
        
        return {"score": score}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Scoring error: {e}")
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")


# ========== ORIGINAL ENDPOINTS (Keep for standalone testing) ==========

@app.post("/leads")
@limiter.limit("10/minute")
async def lead_generator(request: Request, post: PostInput):
    """
    Original full pipeline endpoint - processes complete LinkedIn posts.
    This is for testing your service independently.
    """
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
            logger.info("Instagram platform detected.")
            return {"success": False, "message": "Instagram scraper not yet implemented"}
        
        elif platform == "x":
            logger.info("X platform detected.")
            return {"success": False, "message": "X scraper not yet implemented"}
        
        elif platform == "facebook":
            logger.info("Facebook platform detected.")
            return {"success": False, "message": "Facebook scraper not yet implemented"}
        
        else:
            logger.warning("Unknown platform detected.")
            return {
                "success": False,
                "message": "The provided link does not belong to a supported platform."
            }
    
    except HTTPException:
        raise   
    except Exception as e:
        logger.exception("Error in lead generation process: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/export/csv")
async def export_leads(profiles: list[GeneralProfile]):
    """CSV export endpoint"""
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