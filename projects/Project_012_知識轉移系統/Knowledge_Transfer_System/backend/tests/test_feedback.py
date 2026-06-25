from app.models.chat import Feedback


def test_feedback_model_accepts_rating_and_comment():
    feedback = Feedback(
        message_id="00000000-0000-0000-0000-000000000001",
        rating=5,
        feedback_type="positive",
        comment="Helpful",
    )

    assert feedback.rating == 5
    assert feedback.comment == "Helpful"
