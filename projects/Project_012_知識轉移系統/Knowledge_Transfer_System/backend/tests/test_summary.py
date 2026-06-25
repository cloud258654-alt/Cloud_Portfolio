from app.experience.summary_service import SummaryService


def test_summary_service_returns_required_sections():
    summary = SummaryService().summarize("This is an expert interview about risk and recommendations.")

    assert "executive_summary" in summary
    assert "key_decisions" in summary
    assert "recommendations" in summary

