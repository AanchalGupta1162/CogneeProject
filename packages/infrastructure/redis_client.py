from celery import Celery
from packages.shared.config import settings

def make_celery():
    celery_app = Celery(
        "smart_ticket",
        broker=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
        backend=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
        include=['packages.agents.orchestrator']
    )
    celery_app.conf.update(
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
    )
    return celery_app

celery_app = make_celery()
