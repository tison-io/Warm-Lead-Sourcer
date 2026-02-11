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

keyword_actor_id = "qXMa8kADnUQdmz18G"

async def _run_actor(run_input: dict, actor_id: str):
    apify_client = ApifyClientAsync(APIFY_TOKEN)
    try:
        logger.info(f"Starting Apify Actor: {actor_id}")
        try:
            logger.info("Calling actor with input: %s", run_input)
            run = await apify_client.actor(actor_id).call(run_input=run_input)
            if not run or "defaultDatasetId" not in run:
                logger.error(f"Apify Run Failed: No Dataset ID. Status: {run.get('status')}")
                raise ApifyError(f"Apify run failed: {run.get('status')}")
        except Exception as e:
            logger.error(f"Failed to start Apify Actor {actor_id}: {e}")
            raise ApifyError(f"Failed to run actor: {e}")
         
        logger.info(f"Apify Run ID: {run.get('id')}\n - Status: {run.get('status')}")
        
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

def apify_lead_presentation(profiles: List[Dict]) -> List[Dict]:
    presented_profiles = []
    for profile in profiles:
        experience = profile.get("experience", [])
        current_job = "Current role unavailable"
        if experience:
            position = experience[0].get("position", "Position Unavailable")
            company = experience[0].get("companyName", "Company unavailable")
            current_job = f'{position} | {company}'
        location = profile.get("location", {}).get("parsed", {})
        edu_entries = [e for e in profile.get("education", []) if e.get("degree")]
        primary_school = "School unavailable"
        primary_degree = "Degree unavailable"
        if edu_entries:
            primary_school = edu_entries[0].get("schoolName", "School unavailable")
            primary_degree = edu_entries[0].get("degree", "Degree unavailable")
        lead = {
            "name": f"{profile.get('firstName', 'LinkedIn')} {profile.get('lastName', 'User')}".strip(),
            "title": profile.get("position", "Title unavailable"),
            "current_role": current_job,
            "country": location.get("country", "Country unavailable"),
            "city": location.get("city", "City unavailable"),
            "education": primary_school,
            "degree": primary_degree,
            "linkedin_url": profile.get("linkedinUrl", "LinkedIn URL unavailable"),
            "summary_profile": profile.get("about", "")[:200] if profile.get("about") else "No summary available", 
        }
        presented_profiles.append(lead)
    return presented_profiles

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

if __name__ == "__main__":
    results = asyncio.run(apify_search("Medical officer", max_items=5, locations=["Kenya", "Tanzania"]))
    # print(results)
    cleaned_leads = apify_lead_presentation(profiles=results)
    print(cleaned_leads)