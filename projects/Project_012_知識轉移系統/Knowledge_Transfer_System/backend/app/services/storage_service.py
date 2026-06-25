from datetime import timedelta
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from minio import Minio

from app.core.config import settings
from app.schemas.document import ALLOWED_FILE_TYPES


class StorageService:
    def __init__(self) -> None:
        self.client = Minio(
            settings.minio_endpoint,
            access_key=settings.minio_root_user,
            secret_key=settings.minio_root_password,
            secure=settings.minio_secure,
        )
        self.bucket = settings.minio_bucket_documents

    def build_object_path(self, filename: str, department: str = "general") -> str:
        extension = self.get_extension(filename)
        return f"documents/{department}/{uuid4().hex}_{Path(filename).stem}.{extension}"

    def upload(
        self,
        file: UploadFile,
        department: str = "general",
        allowed_types: set[str] | None = None,
    ) -> tuple[str, str]:
        extension = self.get_extension(file.filename or "")
        allowed = allowed_types or ALLOWED_FILE_TYPES
        if extension not in allowed:
            raise ValueError(f"Unsupported file type: {extension}")

        object_path = self.build_object_path(file.filename or "document", department)
        self.client.put_object(
            self.bucket,
            object_path,
            file.file,
            length=-1,
            part_size=10 * 1024 * 1024,
            content_type=file.content_type,
        )
        return object_path, extension

    def presigned_get_url(self, object_path: str) -> str:
        return self.client.presigned_get_object(
            self.bucket,
            object_path,
            expires=timedelta(minutes=15),
        )

    @staticmethod
    def get_extension(filename: str) -> str:
        return Path(filename).suffix.lower().lstrip(".")
