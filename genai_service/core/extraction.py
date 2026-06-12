import logging
import re
from typing import Optional, List

from models.schemas import GeneralProfile
from utils.llm_client import platform_detection, calculate_score 
from utils.apify import apify_search, apify_lead_presentation, enrich_profiles
from utils.data_wrangling import email_generator, export
from utils.caching import get_cached_results, save_to_cache

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
            
            pass 
            
        elif keywords and not link:
            logger.info("No link provided. Checking cache...")
            
            cached_data = get_cached_results(keywords, country, page)
            if cached_data is not None:
                logger.info(f"Cache HIT! Found {len(cached_data)} cached profiles.")
                return [GeneralProfile(**p) for p in cached_data]
            
            logger.info("Cache MISS. Fetching fresh data from Apify...")
            
            try:
                search_query = f"{keywords} {country}" if country else keywords
                
                # Updated: Passed start_page=page to handle pagination correctly
                raw_profiles = await apify_search(keywords=search_query, max_items=5, start_page=page)
                
                if not raw_profiles:
                    logger.warning("Apify found 0 profiles.")
                    save_to_cache(keywords, country, page, [])
                    return []
                
                cleaned_profiles = apify_lead_presentation(raw_profiles)
                
                processed_results = []
                
                for profile in cleaned_profiles:
                    company = profile.get("company", "Not available")
                    
                    education_list = profile.get("education", [])
                    education = "Not available"
                    if education_list and len(education_list) > 0:
                        education = education_list[0].get("school", "Not available")
                    
                    email = email_generator({
                        "name": profile.get("name"),
                        "company": company,
                        "education": education
                    })
                    
                    kw_list = keywords.split() if isinstance(keywords, str) else keywords
                    score = await calculate_score(profile, kw_list)
                    
                    final_profile = GeneralProfile(
                        name=profile.get("name"),
                        linkedin_url=profile.get("linkedin_url"),
                        current_role=profile.get("current_role"),
                        company=company,
                        education=education,
                        country=profile.get("country"),
                        email=email,
                        score=score
                    )
                    processed_results.append(final_profile)

                logger.info("Data processing completed")
                save_to_cache(keywords, country, page, [p.model_dump() for p in processed_results])
                
                return processed_results

            except Exception as e:
                logger.error(f"Error during extraction: {e}")
                raise

        else:
            raise ValueError("Either a link or keywords must be provided.")

    async def run_enrichment(self, links: List[str]):
       
        logger.info(f"Starting Enrichment Pipeline for {len(links)} links")
        
        try:
            raw_profiles = []
            async for profile in enrich_profiles(links):
                raw_profiles.append(profile)
            
            if not raw_profiles:
                return {"error": "Could not scrape details."}
            
            cleaned_profiles = apify_lead_presentation(raw_profiles)
            
            processed_results = []
            for profile in cleaned_profiles:
                company = profile.get("company", "Not available")
                
                education_list = profile.get("education", [])
                education = "Not available"
                if education_list and len(education_list) > 0:
                    education = education_list[0].get("school", "Not available")
                
                email = email_generator({
                    "name": profile.get("name"),
                    "company": company,
                    "education": education
                })
                
                universal_standard = ["Professional", "Credible", "Complete Profile", "Seniority"]
                
                score = await calculate_score(profile, universal_standard)

                final_profile = GeneralProfile(
                    name=profile.get("name"),
                    linkedin_url=profile.get("linkedin_url"),
                    current_role=profile.get("current_role"),
                    company=company,
                    education=education,
                    country=profile.get("country"),
                    email=email,
                    score=score  
                )
                processed_results.append(final_profile)

            # Updated: export now returns in-memory content, not a filename
            csv_content = await export([p.model_dump() for p in processed_results])
            
            return {
                "count": len(processed_results),
                "data": processed_results,
                "csv_content": csv_content # Updated to return the content directly
            }
            
        except Exception as e:
            logger.error(f"Error during enrichment: {e}")
            raise