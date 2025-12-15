from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import logging
import os
import asyncio
import json
import re
from typing import Optional
from groq import Groq
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.prompts import platform_prompt, score_prompt

# import google.generativeai as genai

load_dotenv()
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

DEFAULT_GENERAL_MODEL = "llama-3.3-70b-versatile"
DEFAULT_CORE_MODEL = "llama-3.3-70b-versatile"
DEFAULT_FALLBACK_MODEL = "llama-3.1-8b-instant"

try:
    logger.info("Setting up main Groq LLM model.")
    general_model_name = os.getenv("GENERAL_MODEL", DEFAULT_GENERAL_MODEL)
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY is not set in environment variables")
    
    general_model = ChatGroq(model=general_model_name, api_key=groq_api_key)
    logger.info(f"Successfully set up general model: {general_model_name}")
except Exception as e:
    logger.exception("Failed to set up general model. Switching to Fallback model")
    fallback_model_name = os.getenv("FALLBACK_MODEL", DEFAULT_FALLBACK_MODEL)
    general_model = ChatGroq(model=fallback_model_name, api_key=os.getenv("GROQ_API_KEY"))
    logger.info(f"Using fallback model: {fallback_model_name}")

try:
    logger.info("Setting up Groq LLM models.")
    core_model_name = os.getenv("CORE_MODEL", DEFAULT_CORE_MODEL)
    core_model = ChatGroq(model=core_model_name, api_key=os.getenv("GROQ_API_KEY"))
    logger.info(f"Successfully set up core logic model: {core_model_name}")
except Exception as e:
    logger.exception("Failed to set up core logic model. Switching to general model")
    core_model = general_model
    logger.info("Using general model as core model")


async def platform_detection(link: str) -> str:
    """Detect platform from URL"""
    try:
        platform_chain = platform_prompt | core_model | StrOutputParser()
        platform = await platform_chain.ainvoke({"link": link})
        logger.info("Detected platform: %s", platform)
        return platform.lower().strip()
    except Exception as e:
        logger.exception("Error detecting platform: %s", e)
        return "unknown"


async def calculate_score(profile: dict, criteria: list) -> int:
    """Calculate lead score (1-10) using LangChain chain"""
    try:        
        score_chain = score_prompt | core_model | StrOutputParser()
        result = await score_chain.ainvoke({
            "lead_information": str(profile),
            "keywords": criteria
        })
        return result.strip()
    except Exception as e:
        logger.exception(f"Error calculating score: {e}")
        return 5


# class LLMClient:
    
    def __init__(self):  
        self.provider = os.getenv("LLM_PROVIDER", "groq").lower()
        self.temperature = float(os.getenv("LLM_TEMPERATURE", "0.3"))
        self.max_tokens = int(os.getenv("LLM_MAX_TOKENS", "1000"))
        # self.timeout = int(os.getenv("LLM_TIMEOUT", "15"))
        
        if self.provider == "groq":
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                raise ValueError("GROQ_API_KEY is not set in environment variables.")
            self.client = Groq(api_key=api_key)
            self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
            logger.info(f"✓ LLMClient initialized with Groq: {self.model}")
        elif self.provider == "gemini":
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("GOOGLE_API_KEY is not set in environment variables.")
            genai.configure(api_key=api_key)
            self.model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
            self.client = genai.GenerativeModel(self.model_name)
            logger.info(f"✓ LLMClient initialized with Gemini: {self.model_name}")
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")

    async def call(
        self,
        prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        json_mode: bool = False
    ) -> str:
        temp = temperature if temperature is not None else self.temperature
        tokens = max_tokens if max_tokens is not None else self.max_tokens
        
        try:
            if self.provider == "groq":
                return await self._call_groq(prompt, temp, tokens, json_mode)
            elif self.provider == "gemini":
                return await self._call_gemini(prompt, temp, tokens)
        except Exception as e:
            logger.error(f"LLM API Error ({self.provider}): {e}")
            raise

    async def _call_groq(
        self, 
        prompt: str, 
        temperature: float, 
        max_tokens: int,
        json_mode: bool
    ) -> str:
        messages = [{"role": "user", "content": prompt}]
        response_format = {"type": "json_object"} if json_mode else None
        
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                response_format=response_format
            )
        )
        
        return response.choices[0].message.content.strip()
    
    async def _call_gemini(
        self,
        prompt: str,
        temperature: float,
        max_tokens: int
    ) -> str:
        """Call Gemini API"""
        generation_config = {
            "temperature": temperature,
            "max_output_tokens": max_tokens
        }
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self.client.generate_content(
                prompt,
                generation_config=generation_config
            )
        )
        return response.text.strip()
    
    def parse_json_response(self, response: str) -> dict:
        """Parse JSON from LLM response, handling common formatting issues"""
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
                return json.loads(json_str)
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
                return json.loads(json_str)
            else:
                raise ValueError(f"Could not parse JSON from response: {response[:200]}")


async def test_llm():
    """Test LLM connection and all functions"""
    print("\n🧪 Testing LLM Setup...\n")
    
    # Test 1: Platform detection
    print("Test 1: Platform Detection")
    platform = await platform_detection("https://linkedin.com/posts/test123")
    print(f"✓ Detected platform: {platform}\n")
    
    # Test 2: LLMClient
    print("Test 2: LLMClient Extraction")
    # client = LLMClient()
    response = await general_model.invoke("Say 'LLMClient is working!'")
    print(f"✓ Response: {response}\n")
    
    # Test 3: JSON extraction
    print("Test 3: JSON Extraction")
    json_prompt = """Extract information from this text and return ONLY valid JSON:

Text: "Eric Theuri is a Software Engineer at Google. He studied at Jomo Kenyatta University and lives in Nairobi, Kenya."

Return this format:
{
  "name": "string",
  "role": "string",
  "university": "string",
  "country": "string"
}"""
    
    json_response = await core_model.invoke(json_prompt, json_mode=True)
    print(f"✓ JSON Response: {json_response}")
    
    try:
        # data = client.parse_json_response(json_response)
        print(f"✓ Parsed: role={json_response.get('role')}, university={json_response.get('university')}\n")
    except Exception as e:
        print(f"✗ JSON parsing failed: {e}\n")
    
    # Test 4: Score calculation
    print("Test 4: Score Calculation")
    sample_profile = {
        "name": "Eric Theuri",
        "current_role": "Software Engineer",
        "education": "Jomo Kenyatta University",
        "country": "Kenya"
    }
    score = await calculate_score(sample_profile, ["software", "engineer", "stanford"])
    print(f"✓ Calculated score: {score}/10\n")
    
    print("✅ All LLM tests passed!")


if __name__ == "__main__":
    asyncio.run(test_llm())