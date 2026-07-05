.PHONY: up down build test lint

up:
	docker-compose -f infra/docker/docker-compose.yml up -d db redis

down:
	docker-compose -f infra/docker/docker-compose.yml down

build:
	docker-compose -f infra/docker/docker-compose.yml build

test:
	pytest packages/ apps/

dev-web:
	cd apps/web && npm run dev

dev-api:
	uvicorn apps.api.main:app --reload

setup:
	pip install -r requirements.txt
	cd apps/web && npm install

cognee-ui:
	python3 scratch/start_cognee_ui.py
