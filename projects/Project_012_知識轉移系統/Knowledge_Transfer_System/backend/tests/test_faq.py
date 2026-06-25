from app.experience.faq_generator import FAQGenerator


def test_faq_generator_returns_question_answer_pairs():
    faq = FAQGenerator().generate("Important knowledge transfer transcript.")

    assert faq[0]["question"]
    assert faq[0]["answer"]
    assert faq[0]["confidence"] > 0
