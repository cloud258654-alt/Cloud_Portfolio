from app.ai.context_builder import ContextBuilder


def test_context_builder_has_expected_context_limit():
    assert ContextBuilder.max_context_tokens == 12000
