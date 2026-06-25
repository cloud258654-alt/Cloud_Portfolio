from app.experience.transcript_service import TranscriptService


def test_transcript_service_combines_segments():
    transcript = TranscriptService().combine(
        [
            {
                "speaker": "Expert",
                "start_time": 0.0,
                "end_time": 5.0,
                "text": "Use checklist before handover.",
            }
        ]
    )

    assert "Expert" in transcript
    assert "Use checklist" in transcript

