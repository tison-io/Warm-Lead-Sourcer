# Warm Lead Sourcer - GenAI Service
Warm Lead Sourcer is an AI-powered service designed to automate the extraction, enrichment and scoring of potential leads from LinkedIn. It acts as a centralized backend that accepts LinkedIn profile URLs or search keywords, scraped detailed public data, generates email addresses and uses Groq to score lead quality against professional standards.

## Features
Hybrid Scraping engine: Automatically switches strategies to ensure reliability:
Keyword search: Uses apify actors for broad discovery.
Direct Enrichment: Uses HarvestAPI to bypass login walls for specific profile links.
AI Scoring Agent: Automatically rates candidates from 1-10 based on job alignment, keywords and experience using Groq.
Smart Data Normalization: A robust extraction pipeline that handles inconsistent data formats, missing job titles and split name fields to prevent "unknown" data errors.
Contact enrichment: email generation (e.g. firstname.lastname@university.edu) for outreach.
Includes Rate limiting (to prevent spam) and pydantic validation.
Caching system: Caches search results to minimize APU costs and latency for repeated queries.
CSV export: Instantly download score leads as a formatted spreadsheet.
Production ready: Dockerized, deployed on Render, and secured with CORS for frontend integration.

## Tech Stack
Backend Framework: FastAPI(python)
LLM Engine: Groq API (Llama -3.3-70b versatile)
AI Orchestration: Langchain
Scraping: Apify client (Async)
Validation: Pydantic
Security: SlowAPI(Rate Limiting) and CORS middleware

## Quick Start
### Prerequisites
Python 3.11 or higher
Groq API Key (for intelligence)
Serper API Key(for Search)

## Installation

1. Clone repository
``` git clone https://github.com/tison-io/Warm-Lead-Sourcer ```
``` cd genai_service ```

2. Create virtual environment
``` python -m venv venv ```

3. Activate virtual environment
 Windows:
``` venv\Scripts\activate ```
 Mac/Linux:
``` source venv/bin/activate ```

4. Install dependencies
``` pip install -r requirements.txt```

5. Configure environment variables
``` touch .env ```
Add your keys to the file:
``` GROQ_API_KEY=your_groq_api_key_here```
```SERPER_API_KEY=your_serper_api_key_here```

## Usage
### Start the server
Run the application using Uvicorn from the root directory.

``` Uvicorn core.main:app --reload```

 Visit API docs at http://localhost:8000/docs

## API Endpoints
1. Enrich Leads (Integration endpoint)
The frontend sends a list of LinkedIn URLs and the backend returns fully enriched profiles.
Endpoint: POST /api/enrich
Content-type: application/json

Request Body:
```json
{
  "links": [
    "https://www.linkedin.com/in/johndoe",
    "https://www.linkedin.com/in/annjane"
  ]
}
```

2. Source Leads (POST)
Discovery mode. Finds new leads based on job titles and location.
Endpoint: POST /source_leads
Content-Type: application/json


Request Body:
```json
{
  "keywords": "software"
  "country": "Kenya"
  "page": "1"
}
```


3 . Export to CSV(POST)
Endpoint: /export/csv
Description: Converts a list of JSON profiles into a downloadable CSV fiole.

4. Health Check (GET)
Description: Verify the server is running

## Deployment (Docker)
The application is containerized for easy deployment

Build the image
```docker build -t genai_service .```
Run the container
``` docker run -p 8000:8000 --env-file .env genai_service```
Live Production URL
https://warm-lead-sourcer-ix9n.onrender.com/

## Project Structure

```text
genai_service
├── config/                 # AI System Instructions
│   └── prompts.py          # Prompts for Scoring, Sourcing, and Cleaning
├── core/                   # Core Application Logic
│   ├── main.py             # API Entry Point & Server Config
│   └── extraction.py       # Workflow Orchestrator
├── models/                 # Data Blueprints
│   └── schemas.py          # Pydantic Models for Validation
├── utils/                  # The Toolkit
│   ├── llm_client.py       # Groq/LangChain Integration
│   ├── serper.py           # Google Search Logic
│   ├── data_wrangling.py   # Data Scoring & Formatting
│   └── scrapers.py 
    |__ caching.py            # search result caching
├── .env                    # Secrets (Not committed)
└── requirements.txt        # Python Dependencies
