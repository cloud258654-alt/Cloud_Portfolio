from fastapi import Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    status_code = 400
    code = "APP_ERROR"

    def __init__(self, message: str, code: str | None = None) -> None:
        self.message = message
        if code is not None:
            self.code = code


class DatabaseConnectionError(AppException):
    code = "DATABASE_CONNECTION_ERROR"


class RedisConnectionError(AppException):
    code = "REDIS_CONNECTION_ERROR"


class StorageConnectionError(AppException):
    code = "STORAGE_CONNECTION_ERROR"


async def app_exception_handler(
    request: Request,
    exc: AppException,
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
            },
        },
    )
