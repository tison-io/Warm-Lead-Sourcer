import os
import pytest
from genai_service.utils.data_wrangling import email_generator, clean_company_name, export

def test_clean_company_name():
    assert clean_company_name("Tesla Motors, Inc.") == "teslamotors"
    assert clean_company_name("Microsoft Corporation") == "microsoft"
    assert clean_company_name("  Google LLC  ") == "google"
    assert clean_company_name("Unknown") == "" 

def test_email_generator_company():
    profile = {
        "name": "Elon Musk",
        "company": "Tesla Inc"
    }
    assert email_generator(profile) == "elon.musk@tesla.com"

def test_email_generator_university():
    profile = {
        "name": "Mark Z",
        "company": "", 
        "education": "Harvard University"
    }
    assert email_generator(profile) == "mark.z@harvard.edu"

def test_email_generator_fallback():
    profile = {
        "name": "John Doe",
        "company": "Self-Employed",
        "education": ""
    }
    assert email_generator(profile) == "john.doe@gmail.com"

@pytest.mark.asyncio
async def test_export_creates_file(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    
    data = [
        {"name": "Test User", "email": "test@test.com", "score": 10}
    ]
    
    filename = await export(data)
    
    assert filename == "leads.csv"
    assert (tmp_path / "leads.csv").exists()