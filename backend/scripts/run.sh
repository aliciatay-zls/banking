#!/bin/bash
# Set environment variables for the session
export APP_ENV="development"

export SERVER_ADDRESS="localhost"
export SERVER_PORT="8080"
export AUTH_SERVER_ADDRESS="localhost"
export AUTH_SERVER_PORT="8181"
export FRONTEND_SERVER_ADDRESS="localhost"
export FRONTEND_SERVER_PORT="3000"
export DB_USER="root"
export DB_PASSWORD="codecamp"
export DB_HOST="localhost"
export DB_PORT="3306"
export DB_NAME="banking"

# Run app
go run main.go