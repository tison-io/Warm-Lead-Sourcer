from apify_client import ApifyClient
from dotenv import load_dotenv
import logging
import os
import json
from typing import List, Optional, Dict, Any
from datetime import datetime

dotenv_dir = os.path.dirname(os.path.dirname(__file__))
dotenv_path = os.path.join(dotenv_dir, ".env")
load_dotenv(dotenv_path)

logger = logging.getLogger(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

def get_apify_client() -> Optional[ApifyClient]:
   
    try: 
        token = os.getenv("APIFY_TOKEN")
        
        if not token:
            raise ValueError("APIFY_TOKEN not found in environment variables.")
        
        client = ApifyClient(token)
        logger.info("Apify Client initialized successfully.")
        
        return client
        
    except Exception as e:
        logger.error(f"Failed to initialize Apify Client: {e}")
        return None

class ScraperUtils:
    
    def __init__(self):
        self.client = get_apify_client()
        if not self.client:
            logger.warning("ScraperUtils initialized without valid apify client.")

    def _sanitize_profile_data(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Remove any potentially sensitive data that shouldn't be stored.
        """
        sensitive_fields = ['phone', 'phoneNumbers' ]        
        sanitized = {k: v for k, v in profile.items() if k not in sensitive_fields}
        
        return sanitized

    def _log_scraping_activity(self, platform: str, profile_count: int, success: bool, error: Optional[str] = None):
        
        audit_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "platform": platform,
            "profile_count": profile_count,
            "success": success,
            "error": error
        }
        
        logger.info(f"Scraping audit: {json.dumps(audit_entry)}")
        
        return audit_entry

    def linkedin_scraper(self, profile_urls: list[str]) -> Dict[str, Any]:
        
        if not self.client:
            error = "Apify client not initialized"
            self._log_scraping_activity("LinkedIn", 0, False, error)
            return {"error": error, "success": False}
            
        if not profile_urls:
            error = "No profile URLs provided"
            self._log_scraping_activity("LinkedIn", 0, False, error)
            return {"error": error, "success": False}
        
        try:
            logger.info(f"Starting LinkedIn scraper for {len(profile_urls)} profiles.")
            
            linkedin_actor = self.client.actor("vulnv/linkedin-profile-scraper")
            
            run_input = {
                "urls": profile_urls  
            }
            
            logger.info(" Running scraper (this may take some time)...")
            
            run = linkedin_actor.call(run_input=run_input, timeout_secs=300)
            
            logger.info(" Scraper finished, fetching results...")
            
            raw_profiles = []
            for item in self.client.dataset(run["defaultDatasetId"]).iterate_items():
                raw_profiles.append(item)
            
            # remove sensitive data)
            sanitized_profiles = [
                self._sanitize_profile_data(profile) 
                for profile in raw_profiles
            ]
            
            logger.info(f"✅ Successfully scraped {len(sanitized_profiles)} profile(s)")
            
            # Log audit trail
            audit = self._log_scraping_activity("LinkedIn", len(sanitized_profiles), True)
            
            return {
                "success": True,
                "profiles": sanitized_profiles,
                "count": len(sanitized_profiles),
                "audit": audit
            }
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"✗ Error scraping LinkedIn: {error_msg}")
            
            # Log failed attempt
            self._log_scraping_activity("LinkedIn", len(profile_urls), False, error_msg)
            
            return {
                "success": False,
                "error": error_msg,
                "profiles": [],
                "count": 0
            }

# try:
#     logger.info("Setting up Instagram scraper actor.")
#     instagram_actor = client.actor("apify/instagram-scraper")
# except Exception as e:
#     logger.exception("Failed to set up Instagram scraper actor %s", e)

# try:
#     logger.info("Starting X scraper")
#     # Where we have the logic for X scraper
# except Exception as e:
#     logger.exception("Error while running X scraper %s", e)

# try:
#     logger.info("Starting Facebook scraper")
#     # Where we have the logic for Facebook scraper
# except Exception as e:
#     logger.exception("Error while running Facebook scraper", e)

# try:
#     logger.info("Starting LinkedIn scraper")
#     # Where we have the logic for LinkedIn scraper
# except Exception as e:
#     logger.exception("Error while running LinkedIn scraper", e)

# def instagram_input(link):
#     logger.info("Preparing input for Instagram scraper.")
#     run_input = { 
#         "directUrls": [link],
#         "resultsType": "posts",
#         "resultsLimit": 200,
#         "searchType": "hashtag",
#         "searchLimit": 1, 
#     }
#     return run_input

#testing
if __name__ == "__main__":
    print("\n" + "="*60)
    print("LinkedIn Scraper Test - FREE VERSION")
    print("="*60 + "\n")
    
    scraper = ScraperUtils()
    
    if not scraper.client:
        print("❌ ERROR: Apify client not initialized!")
        print("   Please check your .env file has APIFY_TOKEN set")
        exit(1)
    
    test_urls = [
        "https://www.linkedin.com/in/cindy-otieno-bb2b9a195/",
        "https://www.linkedin.com/in/brendah-patrick/"
    ]
    
    print(f"Testing with {len(test_urls)} URL(s):")
    for url in test_urls:
        print(f"   • {url}")
    
    print("\n" + "-"*60)
    print("Using: vulnv/linkedin-profile-scraper (FREE tier)")
    print("Privacy: Public data only, no authentication")
    print("-"*60 + "\n")
    
    result = scraper.linkedin_scraper(test_urls)
    
    if result.get("success"):
        print(f"\n✅ SUCCESS! Scraped {result['count']} profile(s)\n")
        
        for i, profile in enumerate(result.get("profiles", []), 1):
            print(f"Profile {i}:")
            print(f"   Name: {profile.get('name', 'N/A')}")
            print(f"   Headline: {profile.get('headline', 'N/A')}")
            print(f"   Location: {profile.get('city', 'N/A')}, {profile.get('country_code', 'N/A')}")
            
            about = profile.get('about', 'N/A')
            if about and about != 'N/A':
                print(f"   About: {about[:100]}...")
            
            current_company = profile.get('current_company', {})
            if current_company:
                print(f"   Current Company: {current_company.get('name', 'N/A')}")
            
            education = profile.get('education', [])
            if education:
                edu = education[0]
                print(f"   Education: {edu.get('title', 'N/A')}")
            
            followers = profile.get('followers', 0)
            connections = profile.get('connections', 0)
            print(f"   Network: {connections} connections, {followers} followers")
            
            print()
        
        # Display audit info
        audit = result.get('audit', {})
        print(f"📋 Audit Log:")
        print(f"   Timestamp: {audit.get('timestamp')}")
        print(f"   Platform: {audit.get('platform')}")
        print(f"   Profiles scraped: {audit.get('profile_count')}")
        print()
        
        output_file = "linkedin_scrape_results.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"📄 Full results saved to: {output_file}")
        
    else:
        print(f"\n❌ FAILED!")
        print(f"   Error: {result.get('error')}")
    
    print("\n" + "="*60 + "\n")