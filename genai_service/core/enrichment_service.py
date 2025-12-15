from utils.llm_client import calculate_score
import logging
import csv
import asyncio

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

def email_generator(profile_data):
        try:
            logger.info("Generating email for profile: %s", profile_data["name"])
            first_name, last_name = profile_data["name"].lower().split(" ", 1)  # FIX: Handle names with more than 2 parts
            if " " in last_name:  # If last_name has spaces, take the last word
                last_name = last_name.split()[-1]
            university = profile_data["education"].replace(" ", "").lower()
            logger.info("Email generated successfully.")
            return f"{first_name}.{last_name}@{university}.edu"
        except Exception as e:
            logger.exception("Error generating email: %s", e)
            return ""
        
    
async def filter_profiles(profiles, keywords: list[str]):
    filtered_profiles = []
    threshold = 5  
    try:
        logger.info("Starting profile filtering process.")
        for profile in profiles:
            calculated_score = await calculate_score(profile=profile, criteria=keywords)
            logger.info("Profile: %s, Score: %d", profile.get("name", ""), calculated_score)
            profile["score"] = calculated_score
            if calculated_score >= threshold:
                filtered_profiles.append(profile)
        logger.info("Profile filtering completed successfully.")
    except Exception as e:
        logger.exception("Error during profile filtering: %s", e)
        return filtered_profiles
    return filtered_profiles

def lead_presentation(profiles_with_scores):
    final_leads = []
    try:
        logger.info("Formatting generated leads for presentation.")
        for lead in profiles_with_scores:
            lead["email"] = email_generator(lead)
            final_leads.append(lead)
        logger.info("Leads formatted successfully.")
        return final_leads
    except Exception as e:
        logger.exception("Error formatting leads: %s", e)
        return final_leads

    
async def export(profile_list):
    file_name = "leads.csv"
    try:
         column_names = ["Name", "LinkedIn URL", "Current Role", "University", "Country", "Email", "Score"]
         with open(file=file_name, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file, delimiter=",", quotechar='"', quoting=csv.QUOTE_MINIMAL)
            writer.writerow(column_names)
            # Write profile data to csv
            for profile in profile_list:
                writer.writerow([  # FIX: Removed await - csv.writer is not async
                    profile.get("name", ""),
                    profile.get("linkedin_url", ""),
                    profile.get("current_role", ""),
                    profile.get("education", ""),
                    profile.get("country", ""),
                    profile.get("email", ""),
                    profile.get("score", "")
                ])
         logger.info("CSV file created successfully: %s", file_name)
         return file_name
    except Exception as e:
            logger.exception("Error creating CSV file: %s", e)
            return None  

async def test():
    """Test enrichment service"""
    print("\n" + "="*60)
    print("TESTING ENRICHMENT SERVICE")
    print("="*60)
    
    # Test 1: Email Generation
    print("\n--- Test 1: Email Generation ---")
    test_profiles = [
        {"name": "John Kamau", "education": "University of Nairobi"},
        {"name": "Mary Wanjiku", "education": "Strathmore University"},
        {"name": "James Omondi Ochieng", "education": "JKUAT"},
    ]
    
    for profile in test_profiles:
        email = email_generator(profile)
        print(f"  {profile['name']} -> {email}")
    
    # Test 2: Profile Filtering
    print("\n--- Test 2: Profile Filtering & Scoring ---")
    sample_profiles = [
        {
            "name": "John Kamau",
            "current_role": "Software Engineer at Safaricom",
            "education": "University of Nairobi",
            "country": "Kenya",
            "linkedin_url": "linkedin.com/in/johnkamau"
        },
        {
            "name": "Mary Wanjiku",
            "current_role": "Data Scientist at Equity Bank",
            "education": "Strathmore University",
            "country": "Kenya",
            "linkedin_url": "linkedin.com/in/marywanjiku"
        },
    ]
    
    keywords = ["software", "engineer", "data"]
    print(f"  Keywords: {keywords}")
    print(f"  Threshold: 5")
    
    filtered = await filter_profiles(sample_profiles, keywords)
    print(f"\n  Filtered: {len(filtered)}/{len(sample_profiles)} profiles passed")
    
    # Test 3: Lead Presentation
    print("\n--- Test 3: Lead Presentation ---")
    final_leads = lead_presentation(filtered)
    
    for lead in final_leads:
        print(f"\n  {lead['name']}")
        print(f"    Role: {lead['current_role']}")
        print(f"    University: {lead['education']}")
        print(f"    Email: {lead['email']}")
        print(f"    Score: {lead['score']}")
    
    # Test 4: CSV Export
    print("\n--- Test 4: CSV Export ---")
    if final_leads:
        csv_file = await export(final_leads)
        if csv_file:
            print(f"  ✓ Exported to {csv_file}")
        else:
            print("  ✗ Export failed")
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(test())