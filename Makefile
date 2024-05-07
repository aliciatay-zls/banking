### PRODUCTION ###

ifeq ($(wildcard ./backend/.env),)
	$(error No dot env file in backend folder)
endif

include backend/.env

# Connect to hosted db (opens a SQL shell)
connect:
	mysql --user $(DB_USER) --password=$(DB_PASSWORD) --host $(DB_HOST) --port $(DB_PORT) $(DB_NAME)

# Connect to hosted db, feed in migration script
# E.g. deployment:
# make migrate SCRIPT_PATH=backend/build/package/initdb/01-banking.sql
migrate:
	mysql --user $(DB_USER) --password=$(DB_PASSWORD) --host $(DB_HOST) --port $(DB_PORT) $(DB_NAME) < $(SCRIPT_PATH)


### DEVELOPMENT ###

# Start database server, backend resource server and frontend server
dev: dev-db dev-backend dev-frontend

dev-db:
	cd backend/build/package && docker-compose up > ../../db.log 2>&1

dev-backend:
	cd backend && chmod +x scripts/run.sh && . ./scripts/run.sh > backend.log 2>&1

dev-frontend:
	cd frontend && npm run dev > frontend.log 2>&1

# Remove any log files generated
clean:
	cd backend && rm -f -- backend.log && rm -f -- db.log && cd ../frontend && rm -f -- frontend.log
