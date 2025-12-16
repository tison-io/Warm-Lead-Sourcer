# GenAI Service Integration Guide

*Version:* 1.0.0  
*Service URL:* https://warm-lead-sourcer-ix9n.onrender.com  
*API Documentation:* https://warm-lead-sourcer-ix9n.onrender.com/docs

---

## Overview

The GenAI Service provides AI-powered profile enrichment, lead scoring, and email pattern generation for LinkedIn profiles. This service is called by your backend to enrich scraped profile data.

---

## Base URLs

- *Production:* https://warm-lead-sourcer-ix9n.onrender.com
- *Documentation:* https://warm-lead-sourcer-ix9n.onrender.com/docs

---

## Authentication

Currently *no authentication required*. API keys may be added in future versions.

---

## Main Endpoints

### 1. Health Check

*GET* /

Check if the service is running.

*Response:*
```json
{
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
2. Enrich Single Profile  PRIMARY ENDPOINT
POST /api/enrich
Enrich a single LinkedIn profile with AI-powered extraction.
Rate Limit: 20 requests/minute
Request Body:
{
  "profile_text": "John Doe, Software Engineer at Google. Stanford University. San Francisco, USA.",
  "name": "John Doe",
  "platform": "linkedin"
}
Request Fields:
profile_text (required): Raw LinkedIn profile text
name (required): Person's name
platform (optional): Platform name (default: "linkedin")
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
Response Fields:
name: Person's name (as provided)
role: Extracted job title
university: Extracted university name (full formal name)
country: Extracted country
city: Extracted city
email: Generated email pattern (⚠ unverified guess)
score: 0 (scoring done separately via /api/score)
Response Time: 2-5 seconds
Error Responses:
400: Missing required field (profile_text)
429: Rate limit exceeded
500: Internal processing error
3. Enrich Batch Profiles
POST /api/enrich/batch
Enrich multiple profiles simultaneously (max 50 per request).
Rate Limit: 10 requests/minute
Request Body:
{
  "profiles": [
    {
      "profile_text": "John Doe, Software Engineer at Google. Stanford University.",
      "name": "John Doe",
      "platform": "linkedin"
    },
    {
      "profile_text": "Jane Smith, Product Manager at Microsoft. MIT.",
      "name": "Jane Smith",
      "platform": "linkedin"
    }
  ]
}
Request Fields:
profiles (required): Array of profile objects (max 50)
Each profile has same fields as single enrich endpoint
Response:
{
  "enriched": [
    {
      "name": "John Doe",
      "role": "Software Engineer",
      "university": "Stanford University",
      "country": "USA",
      "city": "San Francisco",
      "email": "john.doe@stanford.edu",
      "score": 0
    },
    {
      "name": "Jane Smith",
      "role": "Product Manager",
      "university": "Massachusetts Institute of Technology",
      "country": "USA",
      "city": "Boston",
      "email": "jane.smith@mit.edu",
      "score": 0
    }
  ],
  "total": 2,
  "successful": 2,
  "failed": 0
}
Response Fields:
enriched: Array of enriched profiles (same order as input)
total: Total profiles submitted
successful: Number successfully processed
failed: Number that failed (empty profiles returned for failed ones)
Response Time: 5-15 seconds (depends on batch size)
Limits:
Maximum 50 profiles per batch
Failed profiles return empty data but maintain array position
4. Score Lead
POST /api/score
Score a lead from 1-10 based on keywords/criteria.
Rate Limit: 30 requests/minute
Request Body:
{
  "profile": {
    "name": "John Doe",
    "role": "Software Engineer",
    "university": "MIT",
    "country": "USA"
  },
  "keywords": ["engineer", "mit", "software", "computer science"]
}
Request Fields:
profile (required): Profile object with enriched data
keywords (optional): Array of keywords to match against
Response:
{
  "score": 8
}
Response Fields:
score: Integer from 1-10
1-3: Low quality match
4-6: Medium quality match
7-10: High quality match
Scoring Criteria:
Profile completeness (40%)
Keyword matches in role (30%)
Keyword matches in university (30%)
Response Time: 1-3 seconds
Integration Example (NestJS/Node.js)
import axios from 'axios';

const GENAI_SERVICE_URL = 'https://warm-lead-sourcer-ix9n.onrender.com';

interface EnrichmentRequest {
  profile_text: string;
  name: string;
  platform?: string;
}

interface EnrichedProfile {
  name: string;
  role: string;
  university: string;
  country: string;
  city: string;
  email: string;
  score: number;
}

export class GenAIService {
  
  /**
   * Enrich a single profile
   */
  async enrichProfile(profileText: string, name: string): Promise<EnrichedProfile> {
    try {
      const response = await axios.post(
        ${GENAI_SERVICE_URL}/api/enrich,
        {
          profile_text: profileText,
          name: name,
          platform: 'linkedin'
        },
        {
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('GenAI enrichment failed:', error);
      throw new Error(Profile enrichment failed: ${error.message});
    }
  }
  
  /**
   * Enrich multiple profiles in batch
   */
  async enrichBatch(profiles: EnrichmentRequest[]): Promise<EnrichedProfile[]> {
    try {
      const response = await axios.post(
        ${GENAI_SERVICE_URL}/api/enrich/batch,
        { profiles },
        {
          timeout: 60000, // 60 second timeout for batches
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.enriched;
    } catch (error) {
      console.error('GenAI batch enrichment failed:', error);
      throw new Error(Batch enrichment failed: ${error.message});
    }
  }
  
  /**
   * Score a lead
   */
  async scoreProfile(profile: any, keywords: string[]): Promise<number> {
    try {
      const response = await axios.post(
        ${GENAI_SERVICE_URL}/api/score,
        {
          profile,
          keywords
        },
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.score;
    } catch (error) {
      console.error('GenAI scoring failed:', error);
      return 5; // Default mid-score on error
    }
  }
}

// Usage example in your scraping service
export class ScrapingService {
  private genaiService = new GenAIService();
  
  async processLinkedInPost(postUrl: string, keywords: string[]) {
    // 1. Scrape LinkedIn post (your existing logic)
    const scrapedProfiles = await this.scrapeLinkedIn(postUrl);
    
    // 2. Enrich profiles using GenAI service
    const enrichedProfiles = await this.genaiService.enrichBatch(
      scrapedProfiles.map(profile => ({
        profile_text: profile.rawText,
        name: profile.name,
        platform: 'linkedin'
      }))
    );
    
    // 3. Score profiles
    const scoredProfiles = await Promise.all(
      enrichedProfiles.map(async (profile) => ({
        ...profile,
        score: await this.genaiService.scoreProfile(profile, keywords)
      }))
    );
    
    // 4. Save to database
    return this.saveLeads(scoredProfiles);
  }
}
Error Handling
All errors return JSON in this format:
{
  "detail": "Error message describing what went wrong"
}
HTTP Status Codes:
200: Success
400: Bad request (missing required fields)
429: Rate limit exceeded (retry after 60 seconds)
500: Internal server error
Error Handling Example:
try {
  const enriched = await genaiService.enrichProfile(text, name);
} catch (error) {
  if (error.response?.status === 429) {
    // Rate limited - wait and retry
    await new Promise(resolve => setTimeout(resolve, 60000));
    return this.enrichProfile(text, name);
  } else if (error.response?.status === 400) {
    // Bad request - log and skip
    console.error('Invalid profile data:', error.response.data);
    return null;
  } else {
    // Other error - log and continue
    console.error('Enrichment failed:', error);
    return null;
  }
}
Important Notes
Email Patterns
⚠ Email addresses are UNVERIFIED GUESSES
Format: firstname.lastname@university.edu
DO NOT claim these are real/working emails
Label clearly as "guessed" or "suggested" in your UI
Processing Times
Single profile: 2-5 seconds
Batch (10 profiles): 5-10 seconds
Batch (50 profiles): 10-20 seconds
Best Practices
Use batch endpoint when enriching multiple profiles
Implement retries with exponential backoff for 429 errors
Cache results to avoid re-enriching same profiles
Set timeouts (30s for single, 60s for batch)
Handle failures gracefully - return partial data if some profiles fail
Data Quality
Some fields may be empty if not found in profile text
Works best with complete LinkedIn profile descriptions
University names are expanded (MIT → Massachusetts Institute of Technology)
Country names are standardized (USA → United States)
Testing
Test Single Enrichment
curl -X POST https://warm-lead-sourcer-ix9n.onrender.com/api/enrich \
  -H "Content-Type: application/json" \
  -d '{
    "profile_text": "John Doe, Software Engineer at Google. Stanford University. San Francisco, USA.",
    "name": "John Doe",
    "platform": "linkedin"
  }'
Test Batch Enrichment
curl -X POST https://warm-lead-sourcer-ix9n.onrender.com/api/enrich/batch \
  -H "Content-Type: application/json" \
  -d '{
    "profiles": [
      {"profile_text": "John Doe, Engineer at Google...", "name": "John Doe"},
      {"profile_text": "Jane Smith, Manager at Microsoft...", "name": "Jane Smith"}
    ]
  }'
Test Scoring
curl -X POST https://warm-lead-sourcer-ix9n.onrender.com/api/score \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {"name": "John", "role": "Engineer", "university": "MIT"},
    "keywords": ["engineer", "mit"]
  }'
Support
Questions or issues?
Check API documentation: https://warm-lead-sourcer-ix9n.onrender.com/docs
Review this integration guide
Contact GenAI team for assistance
Changelog
v1.0.0 (Current)
Initial release
Single profile enrichment
Batch enrichment (up to 50 profiles)
Lead scoring (1-10 scale)
Email pattern generation