from ..config.prompts import platform_prompt
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import logging
import os

load_dotenv()
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

# We shall have multiple LLM models for different purposes
# llama-3.1 - general
# openai 120b - scoring logic/ complex tasks


# Implement extensive error handling for model initialization
try:
    logger.info("Setting up main Groq LLM model.")
    general_model = ChatGroq(model=os.getenv("GENERAL_MODEL"), api_key=os.getenv("GROQ_API_KEY"))
    logger.info("Successfully set up general model.")
except Exception as e:
    logger.exception("Failed to set up general model. Switching to Fallback model")
    general_model = ChatGroq(model=os.getenv("FALLBACK_MODEL"), api_key=os.getenv("GROQ_API_KEY"))

try:
    logger.info("Setting up Groq LLM models.")
    core_model = ChatGroq(model=os.getenv("CORE_MODEL"), api_key=os.getenv("GROQ_API_KEY"))
    logger.info("Successfully set up core logic model.")
except Exception as e:
    logger.exception("Failed to set up core logic model. Switching to general model", e)
    core_model = ChatGroq(model=os.getenv("FALLBACK_MODEL"), api_key=os.getenv("GROQ_API_KEY"))


async def platform_detection(link) -> str:
    try:
        platform_chain = platform_prompt | core_model | StrOutputParser()
        platform = await platform_chain.ainvoke({"link": link})
        logger.info("Detected platform: %s", platform)
        logger.exception("Error detecting platform")
    except Exception as e:
        logger.exception("Error detecting platform: %s", e)
        return "unknown"
import os
from typing import Optional
from dotenv import load_dotenv
import asyncio
import json
from groq import Groq
import google.generativeai as genai

class LLMClient:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "groq").lower()
        self.temperature = float(os.getenv("LLM_TEMPERATURE", 0.3))
        self.max_tokens = int(os.getenv("LLM_MAX_TOKENS", 1000))
        self.timeout = int(os.getenv("LLM_TIMEOUT", "15"))
        
        if self.provider == "groq":
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                raise ValueError("GROQ_API_KEY is not set in environment variables.")
            self.client = Groq(api_key=api_key)
            self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        elif self.provider == "gemini":
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("GOOGLE_API_KEY is not set in environment variables.")
            genai.configure(api_key=api_key)
            self.model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
            self.client = genai.GenerativeModel(self.model_name)
            print(f"Gemini client initialized with model: {self.model_name}")
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")

    async def call(
        self,
        prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        json_mode: bool = False
    ) -> str:
        """
        Args:
            prompt (str): The prompt to send to the LLM
            temperature: Override default temperature
            max_tokens: Override default max max_tokens
            json_mode: Force json output parsing

        Returns:
            str: The response from the LLM
        """
        temp = temperature if temperature is not None else self.temperature
        tokens = max_tokens if max_tokens is not None else self.max_tokens
        
        try:
            if self.provider == "groq":
                return await self._call_groq(prompt, temp, tokens, json_mode)
            elif self.provider == "gemini":
                return await self._call_gemini(prompt, temp, tokens)
        except Exception as e:
            print(f"❌ LLM API Error ({self.provider}): {e}")
            raise

    async def _call_groq(
        self, 
        prompt: str, 
        temperature: float, 
        max_tokens: int,
        json_mode: bool
    ) -> str:
        """Call Groq API (synchronous client, but wrapped for async compatibility)"""
        
        messages = [{"role": "user", "content": prompt}]
# Groq supports JSON mode for structured outputs
        response_format = {"type": "json_object"} if json_mode else None
        
        # Run in thread pool since Groq client is sync
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
        '''call Gemini API'''
        generation_config = {
            "temperature": temperature,
            "max_output_tokens": max_tokens
        }
        loop=asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self.client.generate_text(
                prompt=prompt,
                generation_config=generation_config
            )

        )
        return response.text.strip()
    def parse_json_response(self, response: str) -> dict:
        """
        Parse JSON from LLM response, handling common formatting issues.
        """
        try:
            # Try direct parsing first
            return json.loads(response)
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code blocks
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
                return json.loads(json_str)
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
                return json.loads(json_str)
            else:
                raise ValueError(f"Could not parse JSON from response: {response[:200]}")


# Test the client
async def test_llm():
    """Test LLM connection with both providers"""
    print("\n🧪 Testing LLM Client...\n")
    
    client = LLMClient()
    
    # Test 1: Simple text generation
    print("Test 1: Simple generation")
    response = await client.call("Say 'Hello, GenAI service is working!'")
    print(f"✓ Response: {response}\n")
    
    # Test 2: JSON extraction (important for our use case)
    print("Test 2: JSON extraction")
    json_prompt = """Extract information from this text and return ONLY valid JSON:

Text: "John Doe is a Software Engineer at Google. He studied at Stanford University and lives in San Francisco, USA."

Return this format:
{
  "name": "string",
  "role": "string",
  "university": "string",
  "country": "string"
}"""
    
    json_response = await client.call(
        json_prompt, 
        json_mode=(client.provider == "groq")  # Groq supports native JSON mode
    )
    print(f"✓ JSON Response: {json_response}\n")
    
    # Parse the JSON
    try:
        data = client.parse_json_response(json_response)
        print(f"✓ Parsed data: {data}")
        print(f"✓ Role extracted: {data.get('role')}")
    except Exception as e:
        print(f"❌ JSON parsing failed: {e}")
    
    print("\n✅ LLM Client is working!")


if __name__ == "__main__":
    asyncio.run(test_llm())

    
    

    
