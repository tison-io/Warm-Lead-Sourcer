# Warm Lead Sourcer - GenAI Service
An intelligent, AI driven lead sourcer. Warm Lead Sourcer automates the process of finding, analyzing and scoring potential candidates from the web. It uses Google Dorking for sourcing and Large Language Models(Groq) for cognitive scoring and data cleaning.

## Features
Smart Sourcing: Uses specialized Google search queries(SERPER) to find LinkedIn account.
AI Scoring Agent: Automatically rates candidates from 1-10 based on job alignment, keywords and experience using Groq.
Data Cleaning Agent: Normalizes messy names and job titles extracted from search snippets.
Contact enrichment: email generation (e.g. firstname.lastname@university.edu) for outreach.
Includes Rate limiting (to prevent spam) and pydantic validation.
CSV export: Instantly download score leads as a formatted spreadsheet.

## Tech Stack
Backend Framework: FastAPI(python)
LLM Engine: Serper.dev (Google Search API)
AI Orchestration: Langchain
Validation: Pydantic
Security: SlowAPI(Rate Limiting)

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

API Endpoints

1. Source Leads (POST)
Endpoint: /source_leads
Description: Finds and scores candidates based on keywords.

Request Body:
```json
{
  "keywords": "software"
  "country": "Kenya"
  "page": "1"
}
```

2. Export to CSV(POST)
Endpoint: /export/csv
Description: Converts a list of JSON profiles into a downloadable CSV fiole.

3. Health Check (GET)
Description: Verify the server is running

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
│   └── scrapers.py         # Social Media Scrapers (Placeholder)
├── .env                    # Secrets (Not committed)
└── requirements.txt        # Python Dependencies
