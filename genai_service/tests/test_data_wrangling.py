import pytest
from unittest.mock import AsyncMock, patch, MagicMock, mock_open
from utils.data_wrangling import email_generator, filter_profiles, lead_presentation, data_pipeline, export
import csv
import io


class TestEmailGenerator:
    """Test suite for email_generator function"""

    def test_email_generator_with_full_name_and_education(self):
        """Test email generation with name and education"""
        profile = {
            "name": "John Doe",
            "education": "MIT"
        }
        email = email_generator(profile)
        assert email == "john.doe@mit.edu"

    def test_email_generator_with_three_names(self):
        """Test email generation with three-part name (uses last name)"""
        profile = {
            "name": "John Michael Doe",
            "education": "Stanford"
        }
        email = email_generator(profile)
        assert email == "john.doe@stanford.edu"

    def test_email_generator_without_education(self):
        """Test email generation without education uses default domain"""
        profile = {
            "name": "John Doe",
            "education": ""
        }
        email = email_generator(profile)
        assert email == "john.doe@systemgenerated.edu"

    def test_email_generator_with_missing_education_key(self):
        """Test email generation with missing education key"""
        profile = {
            "name": "John Doe"
        }
        email = email_generator(profile)
        assert email == "john.doe@systemgenerated.edu"

    def test_email_generator_with_university_spaces(self):
        """Test email generation removes spaces from university name"""
        profile = {
            "name": "Jane Smith",
            "education": "Harvard University"
        }
        email = email_generator(profile)
        assert email == "jane.smith@harvarduniversity.edu"

    def test_email_generator_with_uppercase_name(self):
        """Test email generation converts name to lowercase"""
        profile = {
            "name": "JOHN DOE",
            "education": "MIT"
        }
        email = email_generator(profile)
        assert email == "john.doe@mit.edu"

    def test_email_generator_with_exception(self):
        """Test email generation returns default on exception"""
        profile = {
            "name": "SingleName",
            "education": "MIT"
        }
        email = email_generator(profile)
        assert email == "noemail@generated.edu"

    def test_email_generator_with_none_education(self):
        """Test email generation handles None education"""
        profile = {
            "name": "John Doe",
            "education": None
        }
        email = email_generator(profile)
        assert email == "john.doe@systemgenerated.edu"

    def test_email_generator_with_hyphenated_name(self):
        """Test email generation with hyphenated last name"""
        profile = {
            "name": "Mary Jane Watson-Parker",
            "education": "MIT"
        }
        email = email_generator(profile)
        assert email == "mary.watson-parker@mit.edu"

    def test_email_generator_with_special_characters_in_university(self):
        """Test email generation handles special characters in university"""
        profile = {
            "name": "John Doe",
            "education": "University of California, Berkeley"
        }
        email = email_generator(profile)
        # Should remove spaces but keep special chars
        assert "john.doe" in email
        assert ".edu" in email


