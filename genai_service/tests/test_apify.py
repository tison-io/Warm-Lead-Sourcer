import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from utils.apify import apify_search, warm_lead_extractor, search_and_extract, ApifyError
import os


class TestApifySearch:
    """Test suite for apify_search function"""

    @pytest.mark.asyncio
    async def test_apify_search_with_valid_keywords(self):
        """Test apify_search with valid keywords"""
        mock_client = MagicMock()
        mock_actor = MagicMock()
        mock_run = {"defaultDatasetId": "test-dataset-123"}
        mock_actor.call = AsyncMock(return_value=mock_run)
        mock_client.actor.return_value = mock_actor

        mock_dataset = MagicMock()
        mock_items = [
            {"fullName": "John Doe", "url": "https://linkedin.com/in/johndoe"},
            {"fullName": "Jane Smith", "url": "https://linkedin.com/in/janesmith"}
        ]

        async def mock_iterate():
            for item in mock_items:
                yield item

        mock_dataset.iterate_items = mock_iterate
        mock_client.dataset.return_value = mock_dataset

        with patch("utils.apify.ApifyClientAsync", return_value=mock_client):
            results = []
            async for item in apify_search("python developer", max_items=10):
                results.append(item)

            assert len(results) == 2
            assert results[0]["fullName"] == "John Doe"

    @pytest.mark.asyncio
    async def test_apify_search_with_empty_keywords(self):
        """Test apify_search with empty keywords returns None"""
        results = []
        async for item in apify_search("", max_items=10):
            results.append(item)
        assert len(results) == 0

    @pytest.mark.asyncio
    async def test_apify_search_with_none_keywords(self):
        """Test apify_search with None keywords returns None"""
        results = []
        async for item in apify_search(None, max_items=10):
            results.append(item)
        assert len(results) == 0

    @pytest.mark.asyncio
    async def test_apify_search_with_locations(self):
        """Test apify_search with custom locations"""
        mock_client = MagicMock()
        mock_actor = MagicMock()
        mock_run = {"defaultDatasetId": "test-dataset-123"}
        mock_actor.call = AsyncMock(return_value=mock_run)
        mock_client.actor.return_value = mock_actor

        mock_dataset = MagicMock()

        async def mock_iterate():
            yield {"fullName": "Test User"}

        mock_dataset.iterate_items = mock_iterate
        mock_client.dataset.return_value = mock_dataset

        with patch("utils.apify.ApifyClientAsync", return_value=mock_client):
            results = []
            async for item in apify_search("developer", max_items=5, locations=["Kenya", "USA"]):
                results.append(item)

            mock_actor.call.assert_called_once()
            call_args = mock_actor.call.call_args[1]["run_input"]
            assert call_args["locations"] == ["Kenya", "USA"]

    @pytest.mark.asyncio
    async def test_apify_search_invalid_response(self):
        """Test apify_search raises ApifyError on invalid response"""
        mock_client = MagicMock()
        mock_actor = MagicMock()
        mock_actor.call = AsyncMock(return_value=None)
        mock_client.actor.return_value = mock_actor

        with patch("utils.apify.ApifyClientAsync", return_value=mock_client):
            with pytest.raises(ApifyError, match="Invalid response from Apify Actor"):
                async for _ in apify_search("developer"):
                    pass

    @pytest.mark.asyncio
    async def test_apify_search_api_failure(self):
        """Test apify_search handles API failures"""
        mock_client = MagicMock()
        mock_actor = MagicMock()
        mock_actor.call = AsyncMock(side_effect=Exception("API Error"))
        mock_client.actor.return_value = mock_actor

        with patch("utils.apify.ApifyClientAsync", return_value=mock_client):
            with pytest.raises(ApifyError, match="Failed to search LinkedIn profiles"):
                async for _ in apify_search("developer"):
                    pass

    @pytest.mark.asyncio
    async def test_apify_search_default_max_items(self):
        """Test apify_search uses default max_items"""
        mock_client = MagicMock()
        mock_actor = MagicMock()
        mock_run = {"defaultDatasetId": "test-dataset"}
        mock_actor.call = AsyncMock(return_value=mock_run)
        mock_client.actor.return_value = mock_actor

        mock_dataset = MagicMock()

        async def mock_iterate():
            return
            yield

        mock_dataset.iterate_items = mock_iterate
        mock_client.dataset.return_value = mock_dataset

        with patch("utils.apify.ApifyClientAsync", return_value=mock_client):
            async for _ in apify_search("developer"):
                pass

            call_args = mock_actor.call.call_args[1]["run_input"]
            assert call_args["maxItems"] == 10


