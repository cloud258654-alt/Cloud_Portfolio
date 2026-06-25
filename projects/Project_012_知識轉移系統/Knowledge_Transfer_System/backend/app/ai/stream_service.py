import json

from app.schemas.chat import ChatAnswer


class StreamService:
    def events(self, answer: ChatAnswer):
        for token in answer.answer.split():
            yield f"data: {json.dumps({'type': 'token', 'value': token + ' '})}\n\n"
        yield f"data: {json.dumps({'type': 'done', 'data': answer.model_dump(mode='json')})}\n\n"
