import pytest
import os
import sys

# Set up environment variables BEFORE any imports
os.environ["GROQ_API_KEY"] = "test-groq-api-key"
os.environ["APIFY_API_TOKEN"] = "test-apify-token"


@pytest.fixture(autouse=True)
def mock_env_variables(monkeypatch):
    """Automatically set environment variables for all tests"""
    monkeypatch.setenv("GROQ_API_KEY", "test-groq-api-key")
    monkeypatch.setenv("APIFY_API_TOKEN", "test-apify-token")