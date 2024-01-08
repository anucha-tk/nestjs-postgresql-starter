# dev mode
start-dev:
	docker compose --env-file .env up -d
start-postgres-dev:
	docker compose --env-file .env up -d postgres
start-postgres-test:
	docker compose --env-file .env.test up -d postgres-test
stop-dev:
	docker compose stop
down-dev:
	docker compose down
restart-dev:
	docker compose restart
log-nestjs:
	docker container logs -f nestjs