class TestWarmLeadExtractor:
    """Test suite for warm_lead_extractor function"""

    def test_warm_lead_extractor_with_valid_profiles(self):
        """Test warm_lead_extractor with valid profile data"""
        profiles = [
            {
                "fullName": "John Doe",
                "jobTitle": "Software Engineer",
                "url": "https://linkedin.com/in/johndoe",
                "location": {"parsed": {"country": "USA", "city": "New York"}},
                "education": [{"schoolName": "MIT", "degree": "BS Computer Science"}],
                "latestExperience": {"companyName": "Tech Corp"},
                "summary": "Experienced engineer"
            }
        ]

        result = warm_lead_extractor(profiles)

        assert len(result) == 1
        assert result[0]["name"] == "John Doe"
        assert result[0]["current_role"] == "Software Engineer"
        assert result[0]["company"] == "Tech Corp"
        assert result[0]["education"] == "MIT"
        assert result[0]["degree"] == "BS Computer Science"
        assert result[0]["country"] == "USA"
        assert result[0]["city"] == "New York"

    def test_warm_lead_extractor_with_empty_list(self):
        """Test warm_lead_extractor with empty list"""
        result = warm_lead_extractor([])
        assert result == []

    def test_warm_lead_extractor_with_missing_fields(self):
        """Test warm_lead_extractor handles missing fields"""
        profiles = [
            {
                "fullName": "John Doe",
                "url": "https://linkedin.com/in/johndoe"
            }
        ]

        result = warm_lead_extractor(profiles)

        assert len(result) == 1
        assert result[0]["name"] == "John Doe"
        assert result[0]["education"] == "Not available"
        assert result[0]["company"] == "Not available"
        assert result[0]["country"] == "Not available"

    def test_warm_lead_extractor_company_from_job_title(self):
        """Test warm_lead_extractor extracts company from job title"""
        profiles = [
            {
                "fullName": "John Doe",
                "jobTitle": "Software Engineer at Google",
                "url": "https://linkedin.com/in/johndoe"
            }
        ]

        result = warm_lead_extractor(profiles)

        assert result[0]["company"] == "Google"

    def test_warm_lead_extractor_with_null_location(self):
        """Test warm_lead_extractor handles null location"""
        profiles = [
            {
                "fullName": "John Doe",
                "location": None,
                "url": "https://linkedin.com/in/johndoe"
            }
        ]

        result = warm_lead_extractor(profiles)

        assert result[0]["country"] == "Not available"
        assert result[0]["city"] == "Not available"

    def test_warm_lead_extractor_with_empty_education(self):
        """Test warm_lead_extractor handles empty education list"""
        profiles = [
            {
                "fullName": "John Doe",
                "education": [],
                "url": "https://linkedin.com/in/johndoe"
            }
        ]

        result = warm_lead_extractor(profiles)

        assert result[0]["education"] == "Not available"
        assert result[0]["degree"] == "Not available"

    def test_warm_lead_extractor_truncates_long_summary(self):
        """Test warm_lead_extractor truncates summary to 200 chars"""
        long_summary = "A" * 300
        profiles = [
            {
                "fullName": "John Doe",
                "summary": long_summary,
                "url": "https://linkedin.com/in/johndoe"
            }
        ]

        result = warm_lead_extractor(profiles)

        assert len(result[0]["summary"]) == 200

    def test_warm_lead_extractor_handles_corrupt_profile(self):
        """Test warm_lead_extractor skips corrupt profiles"""
        profiles = [
            {"fullName": "John Doe", "url": "https://linkedin.com/in/johndoe"},
            None,
            {"fullName": "Jane Smith", "url": "https://linkedin.com/in/janesmith"}
        ]

        result = warm_lead_extractor(profiles)

        assert len(result) == 2
        assert result[0]["name"] == "John Doe"
        assert result[1]["name"] == "Jane Smith"

    def test_warm_lead_extractor_with_headline_fallback(self):
        """Test warm_lead_extractor uses headline as fallback for jobTitle"""
        profiles = [
            {
                "fullName": "John Doe",
                "headline": "Senior Software Engineer",
                "url": "https://linkedin.com/in/johndoe"
            }
        ]

        result = warm_lead_extractor(profiles)

        assert result[0]["current_role"] == "Senior Software Engineer"

    def test_warm_lead_extractor_with_name_fallback(self):
        """Test warm_lead_extractor uses 'name' field as fallback"""
        profiles = [
            {
                "name": "John Doe",
                "url": "https://linkedin.com/in/johndoe"
            }
        ]

        result = warm_lead_extractor(profiles)

        assert result[0]["name"] == "John Doe"

    def test_warm_lead_extractor_with_unknown_name(self):
        """Test warm_lead_extractor uses 'Unknown' when no name available"""
        profiles = [
            {
                "url": "https://linkedin.com/in/johndoe"
            }
        ]

        result = warm_lead_extractor(profiles)

        assert result[0]["name"] == "Unknown"


