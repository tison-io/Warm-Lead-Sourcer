import pytest
from pydantic import ValidationError
from models.schemas import (
    GeneralProfile,
    GeneratedExtractorProfile,
    IGComment,
    IGPostScrape,
    SerperSearchResult,
    UserInput,
    ErrorHandling
)


class TestGeneralProfile:
    """Test suite for GeneralProfile schema"""

    def test_general_profile_with_all_fields(self):
        """Test GeneralProfile creation with all fields"""
        profile = GeneralProfile(
            name="John Doe",
            linkedin_url="https://linkedin.com/in/johndoe",
            current_role="Software Engineer",
            education="MIT",
            country="USA",
            email="john.doe@mit.edu",
            score=8
        )

        assert profile.name == "John Doe"
        assert profile.linkedin_url == "https://linkedin.com/in/johndoe"
        assert profile.current_role == "Software Engineer"
        assert profile.education == "MIT"
        assert profile.country == "USA"
        assert profile.email == "john.doe@mit.edu"
        assert profile.score == 8

    def test_general_profile_with_required_fields_only(self):
        """Test GeneralProfile creation with only required fields"""
        profile = GeneralProfile(name="John Doe")

        assert profile.name == "John Doe"
        assert profile.linkedin_url is None
        assert profile.current_role is None
        assert profile.education is None
        assert profile.country is None
        assert profile.email is None
        assert profile.score == 0

    def test_general_profile_default_score(self):
        """Test GeneralProfile has default score of 0"""
        profile = GeneralProfile(name="John Doe")
        assert profile.score == 0

    def test_general_profile_missing_name(self):
        """Test GeneralProfile raises error when name is missing"""
        with pytest.raises(ValidationError):
            GeneralProfile()

    def test_general_profile_with_none_optional_fields(self):
        """Test GeneralProfile accepts None for optional fields"""
        profile = GeneralProfile(
            name="John Doe",
            linkedin_url=None,
            current_role=None,
            education=None,
            country=None,
            email=None
        )

        assert profile.name == "John Doe"
        assert profile.linkedin_url is None

    def test_general_profile_score_validation(self):
        """Test GeneralProfile accepts various score values"""
        profile = GeneralProfile(name="John Doe", score=10)
        assert profile.score == 10

        profile = GeneralProfile(name="John Doe", score=0)
        assert profile.score == 0

        profile = GeneralProfile(name="John Doe", score=-5)
        assert profile.score == -5

    def test_general_profile_model_dump(self):
        """Test GeneralProfile can be converted to dict"""
        profile = GeneralProfile(
            name="John Doe",
            linkedin_url="https://linkedin.com/in/johndoe",
            score=8
        )

        data = profile.model_dump()
        assert isinstance(data, dict)
        assert data["name"] == "John Doe"
        assert data["score"] == 8


class TestGeneratedExtractorProfile:
    """Test suite for GeneratedExtractorProfile schema"""

    def test_generated_extractor_profile_with_profiles(self):
        """Test GeneratedExtractorProfile with list of profiles"""
        profiles = [
            GeneralProfile(name="John Doe"),
            GeneralProfile(name="Jane Smith")
        ]

        extractor_profile = GeneratedExtractorProfile(profiles=profiles)

        assert len(extractor_profile.profiles) == 2
        assert extractor_profile.profiles[0].name == "John Doe"
        assert extractor_profile.profiles[1].name == "Jane Smith"

    def test_generated_extractor_profile_empty_list(self):
        """Test GeneratedExtractorProfile with empty list"""
        extractor_profile = GeneratedExtractorProfile(profiles=[])
        assert len(extractor_profile.profiles) == 0

    def test_generated_extractor_profile_missing_profiles(self):
        """Test GeneratedExtractorProfile requires profiles field"""
        with pytest.raises(ValidationError):
            GeneratedExtractorProfile()


class TestIGComment:
    """Test suite for IGComment schema"""

    def test_ig_comment_with_all_fields(self):
        """Test IGComment creation with all fields"""
        comment = IGComment(
            username="john_doe",
            text="Great post!",
            timestamp="2024-01-15T10:30:00Z"
        )

        assert comment.username == "john_doe"
        assert comment.text == "Great post!"
        assert comment.timestamp == "2024-01-15T10:30:00Z"

    def test_ig_comment_missing_fields(self):
        """Test IGComment raises error when required fields are missing"""
        with pytest.raises(ValidationError):
            IGComment(username="john_doe")

        with pytest.raises(ValidationError):
            IGComment(text="Great post!")

    def test_ig_comment_empty_strings(self):
        """Test IGComment accepts empty strings"""
        comment = IGComment(
            username="",
            text="",
            timestamp=""
        )

        assert comment.username == ""
        assert comment.text == ""


