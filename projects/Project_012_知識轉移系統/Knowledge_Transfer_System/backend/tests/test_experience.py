from app.experience.experience_extractor import ExperienceExtractor
from app.experience.knowledge_package import KnowledgePackageBuilder


def test_experience_extractor_returns_best_practices():
    extracted = ExperienceExtractor().extract("Always review the transcript before publishing.")

    assert extracted["best_practices"]
    assert extracted["checklist"]


def test_knowledge_package_builder_returns_tags():
    package = KnowledgePackageBuilder().build(
        transcript="handover checklist transcript recommendations",
        summary={"executive_summary": "summary"},
        extracted={"best_practices": [{"title": "Practice"}]},
        faq=[],
    )

    assert package["keywords"]
    assert package["tags"]

