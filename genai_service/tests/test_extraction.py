import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from core.extraction import link_validation, MainPipeline
from models.schemas import GeneralProfile


class TestLinkValidation:
    """Test suite for link_validation function"""

    def test_valid_linkedin_url_https(self):
        """Test validation of valid HTTPS LinkedIn URL"""
        assert link_validation("https://www.linkedin.com/in/johndoe") is True

    def test_valid_linkedin_url_http(self):
        """Test validation of valid HTTP LinkedIn URL"""
        assert link_validation("http://www.linkedin.com/in/johndoe") is True

    def test_valid_linkedin_url_subdomain(self):
        """Test validation of LinkedIn URL with subdomain"""
        assert link_validation("https://es.linkedin.com/in/johndoe") is True

    def test_valid_linkedin_url_company(self):
        """Test validation of LinkedIn company URL"""
        assert link_validation("https://www.linkedin.com/company/microsoft") is True

    def test_invalid_url_wrong_domain(self):
        """Test rejection of non-LinkedIn URL"""
        assert link_validation("https://www.facebook.com/profile") is False

    def test_invalid_url_no_protocol(self):
        """Test rejection of URL without protocol"""
        assert link_validation("www.linkedin.com/in/johndoe") is False

    def test_invalid_url_empty_string(self):
        """Test rejection of empty string"""
        assert link_validation("") is False

    def test_invalid_url_malformed(self):
        """Test rejection of malformed URL"""
        assert link_validation("not-a-url") is False

    def test_case_insensitive_validation(self):
        """Test that validation is case-insensitive"""
        assert link_validation("HTTPS://WWW.LINKEDIN.COM/in/johndoe") is True


