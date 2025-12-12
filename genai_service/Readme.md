# Warm Lead Sourcer - GenAI Service
AI-Powered LinkedIn Lead Enrichment & Scoring System
Transform raw LinkedIn profiles into structured, scored, and actionable leads using LLM-based extraction and intelligent scoring.

## Features
Intelligent Profile Parsing - Extracts structured data from unstructured LinkedIn profiles
LLM-Powered Extraction - Uses Groq/Gemini for ambiguous data extraction
Smart Email Generation - Generates email patterns based on name and university
Automated Lead Scoring - Scores leads 1-10 based on keywords and criteria
CSV Export - Exports enriched leads to CSV format
Batch Processing - Process multiple profiles simultaneously
Keyword Filtering - Filter leads based on custom criteria
Audit Logging - Complete activity tracking

## Quick Start
### Prerequisites
Python 3.11 or higher
Apify Account 
Groq API Key or Google Gemini API Key

## Installation
Clone repository
``` git clone <repository-url> ```
``` cd genai_service ```

Create virtual environment
``` python -m venv venv ```

Activate virtual environment
 Windows:
``` venv\Scripts\activate ```
 Mac/Linux:
``` source venv/bin/activate ```

## Install dependencies
``` pip install -r requirements.txt```

Configure environment
cp .env.example .env
Edit .env and add your API keys

Run
Test the pipeline
``` python -m genai_service.core.main ```

 Start API server
``` uvicorn genai_service.api.app:app --reload ```

 Visit API docs at http://localhost:8000/docs

# Architecture
Raw LinkedIn URL → Scrape → Extract → Enrich → Score → Filter → Export CSV
       ↓              ↓         ↓        ↓        ↓       ↓          ↓
  User Input    Apify API  Rule+LLM  Add Email  1-10   Threshold  leads.csv
## Pipeline Flow
Scrape - Fetch LinkedIn profile data via Apify
Extract - Parse unstructured text using regex + LLM
Enrich - Add computed fields (email patterns)
Score - Rate lead quality (1-10) based on keywords
Filter - Remove leads below threshold
Export - Generate CSV file

## Project Structure
genai_service/
├── api/
│   └── app.py                 # FastAPI application
├── config/
│   ├── prompts.py            # LLM prompts
│   └── settings.py           # Configuration
├── core/
│   ├── main.py               # Pipeline orchestrator
│   ├── extraction.py         # Field extraction logic
│   └── enrichment_service.py # Enrichment & scoring
├── models/
│   └── schemas.py            # Pydantic models
├── utils/
│   ├── llm_client.py         # LLM wrapper (Groq/Gemini)
│   └── scrapers.py           # Apify scraper
├── tests/
│   ├── test_extraction.py
│   ├── test_enrichment.py
│   └── test_pipeline.py
└── .env 
                     # Environment variables

# Installation
Step 1: Clone Repository
``` git clone https://github.com/DirectEd-Development/Warm-Lead-Sourcer ```
``` cd genai_service ```
Step 2: Create Virtual Environment
 Create environment
```python -m venv venv ```
Activate
 Windows:
``` venv\Scripts\activate ```

 Mac/Linux:
``` source venv/bin/activate ```
Step 3: Install Dependencies
``` pip install -r requirements.txt ```

Step 4: Get API Keys
Apify Token
Sign up at apify.com
Go to Settings → Integrations → API Tokens
Copy your token
Groq API Key 
Sign up at console.groq.com
Generate an API key
Copy the key
Google Gemini API Key (Alternative)
Go to ai.google.dev
Get API key
Copy the key

Step 5: Configure Environment
Create .env file in project root:
 Required
```APIFY_TOKEN=your_apify_token_here```
```GROQ_API_KEY=your_groq_api_key_here```
``` GOOGLE_API_KEY=your_gemini_key_here```

 Model Selection
LLM_PROVIDER=groq
GROQ_MODEL=llama-3.3-70b-versatile

Lead Scoring
LEAD_SCORE_THRESHOLD=3

Step 6: Verify Installation
 Test pipeline
``` python -m genai_service.core.main```

 
# Configuration
Environment Variables
All configuration is done via .env file:
 REQUIRED SETTINGS

 Apify Scraper Token
``` APIFY_TOKEN=your_apify_token_here```

 LLM API Keys
``` GROQ_API_KEY=your_groq_api_key_here```
``` GOOGLE_API_KEY=your_gemini_key_here```

### LLM CONFIGURATION

 Provider: groq or gemini
LLM_PROVIDER=groq

 Model Selection
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_MODEL=gemini-1.5-flash

 LLM Parameters
LLM_TEMPERATURE=0.3        
LLM_MAX_TOKENS=1000
LLM_TIMEOUT=15

### LEAD SCORING

#Minimum score to pass filtering (1-10)
LEAD_SCORE_THRESHOLD=3

 Threshold Guide:
   1-2: Very inclusive (almost all leads)
   3-4: Balanced (recommended)
   5-6: Selective (high-quality only)
   7-10: Very selective (perfect matches)


Test Individual Components
 Test scraper
``` python -m genai_service.utils.scrapers```

 Test extraction
``` python -m genai_service.core.extraction```

 Test enrichment
``` python -m genai_service.core.enrichment_service```

 Test LLM client
``` python -m genai_service.utils.llm_client```

Start Server
```uvicorn genai_service.api.app:app --reload```
Server runs at: http://localhost:8000
API Documentation
Interactive docs available at:
Swagger UI: http://localhost:8000/docs
Example Requests
Health Check:


curl http://localhost:8000/
Generate Leads (Single Profile):

``` curl -X POST "http://localhost:8000/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "post_url": "https://www.linkedin.com/in/johndoe/",
    "keywords": ["software", "engineer"]
  }'
  ```

Generate Leads (Multiple Profiles):
```
  curl -X POST "http://localhost:8000/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "post_url": "https://www.linkedin.com/in/john/,https://www.linkedin.com/in/jane/",
    "keywords": ["data", "scientist", "machine learning"]
  }'
  ```
Without Keyword Filtering:
curl -X POST "http://localhost:8000/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "post_url": "https://www.linkedin.com/in/johndoe/"
  }'
## Acknowledgments
Apify for web scraping infrastructure
Groq for fast LLM inference
Google Gemini for alternative LLM
FastAPI for API framework
LangChain for LLM orchestration

Built by team 1