class TestIGPostScrape:
    """Test suite for IGPostScrape schema"""

    def test_ig_post_scrape_with_all_fields(self):
        """Test IGPostScrape creation with all fields"""
        comments = [
            IGComment(username="user1", text="Nice!", timestamp="2024-01-15T10:30:00Z"),
            IGComment(username="user2", text="Cool!", timestamp="2024-01-15T10:31:00Z")
        ]

        post = IGPostScrape(
            url="https://instagram.com/p/ABC123",
            owner_username="john_doe",
            likes_count=100,
            comments_count=10,
            top_comments=comments,
            image_description="A beautiful sunset"
        )

        assert post.url == "https://instagram.com/p/ABC123"
        assert post.owner_username == "john_doe"
        assert post.likes_count == 100
        assert post.comments_count == 10
        assert len(post.top_comments) == 2
        assert post.image_description == "A beautiful sunset"

    def test_ig_post_scrape_without_image_description(self):
        """Test IGPostScrape with optional image_description omitted"""
        post = IGPostScrape(
            url="https://instagram.com/p/ABC123",
            owner_username="john_doe",
            likes_count=100,
            comments_count=10,
            top_comments=[]
        )

        assert post.image_description is None

    def test_ig_post_scrape_empty_comments(self):
        """Test IGPostScrape with empty comments list"""
        post = IGPostScrape(
            url="https://instagram.com/p/ABC123",
            owner_username="john_doe",
            likes_count=0,
            comments_count=0,
            top_comments=[]
        )

        assert len(post.top_comments) == 0

    def test_ig_post_scrape_missing_required_fields(self):
        """Test IGPostScrape raises error when required fields are missing"""
        with pytest.raises(ValidationError):
            IGPostScrape(
                url="https://instagram.com/p/ABC123",
                owner_username="john_doe"
            )


class TestSerperSearchResult:
    """Test suite for SerperSearchResult schema"""

    def test_serper_search_result_with_all_fields(self):
        """Test SerperSearchResult creation with all fields"""
        result = SerperSearchResult(
            keywords="python developer",
            country="USA",
            page=1
        )

        assert result.keywords == "python developer"
        assert result.country == "USA"
        assert result.page == 1

    def test_serper_search_result_missing_fields(self):
        """Test SerperSearchResult raises error when required fields are missing"""
        with pytest.raises(ValidationError):
            SerperSearchResult(keywords="python")

    def test_serper_search_result_different_page(self):
        """Test SerperSearchResult with different page numbers"""
        result = SerperSearchResult(
            keywords="data scientist",
            country="Kenya",
            page=5
        )

        assert result.page == 5

    def test_serper_search_result_empty_strings(self):
        """Test SerperSearchResult with empty strings"""
        result = SerperSearchResult(
            keywords="",
            country="",
            page=0
        )

        assert result.keywords == ""
        assert result.country == ""
        assert result.page == 0


class TestUserInput:
    """Test suite for UserInput schema"""

    def test_user_input_with_all_fields(self):
        """Test UserInput creation with all fields"""
        user_input = UserInput(
            post_url="https://linkedin.com/posts/123",
            keywords="python developer",
            country="USA",
            page=2
        )

        assert user_input.post_url == "https://linkedin.com/posts/123"
        assert user_input.keywords == "python developer"
        assert user_input.country == "USA"
        assert user_input.page == 2

    def test_user_input_with_no_fields(self):
        """Test UserInput creation with all optional fields omitted"""
        user_input = UserInput()

        assert user_input.post_url is None
        assert user_input.keywords is None
        assert user_input.country is None
        assert user_input.page == 1

    def test_user_input_default_page(self):
        """Test UserInput has default page value of 1"""
        user_input = UserInput(keywords="python")

        assert user_input.page == 1

    def test_user_input_with_post_url_only(self):
        """Test UserInput with only post_url"""
        user_input = UserInput(post_url="https://linkedin.com/posts/123")

        assert user_input.post_url == "https://linkedin.com/posts/123"
        assert user_input.keywords is None

    def test_user_input_with_keywords_only(self):
        """Test UserInput with only keywords"""
        user_input = UserInput(keywords="data scientist")

        assert user_input.keywords == "data scientist"
        assert user_input.post_url is None

    def test_user_input_with_country_and_keywords(self):
        """Test UserInput with keywords and country"""
        user_input = UserInput(
            keywords="developer",
            country="Kenya"
        )

        assert user_input.keywords == "developer"
        assert user_input.country == "Kenya"

    def test_user_input_page_validation(self):
        """Test UserInput accepts various page values"""
        user_input = UserInput(page=10)
        assert user_input.page == 10

        user_input = UserInput(page=0)
        assert user_input.page == 0

    def test_user_input_model_dump(self):
        """Test UserInput can be converted to dict"""
        user_input = UserInput(
            keywords="python",
            country="USA",
            page=2
        )

        data = user_input.model_dump()
        assert isinstance(data, dict)
        assert data["keywords"] == "python"
        assert data["page"] == 2


