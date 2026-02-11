import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import os


class TestPlatformDetectionSimple:
    """Simplified test suite for platform_detection function"""

    @pytest.mark.asyncio
    async def test_platform_detection_empty_link(self):
        """Test platform detection with empty link"""
        from utils.llm_client import platform_detection
        result = await platform_detection("")
        assert result == "unknown"

    @pytest.mark.asyncio
    async def test_platform_detection_none_link(self):
        """Test platform detection with None link"""
        from utils.llm_client import platform_detection
        result = await platform_detection(None)
        assert result == "unknown"

    @pytest.mark.asyncio
    async def test_platform_detection_error_handling(self):
        """Test platform detection handles errors gracefully"""
        from utils import llm_client

        # Patch the entire chain to raise an error
        mock_parser = MagicMock()
        mock_parser.ainvoke = AsyncMock(side_effect=Exception("Test error"))

        with patch("utils.llm_client.StrOutputParser", return_value=mock_parser):
            result = await llm_client.platform_detection("https://test.com")
            assert result == "unknown"


class TestCalculateScoreSimple:
    """Simplified test suite for calculate_score function"""

    @pytest.mark.asyncio
    async def test_calculate_score_invalid_response(self):
        """Test calculate_score defaults to 5 on invalid response"""
        from utils import llm_client

        # Return invalid response that can't be parsed
        mock_parser = MagicMock()
        mock_parser.ainvoke = AsyncMock(return_value="invalid response")

        with patch("utils.llm_client.StrOutputParser", return_value=mock_parser):
            result = await llm_client.calculate_score({"name": "Test"}, ["keyword"])
            assert result == 5

    @pytest.mark.asyncio
    async def test_calculate_score_error_handling(self):
        """Test calculate_score returns 5 on exception"""
        from utils import llm_client

        mock_parser = MagicMock()
        mock_parser.ainvoke = AsyncMock(side_effect=Exception("Test error"))

        with patch("utils.llm_client.StrOutputParser", return_value=mock_parser):
            result = await llm_client.calculate_score({"name": "Test"}, ["keyword"])
            assert result == 5


class TestProfileDiscoverySimple:
    """Simplified test suite for profile_discovery function"""

    @pytest.mark.asyncio
    async def test_profile_discovery_with_empty_list(self):
        """Test profile_discovery returns empty list for empty input"""
        from utils.llm_client import profile_discovery
        result = await profile_discovery([])
        assert result == []

    @pytest.mark.asyncio
    async def test_profile_discovery_handles_errors(self):
        """Test profile_discovery handles errors in batch processing"""
        from utils import llm_client

        # Mock to simulate error in processing
        mock_parser = MagicMock()
        mock_parser.ainvoke = AsyncMock(side_effect=Exception("Batch error"))

        with patch("utils.llm_client.JsonOutputParser", return_value=mock_parser):
            result = await llm_client.profile_discovery([{"name": "Test"}])
            # Should return empty list when all batches fail
            assert isinstance(result, list)


class TestModelConfiguration:
    """Test suite for model configuration and initialization"""

    def test_default_models_configuration(self):
        """Test default model names are configured"""
        from utils.llm_client import DEFAULT_GENERAL_MODEL, DEFAULT_CORE_MODEL, DEFAULT_FALLBACK_MODEL

        assert DEFAULT_GENERAL_MODEL == "llama-3.3-70b-versatile"
        assert DEFAULT_CORE_MODEL == "llama-3.3-70b-versatile"
        assert DEFAULT_FALLBACK_MODEL == "llama-3.1-8b-instant"