class TestFilterProfiles:
    """Test suite for filter_profiles function"""

    @pytest.mark.asyncio
    async def test_filter_profiles_with_high_scores(self):
        """Test filter_profiles keeps profiles with score >= 5"""
        profiles = [
            {"name": "John Doe", "snippet": "Python developer with 5 years experience"},
            {"name": "Jane Smith", "snippet": "Senior Python engineer"}
        ]

        with patch("utils.data_wrangling.calculate_score", new_callable=AsyncMock) as mock_score:
            mock_score.side_effect = [8, 9]

            result = await filter_profiles(profiles, keywords=["python", "developer"])

            assert len(result) == 2
            assert result[0]["score"] == 8
            assert result[1]["score"] == 9

    @pytest.mark.asyncio
    async def test_filter_profiles_excludes_low_scores(self):
        """Test filter_profiles excludes profiles with score < 5"""
        profiles = [
            {"name": "John Doe", "snippet": "Relevant experience"},
            {"name": "Jane Smith", "snippet": "Not relevant"}
        ]

        with patch("utils.data_wrangling.calculate_score", new_callable=AsyncMock) as mock_score:
            mock_score.side_effect = [8, 3]

            result = await filter_profiles(profiles, keywords=["python"])

            assert len(result) == 1
            assert result[0]["name"] == "John Doe"

    @pytest.mark.asyncio
    async def test_filter_profiles_with_invalid_score_response(self):
        """Test filter_profiles handles invalid score responses"""
        profiles = [
            {"name": "John Doe", "snippet": "Test"}
        ]

        with patch("utils.data_wrangling.calculate_score", new_callable=AsyncMock) as mock_score:
            mock_score.return_value = "invalid score response"

            result = await filter_profiles(profiles, keywords=["python"])

            # Should default to score 5 and keep profile
            assert len(result) == 1
            assert result[0]["score"] == 5

    @pytest.mark.asyncio
    async def test_filter_profiles_with_empty_list(self):
        """Test filter_profiles with empty profile list"""
        result = await filter_profiles([], keywords=["python"])
        assert result == []

    @pytest.mark.asyncio
    async def test_filter_profiles_with_exception(self):
        """Test filter_profiles handles exceptions gracefully"""
        profiles = [
            {"name": "John Doe"}
        ]

        with patch("utils.data_wrangling.calculate_score", new_callable=AsyncMock) as mock_score:
            mock_score.side_effect = Exception("API Error")

            result = await filter_profiles(profiles, keywords=["python"])

            # Should return empty list or partial results
            assert isinstance(result, list)

    @pytest.mark.asyncio
    async def test_filter_profiles_score_extraction_with_text(self):
        """Test filter_profiles extracts score from text response"""
        profiles = [
            {"name": "John Doe", "snippet": "Test"}
        ]

        with patch("utils.data_wrangling.calculate_score", new_callable=AsyncMock) as mock_score:
            mock_score.return_value = "The score is 7 out of 10"

            result = await filter_profiles(profiles, keywords=["python"])

            assert len(result) == 1
            assert result[0]["score"] == 7

    @pytest.mark.asyncio
    async def test_filter_profiles_with_missing_snippet(self):
        """Test filter_profiles handles missing snippet field"""
        profiles = [
            {"name": "John Doe"}
        ]

        with patch("utils.data_wrangling.calculate_score", new_callable=AsyncMock) as mock_score:
            mock_score.return_value = 6

            result = await filter_profiles(profiles, keywords=["python"])

            assert len(result) == 1

    @pytest.mark.asyncio
    async def test_filter_profiles_threshold_boundary(self):
        """Test filter_profiles at threshold boundary (score = 5)"""
        profiles = [
            {"name": "John Doe", "snippet": "Test"}
        ]

        with patch("utils.data_wrangling.calculate_score", new_callable=AsyncMock) as mock_score:
            mock_score.return_value = 5

            result = await filter_profiles(profiles, keywords=["python"])

            # Score of 5 should be included (>= threshold)
            assert len(result) == 1


class TestLeadPresentation:
    """Test suite for lead_presentation function"""

    def test_lead_presentation_with_valid_profiles(self):
        """Test lead_presentation generates emails for profiles"""
        profiles = [
            {"name": "John Doe", "education": "MIT", "score": 8},
            {"name": "Jane Smith", "education": "Stanford", "score": 9}
        ]

        with patch("utils.data_wrangling.email_generator") as mock_email:
            mock_email.side_effect = ["john.doe@mit.edu", "jane.smith@stanford.edu"]

            result = lead_presentation(profiles)

            assert len(result) == 2
            assert result[0]["email"] == "john.doe@mit.edu"
            assert result[1]["email"] == "jane.smith@stanford.edu"

    def test_lead_presentation_with_empty_list(self):
        """Test lead_presentation with empty list"""
        result = lead_presentation([])
        assert result == []

    def test_lead_presentation_with_exception(self):
        """Test lead_presentation handles exceptions"""
        profiles = [
            {"name": "John Doe", "education": "MIT"}
        ]

        with patch("utils.data_wrangling.email_generator") as mock_email:
            mock_email.side_effect = Exception("Email generation failed")

            result = lead_presentation(profiles)

            # Should return empty or partial results
            assert isinstance(result, list)

    def test_lead_presentation_preserves_profile_data(self):
        """Test lead_presentation preserves original profile data"""
        profiles = [
            {"name": "John Doe", "education": "MIT", "score": 8, "company": "Google"}
        ]

        with patch("utils.data_wrangling.email_generator", return_value="john.doe@mit.edu"):
            result = lead_presentation(profiles)

            assert result[0]["name"] == "John Doe"
            assert result[0]["score"] == 8
            assert result[0]["company"] == "Google"


