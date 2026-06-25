from app.schemas.document import DocumentList, DocumentRead
from app.services.document_service import DocumentService


def test_document_list_shape():
    document = DocumentRead(
        id="doc-1",
        title="Policy",
        storage_path="documents/general/policy.pdf",
        permission_scope="department",
        classification="internal",
        status="draft",
        current_version="v1.0.0",
        metadata={"tags": ["policy"]},
    )

    result = DocumentList(items=[document], total=1, page=1, page_size=20)

    assert result.total == 1
    assert result.items[0].title == "Policy"


def test_document_to_read_maps_metadata():
    class FakeDocument:
        id = "doc-1"
        title = "Guide"
        description = "Onboarding guide"
        department_id = None
        file_type = "pdf"
        storage_path = "documents/general/guide.pdf"
        permission_scope = "department"
        classification = "internal"
        status = "draft"
        current_version = "v1.0.0"
        doc_metadata = {"category": "HR"}
        created_at = None
        updated_at = None

    result = DocumentService.to_read(FakeDocument())

    assert result.metadata["category"] == "HR"
    assert result.file_type == "pdf"