class TestMainPipeline:
    """Test suite for MainPipeline class"""

    @pytest.fixture
    def pipeline(self):
        """Create a MainPipeline instance for testing"""
        return MainPipeline()

    @pytest.mark.asyncio
    async def test_run_pipeline_with_invalid_link(self, pipeline):
        """Test pipeline raises ValueError for invalid LinkedIn link"""
        with pytest.raises(ValueError, match="not a valid LinkedIn URL"):
            await pipeline.run_pipeline(link="https://invalid-site.com/profile")

    @pytest.mark.asyncio
    async def test_run_pipeline_with_linkedin_link(self, pipeline):
        """Test pipeline with LinkedIn link raises NotImplementedError"""
        with patch("core.extraction.platform_detection", new_callable=AsyncMock) as mock_platform:
            mock_platform.return_value = "linkedin"

            with pytest.raises(NotImplementedError, match="LinkedIn extraction not implemented"):
                await pipeline.run_pipeline(link="https://www.linkedin.com/in/johndoe")

    @pytest.mark.asyncio
    async def test_run_pipeline_with_unknown_platform(self, pipeline):
        """Test pipeline raises ValueError for unknown platform"""
        with patch("core.extraction.platform_detection", new_callable=AsyncMock) as mock_platform:
            mock_platform.return_value = "unknown"

            with pytest.raises(ValueError, match="does not belong to a supported platform"):
                await pipeline.run_pipeline(link="https://www.linkedin.com/in/johndoe")

    @pytest.mark.asyncio
    async def test_run_pipeline_platform_detection_error(self, pipeline):
        """Test pipeline handles platform detection errors"""
        with patch("core.extraction.platform_detection", new_callable=AsyncMock) as mock_platform:
            mock_platform.side_effect = Exception("API Error")

            with pytest.raises(Exception, match="API Error"):
                await pipeline.run_pipeline(link="https://www.linkedin.com/in/johndoe")

    @pytest.mark.asyncio
    async def test_run_pipeline_with_keywords_only(self, pipeline):
        """Test pipeline with keywords performs Apify search"""
        mock_profiles = [
            {
                "name": "John Doe",
                "linkedin_url": "https://www.linkedin.com/in/johndoe",
                "current_role": "Software Engineer",
                "company": "Tech Corp",
                "education": "MIT",
                "country": "USA"
            }
        ]

        with patch("core.extraction.search_and_extract", new_callable=AsyncMock) as mock_search, \
             patch("core.extraction.email_generator") as mock_email, \
             patch("core.extraction.calculate_score", new_callable=AsyncMock) as mock_score:

            mock_search.return_value = mock_profiles
            mock_email.return_value = "john.doe@mit.edu"
            mock_score.return_value = 8

            result = await pipeline.run_pipeline(keywords="python developer")

            assert len(result) == 1
            assert isinstance(result[0], GeneralProfile)
            assert result[0].name == "John Doe"
            assert result[0].email == "john.doe@mit.edu"
            assert result[0].score == 8
            mock_search.assert_called_once_with(keywords="python developer", max_items=5)

    @pytest.mark.asyncio
    async def test_run_pipeline_with_keywords_and_country(self, pipeline):
        """Test pipeline combines keywords with country in search"""
        with patch("core.extraction.search_and_extract", new_callable=AsyncMock) as mock_search:
            mock_search.return_value = []

            await pipeline.run_pipeline(keywords="python developer", country="Kenya")

            mock_search.assert_called_once_with(keywords="python developer Kenya", max_items=5)

    @pytest.mark.asyncio
    async def test_run_pipeline_with_empty_apify_results(self, pipeline):
        """Test pipeline returns empty list when Apify returns no profiles"""
        with patch("core.extraction.search_and_extract", new_callable=AsyncMock) as mock_search:
            mock_search.return_value = []

            result = await pipeline.run_pipeline(keywords="rare skillset")

            assert result == []

    @pytest.mark.asyncio
    async def test_run_pipeline_with_multiple_profiles(self, pipeline):
        """Test pipeline processes multiple profiles correctly"""
        mock_profiles = [
            {
                "name": "John Doe",
                "linkedin_url": "https://www.linkedin.com/in/johndoe",
                "current_role": "Software Engineer",
                "company": "Tech Corp",
                "education": "MIT",
                "country": "USA"
            },
            {
                "name": "Jane Smith",
                "linkedin_url": "https://www.linkedin.com/in/janesmith",
                "current_role": "Data Scientist",
                "company": "Data Inc",
                "education": "Stanford",
                "country": "USA"
            }
        ]

        with patch("core.extraction.search_and_extract", new_callable=AsyncMock) as mock_search, \
             patch("core.extraction.email_generator") as mock_email, \
             patch("core.extraction.calculate_score", new_callable=AsyncMock) as mock_score:

            mock_search.return_value = mock_profiles
            mock_email.side_effect = ["john.doe@mit.edu", "jane.smith@stanford.edu"]
            mock_score.side_effect = [8, 9]

            result = await pipeline.run_pipeline(keywords="python developer")

            assert len(result) == 2
            assert result[0].name == "John Doe"
            assert result[1].name == "Jane Smith"

    @pytest.mark.asyncio
    async def test_run_pipeline_apify_extraction_error(self, pipeline):
        """Test pipeline handles Apify extraction errors"""
        with patch("core.extraction.search_and_extract", new_callable=AsyncMock) as mock_search:
            mock_search.side_effect = Exception("Apify API Error")

            with pytest.raises(Exception, match="Apify API Error"):
                await pipeline.run_pipeline(keywords="python developer")

    @pytest.mark.asyncio
    async def test_run_pipeline_no_input_provided(self, pipeline):
        """Test pipeline raises ValueError when no link or keywords provided"""
        with pytest.raises(ValueError, match="Either a link or keywords must be provided"):
            await pipeline.run_pipeline()

    @pytest.mark.asyncio
    async def test_run_pipeline_with_none_values(self, pipeline):
        """Test pipeline handles None values correctly"""
        with pytest.raises(ValueError, match="Either a link or keywords must be provided"):
            await pipeline.run_pipeline(link=None, keywords=None)

    @pytest.mark.asyncio
    async def test_run_pipeline_score_calculation_with_keywords(self, pipeline):
        """Test that score calculation receives split keywords"""
        mock_profiles = [
            {
                "name": "John Doe",
                "linkedin_url": "https://www.linkedin.com/in/johndoe",
                "current_role": "Software Engineer",
                "company": "Tech Corp",
                "education": "MIT",
                "country": "USA"
            }
        ]

        with patch("core.extraction.search_and_extract", new_callable=AsyncMock) as mock_search, \
             patch("core.extraction.email_generator") as mock_email, \
             patch("core.extraction.calculate_score", new_callable=AsyncMock) as mock_score:

            mock_search.return_value = mock_profiles
            mock_email.return_value = "john.doe@mit.edu"
            mock_score.return_value = 7

            await pipeline.run_pipeline(keywords="python developer senior")

            mock_score.assert_called_once_with(mock_profiles[0], ["python", "developer", "senior"])

    @pytest.mark.asyncio
    async def test_run_pipeline_profile_with_missing_fields(self, pipeline):
        """Test pipeline handles profiles with missing optional fields"""
        mock_profiles = [
            {
                "name": "John Doe",
                "linkedin_url": None,
                "current_role": None,
                "company": None,
                "education": None,
                "country": None
            }
        ]

        with patch("core.extraction.search_and_extract", new_callable=AsyncMock) as mock_search, \
             patch("core.extraction.email_generator") as mock_email, \
             patch("core.extraction.calculate_score", new_callable=AsyncMock) as mock_score:

            mock_search.return_value = mock_profiles
            mock_email.return_value = "john.doe@systemgenerated.edu"
            mock_score.return_value = 5

            result = await pipeline.run_pipeline(keywords="developer")

            assert len(result) == 1
            assert result[0].name == "John Doe"
            assert result[0].linkedin_url is None
            assert result[0].score == 5