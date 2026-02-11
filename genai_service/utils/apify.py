from apify_client import ApifyClientAsync
from dotenv import load_dotenv
import logging
import os
import asyncio

load_dotenv()

logger = logging.getLogger(__name__)
if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

class ApifyError(Exception):
    """Base exception for Apify errors"""
    pass

APIFY_TOKEN = os.getenv("APIFY_API_TOKEN")
if not APIFY_TOKEN:
    logger.critical("APIFY_API_TOKEN is missing from environment variables.")
    raise ApifyError("APIFY_API_TOKEN environment variable is not set")

async def apify_search(keywords: str, max_items: int = 10, locations: list = None):
    """
    Async search for LinkedIn profiles.
    Does NOT block the server while waiting for results.
    """
    if not keywords:
        logger.warning("No keywords provided for Apify search")
        return
    
    if locations is None:
        locations = []
    
    run_input = {
        "profileScraperMode": "Full",
        "search": keywords,
        "maxItems": max_items,
        "locations": locations,
        "startPage": 1,
    }
    
    apify_client = ApifyClientAsync(APIFY_TOKEN)
    
    try:
        logger.info(f"Starting Async Apify actor for: '{keywords}'")
        
        run = await apify_client.actor("qXMa8kADnUQdmz18G").call(run_input=run_input)
        
        if not run or "defaultDatasetId" not in run:
            raise ApifyError("Invalid response from Apify Actor")
        
        logger.info("Apify run finished. Fetching results...")
        
        dataset = apify_client.dataset(run["defaultDatasetId"])
        profile_count = 0
        async for item in dataset.iterate_items():
            profile_count += 1
            yield item
        
        logger.info(f"Retrieved {profile_count} profiles")
            
    except Exception as e:
        logger.error(f"Apify search failed: {e}")
        raise ApifyError(f"Failed to search LinkedIn profiles: {e}")
    

def warm_lead_extractor(profiles: list) -> list[dict]:
    """
    Extracts cleaner data including COMPANY name for email generation.
    """
    if not profiles:
        logger.warning("No profiles provided for extraction")
        return []
    
    cleaned_profiles = []
    logger.info(f"Processing {len(profiles)} profiles from Apify")
    
    for idx, profile in enumerate(profiles, 1):
        try:
            location = profile.get("location", {}) or {}
            parsed_location = location.get("parsed", {}) or {}
            
            education_list = profile.get("education", []) or []
            school_name = "Not available"
            degree = "Not available"
            
            if isinstance(education_list, list) and education_list:
                school_name = education_list[0].get("schoolName", "Not available")
                degree = education_list[0].get("degree", "Not available")

            company_name = "Not available"
            job_title = profile.get("jobTitle") or profile.get("headline") or ""
            
            experience = profile.get("latestExperience", {}) or {}
            if experience.get("companyName"):
                company_name = experience.get("companyName")
            elif " at " in job_title:
                parts = job_title.split(" at ")
                if len(parts) > 1:
                    company_name = parts[-1].strip()

            profile_data = {
                "name": profile.get("fullName") or profile.get("name") or "Unknown",
                "current_role": job_title,
                "company": company_name,
                "education": school_name,
                "degree": degree,
                "country": parsed_location.get("country", "Not available"),
                "city": parsed_location.get("city", "Not available"),
                "linkedin_url": profile.get("url") or profile.get("linkedinProfileUrl"),
                "summary": profile.get("summary", "")[:200],  # Truncate long summaries
            }
            
            cleaned_profiles.append(profile_data)
            
        except Exception as e:
            logger.warning(f"Skipping corrupt profile {idx}: {e}")
            continue
    
    logger.info(f"Successfully extracted {len(cleaned_profiles)} profiles")
    return cleaned_profiles


async def search_and_extract(keywords: str, max_items: int = 10) -> list[dict]:
    """
    Combined search and extraction function for the pipeline.
    """
    try:
        profiles = []
        async for profile in apify_search(keywords, max_items):
            profiles.append(profile)
        return warm_lead_extractor(profiles)
    except ApifyError as e:
        logger.error(f"Apify pipeline failed: {e}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error in pipeline: {e}")
        return []
#TESTING
if __name__ == "__main__":
    async def test_run():
        print("\n" + "="*60)
        print("TESTING ASYNC APIFY")
        print("="*60 + "\n")
        
        results = await search_and_extract("python developer", max_items=3)
        
        print(f"\nFound {len(results)} profiles:\n")
        for i, profile in enumerate(results, 1):
            print(f"{i}. {profile['name']}")
            print(f"   Role: {profile['current_role']}")
            print(f"   Company: {profile['company']}")
            print(f"   Location: {profile['city']}, {profile['country']}")
            print(f"   Education: {profile['degree']} from {profile['education']}")
            print(f"   LinkedIn: {profile['linkedin_url']}")
            print()
        
    asyncio.run(test_run())