#!/bin/bash
# Set environment variables for the session
export SERVER_ADDRESS="localhost"
export SERVER_PORT="8080"
export AUTH_SERVER_ADDRESS="localhost"
export AUTH_SERVER_PORT="8181"
export DB_USER="root"
export DB_PASSWORD="codecamp"
export DB_ADDRESS="localhost"
export DB_PORT="3306"
export DB_NAME="banking"

# Run app
go run main.go