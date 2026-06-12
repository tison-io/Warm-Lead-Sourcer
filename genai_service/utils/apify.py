from apify_client import ApifyClientAsync
from dotenv import load_dotenv
import logging
import os
import asyncio
from typing import List, Dict
import re 

load_dotenv()
logger = logging.getLogger(__name__)

class ApifyError(Exception):
    pass

APIFY_TOKEN = os.getenv("APIFY_API_TOKEN")
if not APIFY_TOKEN:
    logger.critical("APIFY_API_TOKEN is missing from environment variables.")

async def _run_actor(run_input: dict, actor_id: str):
    apify_client = ApifyClientAsync(APIFY_TOKEN)
    try:
        logger.info(f"Starting Apify Actor: {actor_id}")
        logger.info(f"Input: {run_input}")
        
        run = await apify_client.actor(actor_id).call(run_input=run_input)
        
        # Updated: Compute status safely before checking for failure
        status = run.get('status') if run is not None else 'unknown'
        
        if not run or "defaultDatasetId" not in run:
            logger.error(f"Apify Run Failed: No Dataset ID. Status: {status}")
            raise ApifyError(f"Apify run failed: {status}")
            
        logger.info(f"Apify Run ID: {run.get('id')} - Status: {run.get('status')}")
        
        dataset = apify_client.dataset(run["defaultDatasetId"])
        item_count = 0
        async for item in dataset.iterate_items():
            item_count += 1
            yield item
        logger.info(f"Total items fetched from Apify: {item_count}")

    except Exception as e:
        error_msg = str(e).lower()
        if "quota" in error_msg:
            logger.critical("APIFY QUOTA EXCEEDED")
            raise ApifyError("Apify quota exceeded.")
        elif "rate limit" in error_msg:
            logger.warning("APIFY RATE LIMIT HIT.")
            raise ApifyError("Too many requests to Apify.")
        else: 
            logger.error(f"Apify Actor {actor_id} failed: {e}")
            raise ApifyError(f"Actor failed: {e}")

async def apify_search(keywords: str, max_items: int = 10, locations: list = None, start_page: int = 1):
    if not keywords:
        logger.warning("Search attempted with empty keywords.")
        raise ValueError("Keywords for apify search cannot be empty.")
    
    if locations is None:
        locations = []
    
    run_input = {
        "profileScraperMode": "Full",
        "search": keywords,
        "maxItems": max_items,
        "locations": locations, 
        "startPage": start_page,
    }

    output = []
    async for item in _run_actor(run_input, actor_id="qXMa8kADnUQdmz18G"):
        output.append(item)
    return output

async def enrich_profiles(profile_urls: list):
    if not profile_urls:
        return

    run_input = {
        "urls": profile_urls,
        "minDelay": 1,
        "maxDelay": 5,
    }
    
    async for item in _run_actor(run_input, actor_id="harvestapi/linkedin-profile-scraper"):
        yield item

def apify_lead_presentation(profiles: List[Dict]) -> List[Dict]:
    presented_profiles = []
    for profile in profiles:
        experience = profile.get("experience", [])
        
        position = "Position Unavailable"
        company = "Company unavailable"
        current_job = "Current role unavailable"
        
        if experience and isinstance(experience, list) and len(experience) > 0:
            position = experience[0].get("position") or experience[0].get("title", "Position Unavailable")
            company = experience[0].get("companyName") or experience[0].get("company", "Company unavailable")
            current_job = f'{position} | {company}'
        
        location = profile.get("location", {})
        if isinstance(location, dict):
            parsed_loc = location.get("parsed", {}) if "parsed" in location else location
        else:
            parsed_loc = {}

        education_data = []
        raw_edu = profile.get("education", [])
        if isinstance(raw_edu, list):
            for edu in raw_edu:
                if isinstance(edu, dict):
                    education_data.append({
                        "school": edu.get("schoolName") or edu.get("school"),
                        "degree": edu.get("degree") or edu.get("degreeName")
                    })

        lead = {
            "name": f"{profile.get('firstName', 'LinkedIn')} {profile.get('lastName', 'User')}".strip(),
            "title": position,
            "company": company,  
            "current_role": current_job,
            "country": parsed_loc.get("country", "Country unavailable"),
            "city": parsed_loc.get("city", "City unavailable"),
            "education": education_data,
            "linkedin_url": profile.get("linkedinUrl") or profile.get("url", "LinkedIn URL unavailable"),
            "summary_profile": profile.get("about", "")[:200] if profile.get("about") else "No summary available", 
        }
        presented_profiles.append(lead)
    return presented_profiles