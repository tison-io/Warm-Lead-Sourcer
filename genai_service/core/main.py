from .extraction import MainPipeline
from ..models.schemas import GeneralProfile, UserInput
from fastapi import FastAPI, HTTPException
import logging
from typing import List, Dict
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import csv
import io

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
Limiter = Limiter(key_func=get_remote_address)

try:
    app = FastAPI(title="Warm Lead Sourcer", version="2.0", description="A service for sourcing warm leads.")
    app.state.limiter = Limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    logger.info("FastAPI application initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize FastAPI application: {e}")
    raise



@app.get("/")
async def check_service():
    """
    Health check endpoint to verify the service is running.
    """
    return {"status": "Service is running"}

@app.post("/source_leads", response_model=List[GeneralProfile])
async def source_leads(user_input: UserInput) -> List[Dict]:


    try:
        logger.info("Setting up MainPipeline for lead sourcing.")
        lead_pipeline = MainPipeline()
        logger.info("MainPipeline set up successfully.")
    except Exception as e:
        logger.exception("Failed to set up MainPipeline")
        raise HTTPException(status_code=500, detail="Internal error setting up pipeline.")

    try:
        logger.info("Running lead sourcing pipeline.")
        leads = await lead_pipeline.run_pipeline(link=user_input.post_url, keywords=user_input.keywords, country=user_input.country, page=user_input.page)
        if leads is None:
            logger.warning("Pipeline returned no leads for link=%s", user_input.post_url)
            return []
        return leads
    except ValueError as ve:
        logger.warning(f"Validation Error: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    
    except NotImplementedError as nie:
        logger.info(f"Feature Error: {nie}")
        raise HTTPException(status_code=501, detail=str(nie)) 

    except Exception as e:
        logger.exception("Unexpected error during lead sourcing")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    
    #csv export logic
    @app.post("/export/csv")
    async def export_leads(profiles: List[GeneralProfile]):
        if not profiles:
            raise HTTPException(status_code=400, detail="No profiles provided for export")
        output = io.StringIO()
        headers = profiles[0].model_dump().keys()
        writer = csv.DictWriter(output, fieldnames=headers)
        writer.writeheader()
        for profile in profiles:
            row = profile.model_dump()
            for key, value in row.items():
                if isinstance(value, (list,dict)):
                    row[key] = str(value)
                    writer.writerow(row)
                    output.seek(0)
                    return StreamingResponse(iter([output.getvalue()]),
                                             media_type="text/csv",
                                             headers={"Content-Disposition": "attachment; filename=leads.csv"})