class TestDataPipeline:
    """Test suite for data_pipeline function"""

    @pytest.mark.asyncio
    async def test_data_pipeline_with_keywords(self):
        """Test data_pipeline processes profiles with keywords"""
        raw_data = [
            {"name": "John Doe", "snippet": "Python developer"}
        ]

        with patch("utils.data_wrangling.filter_profiles", new_callable=AsyncMock) as mock_filter, \
             patch("utils.data_wrangling.lead_presentation") as mock_present:
            mock_filter.return_value = [{"name": "John Doe", "score": 8, "education": "MIT"}]
            mock_present.return_value = [{"name": "John Doe", "email": "john.doe@mit.edu"}]

            result = await data_pipeline(raw_data, keywords=["python", "developer"])

            assert len(result) == 1
            mock_filter.assert_called_once_with(raw_data, keywords=["python", "developer"])

    @pytest.mark.asyncio
    async def test_data_pipeline_without_keywords(self):
        """Test data_pipeline uses default keywords when None"""
        raw_data = [
            {"name": "John Doe", "snippet": "Developer"}
        ]

        with patch("utils.data_wrangling.filter_profiles", new_callable=AsyncMock) as mock_filter, \
             patch("utils.data_wrangling.lead_presentation") as mock_present:
            mock_filter.return_value = []
            mock_present.return_value = []

            await data_pipeline(raw_data, keywords=None)

            call_args = mock_filter.call_args[1]["keywords"]
            assert "No keywords provided" in call_args[0]

    @pytest.mark.asyncio
    async def test_data_pipeline_with_exception(self):
        """Test data_pipeline raises exception on error"""
        raw_data = [{"name": "John Doe"}]

        with patch("utils.data_wrangling.filter_profiles", new_callable=AsyncMock) as mock_filter:
            mock_filter.side_effect = Exception("Processing error")

            with pytest.raises(Exception, match="Processing error"):
                await data_pipeline(raw_data, keywords=["python"])

    @pytest.mark.asyncio
    async def test_data_pipeline_empty_input(self):
        """Test data_pipeline with empty input"""
        with patch("utils.data_wrangling.filter_profiles", new_callable=AsyncMock) as mock_filter, \
             patch("utils.data_wrangling.lead_presentation") as mock_present:
            mock_filter.return_value = []
            mock_present.return_value = []

            result = await data_pipeline([], keywords=["python"])

            assert result == []


class TestExport:
    """Test suite for export function"""

    @pytest.mark.asyncio
    async def test_export_creates_csv_file(self):
        """Test export creates CSV file with correct data"""
        profiles = [
            {
                "name": "John Doe",
                "linkedin_url": "https://linkedin.com/in/johndoe",
                "current_role": "Software Engineer",
                "education": "MIT",
                "country": "USA",
                "email": "john.doe@mit.edu",
                "score": 8
            }
        ]

        mock_file = mock_open()
        with patch("builtins.open", mock_file):
            result = await export(profiles)

            assert result == "leads.csv"
            mock_file.assert_called_once_with(file="leads.csv", mode="w", newline="", encoding="utf-8")

    @pytest.mark.asyncio
    async def test_export_with_null_values(self):
        """Test export handles profiles with null values"""
        profiles = [
            {
                "name": "John Doe"
            }
        ]

        mock_file = mock_open()
        with patch("builtins.open", mock_file):
            result = await export(profiles)

            assert result == "leads.csv"

    @pytest.mark.asyncio
    async def test_export_with_empty_list(self):
        """Test export with empty profile list"""
        mock_file = mock_open()
        with patch("builtins.open", mock_file):
            result = await export([])

            assert result == "leads.csv"

    @pytest.mark.asyncio
    async def test_export_with_exception(self):
        """Test export returns None on exception"""
        profiles = [{"name": "John Doe"}]

        with patch("builtins.open", side_effect=Exception("File write error")):
            result = await export(profiles)

            assert result is None

    @pytest.mark.asyncio
    async def test_export_with_multiple_profiles(self):
        """Test export handles multiple profiles"""
        profiles = [
            {
                "name": "John Doe",
                "linkedin_url": "https://linkedin.com/in/johndoe",
                "current_role": "Software Engineer",
                "education": "MIT",
                "country": "USA",
                "email": "john.doe@mit.edu",
                "score": 8
            },
            {
                "name": "Jane Smith",
                "linkedin_url": "https://linkedin.com/in/janesmith",
                "current_role": "Data Scientist",
                "education": "Stanford",
                "country": "USA",
                "email": "jane.smith@stanford.edu",
                "score": 9
            }
        ]

        mock_file = mock_open()
        with patch("builtins.open", mock_file):
            result = await export(profiles)

            assert result == "leads.csv"

    @pytest.mark.asyncio
    async def test_export_file_name(self):
        """Test export uses correct file name"""
        profiles = [{"name": "John Doe"}]

        mock_file = mock_open()
        with patch("builtins.open", mock_file):
            result = await export(profiles)

            assert result == "leads.csv"