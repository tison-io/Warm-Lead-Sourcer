from .llm_client import calculate_score
import logging
import re
import csv



logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

def email_generator(profile):
        try:
            logger.info("Generating email for profile: %s", profile["name"])
            first_name, last_name = profile["name"].lower().split(" ", 1)
            if " " in last_name:  
                last_name = last_name.split()[-1]
            education = profile.get("education", "")
            if education:
                university = str(education).replace(" ", "").lower()
                email = f"{first_name}.{last_name}@{university}.edu"
            else:
                email = f"{first_name}.{last_name}@systemgenerated.edu"
            logger.info("Email generated successfully.")
            return email
        except Exception as e:
            logger.exception("Error generating email: %s", e)
            return "noemail@generated.edu"
        
    
async def filter_profiles(profiles, keywords: list[str]):
    filtered_profiles = []
    threshold = 5  
    try:
        logger.info("Starting profile filtering process.")
        for profile in profiles:
            raw_score = await calculate_score(profile=profile, criteria=f" Keywords: {keywords}. Snippet: {profile.get('snippet', '')}")
            score_match = re.search(r'\b([1-9]|10)\b', str(raw_score))
            if score_match:
                calculated_score = int(score_match.group(0))
            else:
                logger.warning("No valid score found in response: %s. Defaulting to 5.", raw_score)
                calculated_score = 5
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

async def data_pipeline(raw_data, keywords=None):
    if keywords is None:
        keywords = ["No keywords provided. Evaluate the profile generally."]
    logger.info("Starting data pipeline")
    logger.info("Scoring the extracted profiles")
    try:
        scored_profiles = await filter_profiles(raw_data, keywords=keywords)
        logger.info("Number of profiles after filtering: %d", len(scored_profiles))
        logger.info("Formatting leads for presentation")
        processed_data = lead_presentation(scored_profiles)
        logger.info("Data pipeline completed")
        return processed_data
    except Exception as e:
        logger.exception("Error during processing of profiles: %s", e)
        raise
    
    

    
async def export(profile_list):
    file_name = "leads.csv"
    try:
         column_names = ["Name", "LinkedIn URL", "Current Role", "University", "Country", "Email", "Score"]
         with open(file=file_name, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file, delimiter=",", quotechar='"', quoting=csv.QUOTE_MINIMAL)
            writer.writerow(column_names)
            for profile in profile_list:
                writer.writerow([  
                    profile.get("name", "Null"),
                    profile.get("linkedin_url", "Null"),
                    profile.get("current_role", "Null"),
                    profile.get("education", "Null"),
                    profile.get("country", "Null"),
                    profile.get("email", "Null"),
                    profile.get("score", "Null")
                ])
         logger.info("CSV file created successfully: %s", file_name)
         return file_name
    except Exception as e:
            logger.exception("Error creating CSV file: %s", e)
            return None  