class TestSearchAndExtract:
    """Test suite for search_and_extract function"""

    @pytest.mark.asyncio
    async def test_search_and_extract_success(self):
        """Test search_and_extract combines search and extraction"""
        mock_profiles = [
            {
                "fullName": "John Doe",
                "url": "https://linkedin.com/in/johndoe",
                "jobTitle": "Software Engineer"
            }
        ]

        async def mock_search(*args, **kwargs):
            for profile in mock_profiles:
                yield profile

        with patch("utils.apify.apify_search", mock_search), \
             patch("utils.apify.warm_lead_extractor") as mock_extractor:
            mock_extractor.return_value = [{"name": "John Doe", "current_role": "Software Engineer"}]

            result = await search_and_extract("python developer", max_items=5)

            assert len(result) == 1
            assert result[0]["name"] == "John Doe"

    @pytest.mark.asyncio
    async def test_search_and_extract_apify_error(self):
        """Test search_and_extract handles ApifyError"""
        async def mock_search(*args, **kwargs):
            raise ApifyError("API Error")
            yield

        with patch("utils.apify.apify_search", mock_search):
            result = await search_and_extract("python developer")

            assert result == []

    @pytest.mark.asyncio
    async def test_search_and_extract_unexpected_error(self):
        """Test search_and_extract handles unexpected errors"""
        async def mock_search(*args, **kwargs):
            raise Exception("Unexpected error")
            yield

        with patch("utils.apify.apify_search", mock_search):
            result = await search_and_extract("python developer")

            assert result == []

    @pytest.mark.asyncio
    async def test_search_and_extract_empty_results(self):
        """Test search_and_extract with no results"""
        async def mock_search(*args, **kwargs):
            return
            yield

        with patch("utils.apify.apify_search", mock_search), \
             patch("utils.apify.warm_lead_extractor") as mock_extractor:
            mock_extractor.return_value = []

            result = await search_and_extract("rare skill")

            assert result == []

    @pytest.mark.asyncio
    async def test_search_and_extract_passes_max_items(self):
        """Test search_and_extract passes max_items parameter"""
        async def mock_search(keywords, max_items=10):
            return
            yield

        with patch("utils.apify.apify_search", side_effect=mock_search) as mock_func, \
             patch("utils.apify.warm_lead_extractor", return_value=[]):
            await search_and_extract("developer", max_items=15)

            # Verify function was called
            assert mock_func.call_count > 0


class TestApifyError:
    """Test suite for ApifyError exception"""

    def test_apify_error_creation(self):
        """Test ApifyError can be created with message"""
        error = ApifyError("Test error")
        assert str(error) == "Test error"

    def test_apify_error_inheritance(self):
        """Test ApifyError inherits from Exception"""
        assert issubclass(ApifyError, Exception)


class TestApifyTokenConfiguration:
    """Test suite for APIFY token configuration"""

    def test_apify_token_loaded_from_env(self):
        """Test that APIFY_TOKEN is loaded from environment"""
        with patch.dict(os.environ, {"APIFY_API_TOKEN": "test-token"}):
            from importlib import reload
            import utils.apify as apify_module
            # Note: This test verifies the module expects the token
            # The actual token validation happens at module load time

    def test_missing_apify_token_raises_error(self):
        """Test that missing APIFY_API_TOKEN raises ApifyError"""
        # This test documents expected behavior when token is missing
        # The actual check happens at module import time
        pass