class TestErrorHandling:
    """Test suite for ErrorHandling schema"""

    def test_error_handling_with_all_fields(self):
        """Test ErrorHandling creation with all fields"""
        error = ErrorHandling(
            error_code=404,
            error_message="Not Found"
        )

        assert error.error_code == 404
        assert error.error_message == "Not Found"

    def test_error_handling_missing_fields(self):
        """Test ErrorHandling raises error when required fields are missing"""
        with pytest.raises(ValidationError):
            ErrorHandling(error_code=500)

        with pytest.raises(ValidationError):
            ErrorHandling(error_message="Error occurred")

    def test_error_handling_different_codes(self):
        """Test ErrorHandling with different error codes"""
        error = ErrorHandling(error_code=500, error_message="Internal Server Error")
        assert error.error_code == 500

        error = ErrorHandling(error_code=400, error_message="Bad Request")
        assert error.error_code == 400

    def test_error_handling_empty_message(self):
        """Test ErrorHandling with empty error message"""
        error = ErrorHandling(error_code=200, error_message="")
        assert error.error_message == ""

    def test_error_handling_model_dump(self):
        """Test ErrorHandling can be converted to dict"""
        error = ErrorHandling(
            error_code=404,
            error_message="Not Found"
        )

        data = error.model_dump()
        assert isinstance(data, dict)
        assert data["error_code"] == 404
        assert data["error_message"] == "Not Found"


class TestSchemaIntegration:
    """Test suite for schema integration scenarios"""

    def test_general_profile_in_generated_extractor_profile(self):
        """Test GeneralProfile works within GeneratedExtractorProfile"""
        profiles = [
            GeneralProfile(
                name="John Doe",
                linkedin_url="https://linkedin.com/in/johndoe",
                score=8
            ),
            GeneralProfile(
                name="Jane Smith",
                linkedin_url="https://linkedin.com/in/janesmith",
                score=9
            )
        ]

        extractor = GeneratedExtractorProfile(profiles=profiles)

        assert len(extractor.profiles) == 2
        assert all(isinstance(p, GeneralProfile) for p in extractor.profiles)

    def test_ig_comment_in_ig_post_scrape(self):
        """Test IGComment works within IGPostScrape"""
        comments = [
            IGComment(username="user1", text="Great!", timestamp="2024-01-15T10:00:00Z"),
            IGComment(username="user2", text="Amazing!", timestamp="2024-01-15T10:01:00Z")
        ]

        post = IGPostScrape(
            url="https://instagram.com/p/ABC123",
            owner_username="john_doe",
            likes_count=100,
            comments_count=2,
            top_comments=comments
        )

        assert len(post.top_comments) == 2
        assert all(isinstance(c, IGComment) for c in post.top_comments)

    def test_user_input_json_serialization(self):
        """Test UserInput can be serialized to JSON"""
        user_input = UserInput(
            keywords="python developer",
            country="USA",
            page=1
        )

        json_str = user_input.model_dump_json()
        assert isinstance(json_str, str)
        assert "python developer" in json_str

    def test_general_profile_json_serialization(self):
        """Test GeneralProfile can be serialized to JSON"""
        profile = GeneralProfile(
            name="John Doe",
            linkedin_url="https://linkedin.com/in/johndoe",
            score=8
        )

        json_str = profile.model_dump_json()
        assert isinstance(json_str, str)
        assert "John Doe" in json_str