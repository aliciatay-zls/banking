# Set environment variables for the session
$env:APP_ENV = "development"

$env:SERVER_ADDRESS = "localhost"
$env:SERVER_PORT = "8080"
$env:SERVER_DOMAIN = "localhost:8080"
$env:AUTH_SERVER_ADDRESS = "localhost"
$env:AUTH_SERVER_PORT = "8181"
$env:AUTH_SERVER_DOMAIN = "localhost:8181"
$env:FRONTEND_SERVER_ADDRESS = "localhost"
$env:FRONTEND_SERVER_PORT = "3000"
$env:FRONTEND_SERVER_DOMAIN = "localhost:3000"
$env:DB_USER = "root"
$env:DB_PASSWORD = "codecamp"
$env:DB_HOST = "localhost"
$env:DB_PORT = "3306"
$env:DB_NAME = "banking"

# Run app
go run main.go