from ..utils.llm_client import calculate_score
import logging
import re
import csv
import asyncio

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

# def clean_company_name(company: str) -> str:
#     """
#     Turns 'Tesla Motors, Inc.' into 'tesla'.
#     Removes legal suffixes and spaces to create a domain stub.
#     """
#     if not company or company.lower() in ["not available", "unknown", "self-employed"]:
#         return "" 
    
#     clean = company.lower().strip()
    
#     suffixes = [
#         r"\s+inc\.?$", r"\s+llc\.?$", r"\s+ltd\.?$", r"\s+pvt\.?$", 
#         r"\s+corp\.?$", r"\s+corporation$", r"\s+company$", r"\s+co\.?$",
#         r"\s+group$"
#     ]
    
#     for suffix in suffixes:
#         clean = re.sub(suffix, "", clean)
        
#     #  Remove generic terms/spaces for the domain part
#     clean = re.sub(r"[^a-z0-9]", "", clean)
    
#     return clean

# def clean_university_name(university: str) -> str:
#     """
#     Turns 'Harvard University' into 'harvard'.
#     """
#     if not university:
#         return ""
    
#     clean = university.lower().strip()
#     clean = re.sub(r"\b(?:university|college|institute|of|technology)\b", "", clean)
#     clean = re.sub(r"\s+", " ", clean).strip()
#     clean = re.sub(r"[^a-z0-9]", "", clean)
#     return clean

# def email_generator(profile):
#     """
#     Generates an email with the following priority:
#     1. Company Email (firstname.lastname@company.com)
#     2. University Email (firstname.lastname@university.edu)
#     3. Fallback (firstname.lastname@gmail.com)
#     """
#     try:
#         logger.info("Generating email for profile: %s", profile.get("name", "Unknown"))
        
#         full_name = profile.get("name", "").strip()
#         if not full_name:
#             return "unknown@unknown.com"
            
#         parts = full_name.split()
#         first_name = parts[0].lower()
#         last_name = parts[-1].lower() if len(parts) > 1 else ""
        
#         first_name = re.sub(r"[^a-z]", "", first_name)
#         last_name = re.sub(r"[^a-z]", "", last_name)
        
#         if last_name:
#             user_part = f"{first_name}.{last_name}"
#         else:
#             user_part = first_name

#         company = profile.get("company", "")
#         if not company:
#             current_role = profile.get("current_role", "")
#             if " at " in current_role:
#                 company = current_role.split(" at ")[-1]
#             elif "@" in current_role:
#                 company = current_role.split("@")[-1]
        
#         domain_stub = clean_company_name(company)
        
#         if domain_stub and len(domain_stub) > 1:
#             email = f"{user_part}@{domain_stub}.com"
#             logger.info(f"Generated Company Email: {email}")
#             return email

#         education = profile.get("education", "")
#         uni_stub = clean_university_name(str(education))
        
#         if uni_stub and len(uni_stub) > 1:
#             email = f"{user_part}@{uni_stub}.edu"
#             logger.info(f"Generated University Email: {email}")
#             return email

#         email = f"{user_part}@gmail.com"
#         logger.info(f"Generated Fallback Email: {email}")
#         return email

#     except Exception as e:
#         logger.exception("Error generating email: %s", e)
#         return "error@generation.com"
# 
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
            snippet_text = profile.get('summary_profile', '') or f"{profile.get('current_role', '')} {profile.get('about', '')}"
            llm_input = (
                f"Candidate: {profile.get('name')}\n"
                f"Headline: {profile.get('title')}\n"
                f"Current Role: {profile.get('current_role')}\n"
                f"education: {profile.get('education')} ({profile.get('degree')})\n"
                f"location: {profile.get('city')}, {profile.get('country')}\n"
                f"Education: {profile.get('education')} ({profile.get('degree')})\n"
                f"Summary: {profile.get('summary_profile')}"
            )
            raw_score = await calculate_score(
                profile=llm_input, 
                criteria=f" Keywords: {keywords}"
            )
            
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
        await asyncio.sleep(0.6)
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