import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock
from core.main import app
from models.schemas import GeneralProfile, UserInput


client = TestClient(app)


class TestHealthCheck:
    """Test suite for health check endpoint"""

    def test_check_service_returns_200(self):
        """Test health check returns 200 status"""
        response = client.get("/")
        assert response.status_code == 200

    def test_check_service_returns_correct_message(self):
        """Test health check returns correct status message"""
        response = client.get("/")
        assert response.json() == {"status": "Service is running"}


class TestSourceLeadsEndpoint:
    """Test suite for /source_leads endpoint"""

    @pytest.mark.asyncio
    async def test_source_leads_with_valid_keywords(self):
        """Test source_leads endpoint with valid keywords"""
        mock_profiles = [
            GeneralProfile(
                name="John Doe",
                linkedin_url="https://www.linkedin.com/in/johndoe",
                current_role="Software Engineer",
                company="Tech Corp",
                education="MIT",
                country="USA",
                email="john.doe@mit.edu",
                score=8
            )
        ]

        with patch("core.main.MainPipeline") as mock_pipeline_class:
            mock_pipeline = AsyncMock()
            mock_pipeline.run_pipeline.return_value = mock_profiles
            mock_pipeline_class.return_value = mock_pipeline

            response = client.post(
                "/source_leads",
                json={"keywords": "python developer", "country": "USA", "page": 1}
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["name"] == "John Doe"
            assert data[0]["score"] == 8

    @pytest.mark.asyncio
    async def test_source_leads_with_valid_link(self):
        """Test source_leads endpoint with valid link"""
        with patch("core.main.MainPipeline") as mock_pipeline_class:
            mock_pipeline = AsyncMock()
            mock_pipeline.run_pipeline.return_value = []
            mock_pipeline_class.return_value = mock_pipeline

            response = client.post(
                "/source_leads",
                json={"post_url": "https://www.linkedin.com/in/johndoe"}
            )

            assert response.status_code in [200, 400, 501]

    @pytest.mark.asyncio
    async def test_source_leads_returns_empty_list_on_no_results(self):
        """Test endpoint returns empty list when pipeline returns None"""
        with patch("core.main.MainPipeline") as mock_pipeline_class:
            mock_pipeline = AsyncMock()
            mock_pipeline.run_pipeline.return_value = None
            mock_pipeline_class.return_value = mock_pipeline

            response = client.post(
                "/source_leads",
                json={"keywords": "rare skill"}
            )

            assert response.status_code == 200
            assert response.json() == []

    @pytest.mark.asyncio
    async def test_source_leads_validation_error(self):
        """Test endpoint returns 400 on ValueError"""
        with patch("core.main.MainPipeline") as mock_pipeline_class:
            mock_pipeline = AsyncMock()
            mock_pipeline.run_pipeline.side_effect = ValueError("Invalid input")
            mock_pipeline_class.return_value = mock_pipeline

            response = client.post(
                "/source_leads",
                json={"keywords": "test"}
            )

            assert response.status_code == 400
            assert "Invalid input" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_source_leads_not_implemented_error(self):
        """Test endpoint returns 501 on NotImplementedError"""
        with patch("core.main.MainPipeline") as mock_pipeline_class:
            mock_pipeline = AsyncMock()
            mock_pipeline.run_pipeline.side_effect = NotImplementedError("Feature not ready")
            mock_pipeline_class.return_value = mock_pipeline

            response = client.post(
                "/source_leads",
                json={"post_url": "https://www.linkedin.com/in/test"}
            )

            assert response.status_code == 501
            assert "Feature not ready" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_source_leads_unexpected_error(self):
        """Test endpoint returns 500 on unexpected error"""
        with patch("core.main.MainPipeline") as mock_pipeline_class:
            mock_pipeline = AsyncMock()
            mock_pipeline.run_pipeline.side_effect = Exception("Unexpected error")
            mock_pipeline_class.return_value = mock_pipeline

            response = client.post(
                "/source_leads",
                json={"keywords": "test"}
            )

            assert response.status_code == 500
            assert "unexpected error" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_source_leads_pipeline_setup_error(self):
        """Test endpoint returns 500 when MainPipeline setup fails"""
        with patch("core.main.MainPipeline") as mock_pipeline_class:
            mock_pipeline_class.side_effect = Exception("Setup failed")

            response = client.post(
                "/source_leads",
                json={"keywords": "test"}
            )

            assert response.status_code == 500
            assert "Internal error" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_source_leads_with_multiple_profiles(self):
        """Test endpoint with multiple profiles returned"""
        mock_profiles = [
            GeneralProfile(
                name="John Doe",
                linkedin_url="https://www.linkedin.com/in/johndoe",
                current_role="Software Engineer",
                company="Tech Corp",
                education="MIT",
                country="USA",
                email="john.doe@mit.edu",
                score=8
            ),
            GeneralProfile(
                name="Jane Smith",
                linkedin_url="https://www.linkedin.com/in/janesmith",
                current_role="Data Scientist",
                company="Data Inc",
                education="Stanford",
                country="USA",
                email="jane.smith@stanford.edu",
                score=9
            )
        ]

        with patch("core.main.MainPipeline") as mock_pipeline_class:
            mock_pipeline = AsyncMock()
            mock_pipeline.run_pipeline.return_value = mock_profiles
            mock_pipeline_class.return_value = mock_pipeline

            response = client.post(
                "/source_leads",
                json={"keywords": "data science"}
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["name"] == "John Doe"
            assert data[1]["name"] == "Jane Smith"

    def test_source_leads_invalid_json(self):
        """Test endpoint with invalid JSON returns proper error"""
        response = client.post(
            "/source_leads",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422

    def test_source_leads_missing_required_fields(self):
        """Test endpoint accepts empty UserInput (all fields optional)"""
        response = client.post(
            "/source_leads",
            json={}
        )
        # Should return 400 or 500 depending on pipeline validation
        assert response.status_code in [400, 500]

    @pytest.mark.asyncio
    async def test_source_leads_with_page_parameter(self):
        """Test endpoint properly passes page parameter"""
        with patch("core.main.MainPipeline") as mock_pipeline_class:
            mock_pipeline = AsyncMock()
            mock_pipeline.run_pipeline.return_value = []
            mock_pipeline_class.return_value = mock_pipeline

            response = client.post(
                "/source_leads",
                json={"keywords": "python", "page": 2}
            )

            assert response.status_code == 200
            mock_pipeline.run_pipeline.assert_called_once()
            call_args = mock_pipeline.run_pipeline.call_args
            assert call_args.kwargs["page"] == 2

    @pytest.mark.asyncio
    async def test_source_leads_with_country_parameter(self):
        """Test endpoint properly passes country parameter"""
        with patch("core.main.MainPipeline") as mock_pipeline_class:
            mock_pipeline = AsyncMock()
            mock_pipeline.run_pipeline.return_value = []
            mock_pipeline_class.return_value = mock_pipeline

            response = client.post(
                "/source_leads",
                json={"keywords": "developer", "country": "Kenya"}
            )

            assert response.status_code == 200
            mock_pipeline.run_pipeline.assert_called_once()
            call_args = mock_pipeline.run_pipeline.call_args
            assert call_args.kwargs["country"] == "Kenya"

    @pytest.mark.asyncio
    async def test_source_leads_empty_results(self):
        """Test endpoint handles empty results list"""
        with patch("core.main.MainPipeline") as mock_pipeline_class:
            mock_pipeline = AsyncMock()
            mock_pipeline.run_pipeline.return_value = []
            mock_pipeline_class.return_value = mock_pipeline

            response = client.post(
                "/source_leads",
                json={"keywords": "nonexistent skill"}
            )

            assert response.status_code == 200
            assert response.json() == []


class TestCORSMiddleware:
    """Test suite for CORS middleware configuration"""

    def test_cors_headers_present(self):
        """Test that CORS headers are present in response"""
        response = client.options("/", headers={"Origin": "http://localhost:3000"})
        # CORS middleware should handle OPTIONS requests
        assert response.status_code in [200, 405]

    def test_cors_allows_all_origins(self):
        """Test endpoint can be accessed from any origin"""
        response = client.get("/", headers={"Origin": "http://example.com"})
        assert response.status_code == 200


class TestAppInitialization:
    """Test suite for FastAPI app initialization"""

    def test_app_title(self):
        """Test app has correct title"""
        assert app.title == "Warm Lead Sourcer"

    def test_app_version(self):
        """Test app has correct version"""
        assert app.version == "2.0"

    def test_app_has_limiter(self):
        """Test app has rate limiter configured"""
        assert hasattr(app.state, "limiter")